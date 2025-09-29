# SafeMate CORS Preflight Issue - Deep Analysis

**Date**: January 22, 2025  
**Environment**: Pre-production (Preprod)  
**Status**: 🔍 **INVESTIGATING CORS PREFLIGHT FAILURE**

---

## 🎯 **Issue Summary**

Despite multiple attempts to fix the CORS preflight issue, the browser is still reporting:

```
Access to fetch at 'https://ylpabkmc68.execute-api.ap-southeast-2.amazonaws.com/preprod/onboarding/status' from origin 'https://d2xl0r3mv20sy5.cloudfront.net' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

---

## 🔍 **Root Cause Analysis**

### **Possible Causes:**

1. **API Gateway Deployment Issue**: The deployment might not be properly updated
2. **CORS Configuration Missing**: The OPTIONS method might not be properly configured
3. **Integration Response Issue**: The CORS headers might not be properly set in the integration response
4. **CloudFront Cache**: The old API Gateway configuration might be cached
5. **Browser Cache**: The browser might be caching the old CORS configuration

---

## 🛠️ **Actions Taken**

### **1. API Gateway Deployment Updates**
- ✅ Updated deployment trigger from `"cors-preflight-fix-20250122-v1"` to `"cors-preflight-fix-20250122-v2"`
- ✅ Applied changes to both onboarding and hedera API deployments
- ✅ Forced redeployment of API Gateway

### **2. Frontend Rebuild**
- ✅ Rebuilt frontend with `npm run build`
- ✅ Deployed new files to S3
- ✅ Invalidated CloudFront cache

### **3. CORS Configuration Verification**
- ✅ OPTIONS method configured with `authorizationType: "NONE"`
- ✅ Integration type set to `MOCK`
- ✅ Integration response includes CORS headers:
  - `Access-Control-Allow-Origin: https://d2xl0r3mv20sy5.cloudfront.net`
  - `Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS`
  - `Access-Control-Allow-Headers: Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-cognito-token`
  - `Access-Control-Allow-Credentials: true`

---

## 🚨 **Current Status**

### **The Problem Persists**
Despite all the fixes applied, the CORS preflight request is still failing. This suggests a deeper issue with the API Gateway configuration.

### **Possible Solutions**

#### **Option 1: Manual API Gateway CORS Configuration**
The issue might be that the CORS configuration needs to be set at the API Gateway level, not just at the method level.

#### **Option 2: CloudFront Cache Issue**
The CloudFront distribution might be caching the old API Gateway responses.

#### **Option 3: Browser Cache Issue**
The browser might be caching the old CORS configuration.

---

## 🔧 **Next Steps**

### **Immediate Actions Required:**

1. **Check API Gateway CORS Configuration**:
   ```bash
   aws apigateway get-cors --rest-api-id ylpabkmc68
   ```

2. **Set API Gateway CORS Configuration**:
   ```bash
   aws apigateway put-cors --rest-api-id ylpabkmc68 --cors-configuration '{
     "allowOrigins": ["https://d2xl0r3mv20sy5.cloudfront.net"],
     "allowMethods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     "allowHeaders": ["Content-Type", "X-Amz-Date", "Authorization", "X-Api-Key", "X-Amz-Security-Token", "x-cognito-token"],
     "allowCredentials": true
   }'
   ```

3. **Redeploy API Gateway**:
   ```bash
   aws apigateway create-deployment --rest-api-id ylpabkmc68 --stage-name preprod
   ```

4. **Test CORS Preflight**:
   ```bash
   curl -X OPTIONS -H "Origin: https://d2xl0r3mv20sy5.cloudfront.net" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Authorization,Content-Type" \
     https://ylpabkmc68.execute-api.ap-southeast-2.amazonaws.com/preprod/onboarding/status
   ```

---

## 📊 **Technical Details**

### **API Gateway Configuration**
- **API ID**: `ylpabkmc68`
- **Stage**: `preprod`
- **Resource ID**: `ittf3f` (onboarding/status)
- **Method**: `OPTIONS`

### **Expected CORS Headers**
```
Access-Control-Allow-Origin: https://d2xl0r3mv20sy5.cloudfront.net
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS
Access-Control-Allow-Headers: Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-cognito-token
Access-Control-Allow-Credentials: true
```

### **Current Issue**
The OPTIONS preflight request is not returning these headers, causing the browser to block the actual request.

---

## 🎯 **Recommended Solution**

The most likely solution is to configure CORS at the API Gateway level using the AWS CLI:

```bash
# Set CORS configuration
aws apigateway put-cors --rest-api-id ylpabkmc68 --cors-configuration '{
  "allowOrigins": ["https://d2xl0r3mv20sy5.cloudfront.net"],
  "allowMethods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  "allowHeaders": ["Content-Type", "X-Amz-Date", "Authorization", "X-Api-Key", "X-Amz-Security-Token", "x-cognito-token"],
  "allowCredentials": true
}'

# Redeploy API Gateway
aws apigateway create-deployment --rest-api-id ylpabkmc68 --stage-name preprod
```

This will ensure that CORS is properly configured at the API Gateway level, not just at the method level.

---

**The CORS preflight issue requires a different approach - configuring CORS at the API Gateway level rather than just at the method level.**
