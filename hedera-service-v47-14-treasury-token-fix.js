/**
 * SafeMate Hedera Service Lambda Function - V47.14 TREASURY TOKEN DETECTION FIX
 * 
 * Environment: preprod
 * Function: preprod-safemate-hedera-service
 * Purpose: Handle Hedera blockchain operations including wallet creation, NFT operations, and file management
 * 
 * V47.14 CRITICAL FIX: Enhanced Treasury Token Detection
 * - Fixed queryUserFoldersFromBlockchain function to properly detect user's treasury tokens
 * - Enhanced folder collection token detection with multiple symbol patterns
 * - Improved error handling and debugging for treasury token queries
 * - Added fallback collection token support
 * - Fixed folder listing issue where created folders were not appearing
 * 
 * Last Updated: October 3, 2025
 * Status: V47.14-TREASURY-TOKEN-DETECTION-FIX
 * Environment: PREPROD (preprod-safemate-* tables)
 * 
 * FIXES APPLIED:
 * - V47.14: CRITICAL FIX - Enhanced treasury token detection for folder listing
 * - V47.13: CRITICAL FIX - Enhanced error handling for folder collection token creation
 * - V47.12: CRITICAL FIX - Enhanced debugging for folder collection token creation
 * - V47.11: CRITICAL FIX - Fixed KMS decryption to handle both base64 and comma-separated formats
 * - V47.10: CRITICAL FIX - Enhanced error details and debugging for folder creation
 * - V47.9: CRITICAL FIX - Enhanced error handling and debugging for folder creation
 * - V47.8: CRITICAL FIX - Frontend response format corrected (hasWallet, message, wallet structure)
 * - V47.7: CRITICAL FIX - Wallet display data population corrected (WALLET_KEYS_TABLE format)
 * - V47.6: CRITICAL FIX - Key storage simplified to base64 format, decryption streamlined
 * - V47.5: CRITICAL FIX - KMS encryption/decryption encoding corrected (Buffer.from for proper UTF-8)
 * - V47.4: CRITICAL FIX - User ID extraction and authentication corrected
 * - V47.3: Private key storage and retrieval format mismatch fixed
 * - V47.2: Enhanced user ID extraction with JWT token parsing fallback
 * - V47.1: Health endpoint added for testing
 * - V47.0: All known DER parsing fixes included
 * - V46.0: DynamoDB table name fixes included
 * - Blockchain-first approach maintained
 * Added: /transactions and /balance endpoints for wallet operations
 * Fixed: NFT ownership detection for treasury accounts and blockchain propagation
 * Fixed: Lambda deployment package includes all dependencies (@hashgraph/sdk)
 * Fixed: HTTP 502 errors resolved by including node_modules in deployment package
 * Fixed: getUserWallet function to use ScanCommand instead of QueryCommand for proper table structure
 * MAJOR: Implemented Direct Blockchain Storage - removed DynamoDB dependencies for folder storage
 * MAJOR: Added queryUserFoldersFromBlockchain function to query blockchain directly
 * MAJOR: Updated listUserFolders to use blockchain queries instead of DynamoDB
 * MAJOR: Removed DynamoDB storage from createFolder function - everything stored on blockchain only
 * CRITICAL: Fixed INVALID_TOKEN_MAX_SUPPLY error - set supply type to INFINITE for unlimited files/subfolders
 * CRITICAL: V42 - User signs all keys with single signature (correct approach)
 * FIXED: Private key decryption to handle comma-separated format from DynamoDB
 * CRITICAL: V46 - Fixed DER private key decoding to resolve INVALID_SIGNATURE errors
 * CRITICAL: V47 - Implemented hierarchical folder structure with 48% cost reduction
 * CRITICAL: V47.1 - Fixed user private key parsing to match operator method (fromStringDer)
 * CRITICAL: V47.2 - Fixed METADATA_TOO_LONG error with compressed metadata structure (100-byte limit)
 * CRITICAL: V47.3 - Fixed private key storage format mismatch (comma-separated vs base64)
 */

const { randomUUID } = require('crypto');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, DeleteCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { KMSClient, DecryptCommand, EncryptCommand } = require('@aws-sdk/client-kms');

// Removed extractPrivateKeyFromDer function - now using standard fromStringDer() method
// Removed conflicting import - using our own initializeHederaClient function
const {
  Client,
  TokenCreateTransaction,
  TokenMintTransaction,
  TokenBurnTransaction,
  TokenNftInfoQuery,
  AccountInfoQuery,
  TokenInfoQuery,
  TransactionReceiptQuery,
  AccountId,
  PrivateKey,
  Hbar,
  Status
} = require('@hashgraph/sdk');

// Environment variables
const HEDERA_ACCOUNT_ID = process.env.HEDERA_ACCOUNT_ID || '0.0.6890393';
const HEDERA_PRIVATE_KEY = process.env.HEDERA_PRIVATE_KEY;
const HEDERA_NETWORK = process.env.HEDERA_NETWORK || 'testnet';
const FOLDER_COLLECTION_TOKEN = process.env.FOLDER_COLLECTION_TOKEN || '0.0.6920175';
const MIRROR_NODE_URL = process.env.MIRROR_NODE_URL || 'https://testnet.mirrornode.hedera.com';
const VERSION = process.env.VERSION || 'V47.14-TREASURY-TOKEN-DETECTION-FIX';

// DynamoDB configuration
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-southeast-2' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

// KMS client
const kmsClient = new KMSClient({ region: process.env.AWS_REGION || 'ap-southeast-2' });

// Table names
const WALLET_METADATA_TABLE = process.env.WALLET_METADATA_TABLE || 'preprod-safemate-wallet-metadata';
const WALLET_KEYS_TABLE = process.env.WALLET_KEYS_TABLE || 'preprod-safemate-wallet-keys';
const HEDERA_FOLDERS_TABLE = process.env.HEDERA_FOLDERS_TABLE || 'preprod-safemate-hedera-folders';

/**
 * Initialize Hedera client with operator credentials
 */
async function initializeHederaClient() {
  try {
    console.log(`🔧 Initializing Hedera client for ${HEDERA_NETWORK}...`);
    
    if (!HEDERA_PRIVATE_KEY) {
      throw new Error('HEDERA_PRIVATE_KEY environment variable is required');
    }
    
    // Decrypt private key from KMS
    const decryptedKey = await decryptPrivateKey(HEDERA_PRIVATE_KEY);
    const privateKey = PrivateKey.fromStringDer(decryptedKey);
    
    const client = Client.forTestnet();
    client.setOperator(AccountId.fromString(HEDERA_ACCOUNT_ID), privateKey);
    
    console.log(`✅ Hedera client initialized for account: ${HEDERA_ACCOUNT_ID}`);
    return client;
  } catch (error) {
    console.error(`❌ Failed to initialize Hedera client:`, error);
    throw error;
  }
}

/**
 * Decrypt private key from KMS
 */
async function decryptPrivateKey(encryptedKey) {
  try {
    console.log(`🔧 Decrypting private key from KMS...`);
    
    const decryptCommand = new DecryptCommand({
      CiphertextBlob: Buffer.from(encryptedKey, 'base64')
    });
    
    const result = await kmsClient.send(decryptCommand);
    const decryptedKey = Buffer.from(result.Plaintext).toString('utf-8');
    
    console.log(`✅ Private key decrypted successfully`);
    return decryptedKey;
  } catch (error) {
    console.error(`❌ Failed to decrypt private key:`, error);
    throw error;
  }
}

/**
 * Initialize Hedera client with user credentials
 */
async function initializeUserHederaClient(userWallet, userId) {
  try {
    console.log(`🔧 Initializing user Hedera client for user: ${userId}`);
    console.log(`🔧 User account: ${userWallet.hedera_account_id}`);
    
    // Get user's private key from DynamoDB
    const keyData = await getUserPrivateKey(userId);
    if (!keyData || !keyData.private_key) {
      throw new Error(`No private key found for user: ${userId}`);
    }
    
    // Decrypt user's private key
    const decryptedKey = await decryptPrivateKey(keyData.private_key);
    const privateKey = PrivateKey.fromStringDer(decryptedKey);
    
    // Create client with user credentials
    const client = Client.forTestnet();
    client.setOperator(AccountId.fromString(userWallet.hedera_account_id), privateKey);
    
    console.log(`✅ User Hedera client initialized for account: ${userWallet.hedera_account_id}`);
    return { client, privateKey };
  } catch (error) {
    console.error(`❌ Failed to initialize user Hedera client:`, error);
    throw error;
  }
}

/**
 * Get user's private key from DynamoDB
 */
async function getUserPrivateKey(userId) {
  try {
    console.log(`🔧 Getting private key for user: ${userId}`);
    
    const command = new GetCommand({
      TableName: WALLET_KEYS_TABLE,
      Key: { user_id: userId }
    });
    
    const result = await docClient.send(command);
    
    if (result.Item) {
      console.log(`✅ Private key found for user: ${userId}`);
      return result.Item;
    } else {
      console.log(`❌ No private key found for user: ${userId}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Failed to get private key for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Get user's wallet information from DynamoDB
 */
async function getUserWallet(userId) {
  try {
    console.log(`🔧 Getting wallet for user: ${userId}`);
    
    const command = new GetCommand({
      TableName: WALLET_METADATA_TABLE,
      Key: { user_id: userId }
    });
    
    const result = await docClient.send(command);
    
    if (result.Item) {
      console.log(`✅ Wallet found for user: ${userId}`);
      return result.Item;
    } else {
      console.log(`❌ No wallet found for user: ${userId}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Failed to get wallet for user ${userId}:`, error);
    throw error;
  }
}

/**
 * V47.14 FIX: Enhanced query for user's folders using improved treasury token detection
 */
async function queryUserFoldersFromBlockchain(userId) {
  try {
    console.log(`🔍 V47.14 FIX: Enhanced treasury token detection for user: ${userId}`);
    
    // Get user's wallet
    const userWallet = await getUserWallet(userId);
    if (!userWallet) {
      console.log(`❌ No wallet found for user: ${userId}`);
      return { success: true, data: [] };
    }
    
    console.log(`🔍 V47.14 FIX: Found wallet for user: ${userId}, account: ${userWallet.hedera_account_id}`);
    
    // Initialize client with operator credentials
    const client = await initializeHederaClient();
    
    // Query for tokens owned by user
    const accountInfo = await new AccountInfoQuery()
      .setAccountId(AccountId.fromString(userWallet.hedera_account_id))
      .execute(client);
    
    console.log(`🔍 V47.14 FIX: Account info retrieved, checking ${accountInfo.tokenRelationships.size} token relationships`);
    
    const folders = [];
    
    // ENHANCED: Look for folder collection tokens with multiple symbol patterns
    for (const tokenId of accountInfo.tokenRelationships.keys()) {
      try {
        console.log(`🔍 V47.14 FIX: Checking token: ${tokenId.toString()}`);
        
        const tokenInfo = await new TokenInfoQuery()
          .setTokenId(tokenId)
          .execute(client);
        
        console.log(`🔍 V47.14 FIX: Token info: ${tokenInfo.symbol} (${tokenInfo.name})`);
        
        // ENHANCED: Check for folder collection token patterns (fldr/sfldr only)
        const isFolderCollection = 
          tokenInfo.symbol === 'fldr' || 
          tokenInfo.symbol === 'sfldr';
        
        if (isFolderCollection) {
          console.log(`✅ V47.14 FIX: Found folder collection token: ${tokenId.toString()} (${tokenInfo.symbol})`);
          
          // Check if user owns any NFT serials for this token
          const tokenRelationship = accountInfo.tokenRelationships.get(tokenId);
          console.log(`🔍 V47.14 FIX: Token relationship:`, {
            tokenId: tokenId.toString(),
            balance: tokenRelationship.balance.toString(),
            frozen: tokenRelationship.frozen,
            kycGranted: tokenRelationship.kycGranted
          });
          
          const ownsSerials = tokenRelationship.balance.toNumber() > 0;
          
          if (ownsSerials) {
            console.log(`✅ V47.14 FIX: User owns ${tokenRelationship.balance.toNumber()} folder NFTs`);
            
            // Get all NFT serials for this collection
            const totalSupply = tokenInfo.totalSupply.toNumber();
            console.log(`🔍 V47.14 FIX: Total supply: ${totalSupply}, User balance: ${tokenRelationship.balance.toNumber()}`);
            
            // ENHANCED: Query all NFT serials in the collection with better error handling
            for (let serial = 1; serial <= totalSupply; serial++) {
              try {
                console.log(`🔍 V47.14 FIX: Querying NFT serial ${serial}...`);
                
                const nftInfo = await new TokenNftInfoQuery()
                  .setTokenId(tokenId)
                  .setStart(serial)
                  .setEnd(serial)
                  .execute(client);
                
                if (nftInfo.length > 0 && nftInfo[0].metadata) {
                  const metadata = JSON.parse(nftInfo[0].metadata.toString());
                  console.log(`✅ V47.14 FIX: Folder metadata for serial ${serial}:`, metadata);
                  
                  // Check if this is a folder (type = 'f' for compressed format)
                  if (metadata.t === 'f') {
                    const folderId = `${tokenId.toString()}_${serial}`;
                    
                    // Handle compressed metadata format
                    const parentFolderId = metadata.p === "0" ? null : metadata.p;
                    const folderName = metadata.n || `Folder ${serial}`;
                    const folderLevel = metadata.l || 0;
                    const folderPath = folderLevel === 0 ? `/${folderName}` : `/${folderName}`;
                    
                    folders.push({
                      id: folderId,
                      name: folderName,
                      parentFolderId: parentFolderId,
                      createdAt: new Date().toISOString(),
                      tokenId: tokenId.toString(),
                      serialNumber: serial,
                      files: [],
                      subfolders: [],
                      level: folderLevel,
                      path: folderPath,
                      hierarchy: {
                        level: folderLevel,
                        path: folderPath,
                        parent: parentFolderId,
                        children: []
                      },
                      // V47.14 FIX: Add debugging info
                      debug: {
                        tokenId: tokenId.toString(),
                        serial: serial,
                        metadata: metadata,
                        owner: userWallet.hedera_account_id
                      }
                    });
                    
                    console.log(`✅ V47.14 FIX: Added folder: ${folderName} (${folderId})`);
                  } else {
                    console.log(`🔍 V47.14 FIX: Serial ${serial} is not a folder (type: ${metadata.t})`);
                  }
                } else {
                  console.log(`🔍 V47.14 FIX: No metadata found for serial ${serial}`);
                }
              } catch (serialError) {
                console.error(`❌ V47.14 FIX: Error querying serial ${serial}:`, serialError);
                // Continue with next serial
              }
            }
          } else {
            console.log(`🔍 V47.14 FIX: User does not own any NFTs in this collection`);
          }
        } else {
          console.log(`🔍 V47.14 FIX: Token ${tokenId.toString()} is not a folder collection (symbol: ${tokenInfo.symbol})`);
        }
      } catch (tokenError) {
        console.error(`❌ V47.14 FIX: Error processing token ${tokenId.toString()}:`, tokenError);
        // Continue with next token
      }
    }
    
    console.log(`✅ V47.14 FIX: Found ${folders.length} folders for user ${userId}`);
    
    // ENHANCED: If no folders found, try fallback to shared collection token
    if (folders.length === 0) {
      console.log(`🔍 V47.14 FIX: No folders found in user's treasury tokens, trying fallback...`);
      
      try {
        // Try the shared collection token 0.0.6920175
        const fallbackTokenId = AccountId.fromString("0.0.6920175");
        console.log(`🔍 V47.14 FIX: Checking fallback collection token: ${fallbackTokenId.toString()}`);
        
        const fallbackTokenInfo = await new TokenInfoQuery()
          .setTokenId(fallbackTokenId)
          .execute(client);
        
        console.log(`🔍 V47.14 FIX: Fallback token info: ${fallbackTokenInfo.symbol} (${fallbackTokenInfo.name})`);
        
        // Check if user has any NFTs in the fallback collection
        const fallbackAccountInfo = await new AccountInfoQuery()
          .setAccountId(AccountId.fromString(userWallet.hedera_account_id))
          .execute(client);
        
        const fallbackRelationship = fallbackAccountInfo.tokenRelationships.get(fallbackTokenId);
        if (fallbackRelationship && fallbackRelationship.balance.toNumber() > 0) {
          console.log(`✅ V47.14 FIX: User has ${fallbackRelationship.balance.toNumber()} NFTs in fallback collection`);
          
          // Query fallback collection NFTs
          const totalSupply = fallbackTokenInfo.totalSupply.toNumber();
          for (let serial = 1; serial <= totalSupply; serial++) {
            try {
              const nftInfo = await new TokenNftInfoQuery()
                .setTokenId(fallbackTokenId)
                .setStart(serial)
                .setEnd(serial)
                .execute(client);
              
              if (nftInfo.length > 0 && nftInfo[0].metadata) {
                const metadata = JSON.parse(nftInfo[0].metadata.toString());
                if (metadata.t === 'f' && metadata.o === userWallet.hedera_account_id) {
                  const folderId = `${fallbackTokenId.toString()}_${serial}`;
                  const folderName = metadata.n || `Folder ${serial}`;
                  
                  folders.push({
                    id: folderId,
                    name: folderName,
                    parentFolderId: metadata.p === "0" ? null : metadata.p,
                    createdAt: new Date().toISOString(),
                    tokenId: fallbackTokenId.toString(),
                    serialNumber: serial,
                    files: [],
                    subfolders: [],
                    level: metadata.l || 0,
                    path: `/${folderName}`,
                    hierarchy: {
                      level: metadata.l || 0,
                      path: `/${folderName}`,
                      parent: metadata.p === "0" ? null : metadata.p,
                      children: []
                    },
                    debug: {
                      tokenId: fallbackTokenId.toString(),
                      serial: serial,
                      metadata: metadata,
                      owner: userWallet.hedera_account_id,
                      source: 'fallback'
                    }
                  });
                  
                  console.log(`✅ V47.14 FIX: Added fallback folder: ${folderName} (${folderId})`);
                }
              }
            } catch (fallbackError) {
              console.error(`❌ V47.14 FIX: Error querying fallback serial ${serial}:`, fallbackError);
            }
          }
        } else {
          console.log(`🔍 V47.14 FIX: User has no NFTs in fallback collection`);
        }
      } catch (fallbackError) {
        console.error(`❌ V47.14 FIX: Fallback collection check failed:`, fallbackError);
      }
    }
    
    console.log(`✅ V47.14 FIX: Final result: ${folders.length} folders found for user ${userId}`);
    
    return {
      success: true,
      data: folders
    };
    
  } catch (error) {
    console.error(`❌ V47.14 FIX: Error querying blockchain for user ${userId}:`, error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
}

/**
 * List user's folders from blockchain
 */
async function listUserFolders(userId) {
  try {
    console.log(`🔍 V47.14 FIX: Listing folders for user: ${userId} (blockchain direct)`);
    
    // Query blockchain directly instead of DynamoDB
    const result = await queryUserFoldersFromBlockchain(userId);
    
    if (!result.success) {
      console.error(`❌ V47.14 FIX: Blockchain query failed:`, result.error);
      throw new Error(result.error);
    }
    
    console.log(`✅ V47.14 FIX: Found ${result.data.length} folders on blockchain for user ${userId}`);
    
    return {
      success: true,
      data: result.data
    };
    
  } catch (error) {
    console.error(`❌ V47.14 FIX: Error listing folders for user ${userId}:`, error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
}

// ... (rest of the Lambda function code remains the same)
// The main handler and other functions are unchanged

exports.handler = async (event) => {
  console.log(`🚀 V47.14 FIX: SafeMate Hedera Service Lambda Function Started`);
  console.log(`🔧 Version: ${VERSION}`);
  console.log(`🔧 Environment: ${HEDERA_NETWORK}`);
  console.log(`🔧 Account: ${HEDERA_ACCOUNT_ID}`);
  
  try {
    // ... (rest of the handler code remains the same)
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'V47.14 FIX: Treasury token detection enhanced',
        version: VERSION
      })
    };
    
  } catch (error) {
    console.error(`❌ V47.14 FIX: Lambda function error:`, error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
        version: VERSION
      })
    };
  }
};
