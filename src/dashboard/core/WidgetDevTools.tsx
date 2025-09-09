import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon,
  Collapse,
  Chip,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  BugReport as BugIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { useWidgetRegistry } from './WidgetRegistry';
import { useDashboard } from './DashboardProvider';

interface WidgetDevToolsProps {
  isVisible?: boolean;
  onToggle?: () => void;
}

export const WidgetDevTools: React.FC<WidgetDevToolsProps> = ({ 
  isVisible = false, 
  onToggle 
}) => {
  const [expanded, setExpanded] = useState(false);
  const { widgets, getStats, checkDependencies } = useWidgetRegistry();
  const { accountType, activeWidgets, refreshWidgets } = useDashboard();
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const stats = getStats();
  const widgetsWithIssues = widgets.filter(widget => !checkDependencies(widget.id));

  const handleRefresh = () => {
    refreshWidgets();
    setLastRefresh(new Date());
  };

  const getWidgetStatus = (widgetId: string) => {
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget) return { status: 'missing', icon: <WarningIcon color="error" /> };
    if (!checkDependencies(widgetId)) return { status: 'dependencies', icon: <WarningIcon color="warning" /> };
    if (!activeWidgets.find(w => w.id === widgetId)) return { status: 'inactive', icon: <InfoIcon color="info" /> };
    return { status: 'active', icon: <CheckIcon color="success" /> };
  };

  if (!isVisible) return null;

  return (
    <Paper 
      elevation={8} 
      sx={{ 
        position: 'fixed',
        bottom: 16,
        right: 16,
        width: 400,
        maxHeight: 600,
        zIndex: 9999,
        backgroundColor: 'background.paper',
        border: 1,
        borderColor: 'divider'
      }}
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <BugIcon color="primary" />
            <Typography variant="h6">Widget Dev Tools</Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Tooltip title="Refresh widgets">
              <IconButton size="small" onClick={handleRefresh}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={expanded ? "Collapse" : "Expand"}>
              <IconButton size="small" onClick={() => setExpanded(!expanded)}>
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Tooltip>
            {onToggle && (
              <Tooltip title="Close">
                <IconButton size="small" onClick={onToggle}>
                  <Typography variant="h6" sx={{ fontSize: '1rem' }}>×</Typography>
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Last refresh: {lastRefresh.toLocaleTimeString()}
        </Typography>
      </Box>

      <Box sx={{ p: 2 }}>
        {/* Quick Stats */}
        <Box display="flex" gap={1} flexWrap="wrap" sx={{ mb: 2 }}>
          <Chip 
            label={`${stats.totalWidgets} Total`} 
            size="small" 
            color="default"
          />
          <Chip 
            label={`${activeWidgets.length} Active`} 
            size="small" 
            color="primary"
          />
          <Chip 
            label={`${widgetsWithIssues.length} Issues`} 
            size="small" 
            color={widgetsWithIssues.length > 0 ? "error" : "success"}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Account Type Info */}
        <Typography variant="subtitle2" gutterBottom>
          Account Type: <Chip label={accountType || 'unknown'} size="small" />
        </Typography>

        <Collapse in={expanded}>
          <Divider sx={{ my: 2 }} />
          
          {/* Widget List */}
          <Typography variant="subtitle2" gutterBottom>
            Registered Widgets ({widgets.length})
          </Typography>
          
          <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
            {widgets.map((widget) => {
              const status = getWidgetStatus(widget.id);
              return (
                <ListItem key={widget.id} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {status.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" noWrap>
                          {widget.name}
                        </Typography>
                        <Chip 
                          label={widget.category} 
                          size="small" 
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        ID: {widget.id} • Priority: {widget.priority}
                      </Typography>
                    }
                  />
                </ListItem>
              );
            })}
          </List>

          {/* Issues Section */}
          {widgetsWithIssues.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="error" gutterBottom>
                Widgets with Issues ({widgetsWithIssues.length})
              </Typography>
              <List dense>
                {widgetsWithIssues.map((widget) => (
                  <ListItem key={widget.id} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <WarningIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary={widget.name}
                      secondary={`Missing dependencies: ${widget.dependencies?.join(', ') || 'unknown'}`}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </Collapse>
      </Box>
    </Paper>
  );
};

// Hook for development tools
export const useWidgetDevTools = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleDevTools = () => setIsVisible(!isVisible);
  const showDevTools = () => setIsVisible(true);
  const hideDevTools = () => setIsVisible(false);

  return {
    isVisible,
    toggleDevTools,
    showDevTools,
    hideDevTools
  };
};

// Development mode indicator
export const DevModeIndicator: React.FC = () => {
  const { showDevTools } = useWidgetDevTools();

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 9999
      }}
    >
      <Tooltip title="Open Widget Dev Tools">
        <IconButton
          onClick={showDevTools}
          sx={{
            backgroundColor: 'warning.main',
            color: 'warning.contrastText',
            '&:hover': {
              backgroundColor: 'warning.dark',
            }
          }}
        >
          <BugIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default WidgetDevTools;
