// Real Hedera API Service - Connects to backend Lambda functions
import { fetchAuthSession } from 'aws-amplify/auth';
import { config, getApiUrl, getHederaApiUrl, getHederaMirrorUrl } from '../config/environment';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

interface HederaAccountInfo {
  accountId: string;
  balance: string;
  publicKey: string;
}

interface HederaFileInfo {
  fileId: string;
  name: string;
  size: number;
  createdAt: string;
  content?: Uint8Array;
}

interface HederaFolderInfo {
  id: string;
  name: string;
  files: HederaFileInfo[];
  hederaFileId: string;
  createdAt: string;
  updatedAt: string;
}

interface HederaTransaction {
  transactionId: string;
  status: string;
  timestamp: string;
}

interface HederaToken {
  tokenId: string;
  name: string;
  symbol: string;
  decimals: number;
  balance: number;
  tokenType: string;
  treasuryAccountId: string;
  createdAt: string;
}

export class HederaApiService {
  
  // =======================
  // AUTHENTICATION HELPERS
  // =======================
  
  private static async getAuthHeaders(): Promise<HeadersInit> {
    console.log('🔍 HederaAPI Debug: Getting auth headers...');
    
    const session = await fetchAuthSession();
    console.log('🔍 HederaAPI Debug: Session:', {
      tokens: session.tokens ? 'Present' : 'Missing',
      idToken: session.tokens?.idToken ? 'Present' : 'Missing'
    });
    
    const idToken = session.tokens?.idToken?.toString();
    
    if (!idToken) {
      console.log('❌ HederaAPI Debug: No ID token available');
      throw new Error('User not authenticated');
    }
    
    console.log('✅ HederaAPI Debug: ID token available');
    return {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    };
  }
  
  private static async makeApiRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = getApiUrl(endpoint);
      const response = await fetch(url, {
        ...options,
        headers: {
          ...await this.getAuthHeaders(),
          ...options.headers,
        },
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
  
  private static async makeHederaApiRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = getHederaApiUrl(endpoint);
      console.log('🔍 HederaApiService: Making request to:', url);
      console.log('🔍 HederaApiService: Request options:', options);
      
      const headers = await this.getAuthHeaders();
      console.log('🔍 HederaApiService: Auth headers:', headers);
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });
      
      console.log('🔍 HederaApiService: Response status:', response.status);
      console.log('🔍 HederaApiService: Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HederaApiService: Response error:', errorText);
        throw new Error(`Hedera API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('🔍 HederaApiService: Response data:', data);
      return data;
    } catch (error) {
      console.error(`❌ HederaApiService: Request failed for ${endpoint}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
  
  // =======================
  // WALLET MANAGEMENT
  // =======================
  
  /**
   * Check if user has a Hedera wallet
   */
  static async hasWallet(): Promise<boolean> {
    try {
      const response = await this.makeApiRequest<{ hasWallet: boolean }>('/wallet/check');
      return response.success && response.data?.hasWallet || false;
    } catch (error) {
      console.error('Error checking wallet:', error);
      return false;
    }
  }
  
  /**
   * Create a new Hedera wallet for the user
   */
  static async createWallet(): Promise<ApiResponse<HederaAccountInfo>> {
    return this.makeApiRequest<HederaAccountInfo>('/wallet/create', {
      method: 'POST',
    });
  }
  
  /**
   * Get user's wallet information
   */
  static async getWallet(): Promise<ApiResponse<HederaAccountInfo>> {
    return this.makeApiRequest<HederaAccountInfo>('/wallet');
  }
  
  /**
   * Get account balance from Hedera Mirror Node
   */
  static async getAccountBalance(accountId: string): Promise<ApiResponse<{ hbar: number; tokens: Record<string, number> }>> {
    try {
      // Strip alias- prefix if present
      const formattedAccountId = accountId.startsWith('alias-') ? accountId.replace('alias-', '') : accountId;
      const response = await fetch(getHederaMirrorUrl(`/accounts/${formattedAccountId}`));
      
      if (!response.ok) {
        throw new Error(`Mirror node request failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Convert tinybars to HBAR
      const hbarBalance = data.balance ? parseFloat(data.balance.balance) / 100000000 : 0;
      
      return {
        success: true,
        data: {
          hbar: hbarBalance,
          tokens: data.tokens || {}
        }
      };
    } catch (error) {
      console.error('Error fetching balance:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch balance'
      };
    }
  }

  /**
   * Get account tokens from Hedera Mirror Node
   */
  static async getAccountTokens(accountId: string): Promise<ApiResponse<HederaToken[]>> {
    try {
      // Strip alias- prefix if present
      const formattedAccountId = accountId.startsWith('alias-') ? accountId.replace('alias-', '') : accountId;
      const response = await fetch(getHederaMirrorUrl(`/accounts/${formattedAccountId}/tokens?limit=100&order=desc`));
      
      if (!response.ok) {
        throw new Error(`Mirror node request failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      const tokens: HederaToken[] = data.tokens?.map((token: any) => ({
        tokenId: token.token_id,
        name: token.name || 'Unknown Token',
        symbol: token.symbol || 'UNKNOWN',
        decimals: token.decimals || 0,
        balance: parseFloat(token.balance || '0'),
        tokenType: token.type || 'FUNGIBLE_COMMON',
        treasuryAccountId: token.treasury_account_id || '',
        createdAt: token.created_timestamp || ''
      })) || [];
      
      return {
        success: true,
        data: tokens
      };
    } catch (error) {
      console.error('Error fetching tokens:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch tokens'
      };
    }
  }
  
  // =======================
  // CREDENTIAL MANAGEMENT
  // =======================
  
  /**
   * Store user's Hedera credentials securely
   */
  static async storeCredentials(accountId: string, privateKey: string, network: 'testnet' | 'mainnet' = 'testnet'): Promise<ApiResponse> {
    return this.makeApiRequest('/vault/credentials', {
      method: 'PUT',
      body: JSON.stringify({
        accountId,
        privateKey,
        network
      }),
    });
  }
  
  /**
   * Retrieve user's Hedera credentials
   */
  static async getCredentials(): Promise<ApiResponse<{ accountId: string; privateKey: string; network: string }>> {
    return this.makeApiRequest('/vault/credentials');
  }
  
  /**
   * Delete user's stored credentials
   */
  static async deleteCredentials(): Promise<ApiResponse> {
    return this.makeApiRequest('/vault/credentials', {
      method: 'DELETE',
    });
  }
  
  // =======================
  // FILE OPERATIONS (BLOCKCHAIN)
  // =======================
  
  /**
   * Upload file to blockchain with folder support
   */
  static async uploadFile(
    fileData: {
      fileName: string;
      fileData: string; // base64 encoded
      fileSize: number;
      contentType: string;
      folderId?: string;
    },
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<{ fileId: string; transactionId: string }>> {
    // Simulate progress for now
    if (onProgress) {
      const progressInterval = setInterval(() => {
        // This would be replaced with actual progress tracking
        onProgress(Math.random() * 100);
      }, 100);
      
      setTimeout(() => clearInterval(progressInterval), 1000);
    }

    return this.makeHederaApiRequest('/files/upload', {
      method: 'POST',
      body: JSON.stringify(fileData),
    });
  }

  /**
   * Upload file from File object (convenience method)
   */
  static async uploadFileFromFile(
    file: File, 
    folderId?: string,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<{ fileId: string; transactionId: string }>> {
    try {
      // Convert file to base64 for API transfer
      const fileData = await this.fileToBase64(file);
      
      return this.uploadFile({
        fileName: file.name,
        fileData: fileData,
        fileSize: file.size,
        contentType: file.type,
        folderId: folderId || 'all-files'
      }, onProgress);
    } catch (error) {
      console.error('Error uploading file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }
  
  /**
   * Get file content from blockchain
   */
  static async getFileContent(fileId: string): Promise<ApiResponse<Uint8Array | string>> {
    return this.makeHederaApiRequest(`/files/${fileId}/content`);
  }
  
  /**
   * List user's files from blockchain
   */
  static async listFiles(): Promise<ApiResponse<HederaFileInfo[]>> {
    return this.makeHederaApiRequest<HederaFileInfo[]>('/files');
  }
  
  /**
   * Delete a file from blockchain
   */
  static async deleteFile(fileId: string): Promise<ApiResponse> {
    return this.makeHederaApiRequest(`/files/${fileId}`, {
      method: 'DELETE',
    });
  }
  
  // =======================
  // TOKEN OPERATIONS
  // =======================
  
  /**
   * Transfer HBAR to another account
   */
  static async transferHbar(
    toAccountId: string, 
    amount: number, 
    memo?: string
  ): Promise<ApiResponse<HederaTransaction>> {
    return this.makeApiRequest<HederaTransaction>('/transfers/hbar', {
      method: 'POST',
      body: JSON.stringify({
        toAccountId,
        amount,
        memo: memo || ''
      }),
    });
  }
  
  /**
   * Transfer tokens to another account
   */
  static async transferTokens(
    toAccountId: string, 
    tokenId: string, 
    amount: number
  ): Promise<ApiResponse<HederaTransaction>> {
    return this.makeApiRequest<HederaTransaction>('/transfers/tokens', {
      method: 'POST',
      body: JSON.stringify({
        toAccountId,
        tokenId,
        amount
      }),
    });
  }
  
  /**
   * Get token information
   */
  static async getTokenInfo(tokenId: string): Promise<ApiResponse<any>> {
    return this.makeApiRequest(`/tokens/${tokenId}`);
  }
  
  // =======================
  // ACCOUNT OPERATIONS
  // =======================
  
  /**
   * Get account information from Mirror Node
   */
  static async getAccountInfo(accountId: string): Promise<ApiResponse<any>> {
    try {
      // Strip alias- prefix if present
      const formattedAccountId = accountId.startsWith('alias-') ? accountId.replace('alias-', '') : accountId;
      const response = await fetch(getHederaMirrorUrl(`/accounts/${formattedAccountId}`));
      
      if (!response.ok) {
        if (response.status === 404) {
          return {
            success: false,
            error: 'Account not found'
          };
        }
        throw new Error(`Mirror node request failed: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error getting account info:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get account info'
      };
    }
  }
  
  /**
   * Get account transactions
   */
  static async getAccountTransactions(accountId: string, limit: number = 10): Promise<ApiResponse<any[]>> {
    try {
      // Use the Hedera API Gateway instead of mirror node
      const result = await this.makeHederaApiRequest<any[]>(`/transactions?accountId=${accountId}&limit=${limit}`);
      return result;
    } catch (error) {
      console.error('Error getting transactions:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get transactions'
      };
    }
  }
  
  // =======================
  // FOLDER MANAGEMENT (BLOCKCHAIN)
  // =======================

  // =======================
  // FOLDER MANAGEMENT (BLOCKCHAIN)
  // =======================

  /**
   * List all folders from blockchain
   */
  static async listFolders(): Promise<ApiResponse<any[]>> {
    console.log('🔍 HederaApiService: Calling listFolders...');
    console.log('🔍 HederaApiService: Using endpoint: /folders');
    
    try {
      const result = await this.makeHederaApiRequest<any[]>('/folders');
      console.log('🔍 HederaApiService: listFolders result:', result);
      return result;
    } catch (error) {
      console.error('❌ HederaApiService: listFolders error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list folders'
      };
    }
  }

  /**
   * Create a new folder on blockchain
   */
  static async createFolder(name: string, parentFolderId?: string): Promise<ApiResponse<{
    folderId: string;
    name: string;
    parentFolderId?: string;
    hederaFileId: string;
    createdAt: string;
    transactionId: string;
  }>> {
    return this.makeHederaApiRequest('/folders', {
      method: 'POST',
      body: JSON.stringify({ name, parentFolderId }),
    });
  }

  /**
   * Delete a folder from blockchain
   */
  static async deleteFolder(folderId: string): Promise<ApiResponse<{ 
    message: string; 
    transactionId: string; 
  }>> {
    return this.makeHederaApiRequest(`/folders/${folderId}`, {
      method: 'DELETE',
    });
  }
  
  // =======================
  // UTILITY METHODS
  // =======================
  
  /**
   * Convert File to base64 string
   */
  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data:type/subtype;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }
  
  /**
   * Validate account ID format
   */
  static validateAccountId(accountId: string): boolean {
    // Hedera account ID format: x.y.z where x, y, z are numbers
    const regex = /^\d+\.\d+\.\d+$/;
    return regex.test(accountId);
  }
  
  /**
   * Format HBAR amount (convert tinybars to HBAR)
   */
  static formatHbarAmount(tinybars: number): string {
    return (tinybars / 100000000).toFixed(8);
  }
  
  /**
   * Parse HBAR amount (convert HBAR to tinybars)
   */
  static parseHbarAmount(hbar: string): number {
    return Math.floor(parseFloat(hbar) * 100000000);
  }
}

export default HederaApiService; 