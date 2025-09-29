# SafeMate Deployment Automation Guide

This guide covers the complete deployment automation system for SafeMate, including scripts, tools, and best practices for deploying from local development to AWS production.

## 🚀 Overview

SafeMate uses a comprehensive deployment automation system that handles:
- **Frontend Deployment**: React app build and S3/CloudFront deployment
- **CORS Configuration**: Automated CORS setup across all API Gateways
- **Lambda Environment Management**: Environment variable configuration
- **Infrastructure Validation**: Pre and post-deployment checks
- **Troubleshooting**: Automated issue detection and resolution

## 📋 Deployment Scripts

### Primary Deployment Scripts

#### `deploy-all.ps1` - Complete Deployment Automation
```powershell
# Full deployment with all checks
.\deploy-all.ps1

# Skip specific steps
.\deploy-all.ps1 -SkipBuild -SkipCorsCheck -SkipLambdaCheck
```

**Features:**
- Pre-deployment environment validation
- Frontend build and deployment
- CORS configuration verification
- Lambda environment variable checks
- CloudFront cache invalidation
- Post-deployment verification

#### `deploy-static.ps1` - Frontend Only Deployment
```powershell
# Deploy frontend to S3 and invalidate CloudFront
.\deploy-static.ps1
```

**Features:**
- React app build
- S3 deployment with sync
- CloudFront cache invalidation
- Build verification

### Infrastructure Management Scripts

#### `check-cors-all.ps1` - CORS Configuration Manager
```powershell
# Check CORS configuration across all APIs
.\check-cors-all.ps1

# Fix CORS issues automatically
.\check-cors-all.ps1 -Fix

# Verbose output
.\check-cors-all.ps1 -Verbose
```

**Features:**
- Checks all API Gateway CORS configurations
- Identifies localhost vs CloudFront origin issues
- Automatically fixes CORS misconfigurations
- Deploys API Gateway changes
- Provides detailed reporting

#### `update-lambda-env.ps1` - Lambda Environment Manager
```powershell
# Check Lambda environment variables
.\update-lambda-env.ps1

# Update Lambda environment variables
.\update-lambda-env.ps1 -Update

# Verify after updates
.\update-lambda-env.ps1 -Verify

# Verbose output
.\update-lambda-env.ps1 -Verbose
```

**Features:**
- Validates Lambda environment variables
- Updates missing or incorrect variables
- Supports all SafeMate Lambda functions
- Provides verification after updates

## 🔧 Configuration

### Environment Variables

#### Frontend (.env)
```env
# Production Configuration
VITE_DEMO_MODE=false
VITE_APP_URL=https://d19a5c2wn4mtdt.cloudfront.net
VITE_COGNITO_USER_POOL_ID=ap-southeast-2_uLgMRpWlw
VITE_COGNITO_CLIENT_ID=2fg1ckjn1hga2t07lnujpk488a
VITE_COGNITO_DOMAIN=safemate-dev

# API Endpoints
VITE_HEDERA_API_URL=https://yvzwg6rvp3.execute-api.ap-southeast-2.amazonaws.com/default
VITE_VAULT_API_URL=https://19k64fbdcg.execute-api.ap-southeast-2.amazonaws.com/default
VITE_WALLET_API_URL=https://mit7zoku5g.execute-api.ap-southeast-2.amazonaws.com/default
VITE_GROUP_API_URL=https://8641yebpjg.execute-api.ap-southeast-2.amazonaws.com/default
VITE_ONBOARDING_API_URL=https://nh9d5m1g4m.execute-api.ap-southeast-2.amazonaws.com/default

# File Size Limits
VITE_MAX_FILE_SIZE_HEDERA=10485760
VITE_IPFS_THRESHOLD=10485760
```

#### Lambda Environment Variables
```env
# User Onboarding Lambda
HEDERA_NETWORK=testnet
COGNITO_USER_POOL_ID=ap-southeast-2_uLgMRpWlw
APP_SECRETS_KMS_KEY_ID=0df54397-e4ad-4d29-a2b7-edc474aa01d4
WALLET_KMS_KEY_ID=0df54397-e4ad-4d29-a2b7-edc474aa01d4
WALLETS_TABLE=default-safemate-wallet-metadata
USER_SECRETS_TABLE=default-safemate-user-secrets
WALLET_KEYS_TABLE=default-safemate-wallet-keys

# Other Lambda Functions
HEDERA_NETWORK=testnet
COGNITO_USER_POOL_ID=ap-southeast-2_uLgMRpWlw
```

### AWS Resources

#### API Gateway IDs
| Service | API ID | Purpose |
|---------|--------|---------|
| Hedera | `yvzwg6rvp3` | File/folder operations |
| Vault | `19k64fbdcg` | Secret management |
| Wallet | `mit7zoku5g` | Wallet operations |
| Group | `8641yebpjg` | Group management |
| Onboarding | `nh9d5m1g4m` | User onboarding |

#### Lambda Functions
- `default-safemate-user-onboarding`
- `default-safemate-hedera-service`
- `default-safemate-vault-service`
- `default-safemate-wallet-service`
- `default-safemate-group-service`

#### Infrastructure
- **S3 Bucket**: `default-safemate-static-hosting`
- **CloudFront Distribution**: `E3U5WV0TJVXFOT`
- **Cognito User Pool**: `ap-southeast-2_uLgMRpWlw`
- **Cognito Client**: `2fg1ckjn1hga2t07lnujpk488a`

## 🚀 Deployment Workflow

### 1. Pre-Deployment Checklist
```powershell
# Run pre-deployment checks
.\deploy-all.ps1 -SkipBuild -SkipCorsCheck -SkipLambdaCheck
```

**Checks:**
- Environment file validation
- Required environment variables
- AWS CLI configuration
- Project structure validation

### 2. Full Deployment
```powershell
# Complete deployment
.\deploy-all.ps1
```

**Process:**
1. **Pre-deployment validation**
2. **Frontend build** (React app)
3. **S3 deployment** (static files)
4. **CloudFront invalidation**
5. **CORS configuration check**
6. **Lambda environment validation**
7. **Post-deployment verification**

### 3. Infrastructure Updates
```powershell
# Fix CORS issues
.\check-cors-all.ps1 -Fix

# Update Lambda environments
.\update-lambda-env.ps1 -Update
```

## 🔍 Troubleshooting

### Common Issues

#### CORS Errors
**Symptoms**: `Access-Control-Allow-Origin` header has value `null`
```powershell
# Fix CORS issues
.\check-cors-all.ps1 -Fix
```

#### Authentication Errors
**Symptoms**: Cognito client configuration mismatch
```powershell
# Check environment variables
Get-Content apps/web/safemate/.env | Select-String "COGNITO"
```

#### File Upload Failures
**Symptoms**: "Payload Too Large" errors
```powershell
# Verify file size limits
Get-Content apps/web/safemate/.env | Select-String "MAX_FILE_SIZE"
```

#### Lambda Errors
**Symptoms**: Missing environment variables
```powershell
# Update Lambda environments
.\update-lambda-env.ps1 -Update
```

### Debugging Commands

#### Check Deployment Status
```powershell
# Test CloudFront URL
Invoke-WebRequest -Uri "https://d19a5c2wn4mtdt.cloudfront.net" -Method GET

# Check API Gateway status
aws apigateway get-rest-apis --query 'items[?contains(name, `safemate`)].{name:name,id:id,createdDate:createdDate}'
```

#### View Logs
```powershell
# Check Lambda logs
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/default-safemate"

# Get recent Lambda errors
aws logs filter-log-events --log-group-name "/aws/lambda/default-safemate-user-onboarding" --filter-pattern "ERROR"
```

#### Validate CORS
```powershell
# Test CORS preflight
Invoke-WebRequest -Uri "https://yvzwg6rvp3.execute-api.ap-southeast-2.amazonaws.com/default/folders" -Method OPTIONS -Headers @{"Origin"="https://d19a5c2wn4mtdt.cloudfront.net"}
```

## 🎯 Best Practices

### Deployment Best Practices
1. **Always test locally first** - Ensure everything works in local environment
2. **Use the deployment checklist** - Follow the checklist before each deployment
3. **Monitor logs** - Check CloudWatch logs for errors after deployment
4. **Test incrementally** - Test each feature after deployment
5. **Keep backups** - Maintain Git history for easy rollback
6. **Document changes** - Update documentation when making changes

### Script Usage Best Practices
1. **Run with verbose output** when troubleshooting
2. **Use skip parameters** for partial deployments
3. **Verify after updates** using verification flags
4. **Check logs** after each deployment step
5. **Test functionality** after deployment completion

### Environment Management
1. **Keep environment files updated** with correct AWS endpoints
2. **Validate Lambda environments** regularly
3. **Monitor CORS configuration** for new endpoints
4. **Update documentation** when changing configurations

## 🚨 Emergency Procedures

### Rollback Deployment
```powershell
# Revert to previous Git commit
git reset --hard HEAD~1
git push --force origin dev-build-main

# Redeploy
.\deploy-all.ps1
```

### Emergency CORS Fix
```powershell
# Emergency CORS fix
.\check-cors-all.ps1 -Fix
```

### Reset Lambda Environment
```powershell
# Reset all Lambda environment variables
.\update-lambda-env.ps1 -Update
```

### Manual Infrastructure Check
```powershell
# Check all API Gateways
aws apigateway get-rest-apis --query 'items[?contains(name, `safemate`)].{name:name,id:id,createdDate:createdDate}'

# Check Lambda functions
aws lambda list-functions --query 'Functions[?contains(FunctionName, `safemate`)].{name:FunctionName,runtime:Runtime,lastModified:LastModified}'
```

## 📊 Monitoring & Alerts

### Key Metrics to Monitor
- API Gateway response times
- Lambda function duration
- CloudFront cache hit ratio
- S3 request counts
- Cognito authentication success rate

### Alerts to Set Up
- API Gateway 4xx/5xx errors
- Lambda function errors
- CloudFront 4xx/5xx errors
- High response times (>5 seconds)

### Performance Monitoring
```powershell
# Check API Gateway metrics
aws cloudwatch get-metric-statistics --namespace AWS/ApiGateway --metric-name Count --dimensions Name=ApiName,Value=default-safemate-hedera-api --start-time 2025-08-15T00:00:00Z --end-time 2025-08-15T23:59:59Z --period 3600 --statistics Sum

# Check Lambda metrics
aws cloudwatch get-metric-statistics --namespace AWS/Lambda --metric-name Duration --dimensions Name=FunctionName,Value=default-safemate-user-onboarding --start-time 2025-08-15T00:00:00Z --end-time 2025-08-15T23:59:59Z --period 3600 --statistics Average
```

## 📝 Script Maintenance

### Updating Scripts
When updating deployment scripts:
1. **Test changes locally** before committing
2. **Update documentation** to reflect changes
3. **Validate all parameters** and error handling
4. **Test with different scenarios** (skip flags, error conditions)
5. **Update version information** in script headers

### Adding New Scripts
When adding new deployment scripts:
1. **Follow naming conventions** (descriptive names with .ps1 extension)
2. **Include parameter validation** and error handling
3. **Add to documentation** and update this guide
4. **Test thoroughly** before committing
5. **Include usage examples** in script comments

---

*Last updated: August 2025*
*SafeMate Deployment Automation Guide v2.0*
