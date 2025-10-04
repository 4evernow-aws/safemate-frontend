import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import hederaApiService, { FolderMetadata, ApiResponse } from '../services/HederaApiService';

interface HederaContextType {
  // State
  folders: FolderMetadata[];
  loading: boolean;
  error: string | null;
  authToken: string | null;
  
  // Actions
  setAuthToken: (token: string) => void;
  refreshFolders: () => Promise<void>;
  createFolder: (name: string, parentFolderId?: string) => Promise<ApiResponse<FolderMetadata>>;
  createRootFolder: (name: string) => Promise<ApiResponse<FolderMetadata>>;
  createSubfolder: (name: string, parentFolderId: string) => Promise<ApiResponse<FolderMetadata>>;
  updateFolder: (folderId: string, updates: Partial<FolderMetadata>) => Promise<ApiResponse<FolderMetadata>>;
  deleteFolder: (folderId: string) => Promise<ApiResponse<void>>;
  shareFolder: (folderId: string) => Promise<ApiResponse<{ shareLink: string }>>;
  searchFolders: (query: string) => Promise<ApiResponse<FolderMetadata[]>>;
  getFolderStats: () => Promise<ApiResponse<any>>;
  
  // Utility functions
  getFolderById: (folderId: string) => FolderMetadata | undefined;
  getFolderPath: (folder: FolderMetadata) => string;
  hasPermission: (folder: FolderMetadata, permission: 'owner' | 'editor' | 'viewer') => boolean;
  formatFileSize: (bytes: number) => string;
  formatDate: (dateString: string) => string;
}

const HederaContext = createContext<HederaContextType | undefined>(undefined);

interface HederaProviderProps {
  children: ReactNode;
}

export const HederaProvider: React.FC<HederaProviderProps> = ({ children }) => {
  const [folders, setFolders] = useState<FolderMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthTokenState] = useState<string | null>(null);

  // Set auth token and update API service
  const setAuthToken = (token: string) => {
    setAuthTokenState(token);
    hederaApiService.setAuthToken(token);
    localStorage.setItem('safemate_auth_token', token);
  };

  // Load auth token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('safemate_auth_token');
    if (savedToken) {
      setAuthToken(savedToken);
    }
  }, []);

  // Refresh folders from API
  const refreshFolders = async () => {
    if (!authToken) {
      setError('Authentication required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await hederaApiService.listFolders();
      
      if (response.success && response.data) {
        setFolders(response.data);
      } else {
        setError(response.error || 'Failed to load folders');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh folders when auth token changes
  useEffect(() => {
    if (authToken) {
      refreshFolders();
    } else {
      setFolders([]);
    }
  }, [authToken]);

  // Create folder
  const createFolder = async (
    name: string,
    parentFolderId?: string
  ): Promise<ApiResponse<FolderMetadata>> => {
    if (!authToken) {
      return { success: false, error: 'Authentication required' };
    }

    try {
      const response = await hederaApiService.createFolder(name, parentFolderId);
      
      if (response.success && response.data) {
        // Refresh folders to get updated list
        await refreshFolders();
      }
      
      return response;
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }
  };

  // Create root folder
  const createRootFolder = async (name: string): Promise<ApiResponse<FolderMetadata>> => {
    return createFolder(name);
  };

  // Create subfolder
  const createSubfolder = async (
    name: string,
    parentFolderId: string
  ): Promise<ApiResponse<FolderMetadata>> => {
    return createFolder(name, parentFolderId);
  };

  // Update folder
  const updateFolder = async (
    folderId: string,
    updates: Partial<FolderMetadata>
  ): Promise<ApiResponse<FolderMetadata>> => {
    if (!authToken) {
      return { success: false, error: 'Authentication required' };
    }

    try {
      const response = await hederaApiService.updateFolder(folderId, updates);
      
      if (response.success && response.data) {
        // Update local state
        setFolders(prevFolders =>
          prevFolders.map(folder =>
            folder.id === folderId ? { ...folder, ...updates } : folder
          )
        );
      }
      
      return response;
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }
  };

  // Delete folder
  const deleteFolder = async (folderId: string): Promise<ApiResponse<void>> => {
    if (!authToken) {
      return { success: false, error: 'Authentication required' };
    }

    try {
      const response = await hederaApiService.deleteFolder(folderId);
      
      if (response.success) {
        // Remove from local state
        setFolders(prevFolders =>
          prevFolders.filter(folder => folder.id !== folderId)
        );
      }
      
      return response;
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }
  };

  // Share folder
  const shareFolder = async (folderId: string): Promise<ApiResponse<{ shareLink: string }>> => {
    if (!authToken) {
      return { success: false, error: 'Authentication required' };
    }

    try {
      return await hederaApiService.shareFolder(folderId, {
        isPublic: true
      });
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }
  };

  // Search folders
  const searchFolders = async (query: string): Promise<ApiResponse<FolderMetadata[]>> => {
    if (!authToken) {
      return { success: false, error: 'Authentication required' };
    }

    try {
      return await hederaApiService.searchFolders(query);
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }
  };

  // Get folder statistics
  const getFolderStats = async (): Promise<ApiResponse<any>> => {
    if (!authToken) {
      return { success: false, error: 'Authentication required' };
    }

    try {
      return await hederaApiService.getFolderStats();
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }
  };

  // Utility functions
  const getFolderById = (folderId: string): FolderMetadata | undefined => {
    return folders.find(folder => folder.id === folderId);
  };

  const getFolderPath = (folder: FolderMetadata): string => {
    return hederaApiService.getFolderPath(folder, folders);
  };

  const hasPermission = (
    folder: FolderMetadata,
    permission: 'owner' | 'editor' | 'viewer'
  ): boolean => {
    // For now, assume current user is the owner
    // In a real app, you'd get the current user ID from auth context
    const currentUserId = '0.0.6890393'; // This should come from auth context
    return hederaApiService.hasPermission(folder, currentUserId, permission);
  };

  const formatFileSize = (bytes: number): string => {
    return hederaApiService.formatFileSize(bytes);
  };

  const formatDate = (dateString: string): string => {
    return hederaApiService.formatDate(dateString);
  };

  const contextValue: HederaContextType = {
    // State
    folders,
    loading,
    error,
    authToken,
    
    // Actions
    setAuthToken,
    refreshFolders,
    createFolder,
    createRootFolder,
    createSubfolder,
    updateFolder,
    deleteFolder,
    shareFolder,
    searchFolders,
    getFolderStats,
    
    // Utility functions
    getFolderById,
    getFolderPath,
    hasPermission,
    formatFileSize,
    formatDate
  };

  return (
    <HederaContext.Provider value={contextValue}>
      {children}
    </HederaContext.Provider>
  );
};

// Custom hook to use Hedera context
export const useHedera = (): HederaContextType => {
  const context = useContext(HederaContext);
  if (context === undefined) {
    throw new Error('useHedera must be used within a HederaProvider');
  }
  return context;
};

export default HederaContext;
