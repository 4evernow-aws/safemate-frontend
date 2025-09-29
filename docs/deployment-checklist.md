# SafeMate Deployment Checklist

## Environment Configuration Differences

### Frontend Environment Variables
- [ ] **API Endpoints**: Ensure all API URLs point to AWS endpoints
- [ ] **Cognito Configuration**: Verify user pool and client IDs match AWS
- [ ] **Demo Mode**: Set to `false` for production
- [ ] **App URL**: Set to CloudFront URL for production

### AWS Infrastructure Requirements

#### API Gateway CORS Configuration
- [ ] **Hedera API** (`yvzwg6rvp3`): CORS headers for all methods
- [ ] **Vault API** (`19k64fbdcg`): CORS headers for all methods  
- [ ] **Wallet API** (`mit7zoku5g`): CORS headers for all methods
- [ ] **Group API** (`8641yebpjg`): CORS headers for all methods
- [ ] **Onboarding API** (`nh9d5m1g4m`): CORS headers for all methods

#### Lambda Environment Variables
- [ ] **User Onboarding Lambda**: All required environment variables set
- [ ] **Hedera Service Lambda**: Network and KMS configurations
- [ ] **All Lambdas**: Correct Cognito user pool ID

#### Cognito Configuration
- [ ] **User Pool Client**: OAuth redirect URLs include CloudFront
- [ ] **Lambda Permissions**: Post-confirmation triggers have correct permissions

## Pre-Deployment Checklist

### Code Changes
- [ ] All merge conflicts resolved
- [ ] TypeScript errors fixed
- [ ] Build passes locally (`npm run build`)
- [ ] No console.log statements in production code

### Environment Files
- [ ] `.env` file updated with AWS endpoints
- [ ] `VITE_DEMO_MODE=false`
- [ ] `VITE_APP_URL=https://d19a5c2wn4mtdt.cloudfront.net`
- [ ] All API URLs point to correct AWS endpoints

### AWS Infrastructure
- [ ] API Gateway CORS configured for all endpoints
- [ ] Lambda functions have correct environment variables
- [ ] Cognito user pool client configured correctly
- [ ] S3 bucket permissions set correctly
- [ ] CloudFront distribution configured

## Deployment Steps

### 1. Frontend Deployment
```bash
# Build and deploy frontend
.\deploy-static.ps1
```

### 2. API Gateway CORS Check
```bash
# Check CORS for all APIs
.\check-cors-all.ps1
```

### 3. Lambda Environment Variables
```bash
# Update Lambda environment variables if needed
aws lambda update-function-configuration --function-name default-safemate-user-onboarding --environment Variables='{HEDERA_NETWORK=testnet,COGNITO_USER_POOL_ID=ap-southeast-2_uLgMRpWlw}'
```

### 4. Cognito Configuration
```bash
# Update OAuth redirect URLs
aws cognito-idp update-user-pool-client --user-pool-id ap-southeast-2_uLgMRpWlw --client-id 2fg1ckjn1hga2t07lnujpk488a --callback-urls https://d19a5c2wn4mtdt.cloudfront.net http://localhost:5173
```

## Post-Deployment Verification

### Frontend
- [ ] Site loads at CloudFront URL
- [ ] Authentication works (sign up/sign in)
- [ ] Wallet creation works
- [ ] File upload works
- [ ] Folder creation works
- [ ] Gallery displays content correctly

### Backend APIs
- [ ] No CORS errors in browser console
- [ ] All API calls return expected responses
- [ ] File uploads complete successfully
- [ ] Folder operations work correctly

## Common Issues and Solutions

### CORS Errors
**Problem**: `Access-Control-Allow-Origin` header has value `null`
**Solution**: Update API Gateway method response parameters to allow CORS headers

### Authentication Errors
**Problem**: Cognito client configuration mismatch
**Solution**: Verify user pool ID and client ID match between frontend and backend

### File Upload Failures
**Problem**: "Payload Too Large" errors
**Solution**: Check file size limits in environment variables and API Gateway settings

### Lambda Errors
**Problem**: Missing environment variables
**Solution**: Update Lambda function configuration with required environment variables

## Environment-Specific Configurations

### Local Development
- `VITE_DEMO_MODE=true` (optional)
- API URLs: `http://localhost:5173`
- Cognito domain: `safemate-dev`
- File size limits: 10MB

### AWS Production
- `VITE_DEMO_MODE=false`
- API URLs: AWS API Gateway endpoints
- Cognito domain: `safemate-dev`
- File size limits: 10MB
- CloudFront URL: `https://d19a5c2wn4mtdt.cloudfront.net`

## Automated Deployment Scripts

### `deploy-all.ps1`
- Builds frontend
- Deploys to S3
- Invalidates CloudFront cache
- Checks CORS configuration
- Verifies deployment

### `check-cors-all.ps1`
- Checks CORS configuration for all API Gateways
- Reports any misconfigurations
- Provides fix commands

### `update-lambda-env.ps1`
- Updates Lambda environment variables
- Ensures consistency across all functions
- Validates configurations
