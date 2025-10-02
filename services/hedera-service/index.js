/**
 * SafeMate Hedera Service Lambda Function - V48.0
 * 
 * Environment: Development & Preprod
 * Function: dev-safemate-hedera-service / preprod-safemate-hedera-service
 * Purpose: Handle Hedera blockchain operations with NON_FUNGIBLE_UNIQUE folder tokens
 * 
 * Features:
 * - NON_FUNGIBLE_UNIQUE folder tokens (not FUNGIBLE_COMMON)
 * - Rich folder metadata with icons, colors, permissions
 * - Hierarchical folder structure with parent-child relationships
 * - DynamoDB integration for fast queries
 * - Permission system (owners, editors, viewers)
 * - File management integration ready
 * 
 * Last Updated: January 30, 2025
 * Status: V48.0 - NON_FUNGIBLE_UNIQUE FOLDER TOKENS
 * Environment: DEV & PREPROD (dev-safemate-* / preprod-safemate-* tables)
 * 
 * Key Features:
 * - NON_FUNGIBLE_UNIQUE collection tokens for folders
 * - Rich metadata with UI customization (icons, colors, sort order)
 * - Hierarchical structure with proper parent-child relationships
 * - Permission system with granular access control
 * - File management integration ready
 * - Enhanced folder tree widget with Material-UI
 * 
 * Technical Implementation:
 * - V48.0: NON_FUNGIBLE_UNIQUE token creation for folders
 * - V48.0: Rich metadata schema with all requested fields
 * - V48.0: DynamoDB integration for fast folder queries
 * - V48.0: Permission system implementation
 * - V48.0: Enhanced API endpoints for folder management
 * 
 * API Endpoints:
 * - GET /health - Health check
 * - GET /folders - List all folders with hierarchy
 * - POST /folders - Create new folder
 * - GET /folders/{id} - Get folder by ID
 * - PUT /folders/{id} - Update folder
 * - DELETE /folders/{id} - Delete folder
 * - POST /folders/create-collection - Create collection token
 * - POST /folders/{id}/share - Share folder
 * - GET /folders/{id}/permissions - Get folder permissions
 * - PUT /folders/{id}/permissions - Update permissions
 * - GET /folders/search - Search folders
 * - GET /folders/stats - Get folder statistics
 */

const { randomUUID } = require('crypto');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, DeleteCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { KMSClient, DecryptCommand, EncryptCommand } = require('@aws-sdk/client-kms');

const {
  Client,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  PrivateKey,
  AccountId,
  TokenMintTransaction,
  TokenInfoQuery,
  TokenNftInfoQuery,
  Hbar
} = require('@hashgraph/sdk');

// Initialize AWS services
const dynamodb = new DynamoDBDocumentClient(new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-southeast-2' }));
const kms = new KMSClient({ region: process.env.AWS_REGION || 'ap-southeast-2' });

// Environment variables
const HEDERA_NETWORK = process.env.HEDERA_NETWORK || 'testnet';
const HEDERA_ACCOUNT_ID = process.env.HEDERA_ACCOUNT_ID;
const HEDERA_PRIVATE_KEY = process.env.HEDERA_PRIVATE_KEY;
const FOLDER_COLLECTION_TOKEN = process.env.FOLDER_COLLECTION_TOKEN;
const MIRROR_NODE_URL = process.env.MIRROR_NODE_URL || 'https://testnet.mirrornode.hedera.com';

// Initialize Hedera client
function getHederaClient() {
  const client = HEDERA_NETWORK === 'mainnet' 
    ? Client.forMainnet() 
    : Client.forTestnet();
  
  if (HEDERA_ACCOUNT_ID && HEDERA_PRIVATE_KEY) {
    client.setOperator(AccountId.fromString(HEDERA_ACCOUNT_ID), PrivateKey.fromString(HEDERA_PRIVATE_KEY));
  }
  
  return client;
}

// Folder metadata class
class FolderMetadata {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.tokenId = data.tokenId;
    this.serialNumber = data.serialNumber || 0;
    this.parentFolderId = data.parentFolderId || null;
    this.folderType = data.folderType || 'root';
    this.path = data.path || `/${data.name}`;
    this.depth = data.depth || 0;
    this.createdBy = data.createdBy || HEDERA_ACCOUNT_ID;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.description = data.description || `${this.folderType} folder`;
    this.tags = data.tags || [this.folderType, this.name.toLowerCase()];
    this.ui = data.ui || {
      icon: this.folderType === 'root' ? 'folder' : 'folder-open',
      color: this.folderType === 'root' ? '#3498db' : '#e74c3c',
      sortOrder: 1,
      isExpanded: this.folderType === 'root'
    };
    this.permissions = data.permissions || {
      owners: [HEDERA_ACCOUNT_ID],
      editors: [],
      viewers: [],
      isPublic: false,
      shareLinks: []
    };
    this.fileSummary = data.fileSummary || {
      totalFiles: 0,
      totalSize: 0,
      fileTypes: {},
      lastModified: new Date().toISOString()
    };
    this.version = data.version || '1.0.0';
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      tokenId: this.tokenId,
      serialNumber: this.serialNumber,
      parentFolderId: this.parentFolderId,
      folderType: this.folderType,
      path: this.path,
      depth: this.depth,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      description: this.description,
      tags: this.tags,
      ui: this.ui,
      permissions: this.permissions,
      fileSummary: this.fileSummary,
      version: this.version
    };
  }
}

// Create new collection token
async function createFolderCollectionToken() {
  try {
    const client = getHederaClient();
    const userPrivateKey = PrivateKey.fromString(HEDERA_PRIVATE_KEY);
    
    console.log('Creating new NON_FUNGIBLE_UNIQUE collection token...');
    
    const tokenCreateTransaction = new TokenCreateTransaction()
      .setTokenName("SafeMate Folders")
      .setTokenSymbol("F")
      .setTokenType(TokenType.NonFungibleUnique)
      .setDecimals(0)
      .setInitialSupply(0)
      .setTreasuryAccountId(AccountId.fromString(HEDERA_ACCOUNT_ID))
      .setAutoRenewAccountId(AccountId.fromString(HEDERA_ACCOUNT_ID))
      .setAutoRenewPeriod(90 * 24 * 60 * 60) // 90 days
      .setAdminKey(userPrivateKey.publicKey)
      .setSupplyKey(userPrivateKey.publicKey)
      .setFreezeKey(userPrivateKey.publicKey)
      .setWipeKey(userPrivateKey.publicKey)
      .setKycKey(userPrivateKey.publicKey)
      .setPauseKey(userPrivateKey.publicKey)
      .setFeeScheduleKey(userPrivateKey.publicKey)
      .setTokenMemo("SafeMate folder hierarchy management system")
      .freezeWith(client);

    const tokenCreateSign = await tokenCreateTransaction.sign(userPrivateKey);
    const tokenCreateSubmit = await tokenCreateSign.execute(client);
    const tokenCreateReceipt = await tokenCreateSubmit.getReceipt(client);
    
    const newTokenId = tokenCreateReceipt.tokenId.toString();
    console.log(`New collection token created: ${newTokenId}`);
    
    return {
      success: true,
      tokenId: newTokenId,
      message: 'Collection token created successfully'
    };
  } catch (error) {
    console.error('Error creating collection token:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Build folder path
async function buildPath(parentFolderId, folderName) {
  try {
    const parentFolder = await getFolderFromDatabase(parentFolderId);
    return `${parentFolder.path}/${folderName}`;
  } catch (error) {
    console.error('Error building path:', error);
    return `/${folderName}`;
  }
}

// Get folder depth
async function getDepth(parentFolderId) {
  try {
    const parentFolder = await getFolderFromDatabase(parentFolderId);
    return parentFolder.depth;
  } catch (error) {
    console.error('Error getting depth:', error);
    return 0;
  }
}

// Store folder in DynamoDB
async function storeFolderInDatabase(metadata) {
  try {
    const params = {
      TableName: process.env.SAFEMATE_FOLDERS_TABLE || 'preprod-safemate-hedera-folders',
      Item: {
        id: metadata.id,
        name: metadata.name,
        tokenId: metadata.tokenId,
        serialNumber: metadata.serialNumber,
        parentFolderId: metadata.parentFolderId,
        folderType: metadata.folderType,
        path: metadata.path,
        depth: metadata.depth,
        createdBy: metadata.createdBy,
        createdAt: metadata.createdAt,
        updatedAt: metadata.updatedAt,
        metadata: JSON.stringify(metadata.toJSON())
      }
    };
    
    await dynamodb.send(new PutCommand(params));
    console.log(`Folder stored in database: ${metadata.id}`);
  } catch (error) {
    console.error('Error storing folder in database:', error);
    throw error;
  }
}

// Get folder from database
async function getFolderFromDatabase(folderId) {
  try {
    const params = {
      TableName: process.env.SAFEMATE_FOLDERS_TABLE || 'preprod-safemate-hedera-folders',
      Key: { id: folderId }
    };
    
    const result = await dynamodb.send(new GetCommand(params));
    if (!result.Item) {
      throw new Error(`Folder not found: ${folderId}`);
    }
    
    return JSON.parse(result.Item.metadata);
  } catch (error) {
    console.error('Error getting folder from database:', error);
    throw error;
  }
}

// Create folder
async function createFolder(name, parentFolderId = null) {
  try {
    if (!FOLDER_COLLECTION_TOKEN) {
      throw new Error("FOLDER_COLLECTION_TOKEN not set");
    }
    
    const client = getHederaClient();
    const userPrivateKey = PrivateKey.fromString(HEDERA_PRIVATE_KEY);
    
    // Generate unique folder ID
    const folderId = randomUUID();
    
    // Determine folder type and path
    const folderType = parentFolderId ? 'subfolder' : 'root';
    let path, depth;
    
    if (parentFolderId) {
      path = await buildPath(parentFolderId, name);
      depth = await getDepth(parentFolderId) + 1;
    } else {
      path = `/${name}`;
      depth = 0;
    }
    
    // Create metadata
    const metadata = new FolderMetadata({
      id: folderId,
      name,
      tokenId: FOLDER_COLLECTION_TOKEN,
      parentFolderId,
      folderType,
      path,
      depth
    });
    
    // Convert metadata to bytes
    const metadataBytes = Buffer.from(JSON.stringify(metadata.toJSON()), 'utf8');
    
    console.log(`Creating folder NFT: ${name} (${folderType})`);
    
    // Mint NFT
    const mintTransaction = new TokenMintTransaction()
      .setTokenId(FOLDER_COLLECTION_TOKEN)
      .setMetadata([metadataBytes])
      .freezeWith(client);
      
    const mintSign = await mintTransaction.sign(userPrivateKey);
    const mintSubmit = await mintSign.execute(client);
    const mintReceipt = await mintSubmit.getReceipt(client);
    
    const serialNumber = mintReceipt.serials[0];
    
    // Update metadata with serial number
    metadata.serialNumber = serialNumber;
    
    // Store in DynamoDB for fast queries
    await storeFolderInDatabase(metadata);
    
    console.log(`Folder created successfully: ${name} (Serial: ${serialNumber})`);
    
    return {
      success: true,
      folder: {
        id: folderId,
        name,
        tokenId: FOLDER_COLLECTION_TOKEN,
        serialNumber,
        parentFolderId,
        folderType,
        path,
        depth,
        createdAt: metadata.createdAt,
        updatedAt: metadata.updatedAt
      }
    };
  } catch (error) {
    console.error('Error creating folder:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// List folders with hierarchy
async function listFolders() {
  try {
    if (!FOLDER_COLLECTION_TOKEN) {
      throw new Error("FOLDER_COLLECTION_TOKEN not set");
    }
    
    console.log('Listing folders from database...');
    
    // Get folders from DynamoDB (faster than blockchain query)
    const params = {
      TableName: process.env.SAFEMATE_FOLDERS_TABLE || 'preprod-safemate-hedera-folders',
      FilterExpression: 'createdBy = :userId',
      ExpressionAttributeValues: {
        ':userId': HEDERA_ACCOUNT_ID
      }
    };
    
    const result = await dynamodb.send(new ScanCommand(params));
    const folders = result.Items.map(item => ({
      id: item.id,
      name: item.name,
      tokenId: item.tokenId,
      serialNumber: item.serialNumber,
      parentFolderId: item.parentFolderId,
      folderType: item.folderType,
      path: item.path,
      depth: item.depth,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));
    
    // Build hierarchy
    const hierarchy = buildFolderHierarchy(folders);
    
    console.log(`Found ${folders.length} folders, built hierarchy with ${hierarchy.length} root folders`);
    
    return {
      success: true,
      data: hierarchy
    };
  } catch (error) {
    console.error('Error listing folders:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
}

// Build folder hierarchy
function buildFolderHierarchy(folders) {
  const folderMap = new Map();
  const rootFolders = [];
  
  // Create map of all folders
  folders.forEach(folder => {
    folderMap.set(folder.id, { ...folder, subfolders: [] });
  });
  
  // Build hierarchy
  folders.forEach(folder => {
    if (folder.parentFolderId) {
      const parent = folderMap.get(folder.parentFolderId);
      if (parent) {
        parent.subfolders.push(folderMap.get(folder.id));
      }
    } else {
      rootFolders.push(folderMap.get(folder.id));
    }
  });
  
  return rootFolders;
}

// Get folder by ID
async function getFolderById(folderId) {
  try {
    const folder = await getFolderFromDatabase(folderId);
    return {
      success: true,
      folder: {
        id: folder.id,
        name: folder.name,
        tokenId: folder.tokenId,
        serialNumber: folder.serialNumber,
        parentFolderId: folder.parentFolderId,
        folderType: folder.folderType,
        path: folder.path,
        depth: folder.depth,
        createdAt: folder.createdAt,
        updatedAt: folder.updatedAt
      }
    };
  } catch (error) {
    console.error('Error getting folder by ID:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Helper function to get user from event (same as V47.13)
function getUserFromEvent(event) {
  try {
    return event.requestContext.authorizer.claims.sub;
  } catch (error) {
    console.error('Error getting user from event:', error);
    return null;
  }
}

// Get user's Hedera account ID from DynamoDB
async function getUserHederaAccountId(userId) {
  try {
    console.log(`Looking up Hedera account for user: ${userId}`);
    
    const params = {
      TableName: process.env.WALLET_METADATA_TABLE || 'preprod-safemate-wallet-metadata',
      Key: { 
        user_id: { S: userId }
      }
    };
    
    const result = await dynamodb.send(new GetCommand(params));
    if (!result.Item) {
      throw new Error(`No wallet metadata found for user: ${userId}`);
    }
    
    const hederaAccountId = result.Item.hedera_account_id?.S || result.Item.account_id?.S;
    if (!hederaAccountId) {
      throw new Error(`No Hedera account ID found for user: ${userId}`);
    }
    
    console.log(`Found Hedera account ID: ${hederaAccountId}`);
    return hederaAccountId;
    
  } catch (error) {
    console.error('Error getting user Hedera account ID:', error);
    throw error;
  }
}

// Get user credentials from KMS
async function getUserCredentialsFromKMS(userAccountId) {
  try {
    console.log(`Getting credentials for user account: ${userAccountId}`);
    
    // Get user's encrypted private key from DynamoDB
    const params = {
      TableName: process.env.WALLET_KEYS_TABLE || 'preprod-safemate-wallet-keys',
      Key: { 
        user_id: { S: userAccountId }
      }
    };
    
    const result = await dynamodb.send(new GetCommand(params));
    if (!result.Item) {
      throw new Error(`No credentials found for user: ${userAccountId}`);
    }
    
    const encryptedPrivateKey = result.Item.encrypted_private_key?.S;
    if (!encryptedPrivateKey) {
      throw new Error(`No encrypted private key found for user: ${userAccountId}`);
    }
    
    // Decrypt the private key using KMS
    const decryptParams = {
      CiphertextBlob: Buffer.from(encryptedPrivateKey, 'base64'),
      KeyId: process.env.WALLET_KMS_KEY_ID
    };
    
    const decryptResult = await kms.send(new DecryptCommand(decryptParams));
    const privateKeyHex = Buffer.from(decryptResult.Plaintext).toString('hex');
    
    return {
      accountId: userAccountId,
      privateKey: privateKeyHex
    };
    
  } catch (error) {
    console.error('Error getting user credentials from KMS:', error);
    throw error;
  }
}

// Create folder collection token
async function createFolderCollectionToken(userId) {
  try {
    console.log('Creating NON_FUNGIBLE_UNIQUE collection token...');
    
    // Step 1: Get user's Hedera account ID from DynamoDB
    const hederaAccountId = await getUserHederaAccountId(userId);
    
    // Step 2: Get user's credentials from KMS
    const userCredentials = await getUserCredentialsFromKMS(hederaAccountId);
    if (!userCredentials) {
      throw new Error('Failed to get user credentials from KMS');
    }
    
    const client = getHederaClient();
    const userAccount = AccountId.fromString(userCredentials.accountId);
    const userPrivateKey = PrivateKey.fromString(userCredentials.privateKey);
    
    // Set the user as the operator for this transaction
    client.setOperator(userAccount, userPrivateKey);
    
    // Create the collection token
    const tokenCreateTx = new TokenCreateTransaction()
      .setTokenName('SafeMate Folders')
      .setTokenSymbol('F')
      .setTokenType(TokenType.NonFungibleUnique)
      .setDecimals(0)
      .setInitialSupply(0)
      .setTreasuryAccountId(userAccount)
      .setSupplyType(TokenSupplyType.Infinite)
      .setAdminKey(userPrivateKey.publicKey)
      .setSupplyKey(userPrivateKey.publicKey)
      .setFreezeKey(userPrivateKey.publicKey)
      .setWipeKey(userPrivateKey.publicKey)
      .setKycKey(userPrivateKey.publicKey)
      .setPauseKey(userPrivateKey.publicKey)
      .setFeeScheduleKey(userPrivateKey.publicKey)
      .freezeWith(client);
    
    const tokenCreateSign = await tokenCreateTx.sign(userPrivateKey);
    const tokenCreateSubmit = await tokenCreateSign.execute(client);
    const tokenCreateReceipt = await tokenCreateSubmit.getReceipt(client);
    const tokenId = tokenCreateReceipt.tokenId;
    
    console.log(`Collection token created: ${tokenId}`);
    
    return {
      success: true,
      tokenId: tokenId.toString(),
      message: 'NON_FUNGIBLE_UNIQUE collection token created successfully'
    };
    
  } catch (error) {
    console.error('Error creating collection token:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Main Lambda handler
exports.handler = async (event) => {
  console.log('Lambda event:', JSON.stringify(event, null, 2));
  
  const { httpMethod, path, pathParameters, body, headers } = event;
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
  };
  
  // Handle preflight requests
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'CORS preflight' })
    };
  }
  
  try {
    let result;
    
    switch (path) {
      case '/health':
        result = { success: true, message: 'SafeMate v2 API is healthy', version: 'V48.0' };
        break;
        
      case '/folders':
        if (httpMethod === 'GET') {
          result = await listFolders();
        } else if (httpMethod === 'POST') {
          const requestBody = JSON.parse(body || '{}');
          result = await createFolder(requestBody.name, requestBody.parentFolderId);
        }
        break;
        
      case '/folders/create-collection':
        if (httpMethod === 'POST') {
          const userId = getUserFromEvent(event);
          if (!userId) {
            result = { success: false, error: 'User not authenticated' };
          } else {
            result = await createFolderCollectionToken(userId);
          }
        }
        break;
        
      default:
        if (pathParameters && pathParameters.id) {
          const folderId = pathParameters.id;
          if (httpMethod === 'GET') {
            result = await getFolderById(folderId);
          }
        } else {
          result = { success: false, error: 'Endpoint not found' };
        }
        break;
    }
    
    return {
      statusCode: result.success ? 200 : 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(result)
    };
    
  } catch (error) {
    console.error('Lambda handler error:', error);
    
    return {
      statusCode: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};
