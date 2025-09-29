# SafeMate Preprod Troubleshooting Guide

**Last Updated:** September 24, 2025  
**Environment:** Preprod

## 🚨 Common Issues and Solutions

### 1. HTTP 502 Bad Gateway Errors

#### Symptoms
- API calls return "HTTP 502: Internal server error"
- Frontend shows generic error messages
- Lambda functions appear to be failing

#### Root Causes & Solutions

**A. Hedera SDK Import Error**
```
Error: Cannot find module '@hashgraph/sdk'
```
**Solution:**
1. Check Lambda function deployment package includes Hedera SDK
2. Verify Lambda layer is properly attached
3. Update Lambda function with complete dependencies

**B. Environment Variable Mismatch**
```
Error: dynamodb:Scan operation failed
```
**Solution:**
1. Verify environment variables in Lambda configuration
2. Check Terraform configuration matches Lambda code
3. Ensure DynamoDB table names are correct

**C. JavaScript Reference Error**
```
Error: Cannot read property of undefined
```
**Solution:**
1. Check Lambda function code for undefined variable references
2. Add proper error handling and logging
3. Verify all required environment variables are set

### 2. CORS Preflight Failures

#### Symptoms
- Browser console shows CORS policy errors
- OPTIONS requests return 403 Forbidden
- "Failed to fetch" errors in frontend

#### Solution
1. **Check API Gateway CORS Configuration:**
   ```bash
   aws apigateway get-gateway-responses --rest-api-id <api-id>
   ```

2. **Verify Gateway Response for MISSING_AUTHENTICATION_TOKEN:**
   - Should return 200 OK status
   - Should include proper CORS headers

3. **Update CORS Headers:**
   - Include `x-cognito-token` in allowed headers
   - Ensure all required methods are allowed

### 3. Email Verification Issues

#### Symptoms
- Users receive 400 Bad Request during verification
- "User cannot be confirmed" errors
- Email verification codes not working

#### Solution
1. **Check User Status:**
   - Verify user is not already confirmed
   - Handle already confirmed users gracefully

2. **Update Email Verification Logic:**
   ```typescript
   // Handle already confirmed users
   if (error.code === 'NotAuthorizedException' && 
       error.message.includes('already confirmed')) {
     return { message: 'User is already verified' };
   }
   ```

### 4. Wallet Creation Failures

#### Symptoms
- "PAYER_ACCOUNT_NOT_FOUND" errors
- Wallet creation process fails
- User stuck in onboarding

#### Solution
1. **Verify Operator Account:**
   ```bash
   aws dynamodb get-item --table-name preprod-safemate-hedera-operator \
     --key '{"accountId": {"S": "0.0.6428427"}}'
   ```

2. **Check Hedera Network Connection:**
   - Verify testnet connectivity
   - Ensure operator account has sufficient HBAR

3. **Update Lambda Environment:**
   - Verify all required environment variables
   - Check DynamoDB permissions

### 5. Frontend JavaScript Errors

#### Symptoms
- "TypeError: P.map is not a function"
- Dashboard fails to load
- User data loading errors

#### Solution
1. **Check API Response Structure:**
   ```typescript
   // Ensure proper array checking
   if (Array.isArray(foldersResult.data)) {
     foldersArray = foldersResult.data;
   }
   ```

2. **Add Type Safety:**
   - Implement proper type checking
   - Handle different response formats
   - Add fallback logic

## 🔍 Debugging Commands

### Check Lambda Function Status
```bash
# Get function configuration
aws lambda get-function --function-name preprod-safemate-hedera-service

# Check function logs
aws logs describe-log-groups --log-group-name-prefix /aws/lambda/preprod-safemate

# Get recent log events
aws logs filter-log-events --log-group-name /aws/lambda/preprod-safemate-hedera-service
```

### Test API Endpoints
```bash
# Test onboarding status
curl -X GET "https://ylpabkmc68.execute-api.ap-southeast-2.amazonaws.com/preprod/onboarding/status" \
  -H "Authorization: Bearer <token>"

# Test Hedera folders
curl -X GET "https://uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com/preprod/folders" \
  -H "Authorization: Bearer <token>"
```

### Check DynamoDB Tables
```bash
# List all tables
aws dynamodb list-tables

# Check table status
aws dynamodb describe-table --table-name preprod-safemate-users

# Get item from operator table
aws dynamodb get-item --table-name preprod-safemate-hedera-operator \
  --key '{"accountId": {"S": "0.0.6428427"}}'
```

### Verify CloudFront Distribution
```bash
# List distributions
aws cloudfront list-distributions

# Get distribution details
aws cloudfront get-distribution --id E2AHA6GLI806XF

# Create cache invalidation
aws cloudfront create-invalidation --distribution-id E2AHA6GLI806XF --paths "/*"
```

## 🛠️ Maintenance Procedures

### Weekly Health Checks
1. **API Endpoint Testing:**
   - Test all major endpoints
   - Verify response times
   - Check error rates

2. **Database Health:**
   - Check DynamoDB table status
   - Verify data consistency
   - Monitor read/write capacity

3. **Lambda Function Health:**
   - Check function metrics
   - Review error logs
   - Verify environment variables

### Monthly Maintenance
1. **Security Review:**
   - Check IAM permissions
   - Verify encryption settings
   - Review access logs

2. **Performance Optimization:**
   - Analyze response times
   - Optimize Lambda functions
   - Update dependencies

3. **Backup Verification:**
   - Test backup procedures
   - Verify data integrity
   - Update recovery plans

## 📞 Emergency Procedures

### System Down
1. **Immediate Response:**
   - Check CloudWatch alarms
   - Review recent deployments
   - Check AWS service status

2. **Recovery Steps:**
   - Rollback to last known good state
   - Restart affected services
   - Verify system functionality

3. **Communication:**
   - Notify stakeholders
   - Document incident
   - Post-mortem analysis

### Data Loss
1. **Assessment:**
   - Determine scope of loss
   - Check backup availability
   - Identify root cause

2. **Recovery:**
   - Restore from backups
   - Verify data integrity
   - Test system functionality

3. **Prevention:**
   - Update backup procedures
   - Implement monitoring
   - Review security measures

## 📋 Contact Information

### AWS Support
- **Account ID:** 994220462693
- **Region:** ap-southeast-2
- **Support Level:** Business

### Key Resources
- **CloudWatch:** Monitor system health
- **AWS Support:** Technical assistance
- **Documentation:** This guide and system docs

---

**Last Updated:** September 24, 2025  
**Next Review:** October 1, 2025
