# SafeMate v2 Lambda Function Update Guide

## 🎯 Goal
Update the Lambda function to create proper NON_FUNGIBLE_UNIQUE tokens for folders with the new configuration.

## 🔧 Required Changes

### **1. Environment Variables to Add/Update**
```bash
# New collection token (create this first)
FOLDER_COLLECTION_TOKEN=0.0.NEW_TOKEN_ID

# Existing variables (keep these)
HEDERA_NETWORK=TESTNET
HEDERA_ACCOUNT_ID=0.0.6890393
HEDERA_PRIVATE_KEY=your_private_key
MIRROR_NODE_URL=https://testnet.mirrornode.hedera.com
```

### **2. Token Creation Function (Add to Lambda)**
```typescript
import {
  Client,
  TokenCreateTransaction,
  TokenType,
  PrivateKey,
  AccountId,
  TokenMintTransaction,
  Hbar
} from "@hashgraph/sdk";

async function createFolderCollectionToken(): Promise<string> {
  const client = Client.forTestnet();
  client.setOperator("0.0.6890393", process.env.HEDERA_PRIVATE_KEY);
  
  const userPrivateKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);
  
  // Create the collection token
  const tokenCreateTransaction = new TokenCreateTransaction()
    .setTokenName("SafeMate Folders")
    .setTokenSymbol("F")
    .setTokenType(TokenType.NonFungibleUnique)
    .setDecimals(0)
    .setInitialSupply(0)
    .setTreasuryAccountId("0.0.6890393")
    .setAutoRenewAccountId("0.0.6890393")
    .setAutoRenewPeriod(90 * 24 * 60 * 60) // 90 days
    .setAdminKey(userPrivateKey)
    .setSupplyKey(userPrivateKey)
    .setFreezeKey(userPrivateKey)
    .setWipeKey(userPrivateKey)
    .setKycKey(userPrivateKey)
    .setPauseKey(userPrivateKey)
    .setFeeScheduleKey(userPrivateKey)
    .setTokenMemo("SafeMate folder hierarchy management system")
    .freezeWith(client);

  const tokenCreateSign = await tokenCreateTransaction.sign(userPrivateKey);
  const tokenCreateSubmit = await tokenCreateSign.execute(client);
  const tokenCreateReceipt = await tokenCreateSubmit.getReceipt(client);
  
  return tokenCreateReceipt.tokenId.toString();
}
```

### **3. Updated Folder Creation Function**
```typescript
interface FolderMetadata {
  id: string;
  name: string;
  tokenId: string;
  serialNumber: number;
  parentFolderId: string | null;
  folderType: 'root' | 'subfolder' | 'nested_subfolder';
  path: string;
  depth: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
  tags: string[];
  ui: {
    icon: string;
    color: string;
    sortOrder: number;
    isExpanded: boolean;
  };
  permissions: {
    owners: string[];
    editors: string[];
    viewers: string[];
    isPublic: boolean;
    shareLinks: any[];
  };
  fileSummary: {
    totalFiles: number;
    totalSize: number;
    fileTypes: Record<string, number>;
    lastModified: string;
  };
  version: string;
}

async function createFolder(name: string, parentFolderId: string | null = null): Promise<any> {
  const collectionTokenId = process.env.FOLDER_COLLECTION_TOKEN;
  
  if (!collectionTokenId) {
    throw new Error("FOLDER_COLLECTION_TOKEN not set");
  }
  
  const client = Client.forTestnet();
  client.setOperator("0.0.6890393", process.env.HEDERA_PRIVATE_KEY);
  
  const userPrivateKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);
  
  // Generate unique folder ID
  const folderId = crypto.randomUUID();
  
  // Determine folder type and path
  const folderType = parentFolderId ? 'subfolder' : 'root';
  const path = parentFolderId ? await buildPath(parentFolderId, name) : `/${name}`;
  const depth = parentFolderId ? await getDepth(parentFolderId) + 1 : 0;
  
  // Create metadata
  const metadata: FolderMetadata = {
    id: folderId,
    name,
    tokenId: collectionTokenId,
    serialNumber: 0, // Will be set after minting
    parentFolderId,
    folderType,
    path,
    depth,
    createdBy: "0.0.6890393",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    description: `${folderType} folder`,
    tags: [folderType, name.toLowerCase()],
    ui: {
      icon: folderType === 'root' ? 'folder' : 'folder-open',
      color: folderType === 'root' ? '#3498db' : '#e74c3c',
      sortOrder: 1,
      isExpanded: folderType === 'root'
    },
    permissions: {
      owners: ["0.0.6890393"],
      editors: [],
      viewers: [],
      isPublic: false,
      shareLinks: []
    },
    fileSummary: {
      totalFiles: 0,
      totalSize: 0,
      fileTypes: {},
      lastModified: new Date().toISOString()
    },
    version: "1.0.0"
  };
  
  // Convert metadata to bytes
  const metadataBytes = new TextEncoder().encode(JSON.stringify(metadata));
  
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
  
  return {
    success: true,
    folder: {
      id: folderId,
      name,
      tokenId: collectionTokenId,
      serialNumber,
      parentFolderId,
      folderType,
      path,
      depth,
      createdAt: metadata.createdAt,
      updatedAt: metadata.updatedAt
    }
  };
}
```

### **4. Helper Functions**
```typescript
async function buildPath(parentFolderId: string, folderName: string): Promise<string> {
  // Get parent folder from database
  const parentFolder = await getFolderFromDatabase(parentFolderId);
  return `${parentFolder.path}/${folderName}`;
}

async function getDepth(parentFolderId: string): Promise<number> {
  const parentFolder = await getFolderFromDatabase(parentFolderId);
  return parentFolder.depth;
}

async function storeFolderInDatabase(metadata: FolderMetadata): Promise<void> {
  // Store in DynamoDB for fast queries
  const params = {
    TableName: 'SafeMateFolders',
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
      metadata: JSON.stringify(metadata)
    }
  };
  
  await dynamodb.put(params).promise();
}

async function getFolderFromDatabase(folderId: string): Promise<FolderMetadata> {
  const params = {
    TableName: 'SafeMateFolders',
    Key: { id: folderId }
  };
  
  const result = await dynamodb.get(params).promise();
  return JSON.parse(result.Item.metadata);
}
```

### **5. Updated Folder Listing Function**
```typescript
async function listFolders(): Promise<any> {
  const collectionTokenId = process.env.FOLDER_COLLECTION_TOKEN;
  
  if (!collectionTokenId) {
    throw new Error("FOLDER_COLLECTION_TOKEN not set");
  }
  
  // Get folders from DynamoDB (faster than blockchain query)
  const params = {
    TableName: 'SafeMateFolders',
    FilterExpression: 'createdBy = :userId',
    ExpressionAttributeValues: {
      ':userId': '0.0.6890393'
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
  
  return {
    success: true,
    data: hierarchy
  };
}

function buildFolderHierarchy(folders: any[]): any[] {
  const folderMap = new Map();
  const rootFolders: any[] = [];
  
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
```

## 🚀 Deployment Steps

### **Step 1: Create New Collection Token**
1. Deploy the `createFolderCollectionToken()` function
2. Run it once to create the new collection token
3. Note the returned token ID
4. Update environment variable `FOLDER_COLLECTION_TOKEN`

### **Step 2: Update Lambda Function**
1. Add the new folder creation logic
2. Update the folder listing logic
3. Add helper functions
4. Deploy the updated Lambda function

### **Step 3: Test New Implementation**
1. Use `folder-hierarchy-browser-test.html` to test
2. Create a root folder
3. Create a subfolder
4. Verify the new metadata structure
5. Check folder listing returns proper hierarchy

### **Step 4: Update Frontend**
1. Update frontend to handle new metadata fields
2. Display icons, colors, and other UI elements
3. Implement hierarchy display
4. Add permission controls

## 📊 Expected Results

After implementation:
- ✅ **Proper NFT Creation**: NON_FUNGIBLE_UNIQUE tokens
- ✅ **Rich Metadata**: All folder information stored
- ✅ **Hierarchy Support**: Parent-child relationships
- ✅ **Fast Queries**: DynamoDB for quick folder listing
- ✅ **UI Customization**: Icons, colors, sort order
- ✅ **Permissions**: Granular access control
- ✅ **File Management**: Track file counts and sizes

## 🔍 Testing Checklist

- [ ] New collection token created successfully
- [ ] Root folder creation works
- [ ] Subfolder creation works
- [ ] Folder listing returns hierarchy
- [ ] Metadata includes all required fields
- [ ] UI displays icons and colors
- [ ] Permissions system works
- [ ] File management features work

This update will give you a robust, production-ready folder management system with all the features you requested!

