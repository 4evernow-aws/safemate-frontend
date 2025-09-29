# SafeMate API Gateway Cleanup - Complete Action Plan

**Date**: September 22, 2025  
**Environment**: Pre-production (Preprod)  
**Status**: Ready for Execution

---

## 🎯 **Objective**

Clean up duplicate API Gateways and ensure all services are using the correct Regional endpoints.

---

## 📊 **Current Situation**

### **Duplicate API Gateways Found:**
Each service has **2 API Gateways**:

| Service | Edge-optimized (OLD) | Regional (CURRENT) | Status |
|---------|---------------------|-------------------|---------|
| **Hedera API** | `2kwe2ly8vh` (27/08/2025) | `uvk4xxwjyg` (21/09/2025) | ✅ Using Regional |
| **Group API** | `3r08ehzgk1` (27/08/2025) | `o529nxt704` (21/09/2025) | ✅ Using Regional |
| **Onboarding API** | `ol212feqdl` (27/08/2025) | `ylpabkmc68` (21/09/2025) | ✅ Using Regional |
| **Vault API** | `fg85dzr0ag` (27/08/2025) | `peh5vc8yj3` (21/09/2025) | ✅ Using Regional |

### **Frontend Fixes Applied:**
- ✅ `hederaApiService.ts` - Fixed API endpoint
- ✅ `secureWalletService.ts` - Fixed API endpoint

---

## 🚀 **Execution Steps**

### **Step 1: Verify Current APIs** ⏱️ 5 minutes
```powershell
# Run verification script
.\verify-api-endpoints.ps1
```
**Expected Result**: All 4 Regional APIs should respond correctly

### **Step 2: Deploy Frontend Fixes** ⏱️ 10 minutes
```powershell
# Deploy frontend with corrected endpoints
.\deploy-frontend-fixes.ps1
```
**Expected Result**: Frontend deployed with correct API endpoints

### **Step 3: Test Functionality** ⏱️ 15 minutes
1. **Open Application**: https://d2xl0r3mv20sy5.cloudfront.net/
2. **Login**: Use existing test account
3. **Test Folder Creation**: 
   - Navigate to "My Files"
   - Click "Add New Folder"
   - Enter folder name
   - Click "Create"
   - Verify folder appears in list
4. **Check Browser Console**: No API errors
5. **Check CloudWatch Logs**: Successful API calls

### **Step 4: Clean Up Old APIs** ⏱️ 5 minutes
```powershell
# Remove duplicate Edge-optimized APIs
.\cleanup-duplicate-apis.ps1
```
**Expected Result**: Old APIs removed, only Regional APIs remain

### **Step 5: Final Verification** ⏱️ 5 minutes
1. **Re-run verification script**
2. **Test folder creation again**
3. **Verify no broken functionality**

---

## 📋 **Detailed Commands**

### **Verification Commands:**
```bash
# Test Hedera API
curl -X OPTIONS https://uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com/preprod

# Test Group API  
curl -X OPTIONS https://o529nxt704.execute-api.ap-southeast-2.amazonaws.com/preprod

# Test Onboarding API
curl -X OPTIONS https://ylpabkmc68.execute-api.ap-southeast-2.amazonaws.com/preprod

# Test Vault API
curl -X OPTIONS https://peh5vc8yj3.execute-api.ap-southeast-2.amazonaws.com/preprod
```

### **AWS CLI Commands for Cleanup:**
```bash
# Remove old Edge-optimized APIs
aws apigateway delete-rest-api --rest-api-id 2kwe2ly8vh
aws apigateway delete-rest-api --rest-api-id 3r08ehzgk1
aws apigateway delete-rest-api --rest-api-id ol212feqdl
aws apigateway delete-rest-api --rest-api-id fg85dzr0ag
```

---

## ✅ **Success Criteria**

### **After Step 2 (Frontend Deployment):**
- [ ] Frontend loads without errors
- [ ] Folder creation works
- [ ] No API endpoint errors in browser console
- [ ] CloudWatch logs show successful API calls

### **After Step 4 (API Cleanup):**
- [ ] Only 4 Regional APIs remain
- [ ] All functionality still works
- [ ] No broken references
- [ ] Clean AWS console

---

## 🚨 **Rollback Plan**

If issues occur after cleanup:

### **Immediate Rollback:**
1. **Stop**: Don't proceed with API deletion
2. **Investigate**: Check CloudWatch logs and browser console
3. **Fix**: Address any issues found
4. **Re-test**: Verify functionality before proceeding

### **If APIs Already Deleted:**
1. **Re-deploy**: Run `terraform apply` to recreate APIs
2. **Update Frontend**: Point back to recreated endpoints
3. **Test**: Verify all functionality works

---

## 📊 **Expected Results**

### **Before Cleanup:**
- 8 API Gateways (4 Edge-optimized + 4 Regional)
- Frontend using correct Regional endpoints
- All functionality working

### **After Cleanup:**
- 4 API Gateways (only Regional)
- Frontend using correct Regional endpoints  
- All functionality working
- Cleaner AWS console
- Reduced costs

---

## 🔍 **Monitoring**

### **CloudWatch Logs to Monitor:**
- `/aws/lambda/preprod-safemate-hedera-service`
- `/aws/lambda/preprod-safemate-group-manager`
- `/aws/lambda/preprod-safemate-user-onboarding`
- `/aws/lambda/preprod-safemate-token-vault`

### **Key Metrics:**
- API Gateway 4xx/5xx errors
- Lambda function errors
- Response times
- Success rates

---

## 📞 **Support Information**

### **Application URLs:**
- **Frontend**: https://d2xl0r3mv20sy5.cloudfront.net/
- **Hedera API**: https://uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com/preprod
- **Group API**: https://o529nxt704.execute-api.ap-southeast-2.amazonaws.com/preprod
- **Onboarding API**: https://ylpabkmc68.execute-api.ap-southeast-2.amazonaws.com/preprod
- **Vault API**: https://peh5vc8yj3.execute-api.ap-southeast-2.amazonaws.com/preprod

### **Test Account:**
- **Account ID**: `0.0.6879262`
- **Balance**: 200.1 HBAR
- **Network**: Hedera Testnet

---

## 🎉 **Summary**

This cleanup will:
1. ✅ **Fix folder creation issues** by using correct API endpoints
2. ✅ **Remove duplicate APIs** to clean up AWS console
3. ✅ **Reduce costs** by eliminating unused resources
4. ✅ **Improve maintainability** with single API per service
5. ✅ **Ensure consistency** across all services

The Regional APIs are newer, properly configured, and already being used by the application. This cleanup will simply remove the old, unused Edge-optimized APIs.

---

*This action plan provides a complete roadmap for cleaning up the SafeMate API Gateway duplication and ensuring all services work correctly.*
