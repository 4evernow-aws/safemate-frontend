# SafeMate v2 Complete Deployment Guide

## 🎯 Overview
This guide provides step-by-step instructions for deploying the complete SafeMate v2 system with the new NFT folder configuration.

## 📋 Prerequisites

### **Required Software:**
- ✅ **AWS CLI** - For deploying Lambda functions and managing AWS resources
- ✅ **Node.js** (v16+) - For building frontend and Lambda dependencies
- ✅ **PowerShell** - For running deployment scripts
- ✅ **Git** - For version control

### **Required Access:**
- ✅ **AWS Account** with appropriate permissions
- ✅ **Hedera Testnet Account** (0.0.6890393)
- ✅ **SafeMate Frontend Access** for JWT token

## 🚀 Quick Deployment (Recommended)

### **Option 1: Complete Automated Deployment**
```powershell
# Get your JWT token from SafeMate frontend first
.\deploy\complete-deployment.ps1 -JwtToken "your_jwt_token_here"
```

### **Option 2: Step-by-Step Deployment**
Follow the individual steps below for more control.

## 📦 Step-by-Step Deployment

### **Step 1: Deploy Lambda Function**
```powershell
.\deploy\deploy-lambda.ps1
```
**What this does:**
- Installs Lambda dependencies
- Creates deployment package
- Updates Lambda function code
- Sets basic environment variables
- Tests deployment

### **Step 2: Create Collection Token**
```powershell
.\deploy\create-collection-token.ps1 -JwtToken "your_jwt_token_here"
```
**What this does:**
- Creates new NON_FUNGIBLE_UNIQUE collection token
- Saves token information to `collection-token-info.json`
- Provides next steps for environment update

### **Step 3: Update Lambda Environment**
```powershell
.\deploy\update-lambda-env.ps1 -CollectionTokenId "0.0.NEW_TOKEN_ID"
```
**What this does:**
- Updates Lambda environment variables
- Sets the new collection token ID
- Tests the updated function

### **Step 4: Deploy Frontend**
```powershell
.\deploy\deploy-frontend.ps1
```
**What this does:**
- Builds frontend with new components
- Uploads to S3
- Invalidates CloudFront cache
- Tests deployment

## 🔧 Manual Configuration

### **Lambda Environment Variables**
```bash
HEDERA_NETWORK=TESTNET
HEDERA_ACCOUNT_ID=0.0.6890393
FOLDER_COLLECTION_TOKEN=0.0.NEW_TOKEN_ID
MIRROR_NODE_URL=https://testnet.mirrornode.hedera.com
VERSION=V48.0
```

### **Frontend Configuration**
Update `frontend/services/HederaApiService.ts`:
```typescript
const baseUrl = 'https://uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com';
```

## 🧪 Testing the Deployment

### **1. Health Check**
```bash
curl https://uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com/health
```
**Expected Response:**
```json
{
  "success": true,
  "message": "SafeMate v2 API is healthy",
  "version": "V48.0"
}
```

### **2. Create Collection Token**
```bash
curl -X POST https://uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com/folders/create-collection \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### **3. Test Folder Creation**
```bash
curl -X POST https://uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com/folders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Folder", "parentFolderId": null}'
```

### **4. Test Folder Listing**
```bash
curl -X GET https://uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com/folders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🎨 Frontend Testing

### **1. Access Frontend**
- **Main Site**: https://d2xl0r3mv20sy5.cloudfront.net
- **Test Page**: https://d2xl0r3mv20sy5.cloudfront.net/testpage

### **2. Login and Get JWT Token**
1. Login to SafeMate frontend
2. Open browser developer tools (F12)
3. Go to Application/Storage tab
4. Find `safemate_auth_token` in localStorage
5. Copy the token value

### **3. Test Browser Tools**
- **Basic API Test**: `browser-test.html`
- **Folder Hierarchy Test**: `folder-hierarchy-browser-test.html`

## 📊 New Features Available

### **Backend Features:**
- ✅ **NON_FUNGIBLE_UNIQUE** folder tokens
- ✅ **Rich metadata** with icons, colors, permissions
- ✅ **Hierarchical structure** with parent-child relationships
- ✅ **DynamoDB integration** for fast queries
- ✅ **Permission system** with owners, editors, viewers
- ✅ **File management** integration ready

### **Frontend Features:**
- ✅ **Enhanced FolderTreeWidget** with icons and colors
- ✅ **Context menus** for folder actions
- ✅ **Permission controls** and sharing
- ✅ **File management** UI components
- ✅ **Search and filtering** capabilities
- ✅ **Responsive design** with Material-UI

## 🔍 Troubleshooting

### **Common Issues:**

#### **1. Lambda Deployment Fails**
```bash
# Check AWS credentials
aws sts get-caller-identity

# Check function exists
aws lambda get-function --function-name preprod-safemate-hedera-service
```

#### **2. Collection Token Creation Fails**
- Verify JWT token is valid and not expired
- Check if you're logged in to SafeMate frontend
- Ensure Lambda function is deployed and running

#### **3. Frontend Build Fails**
```bash
# Check Node.js version
node --version

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### **4. Environment Variables Not Set**
```bash
# Check Lambda environment
aws lambda get-function-configuration --function-name preprod-safemate-hedera-service

# Update environment variables
aws lambda update-function-configuration \
  --function-name preprod-safemate-hedera-service \
  --environment Variables='{"FOLDER_COLLECTION_TOKEN":"0.0.NEW_TOKEN_ID"}'
```

### **Debug Commands:**
```bash
# Check Lambda logs
aws logs describe-log-groups --log-group-name-prefix /aws/lambda/preprod-safemate-hedera-service

# Test API endpoints
curl -v https://uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com/health

# Check S3 bucket
aws s3 ls s3://safemate-frontend-bucket
```

## 📈 Performance Monitoring

### **AWS CloudWatch Metrics:**
- Lambda execution duration
- API Gateway response times
- DynamoDB read/write capacity
- CloudFront cache hit ratio

### **Expected Performance:**
- **Folder listing**: < 2 seconds
- **Folder creation**: < 5 seconds
- **API response time**: < 1 second
- **Frontend load time**: < 3 seconds

## 🔒 Security Considerations

### **Authentication:**
- JWT tokens for API access
- Cognito integration for user management
- Proper CORS configuration

### **Data Protection:**
- Encrypted data in transit (HTTPS)
- Encrypted data at rest (DynamoDB)
- Private keys stored securely

### **Access Control:**
- Folder-level permissions
- User-based access control
- Public/private folder options

## 📋 Post-Deployment Checklist

- [ ] Lambda function deployed and healthy
- [ ] Collection token created successfully
- [ ] Environment variables set correctly
- [ ] Frontend deployed and accessible
- [ ] Health check passes
- [ ] Folder creation works
- [ ] Folder listing returns data
- [ ] Frontend displays folders correctly
- [ ] Icons and colors display properly
- [ ] Context menus work
- [ ] Permission system functions
- [ ] File management ready

## 🚀 Next Steps

### **Immediate:**
1. Test complete folder creation workflow
2. Verify hierarchical structure display
3. Test permission and sharing features
4. Monitor performance and errors

### **Future Enhancements:**
1. File upload/download functionality
2. Advanced search and filtering
3. Folder templates and presets
4. Bulk operations
5. Advanced sharing options
6. Mobile app integration

## 📞 Support

### **Documentation:**
- `FOLDER_NFT_CONFIGURATION.md` - Complete NFT configuration
- `LAMBDA_UPDATE_GUIDE.md` - Lambda implementation details
- `TESTING_GUIDE.md` - Comprehensive testing guide

### **Logs and Monitoring:**
- **AWS CloudWatch**: Lambda and API Gateway logs
- **Hedera Explorer**: Blockchain transaction verification
- **Browser DevTools**: Frontend debugging

---

## ✨ Deployment Complete!

Your SafeMate v2 system is now deployed with:
- ✅ **NON_FUNGIBLE_UNIQUE** folder tokens
- ✅ **Rich metadata** and UI customization
- ✅ **Hierarchical folder structure**
- ✅ **Permission and sharing system**
- ✅ **Enhanced frontend** with Material-UI
- ✅ **Complete API** with all endpoints

**Ready for production use! 🚀**



