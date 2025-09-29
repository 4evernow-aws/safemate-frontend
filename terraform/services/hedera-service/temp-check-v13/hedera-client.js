/**
 * SafeMate Hedera Client Utility
 * 
 * Environment: preprod
 * Purpose: Initialize Hedera client with operator credentials from Lambda database
 * 
 * Features:
 * - Live Hedera testnet connection (no mirror sites)
 * - Operator credentials stored in DynamoDB with KMS encryption
 * - Shared utility for all Hedera operations
 * 
 * Last Updated: September 18, 2025
 * Status: Live Hedera testnet integration active
 */

const { Client } = require('@hashgraph/sdk');
const { KMSClient, DecryptCommand } = require('@aws-sdk/client-kms');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');

const kms = new KMSClient({});
const dynamodbClient = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(dynamodbClient);

/**
 * Decrypt private key using KMS
 */
async function decryptPrivateKey(encryptedKey, keyId) {
  try {
    const decryptParams = {
      CiphertextBlob: Buffer.from(encryptedKey, 'base64'),
      KeyId: keyId
    };

    const decryptResult = await kms.send(new DecryptCommand(decryptParams));
    return decryptResult.Plaintext.toString('utf8');
  } catch (error) {
    console.error('❌ Failed to decrypt private key:', error);
    throw new Error('Failed to decrypt key');
  }
}

/**
 * Get operator credentials from environment variables (same as user-onboarding service)
 */
async function getOperatorCredentials() {
  try {
    const OPERATOR_ACCOUNT_ID = process.env.OPERATOR_ACCOUNT_ID || '0.0.6428427';
    const OPERATOR_PRIVATE_KEY_ENCRYPTED = process.env.OPERATOR_PRIVATE_KEY_ENCRYPTED;
    const OPERATOR_PRIVATE_KEY_KMS_KEY_ID = process.env.OPERATOR_PRIVATE_KEY_KMS_KEY_ID || process.env.APP_SECRETS_KMS_KEY_ID;

    if (!OPERATOR_ACCOUNT_ID || !OPERATOR_PRIVATE_KEY_ENCRYPTED) {
      throw new Error('Operator credentials not configured in environment variables');
    }

    if (OPERATOR_PRIVATE_KEY_ENCRYPTED === 'PLACEHOLDER_ENCRYPTED_PRIVATE_KEY') {
      throw new Error('Operator credentials are not configured. Please set up real operator credentials.');
    }

    const decryptCommand = new DecryptCommand({
      KeyId: OPERATOR_PRIVATE_KEY_KMS_KEY_ID,
      CiphertextBlob: Buffer.from(OPERATOR_PRIVATE_KEY_ENCRYPTED, 'base64')
    });

    const decryptResult = await kms.send(decryptCommand);
    
    console.log('✅ Operator credentials retrieved successfully');
    console.log('📋 Plaintext type:', typeof decryptResult.Plaintext);
    console.log('📋 Plaintext length:', decryptResult.Plaintext.length);
    
    // Convert to base64 for DER parsing (KMS returns binary data)
    const privateKeyBase64 = Buffer.from(decryptResult.Plaintext).toString('base64');
    console.log('📋 Private key base64 length:', privateKeyBase64.length);
    console.log('📋 Private key base64 starts with:', privateKeyBase64.substring(0, 20));
    
    return {
      accountId: OPERATOR_ACCOUNT_ID,
      privateKey: privateKeyBase64
    };
  } catch (error) {
    console.error('❌ Failed to get operator credentials:', error);
    throw error;
  }
}

/**
 * Initialize Hedera client with operator credentials
 * This is a shared utility function to eliminate duplication across services
 */
async function initializeHederaClient() {
  try {
    console.log('🔧 Initializing Hedera client...');
    
    // Get environment variables
    const HEDERA_NETWORK = process.env.HEDERA_NETWORK || 'testnet';
    
    console.log(`🔧 Using Hedera network: ${HEDERA_NETWORK}`);
    
    // Get operator credentials from environment variables
    const credentials = await getOperatorCredentials();
    console.log(`🔧 Operator account: ${credentials.accountId}`);
    
    // Parse private key as DER format
    const { PrivateKey, AccountId } = require('@hashgraph/sdk');
    const privateKey = PrivateKey.fromStringDer(credentials.privateKey);
    const accountId = AccountId.fromString(credentials.accountId);
    
    // Create Hedera client
    const client = Client.forName(HEDERA_NETWORK);
    client.setOperator(accountId, privateKey);
    
    console.log('✅ Hedera client initialized successfully');
    return client;
    
  } catch (error) {
    console.error('❌ Failed to initialize Hedera client:', error);
    throw error;
  }
}

module.exports = {
  initializeHederaClient
};
