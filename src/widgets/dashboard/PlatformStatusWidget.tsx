import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  LinearProgress,
  Alert,
  IconButton
} from '@mui/material';
import { 
  Router as NetworkIcon,
  Security as SecurityIcon,
  AccountCircle as AccountIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Launch as LaunchIcon
} from '@mui/icons-material';
import type { WidgetProps } from '../../dashboard/core/DashboardProvider';
import BaseWidget from '../shared/BaseWidget';
import { createWidget, WidgetRegistry } from '../../dashboard/core/WidgetRegistry';
import { useHedera } from '../../contexts/HederaContext';

interface StatusItem {
  title: string;
  value: string;
  status: 'online' | 'warning' | 'error' | 'info';
  icon: React.ReactNode;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const PlatformStatusWidget: React.FC<WidgetProps> = ({ widgetId, accountType, onAction }) => {
  const { account, isLoading, error } = useHedera();
  const [statusItems, setStatusItems] = useState<StatusItem[]>([]);
  const [overallHealth, setOverallHealth] = useState<'healthy' | 'warning' | 'critical'>('healthy');

  useEffect(() => {
    const networkStatus = account?.network === 'testnet' ? 'online' : 'warning';
    const securityStatus = account?.security === 'kms-enhanced' ? 'online' : 'info';
    const accountStatus = account ? 'online' : 'error';

    const items: StatusItem[] = [
      {
        title: 'Network',
        value: account?.network === 'testnet' ? 'Hedera Testnet' : 'Connecting...',
        status: networkStatus,
        icon: <NetworkIcon />,
        description: account?.network === 'testnet' ? 'Connected to Hedera test network' : 'Network connection pending',
        action: {
          label: 'View Network',
          onClick: () => window.open('https://testnet.dragonglass.me/', '_blank')
        }
      },
      {
        title: 'Security',
        value: account?.security === 'kms-enhanced' ? 'End-to-End Encrypted' : 'Standard Encryption',
        status: securityStatus,
        icon: <SecurityIcon />,
        description: account?.security === 'kms-enhanced' 
          ? 'Your data is protected with AWS KMS encryption'
          : 'Using standard encryption methods',
        action: {
          label: 'Security Details',
          onClick: () => onAction?.('view-security', { widgetId })
        }
      },
      {
        title: 'Account Status',
        value: account ? 'Active' : 'Inactive',
        status: accountStatus,
        icon: <AccountIcon />,
        description: account 
          ? `Account ${account.accountId} is active and ready`
          : 'No active account found',
        action: account ? {
          label: 'View Account',
          onClick: () => window.open(`https://hashscan.io/testnet/account/${account.accountId}`, '_blank')
        } : undefined
      }
    ];

    setStatusItems(items);

    // Calculate overall health
    const hasError = items.some(item => item.status === 'error');
    const hasWarning = items.some(item => item.status === 'warning');
    
    if (hasError) {
      setOverallHealth('critical');
    } else if (hasWarning) {
      setOverallHealth('warning');
    } else {
      setOverallHealth('healthy');
    }
  }, [account, onAction, widgetId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckIcon sx={{ color: '#4CAF50' }} />;
      case 'warning':
        return <WarningIcon sx={{ color: '#FF9800' }} />;
      case 'error':
        return <ErrorIcon sx={{ color: '#F44336' }} />;
      default:
        return <InfoIcon sx={{ color: '#2196F3' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return '#4CAF50';
      case 'warning':
        return '#FF9800';
      case 'error':
        return '#F44336';
      default:
        return '#2196F3';
    }
  };

  const getOverallHealthColor = () => {
    switch (overallHealth) {
      case 'healthy':
        return '#4CAF50';
      case 'warning':
        return '#FF9800';
      case 'critical':
        return '#F44336';
      default:
        return '#2196F3';
    }
  };

  const handleRefresh = () => {
    onAction?.('refresh-platform-status', { widgetId });
    console.log(`Action: Refresh Platform Status for ${accountType} account`);
  };

  return (
    <BaseWidget
      widgetId={widgetId}
      accountType={accountType}
      title="Platform Status"
      subtitle="System and network status"
      loading={isLoading}
      error={error}
      onRefresh={handleRefresh}
      actions={[
        { label: 'View Details', action: 'view-details' },
        { label: 'Report Issue', action: 'report-issue' }
      ]}
    >
      <Box sx={{ width: '100%' }}>
        {/* Overall Health Indicator */}
        <Box sx={{ mb: 2 }}>
          <LinearProgress
            variant="determinate"
            value={overallHealth === 'healthy' ? 100 : overallHealth === 'warning' ? 70 : 30}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                bgcolor: getOverallHealthColor(),
                borderRadius: 3
              }
            }}
          />
        </Box>

        {/* Status Items */}
        <List sx={{ py: 0 }}>
          {statusItems.map((item, index) => (
            <ListItem 
              key={index}
              sx={{ 
                px: 0,
                py: 1,
                borderRadius: 1,
                '&:hover': {
                  bgcolor: 'grey.50'
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Box sx={{ position: 'relative' }}>
                  <Box sx={{ color: getStatusColor(item.status), fontSize: 24 }}>
                    {item.icon}
                  </Box>
                  <Box 
                    sx={{ 
                      position: 'absolute',
                      top: -2,
                      right: -2,
                      width: 12,
                      height: 12
                    }}
                  >
                    {getStatusIcon(item.status)}
                  </Box>
                </Box>
              </ListItemIcon>
              
              <ListItemText
                primary={
                  <Box 
                    component="span" 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      fontWeight: 600,
                      fontSize: '0.875rem'
                    }}
                  >
                    <span>{item.title}</span>
                    {item.action && (
                      <IconButton 
                        size="small" 
                        onClick={item.action.onClick}
                        sx={{ color: 'text.secondary' }}
                      >
                        <LaunchIcon style={{ fontSize: 16 }} />
                      </IconButton>
                    )}
                  </Box>
                }
                secondary={
                  <Box component="span">
                    <Box
                      component="span"
                      sx={{ 
                        color: getStatusColor(item.status),
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        display: 'block',
                        mb: 0.5
                      }}
                    >
                      {item.value}
                    </Box>
                    {item.description && (
                      <Box 
                        component="span"
                        sx={{ 
                          fontSize: '0.6875rem', 
                          color: 'text.secondary',
                          display: 'block'
                        }}
                      >
                        {item.description}
                      </Box>
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>

        {/* Additional Info */}
        {overallHealth !== 'healthy' && (
          <Alert 
            severity={overallHealth === 'warning' ? 'warning' : 'error'}
            sx={{ mt: 2, fontSize: '0.8rem' }}
          >
            {overallHealth === 'warning' 
              ? 'Some services may be experiencing issues'
              : 'Critical issues detected. Please check your connection.'
            }
          </Alert>
        )}
      </Box>
    </BaseWidget>
  );
};

export const PlatformStatusWidgetDefinition = createWidget({
  id: 'platform-status',
  name: 'Platform Status',
  component: PlatformStatusWidget,
  category: 'shared',
  permissions: ['personal', 'family', 'business', 'community', 'sporting', 'cultural'],
  gridSize: { cols: 6, rows: 8 },
  priority: 8
});

WidgetRegistry.register(PlatformStatusWidgetDefinition);

export default PlatformStatusWidget;
