/**
 * SafeMate Post-Confirmation Lambda Function
 * 
 * This function is triggered after a user confirms their email address in Cognito.
 * It automatically creates a Hedera wallet and initializes user data.
 * 
 * Environment: Preprod
 * Last Updated: September 23, 2025
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { CognitoIdentityProviderClient, AdminUpdateUserAttributesCommand } = require('@aws-sdk/client-cognito-identity-provider');
const { KMSClient, DecryptCommand } = require('@aws-sdk/client-kms');
const { Client, AccountId, PrivateKey, AccountCreateTransaction, Hbar, AccountBalanceQuery } = require('@hashgraph/sdk');

// Initialize AWS services
const dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const cognito = new CognitoIdentityProviderClient({});
const kms = new KMSClient({});

// Environment variables
const HEDERA_NETWORK = process.env.HEDERA_NETWORK || 'testnet';
const DYNAMODB_TABLE = process.env.DYNAMODB_TABLE || 'preprod-safemate-users';
const WALLET_KEYS_TABLE = process.env.WALLET_KEYS_TABLE;
const APP_SECRETS_KMS_KEY_ID = process.env.APP_SECRETS_KMS_KEY_ID;

/**
 * Main Lambda handler for PostConfirmation trigger
 */
exports.handler = async (event) => {
    console.log('🔧 PostConfirmation Lambda triggered:', JSON.stringify(event, null, 2));
    
    try {
        // Extract user information from the event
        const { userSub, userName, userAttributes } = event.request;
        const email = userAttributes.email;
        
        console.log(`📧 Processing user confirmation for: ${email} (${userSub})`);
        
        // Create Hedera wallet
        const walletData = await createHederaWallet(userSub, email);
        
        // Update user attributes in Cognito
        await updateUserAttributes(userSub, walletData);
        
        // Store user data in DynamoDB
        await storeUserData(userSub, email, walletData);
        
        console.log(`✅ Successfully processed user confirmation for: ${email}`);
        
        // Return the event to allow Cognito to continue
        return event;
        
    } catch (error) {
        console.error('❌ Error in PostConfirmation Lambda:', error);
        
        // Log the error but don't fail the confirmation process
        // This ensures users can still complete registration even if wallet creation fails
        console.error('⚠️ Wallet creation failed, but user confirmation will proceed');
        
        return event;
    }
};

/**
 * Decrypt private key using KMS
 */
async function decryptPrivateKey(encryptedKey, kmsKeyId) {
    try {
        const decryptCommand = new DecryptCommand({
            KeyId: kmsKeyId,
            CiphertextBlob: Buffer.from(encryptedKey, 'base64')
        });

        const decryptResult = await kms.send(decryptCommand);
        return decryptResult.Plaintext.toString();
    } catch (error) {
        console.error('❌ Error decrypting private key:', error);
        throw error;
    }
}

/**
 * Get Hedera operator credentials from DynamoDB
 */
async function getOperatorCredentials() {
    try {
        const params = {
            TableName: WALLET_KEYS_TABLE,
            Key: { user_id: 'hedera_operator' }
        };

        const result = await dynamodb.send(new GetCommand(params));

        if (!result.Item) {
            throw new Error('No operator credentials found in DynamoDB');
        }

        const decryptedKey = await decryptPrivateKey(
            result.Item.encrypted_private_key,
            APP_SECRETS_KMS_KEY_ID
        );

        return {
            accountId: result.Item.account_id,
            privateKey: decryptedKey
        };
    } catch (error) {
        console.error('❌ Error retrieving Hedera operator credentials:', error);
        throw error;
    }
}

/**
 * Create a new Hedera wallet for the user
 */
async function createHederaWallet(userSub, email) {
    console.log(`🔑 Creating Hedera wallet for user: ${userSub}`);
    
    try {
        // Get Hedera operator credentials from DynamoDB
        const credentials = await getOperatorCredentials();
        
        // Initialize Hedera client
        const client = Client.forName(HEDERA_NETWORK);
        const operatorPrivateKey = PrivateKey.fromStringDer(credentials.privateKey);
        const operatorAccountId = AccountId.fromString(credentials.accountId);
        
        client.setOperator(operatorAccountId, operatorPrivateKey);
        
        // Generate new key pair for the user
        const newPrivateKey = PrivateKey.generate();
        const newPublicKey = newPrivateKey.publicKey;
        
        // Create new account
        const accountCreateTransaction = new AccountCreateTransaction()
            .setKey(newPublicKey)
            .setInitialBalance(Hbar.fromTinybars(1000)) // Initial balance of 1000 tinybars
            .setAccountMemo(`SafeMate user: ${email}`);
        
        const accountCreateResponse = await accountCreateTransaction.execute(client);
        const accountReceipt = await accountCreateResponse.getReceipt(client);
        const newAccountId = accountReceipt.accountId;
        
        // Get account balance
        const balanceQuery = new AccountBalanceQuery().setAccountId(newAccountId);
        const balance = await balanceQuery.execute(client);
        
        console.log(`✅ Created Hedera account: ${newAccountId.toString()}`);
        console.log(`💰 Initial balance: ${balance.hbars.toString()}`);
        
        return {
            hederaAccountId: newAccountId.toString(),
            hederaPrivateKey: newPrivateKey.toString(),
            hederaPublicKey: newPublicKey.toString(),
            initialBalance: balance.hbars.toString(),
            network: HEDERA_NETWORK
        };
        
    } catch (error) {
        console.error('❌ Error creating Hedera wallet:', error);
        throw error;
    }
}

/**
 * Update user attributes in Cognito with wallet information
 */
async function updateUserAttributes(userSub, walletData) {
    console.log(`👤 Updating Cognito attributes for user: ${userSub}`);
    
    try {
        const params = {
            UserPoolId: process.env.USER_POOL_ID,
            Username: userSub,
            UserAttributes: [
                {
                    Name: 'custom:hedera_account',
                    Value: walletData.hederaAccountId
                },
                {
                    Name: 'custom:asset_count',
                    Value: '0'
                },
                {
                    Name: 'custom:subscription_tier',
                    Value: 'free'
                },
                {
                    Name: 'custom:mate_balance',
                    Value: walletData.initialBalance
                },
                {
                    Name: 'custom:kyc_status',
                    Value: 'pending'
                },
                {
                    Name: 'custom:last_activity',
                    Value: new Date().toISOString()
                },
                {
                    Name: 'custom:storage_used',
                    Value: '0'
                },
                {
                    Name: 'custom:account_type',
                    Value: 'personal' // Default account type - can be changed later via UI
                }
            ]
        };
        
        await cognito.send(new AdminUpdateUserAttributesCommand(params));
        console.log(`✅ Updated Cognito attributes for user: ${userSub}`);
        
    } catch (error) {
        console.error('❌ Error updating Cognito attributes:', error);
        throw error;
    }
}

/**
 * Store user data in DynamoDB
 */
async function storeUserData(userSub, email, walletData) {
    console.log(`💾 Storing user data in DynamoDB for: ${userSub}`);
    
    try {
        const params = {
            TableName: DYNAMODB_TABLE,
            Item: {
                userId: userSub,
                email: email,
                hederaAccountId: walletData.hederaAccountId,
                hederaPrivateKey: walletData.hederaPrivateKey,
                hederaPublicKey: walletData.hederaPublicKey,
                initialBalance: walletData.initialBalance,
                network: walletData.network,
                assetCount: 0,
                subscriptionTier: 'free',
                mateBalance: walletData.initialBalance,
                kycStatus: 'pending',
                lastActivity: new Date().toISOString(),
                storageUsed: 0,
                accountType: 'personal', // Default account type - can be changed later via UI
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        };
        
        await dynamodb.send(new PutCommand(params));
        console.log(`✅ Stored user data in DynamoDB for: ${userSub}`);
        
    } catch (error) {
        console.error('❌ Error storing user data in DynamoDB:', error);
        throw error;
    }
}
