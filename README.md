# SafeMate Frontend

React-based frontend application for SafeMate blockchain document storage platform.

## 🌐 Live Environments

### Pre-production (Active)
- **URL**: https://d2xl0r3mv20sy5.cloudfront.net/
- **Branch**: `preprod`
- **Status**: ✅ Fully operational with email verification
- **Features**: Complete file management, wallet integration, group collaboration

### Development
- **URL**: Development environment (localhost:5173)
- **Branch**: `dev`
- **Status**: Development only

### Production
- **URL**: Production environment (TBD)
- **Branch**: `main`
- **Status**: Not yet deployed

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start with specific environment
npm run dev:preprod
npm run dev:production
```

## 🏗️ Architecture

### Frontend Stack
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Material-UI** - Component library
- **AWS Amplify** - AWS service integration

### Key Features
- **Real Hedera Testnet Integration** - Live blockchain wallet creation
- **Direct Cognito Authentication** - Email verification with AWS Cognito
- **Modern Dashboard** - Widget-based interface with real-time updates
- **File Management** - Secure upload, storage, and sharing
- **Group Collaboration** - Team-based file sharing
- **MATE Token Rewards** - Reward points system

## 🔧 Environment Configuration

Environment files are automatically loaded by Vite:
- `.env.development` - Development configuration
- `.env.preprod` - Pre-production configuration  
- `.env.production` - Production configuration

## 📦 Deployment

Each branch automatically deploys via GitHub Actions:
- **dev branch** → Development S3 bucket with CloudFront
- **preprod branch** → Pre-production S3 bucket with CloudFront (https://d2xl0r3mv20sy5.cloudfront.net/)
- **main branch** → Production S3 bucket with CloudFront

## 🔗 API Integration

The frontend integrates with AWS services through API Gateway:
- **User Onboarding API** - User registration and wallet creation
- **Token Vault API** - Token and secret management
- **Wallet Manager API** - Wallet operations
- **Hedera Service API** - Blockchain transactions
- **Group Manager API** - Team collaboration
- **Directory Creator API** - File organization

## 💰 Free Tier Compliance

Optimized for AWS Free Tier:
- **Cognito Direct Email Verification** - No custom Lambda functions
- **S3 Static Website Hosting** - No Application Load Balancer
- **KMS + DynamoDB** - No AWS Secrets Manager
- **Optimized Lambda Functions** - Minimal resource usage

## 📝 Recent Updates

- ✅ **Email Verification Fixed** - Resolved "User cannot be confirmed" errors
- ✅ **GitHub Actions Deployment** - Fixed environment configuration
- ✅ **CloudFront Integration** - Optimized CDN delivery
- ✅ **Hedera Testnet** - Live blockchain integration

## 🐛 Troubleshooting

### Email Verification Issues
If you encounter email verification problems:
1. Check browser console for detailed error logs
2. Ensure you're using the CloudFront URL: https://d2xl0r3mv20sy5.cloudfront.net/
3. Clear browser cache if needed

### Deployment Issues
If GitHub Actions deployment fails:
1. Check the Actions tab in GitHub
2. Verify environment variables in `environments/` directory
3. Ensure AWS credentials are properly configured

## 📞 Support

For issues or questions:
1. Check the GitHub Issues tab
2. Review the console logs in browser developer tools
3. Verify you're using the correct environment URL

---

**Last Updated**: 2025-01-22 - Email verification fixes and deployment improvements