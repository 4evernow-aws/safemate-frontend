# SafeMate v2 Folder NFT Configuration

## 🎯 Updated Token Creation Settings

### **Collection Token Configuration**

#### **Basic Settings**
- **Type**: `NON_FUNGIBLE_UNIQUE`
- **Name**: `SafeMate Folders`
- **Symbol**: `F` (for folders) / `SF` (for subfolders)
- **Supply Type**: `INFINITE`
- **Decimals**: `0` (NFTs always have 0 decimals)
- **Memo**: `SafeMate folder hierarchy management system`

#### **Account Settings**
- **Treasury Account**: `0.0.6890393` (your main account)
- **Auto-Renew Account**: `0.0.6890393`
- **Auto-Renew Period**: `90 days` (or as needed)

#### **Key Configuration**
```typescript
const tokenKeys = {
  adminKey: userPrivateKey,        // Update token properties
  supplyKey: userPrivateKey,       // Mint/burn NFTs
  freezeKey: userPrivateKey,       // Freeze/unfreeze accounts
  wipeKey: userPrivateKey,         // Wipe holdings
  kycKey: userPrivateKey,          // Grant/revoke KYC
  pauseKey: userPrivateKey,        // Pause/unpause transfers
  feeScheduleKey: userPrivateKey   // Update custom fees
};
```

#### **Custom Fees (Optional)**
```typescript
const customFees = [
  {
    type: 'ROYALTY_FEE',
    feeCollectorAccountId: '0.0.6890393',
    numerator: 250,  // 2.5% royalty
    denominator: 10000,
    fallbackFee: {
      type: 'FIXED_FEE',
      feeCollectorAccountId: '0.0.6890393',
      amount: 1000000  // 0.01 HBAR fallback
    }
  }
];
```

## 📋 Per-Folder NFT Metadata Schema

### **Complete Metadata Structure**
```typescript
interface FolderMetadata {
  // Core Identification
  id: string;                    // Internal folder ID (UUID)
  name: string;                  // Folder display name
  tokenId: string;               // Collection token ID
  serialNumber: number;          // NFT serial number
  
  // Hierarchy
  parentFolderId: string | null; // Parent folder ID (null for root)
  folderType: 'root' | 'subfolder' | 'nested_subfolder';
  path: string;                  // Full path (e.g., "/Documents/Work Files")
  depth: number;                 // Hierarchy depth (0 for root)
  
  // Ownership & Creation
  createdBy: string;             // Hedera account ID
  createdAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp
  
  // Content
  description?: string;          // Optional description
  tags: string[];               // Searchable tags
  
  // UI Configuration
  ui: {
    icon: string;               // Icon identifier
    color: string;              // Hex color code
    sortOrder: number;          // Display order
    isExpanded: boolean;        // Default expand state
  };
  
  // Permissions & Sharing
  permissions: {
    owners: string[];           // Full access accounts
    editors: string[];          // Edit access accounts
    viewers: string[];          // Read-only accounts
    isPublic: boolean;          // Public visibility
    shareLinks: {
      id: string;
      permissions: 'view' | 'edit';
      expiresAt?: string;
      createdAt: string;
    }[];
  };
  
  // File Management
  fileSummary: {
    totalFiles: number;
    totalSize: number;          // Bytes
    fileTypes: Record<string, number>; // Type counts
    lastModified: string;       // ISO timestamp
  };
  
  // Encryption (if needed)
  encryption?: {
    contentKeyId: string;       // Key identifier
    encryptedFolderKey: string; // Encrypted folder key
    keyDerivation: {
      algorithm: string;
      salt: string;
    };
  };
  
  // System
  version: string;              // Metadata version
  hederaFileId?: string;        // Hedera file ID for large metadata
}
```

### **Example Metadata for Root Folder**
```json
{
  "id": "folder-123e4567-e89b-12d3-a456-426614174000",
  "name": "My Documents",
  "tokenId": "0.0.6920175",
  "serialNumber": 1,
  "parentFolderId": null,
  "folderType": "root",
  "path": "/My Documents",
  "depth": 0,
  "createdBy": "0.0.6890393",
  "createdAt": "2025-01-30T10:30:00.000Z",
  "updatedAt": "2025-01-30T10:30:00.000Z",
  "description": "Main documents folder",
  "tags": ["documents", "personal", "main"],
  "ui": {
    "icon": "folder",
    "color": "#3498db",
    "sortOrder": 1,
    "isExpanded": true
  },
  "permissions": {
    "owners": ["0.0.6890393"],
    "editors": [],
    "viewers": [],
    "isPublic": false,
    "shareLinks": []
  },
  "fileSummary": {
    "totalFiles": 0,
    "totalSize": 0,
    "fileTypes": {},
    "lastModified": "2025-01-30T10:30:00.000Z"
  },
  "version": "1.0.0"
}
```

### **Example Metadata for Subfolder**
```json
{
  "id": "folder-456e7890-e89b-12d3-a456-426614174001",
  "name": "Work Files",
  "tokenId": "0.0.6920175",
  "serialNumber": 2,
  "parentFolderId": "folder-123e4567-e89b-12d3-a456-426614174000",
  "folderType": "subfolder",
  "path": "/My Documents/Work Files",
  "depth": 1,
  "createdBy": "0.0.6890393",
  "createdAt": "2025-01-30T10:35:00.000Z",
  "updatedAt": "2025-01-30T10:35:00.000Z",
  "description": "Work-related documents",
  "tags": ["work", "documents", "professional"],
  "ui": {
    "icon": "briefcase",
    "color": "#e74c3c",
    "sortOrder": 1,
    "isExpanded": false
  },
  "permissions": {
    "owners": ["0.0.6890393"],
    "editors": [],
    "viewers": [],
    "isPublic": false,
    "shareLinks": []
  },
  "fileSummary": {
    "totalFiles": 0,
    "totalSize": 0,
    "fileTypes": {},
    "lastModified": "2025-01-30T10:35:00.000Z"
  },
  "version": "1.0.0"
}
```

## 🔧 Implementation Code

### **Token Creation Function**
```typescript
async function createFolderCollectionToken() {
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
    .setCustomFees(customFees)
    .setTokenMemo("SafeMate folder hierarchy management system")
    .freezeWith(client);

  const tokenCreateSign = await tokenCreateTransaction.sign(userPrivateKey);
  const tokenCreateSubmit = await tokenCreateSign.execute(client);
  const tokenCreateReceipt = await tokenCreateSubmit.getReceipt(client);
  
  return tokenCreateReceipt.tokenId.toString();
}
```

### **Folder Creation Function**
```typescript
async function createFolder(name: string, parentFolderId: string | null = null) {
  const collectionTokenId = process.env.FOLDER_COLLECTION_TOKEN;
  
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
  };
}
```

## 🚀 Next Steps

1. **Update Lambda Function**: Implement the new token creation logic
2. **Create New Collection Token**: Deploy with NON_FUNGIBLE_UNIQUE type
3. **Update Environment Variables**: Set new collection token ID
4. **Test Folder Creation**: Verify new metadata structure works
5. **Update Frontend**: Handle new metadata fields in UI

## 📊 Benefits of New Configuration

- ✅ **Proper NFT Type**: NON_FUNGIBLE_UNIQUE for true folder NFTs
- ✅ **Rich Metadata**: Comprehensive folder information
- ✅ **Hierarchy Support**: Full parent-child relationships
- ✅ **UI Customization**: Icons, colors, sort order
- ✅ **Permissions**: Granular access control
- ✅ **File Management**: Track file counts and sizes
- ✅ **Search & Tags**: Better organization and discovery
- ✅ **Encryption Ready**: Support for encrypted folders
- ✅ **Versioning**: Metadata version tracking
- ✅ **Sharing**: Link-based sharing system

This configuration provides a robust foundation for your folder management system with all the features you requested!

