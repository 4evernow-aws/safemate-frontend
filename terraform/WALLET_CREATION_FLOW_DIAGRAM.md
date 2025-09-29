# SafeMate Hedera Wallet Creation Flow Diagram

## 🔄 Complete User Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Cognito       │    │   API Gateway   │
│   (React App)   │    │   (Auth)        │    │   (REST APIs)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1. User Registration  │                       │
         ├──────────────────────►│                       │
         │                       │                       │
         │ 2. Email Verification │                       │
         │◄──────────────────────┤                       │
         │                       │                       │
         │ 3. User Login         │                       │
         ├──────────────────────►│                       │
         │                       │                       │
         │ 4. JWT Tokens         │                       │
         │◄──────────────────────┤                       │
         │                       │                       │
         │ 5. Check Onboarding   │                       │
         ├──────────────────────────────────────────────►│
         │                       │                       │
         │ 6. Onboarding Status  │                       │
         │◄──────────────────────────────────────────────┤
         │                       │                       │
         │ 7. Start Wallet       │                       │
         │    Creation           │                       │
         ├──────────────────────────────────────────────►│
         │                       │                       │
         │ 8. Wallet Created     │                       │
         │◄──────────────────────────────────────────────┤
```

## 🏗️ Backend Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Lambda        │    │   DynamoDB      │    │   AWS KMS       │
│   Functions     │    │   Tables        │    │   Encryption    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1. User Onboarding    │                       │
         │    Service            │                       │
         ├──────────────────────►│                       │
         │                       │                       │
         │ 2. Wallet Manager     │                       │
         │    Service            │                       │
         ├──────────────────────►│                       │
         │                       │                       │
         │ 3. Hedera Service     │                       │
         │    Service            │                       │
         ├──────────────────────►│                       │
         │                       │                       │
         │ 4. Encrypt Keys       │                       │
         ├──────────────────────────────────────────────►│
         │                       │                       │
         │ 5. Store Metadata     │                       │
         ├──────────────────────►│                       │
```

## 🌐 API Gateway Endpoints

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Onboarding    │    │   Wallet        │    │   Hedera        │
│   API           │    │   API           │    │   API           │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ /onboarding/status    │ /wallet               │ /folders
         │ /onboarding/start     │ /wallet/create        │ /transactions
         │ /onboarding/retry     │                       │ /files
         │                       │                       │
         │ ylpabkmc68            │ ibgw4y7o4k            │ uvk4xxwjyg
         │ .execute-api          │ .execute-api          │ .execute-api
         │ .ap-southeast-2       │ .ap-southeast-2       │ .ap-southeast-2
         │ .amazonaws.com        │ .amazonaws.com        │ .amazonaws.com
         │ /preprod              │ /preprod              │ /preprod
```

## 🔐 Security Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User          │    │   Cognito       │    │   JWT Token     │
│   Authentication│    │   User Pool     │    │   Validation    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1. Email/Password     │                       │
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
│   Wallet        │    │   Wallet        │    │   User          │
│   Metadata      │    │   Keys          │    │   Secrets       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ userId (PK)           │ userId (PK)           │ userId (PK)
         │ accountId             │ encryptedPrivateKey   │ encryptedData
         │ publicKey             │ keyId                 │ keyId
         │ createdAt             │ createdAt             │ createdAt
         │ status                │                       │
         │                       │                       │
         │ preprod-safemate-     │ preprod-safemate-     │ preprod-safemate-
         │ wallet-metadata       │ wallet-keys           │ user-secrets
```

## 🔄 Wallet Creation Process

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Generate      │    │   Create        │    │   Store         │
│   Key Pair      │    │   Hedera        │    │   Encrypted     │
│                 │    │   Account       │    │   Keys          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1. Generate Private   │                       │
         │    & Public Keys      │                       │
         ├──────────────────────►│                       │
         │                       │                       │
         │ 2. Create Account     │                       │
         │    on Hedera          │                       │
         ├──────────────────────►│                       │
         │                       │                       │
         │ 3. Fund Account       │                       │
         │    from Operator      │                       │
         ├──────────────────────►│                       │
         │                       │                       │
         │ 4. Encrypt Private    │                       │
         │    Key with KMS       │                       │
         ├──────────────────────────────────────────────►│
         │                       │                       │
         │ 5. Store in           │                       │
         │    DynamoDB           │                       │
         ├──────────────────────►│                       │
```

## 🌍 Hedera Network Integration

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Operator      │    │   Hedera        │    │   User          │
│   Account       │    │   Testnet       │    │   Account       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ 0.0.6428427           │ 4 Testnet Nodes       │ 0.0.6879262
         │ 200.1 HBAR            │                       │ 200.1 HBAR
         │                       │                       │
         │ 1. Fund New Account   │                       │
         ├──────────────────────►│                       │
         │                       │                       │
         │ 2. Account Created    │                       │
         │◄──────────────────────┤                       │
         │                       │                       │
         │ 3. Transfer HBAR      │                       │
         ├──────────────────────►│                       │
         │                       │                       │
         │ 4. Account Funded     │                       │
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
         │ React Application     │ API Gateways          │ Real Accounts
         │ HTTPS Enabled         │ DynamoDB Tables       │ Live Network
         │ CORS Configured       │ KMS Encryption        │ 99.9% Uptime
         │                       │                       │
         │ https://d2xl0r3mv20sy5│ ylpabkmc68            │ 0.0.6879262
         │ .cloudfront.net       │ ibgw4y7o4k            │ 200.1 HBAR
         │                       │ uvk4xxwjyg            │ Active
         │                       │ o529nxt704            │
```

---

*This diagram represents the complete flow of the SafeMate Hedera wallet creation process as of September 22, 2025.*
