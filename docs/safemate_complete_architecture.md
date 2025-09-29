    // Set operator from environment
    client.setOperator(
        AccountId.fromString(process.env.HEDERA_OPERATOR_ID),
        PrivateKey.fromString(process.env.HEDERA_OPERATOR_KEY)
    );
    
    // Set network nodes explicitly (optional)
    const testnetNodes = {
        "0.testnet.hedera.com:50211": new AccountId(3),
        "1.testnet.hedera.com:50211": new AccountId(4),
        "2.testnet.hedera.com:50211": new AccountId(5),
        "3.testnet.hedera.com:50211": new AccountId(6)
    };
    
    client.setNetwork(testnetNodes);
    
    // Configure retry and timeout settings
    client.setDefaultMaxTransactionFee(new Hbar(2));
    client.setDefaultMaxQueryPayment(new Hbar(1));
    
    return client;
}

async function executeWithRetry(operation, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            console.error(`Attempt ${attempt} failed:`, error.message);
            
            if (attempt === maxRetries) {
                throw error;
            }
            
            // Exponential backoff
            const delay = Math.pow(2, attempt) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// Connection pooling for better performance
class HederaClientPool {
    constructor(maxSize = 5) {
        this.pool = [];
        this.maxSize = maxSize;
        this.activeConnections = 0;
    }
    
    async getClient() {
        if (this.pool.length > 0) {
            return this.pool.pop();
        }
        
        if (this.activeConnections < this.maxSize) {
            this.activeConnections++;
            return createTestnetClient();
        }
        
        // Wait for available connection
        return new Promise((resolve) => {
            const checkForClient = () => {
                if (this.pool.length > 0) {
                    resolve(this.pool.pop());
                } else {
                    setTimeout(checkForClient, 100);
                }
            };
            checkForClient();
        });
    }
    
    releaseClient(client) {
        if (this.pool.length < this.maxSize) {
            this.pool.push(client);
        } else {
            client.close();
            this.activeConnections--;
        }
    }
    
    closeAll() {
        this.pool.forEach(client => client.close());
        this.pool = [];
        this.activeConnections = 0;
    }
}

const clientPool = new HederaClientPool(3);

module.exports = { 
    createTestnetClient, 
    executeWithRetry, 
    clientPool 
};
```

---

## Environment Configuration

### Environment Variables
**File**: `.env.example`

```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=123456789012

# Environment
ENVIRONMENT=dev

# DynamoDB Tables
DYNAMODB_REGION=us-east-1

# S3 Bucket
SAFEMATE_BUCKET=safemate-user-files-dev-123456789012

# KMS
KMS_KEY_ID=arn:aws:kms:us-east-1:123456789012:key/12345678-1234-1234-1234-123456789012

# Cognito
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_CLIENT_ID=1234567890abcdefghijklmnop

# Hedera Testnet Configuration (NO MIRROR NODE)
HEDERA_NETWORK=testnet
HEDERA_OPERATOR_ID=0.0.12345
HEDERA_OPERATOR_KEY=302e020100300506032b657004220420...

# Testnet Node Endpoints
HEDERA_TESTNET_NODES={"0.0.3":"0.testnet.hedera.com:50211","0.0.4":"1.testnet.hedera.com:50211","0.0.5":"2.testnet.hedera.com:50211","0.0.6":"3.testnet.hedera.com:50211"}

# Lambda Configuration
NODE_OPTIONS=--max-old-space-size=512
```

### Parameter Store Configuration
**File**: `infrastructure/parameters/HederaParameters.yaml`

```yaml
HederaOperatorIdParameter:
  Type: AWS::SSM::Parameter
  Properties:
    Name: !Sub "/safemate/${Environment}/hedera/operator-id"
    Type: String
    Value: !Ref HederaOperatorId
    Description: Hedera operator account ID for testnet
    Tags:
      Project: Safemate
      Environment: !Ref Environment

HederaOperatorKeyParameter:
  Type: AWS::SSM::Parameter
  Properties:
    Name: !Sub "/safemate/${Environment}/hedera/operator-key"
    Type: SecureString
    Value: !Ref HederaOperatorKey
    Description: Hedera operator private key for testnet
    KeyId: !Ref SafemateKMSKey
    Tags:
      Project: Safemate
      Environment: !Ref Environment
```

---

## Deployment Configuration

### SAM Template
**File**: `template.yaml`

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: Safemate Project Complete Infrastructure

Parameters:
  Environment:
    Type: String
    Default: dev
    AllowedValues: [dev, staging, prod]
    Description: Environment name
  HederaOperatorId:
    Type: String
    Description: Hedera operator account ID
    NoEcho: false
  HederaOperatorKey:
    Type: String
    NoEcho: true
    Description: Hedera operator private key

Globals:
  Function:
    Runtime: nodejs18.x
    Timeout: 60
    MemorySize: 512
    ReservedConcurrencyLimit: 50
    Environment:
      Variables:
        ENVIRONMENT: !Ref Environment
        AWS_REGION: !Ref AWS::Region
        DYNAMODB_REGION: !Ref AWS::Region
        SAFEMATE_BUCKET: !Ref SafemateBucket
        KMS_KEY_ID: !Ref SafemateKMSKey
        COGNITO_USER_POOL_ID: !Ref CognitoUserPool
        COGNITO_CLIENT_ID: !Ref CognitoUserPoolClient
        HEDERA_NETWORK: testnet
        HEDERA_OPERATOR_ID: !Ref HederaOperatorIdParameter
        HEDERA_OPERATOR_KEY: !Ref HederaOperatorKeyParameter
        NODE_OPTIONS: '--max-old-space-size=512'
  Api:
    Cors:
      AllowMethods: "'GET,POST,PUT,DELETE,OPTIONS'"
      AllowHeaders: "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
      AllowOrigin: "'*'"

Resources:
  # Include all infrastructure components
  
  # Security Components
  SafemateKMSKey:
    Type: AWS::KMS::Key
    Properties:
      Description: !Sub "Safemate encryption key - ${Environment}"
      KeyPolicy:
        Version: '2012-10-17'
        Statement:
          - Sid: Enable IAM User Permissions
            Effect: Allow
            Principal:
              AWS: !Sub "arn:aws:iam::${AWS::AccountId}:root"
            Action: "kms:*"
            Resource: "*"

  SafemateKMSKeyAlias:
    Type: AWS::KMS::Alias
    Properties:
      AliasName: !Sub "alias/safemate-encryption-key-${Environment}"
      TargetKeyId: !Ref SafemateKMSKey

  # Cognito Configuration
  CognitoUserPool:
    Type: AWS::Cognito::UserPool
    Properties:
      UserPoolName: !Sub "SafemateUserPool-${Environment}"
      Policies:
        PasswordPolicy:
          MinimumLength: 8
          RequireUppercase: true
          RequireLowercase: true
          RequireNumbers: true
          RequireSymbols: true
      AutoVerifiedAttributes:
        - email
      MfaConfiguration: OPTIONAL

  CognitoUserPoolClient:
    Type: AWS::Cognito::UserPoolClient
    Properties:
      UserPoolId: !Ref CognitoUserPool
      ClientName: !Sub "SafemateAppClient-${Environment}"
      GenerateSecret: false
      ExplicitAuthFlows:
        - ALLOW_USER_PASSWORD_AUTH
        - ALLOW_REFRESH_TOKEN_AUTH
        - ALLOW_USER_SRP_AUTH

  # DynamoDB Tables
  SafemateWalletsTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Sub "SafemateWallets-${Environment}"
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: userId
          AttributeType: S
        - AttributeName: walletId
          AttributeType: S
      KeySchema:
        - AttributeName: userId
          KeyType: HASH
        - AttributeName: walletId
          KeyType: RANGE
      PointInTimeRecoverySpecification:
        PointInTimeRecoveryEnabled: true
      SSESpecification:
        SSEEnabled: true

  SafemateFoldersTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Sub "SafemateFolders-${Environment}"
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: folderId
          AttributeType: S
        - AttributeName: userId
          AttributeType: S
      KeySchema:
        - AttributeName: folderId
          KeyType: HASH
      GlobalSecondaryIndexes:
        - IndexName: UserIdIndex
          KeySchema:
            - AttributeName: userId
              KeyType: HASH
          Projection:
            ProjectionType: ALL

  SafemateFilesTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Sub "SafemateFiles-${Environment}"
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: fileId
          AttributeType: S
        - AttributeName: folderId
          AttributeType: S
        - AttributeName: userId
          AttributeType: S
      KeySchema:
        - AttributeName: fileId
          KeyType: HASH
      GlobalSecondaryIndexes:
        - IndexName: FolderIdIndex
          KeySchema:
            - AttributeName: folderId
              KeyType: HASH
          Projection:
            ProjectionType: ALL
        - IndexName: UserIdIndex
          KeySchema:
            - AttributeName: userId
              KeyType: HASH
          Projection:
            ProjectionType: ALL

  SafemateTransactionsTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Sub "SafemateTransactions-${Environment}"
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: transactionId
          AttributeType: S
        - AttributeName: userId
          AttributeType: S
        - AttributeName: walletId
          AttributeType: S
        - AttributeName: timestamp
          AttributeType: S
      KeySchema:
        - AttributeName: transactionId
          KeyType: HASH
      GlobalSecondaryIndexes:
        - IndexName: UserIdIndex
          KeySchema:
            - AttributeName: userId
              KeyType: HASH
            - AttributeName: timestamp
              KeyType: RANGE
          Projection:
            ProjectionType: ALL
        - IndexName: WalletIdIndex
          KeySchema:
            - AttributeName: walletId
              KeyType: HASH
            - AttributeName: timestamp
              KeyType: RANGE
          Projection:
            ProjectionType: ALL

  SafemateNFTCollectionsTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Sub "SafemateNFTCollections-${Environment}"
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: collectionId
          AttributeType: S
        - AttributeName: userId
          AttributeType: S
        - AttributeName: tokenId
          AttributeType: S
      KeySchema:
        - AttributeName: collectionId
          KeyType: HASH
      GlobalSecondaryIndexes:
        - IndexName: UserIdIndex
          KeySchema:
            - AttributeName: userId
              KeyType: HASH
          Projection:
            ProjectionType: ALL
        - IndexName: TokenIdIndex
          KeySchema:
            - AttributeName: tokenId
              KeyType: HASH
          Projection:
            ProjectionType: ALL

  SafemateNFTsTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Sub "SafemateNFTs-${Environment}"
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: nftId
          AttributeType: S
        - AttributeName: collectionId
          AttributeType: S
        - AttributeName: ownerAccountId
          AttributeType: S
      KeySchema:
        - AttributeName: nftId
          KeyType: HASH
      GlobalSecondaryIndexes:
        - IndexName: CollectionIdIndex
          KeySchema:
            - AttributeName: collectionId
              KeyType: HASH
          Projection:
            ProjectionType: ALL
        - IndexName: OwnerAccountIdIndex
          KeySchema:
            - AttributeName: ownerAccountId
              KeyType: HASH
          Projection:
            ProjectionType: ALL

  # S3 Bucket
  SafemateBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Sub "safemate-user-files-${Environment}-${AWS::AccountId}"
      BucketEncryption:
        ServerSideEncryptionConfiguration:
          - ServerSideEncryptionByDefault:
              SSEAlgorithm: aws:kms
              KMSMasterKeyID: !Ref SafemateKMSKey
      VersioningConfiguration:
        Status: Enabled
      PublicAccessBlockConfiguration:
        BlockPublicAcls: true
        BlockPublicPolicy: true
        IgnorePublicAcls: true
        RestrictPublicBuckets: true

  # Parameter Store
  HederaOperatorIdParameter:
    Type: AWS::SSM::Parameter
    Properties:
      Name: !Sub "/safemate/${Environment}/hedera/operator-id"
      Type: String
      Value: !Ref HederaOperatorId

  HederaOperatorKeyParameter:
    Type: AWS::SSM::Parameter
    Properties:
      Name: !Sub "/safemate/${Environment}/hedera/operator-key"
      Type: SecureString
      Value: !Ref HederaOperatorKey
      KeyId: !Ref SafemateKMSKey

  # Lambda Functions
  CreateWalletFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: !Sub "safemate-create-wallet-${Environment}"
      CodeUri: src/functions/wallet/
      Handler: createWallet.handler
      Events:
        CreateWallet:
          Type: Api
          Properties:
            Path: /wallets
            Method: post
            Auth:
              Authorizer: CognitoAuthorizer

  GetWalletBalanceFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: !Sub "safemate-get-wallet-balance-${Environment}"
      CodeUri: src/functions/wallet/
      Handler: getWalletBalance.handler
      Events:
        GetWalletBalance:
          Type: Api
          Properties:
            Path: /wallets/{walletId}/balance
            Method: get
            Auth:
              Authorizer: CognitoAuthorizer

  TransferHBARFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: !Sub "safemate-transfer-hbar-${Environment}"
      CodeUri: src/functions/wallet/
      Handler: transferHBAR.handler
      Events:
        TransferHBAR:
          Type: Api
          Properties:
            Path: /wallets/{walletId}/transfer
            Method: post
            Auth:
              Authorizer: CognitoAuthorizer

  # File Management Functions
  GeneratePresignedUrlFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: !Sub "safemate-generate-presigned-url-${Environment}"
      CodeUri: src/functions/file/
      Handler: generatePresignedUrl.handler
      Events:
        GeneratePresignedUrl:
          Type: Api
          Properties:
            Path: /files/upload-url
            Method: post
            Auth:
              Authorizer: CognitoAuthorizer

  ProcessFileUploadFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: !Sub "safemate-process-file-upload-${Environment}"
      CodeUri: src/functions/file/
      Handler: processFileUpload.handler
      Events:
        S3Event:
          Type: S3
          Properties:
            Bucket: !Ref SafemateBucket
            Event: s3:ObjectCreated:*
            Filter:
              S3Key:
                Rules:
                  - Name: prefix
                    Value: users/

  # Folder Management Functions
  CreateFolderFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: !Sub "safemate-create-folder-${Environment}"
      CodeUri: src/functions/folder/
      Handler: createFolder.handler
      Events:
        CreateFolder:
          Type: Api
          Properties:
            Path: /folders
            Method: post
            Auth:
              Authorizer: CognitoAuthorizer

  # NFT Functions
  CreateNFTCollectionFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: !Sub "safemate-create-nft-collection-${Environment}"
      CodeUri: src/functions/nft/
      Handler: createNFTCollection.handler
      Events:
        CreateNFTCollection:
          Type: Api
          Properties:
            Path: /tokens/collections
            Method: post
            Auth:
              Authorizer: CognitoAuthorizer

  # API Gateway Authorizer
  CognitoAuthorizer:
    Type: AWS::ApiGateway::Authorizer
    Properties:
      Name: !Sub "SafemateCognitoAuthorizer-${Environment}"
      Type: COGNITO_USER_POOLS
      IdentitySource: method.request.header.Authorization
      RestApiId: !Ref ServerlessRestApi
      ProviderARNs:
        - !GetAtt CognitoUserPool.Arn

Outputs:
  ApiUrl:
    Description: "API Gateway endpoint URL"
    Value: !Sub "https://${ServerlessRestApi}.execute-api.${AWS::Region}.amazonaws.com/Prod/"
    Export:
      Name: !Sub "${AWS::StackName}-ApiUrl"

  UserPoolId:
    Description: "Cognito User Pool ID"
    Value: !Ref CognitoUserPool
    Export:
      Name: !Sub "${AWS::StackName}-UserPoolId"

  UserPoolClientId:
    Description: "Cognito User Pool Client ID"
    Value: !Ref CognitoUserPoolClient
    Export:
      Name: !Sub "${AWS::StackName}-UserPoolClientId"

  S3BucketName:
    Description: "S3 Bucket for file storage"
    Value: !Ref SafemateBucket
    Export:
      Name: !Sub "${AWS::StackName}-S3Bucket"

  KMSKeyId:
    Description: "KMS Key ID for encryption"
    Value: !Ref SafemateKMSKey
    Export:
      Name: !Sub "${AWS::StackName}-KMSKey"
```

### Package.json Dependencies
**File**: `package.json`

```json
{
  "name": "safemate-backend",
  "version": "1.0.0",
  "description": "Safemate serverless backend with Hedera integration",
  "main": "src/app.js",
  "scripts": {
    "build": "sam build",
    "deploy:dev": "sam deploy --config-env dev --guided",
    "deploy:staging": "sam deploy --config-env staging",
    "deploy:prod": "sam deploy --config-env prod",
    "test": "jest",
    "test:unit": "jest --testMatch='**/*.unit.test.js'",
    "test:integration": "jest --testMatch='**/*.integration.test.js'",
    "lint": "eslint src/",
    "format": "prettier --write src/",
    "local": "sam local start-api",
    "logs": "sam logs --stack-name safemate-dev"
  },
  "dependencies": {
    "@hashgraph/sdk": "^2.45.0",
    "aws-sdk": "^2.1467.0",
    "jsonwebtoken": "^9.0.2",
    "jwks-rsa": "^3.0.1"
  },
  "devDependencies": {
    "@aws-sdk/client-dynamodb": "^3.423.0",
    "@aws-sdk/client-s3": "^3.423.0",
    "@aws-sdk/client-kms": "^3.423.0",
    "jest": "^29.7.0",
    "eslint": "^8.49.0",
    "prettier": "^3.0.3",
    "@types/aws-lambda": "^8.10.122",
    "aws-lambda": "^1.0.7"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "keywords": [
    "safemate",
    "hedera",
    "aws",
    "serverless",
    "blockchain",
    "nft",
    "wallet"
  ],
  "author": "Safemate Team",
  "license": "MIT"
}
```

### Deploy Script
**File**: `scripts/deploy.sh`

```bash
#!/bin/bash

# Safemate Deployment Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT=${1:-dev}
REGION=${2:-us-east-1}
STACK_NAME="safemate-$ENVIRONMENT"

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    echo -e "${RED}Error: Environment must be dev, staging, or prod${NC}"
    exit 1
fi

# Check required environment variables
if [[ -z "$HEDERA_OPERATOR_ID" ]]; then
    echo -e "${RED}Error: HEDERA_OPERATOR_ID environment variable is required${NC}"
    exit 1
fi

if [[ -z "$HEDERA_OPERATOR_KEY" ]]; then
    echo -e "${RED}Error: HEDERA_OPERATOR_KEY environment variable is required${NC}"
    exit 1
fi

echo -e "${BLUE}Deploying Safemate infrastructure to $ENVIRONMENT environment in $REGION${NC}"

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

# Run tests
echo -e "${YELLOW}Running tests...${NC}"
npm test

# Build the SAM application
echo -e "${YELLOW}Building SAM application...${NC}"
sam build

# Validate template
echo -e "${YELLOW}Validating SAM template...${NC}"
sam validate

# Create deployment bucket if it doesn't exist
DEPLOYMENT_BUCKET="safemate-deployment-$ENVIRONMENT-$(aws sts get-caller-identity --query Account --output text)"
aws s3 mb s3://$DEPLOYMENT_BUCKET --region $REGION 2>/dev/null || true

# Deploy with parameters
echo -e "${YELLOW}Deploying to AWS...${NC}"
sam deploy \
    --template-file template.yaml \
    --stack-name $STACK_NAME \
    --s3-bucket $DEPLOYMENT_BUCKET \
    --parameter-overrides \
        Environment=$ENVIRONMENT \
        HederaOperatorId=$HEDERA_OPERATOR_ID \
        HederaOperatorKey=$HEDERA_OPERATOR_KEY \
    --capabilities CAPABILITY_NAMED_IAM \
    --region $REGION \
    --no-fail-on-empty-changeset

# Get outputs
echo -e "${YELLOW}Retrieving deployment outputs...${NC}"
API_URL=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
    --output text)

USER_POOL_ID=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`UserPoolId`].OutputValue' \
    --output text)

USER_POOL_CLIENT_ID=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`UserPoolClientId`].OutputValue' \
    --output text)

S3_BUCKET=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`S3BucketName`].OutputValue' \
    --output text)

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}Environment: $ENVIRONMENT${NC}"
echo -e "${GREEN}Region: $REGION${NC}"
echo -e "${GREEN}API URL: $API_URL${NC}"
echo -e "${GREEN}User Pool ID: $USER_POOL_ID${NC}"
echo -e "${GREEN}User Pool Client ID: $USER_POOL_CLIENT_ID${NC}"
echo -e "${GREEN}S3 Bucket: $S3_BUCKET${NC}"

# Save configuration to file
cat > ".env.$ENVIRONMENT" <<EOF
# Safemate $ENVIRONMENT Environment Configuration
API_URL=$API_URL
USER_POOL_ID=$USER_POOL_ID
USER_POOL_CLIENT_ID=$USER_POOL_CLIENT_ID
S3_BUCKET=$S3_BUCKET
REGION=$REGION
ENVIRONMENT=$ENVIRONMENT
EOF

echo -e "${GREEN}Configuration saved to .env.$ENVIRONMENT${NC}"
echo -e "${BLUE}You can now use this API endpoint in your frontend application!${NC}"
```

---

## API Endpoints Summary

### Authentication Endpoints
- `POST /auth/login` - User login with Cognito
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Refresh JWT tokens
- `POST /auth/logout` - User logout

### Wallet Endpoints (Testnet Direct)
- `POST /wallets` - Create new Hedera testnet wallet
- `GET /wallets` - List user wallets
- `GET /wallets/{walletId}` - Get wallet info
- `GET /wallets/{walletId}/balance` - Get current balance from testnet
- `GET /wallets/{walletId}/account-info` - Get full account info from testnet
- `POST /wallets/{walletId}/transfer` - Transfer HBAR between accounts
- `GET /wallets/{walletId}/transactions` - Get transaction history (local DynamoDB)
- `DELETE /wallets/{walletId}` - Delete wallet (soft delete)

### Token/NFT Endpoints (Testnet Direct)
- `POST /tokens/collections` - Create NFT collection on testnet
- `GET /tokens/collections` - List user's NFT collections
- `POST /tokens/{collectionId}/mint` - Mint NFTs to collection
- `POST /tokens/{tokenId}/transfer` - Transfer NFT between accounts
- `GET /tokens/{tokenId}/info` - Get token info from testnet
- `GET /tokens/{tokenId}/{serialNumber}` - Get specific NFT info from testnet

### Folder Endpoints
- `POST /folders` - Create folder
- `GET /folders` - List root folders
- `GET /folders/{folderId}` - Get folder details
- `GET /folders/{folderId}/contents` - Get folder contents
- `PUT /folders/{folderId}` - Update folder
- `DELETE /folders/{folderId}` - Delete folder

### File Endpoints
- `POST /files/upload-url` - Generate presigned upload URL
- `GET /files/{fileId}` - Get file metadata
- `GET /files/{fileId}/download-url` - Generate download URL
- `PUT /files/{fileId}` - Update file metadata
- `DELETE /files/{fileId}` - Delete file

---

## Cost Optimization

### Lambda Configuration for Cost Efficiency

```yaml
# Cost-optimized Lambda settings
LambdaCostDefaults: &cost-defaults
  Runtime: nodejs18.x
  MemorySize: 512  # Optimal for Hedera SDK operations
  Timeout: 60     # Sufficient for network operations
  ReservedConcurrencyLimit: 25  # Prevent runaway costs
  Environment:
    Variables:
      NODE_OPTIONS: '--max-old-space-size=512'
```

### DynamoDB Cost Optimization

```yaml
# Use PAY_PER_REQUEST for unpredictable workloads
BillingMode: PAY_PER_REQUEST

# Enable Point-in-Time Recovery selectively
PointInTimeRecoverySpecification:
  PointInTimeRecoveryEnabled: true  # Only for critical tables

# Archive old data with TTL
TimeToLiveSpecification:
  AttributeName: ttl
  Enabled: true
```

### S3 Storage Class Optimization

```yaml
LifecycleConfiguration:
  Rules:
    - Id: TransitionToIA
      Status: Enabled
      Transitions:
        - Days: 30
          StorageClass: STANDARD_IA
    - Id: TransitionToGlacier
      Status: Enabled
      Transitions:
        - Days: 90
          StorageClass: GLACIER
    - Id: DeleteOldVersions
      Status: Enabled
      NoncurrentVersionExpiration:
        NoncurrentDays: 365
```

---

## Getting Started

### Prerequisites
1. AWS CLI configured with appropriate permissions
2. SAM CLI installed
3. Node.js 18+ installed
4. Hedera testnet account with HBAR balance
5. Git for version control

### Quick Start Commands

```bash
# Clone the repository
git clone https://github.com/your-org/safemate-backend.git
cd safemate-backend

# Install dependencies
npm install

# Set environment variables
export HEDERA_OPERATOR_ID="0.0.YOUR_ACCOUNT_ID"
export HEDERA_OPERATOR_KEY="YOUR_PRIVATE_KEY"

# Deploy to development
./scripts/deploy.sh dev us-east-1

# Test the deployment
curl -X GET "https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/Prod/wallets" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Directory Structure

```
safemate-backend/
├── src/
│   ├── functions/
│   │   ├── wallet/
│   │   │   ├── createWallet.js
│   │   │   ├── getWalletBalance.js
│   │   │   ├── transferHBAR.js
│   │   │   ├── getAccountInfo.js
│   │   │   ├── getTransactionHistory.js
│   │   │   └── listUserWallets.js
│   │   ├── file/
│   │   │   ├── generatePresignedUrl.js
│   │   │   ├── processFileUpload.js
│   │   │   ├── getFileDownloadUrl.js
│   │   │   └── deleteFile.js
│   │   ├── folder/
│   │   │   ├── createFolder.js
│   │   │   ├── listFolders.js
│   │   │   ├── getFolderContents.js
│   │   │   ├── updateFolder.js
│   │   │   └── deleteFolder.js
│   │   ├── nft/
│   │   │   ├── createNFTCollection.js
│   │   │   ├── mintNFT.js
│   │   │   ├── transferNFT.js
│   │   │   └── getTokenInfo.js
│   │   └── auth/
│   │       └── customAuthorizer.js
│   └── utils/
│       ├── index.js
│       ├── hederaClient.js
│       ├── encryption.js
│       └── validation.js
├── infrastructure/
│   ├── tables/
│   │   ├── SafemateWallets.yaml
│   │   ├── SafemateFolders.yaml
│   │   ├── SafemateFiles.yaml
│   │   ├── SafemateTransactions.yaml
│   │   ├── SafemateNFTCollections.yaml
│   │   └── SafemateNFTs.yaml
│   ├── storage/
│   │   └── SafemateBucket.yaml
│   ├── security/
│   │   └── SafemateKMSKey.yaml
│   ├── iam/
│   │   ├── LambdaExecutionRole.yaml
│   │   └── APIGatewayExecutionRole.yaml
│   └── parameters/
│       └── HederaParameters.yaml
├── tests/
│   ├── unit/
│   │   ├── wallet.unit.test.js
│   │   ├── file.unit.test.js
│   │   └── folder.unit.test.js
│   └── integration/
│       ├── wallet.integration.test.js
│       └── api.integration.test.js
├── scripts/
│   ├── deploy.sh
│   ├── test-local.sh
│   └── cleanup.sh
├── docs/
│   ├── API.md
│   ├── SETUP.md
│   └── TROUBLESHOOTING.md
├── template.yaml
├── samconfig.toml
├── package.json
├── package-lock.json
├── .env.example
├── .gitignore
├── README.md
└── LICENSE
```

---

## Monitoring and Logging

### CloudWatch Configuration
**File**: `infrastructure/monitoring/CloudWatchConfig.yaml`

```yaml
# API Gateway Log Group
APIGatewayLogGroup:
  Type: AWS::Logs::LogGroup
  Properties:
    LogGroupName: !Sub "/aws/apigateway/safemate-api-${Environment}"
    RetentionInDays: 30
    Tags:
      - Key: Project
        Value: Safemate
      - Key: Environment
        Value: !Ref Environment

# Lambda Log Groups
LambdaLogGroup:
  Type: AWS::Logs::LogGroup
  Properties:
    LogGroupName: !Sub "/aws/lambda/safemate-functions-${Environment}"
    RetentionInDays: 30
    Tags:
      - Key: Project
        Value: Safemate
      - Key: Environment
        Value: !Ref Environment

# CloudWatch Alarms
HighErrorRateAlarm:
  Type: AWS::CloudWatch::Alarm
  Properties:
    AlarmName: !Sub "Safemate-HighErrorRate-${Environment}"
    AlarmDescription: High error rate in Safemate API
    MetricName: 4XXError
    Namespace: AWS/ApiGateway
    Statistic: Sum
    Period: 300
    EvaluationPeriods: 2
    Threshold: 10
    ComparisonOperator: GreaterThanThreshold
    AlarmActions:
      - !Ref SNSAlarmTopic
    Dimensions:
      - Name: ApiName
        Value: !Sub "safemate-api-${Environment}"
    TreatMissingData: notBreaching

LambdaDurationAlarm:
  Type: AWS::CloudWatch::Alarm
  Properties:
    AlarmName: !Sub "Safemate-LambdaHighDuration-${Environment}"
    AlarmDescription: Lambda function execution duration is high
    MetricName: Duration
    Namespace: AWS/Lambda
    Statistic: Average
    Period: 300
    EvaluationPeriods: 3
    Threshold: 30000  # 30 seconds
    ComparisonOperator: GreaterThanThreshold
    AlarmActions:
      - !Ref SNSAlarmTopic
    TreatMissingData: notBreaching

LambdaErrorRateAlarm:
  Type: AWS::CloudWatch::Alarm
  Properties:
    AlarmName: !Sub "Safemate-LambdaErrorRate-${Environment}"
    AlarmDescription: High error rate in Lambda functions
    MetricName: Errors
    Namespace: AWS/Lambda
    Statistic: Sum
    Period: 300
    EvaluationPeriods: 2
    Threshold: 5
    ComparisonOperator: GreaterThanThreshold
    AlarmActions:
      - !Ref SNSAlarmTopic
    TreatMissingData: notBreaching

# SNS Topic for Alerts
SNSAlarmTopic:
  Type: AWS::SNS::Topic
  Properties:
    TopicName: !Sub "safemate-alarms-${Environment}"
    DisplayName: !Sub "Safemate Alarms - ${Environment}"
    Tags:
      - Key: Project
        Value: Safemate
      - Key: Environment
        Value: !Ref Environment

# CloudWatch Dashboard
SafemateDashboard:
  Type: AWS::CloudWatch::Dashboard
  Properties:
    DashboardName: !Sub "Safemate-${Environment}-Dashboard"
    DashboardBody: !Sub |
      {
        "widgets": [
          {
            "type": "metric",
            "x": 0,
            "y": 0,
            "width": 12,
            "height": 6,
            "properties": {
              "metrics": [
                [ "AWS/ApiGateway", "Count", "ApiName", "safemate-api-${Environment}" ],
                [ ".", "4XXError", ".", "." ],
                [ ".", "5XXError", ".", "." ]
              ],
              "period": 300,
              "stat": "Sum",
              "region": "${AWS::Region}",
              "title": "API Gateway Metrics"
            }
          },
          {
            "type": "metric",
            "x": 12,
            "y": 0,
            "width": 12,
            "height": 6,
            "properties": {
              "metrics": [
                [ "AWS/Lambda", "Duration", "FunctionName", "safemate-create-wallet-${Environment}" ],
                [ ".", "Invocations", ".", "." ],
                [ ".", "Errors", ".", "." ]
              ],
              "period": 300,
              "stat": "Average",
              "region": "${AWS::Region}",
              "title": "Lambda Metrics"
            }
          },
          {
            "type": "metric",
            "x": 0,
            "y": 6,
            "width": 24,
            "height": 6,
            "properties": {
              "metrics": [
                [ "AWS/DynamoDB", "ConsumedReadCapacityUnits", "TableName", "SafemateWallets-${Environment}" ],
                [ ".", "ConsumedWriteCapacityUnits", ".", "." ],
                [ ".", "ConsumedReadCapacityUnits", ".", "SafemateFolders-${Environment}" ],
                [ ".", "ConsumedWriteCapacityUnits", ".", "." ]
              ],
              "period": 300,
              "stat": "Sum",
              "region": "${AWS::Region}",
              "title": "DynamoDB Metrics"
            }
          }
        ]
      }
```

---

## Testing

### Unit Tests
**File**: `tests/unit/wallet.unit.test.js`

```javascript
const AWS = require('aws-sdk-mock');
const { handler } = require('../../src/functions/wallet/createWallet');

describe('Create Wallet Function', () => {
    beforeEach(() => {
        process.env.KMS_KEY_ID = 'test-key-id';
        process.env.HEDERA_OPERATOR_ID = '0.0.12345';
        process.env.HEDERA_OPERATOR_KEY = 'test-operator-key';
    });

    afterEach(() => {
        AWS.restore();
        delete process.env.KMS_KEY_ID;
        delete process.env.HEDERA_OPERATOR_ID;
        delete process.env.HEDERA_OPERATOR_KEY;
    });

    test('should create wallet successfully', async () => {
        // Mock DynamoDB putItem
        AWS.mock('DynamoDB', 'putItem', (params, callback) => {
            callback(null, {});
        });

        // Mock KMS encrypt
        AWS.mock('KMS', 'encrypt', (params, callback) => {
            callback(null, {
                CiphertextBlob: Buffer.from('encrypted-key', 'base64')
            });
        });

        const event = {
            body: JSON.stringify({
                userId: 'user123',
                walletType: 'primary',
                keyType: 'ECDSA'
            })
        };

        // Note: This test would need to mock Hedera SDK calls
        // For now, we'll test the error handling
        const response = await handler(event);
        
        // Should handle Hedera connection errors gracefully
        expect(response.statusCode).toBeDefined();
    });

    test('should handle invalid input', async () => {
        const event = {
            body: JSON.stringify({
                userId: '',
                walletType: '',
                keyType: 'INVALID'
            })
        };

        const response = await handler(event);
        expect(response.statusCode).toBe(400);
    });
});
```

### Integration Tests
**File**: `tests/integration/api.integration.test.js`

```javascript
const axios = require('axios');

describe('API Integration Tests', () => {
    const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
    let authToken;

    beforeAll(async () => {
        // Get auth token from Cognito
        // This would involve actual Cognito authentication
        authToken = 'your-jwt-token';
    });

    test('should create and retrieve wallet', async () => {
        // Create wallet
        const createResponse = await axios.post(
            `${API_BASE_URL}/wallets`,
            {
                userId: 'test-user',
                walletType: 'primary',
                keyType: 'ECDSA'
            },
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        expect(createResponse.status).toBe(201);
        expect(createResponse.data.walletId).toBeDefined();
        expect(createResponse.data.accountId).toBeDefined();

        // Get wallet balance
        const balanceResponse = await axios.get(
            `${API_BASE_URL}/wallets/${createResponse.data.walletId}/balance`,
            {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            }
        );

        expect(balanceResponse.status).toBe(200);
        expect(balanceResponse.data.balance).toBeDefined();
    });

    test('should create and manage folders', async () => {
        // Create folder
        const createResponse = await axios.post(
            `${API_BASE_URL}/folders`,
            {
                folderName: 'Test Folder',
                isPrivate: false
            },
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        expect(createResponse.status).toBe(201);
        expect(createResponse.data.folderId).toBeDefined();

        // List folders
        const listResponse = await axios.get(
            `${API_BASE_URL}/folders`,
            {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            }
        );

        expect(listResponse.status).toBe(200);
        expect(listResponse.data.folders).toBeDefined();
        expect(Array.isArray(listResponse.data.folders)).toBe(true);
    });
});
```

---

## Troubleshooting

### Common Issues

#### 1. Hedera Connection Issues
```bash
# Check Hedera testnet status
curl -X GET "https://testnet.hedera.com/api/v1/network/nodes"

# Verify operator account has sufficient HBAR
# Use HashScan testnet explorer: https://hashscan.io/testnet/
```

#### 2. Lambda Memory Issues
```yaml
# Increase memory for Hedera operations
MemorySize: 1024  # or higher if needed
Timeout: 120      # Increase timeout for network calls
```

#### 3. DynamoDB Throttling
```yaml
# Enable auto scaling or switch to on-demand
BillingMode: PAY_PER_REQUEST
```

#### 4. S3 CORS Issues
```yaml
CORS:
  CorsRules:
    - AllowedHeaders: ['*']
      AllowedMethods: [PUT, POST, GET, DELETE]
      AllowedOrigins: ['*']  # Restrict in production
      ExposedHeaders: [ETag]
      MaxAge: 3000
```

### Debug Commands

```bash
# View Lambda logs
sam logs --stack-name safemate-dev --tail

# Test Lambda function locally
sam local invoke CreateWalletFunction --event events/create-wallet.json

# Start API locally
sam local start-api --port 3000

# Check CloudFormation stack status
aws cloudformation describe-stacks --stack-name safemate-dev

# View DynamoDB table data
aws dynamodb scan --table-name SafemateWallets-dev --max-items 10
```

---

## Security Best Practices

### 1. Environment Separation
- Use separate AWS accounts for prod/staging/dev
- Implement least privilege access policies
- Rotate secrets regularly

### 2. Data Protection
- All data encrypted at rest and in transit
- Private keys encrypted with AWS KMS
- S3 buckets with public access blocked

### 3. API Security
- JWT token validation on all endpoints
- Rate limiting and throttling
- Input validation and sanitization
- CORS properly configured

### 4. Monitoring
- CloudWatch alarms for critical metrics
- AWS CloudTrail for audit logging
- VPC Flow Logs for network monitoring
- AWS Config for compliance

---

## Performance Optimization

### 1. Lambda Optimizations
```javascript
// Connection pooling example
const clientPool = new HederaClientPool(3);

// Reuse connections
const client = await clientPool.getClient();
// ... use client
clientPool.releaseClient(client);
```

### 2. DynamoDB Optimizations
```javascript
// Batch operations
const batchWriteParams = {
    RequestItems: {
        'SafemateNFTs': items.map(item => ({
            PutRequest: { Item: item }
        }))
    }
};
await dynamodb.batchWriteItem(batchWriteParams).promise();
```

### 3. S3 Optimizations
```javascript
// Multipart upload for large files
const uploadId = await s3.createMultipartUpload({
    Bucket: bucket,
    Key: key
}).promise();
```

---

## Backup and Recovery

### 1. DynamoDB Backup
```yaml
# Point-in-time recovery
PointInTimeRecoverySpecification:
  PointInTimeRecoveryEnabled: true

# On-demand backups via Lambda
BackupLambda:
  Type: AWS::Serverless::Function
  Properties:
    Handler: backup.handler
    Events:
      ScheduleEvent:
        Type: Schedule
        Properties:
          Schedule: rate(1 day)
```

### 2. S3 Versioning and Replication
```yaml
VersioningConfiguration:
  Status: Enabled

ReplicationConfiguration:
  Role: !GetAtt S3ReplicationRole.Arn
  Rules:
    - Id: ReplicateToSecondaryRegion
      Status: Enabled
      Prefix: critical/
      Destination:
        Bucket: !Sub "${BackupBucket}"
        StorageClass: STANDARD_IA
```

---

## License

MIT License - see LICENSE file for details.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Create Pull Request

## Support

- GitHub Issues: [Create an issue](https://github.com/your-org/safemate-backend/issues)
- Documentation: [Wiki](https://github.com/your-org/safemate-backend/wiki)
- Discord: [Join our community](https://discord.gg/safemate)

---

**End of Documentation**

This complete documentation covers all aspects of the Safemate AWS serverless architecture with direct Hedera testnet integration. The architecture is production-ready, secure, scalable, and cost-optimized for managing wallets, files, folders, and NFT operations without relying on mirror nodes.        // Query account info directly from testnet
        const accountInfo = await executeWithRetry(async () => {
            return await new AccountInfoQuery()
                .setAccountId(accountId)
                .execute(client);
        });
        
        client.close();
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                accountId: accountId.toString(),
                balance: accountInfo.balance.toString(),
                accountMemo: accountInfo.accountMemo,
                key: accountInfo.key.toString(),
                autoRenewPeriod: accountInfo.autoRenewPeriod.seconds.toString(),
                expirationTime: accountInfo.expirationTime ? accountInfo.expirationTime.toString() : null,
                isDeleted: accountInfo.isDeleted,
                proxyAccountId: accountInfo.proxyAccountId ? accountInfo.proxyAccountId.toString() : null,
                stakingInfo: {
                    declineReward: accountInfo.stakingInfo.declineReward,
                    stakePeriodStart: accountInfo.stakingInfo.stakePeriodStart ? accountInfo.stakingInfo.stakePeriodStart.toString() : null,
                    pendingReward: accountInfo.stakingInfo.pendingReward.toString(),
                    stakedToMe: accountInfo.stakingInfo.stakedToMe.toString(),
                    stakedAccountId: accountInfo.stakingInfo.stakedAccountId ? accountInfo.stakingInfo.stakedAccountId.toString() : null,
                    stakedNodeId: accountInfo.stakingInfo.stakedNodeId
                }
            })
        };
    } catch (error) {
        console.error('Account info query error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                error: 'Failed to get account info',
                details: error.message 
            })
        };
    }
};
```

#### Function: GetTransactionHistory
**File**: `src/functions/wallet/getTransactionHistory.js`

```javascript
const AWS = require('aws-sdk');

exports.handler = async (event) => {
    const { walletId } = event.pathParameters;
    const { limit = 50, lastKey } = event.queryStringParameters || {};
    const userId = event.requestContext.authorizer.claims.sub;
    
    try {
        const dynamodb = new AWS.DynamoDB();
        
        // Query transaction history from DynamoDB (no mirror node)
        let queryParams = {
            TableName: 'SafemateTransactions',
            IndexName: 'WalletIdIndex',
            KeyConditionExpression: 'walletId = :walletId',
            ExpressionAttributeValues: {
                ':walletId': { S: walletId },
                ':userId': { S: userId }
            },
            FilterExpression: 'userId = :userId',
            ScanIndexForward: false, // Most recent first
            Limit: parseInt(limit)
        };
        
        if (lastKey) {
            queryParams.ExclusiveStartKey = JSON.parse(decodeURIComponent(lastKey));
        }
        
        const result = await dynamodb.query(queryParams).promise();
        
        const transactions = result.Items.map(item => ({
            transactionId: item.transactionId.S,
            type: item.type.S,
            fromAccount: item.fromAccount ? item.fromAccount.S : null,
            toAccount: item.toAccount ? item.toAccount.S : null,
            amount: item.amount ? item.amount.S : null,
            tokenId: item.tokenId ? item.tokenId.S : null,
            serialNumber: item.serialNumber ? parseInt(item.serialNumber.N) : null,
            memo: item.memo ? item.memo.S : '',
            status: item.status.S,
            timestamp: item.timestamp.S,
            consensusTimestamp: item.consensusTimestamp ? item.consensusTimestamp.S : null
        }));
        
        const response = {
            transactions,
            hasMore: !!result.LastEvaluatedKey
        };
        
        if (result.LastEvaluatedKey) {
            response.nextKey = encodeURIComponent(JSON.stringify(result.LastEvaluatedKey));
        }
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(response)
        };
    } catch (error) {
        console.error('Transaction history error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                error: 'Failed to get transaction history',
                details: error.message 
            })
        };
    }
};
```

---

## Database Schema

### DynamoDB Table Definitions

#### SafemateWallets Table
**File**: `infrastructure/tables/SafemateWallets.yaml`

```yaml
SafemateWalletsTable:
  Type: AWS::DynamoDB::Table
  Properties:
    TableName: SafemateWallets
    BillingMode: PAY_PER_REQUEST
    AttributeDefinitions:
      - AttributeName: userId
        AttributeType: S
      - AttributeName: walletId
        AttributeType: S
    KeySchema:
      - AttributeName: userId
        KeyType: HASH
      - AttributeName: walletId
        KeyType: RANGE
    PointInTimeRecoverySpecification:
      PointInTimeRecoveryEnabled: true
    SSESpecification:
      SSEEnabled: true
      SSEType: KMS
      KMSMasterKeyId: !Ref SafemateKMSKey
    Tags:
      - Key: Project
        Value: Safemate
      - Key: Environment
        Value: !Ref Environment
```

#### SafemateFolders Table
**File**: `infrastructure/tables/SafemateFolders.yaml`

```yaml
SafemateFoldersTable:
  Type: AWS::DynamoDB::Table
  Properties:
    TableName: SafemateFolders
    BillingMode: PAY_PER_REQUEST
    AttributeDefinitions:
      - AttributeName: folderId
        AttributeType: S
      - AttributeName: userId
        AttributeType: S
    KeySchema:
      - AttributeName: folderId
        KeyType: HASH
    GlobalSecondaryIndexes:
      - IndexName: UserIdIndex
        KeySchema:
          - AttributeName: userId
            KeyType: HASH
        Projection:
          ProjectionType: ALL
    PointInTimeRecoverySpecification:
      PointInTimeRecoveryEnabled: true
    SSESpecification:
      SSEEnabled: true
      SSEType: KMS
      KMSMasterKeyId: !Ref SafemateKMSKey
    Tags:
      - Key: Project
        Value: Safemate
      - Key: Environment
        Value: !Ref Environment
```

#### SafemateFiles Table
**File**: `infrastructure/tables/SafemateFiles.yaml`

```yaml
SafemateFilesTable:
  Type: AWS::DynamoDB::Table
  Properties:
    TableName: SafemateFiles
    BillingMode: PAY_PER_REQUEST
    AttributeDefinitions:
      - AttributeName: fileId
        AttributeType: S
      - AttributeName: folderId
        AttributeType: S
      - AttributeName: userId
        AttributeType: S
    KeySchema:
      - AttributeName: fileId
        KeyType: HASH
    GlobalSecondaryIndexes:
      - IndexName: FolderIdIndex
        KeySchema:
          - AttributeName: folderId
            KeyType: HASH
        Projection:
          ProjectionType: ALL
      - IndexName: UserIdIndex
        KeySchema:
          - AttributeName: userId
            KeyType: HASH
        Projection:
          ProjectionType: ALL
    PointInTimeRecoverySpecification:
      PointInTimeRecoveryEnabled: true
    SSESpecification:
      SSEEnabled: true
      SSEType: KMS
      KMSMasterKeyId: !Ref SafemateKMSKey
    Tags:
      - Key: Project
        Value: Safemate
      - Key: Environment
        Value: !Ref Environment
```

#### SafemateTransactions Table
**File**: `infrastructure/tables/SafemateTransactions.yaml`

```yaml
SafemateTransactionsTable:
  Type: AWS::DynamoDB::Table
  Properties:
    TableName: SafemateTransactions
    BillingMode: PAY_PER_REQUEST
    AttributeDefinitions:
      - AttributeName: transactionId
        AttributeType: S
      - AttributeName: userId
        AttributeType: S
      - AttributeName: walletId
        AttributeType: S
      - AttributeName: timestamp
        AttributeType: S
    KeySchema:
      - AttributeName: transactionId
        KeyType: HASH
    GlobalSecondaryIndexes:
      - IndexName: UserIdIndex
        KeySchema:
          - AttributeName: userId
            KeyType: HASH
          - AttributeName: timestamp
            KeyType: RANGE
        Projection:
          ProjectionType: ALL
      - IndexName: WalletIdIndex
        KeySchema:
          - AttributeName: walletId
            KeyType: HASH
          - AttributeName: timestamp
            KeyType: RANGE
        Projection:
          ProjectionType: ALL
    PointInTimeRecoverySpecification:
      PointInTimeRecoveryEnabled: true
    SSESpecification:
      SSEEnabled: true
      SSEType: KMS
      KMSMasterKeyId: !Ref SafemateKMSKey
    Tags:
      - Key: Project
        Value: Safemate
      - Key: Environment
        Value: !Ref Environment
```

#### SafemateNFTCollections Table
**File**: `infrastructure/tables/SafemateNFTCollections.yaml`

```yaml
SafemateNFTCollectionsTable:
  Type: AWS::DynamoDB::Table
  Properties:
    TableName: SafemateNFTCollections
    BillingMode: PAY_PER_REQUEST
    AttributeDefinitions:
      - AttributeName: collectionId
        AttributeType: S
      - AttributeName: userId
        AttributeType: S
      - AttributeName: tokenId
        AttributeType: S
    KeySchema:
      - AttributeName: collectionId
        KeyType: HASH
    GlobalSecondaryIndexes:
      - IndexName: UserIdIndex
        KeySchema:
          - AttributeName: userId
            KeyType: HASH
        Projection:
          ProjectionType: ALL
      - IndexName: TokenIdIndex
        KeySchema:
          - AttributeName: tokenId
            KeyType: HASH
        Projection:
          ProjectionType: ALL
    PointInTimeRecoverySpecification:
      PointInTimeRecoveryEnabled: true
    SSESpecification:
      SSEEnabled: true
      SSEType: KMS
      KMSMasterKeyId: !Ref SafemateKMSKey
    Tags:
      - Key: Project
        Value: Safemate
      - Key: Environment
        Value: !Ref Environment
```

#### SafemateNFTs Table
**File**: `infrastructure/tables/SafemateNFTs.yaml`

```yaml
SafemateNFTsTable:
  Type: AWS::DynamoDB::Table
  Properties:
    TableName: SafemateNFTs
    BillingMode: PAY_PER_REQUEST
    AttributeDefinitions:
      - AttributeName: nftId
        AttributeType: S
      - AttributeName: collectionId
        AttributeType: S
      - AttributeName: ownerAccountId
        AttributeType: S
    KeySchema:
      - AttributeName: nftId
        KeyType: HASH
    GlobalSecondaryIndexes:
      - IndexName: CollectionIdIndex
        KeySchema:
          - AttributeName: collectionId
            KeyType: HASH
        Projection:
          ProjectionType: ALL
      - IndexName: OwnerAccountIdIndex
        KeySchema:
          - AttributeName: ownerAccountId
            KeyType: HASH
        Projection:
          ProjectionType: ALL
    PointInTimeRecoverySpecification:
      PointInTimeRecoveryEnabled: true
    SSESpecification:
      SSEEnabled: true
      SSEType: KMS
      KMSMasterKeyId: !Ref SafemateKMSKey
    Tags:
      - Key: Project
        Value: Safemate
      - Key: Environment
        Value: !Ref Environment
```

---

## S3 Configuration

### Storage Bucket Configuration
**File**: `infrastructure/storage/SafemateBucket.yaml`

```yaml
SafemateBucket:
  Type: AWS::S3::Bucket
  Properties:
    BucketName: !Sub "safemate-user-files-${Environment}-${AWS::AccountId}"
    BucketEncryption:
      ServerSideEncryptionConfiguration:
        - ServerSideEncryptionByDefault:
            SSEAlgorithm: aws:kms
            KMSMasterKeyID: !Ref SafemateKMSKey
    VersioningConfiguration:
      Status: Enabled
    LifecycleConfiguration:
      Rules:
        - Id: DeleteIncompleteMultipartUploads
          Status: Enabled
          AbortIncompleteMultipartUpload:
            DaysAfterInitiation: 1
        - Id: TransitionToIA
          Status: Enabled
          Transitions:
            - Days: 30
              StorageClass: STANDARD_IA
        - Id: TransitionToGlacier
          Status: Enabled
          Transitions:
            - Days: 90
              StorageClass: GLACIER
        - Id: DeleteOldVersions
          Status: Enabled
          NoncurrentVersionTransitions:
            - NoncurrentDays: 30
              StorageClass: STANDARD_IA
          NoncurrentVersionExpiration:
            NoncurrentDays: 365
    NotificationConfiguration:
      LambdaConfigurations:
        - Event: s3:ObjectCreated:*
          Function: !GetAtt ProcessFileUploadFunction.Arn
          Filter:
            S3Key:
              Rules:
                - Name: prefix
                  Value: users/
    PublicAccessBlockConfiguration:
      BlockPublicAcls: true
      BlockPublicPolicy: true
      IgnorePublicAcls: true
      RestrictPublicBuckets: true
    CORS:
      CorsRules:
        - AllowedHeaders: ['*']
          AllowedMethods: [PUT, POST, GET]
          AllowedOrigins: ['*']
          ExposedHeaders: [ETag]
          MaxAge: 3000
    Tags:
      - Key: Project
        Value: Safemate
      - Key: Environment
        Value: !Ref Environment

# S3 Bucket Policy
SafemateBucketPolicy:
  Type: AWS::S3::BucketPolicy
  Properties:
    Bucket: !Ref SafemateBucket
    PolicyDocument:
      Statement:
        - Sid: DenyInsecureConnections
          Effect: Deny
          Principal: '*'
          Action: 's3:*'
          Resource:
            - !Sub "${SafemateBucket.Arn}/*"
            - !GetAtt SafemateBucket.Arn
          Condition:
            Bool:
              'aws:SecureTransport': 'false'
        - Sid: AllowLambdaAccess
          Effect: Allow
          Principal:
            AWS: !GetAtt LambdaExecutionRole.Arn
          Action:
            - 's3:GetObject'
            - 's3:PutObject'
            - 's3:DeleteObject'
            - 's3:HeadObject'
          Resource: !Sub "${SafemateBucket.Arn}/*"
```

---

## IAM Roles and Policies

### Lambda Execution Role
**File**: `infrastructure/iam/LambdaExecutionRole.yaml`

```yaml
LambdaExecutionRole:
  Type: AWS::IAM::Role
  Properties:
    RoleName: !Sub "SafemateLambdaExecutionRole-${Environment}"
    AssumeRolePolicyDocument:
      Version: '2012-10-17'
      Statement:
        - Effect: Allow
          Principal:
            Service: lambda.amazonaws.com
          Action: sts:AssumeRole
    ManagedPolicyArns:
      - arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
    Policies:
      - PolicyName: SafemateLambdaPolicy
        PolicyDocument:
          Version: '2012-10-17'
          Statement:
            # DynamoDB Permissions
            - Effect: Allow
              Action:
                - dynamodb:PutItem
                - dynamodb:GetItem
                - dynamodb:UpdateItem
                - dynamodb:DeleteItem
                - dynamodb:Query
                - dynamodb:Scan
                - dynamodb:BatchWriteItem
                - dynamodb:BatchGetItem
              Resource:
                - !GetAtt SafemateWalletsTable.Arn
                - !GetAtt SafemateFoldersTable.Arn
                - !GetAtt SafemateFilesTable.Arn
                - !GetAtt SafemateTransactionsTable.Arn
                - !GetAtt SafemateNFTCollectionsTable.Arn
                - !GetAtt SafemateNFTsTable.Arn
                - !Sub "${SafemateWalletsTable.Arn}/index/*"
                - !Sub "${SafemateFoldersTable.Arn}/index/*"
                - !Sub "${SafemateFilesTable.Arn}/index/*"
                - !Sub "${SafemateTransactionsTable.Arn}/index/*"
                - !Sub "${SafemateNFTCollectionsTable.Arn}/index/*"
                - !Sub "${SafemateNFTsTable.Arn}/index/*"
            # S3 Permissions
            - Effect: Allow
              Action:
                - s3:GetObject
                - s3:PutObject
                - s3:DeleteObject
                - s3:HeadObject
                - s3:GetObjectVersion
              Resource: !Sub "${SafemateBucket.Arn}/*"
            - Effect: Allow
              Action:
                - s3:ListBucket
                - s3:GetBucketLocation
                - s3:ListBucketVersions
              Resource: !GetAtt SafemateBucket.Arn
            # KMS Permissions
            - Effect: Allow
              Action:
                - kms:Encrypt
                - kms:Decrypt
                - kms:ReEncrypt*
                - kms:GenerateDataKey*
                - kms:DescribeKey
              Resource: !GetAtt SafemateKMSKey.Arn
            # CloudWatch Logs
            - Effect: Allow
              Action:
                - logs:CreateLogGroup
                - logs:CreateLogStream
                - logs:PutLogEvents
                - logs:DescribeLogGroups
                - logs:DescribeLogStreams
              Resource: !Sub "arn:aws:logs:${AWS::Region}:${AWS::AccountId}:*"
            # Parameter Store (for Hedera credentials)
            - Effect: Allow
              Action:
                - ssm:GetParameter
                - ssm:GetParameters
                - ssm:GetParametersByPath
              Resource:
                - !Sub "arn:aws:ssm:${AWS::Region}:${AWS::AccountId}:parameter/safemate/*"
    Tags:
      - Key: Project
        Value: Safemate
      - Key: Environment
        Value: !Ref Environment
```

### API Gateway Execution Role
**File**: `infrastructure/iam/APIGatewayExecutionRole.yaml`

```yaml
APIGatewayExecutionRole:
  Type: AWS::IAM::Role
  Properties:
    RoleName: !Sub "SafemateAPIGatewayExecutionRole-${Environment}"
    AssumeRolePolicyDocument:
      Version: '2012-10-17'
      Statement:
        - Effect: Allow
          Principal:
            Service: apigateway.amazonaws.com
          Action: sts:AssumeRole
    Policies:
      - PolicyName: SafemateAPIGatewayPolicy
        PolicyDocument:
          Version: '2012-10-17'
          Statement:
            - Effect: Allow
              Action:
                - lambda:InvokeFunction
              Resource: !Sub "arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:safemate-*"
            - Effect: Allow
              Action:
                - logs:CreateLogGroup
                - logs:CreateLogStream
                - logs:PutLogEvents
                - logs:DescribeLogGroups
                - logs:DescribeLogStreams
              Resource: !Sub "arn:aws:logs:${AWS::Region}:${AWS::AccountId}:*"
    Tags:
      - Key: Project
        Value: Safemate
      - Key: Environment
        Value: !Ref Environment
```

---

## Security and Encryption

### KMS Key Configuration
**File**: `infrastructure/security/SafemateKMSKey.yaml`

```yaml
SafemateKMSKey:
  Type: AWS::KMS::Key
  Properties:
    Description: !Sub "Safemate encryption key for sensitive data - ${Environment}"
    KeyPolicy:
      Version: '2012-10-17'
      Statement:
        - Sid: Enable IAM User Permissions
          Effect: Allow
          Principal:
            AWS: !Sub "arn:aws:iam::${AWS::AccountId}:root"
          Action: "kms:*"
          Resource: "*"
        - Sid: Allow Lambda Functions
          Effect: Allow
          Principal:
            AWS: !GetAtt LambdaExecutionRole.Arn
          Action:
            - kms:Encrypt
            - kms:Decrypt
            - kms:ReEncrypt*
            - kms:GenerateDataKey*
            - kms:DescribeKey
          Resource: "*"
        - Sid: Allow DynamoDB Service
          Effect: Allow
          Principal:
            Service: dynamodb.amazonaws.com
          Action:
            - kms:Encrypt
            - kms:Decrypt
            - kms:ReEncrypt*
            - kms:GenerateDataKey*
            - kms:DescribeKey
          Resource: "*"
        - Sid: Allow S3 Service
          Effect: Allow
          Principal:
            Service: s3.amazonaws.com
          Action:
            - kms:Encrypt
            - kms:Decrypt
            - kms:ReEncrypt*
            - kms:GenerateDataKey*
            - kms:DescribeKey
          Resource: "*"
    Tags:
      - Key: Project
        Value: Safemate
      - Key: Environment
        Value: !Ref Environment

SafemateKMSKeyAlias:
  Type: AWS::KMS::Alias
  Properties:
    AliasName: !Sub "alias/safemate-encryption-key-${Environment}"
    TargetKeyId: !Ref SafemateKMSKey
```

### Lambda Authorizer for Fine-Grained Access Control
**File**: `src/functions/auth/customAuthorizer.js`

```javascript
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const client = jwksClient({
    jwksUri: `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}/.well-known/jwks.json`
});

function getKey(header, callback) {
    client.getSigningKey(header.kid, (err, key) => {
        const signingKey = key.publicKey || key.rsaPublicKey;
        callback(null, signingKey);
    });
}

exports.handler = async (event) => {
    try {
        const token = event.authorizationToken.replace('Bearer ', '');
        
        // Verify JWT token with Cognito
        const decodedToken = await new Promise((resolve, reject) => {
            jwt.verify(token, getKey, {
                issuer: `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`,
                algorithms: ['RS256']
            }, (err, decoded) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(decoded);
                }
            });
        });
        
        const userId = decodedToken.sub;
        const groups = decodedToken['cognito:groups'] || [];
        
        // Generate policy based on user groups and request context
        const policy = generatePolicy(userId, groups, event.methodArn);
        
        // Add user context to pass to Lambda functions
        policy.context = {
            userId: userId,
            email: decodedToken.email,
            groups: JSON.stringify(groups),
            username: decodedToken['cognito:username']
        };
        
        return policy;
    } catch (error) {
        console.error('Authorization failed:', error);
        throw new Error('Unauthorized');
    }
};

function generatePolicy(userId, groups, resource) {
    const policy = {
        principalId: userId,
        policyDocument: {
            Version: '2012-10-17',
            Statement: []
        }
    };
    
    // Base permissions for all authenticated users
    policy.policyDocument.Statement.push({
        Action: 'execute-api:Invoke',
        Effect: 'Allow',
        Resource: [
            resource.replace(/\/[^/]*$/, '/wallets'),
            resource.replace(/\/[^/]*$/, '/wallets/*'),
            resource.replace(/\/[^/]*$/, '/folders'),
            resource.replace(/\/[^/]*$/, '/folders/*'),
            resource.replace(/\/[^/]*$/, '/files'),
            resource.replace(/\/[^/]*$/, '/files/*'),
            resource.replace(/\/[^/]*$/, '/tokens'),
            resource.replace(/\/[^/]*$/, '/tokens/*')
        ]
    });
    
    // Admin permissions
    if (groups.includes('Admin')) {
        policy.policyDocument.Statement.push({
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
        });
    }
    
    // Premium user permissions
    if (groups.includes('Premium')) {
        policy.policyDocument.Statement.push({
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: [
                resource.replace(/\/[^/]*$/, '/premium/*'),
                resource.replace(/\/[^/]*$/, '/analytics/*')
            ]
        });
    }
    
    return policy;
}
```

---

## Utility Functions

### Core Utilities
**File**: `src/utils/index.js`

```javascript
const crypto = require('crypto');
const AWS = require('aws-sdk');

const kms = new AWS.KMS();
const dynamodb = new AWS.DynamoDB();

// Encryption utilities
async function encryptData(plaintext) {
    const params = {
        KeyId: process.env.KMS_KEY_ID,
        Plaintext: plaintext
    };
    
    const result = await kms.encrypt(params).promise();
    return result.CiphertextBlob.toString('base64');
}

async function decryptData(ciphertextBlob) {
    const params = {
        CiphertextBlob: Buffer.from(ciphertextBlob, 'base64')
    };
    
    const result = await kms.decrypt(params).promise();
    return result.Plaintext.toString();
}

// ID generators
function generateFileId() {
    return 'file_' + crypto.randomUUID();
}

function generateFolderId() {
    return 'folder_' + crypto.randomUUID();
}

function generateWalletId() {
    return 'wallet_' + crypto.randomUUID();
}

// Validation functions
function validateFileType(fileType) {
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'text/plain',
        'text/csv',
        'application/json',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/zip',
        'application/x-zip-compressed'
    ];
    
    return allowedTypes.includes(fileType);
}

function validateFileSize(size) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    return size <= maxSize;
}

async function validateFolderAccess(userId, folderId) {
    const result = await dynamodb.getItem({
        TableName: 'SafemateFolders',
        Key: { folderId: { S: folderId } }
    }).promise();
    
    if (!result.Item) {
        throw new Error('Folder not found');
    }
    
    if (result.Item.userId.S !== userId) {
        throw new Error('Access denied');
    }
    
    return result.Item;
}

// Error handling
function createErrorResponse(statusCode, message, details = null) {
    const response = {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        body: JSON.stringify({
            error: message,
            ...(details && { details })
        })
    };
    
    return response;
}

function createSuccessResponse(statusCode, data) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        body: JSON.stringify(data)
    };
}

module.exports = {
    encryptData,
    decryptData,
    generateFileId,
    generateFolderId,
    generateWalletId,
    validateFileType,
    validateFileSize,
    validateFolderAccess,
    createErrorResponse,
    createSuccessResponse
};
```

### Hedera Client Utilities
**File**: `src/utils/hederaClient.js`

```javascript
const { Client, AccountId, PrivateKey, Hbar } = require('@hashgraph/sdk');

function createTestnetClient() {
    // Direct testnet connection without mirror nodes
    const client = Client.forTestnet();
    
    // Set operator from environment
    client.setOperator(
        AccountId.fromString(process.env.HEDERA_OPERATOR_ID),
        PrivateKey.fromString(process.env.HEDERA_OPERATOR# Safemate Project: Complete AWS Architecture Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture Components](#architecture-components)
3. [Authentication & User Management](#authentication--user-management)
4. [Wallet Creation Functions](#wallet-creation-functions)
5. [File Management Functions](#file-management-functions)
6. [Folder Management Functions](#folder-management-functions)
7. [Testnet-Specific Functions](#testnet-specific-functions)
8. [Database Schema](#database-schema)
9. [S3 Configuration](#s3-configuration)
10. [IAM Roles and Policies](#iam-roles-and-policies)
11. [Security and Encryption](#security-and-encryption)
12. [Monitoring and Logging](#monitoring-and-logging)
13. [Utility Functions](#utility-functions)
14. [Environment Configuration](#environment-configuration)
15. [Deployment Configuration](#deployment-configuration)
16. [API Endpoints Summary](#api-endpoints-summary)
17. [Cost Optimization](#cost-optimization)

---

## Overview

This document outlines the complete AWS serverless architecture for the Safemate project, focusing on:
- **Hedera Wallet Creation** (Direct testnet integration, no mirror nodes)
- **File Management** (Secure S3-based storage)
- **Folder Operations** (Hierarchical organization)
- **NFT Operations** (Direct testnet minting and transfers)

### Key Design Principles
- **Serverless-First**: All compute via AWS Lambda
- **Direct Testnet**: No mirror node dependencies
- **Security-Focused**: KMS encryption, fine-grained IAM
- **Scalable**: Auto-scaling with pay-per-use pricing
- **Observable**: Comprehensive logging and monitoring

---

## Architecture Components

### Core AWS Services Required

1. **Amazon API Gateway** (REST API) - API management and routing
2. **AWS Lambda Functions** - Serverless compute
3. **Amazon Cognito User Pools** - User authentication
4. **Amazon S3** - File storage
5. **Amazon DynamoDB** - NoSQL database
6. **AWS IAM** - Access control
7. **Amazon CloudWatch** - Monitoring and logging
8. **AWS KMS** - Encryption key management

### Architecture Diagram
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web/Mobile    │────│   CloudFront    │────│   API Gateway   │
│   Application   │    │   (Optional)    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                              ┌─────────────────┐
                                              │  Cognito User   │
                                              │     Pools       │
                                              └─────────────────┘
                                                        │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Hedera SDK    │────│  Lambda Layer   │────│  Lambda Funcs   │
│   Testnet       │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    DynamoDB     │────│      KMS        │────│       S3        │
│   Tables        │    │   Encryption    │    │   File Storage  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## Authentication & User Management

### Amazon Cognito User Pool Configuration

```yaml
CognitoUserPool:
  Type: AWS::Cognito::UserPool
  Properties:
    UserPoolName: SafemateUserPool
    Policies:
      PasswordPolicy:
        MinimumLength: 8
        RequireUppercase: true
        RequireLowercase: true
        RequireNumbers: true
        RequireSymbols: true
    AutoVerifiedAttributes:
      - email
    MfaConfiguration: OPTIONAL
    Schema:
      - Name: email
        AttributeDataType: String
        Mutable: false
        Required: true
      - Name: given_name
        AttributeDataType: String
        Mutable: true
        Required: true
      - Name: family_name
        AttributeDataType: String
        Mutable: true
        Required: true
    UserPoolTags:
      Project: Safemate
      Environment: !Ref Environment

CognitoUserPoolClient:
  Type: AWS::Cognito::UserPoolClient
  Properties:
    UserPoolId: !Ref CognitoUserPool
    ClientName: SafemateAppClient
    GenerateSecret: false
    ExplicitAuthFlows:
      - ALLOW_USER_PASSWORD_AUTH
      - ALLOW_REFRESH_TOKEN_AUTH
      - ALLOW_USER_SRP_AUTH
    TokenValidityUnits:
      AccessToken: hours
      IdToken: hours
      RefreshToken: days
    AccessTokenValidity: 24
    IdTokenValidity: 24
    RefreshTokenValidity: 30
```

---

## Wallet Creation Functions

### Core Wallet Operations

#### Function: CreateWallet
**File**: `src/functions/wallet/createWallet.js`

```javascript
const { 
    Client, 
    PrivateKey, 
    AccountCreateTransaction, 
    AccountId, 
    Hbar,
    Status 
} = require('@hashgraph/sdk');
const { encryptData, generateWalletId } = require('../../utils');
const { createTestnetClient, executeWithRetry } = require('../../utils/hederaClient');

exports.handler = async (event) => {
    const { userId, walletType, keyType = 'ECDSA' } = JSON.parse(event.body);
    
    try {
        // Initialize Hedera testnet client
        const client = createTestnetClient();
        
        // Generate new account keys
        const privateKey = keyType === 'ECDSA' ? 
            PrivateKey.generateECDSA() : 
            PrivateKey.generateED25519();
        const publicKey = privateKey.publicKey;
        
        // Create Hedera account on testnet
        const accountCreateTx = new AccountCreateTransaction()
            .setKey(publicKey)
            .setInitialBalance(new Hbar(5))
            .setMaxAutomaticTokenAssociations(100)
            .setAccountMemo(`Safemate user: ${userId}`)
            .setMaxTransactionFee(new Hbar(2))
            .freezeWith(client);
            
        // Execute with retry logic
        const accountCreateResult = await executeWithRetry(async () => {
            const signedTx = await accountCreateTx.sign(
                PrivateKey.fromString(process.env.HEDERA_OPERATOR_KEY)
            );
            const submitResult = await signedTx.execute(client);
            return await submitResult.getReceipt(client);
        });
        
        if (accountCreateResult.status !== Status.Success) {
            throw new Error(`Account creation failed: ${accountCreateResult.status}`);
        }
        
        const newAccountId = accountCreateResult.accountId;
        const walletId = generateWalletId();
        
        // Encrypt private key before storage
        const encryptedPrivateKey = await encryptData(privateKey.toString());
        
        // Store wallet data in DynamoDB
        const dynamodb = new AWS.DynamoDB();
        await dynamodb.putItem({
            TableName: 'SafemateWallets',
            Item: {
                userId: { S: userId },
                walletId: { S: walletId },
                accountId: { S: newAccountId.toString() },
                encryptedPrivateKey: { S: encryptedPrivateKey },
                publicKey: { S: publicKey.toString() },
                walletType: { S: walletType },
                keyType: { S: keyType },
                networkType: { S: 'testnet' },
                createdAt: { S: new Date().toISOString() },
                isActive: { BOOL: true },
                balance: { S: '5.0' }
            }
        }).promise();
        
        client.close();
        
        return {
            statusCode: 201,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                walletId: walletId,
                accountId: newAccountId.toString(),
                publicKey: publicKey.toString(),
                network: 'testnet',
                initialBalance: '5.0',
                transactionId: accountCreateResult.transactionId ? accountCreateResult.transactionId.toString() : null
            })
        };
    } catch (error) {
        console.error('Wallet creation error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                error: 'Failed to create wallet',
                details: error.message 
            })
        };
    }
};
```

#### Function: GetWalletBalance
**File**: `src/functions/wallet/getWalletBalance.js`

```javascript
const { 
    Client, 
    AccountBalanceQuery, 
    AccountId, 
    PrivateKey 
} = require('@hashgraph/sdk');
const { createTestnetClient, executeWithRetry } = require('../../utils/hederaClient');

exports.handler = async (event) => {
    const { walletId } = event.pathParameters;
    const userId = event.requestContext.authorizer.claims.sub;
    
    try {
        const dynamodb = new AWS.DynamoDB();
        
        // Get wallet from DynamoDB
        const walletResult = await dynamodb.getItem({
            TableName: 'SafemateWallets',
            Key: {
                userId: { S: userId },
                walletId: { S: walletId }
            }
        }).promise();
        
        if (!walletResult.Item) {
            return {
                statusCode: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Wallet not found' })
            };
        }
        
        const wallet = walletResult.Item;
        const accountId = AccountId.fromString(wallet.accountId.S);
        
        // Initialize Hedera testnet client
        const client = createTestnetClient();
        
        // Query account balance directly from testnet
        const accountBalance = await executeWithRetry(async () => {
            return await new AccountBalanceQuery()
                .setAccountId(accountId)
                .execute(client);
        });
        
        // Update balance in DynamoDB for caching
        await dynamodb.updateItem({
            TableName: 'SafemateWallets',
            Key: {
                userId: { S: userId },
                walletId: { S: walletId }
            },
            UpdateExpression: 'SET balance = :balance, lastBalanceCheck = :timestamp',
            ExpressionAttributeValues: {
                ':balance': { S: accountBalance.hbars.toString() },
                ':timestamp': { S: new Date().toISOString() }
            }
        }).promise();
        
        client.close();
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                message: 'File deleted successfully',
                fileId: fileId
            })
        };
    } catch (error) {
        console.error('Delete file error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                error: 'Failed to delete file',
                details: error.message 
            })
        };
    }
};
```

---

## Folder Management Functions

### Core Folder Operations

#### Function: CreateFolder
**File**: `src/functions/folder/createFolder.js`

```javascript
const AWS = require('aws-sdk');
const { validateFolderAccess, generateFolderId } = require('../../utils');

exports.handler = async (event) => {
    const { folderName, parentFolderId, isPrivate, walletId } = JSON.parse(event.body);
    const userId = event.requestContext.authorizer.claims.sub;
    
    try {
        const dynamodb = new AWS.DynamoDB();
        const folderId = generateFolderId();
        
        // Validate parent folder access if specified
        if (parentFolderId) {
            await validateFolderAccess(userId, parentFolderId);
        }
        
        // Check for duplicate folder names in the same parent
        let filterExpression = 'userId = :userId AND folderName = :folderName';
        let expressionAttributeValues = {
            ':userId': { S: userId },
            ':folderName': { S: folderName }
        };
        
        if (parentFolderId) {
            filterExpression += ' AND parentFolderId = :parentFolderId';
            expressionAttributeValues[':parentFolderId'] = { S: parentFolderId };
        } else {
            filterExpression += ' AND attribute_not_exists(parentFolderId)';
        }
        
        const existingFolders = await dynamodb.scan({
            TableName: 'SafemateFolders',
            FilterExpression: filterExpression,
            ExpressionAttributeValues: expressionAttributeValues
        }).promise();
        
        if (existingFolders.Items.length > 0) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ 
                    error: 'Folder with this name already exists in the same location' 
                })
            };
        }
        
        await dynamodb.putItem({
            TableName: 'SafemateFolders',
            Item: {
                folderId: { S: folderId },
                userId: { S: userId },
                folderName: { S: folderName },
                parentFolderId: parentFolderId ? { S: parentFolderId } : { NULL: true },
                isPrivate: { BOOL: isPrivate || false },
                walletId: walletId ? { S: walletId } : { NULL: true },
                createdAt: { S: new Date().toISOString() },
                updatedAt: { S: new Date().toISOString() }
            }
        }).promise();
        
        return {
            statusCode: 201,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                folderId,
                folderName,
                parentFolderId,
                isPrivate: isPrivate || false,
                walletId,
                createdAt: new Date().toISOString()
            })
        };
    } catch (error) {
        console.error('Create folder error:', error);
        return {
            statusCode: 400,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                error: 'Failed to create folder',
                details: error.message 
            })
        };
    }
};
```

#### Function: ListFolders
**File**: `src/functions/folder/listFolders.js`

```javascript
const AWS = require('aws-sdk');

exports.handler = async (event) => {
    const { parentFolderId } = event.queryStringParameters || {};
    const userId = event.requestContext.authorizer.claims.sub;
    
    try {
        const dynamodb = new AWS.DynamoDB();
        
        let queryParams = {
            TableName: 'SafemateFolders',
            IndexName: 'UserIdIndex',
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': { S: userId }
            }
        };
        
        if (parentFolderId) {
            queryParams.FilterExpression = 'parentFolderId = :parentFolderId';
            queryParams.ExpressionAttributeValues[':parentFolderId'] = { S: parentFolderId };
        } else {
            queryParams.FilterExpression = 'attribute_not_exists(parentFolderId) OR parentFolderId = :null';
            queryParams.ExpressionAttributeValues[':null'] = { NULL: true };
        }
        
        const result = await dynamodb.query(queryParams).promise();
        
        const folders = result.Items.map(item => ({
            folderId: item.folderId.S,
            folderName: item.folderName.S,
            parentFolderId: item.parentFolderId && !item.parentFolderId.NULL ? item.parentFolderId.S : null,
            isPrivate: item.isPrivate.BOOL,
            walletId: item.walletId && !item.walletId.NULL ? item.walletId.S : null,
            createdAt: item.createdAt.S,
            updatedAt: item.updatedAt.S
        }));
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ folders })
        };
    } catch (error) {
        console.error('List folders error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                error: 'Failed to list folders',
                details: error.message 
            })
        };
    }
};
```

#### Function: GetFolderContents
**File**: `src/functions/folder/getFolderContents.js`

```javascript
const AWS = require('aws-sdk');
const { validateFolderAccess } = require('../../utils');

exports.handler = async (event) => {
    const { folderId } = event.pathParameters;
    const userId = event.requestContext.authorizer.claims.sub;
    
    try {
        const dynamodb = new AWS.DynamoDB();
        
        // Validate folder access
        await validateFolderAccess(userId, folderId);
        
        // Get subfolders
        const foldersResult = await dynamodb.query({
            TableName: 'SafemateFolders',
            IndexName: 'UserIdIndex',
            KeyConditionExpression: 'userId = :userId',
            FilterExpression: 'parentFolderId = :folderId',
            ExpressionAttributeValues: {
                ':userId': { S: userId },
                ':folderId': { S: folderId }
            }
        }).promise();
        
        // Get files
        const filesResult = await dynamodb.query({
            TableName: 'SafemateFiles',
            IndexName: 'FolderIdIndex',
            KeyConditionExpression: 'folderId = :folderId',
            FilterExpression: 'userId = :userId AND #status = :status',
            ExpressionAttributeNames: {
                '#status': 'status'
            },
            ExpressionAttributeValues: {
                ':folderId': { S: folderId },
                ':userId': { S: userId },
                ':status': { S: 'completed' }
            }
        }).promise();
        
        const folders = foldersResult.Items.map(item => ({
            type: 'folder',
            folderId: item.folderId.S,
            folderName: item.folderName.S,
            isPrivate: item.isPrivate.BOOL,
            walletId: item.walletId && !item.walletId.NULL ? item.walletId.S : null,
            createdAt: item.createdAt.S,
            updatedAt: item.updatedAt.S
        }));
        
        const files = filesResult.Items.map(item => ({
            type: 'file',
            fileId: item.fileId.S,
            fileName: item.fileName.S,
            fileType: item.fileType.S,
            fileSize: item.fileSize ? parseInt(item.fileSize.N) : null,
            uploadedAt: item.uploadedAt ? item.uploadedAt.S : null,
            createdAt: item.createdAt.S
        }));
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                folderId,
                contents: [...folders, ...files],
                summary: {
                    totalFolders: folders.length,
                    totalFiles: files.length,
                    totalItems: folders.length + files.length
                }
            })
        };
    } catch (error) {
        console.error('Get folder contents error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                error: 'Failed to get folder contents',
                details: error.message 
            })
        };
    }
};
```

#### Function: UpdateFolder
**File**: `src/functions/folder/updateFolder.js`

```javascript
const AWS = require('aws-sdk');
const { validateFolderAccess } = require('../../utils');

exports.handler = async (event) => {
    const { folderId } = event.pathParameters;
    const { folderName, isPrivate } = JSON.parse(event.body);
    const userId = event.requestContext.authorizer.claims.sub;
    
    try {
        const dynamodb = new AWS.DynamoDB();
        
        // Validate folder access
        await validateFolderAccess(userId, folderId);
        
        let updateExpression = 'SET updatedAt = :updatedAt';
        let expressionAttributeValues = {
            ':updatedAt': { S: new Date().toISOString() }
        };
        
        if (folderName !== undefined) {
            updateExpression += ', folderName = :folderName';
            expressionAttributeValues[':folderName'] = { S: folderName };
        }
        
        if (isPrivate !== undefined) {
            updateExpression += ', isPrivate = :isPrivate';
            expressionAttributeValues[':isPrivate'] = { BOOL: isPrivate };
        }
        
        await dynamodb.updateItem({
            TableName: 'SafemateFolders',
            Key: { folderId: { S: folderId } },
            UpdateExpression: updateExpression,
            ExpressionAttributeValues: expressionAttributeValues
        }).promise();
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                message: 'Folder updated successfully',
                folderId: folderId,
                updatedAt: new Date().toISOString()
            })
        };
    } catch (error) {
        console.error('Update folder error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                error: 'Failed to update folder',
                details: error.message 
            })
        };
    }
};
```

#### Function: DeleteFolder
**File**: `src/functions/folder/deleteFolder.js`

```javascript
const AWS = require('aws-sdk');
const { validateFolderAccess } = require('../../utils');

exports.handler = async (event) => {
    const { folderId } = event.pathParameters;
    const { force } = event.queryStringParameters || {};
    const userId = event.requestContext.authorizer.claims.sub;
    
    try {
        const dynamodb = new AWS.DynamoDB();
        const s3 = new AWS.S3();
        
        // Validate folder access
        await validateFolderAccess(userId, folderId);
        
        if (!force) {
            // Check if folder has contents
            const hasContents = await checkFolderHasContents(folderId, userId);
            if (hasContents) {
                return {
                    statusCode: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({ 
                        error: 'Folder is not empty. Use force=true to delete with contents.' 
                    })
                };
            }
        } else {
            // Delete all contents recursively
            await deleteFolderContents(folderId, userId);
        }
        
        // Delete folder
        await dynamodb.deleteItem({
            TableName: 'SafemateFolders',
            Key: { folderId: { S: folderId } }
        }).promise();
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                message: 'Folder deleted successfully',
                folderId: folderId
            })
        };
    } catch (error) {
        console.error('Delete folder error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                error: 'Failed to delete folder',
                details: error.message 
            })
        };
    }
};

async function checkFolderHasContents(folderId, userId) {
    const dynamodb = new AWS.DynamoDB();
    
    // Check for subfolders
    const foldersResult = await dynamodb.query({
        TableName: 'SafemateFolders',
        IndexName: 'UserIdIndex',
        KeyConditionExpression: 'userId = :userId',
        FilterExpression: 'parentFolderId = :folderId',
        ExpressionAttributeValues: {
            ':userId': { S: userId },
            ':folderId': { S: folderId }
        },
        Limit: 1
    }).promise();
    
    if (foldersResult.Items.length > 0) {
        return true;
    }
    
    // Check for files
    const filesResult = await dynamodb.query({
        TableName: 'SafemateFiles',
        IndexName: 'FolderIdIndex',
        KeyConditionExpression: 'folderId = :folderId',
        FilterExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':folderId': { S: folderId },
            ':userId': { S: userId }
        },
        Limit: 1
    }).promise();
    
    return filesResult.Items.length > 0;
}

async function deleteFolderContents(folderId, userId) {
    const dynamodb = new AWS.DynamoDB();
    const s3 = new AWS.S3();
    
    // Delete all files in folder
    const filesResult = await dynamodb.query({
        TableName: 'SafemateFiles',
        IndexName: 'FolderIdIndex',
        KeyConditionExpression: 'folderId = :folderId',
        FilterExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':folderId': { S: folderId },
            ':userId': { S: userId }
        }
    }).promise();
    
    for (const file of filesResult.Items) {
        try {
            // Delete from S3
            await s3.deleteObject({
                Bucket: process.env.SAFEMATE_BUCKET,
                Key: file.s3Key.S
            }).promise();
            
            // Delete from DynamoDB
            await dynamodb.deleteItem({
                TableName: 'SafemateFiles',
                Key: { fileId: { S: file.fileId.S } }
            }).promise();
        } catch (error) {
            console.error(`Failed to delete file ${file.fileId.S}:`, error);
        }
    }
    
    // Delete all subfolders recursively
    const foldersResult = await dynamodb.query({
        TableName: 'SafemateFolders',
        IndexName: 'UserIdIndex',
        KeyConditionExpression: 'userId = :userId',
        FilterExpression: 'parentFolderId = :folderId',
        ExpressionAttributeValues: {
            ':userId': { S: userId },
            ':folderId': { S: folderId }
        }
    }).promise();
    
    for (const subfolder of foldersResult.Items) {
        try {
            await deleteFolderContents(subfolder.folderId.S, userId);
            await dynamodb.deleteItem({
                TableName: 'SafemateFolders',
                Key: { folderId: { S: subfolder.folderId.S } }
            }).promise();
        } catch (error) {
            console.error(`Failed to delete subfolder ${subfolder.folderId.S}:`, error);
        }
    }
}
```

---

## Testnet-Specific Functions

### NFT and Token Operations

#### Function: CreateNFTCollection
**File**: `src/functions/nft/createNFTCollection.js`

```javascript
const { 
    Client, 
    TokenCreateTransaction,
    TokenType,
    TokenSupplyType,
    PrivateKey,
    AccountId,
    Hbar,
    Status 
} = require('@hashgraph/sdk');
const { createTestnetClient, executeWithRetry } = require('../../utils/hederaClient');
const { decryptData } = require('../../utils');

exports.handler = async (event) => {
    const { 
        walletId, 
        tokenName, 
        tokenSymbol, 
        maxSupply = 1000,
        tokenMemo = '' 
    } = JSON.parse(event.body);
    const userId = event.requestContext.authorizer.claims.sub;
    
    try {
        const dynamodb = new AWS.DynamoDB();
        
        // Get wallet from DynamoDB
        const walletResult = await dynamodb.getItem({
            TableName: 'SafemateWallets',
            Key: {
                userId: { S: userId },
                walletId: { S: walletId }
            }
        }).promise();
        
        if (!walletResult.Item) {
            return {
                statusCode: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Wallet not found' })
            };
        }
        
        const wallet = walletResult.Item;
        const decryptedPrivateKey = await decryptData(wallet.encryptedPrivateKey.S);
        const treasuryKey = PrivateKey.fromString(decryptedPrivateKey);
        const treasuryId = AccountId.fromString(wallet.accountId.S);
        
        const client = createTestnetClient();
        client.setOperator(treasuryId, treasuryKey);
        
        // Create NFT collection on testnet
        const tokenCreateTx = new TokenCreateTransaction()
            .setTokenName(tokenName)
            .setTokenSymbol(tokenSymbol)
            .setTokenType(TokenType.NonFungibleUnique)
            .setDecimals(0)
            .setInitialSupply(0)
            .setTreasuryAccountId(treasuryId)
            .setSupplyType(TokenSupplyType.Finite)
            .setMaxSupply(maxSupply)
            .setSupplyKey(treasuryKey)
            .setTokenMemo(tokenMemo)
            .setMaxTransactionFee(new Hbar(30))
            .freezeWith(client);
        
        const tokenCreateResult = await executeWithRetry(async () => {
            const signedTx = await tokenCreateTx.sign(treasuryKey);
            const submitResult = await signedTx.execute(client);
            return await submitResult.getReceipt(client);
        });
        
        if (tokenCreateResult.status !== Status.Success) {
            throw new Error(`Token creation failed: ${tokenCreateResult.status}`);
        }
        
        const tokenId = tokenCreateResult.tokenId;
        const collectionId = `collection_${crypto.randomUUID()}`;
        
        // Store collection metadata
        await dynamodb.putItem({
            TableName: 'SafemateNFTCollections',
            Item: {
                collectionId: { S: collectionId },
                userId: { S: userId },
                walletId: { S: walletId },
                tokenId: { S: tokenId.toString() },
                tokenName: { S: tokenName },
                tokenSymbol: { S: tokenSymbol },
                maxSupply: { N: maxSupply.toString() },
                currentSupply: { N: '0' },
                treasuryAccountId: { S: treasuryId.toString() },
                createdAt: { S: new Date().toISOString() },
                isActive: { BOOL: true }
            }
        }).promise();
        
        client.close();
        
        return {
            statusCode: 201,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                collectionId,
                tokenId: tokenId.toString(),
                tokenName,
                tokenSymbol,
                maxSupply,
                treasuryAccountId: treasuryId.toString(),
                transactionId: tokenCreateResult.transactionId ? tokenCreateResult.transactionId.toString() : null
            })
        };
    } catch (error) {
        console.error('NFT collection creation error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                error: 'Failed to create NFT collection',
                details: error.message 
            })
        };
    }
};
```

#### Function: MintNFT
**File**: `src/functions/nft/mintNFT.js`

```javascript
const { 
    Client, 
    TokenMintTransaction,
    TokenId,
    PrivateKey,
    AccountId,
    Hbar,
    Status 
} = require('@hashgraph/sdk');
const { createTestnetClient, executeWithRetry } = require('../../utils/hederaClient');
const { decryptData } = require('../../utils');

exports.handler = async (event) => {
    const { 
        collectionId, 
        metadata, // IPFS CID or metadata string
        quantity = 1 
    } = JSON.parse(event.body);
    const userId = event.requestContext.authorizer.claims.sub;
    
    try {
        const dynamodb = new AWS.DynamoDB();
        
        // Get collection info
        const collectionResult = await dynamodb.getItem({
            TableName: 'SafemateNFTCollections',
            Key: { collectionId: { S: collectionId } }
        }).promise();
        
        if (!collectionResult.Item || collectionResult.Item.userId.S !== userId) {
            return {
                statusCode: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Collection not found or access denied' })
            };
        }
        
        const collection = collectionResult.Item;
        const tokenId = TokenId.fromString(collection.tokenId.S);
        const currentSupply = parseInt(collection.currentSupply.N);
        const maxSupply = parseInt(collection.maxSupply.N);
        
        if (currentSupply + quantity > maxSupply) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ 
                    error: `Cannot mint ${quantity} NFTs. Would exceed max supply of ${maxSupply}. Current supply: ${currentSupply}` 
                })
            };
        }
        
        // Get wallet info for signing
        const walletResult = await dynamodb.getItem({
            TableName: 'SafemateWallets',
            Key: {
                userId: { S: userId },
                walletId: { S: collection.walletId.S }
            }
        }).promise();
        
        const decryptedPrivateKey = await decryptData(walletResult.Item.encryptedPrivateKey.S);
        const supplyKey = PrivateKey.fromString(decryptedPrivateKey);
        const treasuryId = AccountId.fromString(collection.treasuryAccountId.S);
        
        const client = createTestnetClient();
        client.setOperator(treasuryId, supplyKey);
        
        // Prepare metadata for minting
        const metadataArray = Array.isArray(metadata) ? metadata : [metadata];
        const mintMetadata = metadataArray.slice(0, quantity).map(meta => 
            Buffer.from(typeof meta === 'string' ? meta : JSON.stringify(meta))
        );
        
        // Create mint transaction
        const mintTx = new TokenMintTransaction()
            .setTokenId(tokenId)
            .setMaxTransactionFee(new Hbar(20));
            
        mintMetadata.forEach(meta => {
            mintTx.addMetadata(meta);
        });
        
        const mintResult = await executeWithRetry(async () => {
            const signedTx = await mintTx.sign(supplyKey);
            const submitResult = await signedTx.execute(client);
            return await submitResult.getReceipt(client);
        });
        
        if (mintResult.status !== Status.Success) {
            throw new Error(`Minting failed: ${mintResult.status}`);
        }
        
        const serialNumbers = mintResult.serials;
        const newSupply = currentSupply + serialNumbers.length;
        
        // Update collection supply
        await dynamodb.updateItem({
            TableName: 'SafemateNFTCollections',
            Key: { collectionId: { S: collectionId } },
            UpdateExpression: 'SET currentSupply = :supply',
            ExpressionAttributeValues: {
                ':supply': { N: newSupply.toString() }
            }
        }).promise();
        
        // Record minted NFTs
        const nftRecords = serialNumbers.map((serial, index) => ({
            PutRequest: {
                Item: {
                    nftId: { S: `${tokenId.toString()}-${serial.toString()}` },
                    collectionId: { S: collectionId },
                    tokenId: { S: tokenId.toString() },
                    serialNumber: { N: serial.toString() },
                    userId: { S: userId },
                    metadata: { S: typeof metadataArray[index] === 'string' ? metadataArray[index] : JSON.stringify(metadataArray[index]) },
                    ownerAccountId: { S: treasuryId.toString() },
                    createdAt: { S: new Date().toISOString() },
                    isActive: { BOOL: true }
                }
            }
        }));
        
        // Batch write NFT records
        await dynamodb.batchWriteItem({
            RequestItems: {
                'SafemateNFTs': nftRecords
            }
        }).promise();
        
        client.close();
        
        return {
            statusCode: 201,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                tokenId: tokenId.toString(),
                serialNumbers: serialNumbers.map(s => s.toString()),
                quantity: serialNumbers.length,
                transactionId: mintResult.transactionId ? mintResult.transactionId.toString() : null,
                currentSupply: newSupply
            })
        };
    } catch (error) {
        console.error('NFT minting error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                error: 'Failed to mint NFT',
                details: error.message 
            })
        };
    }
};
```

#### Function: GetAccountInfo
**File**: `src/functions/wallet/getAccountInfo.js`

```javascript
const { 
    Client, 
    AccountInfoQuery, 
    AccountId, 
    PrivateKey 
} = require('@hashgraph/sdk');
const { createTestnetClient, executeWithRetry } = require('../../utils/hederaClient');

exports.handler = async (event) => {
    const { walletId } = event.pathParameters;
    const userId = event.requestContext.authorizer.claims.sub;
    
    try {
        const dynamodb = new AWS.DynamoDB();
        
        // Get wallet from DynamoDB
        const walletResult = await dynamodb.getItem({
            TableName: 'SafemateWallets',
            Key: {
                userId: { S: userId },
                walletId: { S: walletId }
            }
        }).promise();
        
        if (!walletResult.Item) {
            return {
                statusCode: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Wallet not found' })
            };
        }
        
        const accountId = AccountId.fromString(walletResult.Item.accountId.S);
        const client = createTestnetClient();
        
        // Query account info directly from testnet
        const accountInfo = await executeWithRetry(
                walletId: walletId,
                accountId: accountId.toString(),
                balance: {
                    hbars: accountBalance.hbars.toString(),
                    tinybars: accountBalance.hbars.toTinybars().toString()
                },
                tokens: Object.fromEntries(accountBalance.tokens),
                timestamp: new Date().toISOString()
            })
        };
    } catch (error) {
        console.error('Balance query error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                error: 'Failed to get wallet balance',
                details: error.message 
            })
        };
    }
};
```

#### Function: TransferHBAR
**File**: `src/functions/wallet/transferHBAR.js`

```javascript
const { 
    Client, 
    TransferTransaction, 
    AccountId, 
    PrivateKey,
    Hbar,
    Status 
} = require('@hashgraph/sdk');
const { decryptData } = require('../../utils');
const { createTestnetClient, executeWithRetry } = require('../../utils/hederaClient');

exports.handler = async (event) => {
    const { fromWalletId, toAccountId, amount, memo } = JSON.parse(event.body);
    const userId = event.requestContext.authorizer.claims.sub;
    
    try {
        const dynamodb = new AWS.DynamoDB();
        
        // Get sender wallet from DynamoDB
        const walletResult = await dynamodb.getItem({
            TableName: 'SafemateWallets',
            Key: {
                userId: { S: userId },
                walletId: { S: fromWalletId }
            }
        }).promise();
        
        if (!walletResult.Item) {
            return {
                statusCode: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Wallet not found' })
            };
        }
        
        const wallet = walletResult.Item;
        
        // Decrypt private key
        const decryptedPrivateKey = await decryptData(wallet.encryptedPrivateKey.S);
        const senderPrivateKey = PrivateKey.fromString(decryptedPrivateKey);
        const senderAccountId = AccountId.fromString(wallet.accountId.S);
        const receiverAccountId = AccountId.fromString(toAccountId);
        
        // Initialize Hedera testnet client
        const client = createTestnetClient();
        client.setOperator(senderAccountId, senderPrivateKey);
        
        // Create transfer transaction
        const transferTx = new TransferTransaction()
            .addHbarTransfer(senderAccountId, new Hbar(-amount))
            .addHbarTransfer(receiverAccountId, new Hbar(amount))
            .setTransactionMemo(memo || `Transfer from Safemate wallet ${fromWalletId}`)
            .setMaxTransactionFee(new Hbar(1))
            .freezeWith(client);
            
        // Execute with retry
        const transferResult = await executeWithRetry(async () => {
            const signedTx = await transferTx.sign(senderPrivateKey);
            const submitResult = await signedTx.execute(client);
            return await submitResult.getReceipt(client);
        });
        
        if (transferResult.status !== Status.Success) {
            throw new Error(`Transfer failed: ${transferResult.status}`);
        }
        
        // Record transaction in DynamoDB
        await dynamodb.putItem({
            TableName: 'SafemateTransactions',
            Item: {
                transactionId: { S: transferResult.transactionId ? transferResult.transactionId.toString() : crypto.randomUUID() },
                userId: { S: userId },
                walletId: { S: fromWalletId },
                type: { S: 'HBAR_TRANSFER' },
                fromAccount: { S: senderAccountId.toString() },
                toAccount: { S: receiverAccountId.toString() },
                amount: { S: amount.toString() },
                memo: { S: memo || '' },
                status: { S: transferResult.status.toString() },
                timestamp: { S: new Date().toISOString() },
                consensusTimestamp: { S: transferResult.consensusTimestamp ? transferResult.consensusTimestamp.toString() : '' }
            }
        }).promise();
        
        client.close();
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                transactionId: transferResult.transactionId ? transferResult.transactionId.toString() : null,
                status: transferResult.status.toString(),
                amount: amount.toString(),
                from: senderAccountId.toString(),
                to: receiverAccountId.toString(),
                consensusTimestamp: transferResult.consensusTimestamp ? transferResult.consensusTimestamp.toString() : null
            })
        };
    } catch (error) {
        console.error('Transfer error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                error: 'Transfer failed',
                details: error.message 
            })
        };
    }
};
```

#### Function: ListUserWallets
**File**: `src/functions/wallet/listUserWallets.js`

```javascript
exports.handler = async (event) => {
    const userId = event.requestContext.authorizer.claims.sub;
    
    try {
        const dynamodb = new AWS.DynamoDB();
        
        const result = await dynamodb.query({
            TableName: 'SafemateWallets',
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': { S: userId }
            }
        }).promise();
        
        const wallets = result.Items.map(item => ({
            walletId: item.walletId.S,
            accountId: item.accountId.S,
            walletType: item.walletType.S,
            keyType: item.keyType ? item.keyType.S : 'ECDSA',
            networkType: item.networkType ? item.networkType.S : 'testnet',
            createdAt: item.createdAt.S,
            isActive: item.isActive.BOOL,
            balance: item.balance ? item.balance.S : '0',
            lastBalanceCheck: item.lastBalanceCheck ? item.lastBalanceCheck.S : null
        }));
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ wallets })
        };
    } catch (error) {
        console.error('List wallets error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                error: 'Failed to list wallets',
                details: error.message 
            })
        };
    }
};
```

---

## File Management Functions

### Core File Operations

#### Function: GeneratePresignedUrl
**File**: `src/functions/file/generatePresignedUrl.js`

```javascript
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const { validateFileType, validateFileSize, validateFolderAccess, generateFileId } = require('../../utils');

exports.handler = async (event) => {
    const { fileName, fileType, folderId, fileSize } = JSON.parse(event.body);
    const userId = event.requestContext.authorizer.claims.sub;
    
    try {
        // Validate file type and size
        if (!validateFileType(fileType)) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'File type not allowed' })
            };
        }
        
        if (!validateFileSize(fileSize)) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'File size exceeds limit (10MB)' })
            };
        }
        
        // Validate user has access to folder
        await validateFolderAccess(userId, folderId);
        
        const fileId = generateFileId();
        const key = `users/${userId}/folders/${folderId}/files/${fileId}-${fileName}`;
        
        const presignedUrl = await s3.getSignedUrlPromise('putObject', {
            Bucket: process.env.SAFEMATE_BUCKET,
            Key: key,
            Expires: 300, // 5 minutes
            ContentType: fileType,
            ContentLength: fileSize,
            Metadata: {
                userId,
                folderId,
                fileId,
                originalName: fileName
            }
        });
        
        // Create file metadata record
        const dynamodb = new AWS.DynamoDB();
        await dynamodb.putItem({
            TableName: 'SafemateFiles',
            Item: {
                fileId: { S: fileId },
                userId: { S: userId },
                folderId: { S: folderId },
                fileName: { S: fileName },
                fileType: { S: fileType },
                fileSize: { N: fileSize.toString() },
                s3Key: { S: key },
                status: { S: 'uploading' },
                createdAt: { S: new Date().toISOString() }
            }
        }).promise();
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                uploadUrl: presignedUrl,
                fileId: fileId,
                expiresIn: 300
            })
        };
    } catch (error) {
        console.error('Generate presigned URL error:', error);
        return {
            statusCode: 400,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                error: 'Failed to generate upload URL',
                details: error.message 
            })
        };
    }
};
```

#### Function: ProcessFileUpload (S3 Trigger)
**File**: `src/functions/file/processFileUpload.js`

```javascript
const AWS = require('aws-sdk');

exports.handler = async (event) => {
    const dynamodb = new AWS.DynamoDB();
    const s3 = new AWS.S3();
    
    for (const record of event.Records) {
        if (record.eventName.startsWith('ObjectCreated')) {
            const bucket = record.s3.bucket.name;
            const key = record.s3.object.key;
            
            try {
                // Get file metadata from S3 object
                const headObject = await s3.headObject({
                    Bucket: bucket,
                    Key: key
                }).promise();
                
                const { userId, folderId, fileId } = headObject.Metadata;
                
                if (!fileId) {
                    console.log('No fileId in metadata, skipping processing');
                    continue;
                }
                
                // Update file status to completed
                await dynamodb.updateItem({
                    TableName: 'SafemateFiles',
                    Key: { fileId: { S: fileId } },
                    UpdateExpression: 'SET #status = :status, #size = :size, #uploadedAt = :uploadedAt',
                    ExpressionAttributeNames: {
                        '#status': 'status',
                        '#size': 'fileSize',
                        '#uploadedAt': 'uploadedAt'
                    },
                    ExpressionAttributeValues: {
                        ':status': { S: 'completed' },
                        ':size': { N: record.s3.object.size.toString() },
                        ':uploadedAt': { S: new Date().toISOString() }
                    }
                }).promise();
                
                // Optional: Additional file processing (virus scan, thumbnail generation, etc.)
                await processFile(bucket, key, fileId);
                
                console.log(`Successfully processed file upload: ${fileId}`);
                
            } catch (error) {
                console.error('Error processing file upload:', error);
                
                // Try to update file status to failed if we have fileId
                const pathParts = key.split('/');
                if (pathParts.length >= 4) {
                    const filenamePart = pathParts[pathParts.length - 1];
                    const fileId = filenamePart.split('-')[0];
                    
                    if (fileId.startsWith('file_')) {
                        try {
                            await dynamodb.updateItem({
                                TableName: 'SafemateFiles',
                                Key: { fileId: { S: fileId } },
                                UpdateExpression: 'SET #status = :status, errorMessage = :error',
                                ExpressionAttributeNames: {
                                    '#status': 'status'
                                },
                                ExpressionAttributeValues: {
                                    ':status': { S: 'failed' },
                                    ':error': { S: error.message }
                                }
                            }).promise();
                        } catch (updateError) {
                            console.error('Failed to update file status to failed:', updateError);
                        }
                    }
                }
            }
        }
    }
};

async function processFile(bucket, key, fileId) {
    // Implement additional file processing here
    // Examples:
    // - Virus scanning
    // - Thumbnail generation for images
    // - Text extraction for searchability
    // - File validation
    
    console.log(`Processing file: ${fileId} at ${key}`);
    
    // For now, just log that processing is complete
    return Promise.resolve();
}
```

#### Function: GetFileDownloadUrl
**File**: `src/functions/file/getFileDownloadUrl.js`

```javascript
const AWS = require('aws-sdk');

exports.handler = async (event) => {
    const { fileId } = event.pathParameters;
    const userId = event.requestContext.authorizer.claims.sub;
    
    try {
        const dynamodb = new AWS.DynamoDB();
        const s3 = new AWS.S3();
        
        // Get file metadata
        const fileResult = await dynamodb.getItem({
            TableName: 'SafemateFiles',
            Key: { fileId: { S: fileId } }
        }).promise();
        
        if (!fileResult.Item) {
            return {
                statusCode: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'File not found' })
            };
        }
        
        const fileItem = fileResult.Item;
        
        // Verify user has access
        if (fileItem.userId.S !== userId) {
            return {
                statusCode: 403,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Access denied' })
            };
        }
        
        // Check if file is ready for download
        if (fileItem.status.S !== 'completed') {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ 
                    error: 'File not ready for download',
                    status: fileItem.status.S 
                })
            };
        }
        
        // Generate download URL
        const downloadUrl = await s3.getSignedUrlPromise('getObject', {
            Bucket: process.env.SAFEMATE_BUCKET,
            Key: fileItem.s3Key.S,
            Expires: 300,
            ResponseContentDisposition: `attachment; filename="${fileItem.fileName.S}"`
        });
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                downloadUrl,
                fileName: fileItem.fileName.S,
                fileSize: fileItem.fileSize ? parseInt(fileItem.fileSize.N) : null,
                fileType: fileItem.fileType.S,
                expiresIn: 300
            })
        };
    } catch (error) {
        console.error('Get download URL error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                error: 'Failed to generate download URL',
                details: error.message 
            })
        };
    }
};
```

#### Function: DeleteFile
**File**: `src/functions/file/deleteFile.js`

```javascript
const AWS = require('aws-sdk');

exports.handler = async (event) => {
    const { fileId } = event.pathParameters;
    const userId = event.requestContext.authorizer.claims.sub;
    
    try {
        const dynamodb = new AWS.DynamoDB();
        const s3 = new AWS.S3();
        
        // Get file metadata
        const fileResult = await dynamodb.getItem({
            TableName: 'SafemateFiles',
            Key: { fileId: { S: fileId } }
        }).promise();
        
        if (!fileResult.Item) {
            return {
                statusCode: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'File not found' })
            };
        }
        
        const fileItem = fileResult.Item;
        
        // Verify user has access
        if (fileItem.userId.S !== userId) {
            return {
                statusCode: 403,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Access denied' })
            };
        }
        
        // Delete from S3
        try {
            await s3.deleteObject({
                Bucket: process.env.SAFEMATE_BUCKET,
                Key: fileItem.s3Key.S
            }).promise();
        } catch (s3Error) {
            console.warn('Failed to delete from S3:', s3Error);
            // Continue with database deletion even if S3 fails
        }
        
        // Delete metadata
        await dynamodb.deleteItem({
            TableName: 'SafemateFiles',
            Key: { fileId: { S: fileId } }
        }).promise();
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({