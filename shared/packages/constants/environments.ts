import { EnvironmentConfig } from '../types/api';

export const ENVIRONMENT_CONFIGS: Record<string, EnvironmentConfig> = {
  dev: {
    name: 'development',
    apiEndpoints: {
      onboarding: 'https://dev-api.onboarding.safemate.com',
      wallet: 'https://dev-api.wallet.safemate.com',
      hedera: 'https://dev-api.hedera.safemate.com',
      groups: 'https://dev-api.groups.safemate.com',
      directory: 'https://dev-api.directory.safemate.com',
      tokenVault: 'https://dev-api.token-vault.safemate.com',
    },
    cognito: {
      userPoolId: 'ap-southeast-2_dev123',
      clientId: 'dev_client_id',
    },
    hedera: {
      network: 'testnet',
    },
  },
  preprod: {
    name: 'pre-production',
    apiEndpoints: {
      onboarding: 'https://preprod-api.onboarding.safemate.com',
      wallet: 'https://preprod-api.wallet.safemate.com',
      hedera: 'https://preprod-api.hedera.safemate.com',
      groups: 'https://preprod-api.groups.safemate.com',
      directory: 'https://preprod-api.directory.safemate.com',
      tokenVault: 'https://preprod-api.token-vault.safemate.com',
    },
    cognito: {
      userPoolId: 'ap-southeast-2_preprod123',
      clientId: 'preprod_client_id',
    },
    hedera: {
      network: 'testnet',
    },
  },
  production: {
    name: 'production',
    apiEndpoints: {
      onboarding: 'https://api.onboarding.safemate.com',
      wallet: 'https://api.wallet.safemate.com',
      hedera: 'https://api.hedera.safemate.com',
      groups: 'https://api.groups.safemate.com',
      directory: 'https://api.directory.safemate.com',
      tokenVault: 'https://api.token-vault.safemate.com',
    },
    cognito: {
      userPoolId: 'ap-southeast-2_prod123',
      clientId: 'prod_client_id',
    },
    hedera: {
      network: 'mainnet',
    },
  },
};
