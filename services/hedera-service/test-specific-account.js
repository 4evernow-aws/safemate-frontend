/**
 * Test Specific Account - Debug INVALID_SIGNATURE Error
 * 
 * This script tests the specific account 0.0.6890393 that's failing
 * with INVALID_SIGNATURE errors in the preprod environment.
 * 
 * Environment: Preprod
 * Purpose: Debug account 0.0.6890393 INVALID_SIGNATURE error
 * 
 * Last Updated: September 29, 2025
 * Status: V47.3 - Signature debugging
 */

const { Client, AccountId, PrivateKey, AccountInfoQuery } = require('@hashgraph/sdk');
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
 * Test specific account 0.0.6890393
 */
async function testSpecificAccount() {
  try {
    console.log('🔧 Testing specific account 0.0.6890393...');
    console.log(`🔧 Network: ${HEDERA_NETWORK}`);
    
    // Find the user who owns account 0.0.6890393
    const accountId = '0.0.6890393';
    console.log(`🔧 Looking for user with account: ${accountId}`);
    
    // Search for wallet with this account ID
    const params = {
      TableName: WALLET_METADATA_TABLE,
      FilterExpression: 'hedera_account_id = :accountId OR account_id = :accountId',
      ExpressionAttributeValues: {
        ':accountId': { S: accountId }
      }
    };

    const result = await dynamodb.send(new ScanCommand(params));
    console.log(`🔍 Found ${result.Items ? result.Items.length : 0} wallet records for account: ${accountId}`);
    
    if (!result.Items || result.Items.length === 0) {
      console.log('❌ No wallet found for account 0.0.6890393');
      return;
    }
    
    const wallet = result.Items[0];
    const userId = wallet.user_id?.S;
    const publicKey = wallet.public_key?.S;
    
    console.log(`✅ Found wallet for account: ${accountId}`);
    console.log(`✅ User ID: ${userId}`);
    console.log(`✅ Public key: ${publicKey}`);
    
    if (!userId) {
      console.log('❌ No user ID found in wallet record');
      return;
    }
    
    // Get user's private key
    const keyParams = {
      TableName: WALLET_KEYS_TABLE,
      FilterExpression: 'user_id = :userId',
      ExpressionAttributeValues: {
        ':userId': { S: userId }
      }
    };

    const keyResult = await dynamodb.send(new ScanCommand(keyParams));
    if (!keyResult.Items || keyResult.Items.length === 0) {
      console.log('❌ No private key found for user');
      return;
    }

    const userKey = keyResult.Items[0];
    console.log(`✅ Found key record for user: ${userId}`);
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
    
    // Verify public key matches
    const derivedPublicKey = privateKey.publicKey;
    console.log(`✅ Derived public key: ${derivedPublicKey.toString()}`);
    console.log(`✅ Stored public key: ${publicKey}`);
    console.log(`✅ Public keys match: ${derivedPublicKey.toString() === publicKey}`);
    
    if (derivedPublicKey.toString() !== publicKey) {
      console.log('❌ CRITICAL: Public key mismatch! This will cause INVALID_SIGNATURE errors.');
      console.log('❌ The private key being used does not correspond to the stored public key.');
      console.log('❌ This means the private key was either:');
      console.log('   1. Corrupted during storage/retrieval');
      console.log('   2. Generated from a different key pair');
      console.log('   3. Parsed incorrectly');
      
      // Check if we can get the account info from Hedera
      console.log('🔧 Checking account info from Hedera network...');
      const client = Client.forName(HEDERA_NETWORK);
      
      try {
        const accountInfo = await new AccountInfoQuery()
          .setAccountId(AccountId.fromString(accountId))
          .execute(client);
        
        console.log(`✅ Account exists on Hedera network`);
        console.log(`✅ Account key: ${accountInfo.key.toString()}`);
        console.log(`✅ Stored key: ${publicKey}`);
        console.log(`✅ Network key matches stored: ${accountInfo.key.toString() === publicKey}`);
        console.log(`✅ Derived key matches network: ${accountInfo.key.toString() === derivedPublicKey.toString()}`);
        
        if (accountInfo.key.toString() === publicKey && accountInfo.key.toString() !== derivedPublicKey.toString()) {
          console.log('❌ CONFIRMED: The private key in KMS does not match the public key on the Hedera network.');
          console.log('❌ This is the root cause of the INVALID_SIGNATURE error.');
        }
        
      } catch (accountError) {
        console.log(`⚠️ Could not get account info from Hedera: ${accountError.message}`);
      }
      
    } else {
      console.log('✅ Public keys match - signing should work correctly');
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

// Run the test
if (require.main === module) {
  testSpecificAccount()
    .then(() => {
      console.log('🔧 Test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testSpecificAccount };
