// Hedera API Service for SafeMate v2
// Handles all folder management operations with the new NFT configuration

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface FolderMetadata {
  id: string;
  name: string;
  tokenId: string;
  serialNumber: number;
  parentFolderId: string | null;
  folderType: 'root' | 'subfolder' | 'nested_subfolder';
  path: string;
  depth: number;
  createdAt: string;
  updatedAt: string;
  description?: string;
  tags: string[];
  ui: {
    icon: string;
    color: string;
    sortOrder: number;
    isExpanded: boolean;
  };
  permissions: {
    owners: string[];
    editors: string[];
    viewers: string[];
    isPublic: boolean;
    shareLinks: any[];
  };
  fileSummary: {
    totalFiles: number;
    totalSize: number;
    fileTypes: Record<string, number>;
    lastModified: string;
  };
  version: string;
}

export interface CreateFolderRequest {
  name: string;
  parentFolderId?: string;
  description?: string;
  tags?: string[];
  ui?: {
    icon?: string;
    color?: string;
    sortOrder?: number;
    isExpanded?: boolean;
  };
  permissions?: {
    isPublic?: boolean;
  };
}

export interface UpdateFolderRequest {
  name?: string;
  description?: string;
  tags?: string[];
  ui?: {
    icon?: string;
    color?: string;
    sortOrder?: number;
    isExpanded?: boolean;
  };
  permissions?: {
    owners?: string[];
    editors?: string[];
    viewers?: string[];
    isPublic?: boolean;
  };
}

class HederaApiService {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string = 'https://uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com') {
    this.baseUrl = baseUrl;
  }

  // Set authentication token
  setAuthToken(token: string) {
    this.authToken = token;
  }

  // Get headers for API requests
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  // Make API request
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers
        }
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || `HTTP ${response.status}`,
          data: data
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ message: string; version: string }>> {
    return this.makeRequest('/health');
  }

  // List all folders with hierarchy
  async listFolders(): Promise<ApiResponse<FolderMetadata[]>> {
    return this.makeRequest('/folders');
  }

  // Get folder by ID
  async getFolder(folderId: string): Promise<ApiResponse<FolderMetadata>> {
    return this.makeRequest(`/folders/${folderId}`);
  }

  // Create new folder
  async createFolder(
    name: string,
    parentFolderId?: string,
    options?: Partial<CreateFolderRequest>
  ): Promise<ApiResponse<FolderMetadata>> {
    const requestBody: CreateFolderRequest = {
      name,
      parentFolderId,
      ...options
    };

    return this.makeRequest('/folders', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });
  }

  // Create root folder
  async createRootFolder(
    name: string,
    options?: Partial<CreateFolderRequest>
  ): Promise<ApiResponse<FolderMetadata>> {
    return this.createFolder(name, undefined, options);
  }

  // Create subfolder
  async createSubfolder(
    name: string,
    parentFolderId: string,
    options?: Partial<CreateFolderRequest>
  ): Promise<ApiResponse<FolderMetadata>> {
    return this.createFolder(name, parentFolderId, options);
  }

  // Update folder
  async updateFolder(
    folderId: string,
    updates: UpdateFolderRequest
  ): Promise<ApiResponse<FolderMetadata>> {
    return this.makeRequest(`/folders/${folderId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  // Delete folder
  async deleteFolder(folderId: string): Promise<ApiResponse<void>> {
    return this.makeRequest(`/folders/${folderId}`, {
      method: 'DELETE'
    });
  }

  // Create new collection token (admin function)
  async createCollectionToken(): Promise<ApiResponse<{ tokenId: string; message: string }>> {
    return this.makeRequest('/folders/create-collection', {
      method: 'POST'
    });
  }

  // Share folder
  async shareFolder(
    folderId: string,
    permissions: {
      viewers?: string[];
      editors?: string[];
      isPublic?: boolean;
    }
  ): Promise<ApiResponse<{ shareLink: string }>> {
    return this.makeRequest(`/folders/${folderId}/share`, {
      method: 'POST',
      body: JSON.stringify(permissions)
    });
  }

  // Get folder permissions
  async getFolderPermissions(folderId: string): Promise<ApiResponse<{
    owners: string[];
    editors: string[];
    viewers: string[];
    isPublic: boolean;
    shareLinks: any[];
  }>> {
    return this.makeRequest(`/folders/${folderId}/permissions`);
  }

  // Update folder permissions
  async updateFolderPermissions(
    folderId: string,
    permissions: {
      owners?: string[];
      editors?: string[];
      viewers?: string[];
      isPublic?: boolean;
    }
  ): Promise<ApiResponse<void>> {
    return this.makeRequest(`/folders/${folderId}/permissions`, {
      method: 'PUT',
      body: JSON.stringify(permissions)
    });
  }

  // Search folders
  async searchFolders(query: string): Promise<ApiResponse<FolderMetadata[]>> {
    return this.makeRequest(`/folders/search?q=${encodeURIComponent(query)}`);
  }

  // Get folder statistics
  async getFolderStats(): Promise<ApiResponse<{
    totalFolders: number;
    totalFiles: number;
    totalSize: number;
    rootFolders: number;
    subfolders: number;
  }>> {
    return this.makeRequest('/folders/stats');
  }

  // Bulk operations
  async bulkCreateFolders(
    folders: Array<{
      name: string;
      parentFolderId?: string;
      options?: Partial<CreateFolderRequest>;
    }>
  ): Promise<ApiResponse<FolderMetadata[]>> {
    return this.makeRequest('/folders/bulk', {
      method: 'POST',
      body: JSON.stringify({ folders })
    });
  }

  async bulkDeleteFolders(folderIds: string[]): Promise<ApiResponse<void>> {
    return this.makeRequest('/folders/bulk', {
      method: 'DELETE',
      body: JSON.stringify({ folderIds })
    });
  }

  // File operations (for future implementation)
  async uploadFile(
    folderId: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<{
    fileId: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
  }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folderId', folderId);

    try {
      const response = await fetch(`${this.baseUrl}/folders/${folderId}/files`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || `HTTP ${response.status}`
        };
      }

      return {
        success: true,
        data: data.data || data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  async listFiles(folderId: string): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    size: number;
    mimeType: string;
    uploadedAt: string;
    uploadedBy: string;
  }>>> {
    return this.makeRequest(`/folders/${folderId}/files`);
  }

  async deleteFile(folderId: string, fileId: string): Promise<ApiResponse<void>> {
    return this.makeRequest(`/folders/${folderId}/files/${fileId}`, {
      method: 'DELETE'
    });
  }

  // Utility methods
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Build folder hierarchy from flat list
  buildFolderHierarchy(folders: FolderMetadata[]): FolderMetadata[] {
    const folderMap = new Map<string, FolderMetadata & { subfolders: FolderMetadata[] }>();
    const rootFolders: (FolderMetadata & { subfolders: FolderMetadata[] })[] = [];

    // Create map of all folders with empty subfolders array
    folders.forEach(folder => {
      folderMap.set(folder.id, { ...folder, subfolders: [] });
    });

    // Build hierarchy
    folders.forEach(folder => {
      if (folder.parentFolderId) {
        const parent = folderMap.get(folder.parentFolderId);
        if (parent) {
          parent.subfolders.push(folderMap.get(folder.id)!);
        }
      } else {
        rootFolders.push(folderMap.get(folder.id)!);
      }
    });

    return rootFolders;
  }

  // Get folder path as string
  getFolderPath(folder: FolderMetadata, allFolders: FolderMetadata[]): string {
    if (!folder.parentFolderId) {
      return folder.name;
    }

    const parent = allFolders.find(f => f.id === folder.parentFolderId);
    if (!parent) {
      return folder.name;
    }

    return `${this.getFolderPath(parent, allFolders)}/${folder.name}`;
  }

  // Check if user has permission for folder
  hasPermission(
    folder: FolderMetadata,
    userId: string,
    permission: 'owner' | 'editor' | 'viewer'
  ): boolean {
    if (folder.permissions.isPublic && permission === 'viewer') {
      return true;
    }

    switch (permission) {
      case 'owner':
        return folder.permissions.owners.includes(userId);
      case 'editor':
        return folder.permissions.owners.includes(userId) || 
               folder.permissions.editors.includes(userId);
      case 'viewer':
        return folder.permissions.owners.includes(userId) || 
               folder.permissions.editors.includes(userId) || 
               folder.permissions.viewers.includes(userId);
      default:
        return false;
    }
  }
}

// Create singleton instance
const hederaApiService = new HederaApiService();

export default hederaApiService;
export { HederaApiService };
