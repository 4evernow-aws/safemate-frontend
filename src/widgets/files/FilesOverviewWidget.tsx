import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Chip,
  Avatar,
  Divider
} from '@mui/material';
import { 
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  Add as AddIcon,
  VisibilityOff as EmptyIcon
} from '@mui/icons-material';
import type { WidgetProps } from '../../dashboard/core/DashboardProvider';
import BaseWidget from '../shared/BaseWidget';
import { createWidget, WidgetRegistry } from '../../dashboard/core/WidgetRegistry';
import { useHedera } from '../../contexts/HederaContext';
import { useNavigate } from 'react-router-dom';

const FilesOverviewWidget: React.FC<WidgetProps> = ({ widgetId, accountType, onAction }) => {
  const { folders, isLoading, error, refreshFolders } = useHedera();
  const navigate = useNavigate();
  const [displayFolders, setDisplayFolders] = useState<any[]>([]);

  useEffect(() => {
    // Show only the first 5 folders for the overview
    setDisplayFolders(folders.slice(0, 5));
  }, [folders]);

  const handleRefresh = async () => {
    try {
      await refreshFolders();
      onAction?.('files-refreshed', { widgetId, folderCount: folders.length });
    } catch (error) {
      console.error('Failed to refresh folders:', error);
    }
  };

  const handleViewAllFiles = () => {
    navigate('/app/files');
    onAction?.('view-all-files', { widgetId });
  };

  const handleUploadFiles = () => {
    navigate('/app/upload');
    onAction?.('upload-files', { widgetId });
  };

  const renderFilesList = () => {
    if (folders.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <EmptyIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Files Yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Upload your first file to get started
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleUploadFiles}
            size="small"
          >
            Upload Files
          </Button>
        </Box>
      );
    }

    return (
      <Box>
        <List dense sx={{ py: 0 }}>
          {displayFolders.map((folder, index) => (
            <React.Fragment key={folder.id}>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light' }}>
                    <FolderIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {folder.name || `Folder ${index + 1}`}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <FileIcon sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {folder.files?.length || 0} files
                      </Typography>
                      {folder.updatedAt && (
                        <Chip
                          label="Recent"
                          size="small"
                          color="success"
                          sx={{ 
                            ml: 1, 
                            height: 16, 
                            fontSize: '0.6rem',
                            '& .MuiChip-label': { px: 1 }
                          }}
                        />
                      )}
                    </Box>
                  }
                />
              </ListItem>
              {index < displayFolders.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>

        {folders.length > 5 && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Showing 5 of {folders.length} folders
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="outlined" 
            size="small"
            startIcon={<FolderIcon />}
            onClick={handleViewAllFiles}
            fullWidth
          >
            View All
          </Button>
          <Button 
            variant="contained" 
            size="small"
            startIcon={<AddIcon />}
            onClick={handleUploadFiles}
            fullWidth
          >
            Upload
          </Button>
        </Box>
      </Box>
    );
  };

  return (
    <BaseWidget
      widgetId={widgetId}
      accountType={accountType}
      title="Files Overview"
      subtitle="Your stored files and folders"
      loading={isLoading}
      error={error}
      onRefresh={handleRefresh}
    >
      {renderFilesList()}
    </BaseWidget>
  );
};

export const FilesOverviewWidgetDefinition = createWidget({
  id: 'files-overview',
  name: 'Files Overview',
  component: FilesOverviewWidget,
  category: 'files',
  permissions: ['personal', 'family', 'business', 'community', 'sporting', 'cultural'],
  gridSize: { cols: 6, rows: 8 },
  priority: 12,
});

WidgetRegistry.register(FilesOverviewWidgetDefinition);

export default FilesOverviewWidget;
