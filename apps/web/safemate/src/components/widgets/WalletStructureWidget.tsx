/**
 * SafeMate Wallet Structure Widget
 * 
 * Environment: preprod
 * Purpose: Upload files and create folders with drag & drop functionality
 * 
 * Features:
 * - Drag & drop file upload area
 * - Create folder functionality
 * - Upload files button
 * - Clean, focused interface without folder display
 * 
 * Last Updated: September 29, 2025
 * Status: Simplified widget focused on upload and folder creation
 */

import React, { useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  useTheme,
  alpha,
  Paper
} from '@mui/material';
import {
  Storage as StorageIcon,
  CreateNewFolder as CreateFolderIcon,
  FileUpload as FileUploadIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useHedera } from '../../contexts/HederaContext';

interface WalletStructureWidgetProps {
  onRefresh?: () => void;
  onCreateFolder?: () => void;
  onUploadFiles?: () => void;
  canCreateFolder?: boolean;
  canUploadFiles?: boolean;
}

const WalletStructureWidget: React.FC<WalletStructureWidgetProps> = ({
  onRefresh,
  onCreateFolder,
  onUploadFiles, 
  canCreateFolder = true, 
  canUploadFiles = true 
}) => {
  const theme = useTheme();
  const { refreshFolders } = useHedera();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  // Drop zone handlers
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (onUploadFiles) {
      // Create a temporary input element and trigger the upload
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.accept = '*/*';
      input.style.display = 'none';
      document.body.appendChild(input);
      
      // Simulate file selection
      const dataTransfer = new DataTransfer();
      acceptedFiles.forEach(file => dataTransfer.items.add(file));
      input.files = dataTransfer.files;
      
      // Trigger the change event
      const event = new Event('change', { bubbles: true });
      input.dispatchEvent(event);
      
      document.body.removeChild(input);
    }
  }, [onUploadFiles]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDropAccepted: () => setIsDragActive(false),
    onDropRejected: () => setIsDragActive(false),
    maxSize: 50 * 1024 * 1024, // 50MB limit
    noClick: true, // Don't open file dialog on click
    noKeyboard: true // Don't open file dialog on keyboard
  });

  const handleRefresh = async (event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setIsRefreshing(true);
    try {
      await refreshFolders();
      if (onRefresh) {
        onRefresh();
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Card
      {...getRootProps()}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      sx={{
        height: '100%',
        background: isDragActive 
          ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.secondary.main, 0.15)} 100%)`
          : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        border: isDragActive 
          ? `2px dashed ${theme.palette.primary.main}`
          : `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        transition: 'all 0.3s ease',
        position: 'relative',
        '&:hover': {
          border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
        }
      }}
    >
      {/* Hidden dropzone input */}
      <input {...getInputProps()} />
      
      {/* Drag overlay */}
      {isDragActive && (
        <Box
          sx={{
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
            borderRadius: 1
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 3,
              textAlign: 'center',
              backgroundColor: 'background.paper',
              border: `2px dashed ${theme.palette.primary.main}`
            }}
          >
            <CloudUploadIcon 
              sx={{ 
                fontSize: 48, 
                color: 'primary.main', 
                mb: 2 
              }} 
            />
            <Typography variant="h6" color="primary.main" gutterBottom>
              Drop files here to upload
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Files will be uploaded directly to the blockchain
            </Typography>
          </Paper>
        </Box>
      )}
      
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <StorageIcon
              sx={{
                color: 'primary.main',
                mr: 1,
                fontSize: 24
              }}
            />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Creating new folders and Uploading files
            </Typography>
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            mb: 3,
            flexWrap: 'wrap'
          }}
        >
          <Button
            variant="outlined"
            startIcon={<CreateFolderIcon />}
            onClick={onCreateFolder}
            disabled={!canCreateFolder}
            size="small"
            sx={{ 
              borderRadius: 2,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1)
              }
            }}
          >
            Create Folder
          </Button>
          
          <Button
            variant="contained"
            startIcon={<FileUploadIcon />}
            onClick={onUploadFiles}
            disabled={!canUploadFiles}
            size="small"
            sx={{ 
              borderRadius: 2,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.8)
              }
            }}
          >
            Upload Files
          </Button>
        </Box>
        
        {/* Drop Zone Area - At Bottom */}
        <Paper
          sx={{
            p: 3,
            mt: 3,
            textAlign: 'center',
            border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
            backgroundColor: alpha(theme.palette.primary.main, 0.02),
            transition: 'all 0.3s ease',
            '&:hover': {
              border: `2px dashed ${theme.palette.primary.main}`,
              backgroundColor: alpha(theme.palette.primary.main, 0.05)
            }
          }}
        >
          <CloudUploadIcon 
            sx={{ 
              fontSize: 48, 
              color: 'primary.main', 
              mb: 2 
            }} 
          />
          <Typography variant="h6" color="primary.main" gutterBottom>
            Drag & Drop Files Here
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Or click the "Upload Files" button above
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Files will be uploaded directly to the blockchain
          </Typography>
        </Paper>
      </CardContent>
    </Card>
  );
};

export default WalletStructureWidget;