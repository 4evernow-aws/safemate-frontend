# SafeMate Hedera Credentials Architecture

**Date**: September 23, 2025  
**Environment**: Pre-production (Preprod)  
**Status**: ✅ **CRITICAL DOCUMENTATION UPDATE**

---

## 🚨 **IMPORTANT: Hedera Operator Credentials Storage**

### **✅ CORRECT ARCHITECTURE:**
**SafeMate uses DynamoDB to store Hedera operator credentials, NOT Secrets Manager.**

---

## 🏗️ **Actual Credentials Architecture**

### **1. Hedera Operator Credentials Storage**
- **Storage Location**: DynamoDB Table (`wallet_keys`)
- **Table Name**: `preprod-safemate-wallet-keys`
- **Key**: `user_id: 'hedera_operator'`
- **Encryption**: KMS-encrypted private keys
- **Access Pattern**: All Lambda functions retrieve credentials from DynamoDB

### **2. DynamoDB Schema for Operator Credentials**
```json
{
  "user_id": "hedera_operator",
  "account_id": "0.0.6428427",
  "encrypted_private_key": "base64-encoded-kms-encrypted-key",
  "created_at": "2025-09-21T10:00:00Z",
  "updated_at": "2025-09-21T10:00:00Z"
}
```

### **3. KMS Encryption**
- **KMS Key**: `preprod-safemate-master-key`
- **Key ID**: `3b18b0c0-dd1f-41db-8bac-6ec857c1ed05`
- **Encryption Method**: AWS KMS Encrypt/Decrypt
- **Key Format**: DER-encoded private keys

---

## 🔧 **How Lambda Functions Access Credentials**

### **Standard Pattern Used by All Services:**

```javascript
// 1. Initialize AWS services
const dynamodb = new AWS.DynamoDB.DocumentClient();
const kms = new AWS.KMS();

// 2. Get operator credentials from DynamoDB
async function getOperatorCredentials() {
    const params = {
        TableName: process.env.WALLET_KEYS_TABLE,
        Key: { user_id: 'hedera_operator' }
    };
    
    const result = await dynamodb.get(params).promise();
    
    if (!result.Item) {
        throw new Error('No operator credentials found in DynamoDB');
    }
    
    // 3. Decrypt private key using KMS
    const decryptedKey = await decryptPrivateKey(
        result.Item.encrypted_private_key,
        process.env.APP_SECRETS_KMS_KEY_ID
    );
    
    return {
        accountId: result.Item.account_id,
        privateKey: decryptedKey
    };
}

// 4. Decrypt function
async function decryptPrivateKey(encryptedKey, kmsKeyId) {
    const decryptCommand = new AWS.KMS.DecryptCommand({
        KeyId: kmsKeyId,
        CiphertextBlob: Buffer.from(encryptedKey, 'base64')
    });
    
    const decryptResult = await kms.send(decryptCommand);
    return decryptResult.Plaintext.toString();
}
```

---

## 📋 **Environment Variables Required**

### **All Hedera-related Lambda functions need:**
```bash
WALLET_KEYS_TABLE=preprod-safemate-wallet-keys
APP_SECRETS_KMS_KEY_ID=3b18b0c0-dd1f-41db-8bac-6ec857c1ed05
HEDERA_NETWORK=testnet
```

---

## 🚫 **What We DON'T Use**

### **❌ Secrets Manager for Hedera Credentials**
- **NOT USED**: AWS Secrets Manager for Hedera operator credentials
- **REASON**: All credentials are stored in DynamoDB with KMS encryption
- **CONFUSION SOURCE**: This keeps causing documentation errors

### **❌ Environment Variables for Credentials**
- **NOT USED**: Direct environment variables for Hedera credentials
- **REASON**: Security best practice - credentials encrypted in DynamoDB

---

## 🔍 **Services Using This Pattern**

### **✅ Services Correctly Using DynamoDB:**
1. **hedera-service** (`services/hedera-service/index.js`)
2. **user-onboarding** (`services/user-onboarding/index.js`)
3. **post-confirmation-wallet-creator** (`services/post-confirmation-wallet-creator/index.js`)

### **📁 Key Files:**
- `services/hedera-service/hedera-client.js` - Shared utility for credential retrieval
- `services/hedera-service/index.js` - Main Hedera operations
- `services/user-onboarding/index.js` - User onboarding with wallet creation

---

## 🛠️ **IAM Permissions Required**

### **DynamoDB Permissions:**
```json
{
    "Effect": "Allow",
    "Action": [
        "dynamodb:GetItem",
        "dynamodb:Query"
    ],
    "Resource": "arn:aws:dynamodb:ap-southeast-2:*:table/preprod-safemate-wallet-keys"
}
```

### **KMS Permissions:**
```json
{
    "Effect": "Allow",
    "Action": [
        "kms:Decrypt"
    ],
    "Resource": "arn:aws:kms:ap-southeast-2:*:key/3b18b0c0-dd1f-41db-8bac-6ec857c1ed05"
}
```

---

## 📚 **Documentation Updates Needed**

### **Files That Need Correction:**
1. ✅ `README.md` - Remove Secrets Manager reference for Hedera
2. ✅ `HEDERA_FOLDER_CREATION_MAP.md` - Update credential storage method
3. ✅ `HEDERA_WALLET_CREATION_MAP.md` - Update credential storage method
4. ✅ All Lambda function documentation
5. ✅ Architecture diagrams and flow charts

---

## 🎯 **Key Takeaways**

### **✅ DO:**
- Use DynamoDB (`wallet_keys` table) for Hedera operator credentials
- Encrypt private keys with KMS before storing in DynamoDB
- Use the standard `getOperatorCredentials()` pattern in all Lambda functions
- Reference `user_id: 'hedera_operator'` as the DynamoDB key

### **❌ DON'T:**
- Use Secrets Manager for Hedera operator credentials
- Store unencrypted credentials in environment variables
- Assume credentials are in Secrets Manager
- Create new credential storage patterns

---

## 🔧 **Troubleshooting**

### **Common Issues:**
1. **"No operator credentials found"** - Check DynamoDB table has `hedera_operator` record
2. **KMS decryption errors** - Verify KMS key permissions and key ID
3. **DynamoDB access errors** - Check IAM permissions for `wallet_keys` table

### **Verification Commands:**
```bash
# Check DynamoDB record exists
aws dynamodb get-item --table-name preprod-safemate-wallet-keys --key '{"user_id":{"S":"hedera_operator"}}'

# Check KMS key exists
aws kms describe-key --key-id 3b18b0c0-dd1f-41db-8bac-6ec857c1ed05
```

---

**This document should be referenced whenever working with Hedera credentials to prevent confusion about the storage architecture.**
