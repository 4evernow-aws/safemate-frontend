import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  IconButton,
  Divider,
  Stack,
  Avatar,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  VideoFile as VideoIcon,
  PictureAsPdf as PdfIcon,
  Description as DocumentIcon,
  Archive as ArchiveIcon,
  Code as CodeIcon,
  AudioFile as AudioIcon,
  Info as InfoIcon,
  Security as SecurityIcon,
  Token as TokenIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useHedera } from '../../contexts/HederaContext';

interface FileDetailsModalProps {
  open: boolean;
  onClose: () => void;
  file: {
    id: string;
    name: string;
    type: string;
    size: number;
    lastModified: Date;
    mateReward?: number;
    isShared?: boolean;
  } | null;
}

export default function FileDetailsModal({ open, onClose, file }: FileDetailsModalProps) {
  const { enqueueSnackbar } = useSnackbar();
  const { getFileContent } = useHedera();
  const [isDownloading, setIsDownloading] = useState(false);

  if (!file) return null;

  const getFileIcon = (type: string) => {
    const iconProps = { sx: { fontSize: 40 } };
    switch (type.toLowerCase()) {
      case 'pdf': return <PdfIcon {...iconProps} color="error" />;
      case 'jpg': case 'jpeg': case 'png': case 'gif': case 'svg': return <ImageIcon {...iconProps} color="primary" />;
      case 'mp4': case 'avi': case 'mov': case 'wmv': return <VideoIcon {...iconProps} color="secondary" />;
      case 'mp3': case 'wav': case 'flac': return <AudioIcon {...iconProps} color="info" />;
      case 'zip': case 'rar': case '7z': return <ArchiveIcon {...iconProps} color="warning" />;
      case 'js': case 'ts': case 'tsx': case 'jsx': case 'html': case 'css': case 'py': case 'java': return <CodeIcon {...iconProps} color="success" />;
      case 'doc': case 'docx': case 'txt': return <DocumentIcon {...iconProps} color="info" />;
      default: return <FileIcon {...iconProps} />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      
      // Get file content from Hedera
      const content = await getFileContent(file.id);
      
      // Create download link
      const blob = new Blob([content]);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      enqueueSnackbar('File downloaded successfully!', { variant: 'success' });
    } catch (error) {
      console.error('Failed to download file:', error);
      enqueueSnackbar('Failed to download file', { variant: 'error' });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = () => {
    // TODO: Implement sharing functionality
    enqueueSnackbar('Sharing functionality coming soon!', { variant: 'info' });
  };

  const handleDelete = () => {
    // TODO: Implement delete functionality
    enqueueSnackbar('Delete functionality coming soon!', { variant: 'info' });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.light' }}>
            {getFileIcon(file.type)}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              File Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {file.name}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          {/* File Info */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              File Information
            </Typography>
            <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 2 }}>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Name:</Typography>
                  <Typography variant="body2">{file.name}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Type:</Typography>
                  <Chip label={file.type.toUpperCase()} size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Size:</Typography>
                  <Typography variant="body2">{formatFileSize(file.size)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Modified:</Typography>
                  <Typography variant="body2">{file.lastModified.toLocaleDateString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Status:</Typography>
                  <Chip 
                    label={file.isShared ? "Shared" : "Private"} 
                    size="small" 
                    color={file.isShared ? "primary" : "default"}
                  />
                </Box>
              </Stack>
            </Box>
          </Box>

          <Divider />

          {/* Blockchain Info */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Blockchain Information
            </Typography>
            <Box sx={{ bgcolor: 'success.50', p: 2, borderRadius: 2 }}>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Network:</Typography>
                  <Chip label="Hedera Testnet" size="small" color="success" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">File ID:</Typography>
                  <Typography variant="body2" fontFamily="monospace">{file.id}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Security:</Typography>
                  <Chip label="Encrypted" size="small" color="success" />
                </Box>
              </Stack>
            </Box>
          </Box>

          {/* MATE Rewards */}
          {file.mateReward && (
            <>
              <Divider />
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  <TokenIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  MATE Rewards
                </Typography>
                <Alert severity="success" sx={{ borderRadius: 2 }}>
                  <Typography variant="body2">
                    This file has earned you <strong>+{file.mateReward} MATE tokens</strong>!
                  </Typography>
                </Alert>
              </Box>
            </>
          )}

          {/* Download Progress */}
          {isDownloading && (
            <Box>
              <Typography variant="body2" gutterBottom>
                Downloading from blockchain...
              </Typography>
              <LinearProgress />
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button
          variant="outlined"
          startIcon={<ShareIcon />}
          onClick={handleShare}
        >
          Share
        </Button>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => enqueueSnackbar('Rename functionality coming soon!', { variant: 'info' })}
        >
          Rename
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={handleDelete}
        >
          Delete
        </Button>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
          disabled={isDownloading}
        >
          {isDownloading ? 'Downloading...' : 'Download'}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 