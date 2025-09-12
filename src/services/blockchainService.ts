import { UserService } from './userService';
import { WalletService } from './walletService';
import type { HederaWallet } from '../types/wallet';

export interface BlockchainOperationResult {
  success: boolean;
  transactionId?: string;
  data?: any;
  error?: string;
}

export interface TransferRequest {
  toAccountId: string;
  amount: number;
  memo?: string;
}

export interface TokenTransferRequest {
  tokenId: string;
  toAccountId: string;
  amount: number;
  memo?: string;
}

export interface TokenCreationRequest {
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: number;
  maxSupply?: number;
  memo?: string;
}

export interface TokenCreationResponse {
  success: boolean;
  tokenId?: string;
  transactionId?: string;
  error?: string;
}

export interface NftCollectionRequest {
  name: string;
  symbol: string;
  metadata?: any;
}

export interface NftCollectionResponse {
  success: boolean;
  tokenId?: string;
  transactionId?: string;
  error?: string;
}

export interface NftMintRequest {
  tokenId: string;
  metadata: any;
}

export interface NftMintResponse {
  success: boolean;
  nftId?: string;
  serialNumber?: number;
  transactionId?: string;
  error?: string;
}

export interface ContractDeployRequest {
  bytecode: string;
  constructorParams?: any[];
  gas?: number;
  memo?: string;
}

export interface ContractDeployResponse {
  success: boolean;
  contractId?: string;
  transactionId?: string;
  error?: string;
}

export interface AccountBalance {
  hbar: number;
  tokens: Record<string, number>;
}

export interface TransactionHistory {
  transactionId: string;
  type: string;
  from: string;
  to: string;
  amount: number;
  fee: number;
  timestamp: string;
  status: 'SUCCESS' | 'FAILED';
  memo?: string;
}

export interface TokenInfo {
  tokenId: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
  treasuryAccountId: string;
  adminKey?: string;
  supplyKey?: string;
}

export interface NftInfo {
  nftId: string;
  tokenId: string;
  serialNumber: number;
  ownerId: string;
  metadata: any;
  mintedAt: string;
}

export interface ContractInfo {
  contractId: string;
  ownerId: string;
  bytecode: string;
  deployedAt: string;
  transactionId: string;
}

export class BlockchainService {
  private static readonly API_BASE_URL = (import.meta as any).env.VITE_HEDERA_API_URL || '';

  // =======================
  // HBAR OPERATIONS
  // =======================

  /**
   * Transfer HBAR to another account
   */
  static async transferHbar(request: TransferRequest): Promise<BlockchainOperationResult> {
    try {
      // Validate user has wallet
      const wallet = await WalletService.getWallet();
      if (!wallet) {
        return {
          success: false,
          error: 'User wallet not found'
        };
      }

      // Validate account ID format
      if (!WalletService.validateAccountId(request.toAccountId)) {
        return {
          success: false,
          error: 'Invalid account ID format'
        };
      }

      const response = await this.makeAuthenticatedRequest('/hbar/transfer', 'POST', request);
      
      if (response.success) {
        // Update user's last blockchain activity
        await UserService.updateUserProfile({
          lastBlockchainActivity: new Date().toISOString()
        });

        return {
          success: true,
          transactionId: response.transactionId,
          data: response.data
        };
      } else {
        return {
          success: false,
          error: response.error || 'Transfer failed'
        };
      }
    } catch (error) {
      console.error('Error transferring HBAR:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get account balance
   */
  static async getAccountBalance(accountId?: string): Promise<AccountBalance | null> {
    try {
      let targetAccountId = accountId;
      
      if (!targetAccountId) {
        const wallet = await WalletService.getWallet();
        if (!wallet) {
          throw new Error('User wallet not found');
        }
        targetAccountId = wallet.accountId;
      }

      const response = await this.makeAuthenticatedRequest(
        `/balance/${targetAccountId}`,
        'GET'
      );
      
      if (response.success && response.balance) {
        return response.balance;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching account balance:', error);
      return null;
    }
  }

  // =======================
  // TOKEN OPERATIONS
  // =======================

  // REMOVED: MATE token creation functionality
  // SafeMate is a document storage platform, not a token creation platform

  /**
   * Transfer tokens to another account
   */
  static async transferTokens(request: TokenTransferRequest): Promise<BlockchainOperationResult> {
    try {
      // Validate user has wallet
      const wallet = await WalletService.getWallet();
      if (!wallet) {
        return {
          success: false,
          error: 'User wallet not found'
        };
      }

      // Validate account ID format
      if (!WalletService.validateAccountId(request.toAccountId)) {
        return {
          success: false,
          error: 'Invalid account ID format'
        };
      }

      const response = await this.makeAuthenticatedRequest('/tokens/transfer', 'POST', request);
      
      if (response.success) {
        // Update user's last blockchain activity
        await UserService.updateUserProfile({
          lastBlockchainActivity: new Date().toISOString()
        });

        return {
          success: true,
          transactionId: response.transactionId,
          data: response.data
        };
      } else {
        return {
          success: false,
          error: response.error || 'Token transfer failed'
        };
      }
    } catch (error) {
      console.error('Error transferring tokens:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get token information
   */
  static async getTokenInfo(tokenId: string): Promise<TokenInfo | null> {
    try {
      const response = await this.makeAuthenticatedRequest(`/tokens/${tokenId}`, 'GET');
      
      if (response.success && response.token) {
        return response.token;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching token info:', error);
      return null;
    }
  }

  // =======================
  // NFT OPERATIONS
  // =======================

  /**
   * Create an NFT collection
   */
  static async createNftCollection(request: NftCollectionRequest): Promise<NftCollectionResponse> {
    try {
      // Validate user has wallet
      const wallet = await WalletService.getWallet();
      if (!wallet) {
        return {
          success: false,
          error: 'User wallet not found'
        };
      }

      const response = await this.makeAuthenticatedRequest('/nfts/collection/create', 'POST', request);
      
      if (response.success) {
        // Update user's asset count
        const userProfile = await UserService.getUserProfile();
        if (userProfile) {
          await UserService.updateUserProfile({
            assetCount: (userProfile.assetCount || 0) + 1,
            lastBlockchainActivity: new Date().toISOString()
          });
        }

        return {
          success: true,
          tokenId: response.tokenId,
          transactionId: response.transactionId
        };
      } else {
        return {
          success: false,
          error: response.error || 'NFT collection creation failed'
        };
      }
    } catch (error) {
      console.error('Error creating NFT collection:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Mint an NFT
   */
  static async mintNft(request: NftMintRequest): Promise<NftMintResponse> {
    try {
      // Validate user has wallet
      const wallet = await WalletService.getWallet();
      if (!wallet) {
        return {
          success: false,
          error: 'User wallet not found'
        };
      }

      const response = await this.makeAuthenticatedRequest('/nfts/mint', 'POST', request);
      
      if (response.success) {
        // Update user's asset count
        const userProfile = await UserService.getUserProfile();
        if (userProfile) {
          await UserService.updateUserProfile({
            assetCount: (userProfile.assetCount || 0) + 1,
            lastBlockchainActivity: new Date().toISOString()
          });
        }

        return {
          success: true,
          nftId: response.nftId,
          serialNumber: response.serialNumber,
          transactionId: response.transactionId
        };
      } else {
        return {
          success: false,
          error: response.error || 'NFT minting failed'
        };
      }
    } catch (error) {
      console.error('Error minting NFT:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get NFT information
   */
  static async getNftInfo(nftId: string): Promise<NftInfo | null> {
    try {
      const response = await this.makeAuthenticatedRequest(`/nfts/${nftId}`, 'GET');
      
      if (response.success && response.nft) {
        return response.nft;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching NFT info:', error);
      return null;
    }
  }

  /**
   * Get user's NFT collections
   */
  static async getUserNftCollections(): Promise<NftInfo[]> {
    try {
      const response = await this.makeAuthenticatedRequest('/nfts/collections', 'GET');
      
      if (response.success && response.collections) {
        return response.collections;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching user NFT collections:', error);
      return [];
    }
  }

  // =======================
  // SMART CONTRACT OPERATIONS
  // =======================

  /**
   * Deploy a smart contract
   */
  static async deployContract(request: ContractDeployRequest): Promise<ContractDeployResponse> {
    try {
      // Validate user has wallet
      const wallet = await WalletService.getWallet();
      if (!wallet) {
        return {
          success: false,
          error: 'User wallet not found'
        };
      }

      const response = await this.makeAuthenticatedRequest('/contracts/deploy', 'POST', request);
      
      if (response.success) {
        // Update user's asset count
        const userProfile = await UserService.getUserProfile();
        if (userProfile) {
          await UserService.updateUserProfile({
            assetCount: (userProfile.assetCount || 0) + 1,
            lastBlockchainActivity: new Date().toISOString()
          });
        }

        return {
          success: true,
          contractId: response.contractId,
          transactionId: response.transactionId
        };
      } else {
        return {
          success: false,
          error: response.error || 'Contract deployment failed'
        };
      }
    } catch (error) {
      console.error('Error deploying contract:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get contract information
   */
  static async getContractInfo(contractId: string): Promise<ContractInfo | null> {
    try {
      const response = await this.makeAuthenticatedRequest(`/contracts/${contractId}`, 'GET');
      
      if (response.success && response.contract) {
        return response.contract;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching contract info:', error);
      return null;
    }
  }

  /**
   * Get user's deployed contracts
   */
  static async getUserContracts(): Promise<ContractInfo[]> {
    try {
      const response = await this.makeAuthenticatedRequest('/contracts', 'GET');
      
      if (response.success && response.contracts) {
        return response.contracts;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching user contracts:', error);
      return [];
    }
  }

  // =======================
  // TRANSACTION HISTORY
  // =======================

  /**
   * Get transaction history for user's account
   */
  static async getTransactionHistory(limit: number = 25): Promise<TransactionHistory[]> {
    try {
      const wallet = await WalletService.getWallet();
      if (!wallet) {
        return [];
      }

      const response = await this.makeAuthenticatedRequest(
        `/transactions/history?limit=${limit}`,
        'GET'
      );
      
      if (response.success && response.transactions) {
        return response.transactions;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  }

  /**
   * Get transaction details
   */
  static async getTransactionDetails(transactionId: string): Promise<TransactionHistory | null> {
    try {
      const response = await this.makeAuthenticatedRequest(
        `/transactions/${transactionId}`,
        'GET'
      );
      
      if (response.success && response.transaction) {
        return response.transaction;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      return null;
    }
  }

  // =======================
  // UTILITY METHODS
  // =======================

  /**
   * Make authenticated request to blockchain API
   */
  private static async makeAuthenticatedRequest(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    body?: any
  ): Promise<any> {
    try {
      // Get user's auth token
      const userProfile = await UserService.getUserProfile();
      if (!userProfile) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${this.API_BASE_URL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header when available
          // 'Authorization': `Bearer ${token}`,
        },
        body: body ? JSON.stringify(body) : undefined
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  /**
   * Format HBAR amount for display
   */
  static formatHbarAmount(amount: number, decimals: number = 8): string {
    return amount.toFixed(decimals).replace(/\.?0+$/, '') + ' ℏ';
  }

  /**
   * Format token amount for display
   */
  static formatTokenAmount(amount: number, decimals: number = 8, symbol: string = ''): string {
    const formatted = amount.toFixed(decimals).replace(/\.?0+$/, '');
    return symbol ? `${formatted} ${symbol}` : formatted;
  }

  /**
   * Format account ID for display (shortened)
   */
  static formatAccountId(accountId: string): string {
    if (accountId.length <= 12) return accountId;
    return `${accountId.substring(0, 6)}...${accountId.substring(accountId.length - 6)}`;
  }

  /**
   * Format transaction ID for display (shortened)
   */
  static formatTransactionId(transactionId: string): string {
    if (transactionId.length <= 16) return transactionId;
    return `${transactionId.substring(0, 8)}...${transactionId.substring(transactionId.length - 8)}`;
  }

  /**
   * Get network explorer URL for transaction
   */
  static getTransactionExplorerUrl(transactionId: string): string {
    const network = WalletService.getNetworkInfo();
    const baseUrl = network.mirrorNodeUrl.replace('/api/v1', '');
    return `${baseUrl}/transaction/${transactionId}`;
  }

  /**
   * Get network explorer URL for account
   */
  static getAccountExplorerUrl(accountId: string): string {
    const network = WalletService.getNetworkInfo();
    const baseUrl = network.mirrorNodeUrl.replace('/api/v1', '');
    return `${baseUrl}/account/${accountId}`;
  }

  /**
   * Get network explorer URL for token
   */
  static getTokenExplorerUrl(tokenId: string): string {
    const network = WalletService.getNetworkInfo();
    const baseUrl = network.mirrorNodeUrl.replace('/api/v1', '');
    return `${baseUrl}/token/${tokenId}`;
  }

  /**
   * Validate token ID format
   */
  static validateTokenId(tokenId: string): boolean {
    // Hedera token ID format: shard.realm.num (e.g., 0.0.123456)
    const pattern = /^\d+\.\d+\.\d+$/;
    return pattern.test(tokenId);
  }

  /**
   * Validate contract ID format
   */
  static validateContractId(contractId: string): boolean {
    // Hedera contract ID format: shard.realm.num (e.g., 0.0.123456)
    const pattern = /^\d+\.\d+\.\d+$/;
    return pattern.test(contractId);
  }

  /**
   * Convert tinybars to HBAR
   */
  static tinybarsToHbar(tinybars: number): number {
    return tinybars / 100000000; // 1 HBAR = 100,000,000 tinybars
  }

  /**
   * Convert HBAR to tinybars
   */
  static hbarToTinybars(hbar: number): number {
    return Math.floor(hbar * 100000000);
  }

  /**
   * Get transaction status color for UI
   */
  static getTransactionStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'success':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'pending':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  }

  /**
   * Get transaction type icon for UI
   */
  static getTransactionTypeIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'cryptotransfer':
        return '💸';
      case 'tokencreate':
        return '🪙';
      case 'tokenmint':
        return '🖨️';
      case 'contractcreate':
        return '📋';
      case 'accountcreate':
        return '👤';
      default:
        return '🔗';
    }
  }
}