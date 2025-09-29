/**
 * SafeMate MyFiles Page Component
 * 
 * Environment: preprod
 * Purpose: File and folder management interface with Hedera blockchain integration
 * 
 * Features:
 * - Create folders and subfolders on Hedera testnet
 * - Upload files to blockchain storage
 * - Drag and drop file uploads
 * - Real-time validation and user feedback
 * - Breadcrumb navigation
 * - Blockchain status indicators
 * 
 * Last Updated: September 27, 2025
 * Status: Enhanced with improved dialog handling and validation
 * Fixed: Multiple dialog overlay issues and folder creation validation
 * Fixed: Transaction endpoint integration for real blockchain data
 * Fixed: Text overlay issue in create folder dialog dropdown (z-index fix)
 * Enhanced: Redesigned create folder dialog with modern gradient design and separated dropdown
 * Enhanced: New 4-level deep folder creation dialog with hierarchy visualization and depth management
 * Removed: "Connected to Hedera testnet" status message and blockchain status indicators
 * Enhanced: Combined three widgets (new folder, sort by, upload files) into one unified search and action bar
 * Removed: Sort by dropdown option as requested
 * Enhanced: New folder and upload files converted to icon buttons for cleaner UI
 * Removed: Search & Action Controls Widget as requested - moved functionality back to header
 * Simplified: Removed all widgets except Wallet Structure Widget with integrated action buttons
 * Enhanced: New Folder and Upload Files buttons now integrated into Wallet Structure Widget
 * Removed: Header with breadcrumbs and navigation - now only Wallet Structure Widget remains
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  useTheme,
  alpha,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Breadcrumbs,
  Link,
  LinearProgress,
  Alert,
  CircularProgress,
  Grid,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  MenuItem,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Folder as FolderIcon,
  CreateNewFolder as CreateFolderIcon,
  Description as FileIcon,
  Image as ImageIcon,
  VideoFile as VideoIcon,
  AudioFile as AudioIcon,
  Archive as ArchiveIcon,
  PictureAsPdf as PdfIcon,
  TableChart as SpreadsheetIcon,
  Slideshow as PresentationIcon,
  Code as CodeIcon,
  Search as SearchIcon,
  GridView as GridViewIcon,
  List as ListViewIcon,
  ExpandMore as ExpandMoreIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  Upload as FileUploadIcon,
  Refresh as RefreshIcon,
  Description as DocumentIcon,
  Clear as ClearIcon,
  Error as ErrorIcon,
  ChevronRight as ChevronRightIcon,
  FolderOpen as FolderOpenIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useSnackbar } from 'notistack';
import { useHedera } from '../../contexts/HederaContext';
import WalletStructureWidget from '../widgets/WalletStructureWidget';
import FolderTreeWidget from '../widgets/FolderTreeWidget';
import FileDetailsModal from '../modals/FileDetailsModal';
import { formatFileSize } from '../../utils/formatters';





interface BreadcrumbItem {
  id: string;
  name: string;
  path: string;
}

// Upload file interface
interface UploadFile {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
  estimatedReward?: number;
  estimatedCost?: number;
}

export default function ModernMyFiles() {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const { 
    folders, 
    isInitialized, 
    isLoading, 
    refreshFolders, 
    createFolder, 
    uploadFile 
  } = useHedera();
  
  // Current navigation state - supports 5 levels deep
  const [currentPath, setCurrentPath] = useState<string[]>(['root']);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>('name');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog states
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedParentFolderId, setSelectedParentFolderId] = useState<string | undefined>(undefined);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [folderNavigationDialogOpen, setFolderNavigationDialogOpen] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  
  // File details modal state
  const [fileDetailsModalOpen, setFileDetailsModalOpen] = useState(false);
  const [selectedFileForDetails, setSelectedFileForDetails] = useState<{
    id: string;
    name: string;
    type: string;
    size: number;
    lastModified: Date;
    mateReward?: number;
    isShared?: boolean;
  } | null>(null);

  // Upload states
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [showUploadQueue, setShowUploadQueue] = useState(false);
  const [uploadStartTime, setUploadStartTime] = useState<number | null>(null);
  
  // File input refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const directFileInputRef = useRef<HTMLInputElement>(null);

  // Calculate upload costs and rewards
  const calculateReward = (fileSize: number): number => {
    return Math.max(0.01, fileSize / (1024 * 1024) * 0.1);
  };

  const calculateCost = (fileSize: number): number => {
    const baseCost = 0.001;
    const storageCost = (fileSize / (1024 * 1024)) * 0.01;
    return baseCost + storageCost;
  };

  // Calculate estimated upload time based on file size
  const calculateEstimatedTime = (fileSize: number): number => {
    // Estimate: 1MB per second for blockchain upload
    const bytesPerSecond = 1024 * 1024; // 1MB/s
    return Math.max(1, Math.ceil(fileSize / bytesPerSecond));
  };

  // Format time remaining
  const formatTimeRemaining = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  };

  // Calculate overall upload progress
  const calculateOverallProgress = (): { progress: number; timeRemaining: number } => {
    if (uploadFiles.length === 0) return { progress: 0, timeRemaining: 0 };
    
    const totalSize = uploadFiles.reduce((sum, file) => sum + file.file.size, 0);
    const uploadedSize = uploadFiles.reduce((sum, file) => {
      if (file.status === 'completed') return sum + file.file.size;
      if (file.status === 'uploading') return sum + (file.progress * file.file.size / 100);
      return sum;
    }, 0);
    
    const progress = totalSize > 0 ? (uploadedSize / totalSize) * 100 : 0;
    
    // Calculate time remaining based on current progress and elapsed time
    let timeRemaining = 0;
    if (uploadStartTime && progress > 0) {
      const elapsedTime = (Date.now() - uploadStartTime) / 1000;
      const estimatedTotalTime = elapsedTime / (progress / 100);
      timeRemaining = Math.max(0, estimatedTotalTime - elapsedTime);
    } else if (progress === 0) {
      // If no progress yet, estimate based on file sizes
      timeRemaining = uploadFiles.reduce((sum, file) => sum + calculateEstimatedTime(file.file.size), 0);
    }
    
    return { progress, timeRemaining };
  };

  // Folder tree item interface
  interface FolderTreeNode {
    id: string;
    name: string;
    level: number;
    path: string;
    children: FolderTreeNode[];
  }

  // Build hierarchical folder tree for picker - simplified to prevent recursion
  const buildFolderTree = useMemo(() => {
    try {
      // For now, just return a simple flat list to prevent recursion issues
      // TODO: Implement proper hierarchical tree building when needed
      return folders.map(folder => ({
        id: folder.id,
        name: folder.name,
        level: 0, // All at same level for now
        path: folder.name,
        children: []
      }));
    } catch (error) {
      console.error('Error building folder tree:', error);
      return [];
    }
  }, [folders]);



  // Get current folder based on path
  const getCurrentFolder = useMemo(() => {
    if (currentPath.length === 1 && currentPath[0] === 'root') {
      // Root level - show all top-level folders and files
      return {
        id: 'root',
        name: 'Home',
        files: [],
        subfolders: folders.filter(f => !f.parentFolderId).map(f => f.id),
        level: 0
      };
    }

    // Navigate to the current folder based on path
    let currentFolder = null;
    let level = 0;
    
    for (const folderId of currentPath) {
      if (folderId === 'root') continue;
      
      const folder = folders.find(f => f.id === folderId);
      if (!folder) break;
      
      currentFolder = folder;
      level++;
    }

    if (!currentFolder) {
      return {
        id: 'root',
        name: 'Home',
        files: [],
        subfolders: folders.filter(f => !f.parentFolderId).map(f => f.id),
        level: 0
      };
    }

    return {
      ...currentFolder,
      subfolders: folders.filter(f => f.parentFolderId === currentFolder.id).map(f => f.id),
      level
    };
  }, [currentPath, folders]);

  // Get breadcrumb path
  const getBreadcrumbs = useMemo((): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = [
      { id: 'root', name: 'Home', path: '/' }
    ];

    if (currentPath.length > 1) {
      for (let i = 1; i < currentPath.length; i++) {
        const folderId = currentPath[i];
        const folder = folders.find(f => f.id === folderId);
        if (folder) {
          breadcrumbs.push({
            id: folder.id,
            name: folder.name,
            path: `/folders/${folder.id}`
          });
        }
      }
    }

    return breadcrumbs;
  }, [currentPath, folders]);

  // Navigation functions
  const navigateToFolder = (folderId: string) => {
    if (folderId === 'root') {
      setCurrentPath(['root']);
    } else {
      // Find the folder and build the path
      const folder = folders.find(f => f.id === folderId);
      if (folder) {
        const newPath = buildPathToFolder(folderId);
        if (newPath.length <= 6) { // Max 5 levels deep (6 including root)
          setCurrentPath(newPath);
        } else {
          enqueueSnackbar('Maximum folder depth reached (5 levels)', { variant: 'warning' });
        }
      }
    }
  };

  const buildPathToFolder = (folderId: string): string[] => {
    const path: string[] = ['root'];
    let currentId = folderId;
    
    while (currentId) {
      const folder = folders.find(f => f.id === currentId);
      if (!folder) break;
      
      path.unshift(folder.id);
      currentId = folder.parentFolderId || '';
    }
    
    return path;
  };

  // Get current folder contents
  const getCurrentFolderContents = useMemo(() => {
    const currentFolder = getCurrentFolder;
    const items = [];

    // Add subfolders
    for (const folderId of currentFolder.subfolders) {
      const folder = folders.find(f => f.id === folderId);
      if (folder) {
        items.push({
          ...folder,
          type: 'folder' as const,
          fileCount: folder.files?.length || 0
        });
      }
    }

    // Add files
    if (currentFolder.id !== 'root') {
      const folder = folders.find(f => f.id === currentFolder.id);
      if (folder && folder.files) {
        for (const file of folder.files) {
          items.push({
            ...file,
            type: 'file' as const
          });
        }
      }
    }

    return items;
  }, [getCurrentFolder, folders]);

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    const items = getCurrentFolderContents;

    // Filter by search term
    const filtered = searchTerm 
      ? items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      : items;

    // Sort items
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date': {
          const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          return bDate - aDate;
        }
        case 'size':
          if (a.type === 'folder' && b.type === 'folder') return 0;
          if (a.type === 'folder') return -1;
          if (b.type === 'folder') return 1;
          return (b as { size: number }).size - (a as { size: number }).size;
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });
  }, [getCurrentFolderContents, searchTerm, sortBy]);

  // Handle folder creation
  const handleCreateFolder = async () => {
    if (isCreatingFolder) {
      console.log('📁 Folder creation already in progress, ignoring duplicate request');
      return;
    }
    
    if (!newFolderName.trim()) {
      enqueueSnackbar('Please enter a folder name', { variant: 'error' });
      return;
    }

    // Validate folder name
    const folderName = newFolderName.trim();
    if (folderName.length > 50) {
      enqueueSnackbar('Folder name must be 50 characters or less', { variant: 'error' });
      return;
    }

    // Check for invalid characters
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(folderName)) {
      enqueueSnackbar('Folder name contains invalid characters. Please avoid: < > : " / \\ | ? *', { variant: 'error' });
      return;
    }

    // Check if folder name already exists in the same location
    const existingFolder = folders.find(f => 
      f.name.toLowerCase() === folderName.toLowerCase() && 
      f.parentFolderId === selectedParentFolderId
    );
    if (existingFolder) {
      enqueueSnackbar('A folder with this name already exists in this location', { variant: 'error' });
      return;
    }

    // Check if selected parent folder would exceed depth limit
    if (selectedParentFolderId) {
      const parentFolder = folders.find(f => f.id === selectedParentFolderId);
      if (parentFolder) {
        const parentPath = buildPathToFolder(parentFolder.id);
        if (parentPath.length >= 4) { // Max 4 levels deep
          enqueueSnackbar('Cannot create folder here - would exceed maximum depth (4 levels)', { variant: 'error' });
          return;
        }
      }
    }

    try {
      setIsCreatingFolder(true);
      console.log('📁 Creating folder on Hedera testnet:', folderName, selectedParentFolderId ? `(parent: ${selectedParentFolderId})` : '(root level)');
      
      const folderId = await createFolder(folderName, selectedParentFolderId);
      
      setCreateFolderDialogOpen(false);
      setNewFolderName('');
      setSelectedParentFolderId(undefined);
      
      enqueueSnackbar(`✅ Folder "${folderName}" created successfully on Hedera testnet!`, { 
        variant: 'success',
        autoHideDuration: 4000 
      });
      
      // Refresh folders to show the new folder
      try {
        await refreshFolders();
        console.log('✅ Folders refreshed successfully');
      } catch (error) {
        console.error('❌ Failed to refresh folders:', error);
        // Don't throw here, just log the error
      }
      
      // Navigate to the newly created folder
      if (folderId) {
        try {
          navigateToFolder(folderId);
        } catch (error) {
          console.error('❌ Failed to navigate to new folder:', error);
        }
      }
      
    } catch (error) {
      console.error('❌ Failed to create folder:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create folder';
      enqueueSnackbar(`❌ Failed to create folder: ${errorMessage}`, { 
        variant: 'error',
        autoHideDuration: 6000 
      });
    } finally {
      setIsCreatingFolder(false);
    }
  };

  // Handle dialog open - set default parent to current folder
  const handleOpenCreateFolderDialog = () => {
    if (createFolderDialogOpen) {
      console.log('📁 Dialog already open, ignoring duplicate open request');
      return;
    }
    console.log('📁 Opening create folder dialog...');
    setSelectedParentFolderId(getCurrentFolder.id === 'root' ? undefined : getCurrentFolder.id);
    setCreateFolderDialogOpen(true);
    console.log('📁 Dialog state set to open');
  };

  // Handle folder navigation dialog
  const handleOpenFolderNavigation = useCallback(() => {
    setFolderNavigationDialogOpen(true);
    // Auto-expand the first level of folders
    const firstLevelFolders = folders.filter(f => !f.parentFolderId);
    setExpandedFolders(new Set(firstLevelFolders.map(f => f.id)));
  }, [folders]);

  const handleToggleFolderExpansion = useCallback((folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  }, []);

  const handleSelectFolderForCreation = useCallback((folderId: string | null) => {
    setSelectedParentFolderId(folderId || undefined);
    setFolderNavigationDialogOpen(false);
  }, []);

  // Build folder tree for navigation
  const buildFolderTreeForNavigation = useCallback((parentId: string | null = null, level: number = 0): any[] => {
    if (level >= 4) return []; // Max 4 levels deep
    
    const childFolders = folders.filter(f => f.parentFolderId === parentId);
    
    return childFolders.map(folder => ({
      ...folder,
      level,
      children: buildFolderTreeForNavigation(folder.id, level + 1)
    }));
  }, [folders]);

  // Render folder tree node
  const renderFolderTreeNode = useCallback((folder: any) => {
    const hasChildren = folder.children && folder.children.length > 0;
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = selectedParentFolderId === folder.id;
    
    return (
      <Box key={folder.id} sx={{ ml: folder.level * 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 1,
            borderRadius: 1,
            cursor: 'pointer',
            backgroundColor: isSelected ? 'primary.light' : 'transparent',
            color: isSelected ? 'primary.contrastText' : 'text.primary',
            '&:hover': {
              backgroundColor: isSelected ? 'primary.main' : 'action.hover',
            },
            transition: 'all 0.2s ease',
          }}
          onClick={() => handleSelectFolderForCreation(folder.id)}
        >
          {hasChildren && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFolderExpansion(folder.id);
              }}
              sx={{ mr: 0.5, p: 0.5 }}
            >
              {isExpanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
            </IconButton>
          )}
          {!hasChildren && <Box sx={{ width: 24, mr: 0.5 }} />}
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            {isExpanded ? <FolderOpenIcon fontSize="small" /> : <FolderIcon fontSize="small" />}
            <Typography variant="body2" sx={{ fontWeight: isSelected ? 600 : 400 }}>
              {folder.name}
            </Typography>
            <Chip 
              label={`Level ${folder.level + 1}`}
              size="small"
              color={folder.level >= 3 ? 'warning' : 'primary'}
              sx={{ ml: 'auto', fontSize: '0.7rem' }}
            />
          </Box>
        </Box>
        
        {hasChildren && isExpanded && (
          <Box>
            {folder.children.map((child: any) => renderFolderTreeNode(child))}
          </Box>
        )}
      </Box>
    );
  }, [expandedFolders, selectedParentFolderId, handleToggleFolderExpansion, handleSelectFolderForCreation]);

  

  // Drag and drop for file uploads
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map(file => ({
      file,
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      status: 'pending',
      progress: 0,
      estimatedReward: calculateReward(file.size),
      estimatedCost: calculateCost(file.size),
    }));
    
    setUploadFiles(prev => {
      const updated = [...prev, ...newFiles];
      // Start upload timer if this is the first file
      if (prev.length === 0 && updated.length > 0) {
        setUploadStartTime(Date.now());
      }
      return updated;
    });
    setShowUploadQueue(true);
    enqueueSnackbar(`${acceptedFiles.length} file(s) added to upload queue`, { variant: 'success' });
  }, [enqueueSnackbar]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 50 * 1024 * 1024, // 50MB limit
    onDropRejected: (fileRejections) => {
      fileRejections.forEach(({ errors }) => {
        errors.forEach(error => {
          if (error.code === 'file-too-large') {
            enqueueSnackbar('File too large. Maximum size is 50MB.', { variant: 'error' });
          } else {
            enqueueSnackbar(`Upload error: ${error.message}`, { variant: 'error' });
          }
        });
      });
    },
  });

  // Upload file management
  const removeFile = (fileId: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const updateFileStatus = (fileId: string, updates: Partial<UploadFile>) => {
    setUploadFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, ...updates } : f
    ));
  };

  const handleUploadFiles = async () => {
    const pendingFiles = uploadFiles.filter(f => f.status === 'pending');
    
    if (pendingFiles.length === 0) {
      enqueueSnackbar('No files to upload', { variant: 'info' });
      return;
    }

    // Check if we're in root folder
    if (getCurrentFolder.id === 'root') {
      enqueueSnackbar('Please navigate to a folder before uploading files', { variant: 'warning' });
      return;
    }

    console.log(`📤 Starting upload of ${pendingFiles.length} file(s) to Hedera testnet...`);
    
    for (const fileToUpload of pendingFiles) {
      try {
        updateFileStatus(fileToUpload.id, { status: 'uploading', progress: 0 });
        
        console.log(`📤 Uploading ${fileToUpload.file.name} (${formatFileSize(fileToUpload.file.size)}) to folder: ${getCurrentFolder.id}`);

        await uploadFile(getCurrentFolder.id, fileToUpload.file, (progress) => {
          updateFileStatus(fileToUpload.id, { progress });
        });
        
        updateFileStatus(fileToUpload.id, { 
          status: 'completed', 
          progress: 100 
        });
        
        enqueueSnackbar(`✅ ${fileToUpload.file.name} uploaded successfully to Hedera testnet!`, { 
          variant: 'success',
          autoHideDuration: 4000 
        });
        
      } catch (error) {
        console.error(`❌ Failed to upload ${fileToUpload.file.name}:`, error);
        updateFileStatus(fileToUpload.id, { 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Upload failed' 
        });
        
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        enqueueSnackbar(`❌ Failed to upload ${fileToUpload.file.name}: ${errorMessage}`, { 
          variant: 'error',
          autoHideDuration: 6000 
        });
      }
    }
    
    // Refresh folders to show new files
    try {
      await refreshFolders();
      console.log('✅ Folders refreshed after upload');
    } catch (error) {
      console.error('❌ Failed to refresh folders:', error);
    }
  };

  const clearCompletedUploads = () => {
    setUploadFiles(prev => prev.filter(f => f.status !== 'completed'));
  };

  // Get file icon based on type
  const getFileIcon = (fileName: string, fileType?: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (fileType?.startsWith('image/')) return <ImageIcon />;
    if (fileType?.startsWith('video/')) return <VideoIcon />;
    if (fileType?.startsWith('audio/')) return <AudioIcon />;
    if (fileType?.includes('pdf')) return <PdfIcon />;
    
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
        return <ImageIcon />;
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'wmv':
        return <VideoIcon />;
      case 'mp3':
      case 'wav':
      case 'flac':
        return <AudioIcon />;
      case 'pdf':
        return <PdfIcon />;
      case 'doc':
      case 'docx':
        return <DocumentIcon />;
      case 'xls':
      case 'xlsx':
        return <SpreadsheetIcon />;
      case 'ppt':
      case 'pptx':
        return <PresentationIcon />;
      case 'zip':
      case 'rar':
      case '7z':
        return <ArchiveIcon />;
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
      case 'html':
      case 'css':
      case 'json':
        return <CodeIcon />;
      default:
        return <FileIcon />;
    }
  };

  // Upload queue component
  const UploadQueue = () => (
    <Accordion 
      expanded={showUploadQueue} 
      onChange={() => setShowUploadQueue(!showUploadQueue)}
      sx={{ mb: 3 }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
          <FileUploadIcon />
          <Typography variant="h6">Upload Queue ({uploadFiles.length})</Typography>
          {uploadFiles.some(f => f.status === 'uploading') && (
            <CircularProgress size={16} />
          )}
          {uploadFiles.length > 0 && (
            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
              {(() => {
                const { progress, timeRemaining } = calculateOverallProgress();
                return (
                  <>
                    <Typography variant="caption" color="text.secondary">
                      {Math.round(progress)}% complete
                    </Typography>
                    {timeRemaining > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        {formatTimeRemaining(Math.round(timeRemaining))} remaining
                      </Typography>
                    )}
                  </>
                );
              })()}
            </Box>
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {uploadFiles.length === 0 ? (
          <Typography color="text.secondary">No files in upload queue</Typography>
        ) : (
          <Stack spacing={2}>
            {/* Overall Progress Bar */}
            {uploadFiles.some(f => f.status === 'uploading' || f.status === 'completed') && (
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Typography variant="subtitle2">Overall Progress</Typography>
                  {(() => {
                    const { progress, timeRemaining } = calculateOverallProgress();
                    return (
                      <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {Math.round(progress)}%
                        </Typography>
                        {timeRemaining > 0 && (
                          <Typography variant="caption" color="text.secondary">
                            {formatTimeRemaining(Math.round(timeRemaining))} remaining
                          </Typography>
                        )}
                      </Box>
                    );
                  })()}
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={calculateOverallProgress().progress}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Paper>
            )}
            
            {uploadFiles.map((uploadFile) => (
              <Paper key={uploadFile.id} sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {getFileIcon(uploadFile.file.name, uploadFile.file.type)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2">{uploadFile.file.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(uploadFile.file.size)}
                      {uploadFile.status === 'uploading' && (
                        <> • {uploadFile.progress}% • {formatTimeRemaining(calculateEstimatedTime(uploadFile.file.size) * (1 - uploadFile.progress / 100))} remaining</>
                      )}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {uploadFile.status === 'pending' && (
                      <Chip label="Pending" size="small" color="default" />
                    )}
                    {uploadFile.status === 'uploading' && (
                      <Chip label="Uploading" size="small" color="primary" />
                    )}
                    {uploadFile.status === 'completed' && (
                      <Chip label="Completed" size="small" color="success" />
                    )}
                    {uploadFile.status === 'error' && (
                      <Chip label="Error" size="small" color="error" icon={<ErrorIcon />} />
                    )}
                    <IconButton 
                      size="small" 
                      onClick={() => removeFile(uploadFile.id)}
                      disabled={uploadFile.status === 'uploading'}
                    >
                      <ClearIcon />
                    </IconButton>
                  </Box>
                </Box>
                {uploadFile.status === 'uploading' && (
                  <LinearProgress 
                    variant="determinate" 
                    value={uploadFile.progress} 
                    sx={{ mt: 1 }}
                  />
                )}
                {uploadFile.error && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {uploadFile.error}
                  </Alert>
                )}
              </Paper>
            ))}
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button 
                variant="outlined" 
                onClick={clearCompletedUploads}
                disabled={!uploadFiles.some(f => f.status === 'completed')}
              >
                Clear Completed
              </Button>
              <Button 
                variant="contained" 
                onClick={handleUploadFiles}
                disabled={!uploadFiles.some(f => f.status === 'pending')}
              >
                Upload All
              </Button>
            </Box>
          </Stack>
        )}
      </AccordionDetails>
    </Accordion>
  );

  // Show loading state
  if (!isInitialized || isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', gap: 3 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary">
            Loading your files from Hedera testnet blockchain...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 400 }}>
            Connecting to the Hedera network to retrieve your securely stored folders and files.
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      




        {/* Hidden file input for uploads */}
        <input 
          {...getInputProps()} 
          ref={fileInputRef}
          style={{ display: 'none' }} 
          id="file-upload-input"
          data-testid="file-upload-input"
        />
        
        {/* Alternative direct file input for button clicks */}
        <input
          ref={directFileInputRef}
          type="file"
          multiple
          accept="*/*"
          style={{ display: 'none' }}
          id="direct-file-upload-input"
          onChange={(e) => {
            const files = e.target.files;
            if (files && files.length > 0) {
              const fileArray = Array.from(files);
              console.log(`📁 Selected ${fileArray.length} files via direct input`);
              onDrop(fileArray);
            }
            // Reset the input
            e.target.value = '';
          }}
        />


        {/* Widgets Layout */}
        <Box sx={{ maxWidth: 1200, mx: 'auto', width: '100%' }}>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
            gap: 3,
            alignItems: 'start'
          }}>
            {/* Upload Widget */}
            <WalletStructureWidget 
              onRefresh={() => refreshFolders()}
              onCreateFolder={handleOpenCreateFolderDialog}
              onUploadFiles={() => {
                try {
                  // Create file input for blockchain upload
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.multiple = true;
                  input.accept = '*/*';
                  input.style.display = 'none';
                  document.body.appendChild(input);
                  
                  input.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files;
                    if (files && files.length > 0) {
                      const fileArray = Array.from(files);
                      onDrop(fileArray);
                    }
                    document.body.removeChild(input);
                  };
                  
                  input.click();
                  
                } catch (error) {
                  console.error('❌ Error opening file dialog:', error);
                  enqueueSnackbar('Failed to open file dialog. Please try again.', { variant: 'error' });
                }
              }}
              canCreateFolder={getCurrentFolder.level < 4}
              canUploadFiles={true}
            />

            {/* Folder Tree Widget */}
            <FolderTreeWidget 
              onRefresh={() => refreshFolders()}
              onFolderSelect={(folderId, folderName) => {
                // Handle folder selection - could navigate to that folder
                console.log('Selected folder:', folderId, folderName);
                enqueueSnackbar(`Selected folder: ${folderName}`, { variant: 'info' });
              }}
            />
          </Box>
        </Box>

             {/* Create Folder Dialog - Enhanced for 4-Level Depth */}
      <Dialog 
        open={createFolderDialogOpen} 
        onClose={() => setCreateFolderDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            overflow: 'hidden',
            position: 'relative',
            minHeight: '500px',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              zIndex: 0,
            }
          }
        }}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(5px)',
          }
        }}
      >
        {/* Header with Icon */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <DialogTitle sx={{ 
            textAlign: 'center', 
            pb: 1,
            background: 'rgba(255,255,255,0.1)',
            borderBottom: '1px solid rgba(255,255,255,0.2)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 1 }}>
              <Box sx={{ 
                p: 2, 
                borderRadius: '50%', 
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CreateFolderIcon sx={{ fontSize: 32, color: 'white' }} />
              </Box>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'white' }}>
              Create New Folder
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 1 }}>
              Create folders up to 4 levels deep on the Hedera blockchain
            </Typography>
          </DialogTitle>
        </Box>

        {/* Content */}
        <DialogContent sx={{ 
          position: 'relative', 
          zIndex: 1,
          background: 'white',
          color: 'text.primary',
          mx: 2,
          my: 2,
          borderRadius: 3,
          p: 3,
          minHeight: '400px'
        }}>
          <Stack spacing={3}>
            {/* Folder Name Input */}
            <Box>
              <TextField
                autoFocus
                label="Folder Name"
                fullWidth
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                placeholder="Enter folder name..."
                helperText={
                  newFolderName.length > 50 
                    ? `Folder name too long (${newFolderName.length}/50 characters)`
                    : /[<>:"/\\|?*]/.test(newFolderName)
                    ? 'Folder name contains invalid characters'
                    : 'Choose a descriptive name for your folder'
                }
                error={newFolderName.length > 50 || /[<>:"/\\|?*]/.test(newFolderName)}
                inputProps={{ maxLength: 50 }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
            </Box>

            {/* Parent Folder Selection */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                📁 Parent Folder Selection
              </Typography>
              
              <Button
                variant="outlined"
                fullWidth
                onClick={handleOpenFolderNavigation}
                startIcon={<FolderIcon />}
                sx={{
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  borderRadius: 2,
                  backgroundColor: 'white',
                  border: '2px solid',
                  borderColor: selectedParentFolderId ? 'primary.main' : 'rgba(0,0,0,0.23)',
                  py: 2,
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'rgba(25, 118, 210, 0.04)',
                  }
                }}
              >
                {selectedParentFolderId ? (() => {
                  const selectedFolder = folders.find(f => f.id === selectedParentFolderId);
                  return selectedFolder ? `📁 ${selectedFolder.name}` : 'Select Folder';
                })() : '🏠 Create at Root Level (Recommended)'}
              </Button>
              
              {selectedParentFolderId && (
                <Button
                  size="small"
                  onClick={() => setSelectedParentFolderId(undefined)}
                  sx={{ mt: 1, color: 'text.secondary' }}
                >
                  Clear Selection
                </Button>
              )}
              
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                💡 Click to browse folder structure and select a location (max 4 levels deep)
              </Typography>
            </Box>

            {/* Depth Status and Warning */}
            {(() => {
              const currentDepth = selectedParentFolderId ? (() => {
                const parentFolder = folders.find(f => f.id === selectedParentFolderId);
                if (parentFolder) {
                  const parentPath = buildPathToFolder(parentFolder.id);
                  return parentPath.length + 1; // +1 for the new folder
                }
                return 1;
              })() : 1;

              if (currentDepth > 4) {
                return (
                  <Alert 
                    severity="error" 
                    sx={{ 
                      borderRadius: 2,
                      '& .MuiAlert-icon': {
                        fontSize: '1.2rem'
                      }
                    }}
                  >
                    ❌ Cannot create folder here - would exceed maximum depth (4 levels)
                  </Alert>
                );
              } else if (currentDepth === 4) {
                return (
                  <Alert 
                    severity="warning" 
                    sx={{ 
                      borderRadius: 2,
                      '& .MuiAlert-icon': {
                        fontSize: '1.2rem'
                      }
                    }}
                  >
                    ⚠️ This will create a folder at maximum depth (Level 4)
                  </Alert>
                );
              } else {
                return (
                  <Alert 
                    severity="info" 
                    sx={{ 
                      borderRadius: 2,
                      '& .MuiAlert-icon': {
                        fontSize: '1.2rem'
                      }
                    }}
                  >
                    ✅ This will create a folder at Level {currentDepth} (Max: 4 levels)
                  </Alert>
                );
              }
            })()}

            {/* Simple Status Display */}
            {newFolderName.trim() && (
              <Box sx={{ 
                p: 2, 
                borderRadius: 2,
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                border: '1px solid rgba(76, 175, 80, 0.3)'
              }}>
                <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
                  ✅ Ready to create: "{newFolderName}"
                  {selectedParentFolderId ? ' in selected folder' : ' at root level'}
                </Typography>
              </Box>
            )}
          </Stack>
        </DialogContent>

        {/* Actions */}
        <DialogActions sx={{ 
          position: 'relative', 
          zIndex: 1,
          p: 3,
          background: 'rgba(255,255,255,0.1)',
          borderTop: '1px solid rgba(255,255,255,0.2)'
        }}>
          <Button 
            onClick={() => setCreateFolderDialogOpen(false)}
            sx={{
              color: 'white',
              borderColor: 'rgba(255,255,255,0.5)',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)',
              }
            }}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateFolder} 
            variant="contained"
            disabled={
              isCreatingFolder || 
              !newFolderName.trim() || 
              newFolderName.length > 50 ||
              /[<>:"/\\|?*]/.test(newFolderName) ||
              (() => {
                if (!selectedParentFolderId) return false;
                const parentFolder = folders.find(f => f.id === selectedParentFolderId);
                if (parentFolder) {
                  const parentPath = buildPathToFolder(parentFolder.id);
                  return parentPath.length >= 4; // Changed from 5 to 4 levels
                }
                return false;
              })()
            }
            sx={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              fontWeight: 600,
              px: 4,
              py: 1.5,
              borderRadius: 2,
              boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #3d8bfe 0%, #00d4fe 100%)',
                boxShadow: '0 6px 20px rgba(79, 172, 254, 0.6)',
                transform: 'translateY(-1px)',
              },
              '&:disabled': {
                background: 'rgba(255,255,255,0.3)',
                color: 'rgba(255,255,255,0.6)',
                boxShadow: 'none',
                transform: 'none',
              }
            }}
          >
            {isCreatingFolder ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} color="inherit" />
                <Typography>Creating on Hedera...</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CreateFolderIcon fontSize="small" />
                <Typography>Create Folder on Hedera</Typography>
              </Box>
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Folder Navigation Dialog */}
      <Dialog
        open={folderNavigationDialogOpen}
        onClose={() => setFolderNavigationDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            overflow: 'hidden',
            position: 'relative',
            minHeight: '400px',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              zIndex: 0,
            }
          }
        }}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(5px)',
          }
        }}
      >
        {/* Header */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <DialogTitle sx={{ 
            textAlign: 'center', 
            pb: 1,
            background: 'rgba(255,255,255,0.1)',
            borderBottom: '1px solid rgba(255,255,255,0.2)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 1 }}>
              <Box sx={{ 
                p: 2, 
                borderRadius: '50%', 
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FolderIcon sx={{ fontSize: 32, color: 'white' }} />
              </Box>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'white' }}>
              Select Parent Folder
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 1 }}>
              Navigate and select where to create your new folder
            </Typography>
          </DialogTitle>
        </Box>

        {/* Content */}
        <DialogContent sx={{ 
          position: 'relative', 
          zIndex: 1,
          background: 'rgba(255,255,255,0.95)',
          color: 'text.primary',
          mx: 2,
          my: 2,
          borderRadius: 3,
          p: 3,
          maxHeight: '400px',
          overflow: 'auto'
        }}>
          <Stack spacing={2}>
            {/* Root Level Option */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 2,
                borderRadius: 2,
                cursor: 'pointer',
                backgroundColor: !selectedParentFolderId ? 'primary.light' : 'transparent',
                color: !selectedParentFolderId ? 'primary.contrastText' : 'text.primary',
                border: '2px solid',
                borderColor: !selectedParentFolderId ? 'primary.main' : 'transparent',
                '&:hover': {
                  backgroundColor: !selectedParentFolderId ? 'primary.main' : 'action.hover',
                  borderColor: 'primary.main',
                },
                transition: 'all 0.2s ease',
              }}
              onClick={() => handleSelectFolderForCreation(null)}
            >
              <HomeIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body1" sx={{ fontWeight: !selectedParentFolderId ? 600 : 400 }}>
                🏠 Root Level (Create at top level)
              </Typography>
              <Chip 
                label="Level 1"
                size="small"
                color="primary"
                sx={{ ml: 'auto', fontSize: '0.7rem' }}
              />
            </Box>

            {/* Folder Tree */}
            {buildFolderTreeForNavigation().length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                  📁 Existing Folders:
                </Typography>
                <Box sx={{ 
                  border: '1px solid rgba(0,0,0,0.1)', 
                  borderRadius: 2, 
                  backgroundColor: 'white',
                  maxHeight: '300px',
                  overflow: 'auto'
                }}>
                  {buildFolderTreeForNavigation().map((folder) => renderFolderTreeNode(folder))}
                </Box>
              </Box>
            )}

            {buildFolderTreeForNavigation().length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <FolderIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  No folders created yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Create your first folder at root level
                </Typography>
              </Box>
            )}
          </Stack>
        </DialogContent>

        {/* Actions */}
        <DialogActions sx={{ 
          position: 'relative', 
          zIndex: 1,
          p: 3,
          background: 'rgba(255,255,255,0.1)',
          borderTop: '1px solid rgba(255,255,255,0.2)'
        }}>
          <Button 
            onClick={() => setFolderNavigationDialogOpen(false)}
            sx={{
              color: 'white',
              borderColor: 'rgba(255,255,255,0.5)',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)',
              }
            }}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => setFolderNavigationDialogOpen(false)}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              fontWeight: 600,
              px: 4,
              py: 1.5,
              borderRadius: 2,
              boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #3d8bfe 0%, #00d4fe 100%)',
                boxShadow: '0 6px 20px rgba(79, 172, 254, 0.6)',
                transform: 'translateY(-1px)',
              }
            }}
          >
            Select Location
          </Button>
        </DialogActions>
      </Dialog>

      {/* File Details Modal */}
      <FileDetailsModal
        open={fileDetailsModalOpen}
        file={selectedFileForDetails}
        onClose={() => {
          setFileDetailsModalOpen(false);
          setSelectedFileForDetails(null);
        }}
      />
    </Container>
  );
} 