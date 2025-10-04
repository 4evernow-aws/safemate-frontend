# SafeMate Lambda Function Dependencies - Complete List

## 🔍 **All Lambda Dependencies Required**

Based on the code analysis of `v47-2-extract/index.js`, here are ALL the dependencies the Lambda function needs:

### **1. Core Node.js Modules (Built-in - No Installation Required)**
- `crypto` - For UUID generation and SHA-256 hashing
- `fs` - For file system operations (if any)
- `path` - For path operations (if any)

### **2. AWS SDK Dependencies (External - Must be Installed)**
- `@aws-sdk/client-dynamodb` - For DynamoDB operations
- `@aws-sdk/lib-dynamodb` - For DynamoDB document operations (GetCommand, PutCommand, QueryCommand, DeleteCommand, ScanCommand)
- `@aws-sdk/client-kms` - For KMS encryption/decryption (DecryptCommand, EncryptCommand)

### **3. Hedera SDK Dependencies (External - Must be Installed)**
- `@hashgraph/sdk` - Main Hedera SDK for blockchain operations

## 📦 **Complete package.json for Lambda Deployment**

```json
{
  "name": "safemate-hedera-service",
  "version": "47.14.7",
  "description": "SafeMate Hedera Service Lambda Function - Complete Dependencies",
  "main": "index.js",
  "dependencies": {
    "@aws-sdk/client-dynamodb": "^3.0.0",
    "@aws-sdk/lib-dynamodb": "^3.0.0", 
    "@aws-sdk/client-kms": "^3.0.0",
    "@hashgraph/sdk": "^2.39.0"
  }
}
```

## 🔧 **Specific Usage in Code**

### **AWS SDK Usage:**
- `DynamoDBClient` - For DynamoDB connections
- `DynamoDBDocumentClient` - For document operations
- `GetCommand, PutCommand, QueryCommand, DeleteCommand, ScanCommand` - For DynamoDB operations
- `KMSClient, DecryptCommand, EncryptCommand` - For KMS operations

### **Hedera SDK Usage:**
- `Client, AccountId, PrivateKey` - For Hedera blockchain operations
- `TokenCreateTransaction, TokenInfoQuery, AccountInfoQuery` - For NFT operations
- `TokenMintTransaction, TokenBurnTransaction` - For token operations

### **Node.js Built-in Usage:**
- `crypto.randomUUID()` - For UUID generation
- `crypto.createHash('sha256')` - For content hashing

## 🚨 **Current Issue**

The Lambda function is returning **502 Internal Server Error** because these external dependencies are missing from the deployment package:

1. **Missing `@hashgraph/sdk`** - Causes runtime error when trying to create Hedera client
2. **Missing `@aws-sdk/client-dynamodb`** - Causes runtime error when trying to connect to DynamoDB
3. **Missing `@aws-sdk/lib-dynamodb`** - Causes runtime error when trying to perform DynamoDB operations
4. **Missing `@aws-sdk/client-kms`** - Causes runtime error when trying to decrypt/encrypt with KMS

## ✅ **Solution**

Deploy the Lambda function with ALL dependencies included in the deployment package:

1. **Include node_modules** with all required packages
2. **Use correct package versions** that are compatible
3. **Test the deployment** to ensure all dependencies are available

## 📊 **Package Size Considerations**

- **Hedera SDK**: ~15-20MB
- **AWS SDK packages**: ~10-15MB each
- **Total estimated size**: ~50-70MB
- **Lambda limit**: 50MB (unzipped), 250MB (zipped)

## 🎯 **Deployment Strategy**

1. **Create deployment package** with all dependencies
2. **Check package size** before deployment
3. **Use Lambda layers** if package is too large
4. **Test functionality** after deployment
