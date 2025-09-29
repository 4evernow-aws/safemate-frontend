export interface UserProfile {
  // Standard Cognito attributes
  email: string;
  username: string;
  sub: string;
  
  // Custom Hedera attributes
  hederaAccountId?: string;
  assetCount?: number;
  subscriptionTier?: 'basic' | 'premium' | 'enterprise';
  mateTokenBalance?: number;
  kycVerificationStatus?: 'pending' | 'approved' | 'rejected' | 'in_review';
  lastBlockchainActivity?: string; // ISO timestamp
  storageQuotaUsed?: number; // bytes
  walletSecurity?: 'kms-enhanced' | 'standard'; // Add wallet security type
}

export interface UserAttributes {
  [key: string]: string | number | undefined;
  'custom:hedera_account'?: string;
  'custom:asset_count'?: number;
  'custom:subscription_tier'?: string;
  'custom:mate_balance'?: number;
  'custom:kyc_status'?: string;
  'custom:last_activity'?: string;
  'custom:storage_used'?: number;
}

export interface SubscriptionTier {
  name: string;
  storageQuota: number;
  maxAssets: number;
  features: string[];
}

export interface UserStats {
  totalAssets: number;
  storageUsed: number;
  storageQuota: number;
  storagePercentage: number;
  mateTokenBalance: number;
  lastActivity: Date | null;
}

export interface KYCData {
  status: 'pending' | 'approved' | 'rejected' | 'in_review';
  submittedAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  documents?: {
    id: string;
    type: 'passport' | 'drivers_license' | 'national_id' | 'proof_of_address';
    status: 'pending' | 'approved' | 'rejected';
    uploadedAt: Date;
  }[];
}

export interface HederaAccountInfo {
  accountId: string;
  publicKey: string;
  balance: number; // in HBAR
  createdAt: Date;
  isActive: boolean;
}