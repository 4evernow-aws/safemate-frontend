# SafeMate Coding Standards and Best Practices

## 🎯 **Current Standards Analysis**

### **What We're Currently Using:**
- **Module System**: CommonJS (`require()` statements)
- **Node.js Version**: 18.x (Lambda runtime)
- **Hedera SDK**: `@hashgraph/sdk` version 2.73.2
- **AWS SDK**: `@aws-sdk/*` packages (CommonJS compatible)
- **Runtime**: AWS Lambda Node.js 18.x

### **The Problem:**
- **Hedera SDK**: Configured as ES module (`"type": "module"`)
- **Lambda Runtime**: Expects CommonJS (`require()`)
- **Conflict**: ES module cannot be imported with `require()`

## 📋 **Recommended Standards**

### **1. Module System Standard: CommonJS**
**Why CommonJS?**
- ✅ **Lambda Compatibility**: AWS Lambda Node.js runtime supports CommonJS natively
- ✅ **AWS SDK Compatibility**: All AWS SDK packages use CommonJS
- ✅ **Stability**: CommonJS is more stable in serverless environments
- ✅ **Wide Support**: Most Node.js libraries support CommonJS

**Implementation:**
```javascript
// ✅ CORRECT - Use CommonJS require()
const { Client, AccountId, PrivateKey } = require('@hashgraph/sdk');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { KMSClient } = require('@aws-sdk/client-kms');
```

### **2. Hedera SDK Version Standard**
**Recommended Version**: `@hashgraph/sdk@2.39.0` (CommonJS compatible)
**Why this version?**
- ✅ **CommonJS Support**: Built for CommonJS `require()`
- ✅ **Lambda Compatible**: Tested with AWS Lambda
- ✅ **Stable**: Mature version with proven compatibility
- ✅ **Full Feature Set**: All required Hedera operations supported

### **3. Node.js Runtime Standard**
**Current**: Node.js 18.x (AWS Lambda)
**Why Node.js 18?**
- ✅ **LTS Support**: Long-term support version
- ✅ **Lambda Support**: Native AWS Lambda runtime
- ✅ **Performance**: Optimized for serverless
- ✅ **Security**: Latest security patches

### **4. Package Management Standard**
**Use**: `package.json` with CommonJS dependencies
```json
{
  "name": "safemate-hedera-service",
  "version": "1.0.0",
  "type": "commonjs",
  "main": "index.js",
  "dependencies": {
    "@hashgraph/sdk": "2.39.0",
    "@aws-sdk/client-dynamodb": "^3.0.0",
    "@aws-sdk/lib-dynamodb": "^3.0.0",
    "@aws-sdk/client-kms": "^3.0.0"
  }
}
```

### **5. Key Storage and Encryption Standard**
**Current Implementation (✅ CORRECT):**
- **Encryption**: AWS KMS for private key encryption
- **Storage**: DynamoDB for encrypted key storage
- **Access Control**: IAM roles with least privilege
- **Key Format**: ED25519 keys with DER encoding
- **Decryption**: Multiple fallback methods (DER, raw bytes)

## 🔧 **Implementation Standards**

### **1. Import/Require Pattern**
```javascript
// ✅ CORRECT - CommonJS pattern
const { Client, AccountId, PrivateKey } = require('@hashgraph/sdk');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { KMSClient, DecryptCommand, EncryptCommand } = require('@aws-sdk/client-kms');
const { randomUUID } = require('crypto');
```

### **2. Error Handling Standard**
```javascript
// ✅ CORRECT - Comprehensive error handling
try {
  const client = await initializeHederaClient();
  // ... operations
} catch (error) {
  console.error('❌ Hedera operation failed:', error.message);
  return {
    success: false,
    error: error.message
  };
}
```

### **3. Logging Standard**
```javascript
// ✅ CORRECT - Structured logging
console.log('🔧 Initializing Hedera client for user account:', accountId);
console.log('✅ Hedera account created:', accountId.toString());
console.error('❌ Error getting folder collection token:', error);
```

### **4. Environment Variables Standard**
```javascript
// ✅ CORRECT - Environment variable usage
const WALLET_KMS_KEY_ID = process.env.WALLET_KMS_KEY_ID;
const WALLET_KEYS_TABLE = process.env.WALLET_KEYS_TABLE;
const HEDERA_NETWORK = process.env.HEDERA_NETWORK || 'testnet';
```

## 🚨 **What NOT to Use**

### **❌ Avoid ES Modules in Lambda**
```javascript
// ❌ WRONG - ES module imports
import { Client } from '@hashgraph/sdk';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
```

### **❌ Avoid Latest SDK Versions**
```json
// ❌ WRONG - Latest versions may have ES module issues
{
  "dependencies": {
    "@hashgraph/sdk": "^2.73.2"  // ES module version
  }
}
```

### **❌ Avoid Mixed Module Systems**
```javascript
// ❌ WRONG - Mixing require() and import()
const { Client } = require('@hashgraph/sdk');
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
```

## 🎯 **Hedera's Recommended Standards**

### **1. Official Hedera Documentation**
- **SDK Version**: Use stable, CommonJS-compatible versions
- **Node.js**: Node.js 18+ for production
- **Key Management**: Use proper key derivation and storage
- **Error Handling**: Implement comprehensive error handling

### **2. Security Standards**
- **Private Key Storage**: Always encrypt with KMS
- **Access Control**: Use IAM roles with least privilege
- **Key Rotation**: Implement regular key rotation
- **Audit Logging**: Log all sensitive operations

### **3. Performance Standards**
- **Connection Pooling**: Reuse Hedera client connections
- **Timeout Handling**: Implement proper timeout management
- **Memory Management**: Optimize for Lambda memory limits
- **Cold Start Optimization**: Minimize initialization time

## 📊 **Current Status vs Standards**

| Component | Current | Standard | Status |
|-----------|---------|----------|--------|
| Module System | ES Module (2.73.2) | CommonJS (2.39.0) | ❌ Needs Fix |
| Node.js Runtime | 18.x | 18.x | ✅ Correct |
| AWS SDK | CommonJS | CommonJS | ✅ Correct |
| Key Storage | KMS + DynamoDB | KMS + DynamoDB | ✅ Correct |
| Error Handling | Comprehensive | Comprehensive | ✅ Correct |

## 🔧 **Action Required**

1. **Downgrade Hedera SDK**: Use version 2.39.0 (CommonJS compatible)
2. **Update package.json**: Set `"type": "commonjs"`
3. **Test Compatibility**: Verify all imports work with `require()`
4. **Deploy and Test**: Ensure 502 errors are resolved

## 💡 **Benefits of Following Standards**

- ✅ **Reliability**: Consistent behavior across environments
- ✅ **Maintainability**: Easier to debug and update
- ✅ **Compatibility**: Works with AWS Lambda out of the box
- ✅ **Performance**: Optimized for serverless environments
- ✅ **Security**: Follows AWS and Hedera best practices
