# Phase 1: Direct Blockchain Storage Implementation Plan

## 🎯 **Phase 1 Goals**
- Remove DynamoDB dependencies for folder storage
- Store all folders as NFT tokens on Hedera blockchain
- Query blockchain directly for folder listing
- Fix current folder creation issues

## 📋 **Implementation Checklist**

### **Step 1: Update Lambda Function (Backend)**
- [ ] **Remove DynamoDB Storage**: Eliminate folder storage in DynamoDB
- [ ] **Add Blockchain Queries**: Query Hedera for user's folders
- [ ] **Fix NFT Creation**: Ensure folder NFTs are created properly
- [ ] **Update Response Format**: Return blockchain data directly

### **Step 2: Update Frontend**
- [ ] **Modify API Calls**: Handle blockchain-only responses
- [ ] **Update Wallet Structure Widget**: Use blockchain data
- [ ] **Fix Folder Display**: Ensure folders show immediately
- [ ] **Add Error Handling**: Handle blockchain query failures

### **Step 3: Test & Deploy**
- [ ] **Test Folder Creation**: Verify NFTs created on blockchain
- [ ] **Test Folder Listing**: Verify blockchain queries work
- [ ] **Deploy Changes**: Update Lambda and frontend
- [ ] **Validate**: Test with real user scenarios

## 🔧 **Detailed Implementation Steps**

### **Step 1.1: Update Lambda Function**

#### **File**: `services/hedera-service/index.js`

#### **Changes Required**:

1. **Remove DynamoDB Storage** (lines 345-348):
```javascript
// REMOVE THIS BLOCK:
await dynamodb.send(new PutCommand({
  TableName: SAFEMATE_FOLDERS_TABLE,
  Item: folderRecord
}));
```

2. **Add Blockchain Query Function**:
```javascript
/**
 * Query blockchain directly for user's folders
 */
async function queryUserFoldersFromBlockchain(userId) {
  try {
    console.log(`🔍 Querying blockchain for folders belonging to user: ${userId}`);
    
    // Get user's wallet
    const userWallet = await getUserWallet(userId);
    if (!userWallet) {
      return { success: true, data: [] };
    }
    
    // Initialize client with user's credentials
    const client = await initializeUserHederaClient(userWallet);
    
    // Query for tokens owned by user
    const accountInfo = await new AccountInfoQuery()
      .setAccountId(client.operatorAccountId)
      .execute(client);
    
    const folders = [];
    
    // Check each token to see if it's a folder
    for (const tokenId of accountInfo.tokenRelationships.keys()) {
      try {
        const tokenInfo = await new TokenInfoQuery()
          .setTokenId(tokenId)
          .execute(client);
        
        // Check if this is a folder token (symbol = 'FOLDER')
        if (tokenInfo.symbol === 'FOLDER') {
          // Get NFT metadata
          const nftInfo = await new TokenNftInfoQuery()
            .setTokenId(tokenId)
            .setStart(1)
            .setEnd(1)
            .execute(client);
          
          if (nftInfo.length > 0 && nftInfo[0].metadata) {
            const metadata = JSON.parse(nftInfo[0].metadata.toString());
            
            folders.push({
              id: tokenId.toString(),
              name: metadata.name || tokenInfo.name,
              parentFolderId: metadata.parentFolderId || null,
              createdAt: metadata.createdAt,
              tokenId: tokenId.toString(),
              files: [],
              subfolders: []
            });
          }
        }
      } catch (tokenError) {
        console.warn(`⚠️ Error checking token ${tokenId}:`, tokenError.message);
      }
    }
    
    console.log(`✅ Found ${folders.length} folders on blockchain for user: ${userId}`);
    return { success: true, data: folders };
    
  } catch (error) {
    console.error(`❌ Failed to query folders from blockchain:`, error);
    return { success: false, error: error.message };
  }
}
```

3. **Update listUserFolders Function** (replace lines 379-420):
```javascript
async function listUserFolders(userId) {
  try {
    console.log(`🔍 Listing folders for user: ${userId} (blockchain direct)`);
    
    // Query blockchain directly instead of DynamoDB
    const result = await queryUserFoldersFromBlockchain(userId);
    
    if (!result.success) {
      throw new Error(result.error);
    }
    
    console.log(`✅ Found ${result.data.length} folders on blockchain for user ${userId}`);
    
    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    console.error(`❌ Failed to list folders for user ${userId}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}
```

### **Step 1.2: Update Frontend**

#### **File**: `src/contexts/HederaContext.tsx`

#### **Changes Required**:

1. **Update loadUserData Function** (around line 430):
```typescript
// Update the folder loading logic to handle blockchain-only data
const foldersResult = await HederaApiService.listFolders();
console.log('📁 listFolders API response:', foldersResult);

// Handle blockchain-only response structure
let foldersArray = null;
if (foldersResult.success && foldersResult.data) {
  if (Array.isArray(foldersResult.data)) {
    foldersArray = foldersResult.data;
  }
}

if (foldersArray) {
  console.log('✅ Folders API call successful, data:', foldersArray);
  // Transform blockchain data to frontend format
  const transformedFolders = foldersArray.map(folder => ({
    id: folder.id,
    name: folder.name,
    files: folder.files || [],
    subfolders: folder.subfolders || [],
    parentFolderId: folder.parentFolderId,
    hederaFileId: folder.tokenId,
    createdAt: folder.createdAt,
    updatedAt: folder.createdAt
  }));
  
  setFolders(transformedFolders);
  console.log('✅ Loaded folders from blockchain:', transformedFolders.length);
} else {
  console.log('📁 No folders found on blockchain');
  setFolders([]);
}
```

### **Step 1.3: Update Wallet Structure Widget**

#### **File**: `src/components/widgets/WalletStructureWidget.tsx`

#### **Changes Required**:

1. **Update Data Source**: Ensure widget uses blockchain data
2. **Add Blockchain Status**: Show blockchain verification status
3. **Update Refresh Logic**: Refresh from blockchain

### **Step 1.4: Test Implementation**

#### **Test Cases**:

1. **Folder Creation Test**:
   - Create folder "Holidays"
   - Verify NFT created on blockchain
   - Verify folder appears in UI immediately

2. **Folder Listing Test**:
   - Refresh page
   - Verify folders still visible
   - Verify Wallet Structure Widget shows folders

3. **Blockchain Verification Test**:
   - Check Hedera testnet explorer
   - Verify NFT tokens exist
   - Verify metadata is stored

## 🚀 **Deployment Steps**

### **Step 1: Deploy Lambda Function**
```bash
# Build new deployment package
cd services/hedera-service
npm install
zip -r hedera-service-blockchain-direct.zip index.js hedera-client.js package.json node_modules/

# Upload to S3
aws s3 cp hedera-service-blockchain-direct.zip s3://preprod-safemate-static-hosting/lambda-packages/

# Update Lambda function
aws lambda update-function-code --function-name preprod-safemate-hedera-service --s3-bucket preprod-safemate-static-hosting --s3-key lambda-packages/hedera-service-blockchain-direct.zip
```

### **Step 2: Deploy Frontend**
```bash
# Build frontend
cd ../safemate-frontend
npm run build

# Deploy to S3
aws s3 sync dist/ s3://preprod-safemate-static-hosting --delete

# Invalidate CloudFront
aws cloudfront create-invalidation --distribution-id E2XL0R3MV20SY5 --paths "/*"
```

### **Step 3: Update Terraform**
```bash
# Update lambda.tf to use new deployment package
# Apply changes
terraform apply -auto-approve
```

## 🔍 **Validation Steps**

### **1. Test Folder Creation**
- [ ] Create folder "Holidays"
- [ ] Check browser console for success logs
- [ ] Verify folder appears in UI
- [ ] Check Wallet Structure Widget

### **2. Test Blockchain Verification**
- [ ] Check Hedera testnet explorer for account 0.0.6890393
- [ ] Verify NFT tokens exist
- [ ] Verify metadata is stored in NFT

### **3. Test Folder Persistence**
- [ ] Refresh page
- [ ] Verify folders still visible
- [ ] Test multiple folder creation

## 🚨 **Rollback Plan**

If issues occur:
1. **Revert Lambda Function**: Use previous deployment package
2. **Revert Frontend**: Deploy previous build
3. **Check Logs**: Investigate issues
4. **Fix and Retry**: Address problems and redeploy

## 📊 **Success Criteria**

- ✅ Folder creation works (HTTP 201 success)
- ✅ Folders visible in UI immediately
- ✅ Wallet Structure Widget shows folders
- ✅ No DynamoDB dependencies
- ✅ Blockchain as single source of truth

---

**Estimated Time**: 2-3 hours  
**Priority**: High (fixing current issues)  
**Status**: Ready to implement
