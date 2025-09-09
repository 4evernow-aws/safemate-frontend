import React, { useState, useCallback, useMemo } from 'react';
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
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useSnackbar } from 'notistack';
import { useHedera } from '../../contexts/HederaContext';
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

  // Calculate upload costs and rewards
  const calculateReward = (fileSize: number): number => {
    return Math.max(0.01, fileSize / (1024 * 1024) * 0.1);
  };

  const calculateCost = (fileSize: number): number => {
    const baseCost = 0.001;
    const storageCost = (fileSize / (1024 * 1024)) * 0.01;
    return baseCost + storageCost;
  };

  // Folder tree item interface
  interface FolderTreeNode {
    id: string;
    name: string;
    level: number;
    path: string;
    children: FolderTreeNode[];
  }

  // Build hierarchical folder tree for picker
  const buildFolderTree = useMemo(() => {
    const buildTree = (parentId?: string, level = 0): FolderTreeNode[] => {
      const children = folders
        .filter(folder => folder.parentFolderId === parentId)
        .map(folder => {
          const childTree = buildTree(folder.id, level + 1);
          return {
            id: folder.id,
            name: folder.name,
            level,
            path: parentId ? `${parentId}/${folder.name}` : folder.name,
            children: childTree
          };
        });
      
      return children;
    };

    return buildTree();
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
    if (!newFolderName.trim()) {
      enqueueSnackbar('Please enter a folder name', { variant: 'error' });
      return;
    }

    // Check if selected parent folder would exceed depth limit
    if (selectedParentFolderId) {
      const parentFolder = folders.find(f => f.id === selectedParentFolderId);
      if (parentFolder) {
        const parentPath = buildPathToFolder(parentFolder.id);
        if (parentPath.length >= 6) { // Max 5 levels deep (6 including root)
          enqueueSnackbar('Cannot create folder here - would exceed maximum depth (5 levels)', { variant: 'error' });
          return;
        }
      }
    }

    try {
      setIsCreatingFolder(true);
      await createFolder(newFolderName.trim(), selectedParentFolderId);
      setCreateFolderDialogOpen(false);
      setNewFolderName('');
      setSelectedParentFolderId(undefined);
      enqueueSnackbar('Folder created successfully on blockchain!', { variant: 'success' });
      await refreshFolders();
    } catch {
      enqueueSnackbar('Failed to create folder', { variant: 'error' });
    } finally {
      setIsCreatingFolder(false);
    }
  };

  // Handle dialog open - set default parent to current folder
  const handleOpenCreateFolderDialog = () => {
    setSelectedParentFolderId(getCurrentFolder.id === 'root' ? undefined : getCurrentFolder.id);
    setCreateFolderDialogOpen(true);
  };

  

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
    
    setUploadFiles(prev => [...prev, ...newFiles]);
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
    
    for (const fileToUpload of pendingFiles) {
      try {
        updateFileStatus(fileToUpload.id, { status: 'uploading', progress: 0 });
        
        // Upload to current folder
        const folderId = getCurrentFolder.id === 'root' ? undefined : getCurrentFolder.id;
        if (!folderId) {
          throw new Error('Please navigate to a folder before uploading files');
        }

        await uploadFile(folderId, fileToUpload.file, (progress) => {
          updateFileStatus(fileToUpload.id, { progress });
        });
        
        updateFileStatus(fileToUpload.id, { 
          status: 'completed', 
          progress: 100 
        });
        enqueueSnackbar(`${fileToUpload.file.name} uploaded successfully!`, { variant: 'success' });
        
        // Refresh folders to show new file
        await refreshFolders();
        
      } catch (error) {
        updateFileStatus(fileToUpload.id, { 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Upload failed' 
        });
        enqueueSnackbar(`Failed to upload ${fileToUpload.file.name}`, { variant: 'error' });
      }
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FileUploadIcon />
          <Typography variant="h6">Upload Queue ({uploadFiles.length})</Typography>
          {uploadFiles.some(f => f.status === 'uploading') && (
            <CircularProgress size={16} />
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {uploadFiles.length === 0 ? (
          <Typography color="text.secondary">No files in upload queue</Typography>
        ) : (
          <Stack spacing={2}>
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
                      <Chip label="Completed" size="small" color="success" icon={<CheckCircleIcon />} />
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
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading folders...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      

             {/* Upload Queue */}
       {uploadFiles.length > 0 && <UploadQueue />}

               {/* Main Content */}
        <Box sx={{ 
          minHeight: '70vh',
          position: 'relative'
        }}>
          {/* Drag and drop area - only for the content area, not the header */}
          <Box {...getRootProps()} sx={{ 
            minHeight: '70vh',
            border: isDragActive ? `2px dashed ${theme.palette.primary.main}` : '2px dashed transparent',
            borderRadius: 3,
            transition: 'all 0.2s ease',
            backgroundColor: isDragActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
            position: 'relative'
          }}>
            <input {...getInputProps()} />
         
         {/* Drag overlay */}
         {isDragActive && (
           <Box sx={{
             position: 'absolute',
             top: 0,
             left: 0,
             right: 0,
             bottom: 0,
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             backgroundColor: alpha(theme.palette.primary.main, 0.1),
             zIndex: 1000,
             borderRadius: 3,
           }}>
             <Box sx={{ textAlign: 'center' }}>
               <UploadIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
               <Typography variant="h5" color="primary.main">
                 Drop files here to upload
               </Typography>
             </Box>
           </Box>
         )}

        {/* Header with breadcrumbs and actions */}
        <Card sx={{ mb: 3, borderRadius: 3 }}>
          <CardContent sx={{ py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Breadcrumbs
                separator={<NavigateNextIcon fontSize="small" />}
                sx={{ flexGrow: 1 }}
              >
                {getBreadcrumbs.map((crumb, index) => (
                  <Link
                    key={crumb.id}
                    color={index === getBreadcrumbs.length - 1 ? 'textPrimary' : 'inherit'}
                    component="button"
                    variant="body1"
                    onClick={() => navigateToFolder(crumb.id)}
                    sx={{ 
                      textDecoration: 'none',
                      fontWeight: index === getBreadcrumbs.length - 1 ? 600 : 400,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    {index === 0 && <HomeIcon fontSize="small" />}
                    {crumb.name}
                  </Link>
                ))}
              </Breadcrumbs>
              
                             <Box sx={{ display: 'flex', gap: 1 }}>
                 <IconButton onClick={() => refreshFolders()}>
                   <RefreshIcon />
                 </IconButton>
                                   {getCurrentFolder.id !== 'root' && (
                    <Button
                      variant="contained"
                      startIcon={<FileUploadIcon />}
                      onClick={() => {
                        // Trigger the hidden file input for uploads
                        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                        if (fileInput) {
                          fileInput.click();
                        }
                      }}
                      sx={{ 
                        borderRadius: 3, 
                        cursor: 'pointer !important',
                        position: 'relative',
                        zIndex: 10,
                        '&:hover': {
                          cursor: 'pointer !important'
                        }
                      }}
                    >
                      Upload Files
                    </Button>
                  )}
                                   <Button
                    variant="outlined"
                    startIcon={<CreateFolderIcon />}
                    onClick={handleOpenCreateFolderDialog}
                    disabled={getCurrentFolder.level >= 5}
                    sx={{ 
                      borderRadius: 3, 
                      cursor: 'pointer !important',
                      position: 'relative',
                      zIndex: 10,
                      '&:hover': {
                        cursor: 'pointer !important'
                      }
                    }}
                  >
                    New Folder
                  </Button>
               </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Search and view controls */}
        <Card sx={{ mb: 3, borderRadius: 3 }}>
          <CardContent sx={{ py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                placeholder="Search files and folders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ flexGrow: 1 }}
              />
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Sort by</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'size' | 'type')}
                  label="Sort by"
                >
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="date">Date</MenuItem>
                  <MenuItem value="size">Size</MenuItem>
                  <MenuItem value="type">Type</MenuItem>
                </Select>
              </FormControl>
              
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton
                  onClick={() => setViewMode('grid')}
                  color={viewMode === 'grid' ? 'primary' : 'default'}
                >
                  <GridViewIcon />
                </IconButton>
                <IconButton
                  onClick={() => setViewMode('list')}
                  color={viewMode === 'list' ? 'primary' : 'default'}
                >
                  <ListViewIcon />
                </IconButton>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Folder depth indicator */}
        {getCurrentFolder.level > 0 && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Current folder depth: {getCurrentFolder.level}/5 levels
            {getCurrentFolder.level >= 5 && ' (Maximum depth reached)'}
          </Alert>
        )}

        {/* Files and folders display */}
        {filteredAndSortedItems.length === 0 ? (
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <UploadIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {searchTerm ? 'No files found' : 'No files yet'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Upload files or create folders to get started'
                }
              </Typography>
                             {!searchTerm && (
                 <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                                       <Button
                      variant="contained"
                      startIcon={<FileUploadIcon />}
                      onClick={() => {
                        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                        if (fileInput) {
                          fileInput.click();
                        }
                      }}
                      disabled={getCurrentFolder.id === 'root'}
                      sx={{ 
                        cursor: 'pointer !important',
                        position: 'relative',
                        zIndex: 10,
                        '&:hover': {
                          cursor: 'pointer !important'
                        }
                      }}
                    >
                      Upload Files
                    </Button>
                 </Box>
               )}
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {filteredAndSortedItems.map((item) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                <Card 
                  sx={{ 
                    borderRadius: 3,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[8],
                    }
                  }}
                  onClick={() => {
                    if (item.type === 'folder') {
                      navigateToFolder(item.id);
                    } else {
                      setSelectedFileForDetails({
                        id: item.id,
                        name: item.name,
                        type: item.type,
                        size: item.size,
                        lastModified: new Date(item.createdAt || Date.now()),
                        mateReward: 0,
                        isShared: false
                      });
                      setFileDetailsModalOpen(true);
                    }
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Avatar 
                      sx={{ 
                        width: 64, 
                        height: 64, 
                        mx: 'auto', 
                        mb: 2,
                        bgcolor: item.type === 'folder' ? 'primary.main' : 'secondary.main'
                      }}
                    >
                      {item.type === 'folder' ? <FolderIcon /> : getFileIcon(item.name)}
                    </Avatar>
                    <Typography variant="subtitle1" noWrap>
                      {item.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.type === 'folder' 
                        ? `${item.fileCount || 0} items`
                        : formatFileSize(item.size)
                      }
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
          </Box>
        </Box>

             {/* Create Folder Dialog */}
       <Dialog 
         open={createFolderDialogOpen} 
         onClose={() => setCreateFolderDialogOpen(false)}
         maxWidth="md"
         fullWidth
       >
                   <DialogTitle>
            <Typography variant="h6">Create New Folder</Typography>
          </DialogTitle>
         <DialogContent>
           <Grid container spacing={3}>
             {/* Folder Name Input */}
             <Grid item xs={12}>
               <TextField
                 autoFocus
                 label="Folder Name"
                 fullWidth
                 value={newFolderName}
                 onChange={(e) => setNewFolderName(e.target.value)}
                 onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                 placeholder="Enter folder name..."
                                   helperText="Enter a name for your new folder"
               />
             </Grid>

                           {/* Parent Folder Selection */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Parent Folder (Optional)</InputLabel>
                  <Select
                    value={selectedParentFolderId || ''}
                    onChange={(e) => setSelectedParentFolderId(e.target.value || undefined)}
                    label="Parent Folder (Optional)"
                    displayEmpty
                  >
                    <MenuItem value="">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <HomeIcon fontSize="small" />
                        <Typography>Home (Root Level)</Typography>
                      </Box>
                    </MenuItem>
                    {buildFolderTree.map((folder) => (
                      <MenuItem key={folder.id} value={folder.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <FolderIcon fontSize="small" />
                          <Typography>{folder.name}</Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Select a parent folder to create this folder inside, or leave empty to create at root level.
                </Typography>
              </Grid>

             {/* Depth Warning */}
             {selectedParentFolderId && (() => {
               const parentFolder = folders.find(f => f.id === selectedParentFolderId);
               if (parentFolder) {
                 const parentPath = buildPathToFolder(parentFolder.id);
                 if (parentPath.length >= 6) {
                   return (
                     <Grid item xs={12}>
                       <Alert severity="warning">
                         Cannot create folder here - would exceed maximum depth (5 levels)
                       </Alert>
                     </Grid>
                   );
                 }
               }
               return null;
             })()}
           </Grid>
         </DialogContent>
         <DialogActions>
           <Button onClick={() => setCreateFolderDialogOpen(false)}>Cancel</Button>
           <Button 
             onClick={handleCreateFolder} 
             variant="contained"
             disabled={isCreatingFolder || !newFolderName.trim() || (() => {
               if (!selectedParentFolderId) return false;
               const parentFolder = folders.find(f => f.id === selectedParentFolderId);
               if (parentFolder) {
                 const parentPath = buildPathToFolder(parentFolder.id);
                 return parentPath.length >= 6;
               }
               return false;
             })()}
           >
             {isCreatingFolder ? <CircularProgress size={20} /> : 'Create Folder'}
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