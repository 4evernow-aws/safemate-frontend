# SafeMate Direct Blockchain Architecture

## 🎯 **Architecture Overview**

**Environment**: preprod  
**Date**: September 24, 2025  
**Status**: Implementation Phase  

### **Core Philosophy**
- **Direct Blockchain Storage**: All folders/files stored as NFTs on Hedera testnet
- **Smart Caching**: Performance optimization through intelligent caching
- **No DynamoDB Dependencies**: Eliminate sync issues and data duplication
- **Fully Decentralized**: True blockchain-based file storage

## 🏗️ **Architecture Components**

### **1. Storage Layer (Blockchain Only)**
```
┌─────────────────────────────────────────────────────────────┐
│                    HEDERA TESTNET                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Folder NFTs   │  │   File NFTs     │  │  Metadata   │ │
│  │   (0.0.123456)  │  │   (0.0.789012)  │  │  (JSON)     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### **2. Performance Layer (Smart Caching)**
```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND CACHE                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │  Wallet Data    │  │  Folder Cache   │  │  File Cache │ │
│  │  (Until logout) │  │  (5 minutes)    │  │  (5 min)    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 📋 **Implementation Phases**

### **Phase 1: Direct Blockchain Storage** ⚡ **CURRENT**
**Goal**: Remove DynamoDB dependencies, store everything on blockchain

#### **Backend Changes (Lambda Functions)**
- [ ] **Remove DynamoDB Storage**: Eliminate folder storage in DynamoDB
- [ ] **Direct Blockchain Queries**: Query Hedera blockchain for folder listing
- [ ] **NFT-Only Storage**: Store all folders as NFT tokens
- [ ] **Metadata in NFTs**: Store folder metadata in NFT metadata field

#### **Frontend Changes**
- [ ] **Update API Calls**: Modify to handle blockchain-only responses
- [ ] **Remove DynamoDB Dependencies**: Clean up any DynamoDB references
- [ ] **Error Handling**: Handle blockchain query failures gracefully

#### **Files to Modify**
```
Backend:
├── services/hedera-service/index.js (remove DynamoDB storage)
├── services/hedera-service/hedera-client.js (add blockchain queries)
└── lambda.tf (remove DynamoDB table dependencies)

Frontend:
├── src/contexts/HederaContext.tsx (update API handling)
├── src/services/hederaApiService.ts (modify API calls)
└── src/components/widgets/WalletStructureWidget.tsx (update data source)
```

### **Phase 2: Smart Caching** 🚀 **NEXT**
**Goal**: Add intelligent caching for performance optimization

#### **Caching Strategy**
- **Cache Duration**: 5 minutes
- **Cache Storage**: React Context (in-memory, fast)
- **Cache Scope**: Folder structure + file lists
- **Refresh Strategy**: Event-based + manual

#### **Cache Implementation**
```typescript
interface CacheConfig {
  walletData: {
    duration: 'until_logout',
    storage: 'React Context'
  },
  folderStructure: {
    duration: '5_minutes',
    storage: 'React Context',
    invalidation: ['folder_created', 'manual_refresh']
  },
  fileLists: {
    duration: '5_minutes', 
    storage: 'React Context',
    invalidation: ['file_uploaded', 'manual_refresh']
  }
}
```

#### **Cache Invalidation Triggers**
- ✅ **Folder Created**: Invalidate folder cache
- ✅ **File Uploaded**: Invalidate file cache  
- ✅ **Manual Refresh**: User clicks refresh button
- ✅ **Time-based**: Cache expires after 5 minutes

### **Phase 3: Performance Optimization** 🔧 **FUTURE**
**Goal**: Advanced performance features

#### **Features**
- [ ] **Lazy Loading**: Load folder contents on demand
- [ ] **Background Refresh**: Update cache in background
- [ ] **Optimistic Updates**: Update UI before blockchain confirmation
- [ ] **Pagination**: Handle large folder structures

## 🔧 **Technical Implementation Details**

### **Blockchain Storage Format**
```javascript
// Folder NFT Structure
{
  tokenId: "0.0.123456",
  tokenName: "Holidays",
  tokenSymbol: "FOLDER",
  tokenType: "NON_FUNGIBLE_UNIQUE",
  metadata: {
    type: "folder",
    name: "Holidays",
    userId: "user-123",
    parentFolderId: null,
    createdAt: "2025-09-24T...",
    permissions: ["read", "write"],
    network: "testnet"
  }
}
```

### **Cache Structure**
```typescript
interface WalletCache {
  wallet: {
    accountId: string;
    publicKey: string;
    balance: string;
    lastUpdated: string;
  };
  folders: {
    data: HederaFolder[];
    lastUpdated: string;
    expiresAt: string;
  };
  files: {
    [folderId: string]: {
      data: HederaFile[];
      lastUpdated: string;
      expiresAt: string;
    };
  };
}
```

### **API Endpoints (Blockchain Direct)**
```
GET  /folders           → Query blockchain for user's folders
POST /folders           → Create NFT token on blockchain
GET  /folders/{id}      → Get folder metadata from blockchain
GET  /files/{folderId}  → Query blockchain for folder's files
POST /files             → Create file NFT on blockchain
```

## 🚨 **Migration Strategy**

### **Current State**
- ✅ Wallet creation working
- ❌ Folder creation failing (sync issues)
- ❌ DynamoDB storage not working
- ❌ Wallet Structure Widget not showing

### **Migration Steps**
1. **Backup Current State**: Document current functionality
2. **Remove DynamoDB Dependencies**: Clean up hybrid approach
3. **Implement Direct Blockchain**: Store everything on Hedera
4. **Add Smart Caching**: Performance optimization
5. **Test & Validate**: Ensure all functionality works

### **Rollback Plan**
- Keep current Lambda functions as backup
- Maintain Terraform state for quick rollback
- Document all changes for easy reversal

## 📊 **Performance Expectations**

### **Before (Hybrid Approach)**
- ❌ Sync issues between DynamoDB and blockchain
- ❌ Data inconsistency
- ❌ Complex error handling
- ✅ Fast queries (when working)

### **After (Direct Blockchain + Caching)**
- ✅ No sync issues (single source of truth)
- ✅ Data consistency guaranteed
- ✅ Simplified architecture
- ✅ Fast queries (cached)
- ✅ True decentralization

## 🔍 **Testing Strategy**

### **Phase 1 Testing**
- [ ] Create folder → Verify NFT created on blockchain
- [ ] List folders → Verify blockchain query works
- [ ] Delete folder → Verify NFT deletion
- [ ] Error handling → Test blockchain failures

### **Phase 2 Testing**
- [ ] Cache functionality → Verify caching works
- [ ] Cache invalidation → Test refresh triggers
- [ ] Performance → Measure query speeds
- [ ] Memory usage → Monitor cache size

## 📝 **Documentation Updates**

### **Files to Update**
- [ ] `ARCHITECTURE_OVERVIEW.md` - Update system architecture
- [ ] `DEPLOYMENT_GUIDE.md` - Update deployment procedures
- [ ] `TROUBLESHOOTING_GUIDE.md` - Add blockchain-specific issues
- [ ] `API_DOCUMENTATION.md` - Update API endpoints

### **New Documentation**
- [ ] `BLOCKCHAIN_STORAGE_GUIDE.md` - How blockchain storage works
- [ ] `CACHING_STRATEGY.md` - Caching implementation details
- [ ] `PERFORMANCE_METRICS.md` - Performance benchmarks

## 🎯 **Success Criteria**

### **Phase 1 Success**
- ✅ Folders created successfully on blockchain
- ✅ Folders visible in UI immediately
- ✅ No DynamoDB dependencies
- ✅ Wallet Structure Widget working

### **Phase 2 Success**
- ✅ Fast folder listing (cached)
- ✅ Automatic cache invalidation
- ✅ Manual refresh working
- ✅ Performance improved

### **Overall Success**
- ✅ Fully decentralized storage
- ✅ No sync issues
- ✅ Fast user experience
- ✅ Reliable folder/file operations

## 🔄 **Next Steps**

1. **Start Phase 1**: Implement direct blockchain storage
2. **Test Thoroughly**: Ensure folder creation works
3. **Deploy Changes**: Update Lambda functions
4. **Validate**: Test with real user scenarios
5. **Begin Phase 2**: Add smart caching layer

---

**Status**: Ready for Phase 1 implementation  
**Priority**: High (fixing current folder creation issues)  
**Estimated Time**: 2-3 hours for Phase 1, 1-2 hours for Phase 2
