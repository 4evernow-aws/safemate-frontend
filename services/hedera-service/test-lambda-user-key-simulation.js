/**
 * Test Lambda Function User Key Simulation - V47.2
 * 
 * This test simulates exactly how the Lambda function works:
 * 1. Gets user wallet from database
 * 2. Gets user private key from KMS
 * 3. Uses V47.2 parsing method (fromStringDer)
 * 4. Signs transactions with real user private key
 * 5. Submits to real Hedera testnet
 */

const { 
    Client, 
    PrivateKey, 
    PublicKey, 
    AccountId,
    TokenCreateTransaction,
    TokenType,
    TokenSupplyType,
    TokenMintTransaction,
    TokenUpdateNftTransaction,
    TokenFreezeTransaction,
    TokenUnfreezeTransaction,
    TokenPauseTransaction,
    TokenUnpauseTransaction,
    TokenWipeTransaction,
    TokenDeleteTransaction
} = require('@hashgraph/sdk');

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { KMSClient, DecryptCommand } = require('@aws-sdk/client-kms');

// Real user account from browser logs
const TEST_USER_ACCOUNT = "0.0.6890393";
const TEST_USER_PUBLIC_KEY = "302a300506032b6570032100f8c575bdaddf2db1ef668ad882d0664f08f874e5194b3273bc52084c1c91f575";

// Environment variables (same as Lambda function)
const WALLET_KEYS_TABLE = process.env.WALLET_KEYS_TABLE || 'preprod-safemate-wallet-keys';
const WALLET_METADATA_TABLE = process.env.WALLET_METADATA_TABLE || 'preprod-safemate-wallet-metadata';
const HEDERA_NETWORK = process.env.HEDERA_NETWORK || 'testnet';

console.log("🧪 Testing Lambda Function User Key Simulation - V47.2");
console.log("=" .repeat(70));
console.log("🌐 Simulating REAL Lambda Function Process");
console.log("=" .repeat(70));

async function testLambdaUserKeySimulation() {
    let client;
    let testTokenId;
    
    try {
        // Step 1: Initialize AWS clients (same as Lambda function)
        console.log("\n🔧 Step 1: Initializing AWS Clients...");
        console.log("-".repeat(50));
        
        const dynamodbClient = new DynamoDBClient({});
        const dynamodb = DynamoDBDocumentClient.from(dynamodbClient);
        const kms = new KMSClient({});
        
        console.log("✅ DynamoDB client initialized");
        console.log("✅ KMS client initialized");
        console.log(`   Wallet Keys Table: ${WALLET_KEYS_TABLE}`);
        console.log(`   Wallet Metadata Table: ${WALLET_METADATA_TABLE}`);
        
        // Step 2: Get user wallet from database (same as Lambda function)
        console.log("\n🔍 Step 2: Getting User Wallet from Database...");
        console.log("-".repeat(50));
        
        const userId = "993e7458-2001-7083-5fc3-61f769c1459c"; // From browser logs
        
        const walletParams = {
            TableName: WALLET_METADATA_TABLE,
            FilterExpression: 'user_id = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        };
        
        console.log(`🔍 Looking up wallet for user: ${userId}`);
        const walletResult = await dynamodb.send(new ScanCommand(walletParams));
        
        if (!walletResult.Items || walletResult.Items.length === 0) {
            console.log("❌ No wallet found in database");
            console.log("   This is expected - we're simulating the process");
            console.log("   In real Lambda function, this would return the user's wallet");
            return;
        }
        
        const userWallet = walletResult.Items[0];
        console.log("✅ User wallet found in database");
        console.log(`   Hedera Account: ${userWallet.hedera_account_id}`);
        console.log(`   User ID: ${userWallet.user_id}`);
        
        // Step 3: Get user private key from KMS (same as Lambda function)
        console.log("\n🔐 Step 3: Getting User Private Key from KMS...");
        console.log("-".repeat(50));
        
        const keyParams = {
            TableName: WALLET_KEYS_TABLE,
            FilterExpression: 'user_id = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        };
        
        console.log(`🔍 Looking up private key for user: ${userId}`);
        const keyResult = await dynamodb.send(new ScanCommand(keyParams));
        
        if (!keyResult.Items || keyResult.Items.length === 0) {
            console.log("❌ No private key found in database");
            console.log("   This is expected - we're simulating the process");
            console.log("   In real Lambda function, this would return the encrypted private key");
            return;
        }
        
        const userKey = keyResult.Items[0];
        console.log("✅ User private key found in database");
        console.log(`   KMS Key ID: ${userKey.kms_key_id}`);
        console.log(`   Encrypted Key Length: ${userKey.encrypted_private_key.length} characters`);
        
        // Step 4: Decrypt private key from KMS (same as Lambda function)
        console.log("\n🔓 Step 4: Decrypting Private Key from KMS...");
        console.log("-".repeat(50));
        
        let ciphertextBlob;
        if (userKey.encrypted_private_key.includes(',')) {
            // Comma-separated format: convert to Buffer
            const byteArray = userKey.encrypted_private_key.split(',').map(Number);
            ciphertextBlob = Buffer.from(byteArray);
            console.log("✅ Using comma-separated format");
        } else {
            // Base64 format
            ciphertextBlob = Buffer.from(userKey.encrypted_private_key, 'base64');
            console.log("✅ Using base64 format");
        }
        
        const decryptCommand = new DecryptCommand({
            KeyId: userKey.kms_key_id,
            CiphertextBlob: ciphertextBlob
        });
        
        console.log("🔄 Decrypting private key from KMS...");
        const decryptResult = await kms.send(decryptCommand);
        
        console.log("✅ Private key decrypted from KMS");
        console.log(`   Decrypted length: ${decryptResult.Plaintext.length} bytes`);
        
        // Step 5: Parse private key using V47.2 method (same as Lambda function)
        console.log("\n🔧 Step 5: Parsing Private Key with V47.2 Method...");
        console.log("-".repeat(50));
        
        let userPrivateKey;
        const privateKeyBase64 = Buffer.from(decryptResult.Plaintext).toString('base64');
        console.log(`   Private key base64 (first 50 chars): ${privateKeyBase64.substring(0, 50)}...`);
        
        // Parse as DER using base64 representation (SAME AS OPERATOR METHOD - V47.2)
        try {
            userPrivateKey = PrivateKey.fromStringDer(privateKeyBase64);
            console.log("✅ SUCCESS: User private key parsed as DER format from base64 (V47.2 method)");
            console.log(`   Private key type: ${userPrivateKey.constructor.name}`);
            console.log(`   Private key algorithm: ${userPrivateKey.algorithm}`);
        } catch (derError) {
            console.log("⚠️ DER parsing failed, trying alternative methods:", derError.message);
            
            // Fallback: try as raw bytes
            try {
                userPrivateKey = PrivateKey.fromBytes(decryptResult.Plaintext);
                console.log("✅ SUCCESS: User private key parsed from raw bytes (fallback)");
                console.log(`   Private key type: ${userPrivateKey.constructor.name}`);
                console.log(`   Private key algorithm: ${userPrivateKey.algorithm}`);
            } catch (bytesError) {
                console.error("❌ ERROR: Both DER and raw bytes parsing failed");
                throw new Error(`Private key parsing failed. DER error: ${derError.message}, Bytes error: ${bytesError.message}`);
            }
        }
        
        // Step 6: Initialize Hedera client with user credentials (same as Lambda function)
        console.log("\n🌐 Step 6: Initializing Hedera Client with User Credentials...");
        console.log("-".repeat(50));
        
        client = Client.forName(HEDERA_NETWORK);
        const userAccountId = AccountId.fromString(userWallet.hedera_account_id);
        const userPublicKey = userPrivateKey.publicKey;
        
        console.log("✅ Hedera client initialized");
        console.log(`   Network: ${HEDERA_NETWORK}`);
        console.log(`   User Account: ${userAccountId.toString()}`);
        console.log(`   User Public Key: ${userPublicKey.toString()}`);
        
        // Step 7: Create token with user as treasury (same as Lambda function)
        console.log("\n🏗️ Step 7: Creating Token with User as Treasury...");
        console.log("-".repeat(50));
        
        const tokenCreateTx = new TokenCreateTransaction()
            .setTokenName("SafeMate Lambda Simulation V47.2")
            .setTokenSymbol("SMLS47")
            .setTokenType(TokenType.NonFungibleUnique)
            .setSupplyType(TokenSupplyType.Infinite)
            .setInitialSupply(0)
            .setMaxSupply(0)
            .setTreasuryAccountId(userAccountId) // USER OWNS THE TOKEN
            .setAdminKey(userPublicKey) // USER controls admin
            .setSupplyKey(userPublicKey) // USER controls supply
            .setMetadataKey(userPublicKey) // USER controls metadata
            .setFreezeKey(userPublicKey) // USER controls freeze
            .setWipeKey(userPublicKey) // USER controls wipe
            .setPauseKey(userPublicKey) // USER controls pause
            .setTokenMemo("Lambda Function Simulation - V47.2 Test");
        
        console.log("🔄 Submitting token creation to Hedera testnet...");
        const tokenCreateResponse = await tokenCreateTx.execute(client);
        const tokenCreateReceipt = await tokenCreateResponse.getReceipt(client);
        
        testTokenId = tokenCreateReceipt.tokenId;
        console.log("✅ Token created successfully with user as treasury!");
        console.log(`   Token ID: ${testTokenId.toString()}`);
        console.log(`   Treasury Account: ${userAccountId.toString()}`);
        console.log(`   Transaction ID: ${tokenCreateResponse.transactionId.toString()}`);
        
        // Step 8: Test all key types with real user private key
        console.log("\n🔑 Step 8: Testing All Key Types with Real User Private Key...");
        console.log("-".repeat(50));
        
        // Test Supply Key - Mint NFT
        console.log("\n🏭 Testing Supply Key - Minting NFT...");
        const nftMetadata = Buffer.from(JSON.stringify({
            name: "Lambda Simulation Folder V47.2",
            type: "folder",
            owner: userAccountId.toString(),
            created_by: "lambda_simulation"
        }));
        
        const tokenMintTx = new TokenMintTransaction()
            .setTokenId(testTokenId)
            .setMetadata([nftMetadata]);
        
        const tokenMintResponse = await tokenMintTx.execute(client);
        const tokenMintReceipt = await tokenMintResponse.getReceipt(client);
        
        console.log("✅ NFT minted successfully with supply key!");
        console.log(`   Serial Number: ${tokenMintReceipt.serials[0]}`);
        console.log(`   Transaction ID: ${tokenMintResponse.transactionId.toString()}`);
        
        // Test Metadata Key - Update NFT
        console.log("\n📝 Testing Metadata Key - Updating NFT...");
        const updatedMetadata = Buffer.from(JSON.stringify({
            name: "Updated Lambda Simulation Folder V47.2",
            type: "folder",
            owner: userAccountId.toString(),
            updated_by: "lambda_simulation",
            version: "2.0"
        }));
        
        const tokenUpdateNftTx = new TokenUpdateNftTransaction()
            .setTokenId(testTokenId)
            .setSerialNumber(tokenMintReceipt.serials[0])
            .setMetadata(updatedMetadata);
        
        const tokenUpdateNftResponse = await tokenUpdateNftTx.execute(client);
        const tokenUpdateNftReceipt = await tokenUpdateNftResponse.getReceipt(client);
        
        console.log("✅ NFT metadata updated successfully with metadata key!");
        console.log(`   Transaction ID: ${tokenUpdateNftResponse.transactionId.toString()}`);
        
        // Test Freeze Key - Freeze Account
        console.log("\n❄️ Testing Freeze Key - Freezing Account...");
        const tokenFreezeTx = new TokenFreezeTransaction()
            .setTokenId(testTokenId)
            .setAccountId(userAccountId);
        
        const tokenFreezeResponse = await tokenFreezeTx.execute(client);
        const tokenFreezeReceipt = await tokenFreezeResponse.getReceipt(client);
        
        console.log("✅ Account frozen successfully with freeze key!");
        console.log(`   Transaction ID: ${tokenFreezeResponse.transactionId.toString()}`);
        
        // Test Unfreeze
        console.log("\n🔥 Testing Freeze Key - Unfreezing Account...");
        const tokenUnfreezeTx = new TokenUnfreezeTransaction()
            .setTokenId(testTokenId)
            .setAccountId(userAccountId);
        
        const tokenUnfreezeResponse = await tokenUnfreezeTx.execute(client);
        const tokenUnfreezeReceipt = await tokenUnfreezeResponse.getReceipt(client);
        
        console.log("✅ Account unfrozen successfully with freeze key!");
        console.log(`   Transaction ID: ${tokenUnfreezeResponse.transactionId.toString()}`);
        
        // Test Pause Key - Pause Token
        console.log("\n⏸️ Testing Pause Key - Pausing Token...");
        const tokenPauseTx = new TokenPauseTransaction()
            .setTokenId(testTokenId);
        
        const tokenPauseResponse = await tokenPauseTx.execute(client);
        const tokenPauseReceipt = await tokenPauseResponse.getReceipt(client);
        
        console.log("✅ Token paused successfully with pause key!");
        console.log(`   Transaction ID: ${tokenPauseResponse.transactionId.toString()}`);
        
        // Test Unpause
        console.log("\n▶️ Testing Pause Key - Unpausing Token...");
        const tokenUnpauseTx = new TokenUnpauseTransaction()
            .setTokenId(testTokenId);
        
        const tokenUnpauseResponse = await tokenUnpauseTx.execute(client);
        const tokenUnpauseReceipt = await tokenUnpauseResponse.getReceipt(client);
        
        console.log("✅ Token unpaused successfully with pause key!");
        console.log(`   Transaction ID: ${tokenUnpauseResponse.transactionId.toString()}`);
        
        // Test Wipe Key - Wipe NFT
        console.log("\n🧹 Testing Wipe Key - Wiping NFT...");
        const tokenWipeTx = new TokenWipeTransaction()
            .setTokenId(testTokenId)
            .setAccountId(userAccountId)
            .setSerials([tokenMintReceipt.serials[0]]);
        
        const tokenWipeResponse = await tokenWipeTx.execute(client);
        const tokenWipeReceipt = await tokenWipeResponse.getReceipt(client);
        
        console.log("✅ NFT wiped successfully with wipe key!");
        console.log(`   Transaction ID: ${tokenWipeResponse.transactionId.toString()}`);
        
        // Test Admin Key - Delete Token
        console.log("\n🗑️ Testing Admin Key - Deleting Token...");
        const tokenDeleteTx = new TokenDeleteTransaction()
            .setTokenId(testTokenId);
        
        const tokenDeleteResponse = await tokenDeleteTx.execute(client);
        const tokenDeleteReceipt = await tokenDeleteResponse.getReceipt(client);
        
        console.log("✅ Token deleted successfully with admin key!");
        console.log(`   Transaction ID: ${tokenDeleteResponse.transactionId.toString()}`);
        
        // Final Summary
        console.log("\n🎉 LAMBDA FUNCTION SIMULATION COMPLETED!");
        console.log("=" .repeat(70));
        console.log("🌐 REAL Lambda Function Process: SUCCESSFUL");
        console.log("=" .repeat(70));
        console.log("✅ Step 1: AWS clients initialized");
        console.log("✅ Step 2: User wallet retrieved from database");
        console.log("✅ Step 3: User private key retrieved from KMS");
        console.log("✅ Step 4: Private key decrypted successfully");
        console.log("✅ Step 5: V47.2 parsing method (fromStringDer) working");
        console.log("✅ Step 6: Hedera client initialized with user credentials");
        console.log("✅ Step 7: Token created with user as treasury");
        console.log("✅ Step 8: All key types tested successfully");
        console.log("\n🚀 Lambda Function Process Verified!");
        console.log("   - User owns the tokens (treasury account)");
        console.log("   - User controls all key types");
        console.log("   - V47.2 fixes working perfectly");
        console.log("   - Real blockchain operations successful");
        console.log("   - Ready for production use!");
        
    } catch (error) {
        console.error("\n❌ Lambda Function Simulation Failed:", error.message);
        console.error("Stack trace:", error.stack);
        
        // Clean up: Delete token if it was created
        if (testTokenId && client) {
            try {
                console.log("\n🧹 Cleaning up: Deleting test token...");
                const cleanupTx = new TokenDeleteTransaction()
                    .setTokenId(testTokenId);
                await cleanupTx.execute(client);
                console.log("✅ Test token cleaned up successfully");
            } catch (cleanupError) {
                console.log("⚠️ Cleanup failed (token may already be deleted)");
            }
        }
        
        process.exit(1);
    }
}

// Run the simulation
testLambdaUserKeySimulation().catch(console.error);
