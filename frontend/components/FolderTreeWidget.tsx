import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Collapse, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  ListItemSecondaryAction,
  Chip,
  Tooltip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  InsertDriveFile as FileIcon
} from '@mui/icons-material';

// Types
interface FolderMetadata {
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

interface FolderTreeWidgetProps {
  folders: FolderMetadata[];
  loading?: boolean;
  onCreateFolder?: (name: string, parentFolderId?: string) => Promise<void>;
  onDeleteFolder?: (folderId: string) => Promise<void>;
  onUpdateFolder?: (folderId: string, updates: Partial<FolderMetadata>) => Promise<void>;
  onShareFolder?: (folderId: string) => Promise<void>;
}

// Icon mapping
const iconMap: Record<string, React.ReactElement> = {
  'folder': <FolderIcon />,
  'folder-open': <FolderOpenIcon />,
  'briefcase': <FolderOpenIcon />,
  'documents': <FolderIcon />,
  'work': <FolderOpenIcon />
};

// Color mapping
const colorMap: Record<string, string> = {
  '#3498db': '#1976d2',
  '#e74c3c': '#d32f2f',
  '#2ecc71': '#388e3c',
  '#f39c12': '#f57c00',
  '#9b59b6': '#7b1fa2'
};

const FolderTreeWidget: React.FC<FolderTreeWidgetProps> = ({
  folders,
  loading = false,
  onCreateFolder,
  onDeleteFolder,
  onUpdateFolder,
  onShareFolder
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    folder: FolderMetadata | null;
  } | null>(null);
  const [createDialog, setCreateDialog] = useState<{
    open: boolean;
    parentFolderId?: string;
  }>({ open: false });
  const [newFolderName, setNewFolderName] = useState('');
  const [creating, setCreating] = useState(false);

  // Auto-expand root folders
  useEffect(() => {
    const rootFolders = folders.filter(f => !f.parentFolderId);
    const newExpanded = new Set(expandedFolders);
    rootFolders.forEach(folder => {
      if (folder.ui.isExpanded) {
        newExpanded.add(folder.id);
      }
    });
    setExpandedFolders(newExpanded);
  }, [folders]);

  const handleToggleExpand = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleContextMenu = (event: React.MouseEvent, folder: FolderMetadata) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX + 2,
      mouseY: event.clientY - 6,
      folder
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleCreateSubfolder = (parentFolderId: string) => {
    setCreateDialog({ open: true, parentFolderId });
    handleCloseContextMenu();
  };

  const handleCreateRootFolder = () => {
    setCreateDialog({ open: true });
    handleCloseContextMenu();
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !onCreateFolder) return;
    
    setCreating(true);
    try {
      await onCreateFolder(newFolderName.trim(), createDialog.parentFolderId);
      setNewFolderName('');
      setCreateDialog({ open: false });
    } catch (error) {
      console.error('Error creating folder:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (!onDeleteFolder) return;
    
    try {
      await onDeleteFolder(folderId);
    } catch (error) {
      console.error('Error deleting folder:', error);
    }
    handleCloseContextMenu();
  };

  const handleShareFolder = async (folderId: string) => {
    if (!onShareFolder) return;
    
    try {
      await onShareFolder(folderId);
    } catch (error) {
      console.error('Error sharing folder:', error);
    }
    handleCloseContextMenu();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderFolder = (folder: FolderMetadata, level: number = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const hasChildren = folders.some(f => f.parentFolderId === folder.id);
    const IconComponent = iconMap[folder.ui.icon] || <FolderIcon />;
    const folderColor = colorMap[folder.ui.color] || folder.ui.color;

    return (
      <Box key={folder.id}>
        <ListItem
          sx={{
            pl: 2 + level * 2,
            py: 0.5,
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)'
            }
          }}
          onContextMenu={(e) => handleContextMenu(e, folder)}
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            {hasChildren ? (
              <IconButton
                size="small"
                onClick={() => handleToggleExpand(folder.id)}
                sx={{ p: 0.5 }}
              >
                {isExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
              </IconButton>
            ) : (
              <Box sx={{ width: 24, height: 24 }} />
            )}
          </ListItemIcon>
          
          <ListItemIcon sx={{ minWidth: 32, color: folderColor }}>
            {IconComponent}
          </ListItemIcon>
          
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: folder.folderType === 'root' ? 600 : 400 }}>
                  {folder.name}
                </Typography>
                {folder.permissions.isPublic && (
                  <Chip
                    size="small"
                    label="Public"
                    color="success"
                    variant="outlined"
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                )}
                {folder.tags.length > 0 && (
                  <Chip
                    size="small"
                    label={folder.tags[0]}
                    variant="outlined"
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                )}
              </Box>
            }
            secondary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {folder.fileSummary.totalFiles} files
                </Typography>
                {folder.fileSummary.totalSize > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    {formatFileSize(folder.fileSummary.totalSize)}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary">
                  {new Date(folder.updatedAt).toLocaleDateString()}
                </Typography>
              </Box>
            }
          />
          
          <ListItemSecondaryAction>
            <Tooltip title="Folder actions">
              <IconButton
                size="small"
                onClick={(e) => handleContextMenu(e, folder)}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </ListItemSecondaryAction>
        </ListItem>
        
        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {folders
                .filter(f => f.parentFolderId === folder.id)
                .sort((a, b) => a.ui.sortOrder - b.ui.sortOrder)
                .map(childFolder => renderFolder(childFolder, level + 1))}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (folders.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <FolderIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No folders yet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Create your first folder to get started
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateRootFolder}
        >
          Create Folder
        </Button>
      </Box>
    );
  }

  const rootFolders = folders
    .filter(f => !f.parentFolderId)
    .sort((a, b) => a.ui.sortOrder - b.ui.sortOrder);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Folders</Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleCreateRootFolder}
        >
          New Folder
        </Button>
      </Box>
      
      <List>
        {rootFolders.map(folder => renderFolder(folder))}
      </List>

      {/* Context Menu */}
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={() => handleCreateSubfolder(contextMenu?.folder?.id || '')}>
          <ListItemIcon>
            <AddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Create Subfolder</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleShareFolder(contextMenu?.folder?.id || '')}>
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share Folder</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleDeleteFolder(contextMenu?.folder?.id || '')}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete Folder</ListItemText>
        </MenuItem>
      </Menu>

      {/* Create Folder Dialog */}
      <Dialog open={createDialog.open} onClose={() => setCreateDialog({ open: false })}>
        <DialogTitle>
          {createDialog.parentFolderId ? 'Create Subfolder' : 'Create Folder'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            fullWidth
            variant="outlined"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCreateFolder();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog({ open: false })}>Cancel</Button>
          <Button
            onClick={handleCreateFolder}
            variant="contained"
            disabled={!newFolderName.trim() || creating}
          >
            {creating ? <CircularProgress size={20} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FolderTreeWidget;
