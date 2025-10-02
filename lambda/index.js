/**
 * SafeMate v2.0 - Hedera Service Lambda Function
 * 
 * HIP-1299 Compliant NFT Collection Token Management
 * Enhanced folder hierarchy with rich metadata support
 * 
 * Features:
 * - NON_FUNGIBLE_UNIQUE collection token creation
 * - HIP-1299 compliant account validation
 * - Backup account support for failover
 * - Performance optimizations with account caching
 * - Rich metadata structure with theme and encryption support
 * - Enhanced security with account validation
 * - Fixed DynamoDB table name configuration
 * 
 * Version: V48.1
 * Last Updated: 2025-10-01
 * Compliance: HIP-1299
 * 
 * @author SafeMate Development Team
 * @version 2.0.1
 */

const {
  Client,
  TokenCreateTransaction,
  TokenType,
  PrivateKey,
  AccountId,
  TokenMintTransaction,
  TokenInfoQuery,
  TokenNftInfoQuery,
  Hbar,
  AccountInfoQuery
} = require("@hashgraph/sdk");
const AWS = require('aws-sdk');

// Initialize AWS services
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Environment variables
const HEDERA_NETWORK = process.env.HEDERA_NETWORK || 'testnet';
const HEDERA_ACCOUNT_ID = process.env.HEDERA_ACCOUNT_ID;
const HEDERA_PRIVATE_KEY = process.env.HEDERA_PRIVATE_KEY;
const FOLDER_COLLECTION_TOKEN = process.env.FOLDER_COLLECTION_TOKEN;
const MIRROR_NODE_URL = process.env.MIRROR_NODE_URL || 'https://testnet.mirrornode.hedera.com';
const SAFEMATE_FOLDERS_TABLE = process.env.SAFEMATE_FOLDERS_TABLE || 'preprod-safemate-hedera-folders';

// HIP-1299 Compliance: Enhanced Account Management
const BACKUP_ACCOUNT_IDS = process.env.BACKUP_ACCOUNT_IDS ? process.env.BACKUP_ACCOUNT_IDS.split(',') : [];
const ACCOUNT_VALIDATION_INTERVAL = parseInt(process.env.ACCOUNT_VALIDATION_INTERVAL) || 300000; // 5 minutes
const HIP_1299_COMPLIANCE = process.env.HIP_1299_COMPLIANCE === 'true';

// HIP-1299 Compliant Account Management
class AccountIdManager {
  constructor() {
    this.primaryAccountId = HEDERA_ACCOUNT_ID;
    this.backupAccountIds = BACKUP_ACCOUNT_IDS;
    this.lastValidated = null;
    this.accountCache = new Map();
    this.cacheExpiry = ACCOUNT_VALIDATION_INTERVAL;
  }

  async validateAccountId(accountId) {
    try {
      const client = getHederaClient();
      const accountInfo = await new AccountInfoQuery()
        .setAccountId(accountId)
        .execute(client);
      
      return {
        isValid: true,
        accountInfo,
        lastValidated: new Date().toISOString()
      };
    } catch (error) {
      console.error(`HIP-1299: Account validation failed for ${accountId}:`, error.message);
      return {
        isValid: false,
        error: error.message,
        lastValidated: new Date().toISOString()
      };
    }
  }

  async getActiveAccountId() {
    // Check cache first
    const cached = this.accountCache.get(this.primaryAccountId);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < this.cacheExpiry) {
      return cached.accountId;
    }

    // Validate primary account
    const primaryValidation = await this.validateAccountId(this.primaryAccountId);
    
    if (primaryValidation.isValid) {
      this.accountCache.set(this.primaryAccountId, {
        accountId: this.primaryAccountId,
        timestamp: now
      });
      return this.primaryAccountId;
    }

    // Try backup accounts
    for (const backupId of this.backupAccountIds) {
      const backupValidation = await this.validateAccountId(backupId);
      if (backupValidation.isValid) {
        console.warn(`HIP-1299: Switched to backup account: ${backupId}`);
        this.accountCache.set(this.primaryAccountId, {
          accountId: backupId,
          timestamp: now
        });
        return backupId;
      }
    }

    throw new Error('HIP-1299: No valid account IDs available');
  }
}

// Initialize Hedera client
function getHederaClient() {
  const client = HEDERA_NETWORK === 'mainnet' 
    ? Client.forMainnet() 
    : Client.forTestnet();
  
  if (HEDERA_ACCOUNT_ID && HEDERA_PRIVATE_KEY) {
    client.setOperator(HEDERA_ACCOUNT_ID, HEDERA_PRIVATE_KEY);
  }
  
  return client;
}

// Folder metadata interface
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
      isExpanded: this.folderType === 'root',
      theme: 'auto'
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
      lastModified: new Date().toISOString(),
      encryptionStatus: 'none'
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
    // HIP-1299 Compliance: Use validated account ID
    const accountManager = new AccountIdManager();
    const activeAccountId = await accountManager.getActiveAccountId();
    
    const client = getHederaClient();
    const userPrivateKey = PrivateKey.fromString(HEDERA_PRIVATE_KEY);
    
    console.log(`HIP-1299 Compliant: Creating NON_FUNGIBLE_UNIQUE collection token with validated account: ${activeAccountId}`);
    
    const tokenCreateTransaction = new TokenCreateTransaction()
      .setTokenName("SafeMate Folders")
      .setTokenSymbol("F")
      .setTokenType(TokenType.NonFungibleUnique)
      .setDecimals(0)
      .setInitialSupply(0)
      .setTreasuryAccountId(activeAccountId) // Use HIP-1299 validated account
      .setAutoRenewAccountId(activeAccountId) // Use HIP-1299 validated account
      .setAutoRenewPeriod(365 * 24 * 60 * 60) // 1 year for better cost efficiency
      .setAdminKey(userPrivateKey)
      .setSupplyKey(userPrivateKey)
      .setFreezeKey(userPrivateKey)
      .setWipeKey(userPrivateKey)
      .setKycKey(userPrivateKey)
      .setPauseKey(userPrivateKey)
      .setFeeScheduleKey(userPrivateKey)
      .setTokenMemo("SafeMate v2.0 - HIP-1299 Compliant NFT Collection for Hierarchical Folder Management with Rich Metadata, Permissions, and File Integration")
      .freezeWith(client);

    const tokenCreateSign = await tokenCreateTransaction.sign(userPrivateKey);
    const tokenCreateSubmit = await tokenCreateSign.execute(client);
    const tokenCreateReceipt = await tokenCreateSubmit.getReceipt(client);
    
    const newTokenId = tokenCreateReceipt.tokenId.toString();
    console.log(`HIP-1299 Compliant collection token created: ${newTokenId} with account: ${activeAccountId}`);
    
    return {
      success: true,
      tokenId: newTokenId,
      accountId: activeAccountId,
      hip1299Compliant: true,
      message: 'HIP-1299 compliant collection token created successfully'
    };
  } catch (error) {
    console.error('HIP-1299: Error creating collection token:', error);
    return {
      success: false,
      error: error.message,
      hip1299Compliant: false
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
      TableName: SAFEMATE_FOLDERS_TABLE,
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
    
    await dynamodb.put(params).promise();
    console.log(`Folder stored in database: ${metadata.id} (Table: ${SAFEMATE_FOLDERS_TABLE})`);
  } catch (error) {
    console.error('Error storing folder in database:', error);
    throw error;
  }
}

// Get folder from database
async function getFolderFromDatabase(folderId) {
  try {
    const params = {
      TableName: SAFEMATE_FOLDERS_TABLE,
      Key: { id: folderId }
    };
    
    const result = await dynamodb.get(params).promise();
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
    
    // Check if we need to create a proper NFT collection token
    let collectionTokenId = FOLDER_COLLECTION_TOKEN;
    try {
      const client = getHederaClient();
      const tokenInfo = await new TokenInfoQuery()
        .setTokenId(collectionTokenId)
        .execute(client);
      
      if (tokenInfo.tokenType.toString() !== 'NON_FUNGIBLE_UNIQUE') {
        console.log('Current collection token is not NON_FUNGIBLE_UNIQUE, creating new one...');
        const newCollection = await createFolderCollectionToken();
        if (newCollection.success) {
          collectionTokenId = newCollection.tokenId;
          console.log(`Created new NFT collection token: ${collectionTokenId}`);
        } else {
          throw new Error(`Failed to create NFT collection: ${newCollection.error}`);
        }
      }
    } catch (error) {
      console.log('Error checking collection token, creating new one...', error.message);
      const newCollection = await createFolderCollectionToken();
      if (newCollection.success) {
        collectionTokenId = newCollection.tokenId;
        console.log(`Created new NFT collection token: ${collectionTokenId}`);
      } else {
        throw new Error(`Failed to create NFT collection: ${newCollection.error}`);
      }
    }
    
    const client = getHederaClient();
    const userPrivateKey = PrivateKey.fromString(HEDERA_PRIVATE_KEY);
    
    // Generate unique folder ID
    const folderId = require('crypto').randomUUID();
    
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
      tokenId: collectionTokenId,
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
      .setTokenId(collectionTokenId)
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
      TableName: SAFEMATE_FOLDERS_TABLE,
      FilterExpression: 'createdBy = :userId',
      ExpressionAttributeValues: {
        ':userId': HEDERA_ACCOUNT_ID
      }
    };
    
    const result = await dynamodb.scan(params).promise();
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
        result = { success: true, message: 'SafeMate v2 API is healthy', version: 'V48.1' };
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
          result = await createFolderCollectionToken();
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
