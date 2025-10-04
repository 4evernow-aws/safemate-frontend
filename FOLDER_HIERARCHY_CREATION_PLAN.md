# SafeMate v2 Folder Hierarchy Creation Plan

## 🎯 Goal
Create a proper NFT-based folder hierarchy with:
- **Root Folder**: "testfolder 01" (no parent)
- **Subfolder**: "Documents" (parent: testfolder 01)
- **Nested Subfolder**: "Work Files" (parent: Documents)

## 🌳 Expected Hierarchy Structure
```
📁 testfolder 01 (Root Folder)
└── 📂 Documents (Subfolder)
    └── 📂 Work Files (Nested Subfolder)
```

## 🔧 Technical Implementation

### **1. NFT Collection Token**
- **Current**: `0.0.6920175` (FUNGIBLE_COMMON - wrong type)
- **Needed**: `NON_FUNGIBLE_UNIQUE` collection token
- **Purpose**: Each folder is an NFT with unique serial number

### **2. Folder NFT Structure**
Each folder is an NFT with metadata:
```json
{
  "name": "folder_name",
  "parentFolderId": "parent_nft_serial_or_null",
  "folderType": "root|subfolder|nested_subfolder",
  "createdBy": "0.0.6890393",
  "createdAt": "ISO_timestamp",
  "description": "folder_description"
}
```

### **3. Parent-Child Relationships**
- **Root Folder**: `parentFolderId: null`
- **Subfolder**: `parentFolderId: "root_folder_serial"`
- **Nested Subfolder**: `parentFolderId: "subfolder_serial"`

## 🚀 Creation Process

### **Step 1: Create Root Folder**
```json
POST /folders
{
  "name": "testfolder 01",
  "parentFolderId": null,
  "description": "Root folder for testing hierarchy"
}
```

### **Step 2: Create Subfolder**
```json
POST /folders
{
  "name": "Documents",
  "parentFolderId": "root_folder_id",
  "description": "Documents subfolder under testfolder 01"
}
```

### **Step 3: Create Nested Subfolder**
```json
POST /folders
{
  "name": "Work Files",
  "parentFolderId": "subfolder_id",
  "description": "Work files subfolder under Documents"
}
```

## 🧪 Testing Tools Created

### **1. Browser Test Tool**
- **File**: `folder-hierarchy-browser-test.html`
- **Purpose**: Interactive folder creation with authentication
- **Features**:
  - JWT token authentication
  - Create root folder
  - Create subfolder with parent relationship
  - Create nested subfolder
  - View complete hierarchy
  - Real-time results display

### **2. PowerShell Script**
- **File**: `create-folder-hierarchy.ps1`
- **Purpose**: Automated folder creation process
- **Features**:
  - Step-by-step folder creation
  - Error handling and logging
  - Hierarchy validation
  - Results summary

## 📋 How to Use

### **Option 1: Browser Test (Recommended)**
1. **Open**: `folder-hierarchy-browser-test.html` in browser
2. **Login**: Get JWT token from SafeMate frontend
3. **Set Token**: Paste JWT token in the form
4. **Create Root**: Click "Create Root Folder"
5. **Create Subfolder**: Click "Create Subfolder" (parent ID auto-filled)
6. **Create Nested**: Click "Create Nested Subfolder"
7. **View Hierarchy**: Click "View Hierarchy" to see the tree

### **Option 2: API Testing**
1. **Get JWT Token**: From SafeMate frontend login
2. **Create Folders**: Use API calls with authentication
3. **Verify Results**: Check folder listing endpoint

## 🎯 Expected Results

### **After Creation:**
- **3 NFT tokens** minted under collection `0.0.6920175`
- **Hierarchical structure** with proper parent-child relationships
- **Folder listing** shows all folders with hierarchy
- **Widget display** shows expandable folder tree

### **NFT Details:**
- **Root Folder NFT**: Serial 1, no parent
- **Subfolder NFT**: Serial 2, parent = Serial 1
- **Nested NFT**: Serial 3, parent = Serial 2

## 🔍 Verification Steps

### **1. Check NFT Collection**
```bash
curl "https://testnet.mirrornode.hedera.com/api/v1/tokens/0.0.6920175"
```

### **2. List All NFTs**
```bash
curl "https://testnet.mirrornode.hedera.com/api/v1/tokens/0.0.6920175/nfts"
```

### **3. Check Account NFTs**
```bash
curl "https://testnet.mirrornode.hedera.com/api/v1/accounts/0.0.6890393/nfts"
```

### **4. Test Folder Listing**
```bash
curl -H "Authorization: Bearer JWT_TOKEN" \
     "https://uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com/folders"
```

## 🚨 Current Issues to Fix

### **1. Collection Token Type**
- **Problem**: `0.0.6920175` is `FUNGIBLE_COMMON`
- **Solution**: Create new `NON_FUNGIBLE_UNIQUE` collection or update existing

### **2. Lambda Query Logic**
- **Problem**: Not querying NFTs correctly
- **Solution**: Update V47.13 to query NFT serials, not balances

### **3. Metadata Parsing**
- **Problem**: Not parsing NFT metadata for folder info
- **Solution**: Extract folder data from NFT metadata

## 🎉 Success Criteria

### **✅ Complete Success:**
1. **Root folder** "testfolder 01" created and visible
2. **Subfolder** "Documents" created under root folder
3. **Nested subfolder** "Work Files" created under Documents
4. **Hierarchy display** shows proper tree structure
5. **Widget** displays expandable folder tree
6. **API** returns all folders with parent-child relationships

### **📊 Expected API Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "folder-001",
      "name": "testfolder 01",
      "parentFolderId": null,
      "serialNumber": 1,
      "subfolders": [
        {
          "id": "folder-002",
          "name": "Documents",
          "parentFolderId": "folder-001",
          "serialNumber": 2,
          "subfolders": [
            {
              "id": "folder-003",
              "name": "Work Files",
              "parentFolderId": "folder-002",
              "serialNumber": 3,
              "subfolders": []
            }
          ]
        }
      ]
    }
  ]
}
```

## 🚀 Next Steps

1. **Use the browser test tool** to create the folder hierarchy
2. **Verify the hierarchy** displays correctly in the widget
3. **Test file upload** to folders and subfolders
4. **Monitor performance** and user experience

---

**Ready to create the folder hierarchy! 🌳**

**Use `folder-hierarchy-browser-test.html` with your JWT token to get started!**
