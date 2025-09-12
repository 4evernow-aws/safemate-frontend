# SafeMate Frontend

React-based frontend application for SafeMate blockchain document storage platform.

## Overview

SafeMate is a secure file management and sharing platform powered by Hedera blockchain technology. The frontend provides a modern, responsive interface for users to store, share, and monetize their digital assets with enterprise-grade security.

## Key Features

- **Real Hedera Testnet Integration** - Live blockchain wallet creation and management
- **Direct Cognito Authentication** - Free Tier compliant email verification
- **Modern React Architecture** - Built with Vite, TypeScript, and Material-UI
- **Modular Dashboard System** - Widget-based dashboard with real-time updates
- **File Management** - Secure upload, storage, and sharing capabilities
- **Group Collaboration** - Team-based file sharing and management
- **MATE Token Rewards** - Reward points system for platform engagement

## Environment Structure

- **dev** - Development environment (localhost:5173)
- **preprod** - Pre-production environment
- **production** - Production environment

## Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start with specific environment
npm run dev:preprod
npm run dev:production
```

## Environment Configuration

Environment files are automatically loaded by Vite based on the mode:
- `.env.development` - Development configuration
- `.env.preprod` - Pre-production configuration  
- `.env.production` - Production configuration

## Architecture

### Frontend Stack
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Material-UI** - Component library
- **AWS Amplify** - AWS service integration
- **React Router** - Client-side routing

### Key Components
- **ModernLogin** - Authentication with Cognito integration
- **Dashboard** - Modular widget-based interface
- **File Management** - Upload, storage, and sharing
- **Wallet Integration** - Hedera blockchain wallet management
- **Group Management** - Team collaboration features

## API Integration

The frontend integrates with AWS services through API Gateway:
- **User Onboarding API** - User registration and wallet creation
- **Token Vault API** - Token and secret management
- **Wallet Manager API** - Wallet operations
- **Hedera Service API** - Blockchain transactions
- **Group Manager API** - Team collaboration
- **Directory Creator API** - File organization

## Free Tier Compliance

The application is optimized for AWS Free Tier:
- **Cognito Direct Email Verification** - No custom Lambda functions
- **S3 Static Website Hosting** - No Application Load Balancer
- **KMS + DynamoDB** - No AWS Secrets Manager
- **Optimized Lambda Functions** - Minimal resource usage

## Deployment

Each branch automatically deploys to its corresponding environment:
- **dev branch** → Development S3 bucket with CloudFront
- **preprod branch** → Pre-production S3 bucket with CloudFront
- **main branch** → Production S3 bucket with CloudFront

## Development Server

The development server runs on `http://localhost:5173` and includes:
- Hot module replacement
- TypeScript compilation
- Environment variable injection
- CORS configuration for API calls

## Last Updated

2025-09-12 - Updated for Free Tier compliance and direct Cognito email verification