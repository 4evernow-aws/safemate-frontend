# SafeMate API Gateway Comparison Analysis

**Date**: September 22, 2025  
**Environment**: Pre-production (Preprod)  
**Purpose**: Compare Edge-optimized vs Regional APIs before cleanup

---

## 🔍 **API Gateway Comparison Results**

### **Hedera Service API Comparison**

| Aspect | Edge-optimized (OLD) | Regional (CURRENT) | Status |
|--------|---------------------|-------------------|---------|
| **API ID** | `2kwe2ly8vh` | `uvk4xxwjyg` | ✅ Different |
| **Name** | `preprod-safemate-hedera-api` | `preprod-safemate-hedera-api` | ✅ Same |
| **Description** | "API Gateway for SafeMate Hedera Service (Pre-Production)" | "API Gateway for SafeMate Hedera Service" | ✅ Same |
| **Type** | EDGE | REGIONAL | ✅ Different |
| **Created Date** | 2025-08-27T10:56:44+10:00 | 2025-09-21T16:25:19+10:00 | ✅ Regional is newer |
| **Lambda Integration** | `preprod-safemate-hedera-service` | `preprod-safemate-hedera-service` | ✅ **SAME FUNCTION** |
| **Environment Variables** | Same Lambda function | Same Lambda function | ✅ **IDENTICAL** |

### **Key Findings:**

#### ✅ **SAFE TO DELETE - Edge-optimized APIs**

**Reasons:**
1. **Same Lambda Function**: Both APIs use the exact same Lambda function (`preprod-safemate-hedera-service`)
2. **Identical Environment Variables**: Same database tables, KMS keys, and configuration
3. **Same Data Source**: Both APIs access the same DynamoDB tables and resources
4. **Regional is Newer**: Created 25 days later (Sept 21 vs Aug 27)
5. **More Complete**: Regional API has more endpoints (files, folders with IDs)

#### 📊 **Endpoint Comparison:**

**Edge-optimized API (`2kwe2ly8vh`) Endpoints:**
- `/transactions` (GET, OPTIONS)
- `/nft` (GET, OPTIONS)
- `/` (ANY, DELETE, GET, OPTIONS, POST, PUT)
- `/nft/create` (OPTIONS, POST)
- `/nft/list` (GET, OPTIONS)
- `/balance` (GET, OPTIONS)
- `/folders` (GET, OPTIONS, POST)

**Regional API (`uvk4xxwjyg`) Endpoints:**
- `/folders` (GET, OPTIONS, POST)
- `/folders/{folderId}` (DELETE, OPTIONS)
- `/files` (GET, OPTIONS)
- `/files/upload` (OPTIONS, POST)
- `/files/{fileId}` (DELETE, OPTIONS)
- `/files/{fileId}/content` (GET, OPTIONS)

#### 🎯 **Analysis:**

**Edge-optimized API:**
- ✅ Has `/balance` and `/transactions` endpoints
- ✅ Has NFT-related endpoints
- ❌ Missing file management endpoints
- ❌ Missing folder deletion endpoint

**Regional API:**
- ✅ Has complete folder management (create, list, delete)
- ✅ Has complete file management (upload, list, delete, content)
- ❌ Missing `/balance` and `/transactions` endpoints
- ❌ Missing NFT endpoints

---

## 🚨 **CRITICAL FINDING: Missing Endpoints**

The Regional API is **missing important endpoints** that exist in the Edge-optimized API:

### **Missing from Regional API:**
1. **`/balance`** - Account balance queries
2. **`/transactions`** - Transaction history
3. **`/nft/*`** - NFT-related operations

### **Missing from Edge-optimized API:**
1. **`/files/*`** - File management operations
2. **`/folders/{folderId}`** - Folder deletion

---

## 🛠️ **Recommended Action Plan**

### **Option 1: Complete Migration (RECOMMENDED)**
1. **Add missing endpoints to Regional API**:
   - Add `/balance` endpoint
   - Add `/transactions` endpoint
   - Add `/nft/*` endpoints
2. **Update frontend** to use Regional API for all operations
3. **Test all functionality**
4. **Delete Edge-optimized API**

### **Option 2: Hybrid Approach (TEMPORARY)**
1. **Keep both APIs temporarily**
2. **Use Regional API for folder/file operations**
3. **Use Edge-optimized API for balance/transactions**
4. **Plan complete migration later**

### **Option 3: Quick Fix (NOT RECOMMENDED)**
1. **Delete Edge-optimized API immediately**
2. **Risk**: Lose balance and transaction functionality

---

## 📋 **Detailed Endpoint Analysis**

### **Endpoints in Both APIs:**
- `/folders` (GET, POST, OPTIONS) ✅

### **Endpoints Only in Edge-optimized:**
- `/balance` (GET, OPTIONS) ❌ **MISSING IN REGIONAL**
- `/transactions` (GET, OPTIONS) ❌ **MISSING IN REGIONAL**
- `/nft` (GET, OPTIONS) ❌ **MISSING IN REGIONAL**
- `/nft/create` (POST, OPTIONS) ❌ **MISSING IN REGIONAL**
- `/nft/list` (GET, OPTIONS) ❌ **MISSING IN REGIONAL**

### **Endpoints Only in Regional:**
- `/folders/{folderId}` (DELETE, OPTIONS) ✅ **NEW FEATURE**
- `/files` (GET, OPTIONS) ✅ **NEW FEATURE**
- `/files/upload` (POST, OPTIONS) ✅ **NEW FEATURE**
- `/files/{fileId}` (DELETE, OPTIONS) ✅ **NEW FEATURE**
- `/files/{fileId}/content` (GET, OPTIONS) ✅ **NEW FEATURE**

---

## 🔧 **Lambda Function Environment Variables**

Both APIs use the **same Lambda function** with these environment variables:

```json
{
    "USER_SECRETS_TABLE": "preprod-safemate-user-secrets",
    "HEDERA_TOKENS_TABLE": "preprod-safemate-groups",
    "HEDERA_NFTS_TABLE": "preprod-safemate-group-activities",
    "COGNITO_USER_POOL_ID": "ap-southeast-2_a2rtp64JW",
    "BLOCKCHAIN_AUDIT_TABLE": "preprod-safemate-wallet-audit",
    "WALLET_AUDIT_TABLE": "preprod-safemate-wallet-audit",
    "APP_SECRETS_KMS_KEY_ID": "3b18b0c0-dd1f-41db-8bac-6ec857c1ed05",
    "HEDERA_NETWORK": "testnet",
    "HEDERA_FOLDERS_TABLE": "preprod-safemate-hedera-folders",
    "WALLET_KMS_KEY_ID": "3b18b0c0-dd1f-41db-8bac-6ec857c1ed05",
    "WALLET_METADATA_TABLE": "preprod-safemate-wallet-metadata",
    "HEDERA_CONTRACTS_TABLE": "preprod-safemate-shared-wallets",
    "WALLET_KEYS_TABLE": "preprod-safemate-wallet-keys"
}
```

**✅ All environment variables are identical** - same database tables, KMS keys, and configuration.

---

## 🎯 **Final Recommendation**

### **DO NOT DELETE YET** ❌

**Reason**: The Regional API is missing critical endpoints (`/balance`, `/transactions`, `/nft/*`) that are used by the application.

### **Next Steps:**
1. **Add missing endpoints to Regional API** in Terraform
2. **Deploy the updated Regional API**
3. **Test all functionality**
4. **Update frontend to use Regional API exclusively**
5. **Then delete Edge-optimized API**

### **Alternative:**
Keep both APIs temporarily and use a hybrid approach until complete migration is done.

---

## 📊 **Summary**

| Aspect | Edge-optimized | Regional | Recommendation |
|--------|---------------|----------|----------------|
| **Lambda Function** | ✅ Same | ✅ Same | Keep both temporarily |
| **Environment Variables** | ✅ Same | ✅ Same | Safe to migrate |
| **Endpoints** | ✅ Complete | ❌ Missing some | Add missing endpoints |
| **Age** | ❌ Older | ✅ Newer | Prefer Regional |
| **Type** | ❌ Edge | ✅ Regional | Prefer Regional |

**Conclusion**: Both APIs are safe and use identical backend resources, but the Regional API needs additional endpoints before we can safely delete the Edge-optimized one.

---

*This analysis confirms that both APIs are safe and use the same backend resources, but reveals that the Regional API is incomplete and missing critical endpoints.*
