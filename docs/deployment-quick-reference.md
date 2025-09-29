# SafeMate Deployment Quick Reference

## 🚀 Quick Deployment Commands

### Full Deployment (Recommended)
```powershell
# Complete deployment with all checks
.\deploy-all.ps1
```

### Partial Deployments
```powershell
# Deploy frontend only
.\deploy-static.ps1

# Check CORS configuration
.\check-cors-all.ps1

# Fix CORS issues automatically
.\check-cors-all.ps1 -Fix

# Check Lambda environment variables
.\update-lambda-env.ps1

# Update Lambda environment variables
.\update-lambda-env.ps1 -Update
```

## 🔧 Common Issues and Solutions

### CORS Errors
**Symptoms**: `Access-Control-Allow-Origin` header has value `null`
**Solution**: 
```powershell
.\check-cors-all.ps1 -Fix
```

### Authentication Errors
**Symptoms**: Cognito client configuration mismatch
**Solution**: Check `.env` file has correct Cognito settings

### File Upload Failures
**Symptoms**: "Payload Too Large" errors
**Solution**: Verify `VITE_MAX_FILE_SIZE_HEDERA=10485760` in `.env`

### Lambda Errors
**Symptoms**: Missing environment variables
**Solution**: 
```powershell
.\update-lambda-env.ps1 -Update
```

## 📋 Pre-Deployment Checklist

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

## 🌐 Environment Configuration

### Local Development
```env
VITE_DEMO_MODE=true
VITE_APP_URL=http://localhost:5173
VITE_HEDERA_API_URL=http://localhost:3000
```

### AWS Production
```env
VITE_DEMO_MODE=false
VITE_APP_URL=https://d19a5c2wn4mtdt.cloudfront.net
VITE_HEDERA_API_URL=https://yvzwg6rvp3.execute-api.ap-southeast-2.amazonaws.com/default
```

## 🔍 Post-Deployment Verification

### Frontend Tests
- [ ] Site loads at CloudFront URL
- [ ] Authentication works (sign up/sign in)
- [ ] Wallet creation works
- [ ] File upload works
- [ ] Folder creation works
- [ ] Gallery displays content correctly

### Backend Tests
- [ ] No CORS errors in browser console
- [ ] All API calls return expected responses
- [ ] File uploads complete successfully
- [ ] Folder operations work correctly

## 📊 API Gateway IDs

| Service | API ID | Purpose |
|---------|--------|---------|
| Hedera | `yvzwg6rvp3` | File/folder operations |
| Vault | `19k64fbdcg` | Secret management |
| Wallet | `mit7zoku5g` | Wallet operations |
| Group | `8641yebpjg` | Group management |
| Onboarding | `nh9d5m1g4m` | User onboarding |

## 🔑 Critical Environment Variables

### Frontend (.env)
```env
VITE_COGNITO_USER_POOL_ID=ap-southeast-2_uLgMRpWlw
VITE_COGNITO_CLIENT_ID=2fg1ckjn1hga2t07lnujpk488a
VITE_COGNITO_DOMAIN=safemate-dev
VITE_DEMO_MODE=false
VITE_APP_URL=https://d19a5c2wn4mtdt.cloudfront.net
```

### Lambda Functions
```env
HEDERA_NETWORK=testnet
COGNITO_USER_POOL_ID=ap-southeast-2_uLgMRpWlw
APP_SECRETS_KMS_KEY_ID=0df54397-e4ad-4d29-a2b7-edc474aa01d4
WALLET_KMS_KEY_ID=0df54397-e4ad-4d29-a2b7-edc474aa01d4
```

## 🚨 Emergency Procedures

### Rollback Deployment
```powershell
# Revert to previous Git commit
git reset --hard HEAD~1
git push --force origin dev-build-main

# Redeploy
.\deploy-all.ps1
```

### Fix Critical CORS Issues
```powershell
# Emergency CORS fix
.\check-cors-all.ps1 -Fix
```

### Reset Lambda Environment
```powershell
# Reset all Lambda environment variables
.\update-lambda-env.ps1 -Update
```

## 📞 Troubleshooting

### Check Deployment Status
```powershell
# Test CloudFront URL
Invoke-WebRequest -Uri "https://d19a5c2wn4mtdt.cloudfront.net" -Method GET

# Check API Gateway status
aws apigateway get-rest-apis --query 'items[?contains(name, `safemate`)].{name:name,id:id,createdDate:createdDate}'
```

### View Logs
```powershell
# Check Lambda logs
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/default-safemate"

# Get recent Lambda errors
aws logs filter-log-events --log-group-name "/aws/lambda/default-safemate-user-onboarding" --filter-pattern "ERROR"
```

## 🎯 Best Practices

1. **Always test locally first** - Ensure everything works in local environment
2. **Use the deployment checklist** - Follow the checklist before each deployment
3. **Monitor logs** - Check CloudWatch logs for errors after deployment
4. **Test incrementally** - Test each feature after deployment
5. **Keep backups** - Maintain Git history for easy rollback
6. **Document changes** - Update this reference when making changes

## 📈 Performance Monitoring

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
