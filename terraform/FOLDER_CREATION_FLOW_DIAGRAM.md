# SafeMate Hedera Folder Creation Flow Diagram

## 🔄 Complete Folder Creation Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Lambda        │
│   (React App)   │    │   (Hedera API)  │    │   (Hedera       │
│                 │    │                 │    │    Service)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1. Create Folder      │                       │
         │    Request            │                       │
         ├──────────────────────►│                       │
         │                       │                       │
         │ 2. Route to Lambda    │                       │
         │    Function           │                       │
         ├──────────────────────►│                       │
         │                       │                       │
         │ 3. Process Request    │                       │
         │◄──────────────────────┤                       │
         │                       │                       │
         │ 4. Folder Created     │                       │
         │    Response           │                       │
         │◄──────────────────────┤                       │
```

## 🏗️ Backend Processing Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User          │    │   DynamoDB      │    │   Hedera        │
│   Authentication│    │   (Wallet       │    │   Blockchain    │
│                 │    │    Metadata)    │    │   (Testnet)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1. Extract User ID    │                       │
         │    from JWT Token     │                       │
         ├──────────────────────►│                       │
         │                       │                       │
         │ 2. Get User Wallet    │                       │
         │    Information        │                       │
         ├──────────────────────►│                       │
         │                       │                       │
         │ 3. Initialize Hedera  │                       │
         │    Client             │                       │
         ├──────────────────────────────────────────────►│
         │                       │                       │
         │ 4. Create Folder      │                       │
         │    Token              │                       │
         ├──────────────────────────────────────────────►│
         │                       │                       │
         │ 5. Store Metadata     │                       │
         │    on Blockchain      │                       │
         ├──────────────────────────────────────────────►│
```

## 🌐 API Gateway Endpoints

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Folders       │    │   Files         │    │   CORS          │
│   Endpoints     │    │   Endpoints     │    │   Support       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ GET /folders          │ GET /files            │ OPTIONS /folders
         │ POST /folders         │ POST /files/upload    │ OPTIONS /files
         │ DELETE /folders/{id}  │ GET /files/{id}       │ OPTIONS /folders/{id}
         │ GET /folders/{id}     │ PUT /files/{id}       │ OPTIONS /files/{id}
         │                       │ DELETE /files/{id}    │
         │                       │                       │
         │ uvk4xxwjyg            │ uvk4xxwjyg            │ uvk4xxwjyg
         │ .execute-api          │ .execute-api          │ .execute-api
         │ .ap-southeast-2       │ .ap-southeast-2       │ .ap-southeast-2
         │ .amazonaws.com        │ .amazonaws.com        │ .amazonaws.com
         │ /preprod              │ /preprod              │ /preprod
```

## 🔐 Security Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Cognito       │    │   JWT Token     │    │   API Gateway   │
│   User Pool     │    │   Validation    │    │   Authorization │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1. User Login         │                       │
         ├──────────────────────►│                       │
         │                       │                       │
         │ 2. Generate JWT       │                       │
         │◄──────────────────────┤                       │
         │                       │                       │
         │ 3. API Request        │                       │
         │    with JWT           │                       │
         ├──────────────────────────────────────────────►│
         │                       │                       │
         │ 4. Token Validated    │                       │
         │◄──────────────────────────────────────────────┤
```

## 🗄️ Database Schema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Hedera        │    │   Wallet        │    │   Wallet        │
│   Folders       │    │   Metadata      │    │   Keys          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ tokenId (PK)          │ userId (PK)           │ userId (PK)
         │ userId                │ hedera_account_id     │ encrypted_private_key
         │ folderName            │ public_key            │ key_id
         │ parentFolderId        │ created_at            │ created_at
         │ tokenType             │ status                │
         │ network               │                       │
         │ transactionId         │                       │
         │ createdAt             │                       │
         │ storageType           │                       │
         │ blockchainVerified    │                       │
         │                       │                       │
         │ preprod-safemate-     │ preprod-safemate-     │ preprod-safemate-
         │ hedera-folders        │ wallet-metadata       │ wallet-keys
```

## 🔄 Folder Creation Process

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Create        │    │   Sign          │    │   Execute       │
│   Token         │    │   Transaction   │    │   Transaction   │
│   Transaction   │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1. TokenCreate        │                       │
         │    Transaction        │                       │
         ├──────────────────────►│                       │
         │                       │                       │
         │ 2. Set Token          │                       │
         │    Properties         │                       │
         ├──────────────────────►│                       │
         │                       │                       │
         │ 3. Sign with User's   │                       │
         │    Private Key        │                       │
         ├──────────────────────►│                       │
         │                       │                       │
         │ 4. Execute on         │                       │
         │    Hedera Testnet     │                       │
         ├──────────────────────────────────────────────►│
         │                       │                       │
         │ 5. Get Transaction    │                       │
         │    Receipt            │                       │
         │◄──────────────────────────────────────────────┤
```

## 📊 Metadata Storage

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   NFT           │    │   DynamoDB      │    │   Blockchain    │
│   Metadata      │    │   Reference     │    │   Verification  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ Comprehensive         │ Minimal Reference     │ Immutable
         │ Folder Metadata       │                       │ Storage
         │                       │                       │
         │ - type: folder        │ - tokenId             │ - Token ID
         │ - name                │ - userId              │ - Transaction ID
         │ - userId              │ - folderName          │ - Metadata Hash
         │ - parentFolderId      │ - parentFolderId      │ - Ownership
         │ - createdAt           │ - tokenType           │ - Verification
         │ - path                │ - network             │
         │ - permissions         │ - transactionId       │
         │ - owner               │ - createdAt           │
         │ - network             │ - storageType         │
         │ - version             │ - blockchainVerified  │
         │ - blockchain          │                       │
         │   properties          │                       │
         │                       │                       │
         │ Stored in NFT         │ Stored in DynamoDB    │ Stored on
         │ Metadata              │ Table                 │ Hedera
         │                       │                       │ Blockchain
```

## 🌍 Hedera Network Integration

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User          │    │   Hedera        │    │   Folder        │
│   Account       │    │   Testnet       │    │   Token         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ 0.0.6879262           │ 4 Testnet Nodes       │ 0.0.1234567
         │ 200.1 HBAR            │                       │ NON_FUNGIBLE_UNIQUE
         │                       │                       │
         │ 1. Initialize         │                       │
         │    Client             │                       │
         ├──────────────────────►│                       │
         │                       │                       │
         │ 2. Create Folder      │                       │
         │    Token              │                       │
         ├──────────────────────►│                       │
         │                       │                       │
         │ 3. Token Created      │                       │
         │◄──────────────────────┤                       │
         │                       │                       │
         │ 4. Store Metadata     │                       │
         │    in NFT             │                       │
         ├──────────────────────►│                       │
         │                       │                       │
         │ 5. Metadata Stored    │                       │
         │◄──────────────────────┤                       │
```

## 📊 Current Status

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   ✅ Frontend   │    │   ✅ Backend    │    │   ✅ Blockchain │
│   Operational   │    │   Operational   │    │   Operational   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ CloudFront CDN        │ Lambda Functions      │ Hedera Testnet
         │ React Application     │ API Gateways          │ Real NFT Tokens
         │ HTTPS Enabled         │ DynamoDB Tables       │ Live Network
         │ CORS Configured       │ KMS Encryption        │ 99.9% Uptime
         │                       │                       │
         │ https://d2xl0r3mv20sy5│ uvk4xxwjyg            │ 0.0.6879262
         │ .cloudfront.net       │ .execute-api          │ 200.1 HBAR
         │                       │ .ap-southeast-2       │ Active
         │                       │ .amazonaws.com        │
         │                       │ /preprod              │
```

## 🔧 Technical Stack

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Infrastructure│
│   Technologies  │    │   Technologies  │    │   Technologies  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ React 18              │ Node.js 18.x          │ AWS Lambda
         │ TypeScript            │ @hashgraph/sdk        │ API Gateway
         │ AWS Amplify           │ AWS SDK v3            │ DynamoDB
         │ Material-UI           │ KMS Encryption        │ CloudWatch
         │                       │                       │
         │ Modern UI/UX          │ Blockchain Integration│ Serverless
         │ Responsive Design     │ Real-time Operations  │ Auto-scaling
         │ PWA Support           │ Secure Key Management │ High Availability
         │                       │                       │
         │ https://d2xl0r3mv20sy5│ preprod-safemate-     │ ap-southeast-2
         │ .cloudfront.net       │ hedera-service        │ (Sydney)
         │                       │                       │
```

---

*This diagram represents the complete flow of the SafeMate Hedera folder creation process as of September 22, 2025.*
