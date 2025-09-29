# SafeMate Wallet Authentication Flow - Complete Step-by-Step Process

**Date**: January 22, 2025  
**Environment**: Pre-production (Preprod)  
**Status**: 🔍 **COMPREHENSIVE ANALYSIS AND TESTING**

---

## 🎯 **Current Issue Analysis**

Based on the browser errors you provided:
- **HTTP 401 Unauthorized**: `{"message":"Unauthorized"}`
- **Cognito 400 Bad Request**: During email verification
- **Frontend Environment**: Correctly configured for preprod
- **API Endpoints**: All Regional API Gateways are configured

---

## 🔄 **Complete Wallet Authentication Flow**

### **Step 1: User Authentication (Frontend)**
1. **User visits**: `https://d2xl0r3mv20sy5.cloudfront.net/`
2. **Sign-in process**: User enters email and password
3. **Email verification**: Cognito sends verification code
4. **Token generation**: Cognito returns JWT tokens
   - **ID Token**: Contains user identity information
   - **Access Token**: Contains authorization information
5. **Token storage**: Frontend stores tokens in localStorage

### **Step 2: API Gateway Authentication (Backend)**
1. **Frontend makes request**: `GET /onboarding/status`
2. **Authorization header**: `Bearer <ID_TOKEN>`
3. **API Gateway receives**: Request with Authorization header
4. **Cognito Authorizer**: Validates token against User Pool
5. **Token validation**: Checks signature, expiry, audience
6. **User claims extraction**: Extracts user information from token

### **Step 3: Lambda Function Processing**
1. **Lambda receives**: Request with user claims
2. **User ID extraction**: From `event.requestContext.authorizer.claims.sub`
3. **DynamoDB query**: Check for existing wallet
4. **Response generation**: Return wallet status

### **Step 4: Data Flow (DynamoDB)**
1. **Table**: `preprod-safemate-wallet-metadata`
2. **Key**: `userId` (Cognito user ID)
3. **Query**: Check if user has existing wallet
4. **Response**: Wallet metadata or null

---

## 🔍 **Step-by-Step Testing Process**

### **Test 1: API Gateway Endpoint Availability**
```bash
# Test without authentication (should return 401)
curl -I https://ylpabkmc68.execute-api.ap-southeast-2.amazonaws.com/preprod/onboarding/status

# Expected: HTTP 401 Unauthorized
# This confirms the endpoint exists and requires authentication
```

### **Test 2: CORS Preflight Request**
```bash
# Test CORS preflight
curl -X OPTIONS \
  -H "Origin: https://d2xl0r3mv20sy5.cloudfront.net" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Authorization,Content-Type" \
  https://ylpabkmc68.execute-api.ap-southeast-2.amazonaws.com/preprod/onboarding/status

# Expected: HTTP 200 with CORS headers
```

### **Test 3: Authentication with Real Token**
```bash
# Get token from browser console (after sign-in)
# Test with ID token
curl -H "Authorization: Bearer YOUR_ID_TOKEN" \
  -H "Content-Type: application/json" \
  https://ylpabkmc68.execute-api.ap-southeast-2.amazonaws.com/preprod/onboarding/status

# Expected: HTTP 200 with wallet data or HTTP 200 with no wallet
```

---

## 🛠️ **Current Configuration Analysis**

### **API Gateway Configuration**
- **Onboarding API**: `ylpabkmc68` ✅
- **Hedera API**: `uvk4xxwjyg` ✅
- **Wallet API**: `ibgw4y7o4k` ✅
- **Cognito Authorizers**: All configured ✅

### **Cognito Configuration**
- **User Pool ID**: `ap-southeast-2_a2rtp64JW` ✅
- **Client ID**: `4uccg6ujupphhovt1utv3i67a7` ✅
- **Region**: `ap-southeast-2` ✅

### **Frontend Configuration**
- **Environment**: Preprod ✅
- **API URLs**: All Regional endpoints ✅
- **Demo Mode**: Disabled ✅

---

## 🔧 **Debugging Steps**

### **Step 1: Check Token Format**
```javascript
// In browser console after sign-in
const idToken = await TokenService.getValidIdToken();
console.log('ID Token:', idToken);

// Decode token payload
const payload = JSON.parse(atob(idToken.split('.')[1]));
console.log('Token payload:', payload);
console.log('Token expiry:', new Date(payload.exp * 1000));
console.log('Is expired:', Date.now() > payload.exp * 1000);
```

### **Step 2: Test API Call with Debugging**
```javascript
// In browser console
SecureWalletService.debugWalletAuthentication();
```

### **Step 3: Check API Gateway Deployment**
```bash
# Check if API Gateway is properly deployed
aws apigateway get-stages --rest-api-id ylpabkmc68
```

### **Step 4: Check Lambda Function Logs**
```bash
# Check CloudWatch logs for Lambda function
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/preprod-safemate-user-onboarding"
```

---

## 🚨 **Common Issues and Solutions**

### **Issue 1: HTTP 401 Unauthorized**
**Possible Causes:**
1. **Token Format**: Missing "Bearer " prefix
2. **Token Expiry**: Token has expired
3. **Wrong Token Type**: Using Access token instead of ID token
4. **API Gateway Authorizer**: Not properly configured
5. **CORS Issues**: Preflight request failing

**Solutions:**
1. Ensure token format: `Authorization: Bearer <token>`
2. Check token expiry and refresh if needed
3. Use ID token for Cognito User Pools
4. Verify API Gateway authorizer configuration
5. Check CORS configuration

### **Issue 2: Cognito 400 Bad Request**
**Possible Causes:**
1. **User Already Confirmed**: Trying to confirm already confirmed user
2. **Invalid Code**: Verification code is incorrect or expired
3. **User Pool Configuration**: Auto-verified attributes issue

**Solutions:**
1. Handle already confirmed users gracefully
2. Implement proper error handling for expired codes
3. Check Cognito User Pool configuration

### **Issue 3: API Gateway Not Responding**
**Possible Causes:**
1. **Deployment Issue**: API Gateway not properly deployed
2. **Resource Configuration**: Missing resources or methods
3. **Lambda Permissions**: API Gateway can't invoke Lambda

**Solutions:**
1. Redeploy API Gateway with proper triggers
2. Verify all resources and methods are configured
3. Check Lambda permissions for API Gateway

---

## 📋 **Testing Checklist**

### **Frontend Testing**
- [ ] User can sign in successfully
- [ ] Tokens are retrieved and stored
- [ ] Token format is correct (Bearer prefix)
- [ ] Token is not expired
- [ ] Using ID token (not Access token)

### **API Gateway Testing**
- [ ] Endpoints respond to OPTIONS requests (CORS)
- [ ] Endpoints return 401 without authentication
- [ ] Endpoints return 200 with valid authentication
- [ ] CORS headers are properly configured
- [ ] Authorizer is properly configured

### **Lambda Testing**
- [ ] Lambda receives user claims
- [ ] Lambda can query DynamoDB
- [ ] Lambda returns proper response format
- [ ] Error handling works correctly

### **DynamoDB Testing**
- [ ] Tables exist and are accessible
- [ ] User data can be queried
- [ ] Wallet metadata is properly stored
- [ ] KMS encryption/decryption works

---

## 🎯 **Next Steps**

1. **Run the comprehensive test script**: `comprehensive-wallet-auth-test.ps1`
2. **Test with real authentication tokens** from browser console
3. **Check API Gateway deployment status** using AWS CLI
4. **Verify Lambda function logs** in CloudWatch
5. **Test each step of the authentication flow** systematically

---

## 🔧 **Quick Fix Commands**

### **Force API Gateway Redeployment**
```bash
# Update deployment triggers in lambda.tf
# Change the trigger string to force redeployment
terraform apply -target=aws_api_gateway_deployment.onboarding_deployment
```

### **Check Current Deployment Status**
```bash
# Check API Gateway stages
aws apigateway get-stages --rest-api-id ylpabkmc68

# Check specific endpoint
aws apigateway get-method --rest-api-id ylpabkmc68 --resource-id <resource-id> --http-method GET
```

### **Test Authentication Flow**
```bash
# Run the comprehensive test script
./comprehensive-wallet-auth-test.ps1
```

---

**This document provides a complete roadmap for debugging and fixing the wallet authentication issues. Follow the steps systematically to identify and resolve the root cause of the HTTP 401 errors.**
