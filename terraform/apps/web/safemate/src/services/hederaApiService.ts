import { fetchAuthSession } from 'aws-amplify/auth';
import type { HederaFolderInfo, HederaFileInfo, HederaTransaction, HederaAccountInfo } from '../types/hedera';

// Use the correct API Gateway URL for preprod environment
export class HederaApiService {
  private static readonly API_BASE_URL = 'https://uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com/preprod';

  /**
   * Get account transactions
   */
  static async getAccountTransactions(accountId: string, limit: number = 10): Promise<ApiResponse<HederaTransaction[]>> {
    console.log('🔍 HederaApiService: Getting account transactions for:', accountId);
    
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      const url = `${this.API_BASE_URL}/transactions?accountId=${accountId}&limit=${limit}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`⚠️ HederaApiService: Transactions endpoint not available (${response.status}): ${errorText}`);
        
        // Return empty transactions list instead of failing
        return {
          success: true,
          data: []
        };
      }

      const result = await response.json();
      console.log('✅ HederaApiService: Account transactions retrieved successfully:', result);
      
      // Fix the data mapping issue - ensure data is always an array
      if (result.success && result.data) {
        // If data is already an array, use it directly
        if (Array.isArray(result.data)) {
          return {
            success: true,
            data: result.data
          };
        }
        // If data is an object with transactions property, extract it
        else if (result.data.transactions && Array.isArray(result.data.transactions)) {
          return {
            success: true,
            data: result.data.transactions
          };
        }
        // If data is an object with a different structure, try to extract array
        else if (typeof result.data === 'object') {
          // Look for common array property names
          const possibleArrayProps = ['transactions', 'items', 'results', 'list'];
          for (const prop of possibleArrayProps) {
            if (result.data[prop] && Array.isArray(result.data[prop])) {
              return {
                success: true,
                data: result.data[prop]
              };
            }
          }
        }
      }
      
      // Fallback: return empty array if no valid data structure found
      console.warn('⚠️ HederaApiService: No valid transaction data found, returning empty array');
      return {
        success: true,
        data: []
      };
    } catch (error) {
      console.warn('⚠️ HederaApiService: Transactions endpoint not available, returning empty list:', error);
      return {
        success: true,
        data: []
      };
    }
  }

  /**
   * Get account balance
   */
  static async getAccountBalance(accountId: string): Promise<ApiResponse<{ balance: string }>> {
    console.log('🔍 HederaApiService: Getting account balance for:', accountId);
    
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      const url = `${this.API_BASE_URL}/balance?accountId=${accountId}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`⚠️ HederaApiService: Balance endpoint not available (${response.status}): ${errorText}`);
        
        return {
          success: false,
          error: `Balance endpoint not available: ${response.status}`
        };
      }

      const result = await response.json();
      console.log('✅ HederaApiService: Account balance retrieved successfully:', result);
      
      return result;
    } catch (error) {
      console.warn('⚠️ HederaApiService: Balance endpoint not available:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get account info
   */
  static async getAccountInfo(accountId: string): Promise<ApiResponse<HederaAccountInfo>> {
    console.log('🔍 HederaApiService: Getting account info for:', accountId);
    
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      const url = `${this.API_BASE_URL}/account-info?accountId=${accountId}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`⚠️ HederaApiService: Account info endpoint not available (${response.status}): ${errorText}`);
        
        return {
          success: false,
          error: `Account info endpoint not available: ${response.status}`
        };
      }

      const result = await response.json();
      console.log('✅ HederaApiService: Account info retrieved successfully:', result);
      
      return result;
    } catch (error) {
      console.warn('⚠️ HederaApiService: Account info endpoint not available:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get folders for an account
   */
  static async getFolders(accountId: string): Promise<ApiResponse<HederaFolderInfo[]>> {
    console.log('🔍 HederaApiService: Getting folders for account:', accountId);
    
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      const url = `${this.API_BASE_URL}/folders?accountId=${accountId}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`⚠️ HederaApiService: Folders endpoint not available (${response.status}): ${errorText}`);
        
        return {
          success: true,
          data: []
        };
      }

      const result = await response.json();
      console.log('✅ HederaApiService: Folders retrieved successfully:', result);
      
      // Transform the response to match expected format
      if (result.success && result.data && result.data.folders) {
        const transformedFolders: HederaFolderInfo[] = result.data.folders.map((folder: any) => ({
          id: folder.tokenId,
          name: folder.folderName,
          files: [],
          hederaFileId: folder.tokenId,
          createdAt: folder.createdAt,
          updatedAt: folder.createdAt
        }));
        
        return {
          success: true,
          data: transformedFolders
        };
      }
      
      return {
        success: true,
        data: []
      };
    } catch (error) {
      console.warn('⚠️ HederaApiService: Folders endpoint not available, returning empty list:', error);
      return {
        success: true,
        data: []
      };
    }
  }

  /**
   * Create a new folder
   */
  static async createFolder(accountId: string, folderName: string): Promise<ApiResponse<HederaFolderInfo>> {
    console.log('🔍 HederaApiService: Creating folder:', folderName, 'for account:', accountId);
    
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      const url = `${this.API_BASE_URL}/folders`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          accountId,
          folderName
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ HederaApiService: Failed to create folder (${response.status}): ${errorText}`);
        
        return {
          success: false,
          error: `Failed to create folder: ${response.status}`
        };
      }

      const result = await response.json();
      console.log('✅ HederaApiService: Folder created successfully:', result);
      
      return result;
    } catch (error) {
      console.error('❌ HederaApiService: Failed to create folder:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Upload a file to a folder
   */
  static async uploadFile(accountId: string, folderId: string, file: File): Promise<ApiResponse<HederaFileInfo>> {
    console.log('🔍 HederaApiService: Uploading file to folder:', folderId);
    
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('accountId', accountId);
      formData.append('folderId', folderId);

      const url = `${this.API_BASE_URL}/files`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ HederaApiService: Failed to upload file (${response.status}): ${errorText}`);
        
        return {
          success: false,
          error: `Failed to upload file: ${response.status}`
        };
      }

      const result = await response.json();
      console.log('✅ HederaApiService: File uploaded successfully:', result);
      
      return result;
    } catch (error) {
      console.error('❌ HederaApiService: Failed to upload file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get files in a folder
   */
  static async getFiles(accountId: string, folderId: string): Promise<ApiResponse<HederaFileInfo[]>> {
    console.log('🔍 HederaApiService: Getting files for folder:', folderId);
    
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      const url = `${this.API_BASE_URL}/files?accountId=${accountId}&folderId=${folderId}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`⚠️ HederaApiService: Files endpoint not available (${response.status}): ${errorText}`);
        
        return {
          success: true,
          data: []
        };
      }

      const result = await response.json();
      console.log('✅ HederaApiService: Files retrieved successfully:', result);
      
      return result;
    } catch (error) {
      console.warn('⚠️ HederaApiService: Files endpoint not available, returning empty list:', error);
      return {
        success: true,
        data: []
      };
    }
  }
}

// Type definitions
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
