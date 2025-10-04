# SafeMate v2 Comprehensive Testing Plan

## 🎯 **Testing Overview**
**Date**: Current Session  
**Status**: All Critical Issues Resolved - Ready for Testing  
**Environment**: PREPROD (preprod-safemate-* tables)  
**Lambda Version**: V47.13-FOLDER-COLLECTION-ERROR-HANDLING  

---

## 🧪 **Phase 1: New User Onboarding Testing**

### **Test 1: User Registration & Authentication**
**Objective**: Verify new user creation works without Cognito errors

**Steps**:
1. Navigate to SafeMate application
2. Create new user account with valid credentials
3. Verify no `TypeError: t.updateAttributes is not a function` errors
4. Confirm user profile is created successfully
5. Verify authentication tokens are generated correctly

**Expected Results**:
- ✅ User account created successfully
- ✅ No Cognito integration errors
- ✅ Authentication tokens generated
- ✅ User profile data populated

**Success Criteria**: New user can register and authenticate without errors

---

### **Test 2: Wallet Creation & Display**
**Objective**: Verify wallet details display correctly after creation

**Steps**:
1. Complete user onboarding process
2. Create new Hedera wallet
3. Verify Account ID displays correctly (not "N/A")
4. Verify Public Key displays correctly (not "N/A")
5. Check wallet balance and status

**Expected Results**:
- ✅ Account ID shows real Hedera account (e.g., 0.0.XXXXXXX)
- ✅ Public Key shows actual public key string
- ✅ Wallet balance displays correctly
- ✅ Wallet status shows as active

**Success Criteria**: All wallet details display properly, no "N/A" values

---

### **Test 3: Folder Creation & Listing**
**Objective**: Verify folders are created and appear in listing

**Steps**:
1. Create a new folder with test name
2. Verify folder appears in FolderTreeWidget
3. Check folder metadata (name, creation date, etc.)
4. Create multiple folders to test listing
5. Verify folder hierarchy display

**Expected Results**:
- ✅ Folders created successfully
- ✅ Folders appear in listing immediately
- ✅ Folder metadata displays correctly
- ✅ No empty folder list issues

**Success Criteria**: Created folders are visible and accessible

---

### **Test 4: Welcome Data Population**
**Objective**: Verify welcome to SafeMate data is populated correctly

**Steps**:
1. Complete user onboarding
2. Check welcome screen displays user data
3. Verify user profile information shows
4. Check wallet information in welcome screen
5. Test navigation from welcome screen

**Expected Results**:
- ✅ Welcome screen shows user name
- ✅ User profile data populated
- ✅ Wallet information displayed
- ✅ Navigation works correctly

**Success Criteria**: Welcome screen shows complete user information

---

## 🔍 **Phase 2: System Integration Testing**

### **Test 5: API Endpoint Verification**
**Objective**: Verify all API endpoints respond correctly

**Endpoints to Test**:
- `GET /preprod/health` - Health check
- `GET /preprod/folders` - Folder listing
- `POST /preprod/folders` - Folder creation
- `GET /preprod/folders/{id}` - Folder details

**Expected Results**:
- ✅ All endpoints respond with 200 status
- ✅ No 502 Bad Gateway errors
- ✅ No 403 Forbidden errors
- ✅ Proper JSON responses

---

### **Test 6: Error Handling Verification**
**Objective**: Verify enhanced error handling works correctly

**Steps**:
1. Test with invalid authentication
2. Test with malformed requests
3. Test with missing parameters
4. Verify error messages are user-friendly
5. Check error logging in CloudWatch

**Expected Results**:
- ✅ Graceful error handling
- ✅ User-friendly error messages
- ✅ Proper error logging
- ✅ No system crashes

---

## 📊 **Phase 3: Performance & Monitoring**

### **Test 7: CloudWatch Logs Monitoring**
**Objective**: Monitor system performance and errors

**Steps**:
1. Check CloudWatch logs for errors
2. Monitor Lambda function performance
3. Check DynamoDB table operations
4. Monitor API Gateway metrics
5. Verify no critical errors in logs

**Expected Results**:
- ✅ No critical errors in logs
- ✅ Lambda function performs within limits
- ✅ DynamoDB operations successful
- ✅ API Gateway metrics normal

---

### **Test 8: AWS Free Tier Monitoring**
**Objective**: Monitor AWS resource usage

**Steps**:
1. Check Lambda function invocations
2. Monitor DynamoDB read/write units
3. Check API Gateway request count
4. Monitor CloudWatch log storage
5. Verify within free tier limits

**Expected Results**:
- ✅ Within AWS Free Tier limits
- ✅ No unexpected resource usage
- ✅ Cost optimization working

---

## 🎯 **Success Criteria Summary**

### **Critical Success Criteria**:
- ✅ New user registration works without errors
- ✅ Wallet creation and display functions correctly
- ✅ Folder creation and listing works properly
- ✅ Welcome data population functions correctly
- ✅ All API endpoints respond correctly
- ✅ Error handling works gracefully
- ✅ No critical errors in CloudWatch logs

### **Performance Criteria**:
- ✅ Response times under 3 seconds
- ✅ No memory leaks or performance issues
- ✅ Within AWS Free Tier limits
- ✅ Proper error logging and monitoring

---

## 🚀 **Testing Execution Plan**

### **Immediate Testing (Next 30 minutes)**:
1. **New User Registration Test**
2. **Wallet Creation Test**
3. **Folder Creation Test**
4. **API Endpoint Verification**

### **Extended Testing (Next 2 hours)**:
1. **Multiple User Testing**
2. **Error Handling Verification**
3. **Performance Monitoring**
4. **CloudWatch Logs Analysis**

### **Long-term Testing (Next 24 hours)**:
1. **Stress Testing**
2. **Edge Case Testing**
3. **Production Readiness Assessment**

---

## 📋 **Testing Tools Available**

### **Browser Testing**:
- **URL**: https://d2xl0r3mv20sy5.cloudfront.net/testpage
- **Local Test**: `browser-test.html`
- **Folder Hierarchy Test**: `folder-hierarchy-browser-test.html`

### **API Testing**:
- **PowerShell Scripts**: `test-safemate-api.ps1`
- **Folder Creation**: `test-folder-creation.ps1`
- **HIP-1299 Compliance**: `test-hip-1299-compliance.ps1`

### **Monitoring Tools**:
- **AWS Console**: Lambda, DynamoDB, CloudWatch
- **API Gateway**: Request/response monitoring
- **CloudFront**: CDN performance monitoring

---

## 🎉 **Expected Final Results**

After successful testing, the SafeMate v2 application should demonstrate:

1. **Seamless User Experience**: New users can register, create wallets, and manage folders without errors
2. **Robust Error Handling**: System gracefully handles errors and provides user-friendly messages
3. **Performance Optimization**: Fast response times and efficient resource usage
4. **Production Readiness**: System ready for real-world deployment and usage

**The system is now ready for comprehensive testing with new users!** 🚀
