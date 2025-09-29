# SafeMate Deployment Summary

## Environment: default
**Deployed:** Tue Jul  8 19:41:32 AEST 2025
**Region:** ap-southeast-2

## 🚀 Application URLs
- **Main Application:** https://d19a5c2wn4mtdt.cloudfront.net
- **Vault API:** https://8pj14dfk90.execute-api.ap-southeast-2.amazonaws.com/default
- **Wallet API:** https://iwli6j3wl2.execute-api.ap-southeast-2.amazonaws.com/default
- **Hedera API:** https://1pmu40gmvg.execute-api.ap-southeast-2.amazonaws.com/default

## 🔐 Authentication
- **Cognito User Pool:** ap-southeast-2_WzkN5JNsb
- **Region:** ap-southeast-2

## 📋 Next Steps
1. Visit https://d19a5c2wn4mtdt.cloudfront.net to access the application
2. Create a user account to test authentication
3. Set up Hedera operator account if not done:
   ```bash
   ./setup-operator.sh
   ```
4. Test file upload and blockchain integration

## 🔧 Troubleshooting
- Check ECS service logs in CloudWatch
- Verify Lambda function logs if API calls fail
- Ensure Hedera operator account is configured
- Check environment variables in ECS task definition

## 📊 Resources Created
- ECS Cluster and Service
- Lambda Functions (3)
- API Gateways (3)
- DynamoDB Tables (7)
- Cognito User Pool
- KMS Keys (3)
- CloudFront Distribution
- Application Load Balancer

