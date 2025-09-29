# SafeMate Services Testing Guide

## 📊 **Current Project Status**

**Date**: January 13, 2025  
**Status**: 🟢 **FULLY OPERATIONAL**  
**Last Updated**: Infrastructure optimized and stable  
**Environment**: Production (ap-southeast-2)  
**Architecture**: 100% Serverless (AWS Lambda)

## 🚀 **Infrastructure Information**

- **Frontend**: CloudFront CDN (https://d19a5c2wn4mtdt.cloudfront.net)
- **Backend**: 7 AWS Lambda functions
- **APIs**: 6 API Gateway REST endpoints
- **Database**: 14 DynamoDB tables with encryption
- **Authentication**: Cognito User Pool (ap-southeast-2_uLgMRpWlw)
- **Status**: All services operational with auto-scaling
- **NEW**: Modular Dashboard System with widget-based architecture

## 🎯 **NEW: Modular Dashboard System**

### **Available Widgets for Testing**
- **Wallet Overview**: Display wallet balance and recent transactions
- **Wallet Send**: Send funds to other users
- **Wallet Receive**: Generate receive addresses and QR codes
- **Wallet Details**: Detailed wallet information and settings
- **Stats Overview**: Platform statistics and metrics
- **Quick Actions**: Common user actions
- **Files Overview**: File management interface
- **Dashboard Stats**: Dashboard-specific statistics
- **Group Invitations**: Group management interface
- **Platform Status**: System status and health
- **Recent Activity**: User activity feed
- **Account Status**: User account information

### **Navigation Structure for Testing**
- **Dashboard** (`/app/dashboard`) - NEW: Modular widget system
- **My Files** (`/app/files`) - File management
- **Upload** (`/app/upload`) - File upload interface
- **Wallet** (`/app/wallet`) - Blockchain operations
- **Groups** (`/app/shared`) - Group collaboration
- **Gallery** (`/app/gallery`) - Coming Soon
- **Monetise** (`/app/monetise`) - Coming Soon
- **How to** (`/app/how-to`) - User guide
- **Help** (`/app/help`) - FAQ and support
- **Profile** (`/app/profile`) - User settings

## 🔐 **Authentication Setup**

### Step 1: Get JWT Token from Browser

1. **Access Application**: 
   - **Local Development**: http://localhost:5173/
   - **Production**: https://d19a5c2wn4mtdt.cloudfront.net

2. **Login Process**:
   - Login with your credentials
   - Open Developer Tools (F12)
   - Go to Application tab → Local Storage
   - Find token key (looks like): `CognitoIdentityServiceProvider.3fvj570cd7tgcahpp4pa5b52rt.lastAuthUser.accessToken`
   - Copy the token value

### Step 2: Verify Token Validity

```bash
# Test token validity
curl -X POST "https://your-api-gateway-url/default/onboarding/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{"userId":"test-user"}'
```

## 🌐 **Service Endpoints Testing**

Replace `YOUR_JWT_TOKEN_HERE` with your actual token. All API Gateway URLs are provided below for each service.

### A. User Onboarding Service Test

**POST** `https://nh9d5m1g4m.execute-api.ap-southeast-2.amazonaws.com/default/onboarding/start`

Headers:
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

Body:
```json
{
  "userId": "test-user-id"
}
```

**curl command:**
```bash
curl -X POST "https://nh9d5m1g4m.execute-api.ap-southeast-2.amazonaws.com/default/onboarding/start" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{"userId":"test-user-id"}'
```

**Expected Response:**
```json
{
  "success": true,
  "hedera_account_id": "alias-eb40c718bdbaaf88",
  "wallet_id": "wallet-1752545767410-unq7jir7f",
  "public_key": "eb40c718bdbaaf8810ca2be2156a77032d509aadf8d6086819a108da9dd05b47",
  "account_type": "auto_created",
  "needs_funding": true,
  "funding_instructions": "Send HBAR to this account alias to activate it on the Hedera network."
}
```

### B. Wallet Status Service Test

**POST** `https://nh9d5m1g4m.execute-api.ap-southeast-2.amazonaws.com/default/onboarding/status`

Headers:
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

Body:
```json
{
  "userId": "test-user-id"
}
```

**curl command:**
```bash
curl -X POST "https://nh9d5m1g4m.execute-api.ap-southeast-2.amazonaws.com/default/onboarding/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{"userId":"test-user-id"}'
```

**Expected Response:**
```json
{
  "success": true,
  "wallet_status": "active",
  "hedera_account_id": "0.0.1234567",
  "balance": "100.0",
  "account_type": "personal"
}
```

## 🧪 **Frontend Testing**

### **Widget System Testing**
1. **Navigate to Dashboard**: Go to `/app/dashboard`
2. **Verify Widget Loading**: Check that all widgets load properly
3. **Test Widget Interactions**: Interact with each widget
4. **Check Error Boundaries**: Verify error handling works
5. **Test Responsive Design**: Test on different screen sizes

### **Navigation Testing**
1. **Test All Routes**: Navigate to each section
2. **Verify Active States**: Check navigation highlighting
3. **Test Mobile Navigation**: Test on mobile devices
4. **Check Breadcrumbs**: Verify navigation breadcrumbs

### **Authentication Testing**
1. **Login Flow**: Test user login process
2. **Token Management**: Verify JWT token handling
3. **Logout Flow**: Test user logout process
4. **Session Management**: Test session persistence

## 🔍 **Performance Testing**

### **Frontend Performance**
- **Page Load Time**: < 3 seconds
- **Widget Load Time**: < 1 second per widget
- **Navigation Response**: < 500ms
- **Bundle Size**: < 2MB (gzipped)

### **API Performance**
- **Response Time**: < 500ms average
- **Throughput**: 1000+ requests/second
- **Error Rate**: < 0.1%
- **Availability**: 99.9%

## 🐛 **Troubleshooting**

### **Common Issues**
1. **Widget Not Loading**: Check browser console for errors
2. **Authentication Failures**: Verify JWT token validity
3. **API Errors**: Check API Gateway logs
4. **Performance Issues**: Monitor CloudWatch metrics

### **Debug Tools**
- **WidgetDevTools**: Built-in widget debugging
- **Browser DevTools**: Console and network monitoring
- **CloudWatch**: Backend performance monitoring
- **AWS X-Ray**: Distributed tracing

## 📊 **Monitoring and Metrics**

### **Key Metrics to Monitor**
- **User Engagement**: Dashboard usage patterns
- **Widget Performance**: Individual widget load times
- **API Response Times**: Backend service performance
- **Error Rates**: Frontend and backend errors
- **User Satisfaction**: Feature usage analytics

### **Alerting**
- **High Error Rate**: > 1% error rate
- **Slow Response Time**: > 2 seconds
- **Service Unavailable**: Any service down
- **Authentication Issues**: Login failures

---

*Last Updated: January 13, 2025*
*Version: 2.1 - Updated for Modular Dashboard System* 