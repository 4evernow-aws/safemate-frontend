import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { HederaApiService } from '../services/hederaApiService';
import { SecureWalletService } from '../services/secureWalletService';
import { TokenService } from '../services/tokenService';
import type { SecureWalletInfo } from '../services/secureWalletService';
import { config } from '../config/environment';
import { useUser } from './UserContext';

interface HederaFile {
  id: string;
  name: string;
  size: number;
  createdAt: Date;
  content?: Uint8Array;
}

interface HederaFolder {
  id: string;
  name: string;
  files: HederaFile[];
  subfolders?: HederaFolder[];
  parentFolderId?: string;
  hederaFileId?: string; // Blockchain file ID
  createdAt?: string;
  updatedAt?: string;
}

interface HederaAccount {
  accountId: string;
  balance: string;
  publicKey: string;
  mateBalance?: string;
  network: 'testnet' | 'mainnet';
  security?: 'kms-enhanced';
  encryptionInfo?: {
    kmsKeyId: string;
    secretName: string;
  };
}

interface HederaContextType {
  account: HederaAccount | null;
  folders: HederaFolder[];
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  initializeWithUserCredentials: (accountId: string, privateKey: string, network?: 'testnet' | 'mainnet') => Promise<void>;
  initializeAfterOnboarding: () => Promise<void>;
  checkHederaConnection: (onboardingStatus?: any) => Promise<{ success: boolean; error?: string }>;
  disconnect: () => void;
  createFolder: (name: string, parentFolderId?: string) => Promise<string>;
  uploadFile: (folderId: string, file: File, onProgress?: (progress: number) => void) => Promise<string>;
  getFileContent: (fileId: string) => Promise<Uint8Array>;
  refreshFolders: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  forceInitialize: () => Promise<boolean>;
}

const HederaContext = createContext<HederaContextType | undefined>(undefined);

interface HederaProviderProps {
  children: React.ReactNode;
}

export function HederaProvider({ children }: HederaProviderProps) {
  const { user } = useUser();
  const [account, setAccount] = useState<HederaAccount | null>(null);
  const [folders, setFolders] = useState<HederaFolder[]>([]);
  const [userFiles, setUserFiles] = useState<HederaFile[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedInitialization, setHasAttemptedInitialization] = useState(false);

  // Check if we're in demo mode
  const isDemoMode = config.isDemoMode;

  // Log when user state changes
  useEffect(() => {
    if (user) {
      console.log('✅ HederaContext: User available from UserContext');
    } else {
      // HederaContext logging disabled for cleaner console
    }
  }, [user]);

  // Auto-initialize when user is available (but only if not in onboarding flow)
  useEffect(() => {
    if (user && !isDemoMode && !isInitialized && !isLoading && !hasAttemptedInitialization) {
      console.log('🔄 Auto-initializing Hedera context for authenticated user');
      setHasAttemptedInitialization(true);
      
      // Check if user already has a wallet and initialize if they do
      const checkAndInitialize = async () => {
        try {
          const hasWallet = await SecureWalletService.hasSecureWallet();
          if (hasWallet) {
            console.log('✅ User has existing wallet, initializing Hedera context');
            await initializeFromOnboarding();
          } else {
            console.log('⏸️ No existing wallet found, skipping auto-initialization to allow onboarding flow');
            setIsInitialized(true); // Mark as initialized to prevent infinite loops
          }
        } catch (error) {
          console.error('❌ Error checking wallet status:', error);
          setIsInitialized(true); // Mark as initialized to prevent infinite loops
        }
      };
      
      checkAndInitialize();
    }
  }, [user, isDemoMode, isInitialized, isLoading, hasAttemptedInitialization]);

  // Demo mode initialization
  useEffect(() => {
    if (isDemoMode && !isInitialized) {
      console.log('🎭 Initializing demo mode');
      initializeDemoMode();
    }
  }, [isDemoMode]);

  const initializeDemoMode = () => {
    // Set mock account data
    setAccount({
      accountId: '0.0.123456',
      balance: '42.5',
      publicKey: '302a300506032b657003210000112233445566778899aabbccddeeff00112233445566778899aabbccddeeff',
      network: 'testnet'
    });

    // Set mock folders with files
    setFolders([
      {
        id: 'folder-1',
        name: 'Documents',
        files: [
          {
            id: '0.0.789101',
            name: 'Project_Proposal.pdf',
            size: 2458624,
            createdAt: new Date('2024-01-15')
          },
          {
            id: '0.0.789102', 
            name: 'Meeting_Notes.docx',
            size: 45821,
            createdAt: new Date('2024-01-20')
          }
        ]
      },
      {
        id: 'folder-2',
        name: 'Images',
        files: [
          {
            id: '0.0.789103',
            name: 'Logo_Design.png',
            size: 1024768,
            createdAt: new Date('2024-01-10')
          }
        ]
      },
      {
        id: 'folder-3',
        name: 'Contracts',
        files: [
          {
            id: '0.0.789104',
            name: 'Service_Agreement.pdf',
            size: 892456,
            createdAt: new Date('2024-01-25')
          }
        ]
      }
    ]);

    setIsInitialized(true);
    setError(null);
  };

  const initializeFromOnboarding = async () => {
    if (!user) {
      console.log('❌ No user available for secure wallet initialization');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('🔄 Initializing Hedera context with secure wallet service...');

      // Check if user has a secure wallet
      const hasSecureWallet = await SecureWalletService.hasSecureWallet();
      
      if (hasSecureWallet) {
        console.log('✅ Found existing secure wallet');
        
        // Get secure wallet information
        const secureWallet = await SecureWalletService.getSecureWallet();
        
        if (secureWallet) {
          console.log('✅ Secure wallet details:', secureWallet.accountAlias);
          
          // Initialize with the secure account
          setAccount({
            accountId: secureWallet.accountAlias,
            balance: '0', // Will be updated by refreshBalance
            publicKey: secureWallet.publicKey,
            network: 'testnet',
            security: 'kms-enhanced',
            encryptionInfo: secureWallet.encryptionInfo
          });
          
          setIsInitialized(true);
          
          // Load user data and refresh balance
          await loadUserData();
          await refreshBalance();
        }
      } else {
        console.log('ℹ️ No secure wallet found, user needs to create one');
        setError('Please create a secure wallet in your profile');
        setIsInitialized(true); // Mark as initialized but without account
      }
    } catch (error) {
      console.error('❌ Error initializing with secure wallet:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize secure wallet');
      setIsInitialized(true); // Mark as initialized even if failed, to avoid infinite loops
    } finally {
      setIsLoading(false);
    }
  };

  const initializeWithUserCredentials = async (
    userAccountId: string, 
    userPrivateKey: string, 
    networkType: 'testnet' | 'mainnet' = 'testnet'
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🚀 Initializing Hedera with user credentials');
      
      // Set account information
      setAccount({
        accountId: userAccountId,
        balance: '0.0', // Will be updated by loadUserData
        publicKey: '', // Will be derived from private key if needed
        network: networkType
      });

      // Load user's blockchain data
      await loadUserData();
      
      setIsInitialized(true);
      console.log('✅ Hedera initialization completed');
    } catch (err) {
      console.error('❌ Failed to initialize Hedera:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize');
      setAccount(null);
    } finally {
      setIsLoading(false);
    }
  };

  const forceInitialize = async () => {
    if (!user) {
      console.log('❌ No user available for force initialization');
      return false;
    }

    try {
      console.log('🔄 Force initializing Hedera context...');
      setIsLoading(true);
      setError(null);
      
      // Check if user has a secure wallet
      const hasSecureWallet = await SecureWalletService.hasSecureWallet();
      
      if (hasSecureWallet) {
        console.log('✅ User has existing wallet, initializing Hedera context');
        await initializeFromOnboarding();
        return true;
      } else {
        console.log('ℹ️ No existing wallet found');
        setIsInitialized(true);
        return false;
      }
    } catch (error) {
      console.error('❌ Error during force initialization:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize');
      setIsInitialized(true);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const initializeAfterOnboarding = async () => {
    console.log('🔄 Initializing Hedera context after onboarding completion');
    
    // Add a small delay to allow the Lambda to process the wallet creation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Try to initialize with retries
    let retries = 3;
    while (retries > 0) {
      try {
        await initializeFromOnboarding();
        
        // Check if we successfully got a wallet
        const hasWallet = await SecureWalletService.hasSecureWallet();
        if (hasWallet) {
          console.log('✅ Successfully initialized Hedera context after onboarding');
          return;
        }
        
        console.log(`⚠️ Wallet not found yet, retrying... (${retries} attempts left)`);
        retries--;
        
        if (retries > 0) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error('❌ Error during initialization retry:', error);
        retries--;
        
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    console.log('⚠️ Failed to initialize Hedera context after onboarding after all retries');
  };

  const checkHederaConnection = async (onboardingStatus?: any): Promise<{ success: boolean; error?: string }> => {
    console.log('🔍 Hedera Debug: Starting checkHederaConnection');
    
    if (isDemoMode) {
      console.log('🎭 Demo mode - simulating successful connection');
      return { success: true };
    }

    try {
      setIsLoading(true);
      setError(null);

      if (!user) {
        const errorMsg = 'User not authenticated';
        console.log('❌ Hedera Debug: No authenticated user');
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      console.log('🔍 Hedera Debug: User authenticated, checking onboarding status');
      
      if (!onboardingStatus) {
        const errorMsg = 'No onboarding status provided';
        console.log('❌ Hedera Debug: No onboarding status');
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      if (onboardingStatus.onboardingStatus !== 'completed') {
        const errorMsg = 'User onboarding not completed';
        console.log('❌ Hedera Debug: Onboarding not completed');
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      if (!onboardingStatus.hederaAccountId) {
        const errorMsg = 'No Hedera account ID found';
        console.log('❌ Hedera Debug: No Hedera account ID');
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      console.log('✅ Hedera Debug: Setting up account from onboarding data');
      
      // Set up account from onboarding data
      setAccount({
        accountId: onboardingStatus.hederaAccountId,
        balance: '0.0', // Will be loaded from blockchain
        publicKey: '',
        network: 'testnet'
      });

      // Load user's folders and files from blockchain
      await loadUserData();
      
      setIsInitialized(true);
      console.log('✅ Hedera connection established successfully');
      
      return { success: true };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to connect to Hedera';
      console.error('❌ Hedera connection failed:', err);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    console.log('🔌 Disconnecting from Hedera');
    setAccount(null);
    setFolders([]);
    setUserFiles([]);
    setIsInitialized(false);
    setError(null);
  };

  const loadUserData = async () => {
    if (!user) {
      console.log('❌ No user available for loading data');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('🔄 Loading user data from blockchain...');
      
      // Load folders from blockchain API
      console.log('📁 Calling listFolders API...');
      const foldersResult = await HederaApiService.listFolders();
      console.log('📁 listFolders API response:', foldersResult);
      
      if (foldersResult.success && foldersResult.data?.folders) {
        console.log('✅ Folders API call successful, data:', foldersResult.data.folders);
        // Recursively transform the hierarchical folder structure
        const transformFolder = (folder: any): HederaFolder => ({
          id: folder.tokenId || folder.id,
          name: folder.folderName || folder.name,
          files: folder.files?.map((file: any) => ({
            id: file.id,
            name: file.name,
            size: file.size,
            createdAt: new Date(file.createdAt)
          })) || [],
          subfolders: folder.subfolders?.map(transformFolder) || [],
          parentFolderId: folder.parentFolderId,
          hederaFileId: folder.tokenId || folder.hederaFileId,
          createdAt: folder.createdAt,
          updatedAt: folder.updatedAt
        });

        const transformedFolders = foldersResult.data.folders.map(transformFolder);
       
       setFolders(transformedFolders);
       console.log('✅ Loaded folders from blockchain:', transformedFolders.length);
      } else {
        console.log('📁 No folders found or API error:', foldersResult.error);
        console.log('📁 Starting with empty state');
        setFolders([]);
      }

      // Load account balance if we have account info
      if (account?.accountId) {
        await refreshBalance();
      }
      
      // Mark as initialized after successful load
      setIsInitialized(true);
      console.log('✅ User data loading completed');
      
    } catch (err) {
      console.error('❌ Failed to load user data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load user data');
      // Don't throw here, just set empty state
      setFolders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createFolder = async (name: string, parentFolderId?: string): Promise<string> => {
    if (isDemoMode) {
      const newFolder: HederaFolder = {
        id: `folder-${Date.now()}`,
        name,
        files: [],
        parentFolderId
      };
      
      setFolders(prev => [...prev, newFolder]);
      return newFolder.id;
    }

    try {
      console.log('📁 Creating folder on blockchain:', name, parentFolderId ? `(parent: ${parentFolderId})` : '');
      
      const result = await HederaApiService.createFolder(name, parentFolderId);
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create folder');
      }

      // Add to local state
      const newFolder: HederaFolder = {
        id: result.data.folderId,
        name: result.data.name,
        files: [],
        parentFolderId: result.data.parentFolderId,
        hederaFileId: result.data.hederaFileId,
        createdAt: result.data.createdAt
      };
      
      setFolders(prev => [...prev, newFolder]);
      
      console.log('✅ Folder created successfully:', result.data.transactionId);
      return result.data.folderId;
    } catch (err) {
      console.error('❌ Failed to create folder:', err);
      throw err;
    }
  };

  const uploadFile = async (
    folderId: string, 
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<string> => {
    if (isDemoMode) {
      // Simulate upload progress
      if (onProgress) {
        for (let i = 0; i <= 100; i += 10) {
          await new Promise(resolve => setTimeout(resolve, 50));
          onProgress(i);
        }
      }

      const mockFileId = `0.0.${Date.now()}`;
      const newFile: HederaFile = {
        id: mockFileId,
        name: file.name,
        size: file.size,
        createdAt: new Date()
      };

      setFolders(prev => prev.map(folder => 
        folder.id === folderId 
          ? { ...folder, files: [...folder.files, newFile] }
          : folder
      ));

      return mockFileId;
    }

    try {
      console.log('📤 Uploading file to blockchain:', file.name);
      
      // Check file size limits
      if (file.size > config.maxFileSizeHedera) {
        throw new Error(`File too large. Maximum size is ${config.maxFileSizeHedera / 1024 / 1024}MB`);
      }

      // Convert file to base64
      const fileData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // Remove data:mime;base64, prefix
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const uploadResult = await HederaApiService.uploadFile({
        fileName: file.name,
        fileData: fileData,
        fileSize: file.size,
        contentType: file.type,
        folderId: folderId
      }, onProgress);
      
      if (!uploadResult.success || !uploadResult.data) {
        throw new Error(uploadResult.error || 'Upload failed');
      }

      // Refresh folders to get updated blockchain state
      await refreshFolders();

      console.log('✅ File uploaded to blockchain:', uploadResult.data.transactionId);
      return uploadResult.data.fileId;
    } catch (err) {
      console.error('❌ Failed to upload file:', err);
      throw err;
    }
  };

  const getFileContent = async (fileId: string): Promise<Uint8Array> => {
    if (isDemoMode) {
      // Return empty content for demo
      return new Uint8Array();
    }

    try {
      console.log('📥 Getting file content from blockchain:', fileId);
      
      const contentResult = await HederaApiService.getFileContent(fileId);
      
      if (!contentResult.success || !contentResult.data) {
        throw new Error(contentResult.error || 'Failed to get file content');
      }

      // Convert from base64 or handle as needed
      if (typeof contentResult.data === 'string') {
        return new Uint8Array(Buffer.from(contentResult.data, 'base64'));
      }
      
      return contentResult.data;
    } catch (err) {
      console.error('❌ Failed to get file content:', err);
      throw err;
    }
  };

  const refreshFolders = async () => {
    if (isDemoMode) return;
    console.log('🔄 Refreshing folders from blockchain');
    await loadUserData();
  };

  const refreshBalance = async () => {
    if (!account || isDemoMode) {
      console.log('🔄 refreshBalance: Skipping - no account or demo mode');
      return;
    }

    try {
      console.log('💰 Refreshing secure wallet balance from blockchain');
      console.log('💰 Account details:', {
        accountId: account.accountId,
        network: account.network,
        security: account.security
      });
      
      // Use secure wallet service for balance
      const balance = await SecureWalletService.getSecureWalletBalance(account.accountId);
      
      console.log('💰 Balance result:', balance);
      
      if (balance) {
        const newBalance = typeof balance.hbar === 'number' ? balance.hbar.toFixed(2) : '0.00';
        console.log('💰 Setting new balance:', newBalance);
        
        setAccount(prev => prev ? {
          ...prev,
          balance: newBalance
        } : null);
        
        console.log('✅ Secure wallet balance updated:', balance.hbar, 'HBAR');
      } else {
        console.log('ℹ️ No balance found for secure wallet');
      }
    } catch (err) {
      console.error('❌ Failed to refresh secure wallet balance:', err);
    }
  };

  const value: HederaContextType = {
    account,
    folders,
    isInitialized,
    isLoading,
    error,
    initializeWithUserCredentials,
    initializeAfterOnboarding,
    checkHederaConnection,
    disconnect,
    createFolder,
    uploadFile,
    getFileContent,
    refreshFolders,
    refreshBalance,
    forceInitialize
  };

  return (
    <HederaContext.Provider value={value}>
      {children}
    </HederaContext.Provider>
  );
}

export function useHedera() {
  const context = useContext(HederaContext);
  if (context === undefined) {
    throw new Error('useHedera must be used within a HederaProvider');
  }
  return context;
} 