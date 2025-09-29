export interface ApiEndpoints {
  onboarding: string;
  wallet: string;
  hedera: string;
  groups: string;
  directory: string;
  tokenVault: string;
}

export interface EnvironmentConfig {
  name: string;
  apiEndpoints: ApiEndpoints;
  cognito: {
    userPoolId: string;
    clientId: string;
  };
  hedera: {
    network: 'testnet' | 'mainnet';
  };
}

export interface User {
  id: string;
  email: string;
  hederaAccountId?: string;
  walletId?: string;
}

export interface Wallet {
  id: string;
  userId: string;
  hederaAccountId: string;
  publicKey: string;
  status: 'creating' | 'active' | 'inactive';
}
