import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Skeleton,
  Alert,
  Collapse
} from '@mui/material';
import { MoreVert as MoreIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import type { WidgetProps } from '../../dashboard/core/types';

export interface BaseWidgetProps extends WidgetProps {
  title: string;
  subtitle?: string;
  loading?: boolean;
  error?: string | null;
  refreshable?: boolean;
  onRefresh?: () => void;
  actions?: Array<{
    label: string;
    action: string;
    icon?: React.ReactNode;
  }>;
  children: React.ReactNode;
}

export const BaseWidget: React.FC<BaseWidgetProps> = ({
  widgetId,
  accountType,
  title,
  subtitle,
  loading = false,
  error = null,
  refreshable = false,
  onRefresh,
  actions = [],
  onAction,
  children
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showError, setShowError] = useState(true);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action: string) => {
    handleMenuClose();
    onAction?.(action);
  };

  const handleRefresh = () => {
    onRefresh?.();
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      {/* Header */}
      <CardContent sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box flex={1}>
            <Typography variant="h6" component="h3" gutterBottom={false}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          
          <Box display="flex" alignItems="center" gap={0.5}>
            {/* Account Type Badge */}
            <Chip 
              label={accountType} 
              size="small" 
              variant="outlined"
              color="primary"
            />
            
            {/* Refresh Button */}
            {refreshable && (
              <IconButton
                size="small"
                onClick={handleRefresh}
                disabled={loading}
                title="Refresh"
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            )}
            
            {/* Actions Menu */}
            {actions.length > 0 && (
              <IconButton
                size="small"
                onClick={handleMenuOpen}
                disabled={loading}
                title="More actions"
              >
                <MoreIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>
      </CardContent>

      {/* Content */}
      <CardContent sx={{ flex: 1, pt: 0 }}>
        {loading ? (
          <Box>
            <Skeleton variant="rectangular" height={60} sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" height={40} sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" height={40} />
          </Box>
        ) : error ? (
          <Collapse in={showError}>
            <Alert 
              severity="error" 
              onClose={() => setShowError(false)}
              sx={{ mb: 2 }}
            >
              {error}
            </Alert>
          </Collapse>
        ) : (
          children
        )}
      </CardContent>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {actions.map((action) => (
          <MenuItem 
            key={action.action} 
            onClick={() => handleAction(action.action)}
          >
            {action.icon && (
              <ListItemIcon>
                {action.icon}
              </ListItemIcon>
            )}
            <ListItemText>{action.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </Card>
  );
};

export default BaseWidget;
