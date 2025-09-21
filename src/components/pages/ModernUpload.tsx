import React, { useState, useCallback, useMemo } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Stack,
  Divider,
  Alert,
  alpha,
  useTheme,
  Paper,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Clear as ClearIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Delete as DeleteIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  Token as TokenIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  Videocam as VideoIcon,
  PictureAsPdf as PdfIcon,
  Description as DocumentIcon,
  Add as AddIcon,
  FolderOpen as FolderIcon,
  CreateNewFolder as CreateFolderIcon,
  FileUpload as FileUploadIcon,
  Security as SecurityIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useSnackbar } from 'notistack';
import { useHedera } from '../../contexts/HederaContext';
import { config } from '../../config/environment';
import ModernStatsCard from '../ModernStatsCard';
import { formatFileSize } from '../../utils/formatters';

interface UploadFile {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
  estimatedReward?: number;
  estimatedCost?: number;
}

export default function ModernUpload() {
  const { folders, uploadFile, refreshFolders, createFolder, isInitialized, isLoading } = useHedera();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  
  const [selectedFolderId, setSelectedFolderId] = useState('');
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedParentFolderId, setSelectedParentFolderId] = useState<string | null>(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  // Transform folders to flat structure for consistency with files component
  const transformedFolders = useMemo(() => {
    const flatFolders: any[] = [];
    
    const processFolder = (folder: any, parentPath: string = '') => {
      const currentPath = parentPath ? `${parentPath}/${folder.name}` : folder.name;
      flatFolders.push({
        ...folder,
        displayName: currentPath,
        fullPath: currentPath
      });
      
      if (folder.subfolders) {
        folder.subfolders.forEach((subfolder: any) => {
          processFolder(subfolder, currentPath);
        });
      }
    };
    
    folders.forEach(folder => {
      processFolder(folder);
    });
    
    return flatFolders;
  }, [folders]);

  const calculateReward = (fileSize: number) => {
    // Base reward: 2 MATE + size-based bonus
    return 2 + Math.floor(fileSize / (1024 * 1024)) * 1.5;
  };

  const calculateCost = (fileSize: number) => {
    // Estimated cost in HBAR
    return (fileSize / (1024 * 1024)) * 0.001;
  };

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
    enqueueSnackbar(`${acceptedFiles.length} file(s) added to upload queue`, { variant: 'success' });
  }, []);

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

  const removeFile = (fileId: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const updateFileStatus = (fileId: string, updates: Partial<UploadFile>) => {
    setUploadFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, ...updates } : f
    ));
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    try {
      setIsCreatingFolder(true);
      
      // Use Hedera context to create folder on blockchain with parent folder
      const newFolderId = await createFolder(newFolderName.trim(), selectedParentFolderId || undefined);
      
      // Set the newly created folder as selected
      setSelectedFolderId(newFolderId);
      
      // Refresh folders to get updated data from blockchain
      await refreshFolders();
      
      setNewFolderName('');
      setSelectedParentFolderId(null);
      setCreateFolderDialogOpen(false);
      
      enqueueSnackbar('Folder created successfully!', { variant: 'success' });
    } catch (error) {
      console.error('Failed to create folder:', error);
      enqueueSnackbar('Failed to create folder', { variant: 'error' });
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFolderId) {
      enqueueSnackbar('Please select a folder first', { variant: 'warning' });
      return;
    }

    const pendingFiles = uploadFiles.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) {
      enqueueSnackbar('No files to upload', { variant: 'info' });
      return;
    }

    setIsUploading(true);

    for (const fileToUpload of pendingFiles) {
      try {
        updateFileStatus(fileToUpload.id, { status: 'uploading', progress: 0 });

        await uploadFile(
          selectedFolderId,
          fileToUpload.file,
          (progress: number) => {
            updateFileStatus(fileToUpload.id, { progress });
          }
        );

        updateFileStatus(fileToUpload.id, { 
          status: 'completed', 
          progress: 100 
        });

        // Add success notification to global notification system
        if ((window as any).addNotification) {
          (window as any).addNotification({
            title: 'File uploaded successfully!',
            description: `${fileToUpload.file.name} • ${formatFileSize(fileToUpload.file.size)} • Earned ${fileToUpload.estimatedReward?.toFixed(1)} MATE`,
            icon: 'upload',
            bgColor: 'success.main'
          });
        }

        enqueueSnackbar(`${fileToUpload.file.name} uploaded successfully!`, { variant: 'success' });

      } catch (error) {
        console.error(`Failed to upload ${fileToUpload.file.name}:`, error);
        updateFileStatus(fileToUpload.id, { 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Upload failed'
        });
        
        // Add error notification to global notification system
        if ((window as any).addNotification) {
          (window as any).addNotification({
            title: 'File upload failed',
            description: `${fileToUpload.file.name} • ${error instanceof Error ? error.message : 'Upload failed'}`,
            icon: 'folder',
            bgColor: 'error.main'
          });
        }
      }
    }

    await refreshFolders();
    setIsUploading(false);
    
    const completedCount = uploadFiles.filter(f => f.status === 'completed').length;
    const errorCount = uploadFiles.filter(f => f.status === 'error').length;
    
    if (completedCount > 0) {
      enqueueSnackbar(`${completedCount} file(s) uploaded successfully!`, { variant: 'success' });
    }
    if (errorCount > 0) {
      enqueueSnackbar(`${errorCount} file(s) failed to upload`, { variant: 'error' });
    }
  };

  const clearCompleted = () => {
    setUploadFiles(prev => prev.filter(f => f.status !== 'completed'));
  };

  const clearAll = () => {
    setUploadFiles([]);
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return <ImageIcon />;
      case 'mp4':
      case 'mov':
      case 'avi':
      case 'mkv':
        return <VideoIcon />;
      case 'pdf':
        return <PdfIcon />;
      case 'doc':
      case 'docx':
      case 'txt':
        return <DocumentIcon />;
      default:
        return <FileIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'default';
      case 'uploading': return 'warning';
      case 'completed': return 'success';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <ScheduleIcon />;
      case 'uploading': return <CloudUploadIcon />;
      case 'completed': return <CheckCircleIcon />;
      case 'error': return <ErrorIcon />;
      default: return <FileIcon />;
    }
  };

  // Show loading state while Hedera context is initializing
  if (!config.isDemoMode && (isLoading || !isInitialized)) {
    return (
      <Box sx={{ 
        background: 'linear-gradient(135deg, #f5f7ff 0%, #ffffff 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
            Loading Upload Interface...
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Preparing your secure file upload system
          </Typography>
        </Container>
      </Box>
    );
  }

  const totalFiles = uploadFiles.length;
  const totalSize = uploadFiles.reduce((sum, file) => sum + file.file.size, 0);
  const totalReward = uploadFiles.reduce((sum, file) => sum + (file.estimatedReward || 0), 0);
  const totalCost = uploadFiles.reduce((sum, file) => sum + (file.estimatedCost || 0), 0);
  const completedFiles = uploadFiles.filter(f => f.status === 'completed').length;
  const pendingFiles = uploadFiles.filter(f => f.status === 'pending').length;
  const errorFiles = uploadFiles.filter(f => f.status === 'error').length;

  return (
    <Box sx={{ 
      background: theme.palette.mode === 'dark' 
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
        : 'linear-gradient(135deg, #f5f7ff 0%, #ffffff 100%)',
      minHeight: '100vh',
      pb: 4,
    }}>
      <Container maxWidth="xl" sx={{ pt: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 800,
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #8b9dff 0%, #9d7bd6 100%)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
            }}
          >
            Upload Files 📤
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
            Securely upload files to the Hedera blockchain
          </Typography>
        </Box>

        {/* Upload Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <ModernStatsCard
              title="Queued Files"
              value={totalFiles}
              subtitle="Ready to upload"
              icon={<StorageIcon />}
              color="primary"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <ModernStatsCard
              title="Total Size"
              value={formatFileSize(totalSize)}
              subtitle="Upload volume"
              icon={<SpeedIcon />}
              color="info"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <ModernStatsCard
              title="MATE Rewards"
              value={totalReward.toFixed(1)}
              subtitle="Estimated earnings"
              icon={<TokenIcon />}
              color="warning"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <ModernStatsCard
              title="Est. Cost"
              value={`${totalCost.toFixed(3)} ℏ`}
              subtitle="Network fees"
              icon={<MoneyIcon />}
              color="success"
            />
          </Grid>
        </Grid>

        <Grid container spacing={4}>
          {/* Upload Zone */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ borderRadius: 3, mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  📁 Select Destination
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <FormControl fullWidth>
                    <InputLabel>Select Folder</InputLabel>
                    <Select
                      value={selectedFolderId}
                      label="Select Folder"
                      onChange={(e) => setSelectedFolderId(e.target.value)}
                    >
                      {transformedFolders.map((folder) => (
                        <MenuItem key={folder.id} value={folder.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FolderIcon fontSize="small" />
                            <Box>
                              <Typography variant="body2">{folder.displayName}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {folder.files.length} files
                              </Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setCreateFolderDialogOpen(true)}
                    sx={{ whiteSpace: 'nowrap', borderRadius: 2 }}
                  >
                    New Folder
                  </Button>
                </Box>
                
                {transformedFolders.length === 0 && (
                  <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                    <Typography variant="body2">
                      No folders available. Create your first folder to get started.
                    </Typography>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Drag & Drop Zone */}
            <Card sx={{ borderRadius: 3, mb: 3 }}>
              <CardContent>
                <Box {...getRootProps()}>
                  <input {...getInputProps()} />
                  <Paper
                    sx={{
                      p: 6,
                      textAlign: 'center',
                      border: '2px dashed',
                      borderColor: isDragActive ? 'primary.main' : 'grey.300',
                      backgroundColor: isDragActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                      borderRadius: 3,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      },
                    }}
                  >
                    <Avatar sx={{ 
                      width: 100, 
                      height: 100, 
                      mx: 'auto', 
                      mb: 3,
                      bgcolor: 'primary.main'
                    }}>
                      <CloudUploadIcon sx={{ fontSize: 50 }} />
                    </Avatar>
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                      {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      Or click to browse and select files from your computer
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Maximum file size: 50MB per file
                    </Typography>
                    
                    <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 2 }}>
                      <Chip 
                        icon={<SecurityIcon />}
                        label="Auto-encrypted" 
                        color="primary" 
                        variant="outlined"
                        sx={{ borderRadius: 3 }}
                      />
                      <Chip 
                        icon={<TokenIcon />}
                        label="Earn MATE rewards" 
                        color="success" 
                        variant="outlined"
                        sx={{ borderRadius: 3 }}
                      />
                      <Chip 
                        icon={<SpeedIcon />}
                        label="Blockchain storage" 
                        color="secondary" 
                        variant="outlined"
                        sx={{ borderRadius: 3 }}
                      />
                    </Stack>
                    
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<CloudUploadIcon />}
                      sx={{ borderRadius: 3, px: 4 }}
                    >
                      Select Files
                    </Button>
                  </Paper>
                </Box>
              </CardContent>
            </Card>

            {/* Upload Queue */}
            {uploadFiles.length > 0 && (
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight={700}>
                      📋 Upload Queue ({uploadFiles.length} files)
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {completedFiles > 0 && (
                        <Button 
                          onClick={clearCompleted} 
                          size="small"
                          variant="outlined"
                          sx={{ borderRadius: 2 }}
                        >
                          Clear Completed
                        </Button>
                      )}
                      <Button 
                        onClick={clearAll} 
                        size="small"
                        variant="outlined"
                        color="error"
                        sx={{ borderRadius: 2 }}
                      >
                        Clear All
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleUpload}
                        disabled={isUploading || !selectedFolderId || pendingFiles === 0}
                        startIcon={<CloudUploadIcon />}
                        sx={{ borderRadius: 2 }}
                      >
                        {isUploading ? 'Uploading...' : `Upload ${pendingFiles} Files`}
                      </Button>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  <List>
                    {uploadFiles.map((file) => (
                      <ListItem key={file.id} sx={{ py: 1, px: 0 }}>
                        <ListItemIcon>
                          <Avatar sx={{ 
                            width: 40, 
                            height: 40, 
                            bgcolor: `${getStatusColor(file.status)}.main`
                          }}>
                            {getFileIcon(file.file.name)}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body1" fontWeight={600}>
                                {file.file.name}
                              </Typography>
                              <Chip
                                label={file.status}
                                color={getStatusColor(file.status) as any}
                                size="small"
                                sx={{ borderRadius: 3 }}
                              />
                            </Box>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary">
                              {formatFileSize(file.file.size)} • 
                              Reward: {file.estimatedReward?.toFixed(1)} MATE • 
                              Cost: {file.estimatedCost?.toFixed(3)} ℏ
                            </Typography>
                          }
                        />
                        {file.status === 'uploading' && (
                          <Box sx={{ mt: 1, width: '100%' }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={file.progress} 
                              sx={{ height: 6, borderRadius: 3 }}
                            />
                          </Box>
                        )}
                        {file.error && (
                          <Box sx={{ mt: 1 }}>
                            <Alert severity="error" sx={{ py: 0 }}>
                              {file.error}
                            </Alert>
                          </Box>
                        )}
                        <ListItemSecondaryAction>
                          {file.status === 'pending' && (
                            <IconButton
                              onClick={() => removeFile(file.id)}
                              color="error"
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          )}
                          {file.status === 'completed' && (
                            <Chip
                              icon={<CheckCircleIcon />}
                              label="Completed"
                              color="success"
                              size="small"
                              sx={{ borderRadius: 3 }}
                            />
                          )}
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={4}>
            {/* Upload Progress Summary */}
            <Card sx={{ mb: 3, borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  📊 Upload Summary
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Total Files</Typography>
                    <Typography variant="body2" fontWeight={600}>{totalFiles}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Completed</Typography>
                    <Typography variant="body2" fontWeight={600} color="success.main">
                      {completedFiles}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Pending</Typography>
                    <Typography variant="body2" fontWeight={600} color="warning.main">
                      {pendingFiles}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Failed</Typography>
                    <Typography variant="body2" fontWeight={600} color="error.main">
                      {errorFiles}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Created Items Window */}
            <Card sx={{ mb: 3, borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight={700}>
                    📁 Created Items
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={refreshFolders}
                      sx={{ 
                        color: 'primary.main',
                        '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.1) }
                      }}
                    >
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                    <Chip
                      label={`${transformedFolders.length} folders`}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ borderRadius: 2 }}
                    />
                  </Box>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                {transformedFolders.length > 0 ? (
                  <Stack spacing={1}>
                    {transformedFolders.slice(0, 5).map((folder) => (
                      <Box
                        key={folder.id}
                        onClick={() => setSelectedFolderId(folder.id)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          p: 1.5,
                          borderRadius: 2,
                          backgroundColor: selectedFolderId === folder.id 
                            ? alpha(theme.palette.primary.main, 0.15)
                            : alpha(theme.palette.primary.main, 0.05),
                          border: `1px solid ${
                            selectedFolderId === folder.id 
                              ? alpha(theme.palette.primary.main, 0.3)
                              : alpha(theme.palette.primary.main, 0.1)
                          }`,
                          transition: 'all 0.2s ease-in-out',
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            borderColor: alpha(theme.palette.primary.main, 0.2),
                            transform: 'translateY(-1px)',
                            boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.2)}`,
                          }
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: 'primary.main',
                            fontSize: '0.875rem'
                          }}
                        >
                          <FolderIcon fontSize="small" />
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography 
                            variant="body2" 
                            fontWeight={600}
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {folder.name}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              display: 'block'
                            }}
                          >
                            {folder.files.length} files • {formatFileSize(folder.files.reduce((sum, file) => sum + file.size, 0))}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                          <Chip
                            label={selectedFolderId === folder.id ? "Selected" : "Active"}
                            size="small"
                            color={selectedFolderId === folder.id ? "primary" : "success"}
                            variant={selectedFolderId === folder.id ? "filled" : "outlined"}
                            sx={{ borderRadius: 2, fontSize: '0.75rem' }}
                          />
                          {folder.files.length > 0 && (
                            <Typography variant="caption" color="text.secondary">
                              {folder.files.length} files
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    ))}
                    
                    {transformedFolders.length > 5 && (
                      <Box sx={{ textAlign: 'center', pt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          +{transformedFolders.length - 5} more folders
                        </Typography>
                      </Box>
                    )}
                    
                    <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        startIcon={<FolderIcon />}
                        onClick={() => {
                          // Navigate to MyFiles page or open folder management
                          if (window.location.pathname !== '/myfiles') {
                            window.location.href = '/myfiles';
                          }
                        }}
                        sx={{ borderRadius: 2 }}
                      >
                        View All Folders
                      </Button>
                    </Box>
                  </Stack>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        mx: 'auto',
                        mb: 2,
                        bgcolor: alpha(theme.palette.grey[500], 0.1)
                      }}
                    >
                      <FolderIcon color="disabled" />
                    </Avatar>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      No folders created yet
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Create your first folder to organize your files
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Upload Tips */}
            <Card sx={{ mb: 3, borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  💡 Upload Tips
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <SecurityIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Auto-encryption"
                      secondary="Files are automatically encrypted before upload"
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <TokenIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Earn rewards"
                      secondary="Get MATE tokens for each file uploaded"
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <SpeedIcon color="info" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Blockchain storage"
                      secondary="Files are stored on Hedera network"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            {/* Help & Support */}
            <Accordion sx={{ borderRadius: 3 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight={700}>
                  ❓ Help & Support
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    <Typography variant="body2">
                      <strong>File Size Limit:</strong> Maximum 50MB per file
                    </Typography>
                  </Alert>
                  <Alert severity="success" sx={{ borderRadius: 2 }}>
                    <Typography variant="body2">
                      <strong>Supported Formats:</strong> All file types supported
                    </Typography>
                  </Alert>
                  <Alert severity="warning" sx={{ borderRadius: 2 }}>
                    <Typography variant="body2">
                      <strong>Network Fees:</strong> Small HBAR fees apply for blockchain storage
                    </Typography>
                  </Alert>
                </Stack>
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>

        {/* Create Folder Dialog */}
        <Dialog 
          open={createFolderDialogOpen} 
          onClose={() => setCreateFolderDialogOpen(false)}
          PaperProps={{ 
            sx: { 
              borderRadius: 3,
              zIndex: 1300, // Ensure dialog is above other elements
            } 
          }}
          BackdropProps={{
            sx: {
              zIndex: 1299, // Ensure backdrop is below dialog but above other elements
            }
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Folder Name"
              fullWidth
              variant="outlined"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
              sx={{ mb: 2 }}
            />
            
            <FormControl fullWidth margin="dense">
              <InputLabel>Parent Folder (Optional)</InputLabel>
              <Select
                value={selectedParentFolderId || ''}
                label="Parent Folder (Optional)"
                onChange={(e) => setSelectedParentFolderId(e.target.value || null)}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      zIndex: 1400, // Ensure dropdown menu is above dialog
                      maxHeight: 300, // Limit height to prevent overflow
                    }
                  },
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'left',
                  },
                  transformOrigin: {
                    vertical: 'top',
                    horizontal: 'left',
                  },
                }}
              >
                <MenuItem value="">
                  <em>Root Level (No Parent)</em>
                </MenuItem>
                {transformedFolders.map((folder) => (
                  <MenuItem key={folder.id} value={folder.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FolderIcon fontSize="small" />
                      <Typography variant="body2">{folder.displayName}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setCreateFolderDialogOpen(false);
              setSelectedParentFolderId(null);
            }}>
              Cancel
            </Button>
                           <Button 
                 onClick={handleCreateFolder}
                 disabled={!newFolderName.trim() || isCreatingFolder}
                 variant="contained"
               >
                 {isCreatingFolder ? 'Creating...' : 'Create'}
               </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
} 