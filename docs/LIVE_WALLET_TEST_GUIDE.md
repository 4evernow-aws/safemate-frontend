# 🧪 Live Hedera Wallet Creation Test Guide

## ✅ **Status: Lambda Function Updated Successfully**

The user onboarding Lambda function has been successfully updated with real Hedera wallet creation functionality. Here's how to test it:

## 🔧 **What Was Implemented**

### **1. Real Wallet Creation Logic**
- **File**: `services/user-onboarding/index.js`
- **Features**:
  - ✅ Real Ed25519 keypair generation using Hedera SDK
  - ✅ KMS encryption for private keys
  - ✅ DynamoDB storage for wallet metadata
  - ✅ Auto account creation using Hedera aliases
  - ✅ Proper error handling and logging

### **2. Updated Environment Variables**
- **File**: `terraform/lambda.tf`
- **Variables Added**:
  - `WALLET_KEYS_TABLE`: DynamoDB table for encrypted keys
  - `WALLET_METADATA_TABLE`: DynamoDB table for wallet metadata
  - `WALLET_KMS_KEY_ID`: KMS key for encryption
  - `COGNITO_USER_POOL_ID`: User pool for authentication

### **3. IAM Permissions**
- ✅ DynamoDB read/write permissions
- ✅ KMS encrypt/decrypt permissions
- ✅ CloudWatch logging permissions

## 🌐 **API Endpoints for Testing**

### **Base URL**: `https://nh9d5m1g4m.execute-api.ap-southeast-2.amazonaws.com/default`

### **1. Health Check**
```bash
GET /health
```

### **2. Onboarding Status**
```bash
POST /onboarding/status
Content-Type: application/json

{
  "test": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### **3. Start Wallet Creation**
```bash
POST /onboarding/start
Content-Type: application/json

{
  "user_id": "test-user-123",
  "email": "test@example.com",
  "test": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### **4. Verify Wallet**
```bash
POST /onboarding/verify
Content-Type: application/json

{
  "wallet_id": "wallet-id-from-start-response",
  "test": true
}
```

## 🧪 **Testing Methods**

### **Method 1: Using cURL**
```bash
# Test status endpoint
curl -X POST https://nh9d5m1g4m.execute-api.ap-southeast-2.amazonaws.com/default/onboarding/status \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Test wallet creation
curl -X POST https://nh9d5m1g4m.execute-api.ap-southeast-2.amazonaws.com/default/onboarding/start \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test-user-123", "email": "test@example.com", "test": true}'
```

### **Method 2: Using PowerShell**
```powershell
# Test status endpoint
Invoke-RestMethod -Uri "https://nh9d5m1g4m.execute-api.ap-southeast-2.amazonaws.com/default/onboarding/status" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"test": true}'

# Test wallet creation
Invoke-RestMethod -Uri "https://nh9d5m1g4m.execute-api.ap-southeast-2.amazonaws.com/default/onboarding/start" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"user_id": "test-user-123", "email": "test@example.com", "test": true}'
```

### **Method 3: Using AWS CLI**
```bash
# Test Lambda function directly
aws lambda invoke \
  --function-name default-safemate-user-onboarding \
  --payload '{"path": "/onboarding/start", "httpMethod": "POST", "body": "{\"user_id\": \"test-user-123\", \"email\": \"test@example.com\", \"test\": true}"}' \
  response.json \
  --region ap-southeast-2

# Check response
cat response.json
```

### **Method 4: Using Browser/Postman**
1. **URL**: `https://nh9d5m1g4m.execute-api.ap-southeast-2.amazonaws.com/default/onboarding/start`
2. **Method**: POST
3. **Headers**: `Content-Type: application/json`
4. **Body**:
```json
{
  "user_id": "test-user-123",
  "email": "test@example.com",
  "test": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 📊 **Expected Response Format**

### **Successful Wallet Creation**
```json
{
  "success": true,
  "wallet_id": "wallet-123456789",
  "hedera_account_id": "alias-0.0.123456789",
  "public_key": "302a300506032b6570032100...",
  "account_type": "auto_account",
  "network": "testnet",
  "encryption_type": "kms",
  "needs_funding": true,
  "created_at": "2024-01-01T00:00:00.000Z",
  "message": "Wallet created successfully"
}
```

### **Error Response**
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details"
}
```

## 🔍 **What to Look For**

### **✅ Success Indicators**
1. **Response Status**: 200 OK
2. **Success Field**: `true`
3. **Hedera Account ID**: Starts with `alias-` (auto account) or numeric format
4. **Wallet ID**: Generated UUID
5. **Public Key**: Valid Ed25519 public key
6. **Encryption Type**: `kms`

### **❌ Failure Indicators**
1. **Response Status**: 4xx or 5xx
2. **Success Field**: `false`
3. **Error Messages**: Check for specific error details

## 🎯 **Test Scenarios**

### **Scenario 1: Basic Wallet Creation**
- Create a wallet with minimal data
- Verify all required fields are present
- Check that account needs funding

### **Scenario 2: Duplicate User ID**
- Try to create wallet with same user_id
- Should return existing wallet or error

### **Scenario 3: Invalid Data**
- Send malformed JSON
- Send missing required fields
- Should return appropriate error messages

### **Scenario 4: Wallet Verification**
- Create a wallet
- Use the wallet_id to verify it exists
- Should return wallet details

## 🚀 **Next Steps**

1. **Test the API endpoints** using any of the methods above
2. **Verify wallet creation** in Hedera Explorer
3. **Check DynamoDB tables** for stored data
4. **Monitor CloudWatch logs** for any errors
5. **Test with real user data** from the frontend

## 📝 **Notes**

- The Lambda function now creates **real Hedera wallets** on the testnet
- Private keys are **encrypted with KMS** and stored securely
- Wallet metadata is stored in **DynamoDB**
- Auto account creation uses **Hedera aliases**
- All operations are **logged to CloudWatch**

---

**Ready to test! 🎉**
