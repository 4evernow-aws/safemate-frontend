# SafeMate Preprod Deployment Guide - Updated

**Last Updated:** September 24, 2025  
**Environment:** Preprod  
**Status:** ✅ Production Ready

## 🎯 Overview

This guide covers the complete deployment process for SafeMate in the preprod environment, including all recent fixes and optimizations.

## 📋 Prerequisites

### Required Tools
- AWS CLI v2.x
- Terraform v1.5+
- Node.js v18.x
- npm v9.x
- Git

### AWS Permissions
- AdministratorAccess (for initial setup)
- IAM, Lambda, API Gateway, DynamoDB, S3, CloudFront, Cognito, KMS

## 🏗️ Infrastructure Deployment

### 1. Clone and Setup
```bash
# Clone infrastructure repository
git clone https://github.com/4evernow-aws/safemate-infrastructure.git
cd safemate-infrastructure

# Checkout preprod branch
git checkout preprod

# Initialize Terraform
terraform init
```

### 2. Configure AWS CLI
```bash
# Configure AWS CLI for preprod
aws configure
# Enter your AWS credentials for account 994220462693
# Region: ap-southeast-2
```

### 3. Deploy Infrastructure
```bash
# Plan deployment
terraform plan

# Apply infrastructure
terraform apply -auto-approve
```

### 4. Verify Infrastructure
```bash
# Check Lambda functions
aws lambda list-functions --query 'Functions[?contains(FunctionName, `preprod-safemate`)].FunctionName'

# Check API Gateway
aws apigateway get-rest-apis --query 'items[?contains(name, `preprod`)].{Name:name,Id:id}'

# Check DynamoDB tables
aws dynamodb list-tables --query 'TableNames[?contains(@, `preprod-safemate`)]'
```

## 🔧 Lambda Function Deployment

### 1. User Onboarding Service
```bash
# Navigate to service directory
cd services/user-onboarding

# Install dependencies
npm install

# Create deployment package
zip -r user-onboarding.zip .

# Upload to S3
aws s3 cp user-onboarding.zip s3://preprod-safemate-static-hosting/lambda-packages/

# Update Lambda function
aws lambda update-function-code \
  --function-name preprod-safemate-user-onboarding \
  --s3-bucket preprod-safemate-static-hosting \
  --s3-key lambda-packages/user-onboarding.zip
```

### 2. Hedera Service
```bash
# Navigate to service directory
cd services/hedera-service

# Install dependencies (including Hedera SDK)
npm install

# Create deployment package with SDK
zip -r hedera-service-with-sdk.zip .

# Upload to S3
aws s3 cp hedera-service-with-sdk.zip s3://preprod-safemate-static-hosting/lambda-packages/

# Update Lambda function
aws lambda update-function-code \
  --function-name preprod-safemate-hedera-service \
  --s3-bucket preprod-safemate-static-hosting \
  --s3-key lambda-packages/hedera-service-with-sdk.zip
```

### 3. Post Confirmation Service
```bash
# Navigate to service directory
cd services/post-confirmation-wallet-creator

# Install dependencies
npm install

# Create deployment package
zip -r post-confirmation-wallet-creator-final.zip .

# Upload to S3
aws s3 cp post-confirmation-wallet-creator-final.zip s3://preprod-safemate-static-hosting/lambda-packages/

# Update Lambda function
aws lambda update-function-code \
  --function-name preprod-safemate-post-confirmation-wallet-creator \
  --s3-bucket preprod-safemate-static-hosting \
  --s3-key lambda-packages/post-confirmation-wallet-creator-final.zip
```

## 🌐 Frontend Deployment

### 1. Clone and Setup
```bash
# Clone frontend repository
git clone https://github.com/4evernow-aws/safemate-frontend.git
cd safemate-frontend

# Checkout preprod branch
git checkout preprod

# Install dependencies
npm install
```

### 2. Environment Configuration
```bash
# Verify .env.preprod file exists
cat .env.preprod

# Should contain:
# VITE_APP_URL=https://d2xl0r3mv20sy5.cloudfront.net
# VITE_API_BASE_URL=https://ylpabkmc68.execute-api.ap-southeast-2.amazonaws.com/preprod
# VITE_HEDERA_API_URL=https://uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com/preprod
```

### 3. Build and Deploy
```bash
# Build for preprod
npm run build

# Deploy to S3
aws s3 sync dist/ s3://preprod-safemate-static-hosting/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id E2AHA6GLI806XF \
  --paths "/*"
```

## 🔐 Security Configuration

### 1. Cognito User Pool
```bash
# Check user pool configuration
aws cognito-idp describe-user-pool \
  --user-pool-id ap-southeast-2_a2rtp64JW

# Verify custom attributes
aws cognito-idp describe-user-pool \
  --user-pool-id ap-southeast-2_a2rtp64JW \
  --query 'UserPool.Schema[?Name==`custom:account_type`]'
```

### 2. KMS Encryption
```bash
# Check KMS key status
aws kms describe-key --key-id alias/preprod-safemate-hedera-keys

# Verify key policy
aws kms get-key-policy \
  --key-id alias/preprod-safemate-hedera-keys \
  --policy-name default
```

### 3. IAM Permissions
```bash
# Check Lambda execution roles
aws iam get-role --role-name preprod-safemate-hedera-lambda-exec

# Verify policies attached
aws iam list-attached-role-policies \
  --role-name preprod-safemate-hedera-lambda-exec
```

## 🧪 Testing and Verification

### 1. API Endpoint Testing
```bash
# Test onboarding status (requires valid token)
curl -X GET "https://ylpabkmc68.execute-api.ap-southeast-2.amazonaws.com/preprod/onboarding/status" \
  -H "Authorization: Bearer <cognito-token>"

# Test Hedera folders
curl -X GET "https://uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com/preprod/folders" \
  -H "Authorization: Bearer <cognito-token>"
```

### 2. Frontend Testing
```bash
# Open application
open https://d2xl0r3mv20sy5.cloudfront.net

# Test user registration
# Test email verification
# Test wallet creation
# Test dashboard functionality
```

### 3. Database Verification
```bash
# Check user data
aws dynamodb scan --table-name preprod-safemate-users --limit 5

# Check operator credentials
aws dynamodb get-item \
  --table-name preprod-safemate-hedera-operator \
  --key '{"accountId": {"S": "0.0.6428427"}}'

# Check folders data
aws dynamodb scan --table-name preprod-safemate-hedera-folders --limit 5
```

## 📊 Monitoring Setup

### 1. CloudWatch Alarms
```bash
# Create Lambda error alarm
aws cloudwatch put-metric-alarm \
  --alarm-name "preprod-safemate-lambda-errors" \
  --alarm-description "Lambda function errors" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 1 \
  --comparison-operator GreaterThanOrEqualToThreshold \
  --dimensions Name=FunctionName,Value=preprod-safemate-hedera-service
```

### 2. API Gateway Monitoring
```bash
# Enable detailed monitoring
aws apigateway update-stage \
  --rest-api-id <api-id> \
  --stage-name preprod \
  --patch-ops op=replace,path=/tracingEnabled,value=true
```

## 🔄 Update Procedures

### 1. Infrastructure Updates
```bash
# Pull latest changes
git pull origin preprod

# Plan changes
terraform plan

# Apply changes
terraform apply -auto-approve
```

### 2. Lambda Function Updates
```bash
# Update specific service
cd services/<service-name>
npm install
zip -r <service-name>.zip .
aws s3 cp <service-name>.zip s3://preprod-safemate-static-hosting/lambda-packages/
aws lambda update-function-code \
  --function-name preprod-safemate-<service-name> \
  --s3-bucket preprod-safemate-static-hosting \
  --s3-key lambda-packages/<service-name>.zip
```

### 3. Frontend Updates
```bash
# Pull latest changes
git pull origin preprod

# Build and deploy
npm run build
aws s3 sync dist/ s3://preprod-safemate-static-hosting/ --delete
aws cloudfront create-invalidation \
  --distribution-id E2AHA6GLI806XF \
  --paths "/*"
```

## 🚨 Rollback Procedures

### 1. Infrastructure Rollback
```bash
# Revert to previous Terraform state
terraform state list
terraform apply -target=<resource-name>

# Or revert entire state
git checkout <previous-commit>
terraform apply -auto-approve
```

### 2. Lambda Rollback
```bash
# List function versions
aws lambda list-versions-by-function \
  --function-name preprod-safemate-hedera-service

# Update to previous version
aws lambda update-alias \
  --function-name preprod-safemate-hedera-service \
  --name LIVE \
  --function-version <previous-version>
```

### 3. Frontend Rollback
```bash
# Revert to previous commit
git checkout <previous-commit>

# Build and deploy
npm run build
aws s3 sync dist/ s3://preprod-safemate-static-hosting/ --delete
aws cloudfront create-invalidation \
  --distribution-id E2AHA6GLI806XF \
  --paths "/*"
```

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Environment variables configured
- [ ] Dependencies updated
- [ ] Security scan completed

### Deployment
- [ ] Infrastructure deployed
- [ ] Lambda functions updated
- [ ] Frontend built and deployed
- [ ] CloudFront cache invalidated
- [ ] Database migrations applied

### Post-Deployment
- [ ] All endpoints tested
- [ ] User flows verified
- [ ] Performance metrics checked
- [ ] Error logs reviewed
- [ ] Monitoring alerts configured

## 📞 Support and Maintenance

### Regular Maintenance
- **Weekly:** Health checks and performance review
- **Monthly:** Security audit and dependency updates
- **Quarterly:** Full system review and optimization

### Emergency Contacts
- **AWS Support:** Business support case
- **Development Team:** On-call rotation
- **Infrastructure Team:** 24/7 monitoring

---

**Last Updated:** September 24, 2025  
**Next Review:** October 1, 2025  
**Status:** ✅ Production Ready
