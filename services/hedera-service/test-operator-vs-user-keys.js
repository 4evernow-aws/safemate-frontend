/**
 * Test Operator vs User Keys - Compare Key Handling
 * 
 * This script compares how the operator's public and private keys work
 * compared to the user's keys to identify the signature issue.
 * 
 * Environment: Preprod
 * Purpose: Debug INVALID_SIGNATURE error by comparing operator vs user key handling
 * 
 * Last Updated: September 29, 2025
 * Status: V47.3 - Signature debugging
 */

const { Client, AccountId, PrivateKey, TokenCreateTransaction, TokenType, Hbar, AccountInfoQuery } = require('@hashgraph/sdk');
const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');
const { KMSClient, DecryptCommand } = require('@aws-sdk/client-kms');

// Environment variables
const HEDERA_NETWORK = process.env.HEDERA_NETWORK || 'testnet';
const OPERATOR_ACCOUNT_ID = process.env.OPERATOR_ACCOUNT_ID || '0.0.6428427';
const OPERATOR_PRIVATE_KEY_KMS_KEY_ID = process.env.OPERATOR_PRIVATE_KEY_KMS_KEY_ID || '3b18b0c0-dd1f-41db-8bac-6ec857c1ed05';
const WALLET_METADATA_TABLE = process.env.WALLET_METADATA_TABLE || 'preprod-safemate-wallet-metadata';
const WALLET_KEYS_TABLE = process.env.WALLET_KEYS_TABLE || 'preprod-safemate-wallet-keys';

// AWS clients
const dynamodb = new DynamoDBClient({ region: 'ap-southeast-2' });
const kms = new KMSClient({ region: 'ap-southeast-2' });

/**
 * Test operator key handling
 */
async function testOperatorKeys() {
  try {
    console.log('🔧 Testing operator key handling...');
    console.log(`🔧 Operator account: ${OPERATOR_ACCOUNT_ID}`);
    console.log(`🔧 KMS key ID: ${OPERATOR_PRIVATE_KEY_KMS_KEY_ID}`);
    
    // Get operator private key from KMS
    const operatorPrivateKey = await getOperatorPrivateKey();
    console.log(`✅ Operator private key retrieved successfully`);
    console.log(`✅ Private key type: ${operatorPrivateKey.constructor.name}`);
    console.log(`✅ Private key algorithm: ${operatorPrivateKey.algorithm}`);
    
    // Get operator public key
    const operatorPublicKey = operatorPrivateKey.publicKey;
    console.log(`✅ Operator public key: ${operatorPublicKey.toString()}`);
    
    // Verify with Hedera network
    const client = Client.forName(HEDERA_NETWORK);
    const accountId = AccountId.fromString(OPERATOR_ACCOUNT_ID);
    
    console.log('🔧 Getting operator account info from Hedera...');
    const accountInfo = await new AccountInfoQuery()
      .setAccountId(accountId)
      .execute(client);
    
    console.log(`✅ Network account key: ${accountInfo.key.toString()}`);
    console.log(`✅ Derived public key: ${operatorPublicKey.toString()}`);
    console.log(`✅ Keys match: ${accountInfo.key.toString() === operatorPublicKey.toString()}`);
    
    if (accountInfo.key.toString() === operatorPublicKey.toString()) {
      console.log('✅ SUCCESS: Operator keys are working correctly!');
      
      // Test operator transaction signing
      console.log('🔧 Testing operator transaction signing...');
      client.setOperator(accountId, operatorPrivateKey);
      
      const testTransaction = new TokenCreateTransaction()
        .setTokenName('Operator Test Token')
        .setTokenSymbol('OPTEST')
        .setTokenType(TokenType.FungibleCommon)
        .setDecimals(0)
        .setInitialSupply(0)
        .setTreasuryAccountId(accountId)
        .setAdminKey(operatorPrivateKey.publicKey)
        .setMaxTransactionFee(new Hbar(1));
      
      testTransaction.freezeWith(client);
      const signedTransaction = await testTransaction.sign(operatorPrivateKey);
      const response = await signedTransaction.execute(client);
      
      console.log('✅ Operator transaction signed and executed successfully');
      console.log(`✅ Transaction ID: ${response.transactionId.toString()}`);
      
      const receipt = await response.getReceipt(client);
      console.log(`✅ Transaction receipt status: ${receipt.status}`);
      
      if (receipt.status.toString() === 'SUCCESS') {
        console.log('🎉 SUCCESS: Operator key signing is working perfectly!');
        return { success: true, key: operatorPrivateKey, accountId };
      } else {
        console.log(`❌ Operator transaction failed with status: ${receipt.status}`);
        return { success: false, error: `Transaction failed: ${receipt.status}` };
      }
    } else {
      console.log('❌ CRITICAL: Operator keys do not match!');
      return { success: false, error: 'Operator key mismatch' };
    }
    
  } catch (error) {
    console.error('❌ Operator key test failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Test user key handling
 */
async function testUserKeys() {
  try {
    console.log('🔧 Testing user key handling...');
    
    // Find a user account to test with
    const params = {
      TableName: WALLET_METADATA_TABLE,
      FilterExpression: 'attribute_exists(hedera_account_id)',
      Limit: 1
    };

    const result = await dynamodb.send(new ScanCommand(params));
    if (!result.Items || result.Items.length === 0) {
      console.log('❌ No user wallets found to test');
      return { success: false, error: 'No user wallets found' };
    }
    
    const wallet = result.Items[0];
    const userId = wallet.user_id?.S;
    const accountId = wallet.hedera_account_id?.S || wallet.account_id?.S;
    const publicKey = wallet.public_key?.S;
    
    console.log(`✅ Testing with user: ${userId}`);
    console.log(`✅ Account: ${accountId}`);
    console.log(`✅ Stored public key: ${publicKey}`);
    
    // Get user's private key
    const userPrivateKey = await getUserPrivateKey(userId);
    console.log(`✅ User private key retrieved successfully`);
    console.log(`✅ Private key type: ${userPrivateKey.constructor.name}`);
    console.log(`✅ Private key algorithm: ${userPrivateKey.algorithm}`);
    
    // Get user public key
    const userPublicKey = userPrivateKey.publicKey;
    console.log(`✅ Derived public key: ${userPublicKey.toString()}`);
    console.log(`✅ Stored public key: ${publicKey}`);
    console.log(`✅ Keys match: ${userPublicKey.toString() === publicKey}`);
    
    if (userPublicKey.toString() !== publicKey) {
      console.log('❌ CRITICAL: User keys do not match!');
      return { success: false, error: 'User key mismatch' };
    }
    
    // Verify with Hedera network
    const client = Client.forName(HEDERA_NETWORK);
    const accountIdObj = AccountId.fromString(accountId);
    
    console.log('🔧 Getting user account info from Hedera...');
    const accountInfo = await new AccountInfoQuery()
      .setAccountId(accountIdObj)
      .execute(client);
    
    console.log(`✅ Network account key: ${accountInfo.key.toString()}`);
    console.log(`✅ Derived public key: ${userPublicKey.toString()}`);
    console.log(`✅ Network key matches derived: ${accountInfo.key.toString() === userPublicKey.toString()}`);
    console.log(`✅ Network key matches stored: ${accountInfo.key.toString() === publicKey}`);
    
    if (accountInfo.key.toString() === userPublicKey.toString()) {
      console.log('✅ SUCCESS: User keys are working correctly!');
      return { success: true, key: userPrivateKey, accountId: accountIdObj };
    } else {
      console.log('❌ CRITICAL: User keys do not match network!');
      return { success: false, error: 'User key network mismatch' };
    }
    
  } catch (error) {
    console.error('❌ User key test failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get operator private key from KMS
 */
async function getOperatorPrivateKey() {
  try {
    console.log('🔍 Getting operator private key from KMS...');
    
    // Get operator private key from KMS (same method as Lambda function)
    const decryptCommand = new DecryptCommand({
      KeyId: OPERATOR_PRIVATE_KEY_KMS_KEY_ID,
      CiphertextBlob: Buffer.from(process.env.OPERATOR_PRIVATE_KEY_ENCRYPTED || '', 'base64')
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
      console.log('✅ SUCCESS: Operator private key parsed as DER format from base64');
      console.log(`✅ Private key type: ${privateKey.constructor.name}`);
      console.log(`✅ Private key algorithm: ${privateKey.algorithm}`);
    } catch (derError) {
      console.log('⚠️ DER parsing failed, trying alternative methods:', derError.message);
      
      // Fallback: try as raw bytes
      try {
        privateKey = PrivateKey.fromBytes(decryptResult.Plaintext);
        console.log('✅ SUCCESS: Operator private key parsed from raw bytes (fallback)');
        console.log(`✅ Private key type: ${privateKey.constructor.name}`);
        console.log(`✅ Private key algorithm: ${privateKey.algorithm}`);
      } catch (bytesError) {
        console.error('❌ ERROR: Both DER and raw bytes parsing failed');
        throw new Error(`Private key parsing failed. DER error: ${derError.message}, Bytes error: ${bytesError.message}`);
      }
    }
    
    return privateKey;
    
  } catch (error) {
    console.error('❌ Failed to get operator private key:', error);
    throw error;
  }
}

/**
 * Get user's private key from KMS
 */
async function getUserPrivateKey(userId) {
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
    
    return privateKey;
    
  } catch (error) {
    console.error('❌ Failed to get user private key:', error);
    throw error;
  }
}

/**
 * Compare operator vs user key handling
 */
async function compareOperatorVsUserKeys() {
  try {
    console.log('🔧 Comparing operator vs user key handling...');
    console.log('=' * 60);
    
    // Test operator keys
    console.log('🔧 TESTING OPERATOR KEYS:');
    console.log('-' * 40);
    const operatorResult = await testOperatorKeys();
    
    console.log('\n🔧 TESTING USER KEYS:');
    console.log('-' * 40);
    const userResult = await testUserKeys();
    
    console.log('\n🔧 COMPARISON RESULTS:');
    console.log('=' * 60);
    console.log(`Operator keys working: ${operatorResult.success ? '✅ YES' : '❌ NO'}`);
    console.log(`User keys working: ${userResult.success ? '✅ YES' : '❌ NO'}`);
    
    if (operatorResult.success && !userResult.success) {
      console.log('❌ ISSUE IDENTIFIED: Operator keys work but user keys do not!');
      console.log('❌ This confirms the problem is in user key handling, not operator key handling.');
      console.log('❌ The issue is likely in how user private keys are stored/retrieved/parsed.');
    } else if (!operatorResult.success && !userResult.success) {
      console.log('❌ ISSUE IDENTIFIED: Both operator and user keys are failing!');
      console.log('❌ This suggests a broader issue with key handling or network connectivity.');
    } else if (operatorResult.success && userResult.success) {
      console.log('✅ Both operator and user keys are working correctly!');
      console.log('✅ The issue might be elsewhere in the transaction flow.');
    }
    
    return { operatorResult, userResult };
    
  } catch (error) {
    console.error('❌ Comparison failed:', error);
    return { error: error.message };
  }
}

// Run the comparison
if (require.main === module) {
  compareOperatorVsUserKeys()
    .then(() => {
      console.log('🔧 Comparison completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Comparison failed:', error);
      process.exit(1);
    });
}

module.exports = { compareOperatorVsUserKeys, testOperatorKeys, testUserKeys };
