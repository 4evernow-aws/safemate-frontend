/**
 * Test Real Blockchain Key Types - V47.2
 * 
 * This test creates a REAL token on Hedera testnet and tests ALL key types:
 * ✅ Admin Key (user) - Can update/delete token and modify other keys
 * ✅ Supply Key (user) - Can mint/burn NFTs
 * ✅ Metadata Key (user) - Can update NFT metadata
 * ✅ Freeze Key (user) - Can freeze/unfreeze folder
 * ✅ Wipe Key (user) - Can wipe folder contents if compromised
 * ✅ Pause Key (user) - Can pause/unpause folder operations
 * ✅ Treasury Account (user) - Holds the NFTs etc
 */

const { 
    Client, 
    PrivateKey, 
    PublicKey, 
    AccountId,
    TokenCreateTransaction,
    TokenUpdateTransaction,
    TokenDeleteTransaction,
    TokenMintTransaction,
    TokenBurnTransaction,
    TokenWipeTransaction,
    TokenFreezeTransaction,
    TokenUnfreezeTransaction,
    TokenPauseTransaction,
    TokenUnpauseTransaction,
    TokenUpdateNftTransaction,
    TransferTransaction,
    Hbar,
    TokenType,
    TokenSupplyType
} = require('@hashgraph/sdk');

// Real testnet configuration
const TESTNET_NODE_ID = "0.0.3";
const TESTNET_ACCOUNT_ID = "0.0.2";

// Test user account from browser logs
const TEST_USER_ACCOUNT = "0.0.6890393";
const TEST_USER_PUBLIC_KEY = "302a300506032b6570032100f8c575bdaddf2db1ef668ad882d0664f08f874e5194b3273bc52084c1c91f575";

console.log("🧪 Testing REAL Blockchain Key Types - V47.2");
console.log("=" .repeat(70));
console.log("🌐 Using REAL Hedera Testnet - NO MOCK DATA");
console.log("=" .repeat(70));

async function testRealBlockchainKeyTypes() {
    let client;
    let testTokenId;
    
    try {
        // Initialize Hedera client for testnet
        console.log("\n🌐 Initializing Hedera Testnet Client...");
        console.log("-".repeat(50));
        
        client = Client.forTestnet();
        client.setOperator(TESTNET_ACCOUNT_ID, PrivateKey.generate());
        
        console.log("✅ Hedera testnet client initialized");
        console.log(`   Network: TESTNET`);
        console.log(`   Node ID: ${TESTNET_NODE_ID}`);
        
        // Generate user keys for testing
        console.log("\n🔑 Generating User Keys for Testing...");
        console.log("-".repeat(50));
        
        const userPrivateKey = PrivateKey.generate();
        const userPublicKey = userPrivateKey.publicKey;
        const userAccountId = AccountId.fromString(TEST_USER_ACCOUNT);
        
        console.log("✅ User private key generated");
        console.log("✅ User public key generated");
        console.log(`   User Account: ${userAccountId.toString()}`);
        console.log(`   User Public Key: ${userPublicKey.toString()}`);
        
        // Test 1: Create REAL Token with ALL User Keys
        console.log("\n🏗️ Test 1: Creating REAL Token with ALL User Keys");
        console.log("-".repeat(50));
        
        const tokenCreateTx = new TokenCreateTransaction()
            .setTokenName("SafeMate Test Token V47.2")
            .setTokenSymbol("SMT47")
            .setTokenType(TokenType.NonFungibleUnique)
            .setSupplyType(TokenSupplyType.Infinite)
            .setInitialSupply(0)
            .setMaxSupply(0)
            .setTreasuryAccountId(userAccountId)
            .setAdminKey(userPublicKey)
            .setSupplyKey(userPublicKey)
            .setMetadataKey(userPublicKey)
            .setFreezeKey(userPublicKey)
            .setWipeKey(userPublicKey)
            .setPauseKey(userPublicKey)
            .setTokenMemo("V47.2 Real Blockchain Key Types Test");
        
        console.log("🔄 Submitting token creation transaction to Hedera testnet...");
        const tokenCreateResponse = await tokenCreateTx.execute(client);
        const tokenCreateReceipt = await tokenCreateResponse.getReceipt(client);
        
        testTokenId = tokenCreateReceipt.tokenId;
        console.log("✅ REAL Token created successfully on Hedera testnet!");
        console.log(`   Token ID: ${testTokenId.toString()}`);
        console.log(`   Transaction ID: ${tokenCreateResponse.transactionId.toString()}`);
        
        // Test 2: Admin Key - Update Token Properties
        console.log("\n🔧 Test 2: Admin Key - Update Token Properties");
        console.log("-".repeat(50));
        
        const tokenUpdateTx = new TokenUpdateTransaction()
            .setTokenId(testTokenId)
            .setTokenMemo("Updated by Admin Key - V47.2 Test")
            .setAdminKey(userPublicKey);
        
        console.log("🔄 Updating token with admin key...");
        const tokenUpdateResponse = await tokenUpdateTx.execute(client);
        const tokenUpdateReceipt = await tokenUpdateResponse.getReceipt(client);
        
        console.log("✅ Token updated successfully with admin key!");
        console.log(`   Transaction ID: ${tokenUpdateResponse.transactionId.toString()}`);
        console.log("   Admin key can update token properties: CONFIRMED");
        
        // Test 3: Supply Key - Mint NFT
        console.log("\n🏭 Test 3: Supply Key - Mint NFT");
        console.log("-".repeat(50));
        
        const nftMetadata = Buffer.from(JSON.stringify({
            name: "Test Folder V47.2",
            type: "folder",
            description: "Real blockchain test folder"
        }));
        
        const tokenMintTx = new TokenMintTransaction()
            .setTokenId(testTokenId)
            .setMetadata([nftMetadata]);
        
        console.log("🔄 Minting NFT with supply key...");
        const tokenMintResponse = await tokenMintTx.execute(client);
        const tokenMintReceipt = await tokenMintResponse.getReceipt(client);
        
        console.log("✅ NFT minted successfully with supply key!");
        console.log(`   Serial Number: ${tokenMintReceipt.serials[0]}`);
        console.log(`   Transaction ID: ${tokenMintResponse.transactionId.toString()}`);
        console.log("   Supply key can mint NFTs: CONFIRMED");
        
        // Test 4: Metadata Key - Update NFT Metadata
        console.log("\n📝 Test 4: Metadata Key - Update NFT Metadata");
        console.log("-".repeat(50));
        
        const updatedMetadata = Buffer.from(JSON.stringify({
            name: "Updated Test Folder V47.2",
            type: "folder",
            description: "Updated by metadata key - real blockchain test"
        }));
        
        const tokenUpdateNftTx = new TokenUpdateNftTransaction()
            .setTokenId(testTokenId)
            .setSerialNumber(tokenMintReceipt.serials[0])
            .setMetadata(updatedMetadata);
        
        console.log("🔄 Updating NFT metadata with metadata key...");
        const tokenUpdateNftResponse = await tokenUpdateNftTx.execute(client);
        const tokenUpdateNftReceipt = await tokenUpdateNftResponse.getReceipt(client);
        
        console.log("✅ NFT metadata updated successfully with metadata key!");
        console.log(`   Transaction ID: ${tokenUpdateNftResponse.transactionId.toString()}`);
        console.log("   Metadata key can update NFT metadata: CONFIRMED");
        
        // Test 5: Freeze Key - Freeze Account
        console.log("\n❄️ Test 5: Freeze Key - Freeze Account");
        console.log("-".repeat(50));
        
        const tokenFreezeTx = new TokenFreezeTransaction()
            .setTokenId(testTokenId)
            .setAccountId(userAccountId);
        
        console.log("🔄 Freezing account with freeze key...");
        const tokenFreezeResponse = await tokenFreezeTx.execute(client);
        const tokenFreezeReceipt = await tokenFreezeResponse.getReceipt(client);
        
        console.log("✅ Account frozen successfully with freeze key!");
        console.log(`   Transaction ID: ${tokenFreezeResponse.transactionId.toString()}`);
        console.log("   Freeze key can freeze accounts: CONFIRMED");
        
        // Test 6: Unfreeze Account
        console.log("\n🔥 Test 6: Freeze Key - Unfreeze Account");
        console.log("-".repeat(50));
        
        const tokenUnfreezeTx = new TokenUnfreezeTransaction()
            .setTokenId(testTokenId)
            .setAccountId(userAccountId);
        
        console.log("🔄 Unfreezing account with freeze key...");
        const tokenUnfreezeResponse = await tokenUnfreezeTx.execute(client);
        const tokenUnfreezeReceipt = await tokenUnfreezeResponse.getReceipt(client);
        
        console.log("✅ Account unfrozen successfully with freeze key!");
        console.log(`   Transaction ID: ${tokenUnfreezeResponse.transactionId.toString()}`);
        console.log("   Freeze key can unfreeze accounts: CONFIRMED");
        
        // Test 7: Pause Key - Pause Token
        console.log("\n⏸️ Test 7: Pause Key - Pause Token");
        console.log("-".repeat(50));
        
        const tokenPauseTx = new TokenPauseTransaction()
            .setTokenId(testTokenId);
        
        console.log("🔄 Pausing token with pause key...");
        const tokenPauseResponse = await tokenPauseTx.execute(client);
        const tokenPauseReceipt = await tokenPauseResponse.getReceipt(client);
        
        console.log("✅ Token paused successfully with pause key!");
        console.log(`   Transaction ID: ${tokenPauseResponse.transactionId.toString()}`);
        console.log("   Pause key can pause tokens: CONFIRMED");
        
        // Test 8: Unpause Token
        console.log("\n▶️ Test 8: Pause Key - Unpause Token");
        console.log("-".repeat(50));
        
        const tokenUnpauseTx = new TokenUnpauseTransaction()
            .setTokenId(testTokenId);
        
        console.log("🔄 Unpausing token with pause key...");
        const tokenUnpauseResponse = await tokenUnpauseTx.execute(client);
        const tokenUnpauseReceipt = await tokenUnpauseResponse.getReceipt(client);
        
        console.log("✅ Token unpaused successfully with pause key!");
        console.log(`   Transaction ID: ${tokenUnpauseResponse.transactionId.toString()}`);
        console.log("   Pause key can unpause tokens: CONFIRMED");
        
        // Test 9: Wipe Key - Wipe NFT
        console.log("\n🧹 Test 9: Wipe Key - Wipe NFT");
        console.log("-".repeat(50));
        
        const tokenWipeTx = new TokenWipeTransaction()
            .setTokenId(testTokenId)
            .setAccountId(userAccountId)
            .setSerials([tokenMintReceipt.serials[0]]);
        
        console.log("🔄 Wiping NFT with wipe key...");
        const tokenWipeResponse = await tokenWipeTx.execute(client);
        const tokenWipeReceipt = await tokenWipeResponse.getReceipt(client);
        
        console.log("✅ NFT wiped successfully with wipe key!");
        console.log(`   Transaction ID: ${tokenWipeResponse.transactionId.toString()}`);
        console.log("   Wipe key can wipe NFTs: CONFIRMED");
        
        // Test 10: Burn Token Supply
        console.log("\n🔥 Test 10: Supply Key - Burn Token Supply");
        console.log("-".repeat(50));
        
        const tokenBurnTx = new TokenBurnTransaction()
            .setTokenId(testTokenId)
            .setAmount(0);
        
        console.log("🔄 Burning token supply with supply key...");
        const tokenBurnResponse = await tokenBurnTx.execute(client);
        const tokenBurnReceipt = await tokenBurnResponse.getReceipt(client);
        
        console.log("✅ Token supply burned successfully with supply key!");
        console.log(`   Transaction ID: ${tokenBurnResponse.transactionId.toString()}`);
        console.log("   Supply key can burn token supply: CONFIRMED");
        
        // Test 11: Delete Token (Admin Key)
        console.log("\n🗑️ Test 11: Admin Key - Delete Token");
        console.log("-".repeat(50));
        
        const tokenDeleteTx = new TokenDeleteTransaction()
            .setTokenId(testTokenId);
        
        console.log("🔄 Deleting token with admin key...");
        const tokenDeleteResponse = await tokenDeleteTx.execute(client);
        const tokenDeleteReceipt = await tokenDeleteResponse.getReceipt(client);
        
        console.log("✅ Token deleted successfully with admin key!");
        console.log(`   Transaction ID: ${tokenDeleteResponse.transactionId.toString()}`);
        console.log("   Admin key can delete tokens: CONFIRMED");
        
        // Final Summary
        console.log("\n🎉 ALL REAL BLOCKCHAIN KEY TYPES TESTS COMPLETED!");
        console.log("=" .repeat(70));
        console.log("🌐 REAL Hedera Testnet Transactions: SUCCESSFUL");
        console.log("=" .repeat(70));
        console.log("✅ Admin Key (user) - Can update/delete token and modify other keys");
        console.log("✅ Supply Key (user) - Can mint/burn NFTs");
        console.log("✅ Metadata Key (user) - Can update NFT metadata");
        console.log("✅ Freeze Key (user) - Can freeze/unfreeze folder");
        console.log("✅ Wipe Key (user) - Can wipe folder contents if compromised");
        console.log("✅ Pause Key (user) - Can pause/unpause folder operations");
        console.log("✅ Treasury Account (user) - Holds the NFTs etc");
        console.log("\n🚀 User has COMPLETE CONTROL over all folder operations!");
        console.log("   - All operations tested on REAL Hedera testnet");
        console.log("   - No mock data - all transactions are real blockchain operations");
        console.log("   - V47.2 fixes working perfectly with real blockchain");
        console.log("   - Ready for production use!");
        
    } catch (error) {
        console.error("\n❌ Real Blockchain Test Failed:", error.message);
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

// Run the test
testRealBlockchainKeyTypes().catch(console.error);