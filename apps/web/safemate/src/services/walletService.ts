import { hederaConfig } from '../amplify-config';
import { UserService } from './userService';
import { TokenService } from './tokenService';
import type {
  HederaWallet,
  WalletMetadata,
  WalletCreationRequest,
  WalletCreationResponse,
  WalletCreationStatus,
  WalletCreationState,
  HederaTransaction,
  WalletBalance,
  WalletOperationResult
} from '../types/wallet';

export class WalletService {
  private static readonly API_BASE_URL = (import.meta as any).env.VITE_WALLET_API_URL || '';
  private static readonly NETWORK = hederaConfig.currentNetwork as 'testnet' | 'mainnet';
  private static readonly MIRROR_NODE_URL = hederaConfig.network[hederaConfig.currentNetwork as 'testnet' | 'mainnet'].mirrorNodeUrl;

  /**
   * Check if user has a Hedera wallet
   */
  static async hasWallet(): Promise<boolean> {
    try {
      const wallet = await this.getWallet();
      return wallet !== null;
    } catch (error) {
      console.error('Error checking wallet existence:', error);
      return false;
    }
  }

  /**
   * Get user's wallet information
   */
  static async getWallet(): Promise<HederaWallet | null> {
    try {
      const response = await this.makeAuthenticatedRequest('/wallet', 'GET');
      
      if (response.success && response.wallet) {
        return this.transformWalletMetadata(response.wallet);
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching wallet:', error);
      return null;
    }
  }

  /**
   * Create a new Hedera wallet for the user
   */
  static async createWallet(
    request: WalletCreationRequest = {},
    onStatusUpdate?: (status: WalletCreationStatus) => void
  ): Promise<WalletCreationResponse> {
    try {
      // Update status: Starting
      onStatusUpdate?.({
        state: 'creating',
        progress: 10,
        message: 'Initializing wallet creation...'
      });

      // Check if user already has a wallet
      const existingWallet = await this.getWallet();
      if (existingWallet) {
        return {
          success: false,
          wallet: {
            accountId: existingWallet.accountId,
            publicKey: existingWallet.publicKey,
            balance: existingWallet.balance
          },
          error: 'User already has a wallet'
        };
      }

      // Update status: Creating account
      onStatusUpdate?.({
        state: 'creating',
        progress: 30,
        message: 'Creating Hedera account...'
      });

      const response = await this.makeAuthenticatedRequest('/wallet/create', 'POST', request);

      if (response.success) {
        // Update status: Updating profile
        onStatusUpdate?.({
          state: 'creating',
          progress: 70,
          message: 'Updating user profile...'
        });

        // Update user's Cognito attributes
        await UserService.updateUserProfile({
          hederaAccountId: response.wallet.accountId,
          lastBlockchainActivity: new Date().toISOString()
        });

        // Update status: Complete
        onStatusUpdate?.({
          state: 'success',
          progress: 100,
          message: 'Wallet created successfully!'
        });

        return response;
      } else {
        onStatusUpdate?.({
          state: 'error',
          progress: 0,
          message: 'Failed to create wallet',
          error: response.error
        });

        return response;
      }
    } catch (error) {
      console.error('Error creating wallet:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      onStatusUpdate?.({
        state: 'error',
        progress: 0,
        message: 'Failed to create wallet',
        error: errorMessage
      });

      return {
        success: false,
        wallet: {
          accountId: '',
          publicKey: '',
          balance: 0
        },
        error: errorMessage
      };
    }
  }

  /**
   * Get wallet balance from Hedera Mirror Node
   */
  static async getWalletBalance(accountId: string): Promise<WalletBalance | null> {
    try {
      const response = await fetch(
        `${this.MIRROR_NODE_URL}/accounts/${accountId}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Mirror node request failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Convert from tinybars to HBAR (1 HBAR = 100,000,000 tinybars)
      const hbarBalance = data.balance ? data.balance.balance / 100000000 : 0;

      return {
        hbar: hbarBalance,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      return null;
    }
  }

  /**
   * Get wallet transactions from Hedera Mirror Node
   */
  static async getWalletTransactions(
    accountId: string,
    limit: number = 25
  ): Promise<HederaTransaction[]> {
    try {
      const response = await fetch(
        `${this.MIRROR_NODE_URL}/transactions?account.id=${accountId}&limit=${limit}&order=desc`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Mirror node request failed: ${response.status}`);
      }

      const data = await response.json();
      
      return data.transactions?.map((tx: any) => this.transformTransaction(tx)) || [];
    } catch (error) {
      console.error('Error fetching wallet transactions:', error);
      return [];
    }
  }

  /**
   * Refresh wallet information and update user profile
   */
  static async refreshWallet(): Promise<HederaWallet | null> {
    try {
      const wallet = await this.getWallet();
      if (!wallet) return null;

      // Get latest balance
      const balance = await this.getWalletBalance(wallet.accountId);
      
      if (balance) {
        wallet.balance = balance.hbar;
        wallet.lastActivity = balance.lastUpdated;

        // Update user profile with latest activity
        await UserService.updateUserProfile({
          lastBlockchainActivity: balance.lastUpdated
        });
      }

      return wallet;
    } catch (error) {
      console.error('Error refreshing wallet:', error);
      return null;
    }
  }

  /**
   * Initialize wallet for first-time users
   */
  static async initializeWalletForUser(): Promise<WalletOperationResult> {
    try {
      // Check if user already has a wallet
      const existingWallet = await this.getWallet();
      if (existingWallet) {
        return {
          success: true,
          data: existingWallet
        };
      }

      // Create a new wallet
      const result = await this.createWallet({ initialBalance: 1 });
      
      return {
        success: result.success,
        data: result.wallet,
        error: result.error
      };
    } catch (error) {
      console.error('Error initializing wallet:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get network information
   */
  static getNetworkInfo() {
    return hederaConfig.network[this.NETWORK as 'testnet' | 'mainnet'];
  }

  /**
   * Make authenticated request to wallet API
   */
  private static async makeAuthenticatedRequest(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    body?: any
  ): Promise<any> {
    try {
      // Get user's auth token with automatic refresh
      const token = await TokenService.getValidAccessToken();
      if (!token) {
        throw new Error('User not authenticated or token refresh failed');
      }

      console.log(`🔍 WalletService: Making ${method} request to ${endpoint}`);

      const response = await fetch(`${this.API_BASE_URL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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
   * Transform wallet metadata from API response
   */
  private static transformWalletMetadata(metadata: WalletMetadata): HederaWallet {
    return {
      accountId: metadata.hederaAccountId,
      publicKey: metadata.publicKey,
      balance: metadata.balance,
      walletId: metadata.walletId,
      status: metadata.status,
      createdAt: metadata.createdAt,
      lastActivity: metadata.lastActivity
    };
  }

  /**
   * Transform transaction data from Hedera Mirror Node
   */
  private static transformTransaction(tx: any): HederaTransaction {
    return {
      id: tx.transaction_id,
      type: tx.name || 'UNKNOWN',
      from: tx.entity_id || '',
      to: tx.transfers?.[0]?.account || '',
      amount: tx.transfers?.[0]?.amount ? Math.abs(tx.transfers[0].amount) / 100000000 : 0,
      fee: tx.charged_tx_fee ? tx.charged_tx_fee / 100000000 : 0,
      timestamp: tx.consensus_timestamp,
      status: tx.result === 'SUCCESS' ? 'SUCCESS' : 'FAILED',
      memo: tx.memo_base64 ? atob(tx.memo_base64) : undefined
    };
  }

  /**
   * Format HBAR amount for display
   */
  static formatHbarAmount(amount: number, decimals: number = 8): string {
    return amount.toFixed(decimals).replace(/\.?0+$/, '') + ' ℏ';
  }

  /**
   * Format account ID for display (shortened)
   */
  static formatAccountId(accountId: string): string {
    if (accountId.length <= 12) return accountId;
    return `${accountId.substring(0, 6)}...${accountId.substring(accountId.length - 6)}`;
  }

  /**
   * Validate Hedera account ID format
   */
  static validateAccountId(accountId: string): boolean {
    // Hedera account ID format: shard.realm.num (e.g., 0.0.123456)
    const pattern = /^\d+\.\d+\.\d+$/;
    return pattern.test(accountId);
  }
}