/**
 * Test User Key Signing - Debug INVALID_SIGNATURE Error
 * 
 * This script tests the user's public and private key pair to identify
 * signature issues in the preprod hedera-service Lambda function.
 * 
 * Environment: Preprod
 * Purpose: Debug account 0.0.6890393 INVALID_SIGNATURE error
 * 
 * Last Updated: September 29, 2025
 * Status: V47.3 - Signature debugging
 */

const { Client, AccountId, PrivateKey, TokenCreateTransaction, TokenType, Hbar } = require('@hashgraph/sdk');
const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');
const { KMSClient, DecryptCommand } = require('@aws-sdk/client-kms');

// Environment variables
const HEDERA_NETWORK = process.env.HEDERA_NETWORK || 'testnet';
const WALLET_METADATA_TABLE = process.env.WALLET_METADATA_TABLE || 'preprod-safemate-wallet-metadata';
const WALLET_KEYS_TABLE = process.env.WALLET_KEYS_TABLE || 'preprod-safemate-wallet-keys';

// AWS clients
const dynamodb = new DynamoDBClient({ region: 'ap-southeast-2' });
const kms = new KMSClient({ region: 'ap-southeast-2' });

/**
 * Test user key signing process
 */
async function testUserKeySigning() {
  try {
    console.log('🔧 Testing user key signing process...');
    console.log(`🔧 Network: ${HEDERA_NETWORK}`);
    console.log(`🔧 Wallet metadata table: ${WALLET_METADATA_TABLE}`);
    console.log(`🔧 Wallet keys table: ${WALLET_KEYS_TABLE}`);
    
    // Test with the specific user account that's failing
    const testUserId = 'test-user-123'; // This should match the user from the error
    
    console.log(`🔧 Testing with user ID: ${testUserId}`);
    
    // Get user's wallet information
    const userWallet = await getUserWallet(testUserId);
    if (!userWallet) {
      console.log('❌ No wallet found for test user');
      return;
    }
    
    console.log(`✅ Found wallet for user: ${userWallet.hedera_account_id}`);
    console.log(`✅ Public key: ${userWallet.public_key}`);
    
    // Get user's private key
    const { privateKey, accountId } = await getUserPrivateKey(testUserId, userWallet);
    
    console.log(`✅ Private key retrieved successfully`);
    console.log(`✅ Private key type: ${privateKey.constructor.name}`);
    console.log(`✅ Private key algorithm: ${privateKey.algorithm}`);
    console.log(`✅ Account ID: ${accountId.toString()}`);
    
    // Verify public key matches
    const derivedPublicKey = privateKey.publicKey;
    console.log(`✅ Derived public key: ${derivedPublicKey.toString()}`);
    console.log(`✅ Stored public key: ${userWallet.public_key}`);
    console.log(`✅ Public keys match: ${derivedPublicKey.toString() === userWallet.public_key}`);
    
    if (derivedPublicKey.toString() !== userWallet.public_key) {
      console.log('❌ CRITICAL: Public key mismatch! This will cause INVALID_SIGNATURE errors.');
      return;
    }
    
    // Test transaction signing
    console.log('🔧 Testing transaction signing...');
    
    const client = Client.forName(HEDERA_NETWORK);
    client.setOperator(accountId, privateKey);
    
    // Create a simple test transaction
    const testTransaction = new TokenCreateTransaction()
      .setTokenName('Test Token')
      .setTokenSymbol('TEST')
      .setTokenType(TokenType.FungibleCommon)
      .setDecimals(0)
      .setInitialSupply(0)
      .setTreasuryAccountId(accountId)
      .setAdminKey(privateKey.publicKey)
      .setMaxTransactionFee(new Hbar(1));
    
    console.log('🔧 Freezing test transaction...');
    testTransaction.freezeWith(client);
    
    console.log('🔧 Signing test transaction...');
    const signedTransaction = await testTransaction.sign(privateKey);
    console.log('✅ Test transaction signed successfully');
    
    console.log('🔧 Executing test transaction...');
    const response = await signedTransaction.execute(client);
    console.log('✅ Test transaction executed successfully');
    console.log(`✅ Transaction ID: ${response.transactionId.toString()}`);
    
    // Get receipt
    const receipt = await response.getReceipt(client);
    console.log(`✅ Transaction receipt status: ${receipt.status}`);
    
    if (receipt.status.toString() === 'SUCCESS') {
      console.log('🎉 SUCCESS: User key signing is working correctly!');
      console.log(`🎉 Created token: ${receipt.tokenId?.toString() || 'N/A'}`);
    } else {
      console.log(`❌ Transaction failed with status: ${receipt.status}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('❌ Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
  }
}

/**
 * Get user's wallet information from DynamoDB
 */
async function getUserWallet(userId) {
  try {
    console.log(`🔍 Getting wallet for user: ${userId}`);
    
    const params = {
      TableName: WALLET_METADATA_TABLE,
      FilterExpression: 'user_id = :userId',
      ExpressionAttributeValues: {
        ':userId': { S: userId }
      }
    };

    const result = await dynamodb.send(new ScanCommand(params));
    console.log(`🔍 Found ${result.Items ? result.Items.length : 0} wallet records for user: ${userId}`);
    
    if (result.Items && result.Items.length > 0) {
      const wallet = result.Items[0];
      const hederaAccountId = wallet.hedera_account_id?.S || wallet.account_id?.S;
      const publicKey = wallet.public_key?.S;
      
      console.log(`✅ Wallet found: ${hederaAccountId} for user: ${userId}`);
      return {
        hedera_account_id: hederaAccountId,
        public_key: publicKey
      };
    }
    
    console.log(`❌ No wallet found for user: ${userId}`);
    return null;
  } catch (error) {
    console.error(`❌ Failed to get user wallet for ${userId}:`, error);
    return null;
  }
}

/**
 * Get user's private key from KMS
 */
async function getUserPrivateKey(userId, userWallet) {
  try {
    console.log(`🔍 Getting private key for user: ${userId}`);
    
    const keyParams = {
      TableName: WALLET_KEYS_TABLE,
      FilterExpression: 'user_id = :userId',
      ExpressionAttributeValues: {
        ':userId': { S: userId }
      }
    };

    const keyResult = await dynamodb.send(new ScanCommand(keyParams));
    if (!keyResult.Items || keyResult.Items.length === 0) {
      throw new Error(`No private key found for user ${userId}`);
    }

    const userKey = keyResult.Items[0];
    console.log(`✅ Found key record for user`);
    console.log(`✅ Account ID: ${userKey.account_id?.S}`);
    console.log(`✅ Public key: ${userKey.public_key?.S}`);
    console.log(`✅ KMS key ID: ${userKey.kms_key_id?.S}`);
    
    // Get user's private key from KMS
    let ciphertextBlob;
    const encryptedKey = userKey.encrypted_private_key?.S;
    
    if (encryptedKey.includes(',')) {
      // Comma-separated format: convert to Buffer
      const byteArray = encryptedKey.split(',').map(Number);
      ciphertextBlob = Buffer.from(byteArray);
    } else {
      // Base64 format
      ciphertextBlob = Buffer.from(encryptedKey, 'base64');
    }
    
    const decryptCommand = new DecryptCommand({
      KeyId: userKey.kms_key_id.S,
      CiphertextBlob: ciphertextBlob
    });

    const decryptResult = await kms.send(decryptCommand);
    
    // Parse private key using the same method as the Lambda function
    let privateKey;
    console.log(`🔍 Decrypted plaintext length: ${decryptResult.Plaintext.length} bytes`);
    console.log(`🔍 Decrypted plaintext first 10 bytes: ${Array.from(decryptResult.Plaintext.slice(0, 10)).join(',')}`);
    
    // Convert to base64 for DER parsing (same as Lambda function)
    const privateKeyBase64 = Buffer.from(decryptResult.Plaintext).toString('base64');
    console.log(`🔍 Private key base64 (first 50 chars): ${privateKeyBase64.substring(0, 50)}...`);
    
    // Parse as DER using base64 representation (SAME AS LAMBDA FUNCTION)
    try {
      privateKey = PrivateKey.fromStringDer(privateKeyBase64);
      console.log('✅ SUCCESS: User private key parsed as DER format from base64');
      console.log(`✅ Private key type: ${privateKey.constructor.name}`);
      console.log(`✅ Private key algorithm: ${privateKey.algorithm}`);
    } catch (derError) {
      console.log('⚠️ DER parsing failed, trying alternative methods:', derError.message);
      
      // Fallback: try as raw bytes
      try {
        privateKey = PrivateKey.fromBytes(decryptResult.Plaintext);
        console.log('✅ SUCCESS: User private key parsed from raw bytes (fallback)');
        console.log(`✅ Private key type: ${privateKey.constructor.name}`);
        console.log(`✅ Private key algorithm: ${privateKey.algorithm}`);
      } catch (bytesError) {
        console.error('❌ ERROR: Both DER and raw bytes parsing failed');
        throw new Error(`Private key parsing failed. DER error: ${derError.message}, Bytes error: ${bytesError.message}`);
      }
    }
    
    const accountId = AccountId.fromString(userWallet.hedera_account_id);
    
    return { privateKey, accountId };
    
  } catch (error) {
    console.error('❌ Failed to get user private key:', error);
    throw error;
  }
}

// Run the test
if (require.main === module) {
  testUserKeySigning()
    .then(() => {
      console.log('🔧 Test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testUserKeySigning };
