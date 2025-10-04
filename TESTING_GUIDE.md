# SafeMate v2 Testing Guide - V47.13

## 🎯 Current Status
- **Deployment**: ✅ V47.13 Successfully Deployed
- **Lambda Function**: `preprod-safemate-hedera-service` (Active)
- **API Gateway**: `uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com`
- **Status**: Ready for authenticated testing

## 🔧 Key V47.13 Fixes
- ✅ Fixed queryUserFoldersFromBlockchain function to check user's own treasury tokens
- ✅ Enhanced folder listing to check user's own folder collection tokens (where they are treasury account)
- ✅ Maintains fallback check of shared folder collection token 0.0.6920175
- ✅ Enhanced debugging for treasury token detection

## 🧪 Testing Checklist

### 1. Frontend Application Testing
**Prerequisites:**
- Access to the React frontend application
- Valid Cognito user credentials
- Browser with developer tools enabled

**Steps:**
1. **Login Test**
   - Navigate to the SafeMate frontend
   - Login with valid Cognito credentials
   - Verify JWT token is received and stored

2. **Folder Listing Test** (Primary V47.13 Test)
   - After login, navigate to folder listing page
   - Verify that previously created folders are displayed
   - Check that folder metadata includes:
     - Folder name
     - Token ID (should show 0.0.6920175 for collection token)
     - Creation timestamp
     - Parent folder reference (for subfolders)

3. **Folder Creation Test**
   - Create a new folder
   - Verify HTTP 201 response
   - Check that token is created on Hedera blockchain
   - Verify folder appears in listing immediately

4. **Subfolder Creation Test**
   - Create a subfolder within an existing folder
   - Verify hierarchical structure is maintained
   - Check parent-child relationship in metadata

### 2. API Endpoint Testing (with Authentication)

**Required Headers:**
```json
{
  "Authorization": "Bearer <JWT_TOKEN>",
  "Content-Type": "application/json",
  "Accept": "application/json"
}
```

**Test Endpoints:**
- `GET /folders` - List all folders (V47.13 fix)
- `POST /folders` - Create new folder
- `GET /folders/{id}` - Get specific folder
- `POST /folders/{id}/subfolders` - Create subfolder

### 3. Hedera Blockchain Verification

**Collection Token Check:**
- Verify that the system always checks token `0.0.6920175`
- Confirm folder tokens are properly associated with collection token
- Check transaction signatures are valid

**Network Details:**
- **Network**: Hedera Testnet (testnet.hedera.com)
- **Account**: 0.0.6890393
- **Collection Token**: 0.0.6920175

### 4. AWS Infrastructure Monitoring

**CloudWatch Logs:**
- Monitor Lambda function logs for errors
- Check API Gateway access logs
- Verify DynamoDB operations

**Key Metrics:**
- Lambda execution duration
- API Gateway response times
- DynamoDB read/write capacity

## 🚨 Troubleshooting

### Common Issues:

1. **403 Forbidden Errors**
   - Ensure JWT token is valid and not expired
   - Check Cognito user pool configuration
   - Verify API Gateway authorizer settings

2. **Folder Listing Empty**
   - Check if V47.13 treasury token fix is working
   - Verify DynamoDB has folder records
   - Check Lambda function logs for errors

3. **Hedera Transaction Failures**
   - Verify account has sufficient HBAR for fees
   - Check private key parsing (V47.1-V47.7 fixes)
   - Ensure all token keys are signed (V47.8 fix)

## 📊 Success Criteria

### V47.13 Validation:
- ✅ Folder listing displays created folders (including "testfolder 01")
- ✅ User's own treasury tokens are checked first
- ✅ Fallback to collection token 0.0.6920175 works
- ✅ Transaction 0.0.6890393-1759201000-073126826 is visible
- ✅ Enhanced debugging shows treasury token detection

### Performance Targets:
- Folder listing: < 2 seconds
- Folder creation: < 5 seconds
- API response time: < 1 second

## 🔄 Next Development Phase

After successful V47.13 testing:
1. **File Management Testing**
   - Upload files to folders
   - Download files from folders
   - Verify file metadata storage

2. **Advanced Features**
   - Folder sharing between users
   - File versioning
   - Search functionality

3. **Production Preparation**
   - Performance optimization
   - Security audit
   - Cost optimization for AWS Free Tier

## 📞 Support Information

**AWS Resources:**
- Lambda: `preprod-safemate-hedera-service`
- Cognito: `ap-southeast-2_a2rtp64JW`
- KMS: `3b18b0c0-dd1f-41db-8bac-6ec857c1ed05`

**Repository:**
- GitHub: https://github.com/4evernow-aws/safemate-frontend
- Local: `d:\safemate_v2`

---

**Ready to test! 🚀**
