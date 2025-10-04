# SafeMate Key Storage and Encryption Analysis

## 🔐 **Key Storage and Encryption Process**

### **1. User Creation and Key Generation**

#### **Key Generation:**
```javascript
// Generate new keypair for user
const privateKey = PrivateKey.generateED25519();
const publicKey = privateKey.publicKey;
```

#### **Key Encryption:**
```javascript
// Encrypt private key with KMS
const encryptParams = {
  KeyId: WALLET_KMS_KEY_ID,  // or APP_SECRETS_KMS_KEY_ID
  Plaintext: privateKey.toString()
};

const encryptResult = await kms.send(new EncryptCommand(encryptParams));
const encryptedPrivateKey = encryptResult.CiphertextBlob.toString('base64');
```

### **2. Key Storage in DynamoDB**

#### **Wallet Metadata Table:**
```javascript
const walletData = {
  user_id: userId,
  wallet_id: walletId,
  hedera_account_id: accountId.toString(),
  public_key: publicKey.toString(),
  account_type: 'personal',
  network: HEDERA_NETWORK,
  created_at: new Date().toISOString(),
  email: email,
  status: 'active',
  is_real_wallet: true
};
```

#### **Wallet Keys Table:**
```javascript
const keyData = {
  user_id: userId,
  wallet_id: walletId,
  account_id: accountId.toString(),
  public_key: publicKey.toString(),
  encrypted_private_key: encryptedPrivateKey,  // Base64 encoded
  key_type: 'ed25519',
  created_at: new Date().toISOString(),
  kms_key_id: WALLET_KMS_KEY_ID,
  is_real_wallet: true
};
```

### **3. Key Decryption for Usage**

#### **Retrieve Encrypted Key:**
```javascript
const keyParams = {
  TableName: WALLET_KEYS_TABLE,
  FilterExpression: 'user_id = :userId',
  ExpressionAttributeValues: {
    ':userId': userId
  }
};

const keyResult = await dynamodb.send(new ScanCommand(keyParams));
const userKey = keyResult.Items[0];
```

#### **Decrypt Private Key:**
```javascript
// Handle both base64 and comma-separated formats
let ciphertextBlob;
if (userKey.encrypted_private_key.includes(',')) {
  // Comma-separated format: convert to Buffer
  const byteArray = userKey.encrypted_private_key.split(',').map(Number);
  ciphertextBlob = Buffer.from(byteArray);
} else {
  // Base64 format
  ciphertextBlob = Buffer.from(userKey.encrypted_private_key, 'base64');
}

const decryptCommand = new DecryptCommand({
  KeyId: userKey.kms_key_id,
  CiphertextBlob: ciphertextBlob
});

const decryptResult = await kms.send(decryptCommand);
```

#### **Parse Private Key (Multiple Methods):**
```javascript
// Method 1: V46 DER extraction (preferred)
try {
  const privateKeyBase64 = Buffer.from(decryptResult.Plaintext).toString('base64');
  privateKey = extractPrivateKeyFromDer(privateKeyBase64);
  console.log('✅ SUCCESS: User private key extracted from DER structure');
} catch (derError) {
  // Method 2: Standard DER parsing
  try {
    privateKey = PrivateKey.fromStringDer(privateKeyBase64);
    console.log('✅ SUCCESS: User private key parsed as standard DER format');
  } catch (standardDerError) {
    // Method 3: Raw bytes (final fallback)
    try {
      privateKey = PrivateKey.fromBytes(decryptResult.Plaintext);
      console.log('✅ SUCCESS: User private key parsed from raw bytes');
    } catch (bytesError) {
      throw new Error(`Private key parsing failed: ${bytesError.message}`);
    }
  }
}
```

## 🔧 **Key Components and Dependencies**

### **Required AWS Services:**
1. **KMS (Key Management Service)** - For encryption/decryption
2. **DynamoDB** - For storing wallet metadata and encrypted keys
3. **Lambda** - For processing key operations

### **Required Environment Variables:**
- `WALLET_KMS_KEY_ID` - KMS key for wallet encryption
- `APP_SECRETS_KMS_KEY_ID` - Alternative KMS key
- `WALLET_METADATA_TABLE` - DynamoDB table for wallet metadata
- `WALLET_KEYS_TABLE` - DynamoDB table for encrypted keys
- `HEDERA_NETWORK` - Hedera network (testnet/mainnet)

### **Required AWS SDK Dependencies:**
- `@aws-sdk/client-kms` - For KMS operations
- `@aws-sdk/client-dynamodb` - For DynamoDB operations
- `@aws-sdk/lib-dynamodb` - For DynamoDB document operations

## 🚨 **Potential Issues Causing 502 Errors**

### **1. KMS Key Issues:**
- **Missing KMS Key**: `WALLET_KMS_KEY_ID` not set or invalid
- **KMS Permissions**: Lambda role lacks KMS decrypt permissions
- **KMS Key State**: Key is disabled or deleted

### **2. DynamoDB Issues:**
- **Missing Tables**: `WALLET_KEYS_TABLE` or `WALLET_METADATA_TABLE` don't exist
- **DynamoDB Permissions**: Lambda role lacks DynamoDB read permissions
- **Table Names**: Incorrect table names in environment variables

### **3. Key Format Issues:**
- **Encryption Format**: Keys stored in wrong format (base64 vs comma-separated)
- **DER Parsing**: Private key DER structure issues
- **Key Mismatch**: Public key doesn't match derived key

### **4. Environment Variable Issues:**
- **Missing Variables**: Required environment variables not set
- **Wrong Values**: Environment variables point to wrong resources
- **Region Mismatch**: KMS/DynamoDB in different region than Lambda

## 🔍 **Debugging Steps**

### **1. Check Environment Variables:**
```javascript
console.log('WALLET_KMS_KEY_ID:', process.env.WALLET_KMS_KEY_ID);
console.log('WALLET_KEYS_TABLE:', process.env.WALLET_KEYS_TABLE);
console.log('WALLET_METADATA_TABLE:', process.env.WALLET_METADATA_TABLE);
```

### **2. Check KMS Key:**
```javascript
// Test KMS key access
try {
  const testEncrypt = await kms.send(new EncryptCommand({
    KeyId: WALLET_KMS_KEY_ID,
    Plaintext: 'test'
  }));
  console.log('✅ KMS key accessible');
} catch (error) {
  console.error('❌ KMS key error:', error.message);
}
```

### **3. Check DynamoDB Tables:**
```javascript
// Test DynamoDB access
try {
  const testScan = await dynamodb.send(new ScanCommand({
    TableName: WALLET_KEYS_TABLE,
    Limit: 1
  }));
  console.log('✅ DynamoDB table accessible');
} catch (error) {
  console.error('❌ DynamoDB error:', error.message);
}
```

## 💡 **Recommendations**

1. **Verify Environment Variables**: Ensure all required variables are set
2. **Check AWS Permissions**: Verify Lambda role has KMS and DynamoDB permissions
3. **Test Key Operations**: Test encryption/decryption with sample data
4. **Monitor CloudWatch Logs**: Check for specific error messages
5. **Validate Key Format**: Ensure keys are stored in correct format
