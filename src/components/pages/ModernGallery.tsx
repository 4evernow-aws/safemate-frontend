import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  Divider,
  Button,
  IconButton,
  useTheme,
  Alert,
  CircularProgress,
  LinearProgress,
  Stack,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Badge,
  Tabs,
  Tab,
  CardMedia,
  CardActions,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Image as ImageIcon,
  Collections as CollectionsIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  VisibilityOff as HideIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Schedule as ScheduleIcon,
  AccountBalanceWallet as WalletIcon,
  Security as SecurityIcon,
  NetworkCheck as NetworkIcon,
  VerifiedUser as VerifiedIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  MonetizationOn as MonetizationIcon,
  Star as StarIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  Launch as LaunchIcon,
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  VideoFile as VideoIcon,
  AudioFile as AudioIcon,
  PictureAsPdf as PdfIcon,
  Archive as ArchiveIcon,
  Description as DocumentIcon,
  Code as CodeIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  GridView as GridViewIcon,
  ViewList as ListViewIcon,
  Fullscreen as FullscreenIcon,
  Close as CloseIcon,
  FileUpload as FileUploadIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useHedera } from '../../contexts/HederaContext';
import { useUser } from '../../contexts/UserContext';
import { formatFileSize } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';

interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  lastModified: Date;
  path: string;
  parentId: string;
  isShared: boolean;
  mateReward?: number;
  thumbnailUrl?: string;
}

interface FolderItem {
  id: string;
  name: string;
  path: string;
  parentId: string;
  childFolders: string[];
  childFiles: string[];
  isExpanded: boolean;
  lastModified: Date;
  itemCount: number;
  totalSize: number;
  isShared: boolean;
}

interface FileStats {
  totalFiles: number;
  totalImages: number;
  totalSize: number;
  lastUpdated: string;
}

type GalleryItem = 
  | (FolderItem & { type: 'folder' })
  | (FileItem & { type: 'file' });

export default function ModernGallery() {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const { account, folders, isInitialized, isLoading, refreshFolders, createFolder, uploadFile } = useHedera();
  const { user } = useUser();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState(0);
  const [allFiles, setAllFiles] = useState<FileItem[]>([]);
  const [allFolders, setAllFolders] = useState<Record<string, FolderItem>>({});
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [fileStats, setFileStats] = useState<FileStats | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [currentFolder, setCurrentFolder] = useState<string>('root');
  const [breadcrumbPath, setBreadcrumbPath] = useState<string[]>([]);

  // Load files when folders are available
  useEffect(() => {
    console.log('🔄 Gallery: Folders changed, current folders:', folders);
    if (folders.length > 0) {
      loadFiles();
    } else {
      console.log('⚠️ Gallery: No folders available, showing empty state');
      // Set empty state
      setAllFiles([]);
      setAllFolders({});
      setFileStats({
        totalFiles: 0,
        totalImages: 0,
        totalSize: 0,
        lastUpdated: new Date().toLocaleString(),
      });
    }
  }, [folders]);

  const loadFiles = async () => {
    setIsLoadingFiles(true);
    try {
      console.log('📁 Loading files from folders:', folders);
      
      // Extract all files from folders recursively
      const files: FileItem[] = [];
      const folderMap: Record<string, FolderItem> = {};
      
      const processFolder = (folder: any, parentId: string = 'root') => {
        console.log('🔍 Processing folder:', folder.name, 'with files:', folder.files?.length || 0);
        
        const folderItem: FolderItem = {
          id: folder.id,
          name: folder.name,
          path: parentId === 'root' ? `/${folder.name}` : `/${parentId}/${folder.name}`,
          parentId: parentId,
          childFolders: [],
          childFiles: folder.files?.map((f: any) => f.id) || [],
          isExpanded: false,
          lastModified: folder.files?.length > 0 ? 
            new Date(Math.max(...folder.files.map((f: any) => new Date(f.createdAt).getTime()))) : 
            new Date(),
          itemCount: folder.files?.length || 0,
          totalSize: folder.files?.reduce((sum: number, f: any) => sum + (f.size || 0), 0) || 0,
          isShared: false,
        };
        folderMap[folder.id] = folderItem;

        // Process files in this folder
        if (folder.files && folder.files.length > 0) {
          console.log('📄 Processing files in folder:', folder.name, folder.files);
          folder.files.forEach((file: any) => {
            const fileItem: FileItem = {
              id: file.id,
              name: file.name,
              type: getFileType(file.name),
              size: file.size || 0,
              lastModified: new Date(file.createdAt),
              path: `/${folder.name}/${file.name}`,
              parentId: folder.id,
              isShared: false,
              mateReward: calculateMateReward(file.size || 0),
              thumbnailUrl: getThumbnailUrl(file.name, file.id),
            };
            files.push(fileItem);
            console.log('✅ Added file:', fileItem.name, 'with ID:', fileItem.id);
          });
        }

        // Process subfolders recursively
        if (folder.subfolders && folder.subfolders.length > 0) {
          console.log('📁 Processing subfolders in:', folder.name, folder.subfolders.length);
          folder.subfolders.forEach((subfolder: any) => {
            processFolder(subfolder, folder.id);
          });
        }
      };

      folders.forEach(folder => {
        processFolder(folder);
      });

      console.log('📊 Final file count:', files.length);
      console.log('📁 Final folder count:', Object.keys(folderMap).length);

      setAllFiles(files);
      setAllFolders(folderMap);
      
      // Calculate stats
      const images = files.filter(f => f.type === 'image');
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      
      setFileStats({
        totalFiles: files.length,
        totalImages: images.length,
        totalSize: totalSize,
        lastUpdated: new Date().toLocaleString(),
      });
      
      console.log('✅ Loaded files:', files.length);
      if (files.length > 0) {
        enqueueSnackbar(`Loaded ${files.length} files`, { variant: 'success' });
      } else {
        enqueueSnackbar('No files found in folders', { variant: 'info' });
      }
    } catch (error) {
      console.error('❌ Failed to load files:', error);
      enqueueSnackbar('Failed to load files', { variant: 'error' });
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const getFileType = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension || '')) {
      return 'image';
    } else if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(extension || '')) {
      return 'video';
    } else if (['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(extension || '')) {
      return 'audio';
    } else if (['pdf'].includes(extension || '')) {
      return 'pdf';
    } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension || '')) {
      return 'archive';
    } else if (['doc', 'docx', 'txt', 'rtf'].includes(extension || '')) {
      return 'document';
    } else if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'xml'].includes(extension || '')) {
      return 'code';
    } else {
      return 'other';
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image': return <ImageIcon />;
      case 'video': return <VideoIcon />;
      case 'audio': return <AudioIcon />;
      case 'pdf': return <PdfIcon />;
      case 'archive': return <ArchiveIcon />;
      case 'document': return <DocumentIcon />;
      case 'code': return <CodeIcon />;
      default: return <FileIcon />;
    }
  };

  const getFileTypeColor = (fileType: string) => {
    switch (fileType) {
      case 'image': return theme.palette.primary.main;
      case 'video': return theme.palette.secondary.main;
      case 'audio': return theme.palette.success.main;
      case 'pdf': return theme.palette.error.main;
      case 'archive': return theme.palette.warning.main;
      case 'document': return theme.palette.info.main;
      case 'code': return theme.palette.grey[600];
      default: return theme.palette.grey[500];
    }
  };

  const calculateMateReward = (fileSize: number): number => {
    return Math.floor(fileSize / (1024 * 1024)) + 1; // 1 MATE per MB + base
  };

  const getThumbnailUrl = (fileName: string, fileId: string): string | undefined => {
    const fileType = getFileType(fileName);
    if (fileType === 'image') {
      // For now, return a placeholder. In a real app, this would be the actual image URL
      return `https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=${encodeURIComponent(fileName)}`;
    }
    return undefined;
  };

  const handleRefreshFiles = async () => {
    await refreshFolders();
    await loadFiles();
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleFileClick = (file: FileItem) => {
    setSelectedFile(file);
    if (file.type === 'image') {
      setImagePreviewOpen(true);
    }
  };

  const handleFolderClick = (folder: FolderItem) => {
    console.log('📁 Clicked folder:', folder.name);
    setCurrentFolder(folder.id);
    setBreadcrumbPath(prev => [...prev, folder.name]);
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      // Root
      setCurrentFolder('root');
      setBreadcrumbPath([]);
    } else {
      // Navigate to specific folder
      const newPath = breadcrumbPath.slice(0, index + 1);
      setBreadcrumbPath(newPath);
      // Find the folder ID for this path
      const targetFolder = Object.values(allFolders).find(f => f.name === newPath[newPath.length - 1]);
      if (targetFolder) {
        setCurrentFolder(targetFolder.id);
      }
    }
  };

  const getCurrentFolderItems = () => {
    if (currentFolder === 'root') {
      // Show all root folders and files
      const rootFolders = Object.values(allFolders).filter(f => f.parentId === 'root');
      const rootFiles = allFiles.filter(f => f.parentId === 'root');
      return { folders: rootFolders, files: rootFiles };
    } else {
      // Show items in current folder
      const currentFolderData = allFolders[currentFolder];
      if (!currentFolderData) return { folders: [], files: [] };
      
      const childFolders = Object.values(allFolders).filter(f => f.parentId === currentFolder);
      const childFiles = allFiles.filter(f => f.parentId === currentFolder);
      return { folders: childFolders, files: childFiles };
    }
  };

  const filteredFiles = allFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 0 ? true : file.type === 'image';
    return matchesSearch && matchesTab;
  });

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!isInitialized) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          <Typography variant="h6" gutterBottom>
            Wallet Not Initialized
          </Typography>
          <Typography variant="body2">
            Please wait while we initialize your wallet connection...
          </Typography>
        </Alert>
      </Container>
    );
  }

  if (!account) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">
          <Typography variant="h6" gutterBottom>
            No Wallet Found
          </Typography>
          <Typography variant="body2">
            You don't have a wallet yet. Please create one in your profile settings.
          </Typography>
        </Alert>
      </Container>
    );
  }

  const images = allFiles.filter(f => f.type === 'image');

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          🖼️ File Gallery
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage your uploaded files and images
        </Typography>
      </Box>

      {/* File Stats Overview */}
      {fileStats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card sx={{ 
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: 'white',
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <FileIcon sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {fileStats.totalFiles}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Total Files
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ 
              background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
              color: 'white',
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <ImageIcon sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {fileStats.totalImages}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Images
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ 
              background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
              color: 'white',
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <MonetizationIcon sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {formatFileSize(fileStats.totalSize)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Total Size
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <FolderIcon color="primary" />
                  <Typography variant="h6">
                    Folders
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                  {Object.keys(allFolders).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Organized storage
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Search and Actions Bar */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search files..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 250 }}
        />
        
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefreshFiles}
          disabled={isLoadingFiles}
        >
          {isLoadingFiles ? 'Loading...' : 'Refresh Files'}
        </Button>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={async () => {
            console.log('🔄 Force refreshing folders...');
            await refreshFolders();
          }}
          disabled={isLoadingFiles}
        >
          Force Refresh Folders
        </Button>

        <Button
          variant="outlined"
          startIcon={<LaunchIcon />}
          onClick={async () => {
            console.log('🧪 Testing folders API directly...');
            try {
              const response = await fetch('https://yvzwg6rvp3.execute-api.ap-southeast-2.amazonaws.com/default/folders', {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  // Add auth headers if needed
                }
              });
              console.log('🧪 Direct API response status:', response.status);
              const data = await response.text();
              console.log('🧪 Direct API response data:', data);
              enqueueSnackbar(`API Test: ${response.status} - ${data.substring(0, 100)}`, { variant: 'info' });
            } catch (error) {
              console.error('🧪 Direct API test error:', error);
              enqueueSnackbar(`API Test Error: ${error}`, { variant: 'error' });
            }
          }}
        >
          Test API Directly
        </Button>

        <Button
          variant="outlined"
          startIcon={<LaunchIcon />}
          onClick={() => navigate('/upload')}
        >
          Upload New File
        </Button>

        <Button
          variant="contained"
          startIcon={<FolderIcon />}
          onClick={async () => {
            console.log('🧪 Creating test folder...');
            try {
              const folderId = await createFolder('Test Gallery Folder');
              console.log('✅ Created test folder:', folderId);
              await refreshFolders();
              enqueueSnackbar('Test folder created!', { variant: 'success' });
            } catch (error) {
              console.error('❌ Failed to create test folder:', error);
              enqueueSnackbar('Failed to create test folder', { variant: 'error' });
            }
          }}
        >
          Create Test Folder
        </Button>

        <Button
          variant="contained"
          startIcon={<FileUploadIcon />}
          onClick={async () => {
            console.log('🧪 Creating test file...');
            try {
              // Create a simple text file for testing
              const testContent = 'This is a test file created from the gallery!';
              const testFile = new Blob([testContent], { type: 'text/plain' }) as File;
              Object.defineProperty(testFile, 'name', { value: 'test-file.txt' });
              
              // Get the first folder ID (our test folder)
              const folderId = folders[0]?.id;
              if (!folderId) {
                enqueueSnackbar('No folder available for upload', { variant: 'warning' });
                return;
              }
              
              const result = await uploadFile(folderId, testFile);
              console.log('✅ Uploaded test file:', result);
              await refreshFolders();
              enqueueSnackbar('Test file uploaded!', { variant: 'success' });
            } catch (error) {
              console.error('❌ Failed to upload test file:', error);
              enqueueSnackbar('Failed to upload test file', { variant: 'error' });
            }
          }}
          disabled={folders.length === 0}
        >
          Upload Test File
        </Button>

        <IconButton
          onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          color="primary"
        >
          {viewMode === 'grid' ? <ListViewIcon /> : <GridViewIcon />}
        </IconButton>

        <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
          Last updated: {fileStats?.lastUpdated || 'Never'}
        </Typography>
      </Box>

      {/* Debug Information */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Debug Information
        </Typography>
        <Typography variant="body2" component="div">
          <strong>Folders loaded:</strong> {folders.length}<br />
          <strong>Files processed:</strong> {allFiles.length}<br />
          <strong>Folders processed:</strong> {Object.keys(allFolders).length}<br />
          <strong>Account ID:</strong> {account?.accountId || 'None'}<br />
          <strong>Is Initialized:</strong> {isInitialized ? 'Yes' : 'No'}<br />
          <strong>Is Loading:</strong> {isLoading ? 'Yes' : 'No'}
        </Typography>
      </Alert>

      {/* Folders Section */}
      {Object.keys(allFolders).length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FolderIcon />
            Folders ({Object.keys(allFolders).length})
          </Typography>
          <Grid container spacing={2}>
            {Object.values(allFolders).map((folder) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={folder.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[4],
                    }
                  }}
                  onClick={() => {
                    console.log('📁 Clicked folder:', folder.name);
                    enqueueSnackbar(`Opening folder: ${folder.name}`, { variant: 'info' });
                  }}
                >
                  <CardContent sx={{ p: 2, textAlign: 'center' }}>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 60, height: 60, mx: 'auto', mb: 2 }}>
                      <FolderIcon />
                    </Avatar>
                    <Typography variant="subtitle2" noWrap sx={{ fontWeight: 'bold' }}>
                      {folder.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {folder.itemCount} files • {formatFileSize(folder.totalSize)}
                    </Typography>
                    <Chip 
                      label="FOLDER" 
                      size="small" 
                      sx={{ 
                        backgroundColor: theme.palette.primary.main,
                        color: 'white',
                        fontSize: '0.7rem',
                        mt: 1
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Tabs for All Files vs Images */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab 
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <FileIcon />
                <Typography>All Files ({allFiles.length})</Typography>
              </Box>
            } 
          />
          <Tab 
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <ImageIcon />
                <Typography>Images ({images.length})</Typography>
              </Box>
            } 
          />
        </Tabs>
      </Box>

      {/* Files Content */}
      {isLoadingFiles ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress />
        </Box>
      ) : filteredFiles.length === 0 ? (
        <Alert severity="info">
          <Typography variant="h6" gutterBottom>
            No Files Found
          </Typography>
          <Typography variant="body2">
            {searchTerm ? 'No files match your search.' : 'You haven\'t uploaded any files yet. Start by uploading some files!'}
          </Typography>
        </Alert>
      ) : viewMode === 'grid' ? (
        // Grid View
        <Grid container spacing={3}>
          {filteredFiles.map((item: any) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  }
                }}
                onClick={() => {
                  if (item.type === 'folder') {
                    handleFolderClick(item);
                  } else {
                    handleFileClick(item);
                  }
                }}
              >
                {item.type === 'folder' ? (
                  <Box
                    sx={{
                      height: 200,
                      bgcolor: 'grey.100',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 60, height: 60 }}>
                      <FolderIcon />
                    </Avatar>
                  </Box>
                ) : (
                  item.type === 'image' && item.thumbnailUrl ? (
                    <CardMedia
                      component="img"
                      height="200"
                      image={item.thumbnailUrl}
                      alt={item.name}
                      sx={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: 200,
                        bgcolor: 'grey.100',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Avatar sx={{ bgcolor: getFileTypeColor(item.type), width: 60, height: 60 }}>
                        {getFileIcon(item.type)}
                      </Avatar>
                    </Box>
                  )
                )}

                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle2" noWrap sx={{ fontWeight: 'bold' }}>
                    {item.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {item.type === 'folder' ? 'Folder' : formatFileSize(item.size)}
                  </Typography>
                  <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                    <Chip 
                      label={item.type.toUpperCase()} 
                      size="small" 
                      sx={{ 
                        backgroundColor: item.type === 'folder' ? theme.palette.primary.main : getFileTypeColor(item.type),
                        color: 'white',
                        fontSize: '0.7rem'
                      }}
                    />
                    {item.mateReward && (
                      <Chip 
                        label={`${item.mateReward} MATE`} 
                        size="small" 
                        color="secondary"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 1, pt: 0 }}>
                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); }}>
                    <DownloadIcon />
                  </IconButton>
                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); }}>
                    <ShareIcon />
                  </IconButton>
                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); }}>
                    <FavoriteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        // List View
        <Card>
          <List>
            {filteredFiles.map((item: any) => (
              <ListItem 
                key={item.id}
                component="div"
                onClick={() => {
                  if (item.type === 'folder') {
                    handleFolderClick(item);
                  } else {
                    handleFileClick(item);
                  }
                }}
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { 
                    backgroundColor: theme.palette.action.hover 
                  }
                }}
              >
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: item.type === 'folder' ? theme.palette.primary.main : getFileTypeColor(item.type) }}>
                    {item.type === 'folder' ? <FolderIcon /> : getFileIcon(item.type)}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={item.name}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {item.type === 'folder' ? 'Folder' : `${formatFileSize(item.size)} • ${item.type.toUpperCase()} • ${item.lastModified.toLocaleDateString()}`}
                      </Typography>
                      {item.mateReward && (
                        <Chip 
                          label={`${item.mateReward} MATE`} 
                          size="small" 
                          color="secondary"
                          variant="outlined"
                          sx={{ mt: 0.5 }}
                        />
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton size="small">
                    <DownloadIcon />
                  </IconButton>
                  <IconButton size="small">
                    <ShareIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Card>
      )}

      {/* Breadcrumb */}
      <Box sx={{ mt: 3, mb: 2 }}>
        <Typography variant="h6" color="text.secondary">
          {breadcrumbPath.map((name, index) => (
            <span key={name}>
              {index > 0 && ' / '}
              <Button
                variant="text"
                size="small"
                onClick={() => handleBreadcrumbClick(index - 1)}
                sx={{ textTransform: 'none', color: 'text.secondary' }}
              >
                {name}
              </Button>
            </span>
          ))}
        </Typography>
      </Box>

      {/* Image Preview Dialog */}
      <Dialog
        open={imagePreviewOpen}
        onClose={() => setImagePreviewOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{selectedFile?.name}</Typography>
            <IconButton onClick={() => setImagePreviewOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedFile && selectedFile.thumbnailUrl && (
            <Box display="flex" justifyContent="center">
              <img 
                src={selectedFile.thumbnailUrl} 
                alt={selectedFile.name}
                style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button startIcon={<DownloadIcon />}>
            Download
          </Button>
          <Button startIcon={<ShareIcon />}>
            Share
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
