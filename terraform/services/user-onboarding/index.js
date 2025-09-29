/**
 * SafeMate v2 - User Onboarding Service (Real Hedera Integration)
 *
 * Environment: preprod
 * Function: preprod-safemate-user-onboarding
 * Purpose: Handle user onboarding with REAL Hedera testnet wallet creation
 *
 * Features:
 * - REAL Hedera testnet wallet creation with operator account funding
 * - KMS encryption for private keys
 * - DynamoDB storage for wallet metadata
 * - Cognito User Pool authentication
 * - CORS support for all HTTP methods
 * - Live Hedera testnet integration (no mirror sites)
 * - Uses Hedera SDK from Lambda layer
 * - NO MOCK WALLETS - Real wallets only or fail gracefully
 *
 * Dependencies:
 * - @hashgraph/sdk: ^2.73.1
 * - @aws-sdk/client-dynamodb: ^3.891.0
 * - @aws-sdk/lib-dynamodb: ^3.891.0
 * - @aws-sdk/client-kms: ^3.891.0
 *
 * Last Updated: January 22, 2025
 * Status: Real Hedera integration with local package - NO MOCK WALLETS policy
 * Fixed: Removed problematic Lambda layer, added Hedera SDK directly to package
 * Fixed: Operator credentials now retrieved from database instead of environment variables
 * Fixed: Operator account DER private key parsing for existing account 0.0.6428427
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { KMSClient, EncryptCommand, DecryptCommand } = require('@aws-sdk/client-kms');

// Initialize AWS services
const dynamodb = new DynamoDBClient({ region: 'ap-southeast-2' });
const dynamodbDoc = DynamoDBDocumentClient.from(dynamodb);
const kms = new KMSClient({ region: 'ap-southeast-2' });

// CORS headers
const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-cognito-id-token,x-cognito-access-token,Accept',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Credentials': 'true'
};

// Environment variables
const WALLET_METADATA_TABLE = process.env.WALLET_METADATA_TABLE || 'preprod-safemate-wallet-metadata';
const WALLET_KEYS_TABLE = process.env.WALLET_KEYS_TABLE || 'preprod-safemate-wallet-keys';
const WALLET_KMS_KEY_ID = process.env.WALLET_KMS_KEY_ID || 'arn:aws:kms:ap-southeast-2:994220462693:key/3b18b0c0-dd1f-41db-8bac-6ec857c1ed05';
// Operator credentials are now retrieved from database dynamically
const HEDERA_NETWORK = process.env.HEDERA_NETWORK || 'testnet';
const AWS_REGION = process.env.AWS_REGION || 'ap-southeast-2';

// Load Hedera SDK from local package - REQUIRED
let Client, AccountCreateTransaction, PrivateKey, Hbar, AccountId, AccountBalanceQuery;
let hederaSDKAvailable = false;

try {
  console.log('🔍 Attempting to load Hedera SDK from local package...');
  
  // Load from local package (included in Lambda deployment)
  ({
    Client,
    AccountCreateTransaction,
    PrivateKey,
    Hbar,
    AccountId,
    AccountBalanceQuery
  } = require('@hashgraph/sdk'));
  
  hederaSDKAvailable = true;
  console.log('✅ Hedera SDK loaded successfully from local package');
  console.log('✅ Client type:', typeof Client);
  console.log('✅ AccountCreateTransaction type:', typeof AccountCreateTransaction);
} catch (error) {
  console.error('❌ CRITICAL: Hedera SDK not available from local package:', error.message);
  console.error('❌ Error stack:', error.stack);
  console.error('❌ Cannot create real Hedera wallets without SDK');
  hederaSDKAvailable = false;
  // Set to null to indicate SDK is not available
  Client = AccountCreateTransaction = PrivateKey = Hbar = AccountId = AccountBalanceQuery = null;
}

/**
 * Extract user information from Cognito JWT token claims
 */
function extractUserInfo(event) {
  try {
    console.log('🔍 Extracting user info from event...');
    if (event.requestContext && event.requestContext.authorizer && event.requestContext.authorizer.claims) {
      const claims = event.requestContext.authorizer.claims;
      console.log('✅ Found Cognito claims:', {
        sub: claims.sub,
        email: claims.email,
        username: claims['cognito:username']
      });
      return {
        userId: claims.sub,
        email: claims.email,
        username: claims['cognito:username'],
        userClaims: claims
      };
    }
    console.log('⚠️ No Cognito claims found, using test values');
    return {
      userId: 'test-user-123',
      email: 'test@example.com',
      username: 'test-user',
      userClaims: {}
    };
  } catch (error) {
    console.error('❌ Error extracting user info:', error);
    return {
      userId: 'test-user-123',
      email: 'test@example.com',
      username: 'test-user',
      userClaims: {}
    };
  }
}

/**
 * Get operator credentials from database and KMS
 */
async function getOperatorCredentials() {
  try {
    console.log('🔍 Getting operator credentials from database...');
    console.log('📋 Table name:', WALLET_KEYS_TABLE);

    // Get operator credentials from database
    const getCommand = new GetCommand({
      TableName: WALLET_KEYS_TABLE,
      Key: {
        user_id: 'hedera_operator'
      }
    });

    console.log('📋 DynamoDB command:', JSON.stringify(getCommand, null, 2));
    const result = await dynamodbDoc.send(getCommand);
    console.log('📋 DynamoDB result:', JSON.stringify(result, null, 2));
    
    if (!result.Item) {
      throw new Error('Operator account not found in database');
    }

    const operatorAccountId = result.Item.account_id;
    const encryptedPrivateKey = result.Item.encrypted_private_key;
    const kmsKeyId = result.Item.kms_key_id;

    console.log('✅ Operator account found in database:', operatorAccountId);
    console.log('📋 KMS Key ID:', kmsKeyId);
    console.log('📋 Encrypted private key length:', encryptedPrivateKey ? encryptedPrivateKey.length : 'undefined');

    // Decrypt the private key using KMS
    const decryptCommand = new DecryptCommand({
      KeyId: kmsKeyId,
      CiphertextBlob: Buffer.from(encryptedPrivateKey, 'base64')
    });

    const decryptResult = await kms.send(decryptCommand);
    
    console.log('✅ Operator credentials retrieved successfully');
    console.log('📋 Plaintext type:', typeof decryptResult.Plaintext);
    console.log('📋 Plaintext length:', decryptResult.Plaintext.length);
    
    // Convert to base64 for DER parsing (KMS returns binary data)
    const privateKeyBase64 = Buffer.from(decryptResult.Plaintext).toString('base64');
    console.log('📋 Private key base64 length:', privateKeyBase64.length);
    console.log('📋 Private key base64 starts with:', privateKeyBase64.substring(0, 20));
    
    // Parse as DER using base64 representation
    let privateKey;
    try {
      privateKey = PrivateKey.fromStringDer(privateKeyBase64);
      console.log('✅ Private key parsed as DER format from base64');
    } catch (derError) {
      console.log('⚠️ DER parsing failed, trying alternative methods:', derError.message);
      
      // Fallback: try as raw bytes
      try {
        privateKey = PrivateKey.fromBytes(decryptResult.Plaintext);
        console.log('✅ Private key parsed from raw bytes');
      } catch (bytesError) {
        console.error('❌ Both DER and raw bytes parsing failed');
        throw new Error(`Private key parsing failed. DER error: ${derError.message}, Bytes error: ${bytesError.message}`);
      }
    }
    
    return {
      privateKey: privateKey,
      accountId: AccountId.fromString(operatorAccountId)
    };
  } catch (error) {
    console.error('❌ Failed to get operator credentials:', error);
    throw error;
  }
}

/**
 * Decrypt private key using KMS
 */
async function decryptPrivateKey(encryptedKey, keyId) {
  try {
    console.log('🔍 Decrypting private key with KMS...');
    const decryptCommand = new DecryptCommand({
      KeyId: keyId,
      CiphertextBlob: Buffer.from(encryptedKey, 'base64')
    });
    const decryptResult = await kms.send(decryptCommand);
    console.log('✅ Private key decrypted successfully');
    return Buffer.from(decryptResult.Plaintext).toString();
  } catch (error) {
    console.error('❌ Failed to decrypt private key:', error);
    throw error;
  }
}

/**
 * Encrypt private key using KMS
 */
async function encryptPrivateKey(privateKeyString, keyId) {
  try {
    console.log('🔍 Encrypting private key with KMS...');
    const encryptCommand = new EncryptCommand({
      KeyId: keyId,
      Plaintext: Buffer.from(privateKeyString)
    });
    const encryptResult = await kms.send(encryptCommand);
    console.log('✅ Private key encrypted successfully');
    return encryptResult.CiphertextBlob.toString('base64');
  } catch (error) {
    console.error('❌ Failed to encrypt private key:', error);
    throw error;
  }
}

/**
 * Initialize Hedera client with operator credentials
 */
async function initializeHederaClient() {
  try {
    console.log('🔍 Initializing Hedera client...');
    const { privateKey, accountId } = await getOperatorCredentials();
    const client = Client.forTestnet();
    client.setOperator(accountId, privateKey);
    console.log('✅ Hedera client initialized successfully');
    return client;
  } catch (error) {
    console.error('❌ Failed to initialize Hedera client:', error);
    throw error;
  }
}

/**
 * Get onboarding status for a user
 */
async function getOnboardingStatus(userId) {
  console.log('🔍 Getting onboarding status for user:', userId);
  console.log('🔍 Using table:', WALLET_METADATA_TABLE);

  try {
    const command = new QueryCommand({
      TableName: WALLET_METADATA_TABLE,
      KeyConditionExpression: 'user_id = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      Limit: 1
    });

    console.log('🔍 Executing DynamoDB query...');
    const response = await dynamodbDoc.send(command);
    console.log('🔍 DynamoDB response:', JSON.stringify(response, null, 2));

    if (response.Items && response.Items.length > 0) {
      const wallet = response.Items[0];
      console.log('✅ Wallet found for user:', userId);
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          hasWallet: true,
          wallet: {
            hedera_account_id: wallet.hedera_account_id,
            public_key: wallet.public_key,
            account_type: wallet.account_type || 'personal',
            network: wallet.network || HEDERA_NETWORK,
            initial_balance_hbar: wallet.initial_balance_hbar || '0.1',
            needs_funding: false,
            created_by_operator: wallet.created_by_operator || true
          }
        })
      };
    } else {
      console.log('❌ No wallet found for user:', userId);
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          hasWallet: false,
          wallet: null
        })
      };
    }
  } catch (error) {
    console.error('❌ Error getting onboarding status:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        hasWallet: false,
        wallet: null,
        error: error.message,
        stack: error.stack
      })
    };
  }
}

/**
 * Start onboarding process and create REAL Hedera wallet ONLY
 */
async function startOnboarding(userId, email) {
  console.log('🚀 Starting onboarding for user:', userId);

  try {
    // Check if wallet already exists
    const existingWallet = await getOnboardingStatus(userId);
    const existingData = JSON.parse(existingWallet.body);

    if (existingData.hasWallet) {
      console.log('✅ Wallet already exists for user:', userId);
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          message: 'Wallet already exists',
          wallet: existingData.wallet
        })
      };
    }

    console.log('🔧 Creating REAL Hedera wallet for user:', userId);

    // CRITICAL: Check if Hedera SDK is available - NO MOCK WALLETS
    if (!hederaSDKAvailable) {
      console.error('❌ CRITICAL ERROR: Hedera SDK not available');
      console.error('❌ Cannot create real Hedera wallets without SDK');
      console.error('❌ NO MOCK WALLETS - Real wallets only');
      
      return {
        statusCode: 503,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          message: 'Hedera SDK not available - Cannot create real wallets',
          error: 'Service temporarily unavailable - Hedera SDK missing',
          requiresRealWallet: true,
          noMockWallets: true,
          sdkStatus: 'missing',
          nextSteps: 'Install @hashgraph/sdk dependency and redeploy'
        })
      };
    }

    let hederaClient;
    let createdByOperator = false;
    try {
      hederaClient = await initializeHederaClient();
      createdByOperator = true;
      console.log('✅ Initialized Hedera client with operator credentials.');
    } catch (opError) {
      console.warn('⚠️ Could not initialize Hedera client with operator credentials:', opError.message);
      console.warn('⚠️ Proceeding to create account without initial funding from operator.');
      hederaClient = Client.forTestnet();
      // Set a dummy operator to allow transaction execution
      const dummyPrivateKey = PrivateKey.generateED25519();
      const dummyAccountId = AccountId.fromString("0.0.0");
      hederaClient.setOperator(dummyAccountId, dummyPrivateKey);
      createdByOperator = false;
    }

    // Generate Ed25519 keypair
    const newAccountPrivateKey = PrivateKey.generateED25519();
    const newAccountPublicKey = newAccountPrivateKey.publicKey;

    // Create Hedera account
    console.log('📝 Creating REAL Hedera account...');
    const initialBalance = createdByOperator ? 0.1 : 0; // Only fund if operator is available
    const transaction = new AccountCreateTransaction()
      .setKey(newAccountPublicKey)
      .setInitialBalance(new Hbar(initialBalance));

    let txResponse;
    if (createdByOperator) {
      const operatorCredentials = await getOperatorCredentials();
      txResponse = await (await transaction.freezeWith(hederaClient).sign(operatorCredentials.privateKey)).execute(hederaClient);
    } else {
      // For non-operator transactions, we need to freeze and execute properly
      txResponse = await (await transaction.freezeWith(hederaClient)).execute(hederaClient);
    }

    const receipt = await txResponse.getReceipt(hederaClient);
    const newAccountId = receipt.accountId;

    if (!newAccountId) {
      throw new Error('Failed to create Hedera account');
    }

    console.log(`✅ REAL Hedera account created: ${newAccountId.toString()}`);

    // Encrypt private key
    const encryptedPrivateKey = await encryptPrivateKey(
      newAccountPrivateKey.toString(),
      WALLET_KMS_KEY_ID
    );

    // Generate wallet ID
    const walletId = `wallet-${Date.now()}-${newAccountId.toString().replace(/\./g, '-')}`;

    // Store wallet metadata
    const walletData = {
      user_id: userId,
      wallet_id: walletId,
      hedera_account_id: newAccountId.toString(),
      account_id: newAccountId.toString(), // Also store as account_id for compatibility
      public_key: newAccountPublicKey.toString(),
      account_type: 'personal',
      network: HEDERA_NETWORK,
      initial_balance_hbar: initialBalance.toString(),
      balance: initialBalance.toString(), // Also store as balance for compatibility
      created_at: new Date().toISOString(),
      email: email,
      status: 'active',
      created_by_operator: createdByOperator,
      is_real_wallet: true // Mark as real wallet
    };

    console.log('🔍 Storing REAL wallet metadata:', JSON.stringify(walletData, null, 2));

    await dynamodbDoc.send(new PutCommand({
      TableName: WALLET_METADATA_TABLE,
      Item: walletData
    }));

    // Store encrypted private key
    const keyData = {
      user_id: userId,
      wallet_id: walletId,
      account_id: newAccountId.toString(),
      public_key: newAccountPublicKey.toString(),
      encrypted_private_key: encryptedPrivateKey,
      key_type: 'ed25519',
      created_at: new Date().toISOString(),
      kms_key_id: WALLET_KMS_KEY_ID,
      is_real_wallet: true // Mark as real wallet
    };

    console.log('🔍 Storing encrypted private key for REAL wallet');

    await dynamodbDoc.send(new PutCommand({
      TableName: WALLET_KEYS_TABLE,
      Item: keyData
    }));

    console.log('✅ REAL Hedera wallet created and stored successfully for user:', userId);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        message: 'REAL Hedera wallet created successfully',
        hasWallet: true,
        wallet: {
          wallet_id: walletId,
          hedera_account_id: newAccountId.toString(),
          public_key: newAccountPublicKey.toString(),
          account_type: 'personal',
          network: HEDERA_NETWORK,
          initial_balance_hbar: initialBalance.toString(),
          needs_funding: !createdByOperator, // Needs funding if not created by operator
          created_by_operator: createdByOperator,
          transaction_id: txResponse.transactionId.toString(),
          is_real_wallet: true
        }
      })
    };

  } catch (error) {
    console.error('❌ Error starting onboarding:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        message: 'Failed to create REAL Hedera wallet',
        error: error.message,
        stack: error.stack,
        requiresRealWallet: true,
        noMockWallets: true
      })
    };
  }
}

/**
 * Main Lambda handler
 */
exports.handler = async (event, context) => {
  console.log('🔧 Lambda function invoked with event:', JSON.stringify(event, null, 2));
  console.log('🔧 Environment variables:', {
    WALLET_METADATA_TABLE,
    WALLET_KEYS_TABLE,
    WALLET_KMS_KEY_ID,
    HEDERA_NETWORK,
    AWS_REGION,
    HEDERA_SDK_AVAILABLE: hederaSDKAvailable
  });

  // Add a simple test to see if the function can execute basic operations
  try {
    console.log('🔧 Testing basic operations...');
    console.log('🔧 DynamoDB client type:', typeof dynamodbDoc);
    console.log('🔧 KMS client type:', typeof kms);
    console.log('🔧 Basic test passed');
  } catch (error) {
    console.error('❌ Basic test failed:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        error: 'Basic test failed: ' + error.message,
        stack: error.stack
      })
    };
  }

  try {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: ''
      };
    }

    // Extract user information from Cognito claims
    const { userId, email, userClaims } = extractUserInfo(event);

    console.log('🔧 User claims:', userClaims);
    console.log('🔧 Extracted userId:', userId);
    console.log('🔧 Extracted email:', email);

    const path = event.path;
    const httpMethod = event.httpMethod;

    console.log('🔧 Processing request:', httpMethod, path);

    if (path === '/onboarding/status' && httpMethod === 'GET') {
      return await getOnboardingStatus(userId);
    } else if (path === '/onboarding/start' && httpMethod === 'POST') {
      return await startOnboarding(userId, email);
    } else if (httpMethod === 'PUT') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          message: 'PUT method supported for CORS',
          path: path,
          method: httpMethod
        })
      };
    } else if (httpMethod === 'DELETE') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          message: 'DELETE method supported for CORS',
          path: path,
          method: httpMethod
        })
      };
    } else {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          error: 'Endpoint not found',
          path: path,
          method: httpMethod
        })
      };
    }

  } catch (error) {
    console.error('❌ Lambda function error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        error: error.message,
        stack: error.stack,
        requiresRealWallet: true,
        noMockWallets: true
      })
    };
  }
};
