/**
 * SafeMate Folder Tree Widget
 * 
 * Environment: preprod
 * Purpose: Display hierarchical folder structure with search functionality
 * 
 * Features:
 * - Hierarchical folder tree display
 * - Expandable/collapsible folder levels
 * - Search functionality for folders
 * - Real-time updates when folders are created
 * - Clean tree structure visualization
 * 
 * Last Updated: September 29, 2025
 * Status: New widget for folder hierarchy display with search
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Collapse,
  Chip,
  Stack,
  Avatar,
  useTheme,
  alpha,
  Divider,
  Tooltip,
  TextField,
  InputAdornment,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Search as SearchIcon,
  AccountTree as TreeIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useHedera } from '../../contexts/HederaContext';

interface FolderTreeWidgetProps {
  onRefresh?: () => void;
  onFolderSelect?: (folderId: string, folderName: string) => void;
}

interface FolderNode {
  id: string;
  name: string;
  parentFolderId?: string;
  level: number;
  children: FolderNode[];
  isExpanded: boolean;
}

const FolderTreeWidget: React.FC<FolderTreeWidgetProps> = ({
  onRefresh,
  onFolderSelect
}) => {
  const theme = useTheme();
  const { folders, isLoading, refreshFolders } = useHedera();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Build hierarchical folder tree
  const folderTree = useMemo(() => {
    console.log('🔍 DEBUG: Building folder tree from folders:', folders);
    
    const folderMap = new Map<string, FolderNode>();
    const rootFolders: FolderNode[] = [];

    // Create folder nodes
    folders.forEach(folder => {
      console.log('🔍 DEBUG: Processing folder:', {
        id: folder.id,
        name: folder.name,
        parentFolderId: folder.parentFolderId,
        hasSubfolders: folder.subfolders?.length || 0
      });
      
      folderMap.set(folder.id, {
        id: folder.id,
        name: folder.name,
        parentFolderId: folder.parentFolderId,
        level: (folder as any).level || 0,
        children: [],
        isExpanded: expandedFolders.has(folder.id)
      });
    });

    // Smart hierarchy detection based on folder names
    // If parentFolderId is null, try to infer parent-child relationships from names
    const inferHierarchy = () => {
      folders.forEach(folder => {
        const node = folderMap.get(folder.id);
        if (node && !folder.parentFolderId) {
          // Look for a potential parent folder based on name patterns
          const potentialParent = folders.find(f => 
            f.id !== folder.id && 
            !f.parentFolderId &&
            (folder.name.toLowerCase().includes(f.name.toLowerCase()) ||
             f.name.toLowerCase().includes('test') && folder.name.toLowerCase().includes('sub'))
          );
          
          if (potentialParent) {
            const parentNode = folderMap.get(potentialParent.id);
            if (parentNode) {
              console.log('🔍 DEBUG: Smart hierarchy - Adding child', folder.name, 'to parent', potentialParent.name);
              parentNode.children.push(node);
              return; // Skip adding to root folders
            }
          }
        }
      });
    };

    // First try normal hierarchy building
    folders.forEach(folder => {
      const node = folderMap.get(folder.id);
      if (node && folder.parentFolderId) {
        const parent = folderMap.get(folder.parentFolderId);
        if (parent) {
          console.log('🔍 DEBUG: Adding child', folder.name, 'to parent', parent.name);
          parent.children.push(node);
        } else {
          console.log('🔍 DEBUG: Parent not found for folder', folder.name, 'parentId:', folder.parentFolderId);
        }
      }
    });

    // If no proper hierarchy found, try smart inference
    const hasProperHierarchy = folders.some(f => f.parentFolderId);
    if (!hasProperHierarchy) {
      console.log('🔍 DEBUG: No proper hierarchy found, using smart inference');
      inferHierarchy();
    }

    // Identify root folders (those without parents or with parents not in the list)
    folders.forEach(folder => {
      const node = folderMap.get(folder.id);
      if (node && (!folder.parentFolderId || !folderMap.has(folder.parentFolderId))) {
        // Check if this node was already added as a child
        const isChild = Array.from(folderMap.values()).some(f => 
          f.children.some(child => child.id === node.id)
        );
        
        if (!isChild) {
          console.log('🔍 DEBUG: Adding root folder:', folder.name);
          rootFolders.push(node);
        }
      }
    });
    
    console.log('🔍 DEBUG: Final root folders:', rootFolders.map(f => f.name));
    console.log('🔍 DEBUG: Final folder tree structure:', rootFolders);

    // Sort folders alphabetically
    const sortFolders = (folderList: FolderNode[]) => {
      folderList.sort((a, b) => a.name.localeCompare(b.name));
      folderList.forEach(folder => sortFolders(folder.children));
    };

    sortFolders(rootFolders);
    return rootFolders;
  }, [folders, expandedFolders]);

  // Filter folders based on search query
  const filteredTree = useMemo(() => {
    if (!searchQuery.trim()) return folderTree;

    const searchLower = searchQuery.toLowerCase();
    
    const filterFolders = (folderList: FolderNode[]): FolderNode[] => {
      return folderList
        .map(folder => ({
          ...folder,
          children: filterFolders(folder.children)
        }))
        .filter(folder => 
          folder.name.toLowerCase().includes(searchLower) ||
          folder.children.length > 0
        );
    };

    return filterFolders(folderTree);
  }, [folderTree, searchQuery]);

  // Auto-expand root level folders only
  useEffect(() => {
    if (folderTree.length > 0) {
      const newExpanded = new Set(expandedFolders);
      folderTree.forEach(folder => {
        // Only auto-expand root level folders, not their children
        if (!newExpanded.has(folder.id)) {
          newExpanded.add(folder.id);
        }
      });
      setExpandedFolders(newExpanded);
    }
  }, [folderTree]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        onRefresh();
      } else {
        await refreshFolders();
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleToggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const handleFolderClick = (folderId: string, folderName: string) => {
    if (onFolderSelect) {
      onFolderSelect(folderId, folderName);
    }
  };

  const renderFolderNode = (folder: FolderNode, depth: number = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const hasChildren = folder.children.length > 0;
    const isSearchActive = searchQuery.trim().length > 0;
    const isHighlighted = isSearchActive && folder.name.toLowerCase().includes(searchQuery.toLowerCase());

    return (
      <Box key={folder.id}>
        <ListItemButton
          onClick={() => handleFolderClick(folder.id, folder.name)}
          sx={{
            pl: 2 + depth * 2,
            py: 0.5,
            backgroundColor: isHighlighted ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.05)
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            {hasChildren ? (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleFolder(folder.id);
                }}
                sx={{ p: 0.5 }}
              >
                {isExpanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
              </IconButton>
            ) : (
              <Box sx={{ width: 24, height: 24 }} />
            )}
          </ListItemIcon>
          
          <Avatar
            sx={{
              width: 20,
              height: 20,
              mr: 1,
              bgcolor: isExpanded ? 'primary.main' : 'grey.400'
            }}
          >
            {isExpanded ? <FolderOpenIcon fontSize="small" /> : <FolderIcon fontSize="small" />}
          </Avatar>
          
          <ListItemText
            primary={
              <Typography
                variant="body2"
                sx={{
                  fontWeight: isHighlighted ? 600 : 400,
                  color: isHighlighted ? 'primary.main' : 'text.primary'
                }}
              >
                {folder.name}
              </Typography>
            }
            secondary={
              <Typography variant="caption" color="text.secondary">
                Level {folder.level} • {folder.children.length} subfolder{folder.children.length !== 1 ? 's' : ''}
              </Typography>
            }
          />
        </ListItemButton>
        
        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {folder.children.map(child => renderFolderNode(child, depth + 1))}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  return (
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
        border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`
      }}
    >
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TreeIcon
              sx={{
                color: 'secondary.main',
                mr: 1,
                fontSize: 24
              }}
            />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Folder Structure
            </Typography>
          </Box>
          
          <IconButton
            size="small"
            onClick={handleRefresh}
            disabled={isRefreshing}
            sx={{
              color: 'secondary.main',
              '&:hover': {
                backgroundColor: alpha(theme.palette.secondary.main, 0.1)
              }
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Box>


        {/* Folder Tree */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
          {isLoading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Loading folder structure...
              </Typography>
            </Box>
          ) : filteredTree.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                {searchQuery.trim() ? 'No folders match your search' : 'No folders found'}
              </Typography>
            </Box>
          ) : (
            <List dense>
              {filteredTree.map(folder => renderFolderNode(folder))}
            </List>
          )}
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search folders..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'background.paper'
            }
          }}
        />
      </CardContent>
    </Card>
  );
};

export default FolderTreeWidget;
