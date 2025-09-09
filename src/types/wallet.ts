export interface HederaWallet {
  accountId: string;
  publicKey: string;
  balance: number; // in HBAR
  walletId: string;
  status: 'active' | 'inactive' | 'creating' | 'error';
  createdAt: string;
  lastActivity: string;
}

export interface WalletMetadata {
  userId: string;
  walletId: string;
  hederaAccountId: string;
  publicKey: string;
  walletType: 'hedera';
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive' | 'creating' | 'error';
  balance: number;
  lastActivity: string;
}

export interface WalletCreationRequest {
  initialBalance?: number; // Default 1 HBAR
}

export interface WalletCreationResponse {
  success: boolean;
  wallet: {
    accountId: string;
    publicKey: string;
    balance: number | { hbar: number; usd: number }; // Support both formats
    security?: 'kms-enhanced' | 'standard'; // Add security property
    encryptionInfo?: any; // Add encryption info
    needsFunding?: boolean; // Whether wallet needs initial funding
    accountType?: 'operator_created' | 'auto_created'; // How the account was created
  } | null; // Allow null for failed operations
  error?: string;
}

export interface WalletBalance {
  hbar: number;
  usd?: number; // Optional USD equivalent
  lastUpdated: string;
}

export interface HederaTransaction {
  id: string; // Use 'id' to match actual usage
  type: 'CRYPTOTRANSFER' | 'TOKENCREATE' | 'TOKENMINT' | 'FILEAPPEND' | 'ACCOUNTCREATE';
  from: string;
  to?: string;
  amount?: number;
  fee: number;
  timestamp: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  memo?: string;
  payer?: string; // Add payer property
  transfers?: any[]; // Add transfers property
}

export interface HederaToken {
  tokenId: string;
  name: string;
  symbol: string;
  decimals: number;
  balance: number;
  tokenType: 'FUNGIBLE_COMMON' | 'NON_FUNGIBLE_UNIQUE';
  treasuryAccountId: string;
  createdAt: string;
}

export interface HederaFileInfo {
  fileId: string;
  size: number;
  memo: string;
  keys: string[];
  expirationTime: string;
  deleted: boolean;
}

export interface WalletAuditLog {
  operationId: string;
  timestamp: string;
  userId: string;
  operationType: 'ACCOUNT_CREATED' | 'PRIVATE_KEY_ACCESSED' | 'TRANSACTION_SIGNED' | 'BALANCE_UPDATED';
  details: any;
  expiresAt: number;
}

export interface WalletOperationResult {
  success: boolean;
  data?: any;
  error?: string;
  transactionId?: string;
  message?: string; // Add message property for user feedback
  wallet?: any; // Add wallet property for wallet operations
}

export interface HederaNetworkInfo {
  network: 'testnet' | 'mainnet';
  nodeAccountId: string;
  mirrorNodeUrl: string;
  consensusNodeUrl: string;
}

export interface WalletServiceConfig {
  apiUrl: string;
  network: HederaNetworkInfo;
  defaultTimeout: number;
}

// Wallet creation states for UI
export type WalletCreationState = 
  | 'idle'
  | 'creating'
  | 'success'
  | 'error'
  | 'completed'  // Add completed state
  | 'failed';    // Add failed state

export interface WalletCreationStatus {
  state: WalletCreationState;
  progress: number; // 0-100
  message: string;
  error?: string;
}