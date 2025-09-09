// Environment Configuration for SafeMate Application

export interface EnvironmentConfig {
  // Mode configuration
  isDemoMode: boolean;
  isProduction: boolean;
  isDebugMode: boolean;
  
  // Hedera network configuration
  hederaNetwork: 'testnet' | 'mainnet';
  hederaMirrorNode: string;
  hederaJsonRpc: string;
  
  // API endpoints
  vaultApiUrl: string;
  walletApiUrl: string;
  hederaApiUrl: string;
  onboardingApiUrl: string;
  groupApiUrl: string;
  directoryApiUrl: string;
  
  // AWS Cognito configuration
  cognitoRegion: string;
  cognitoUserPoolId: string;
  cognitoClientId: string;
  cognitoDomain: string;
  
  // Token configuration
  mateTokenId: string;
  
  // File storage limits
  maxFileSizeHedera: number;
  ipfsThreshold: number;
}

// Environment detection and configuration
const isProduction = import.meta.env.PROD;
const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true' || (!isProduction && localStorage.getItem('safemate-demo-mode') === 'true') ? true : false; // Check env first, then localStorage only for local development
const hederaNetwork = (import.meta.env.VITE_HEDERA_NETWORK as 'testnet' | 'mainnet') || 'testnet';

// Debug logging for demo mode detection
console.log('🔧 Environment Debug:', {
  isProduction,
  viteDemoMode: import.meta.env.VITE_DEMO_MODE,
  localStorageDemoMode: localStorage.getItem('safemate-demo-mode'),
  finalDemoMode: isDemoMode
});

// Mirror Node URLs
const MIRROR_NODES = {
  testnet: 'https://testnet.mirrornode.hedera.com/api/v1',
  mainnet: 'https://mainnet-public.mirrornode.hedera.com/api/v1'
};

// JSON-RPC URLs for transaction submission
const JSON_RPC_ENDPOINTS = {
  testnet: 'https://testnet.hashio.io/api',
  mainnet: 'https://mainnet.hashio.io/api'
};

// Main environment configuration
export const config: EnvironmentConfig = {
  // Mode configuration
  isDemoMode,
  isProduction,
  isDebugMode: import.meta.env.VITE_DEBUG_MODE === 'true' || !isProduction,
  
  // Hedera network configuration
  hederaNetwork,
  hederaMirrorNode: MIRROR_NODES[hederaNetwork],
  hederaJsonRpc: JSON_RPC_ENDPOINTS[hederaNetwork],
  
  // API endpoints (from terraform outputs)
  vaultApiUrl: import.meta.env.VITE_VAULT_API_URL || '',
  walletApiUrl: import.meta.env.VITE_WALLET_API_URL || import.meta.env.VITE_VAULT_API_URL || '',
  hederaApiUrl: import.meta.env.VITE_HEDERA_API_URL || '',
  onboardingApiUrl: import.meta.env.VITE_ONBOARDING_API_URL || '',
  groupApiUrl: import.meta.env.VITE_GROUP_API_URL || '',
  directoryApiUrl: import.meta.env.VITE_DIRECTORY_API_URL || '',
  
  // AWS Cognito configuration
  cognitoRegion: import.meta.env.VITE_COGNITO_REGION || 'ap-southeast-2',
  cognitoUserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || '',
  cognitoClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || '',
  cognitoDomain: import.meta.env.VITE_COGNITO_DOMAIN || '',
  
  // SafeMate Token ID (update with actual deployed token)
  mateTokenId: import.meta.env.VITE_MATE_TOKEN_ID || '0.0.7779374',
  
  // File storage configuration
  maxFileSizeHedera: parseInt(import.meta.env.VITE_MAX_FILE_SIZE_HEDERA || '52428800'), // 50MB
  ipfsThreshold: parseInt(import.meta.env.VITE_IPFS_THRESHOLD || '52428800'), // 50MB
};

// Validation function
export function validateEnvironment(): string[] {
  const errors: string[] = [];
  
  if (!config.isDemoMode) {
    // Only validate these if not in demo mode
    if (!config.vaultApiUrl) {
      errors.push('VITE_VAULT_API_URL is required for real mode');
    }
    
    if (!config.cognitoUserPoolId) {
      errors.push('VITE_COGNITO_USER_POOL_ID is required for real mode');
    }
    
    if (!config.cognitoClientId) {
      errors.push('VITE_COGNITO_CLIENT_ID is required for real mode');
    }
  }
  
  return errors;
}

// Helper functions
export function getApiUrl(endpoint: string): string {
  return `${config.vaultApiUrl}${endpoint}`;
}

export function getHederaApiUrl(endpoint: string): string {
  return `${config.hederaApiUrl}${endpoint}`;
}

export function getDirectoryApiUrl(endpoint: string): string {
  return `${config.directoryApiUrl}${endpoint}`;
}

export function getHederaMirrorUrl(path: string): string {
  return `${config.hederaMirrorNode}${path}`;
}

export function isTestnetMode(): boolean {
  return config.hederaNetwork === 'testnet';
}

export function logEnvironmentInfo(): void {
  if (config.isDebugMode) {
    console.log('🔧 SafeMate Environment Configuration:', {
      mode: config.isDemoMode ? 'DEMO' : 'REAL',
      network: config.hederaNetwork.toUpperCase(),
      environment: config.isProduction ? 'PRODUCTION' : 'DEVELOPMENT',
      vaultApiConfigured: !!config.vaultApiUrl,
      cognitoConfigured: !!config.cognitoUserPoolId,
    });
  }
}

// Initialize environment logging
logEnvironmentInfo(); 