# Cursor Instructions: SafeMate KMS + Secrets Manager Migration

## 🎯 **Mission**: Migrate SafeMate from DynamoDB private key storage to AWS KMS + Secrets Manager for enterprise-grade security

## 📋 **Phase 1: Infrastructure Setup (Terraform)**

### **Task 1.1: Create KMS Infrastructure**

**File**: `terraform/kms.tf`

Create a new Terraform file with:

```hcl
# KMS Master Key for SafeMate encryption
resource "aws_kms_key" "safemate_master_key" {
  description             = "SafeMate master encryption key for private key protection"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "Enable IAM User Permissions"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::994220462693:root"
        }
        Action   = "kms:*"
        Resource = "*"
      },
      {
        Sid    = "Allow Lambda Functions"
        Effect = "Allow"
        Principal = {
          AWS = [
            "arn:aws:iam::994220462693:role/default-safemate-user-onboarding-role",
            "arn:aws:iam::994220462693:role/default-safemate-wallet-manager-role",
            "arn:aws:iam::994220462693:role/default-safemate-hedera-service-role",
            "arn:aws:iam::994220462693:role/default-safemate-group-manager-role",
            "arn:aws:iam::994220462693:role/default-safemate-token-vault-role"
          ]
        }
        Action = [
          "kms:Decrypt",
          "kms:GenerateDataKey*",
          "kms:CreateGrant",
          "kms:DescribeKey"
        ]
        Resource = "*"
        Condition = {
          StringEquals = {
            "kms:ViaService" = "secretsmanager.ap-southeast-2.amazonaws.com"
          }
        }
      }
    ]
  })

  tags = {
    Name        = "SafeMate Master Key"
    Environment = "development"
    Service     = "safemate"
    Migration   = "kms-enhancement"
  }
}

resource "aws_kms_alias" "safemate_master_key_alias" {
  name          = "alias/safemate-master-key-dev"
  target_key_id = aws_kms_key.safemate_master_key.key_id
}

# Output the KMS key ARN for use in other resources
output "safemate_kms_key_arn" {
  value = aws_kms_key.safemate_master_key.arn
}

output "safemate_kms_key_id" {
  value = aws_kms_key.safemate_master_key.key_id
}
```

### **Task 1.2: Create Secrets Manager Infrastructure**

**File**: `terraform/secrets_manager.tf`

```hcl
# Secrets Manager for storing encrypted private keys
resource "aws_secretsmanager_secret" "hedera_private_keys" {
  name                    = "safemate/hedera/private-keys-dev"
  description             = "SafeMate Hedera private keys encrypted with KMS"
  kms_key_id             = aws_kms_key.safemate_master_key.arn
  recovery_window_in_days = 7

  # Cross-region replica for disaster recovery
  replica {
    region     = "us-east-1"
    kms_key_id = aws_kms_key.safemate_master_key.arn
  }

  tags = {
    Name        = "SafeMate Hedera Keys"
    Environment = "development"
    Service     = "safemate"
    Migration   = "kms-enhancement"
  }
}

# IAM policy for Secrets Manager access
resource "aws_secretsmanager_secret_policy" "hedera_private_keys_policy" {
  secret_arn = aws_secretsmanager_secret.hedera_private_keys.arn

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowLambdaAccess"
        Effect    = "Allow"
        Principal = {
          AWS = [
            "arn:aws:iam::994220462693:role/default-safemate-user-onboarding-role",
            "arn:aws:iam::994220462693:role/default-safemate-wallet-manager-role"
          ]
        }
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:PutSecretValue",
          "secretsmanager:UpdateSecret",
          "secretsmanager:CreateSecret"
        ]
        Resource = "*"
      }
    ]
  })
}

# Output the secrets manager ARN
output "secrets_manager_arn" {
  value = aws_secretsmanager_secret.hedera_private_keys.arn
}
```

### **Task 1.3: Update IAM Policies**

**File**: `terraform/iam_kms_policies.tf`

```hcl
# Enhanced IAM policy for KMS and Secrets Manager access
resource "aws_iam_policy" "safemate_kms_secrets_access" {
  name        = "SafeMateLambdaKMSSecretsAccess"
  description = "Allow SafeMate Lambda functions to access KMS and Secrets Manager"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:GenerateDataKey*",
          "kms:CreateGrant",
          "kms:DescribeKey",
          "kms:ReEncrypt*"
        ]
        Resource = [aws_kms_key.safemate_master_key.arn]
      },
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:PutSecretValue",
          "secretsmanager:UpdateSecret",
          "secretsmanager:CreateSecret",
          "secretsmanager:DescribeSecret"
        ]
        Resource = [
          "${aws_secretsmanager_secret.hedera_private_keys.arn}*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:ListSecrets"
        ]
        Resource = "*"
        Condition = {
          StringLike = {
            "secretsmanager:Name" = "safemate/*"
          }
        }
      }
    ]
  })
}

# Attach the policy to existing Lambda roles
resource "aws_iam_role_policy_attachment" "user_onboarding_kms_secrets" {
  role       = "default-safemate-user-onboarding-role"
  policy_arn = aws_iam_policy.safemate_kms_secrets_access.arn
}

resource "aws_iam_role_policy_attachment" "wallet_manager_kms_secrets" {
  role       = "default-safemate-wallet-manager-role"
  policy_arn = aws_iam_policy.safemate_kms_secrets_access.arn
}

resource "aws_iam_role_policy_attachment" "hedera_service_kms_secrets" {
  role       = "default-safemate-hedera-service-role"
  policy_arn = aws_iam_policy.safemate_kms_secrets_access.arn
}
```

### **Task 1.4: Deploy Infrastructure**

Run these commands in the terraform directory:

```bash
# Initialize and plan
terraform init
terraform plan -target=aws_kms_key.safemate_master_key
terraform plan -target=aws_secretsmanager_secret.hedera_private_keys

# Apply infrastructure
terraform apply -target=aws_kms_key.safemate_master_key
terraform apply -target=aws_secretsmanager_secret.hedera_private_keys
terraform apply -target=aws_iam_policy.safemate_kms_secrets_access
```

## 📋 **Phase 2: Lambda Function Updates**

### **Task 2.1: Create Secure Key Manager Module**

**File**: `services/shared/secure-key-manager.js`

```javascript
const { 
  SecretsManagerClient, 
  GetSecretValueCommand, 
  PutSecretValueCommand 
} = require('@aws-sdk/client-secrets-manager');
const { 
  KMSClient, 
  GenerateDataKeyCommand, 
  DecryptCommand 
} = require('@aws-sdk/client-kms');
const crypto = require('crypto');

class SecureKeyManager {
  constructor() {
    this.region = 'ap-southeast-2';
    this.secretsClient = new SecretsManagerClient({ region: this.region });
    this.kmsClient = new KMSClient({ region: this.region });
    this.kmsKeyId = 'alias/safemate-master-key-dev';
    this.secretName = 'safemate/hedera/private-keys-dev';
  }

  async generateSecureKeypair(userId) {
    try {
      console.log(`🔐 Generating secure keypair for user: ${userId}`);
      
      // Generate Ed25519 keypair using existing Hedera logic
      const { Ed25519PrivateKey } = require('@hashgraph/sdk');
      const { privateKey, publicKey } = Ed25519PrivateKey.generate();
      
      // Create envelope encryption for private key
      const encryptedKey = await this.encryptPrivateKey(privateKey.toString());
      
      // Store in Secrets Manager with user-specific path
      const secretValue = {
        userId: userId,
        encryptedPrivateKey: encryptedKey.encryptedData,
        dataKeyEncrypted: encryptedKey.encryptedDataKey,
        authTag: encryptedKey.authTag,
        publicKey: publicKey.toString(),
        accountAlias: `alias-${publicKey.toStringRaw()}`,
        createdAt: new Date().toISOString(),
        version: '2.0-kms',
        security: 'kms-enhanced'
      };

      await this.storeSecureSecret(userId, secretValue);
      
      console.log(`✅ Secure keypair generated for user: ${userId}`);
      
      return {
        userId,
        accountAlias: secretValue.accountAlias,
        publicKey: secretValue.publicKey,
        encryptionInfo: {
          kmsKeyId: this.kmsKeyId,
          secretName: `${this.secretName}/${userId}`
        }
      };
    } catch (error) {
      console.error('🔴 Secure keypair generation failed:', error);
      throw error;
    }
  }

  async encryptPrivateKey(privateKeyString) {
    try {
      // Generate data key for envelope encryption
      const dataKeyCommand = new GenerateDataKeyCommand({
        KeyId: this.kmsKeyId,
        KeySpec: 'AES_256'
      });
      
      const dataKeyResponse = await this.kmsClient.send(dataKeyCommand);
      
      // Encrypt private key with data key using AES-GCM
      const cipher = crypto.createCipher('aes-256-gcm', dataKeyResponse.Plaintext);
      let encryptedData = cipher.update(privateKeyString, 'utf8', 'base64');
      encryptedData += cipher.final('base64');
      
      return {
        encryptedData,
        encryptedDataKey: Buffer.from(dataKeyResponse.CiphertextBlob).toString('base64'),
        authTag: cipher.getAuthTag().toString('base64')
      };
    } catch (error) {
      console.error('🔴 Private key encryption failed:', error);
      throw error;
    }
  }

  async decryptPrivateKey(encryptedData, encryptedDataKey, authTag) {
    try {
      // Decrypt data key with KMS
      const decryptCommand = new DecryptCommand({
        CiphertextBlob: Buffer.from(encryptedDataKey, 'base64')
      });
      
      const decryptResponse = await this.kmsClient.send(decryptCommand);
      
      // Decrypt private key with data key
      const decipher = crypto.createDecipher('aes-256-gcm', decryptResponse.Plaintext);
      decipher.setAuthTag(Buffer.from(authTag, 'base64'));
      
      let decryptedData = decipher.update(encryptedData, 'base64', 'utf8');
      decryptedData += decipher.final('utf8');
      
      return decryptedData;
    } catch (error) {
      console.error('🔴 Private key decryption failed:', error);
      throw error;
    }
  }

  async storeSecureSecret(userId, secretValue) {
    try {
      const putSecretCommand = new PutSecretValueCommand({
        SecretId: `${this.secretName}/${userId}`,
        SecretString: JSON.stringify(secretValue)
      });
      
      return await this.secretsClient.send(putSecretCommand);
    } catch (error) {
      console.error('🔴 Secret storage failed:', error);
      throw error;
    }
  }

  async retrieveSecureSecret(userId) {
    try {
      const getSecretCommand = new GetSecretValueCommand({
        SecretId: `${this.secretName}/${userId}`,
        VersionStage: 'AWSCURRENT'
      });
      
      const response = await this.secretsClient.send(getSecretCommand);
      return JSON.parse(response.SecretString);
    } catch (error) {
      if (error.name === 'ResourceNotFoundException') {
        return null; // User doesn't have a wallet yet
      }
      console.error('🔴 Secret retrieval failed:', error);
      throw error;
    }
  }
}

module.exports = { SecureKeyManager };
```

### **Task 2.2: Update User Onboarding Lambda**

**File**: `services/user-onboarding/kms-enhanced.js`

```javascript
const { SecureKeyManager } = require('../shared/secure-key-manager');

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
};

// JWT validation function (keep your existing implementation)
function validateJWTAndGetUserInfo(event) {
  // Your existing JWT validation logic
  const authHeader = event.headers?.Authorization || event.headers?.authorization;
  if (!authHeader) {
    throw new Error('No authorization header');
  }
  
  // Extract and validate JWT token
  const token = authHeader.replace('Bearer ', '');
  // Add your JWT validation logic here
  
  return {
    userId: 'extracted-from-jwt',
    email: 'extracted-from-jwt'
  };
}

exports.handler = async (event) => {
  console.log('🚀 KMS-Enhanced User Onboarding Handler');
  
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  const keyManager = new SecureKeyManager();
  
  try {
    // Validate JWT and get user info
    const userInfo = validateJWTAndGetUserInfo(event);
    console.log(`👤 Processing request for user: ${userInfo.userId}`);
    
    // Parse request body
    const requestBody = event.body ? JSON.parse(event.body) : {};
    const action = requestBody.action || 'status';
    
    if (action === 'start' || event.path?.includes('/start')) {
      // Create new secure wallet
      console.log(`🆕 Creating new secure wallet for user: ${userInfo.userId}`);
      
      // Check if user already has secure wallet
      const existingWallet = await keyManager.retrieveSecureSecret(userInfo.userId);
      
      if (existingWallet) {
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            success: true,
            hasWallet: true,
            hedera_account_id: existingWallet.accountAlias,
            public_key: existingWallet.publicKey,
            security: 'kms-enhanced',
            account_type: 'auto_created_secure',
            message: 'Secure wallet already exists'
          })
        };
      }
      
      // Generate new secure wallet
      const secureWallet = await keyManager.generateSecureKeypair(userInfo.userId);
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          hedera_account_id: secureWallet.accountAlias,
          public_key: secureWallet.publicKey,
          wallet_id: `wallet-${Date.now()}-kms`,
          security: 'kms-enhanced',
          account_type: 'auto_created_secure',
          needs_funding: true,
          encryption_info: secureWallet.encryptionInfo,
          message: 'Secure wallet created with KMS encryption',
          funding_instructions: 'Send HBAR to this account alias to activate it on the Hedera network.'
        })
      };
      
    } else {
      // Get wallet status
      console.log(`📊 Getting wallet status for user: ${userInfo.userId}`);
      
      const walletData = await keyManager.retrieveSecureSecret(userInfo.userId);
      
      if (!walletData) {
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            success: true,
            hasWallet: false,
            security: 'kms-enhanced',
            message: 'No secure wallet found'
          })
        };
      }
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          hasWallet: true,
          accountId: walletData.accountAlias,
          publicKey: walletData.publicKey,
          security: 'kms-enhanced',
          isActive: false, // Check actual Hedera network status
          needsFunding: true,
          created: walletData.createdAt,
          version: walletData.version
        })
      };
    }
    
  } catch (error) {
    console.error('🔴 Handler error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        error: 'Internal server error',
        security: 'kms-enhanced',
        message: error.message
      })
    };
  }
};
```

### **Task 2.3: Package Dependencies**

**File**: `services/user-onboarding/package.json`

```json
{
  "name": "safemate-user-onboarding-kms",
  "version": "2.0.0",
  "description": "SafeMate user onboarding with KMS encryption",
  "main": "kms-enhanced.js",
  "dependencies": {
    "@aws-sdk/client-secrets-manager": "^3.490.0",
    "@aws-sdk/client-kms": "^3.490.0",
    "@aws-sdk/client-dynamodb": "^3.490.0",
    "@hashgraph/sdk": "^2.40.0",
    "crypto": "^1.0.1",
    "jsonwebtoken": "^9.0.2"
  }
}
```

### **Task 2.4: Deploy Lambda Function**

Run these commands:

```bash
# Navigate to user-onboarding directory
cd services/user-onboarding

# Install dependencies
npm install

# Create deployment package
zip -r kms-enhanced-deployment.zip kms-enhanced.js ../shared/secure-key-manager.js package.json node_modules/

# Update Lambda function
aws lambda update-function-code \
  --function-name default-safemate-user-onboarding \
  --zip-file fileb://kms-enhanced-deployment.zip

# Update handler to new file
aws lambda update-function-configuration \
  --function-name default-safemate-user-onboarding \
  --handler kms-enhanced.handler
```

## 📋 **Phase 3: Frontend Updates**

### **Task 3.1: Update Wallet Service**

**File**: `safemate/src/services/secureWalletService.ts`

```typescript
interface SecureWalletResponse {
  success: boolean;
  hedera_account_id?: string;
  public_key?: string;
  security: 'kms-enhanced' | 'basic';
  account_type?: string;
  encryption_info?: {
    kmsKeyId: string;
    secretName: string;
  };
  message: string;
  needs_funding?: boolean;
  version?: string;
}

export class SecureWalletService {
  private apiBaseUrl = 'https://k9zlxsdx2e.execute-api.ap-southeast-2.amazonaws.com/default';

  async createSecureWallet(userId: string, token: string): Promise<SecureWalletResponse> {
    console.log('🔐 Creating secure wallet with KMS encryption');
    
    const response = await fetch(`${this.apiBaseUrl}/onboarding/start`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        userId,
        action: 'start',
        securityLevel: 'kms-enhanced'
      })
    });

    if (!response.ok) {
      throw new Error(`Secure wallet creation failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Secure wallet created:', result);
    
    return result;
  }

  async getSecureWalletStatus(userId: string, token: string): Promise<SecureWalletResponse> {
    const response = await fetch(`${this.apiBaseUrl}/onboarding/status`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        userId,
        action: 'status',
        securityLevel: 'kms-enhanced'
      })
    });

    if (!response.ok) {
      throw new Error(`Secure wallet status check failed: ${response.statusText}`);
    }

    return response.json();
  }
}

// Export for use in HederaContext
export const secureWalletService = new SecureWalletService();
```

### **Task 3.2: Update Hedera Context**

**File**: `safemate/src/contexts/HederaContext.tsx`

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { secureWalletService } from '../services/secureWalletService';

interface HederaContextType {
  wallet: any;
  accountId: string | null;
  isLoading: boolean;
  securityLevel: 'basic' | 'kms-enhanced';
  createSecureWallet: () => Promise<void>;
  getWalletStatus: () => Promise<void>;
}

const HederaContext = createContext<HederaContextType>({
  wallet: null,
  accountId: null,
  isLoading: false,
  securityLevel: 'basic',
  createSecureWallet: async () => {},
  getWalletStatus: async () => {}
});

export const HederaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [securityLevel, setSecurityLevel] = useState<'basic' | 'kms-enhanced'>('basic');

  const createSecureWallet = async () => {
    setIsLoading(true);
    try {
      console.log('🔐 Creating secure wallet...');
      
      // Get user ID and token from your auth context
      const userId = 'user-id-from-auth'; // Replace with actual auth context
      const token = 'jwt-token-from-auth'; // Replace with actual auth context
      
      const result = await secureWalletService.createSecureWallet(userId, token);
      
      if (result.success) {
        setWallet(result);
        setAccountId(result.hedera_account_id || null);
        setSecurityLevel(result.security);
        
        console.log('✅ Secure wallet created successfully');
      }
    } catch (error) {
      console.error('🔴 Failed to create secure wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getWalletStatus = async () => {
    setIsLoading(true);
    try {
      // Get user ID and token from your auth context
      const userId = 'user-id-from-auth'; // Replace with actual auth context
      const token = 'jwt-token-from-auth'; // Replace with actual auth context
      
      const result = await secureWalletService.getSecureWalletStatus(userId, token);
      
      if (result.success && result.hedera_account_id) {
        setWallet(result);
        setAccountId(result.hedera_account_id);
        setSecurityLevel(result.security);
      }
    } catch (error) {
      console.error('🔴 Failed to get wallet status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check wallet status on mount
  useEffect(() => {
    getWalletStatus();
  }, []);

  return (
    <HederaContext.Provider value={{
      wallet,
      accountId,
      isLoading,
      securityLevel,
      createSecureWallet,
      getWalletStatus
    }}>
      {children}
    </HederaContext.Provider>
  );
};

export const useHedera = () => {
  const context = useContext(HederaContext);
  if (!context) {
    throw new Error('useHedera must be used within HederaProvider');
  }
  return context;
};
```

## 📋 **Phase 4: Testing Commands**

### **Task 4.1: Test Infrastructure**

```bash
# Test KMS key
aws kms describe-key --key-id alias/safemate-master-key-dev

# Test Secrets Manager
aws secretsmanager describe-secret --secret-id safemate/hedera/private-keys-dev

# Test Lambda permissions
aws lambda get-policy --function-name default-safemate-user-onboarding
```

### **Task 4.2: Test Lambda Function**

```bash
# Test the enhanced onboarding function
aws lambda invoke \
  --function-name default-safemate-user-onboarding \
  --payload '{"httpMethod":"POST","path":"/onboarding/start","body":"{\"userId\":\"test-user\",\"action\":\"start\"}","headers":{"Authorization":"Bearer YOUR_JWT_TOKEN"}}' \
  test-response.json

# Check the response
cat test-response.json
```

### **Task 4.3: Test Frontend Integration**

```bash
# Start the development server
cd safemate
npm run dev

# Test in browser at http://localhost:5173
# Check browser console for secure wallet creation logs
```

## 🎯 **Key Success Indicators**

1. ✅ **KMS key created** with proper permissions
2. ✅ **Secrets Manager configured** with KMS encryption
3. ✅ **Lambda function updated** with secure key manager
4. ✅ **Frontend integrated** with secure wallet service
5. ✅ **End-to-end test successful** - user can create secure wallet

## 🔄 **After Implementation**

Once Cursor completes these tasks:

1. **Test the complete flow** in development
2. **Validate encryption/decryption** works correctly
3. **Check CloudWatch logs** for any errors
4. **Run security validation** tests
5. **Prepare for production migration**

## 🚨 **Important Notes for Cursor**

- **Use development environment** first (alias/safemate-master-key-dev)
- **Keep existing DynamoDB tables** for rollback capability
- **Maintain backward compatibility** during migration
- **Log all operations** for debugging
- **Test with real JWT tokens** from the application

This will give you enterprise-grade security with KMS HSMs while maintaining your current Hedera integration!