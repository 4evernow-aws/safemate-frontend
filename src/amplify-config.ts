export const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
      region: import.meta.env.VITE_COGNITO_REGION,
      // Support both username/password and OAuth
      loginWith: {
        username: true,
        email: true,
        phone: false,
        oauth: {
          domain: `${import.meta.env.VITE_COGNITO_DOMAIN}.auth.${import.meta.env.VITE_COGNITO_REGION}.amazoncognito.com`,
          scopes: ['email', 'openid', 'profile', 'aws.cognito.signin.user.admin'],
          redirectSignIn: [
            'http://localhost:5173/callback',
            `${import.meta.env.VITE_APP_URL || 'https://d19a5c2wn4mtdt.cloudfront.net'}/callback`
          ],
          redirectSignOut: [
            'http://localhost:5173/',
            import.meta.env.VITE_APP_URL || 'https://d19a5c2wn4mtdt.cloudfront.net/'
          ],
          responseType: 'code' as const,
        },
      },
    },
  },
};

// Hedera-specific configuration
export const hederaConfig = {
  // Network configuration
  network: {
    testnet: {
      name: 'testnet',
      nodeAccountId: '0.0.3',
      mirrorNodeUrl: 'https://testnet.mirrornode.hedera.com/api/v1',
      consensusNodeUrl: 'https://testnet.hedera.com',
    },
    mainnet: {
      name: 'mainnet',
      nodeAccountId: '0.0.3',
      mirrorNodeUrl: 'https://mainnet-public.mirrornode.hedera.com/api/v1',
      consensusNodeUrl: 'https://mainnet.hedera.com',
    },
  },
  
  // Current network (testnet for POC/MVP)
  currentNetwork: 'testnet',
  
  // Custom attributes configuration
  customAttributes: {
    hederaAccountId: 'custom:hedera_account',
    assetCount: 'custom:asset_count',
    subscriptionTier: 'custom:subscription_tier',
    mateTokenBalance: 'custom:mate_balance',
    kycVerificationStatus: 'custom:kyc_status',
    lastBlockchainActivity: 'custom:last_activity',
    storageQuotaUsed: 'custom:storage_used',
  },
  
  // Default values for new users
  defaultUserAttributes: {
    assetCount: 0,
    subscriptionTier: 'basic',
    mateTokenBalance: 0,
    kycVerificationStatus: 'pending',
    storageQuotaUsed: 0,
  },
  
  // File storage limits
  fileStorageLimits: {
    hederaFileService: 50 * 1024 * 1024, // 50MB limit for Hedera File Service
    ipfsThreshold: 50 * 1024 * 1024, // Use IPFS for files larger than 50MB
  },
  
  // Subscription tiers configuration
  subscriptionTiers: {
    basic: {
      name: 'Basic',
      storageQuota: 100 * 1024 * 1024, // 100MB
      maxAssets: 100,
      features: ['file_storage', 'nft_minting'],
    },
    premium: {
      name: 'Premium',
      storageQuota: 1024 * 1024 * 1024, // 1GB
      maxAssets: 1000,
      features: ['file_storage', 'nft_minting', 'advanced_analytics', 'group_sharing'],
    },
    enterprise: {
      name: 'Enterprise',
      storageQuota: 10 * 1024 * 1024 * 1024, // 10GB
      maxAssets: 10000,
      features: ['file_storage', 'nft_minting', 'advanced_analytics', 'group_sharing', 'api_access', 'priority_support'],
    },
  },
}; 