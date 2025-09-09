import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Avatar,
  Chip,
  IconButton,
  Button,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { 
  Person as PersonIcon,
  CheckCircle as OnlineIcon,
  Error as OfflineIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import type { WidgetProps } from '../../dashboard/core/DashboardProvider';
import BaseWidget from '../shared/BaseWidget';
import { createWidget, WidgetRegistry } from '../../dashboard/core/WidgetRegistry';
import { useUser } from '../../contexts/UserContext';

const AccountStatusWidget: React.FC<WidgetProps> = ({ widgetId, accountType, onAction }) => {
  const { user, isAuthenticated } = useUser();
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connected');

  useEffect(() => {
    // Simulate connection status based on authentication
    if (isAuthenticated && user) {
      setConnectionStatus('connected');
    } else {
      setConnectionStatus('disconnected');
    }
  }, [isAuthenticated, user]);

  const handleEditProfile = () => {
    onAction?.('edit-profile', { widgetId });
    console.log(`Action: Edit Profile for ${accountType} account`);
  };

  const handleSettings = () => {
    onAction?.('open-settings', { widgetId });
    console.log(`Action: Open Settings for ${accountType} account`);
  };

  const handleLogout = () => {
    onAction?.('logout', { widgetId });
    console.log(`Action: Logout for ${accountType} account`);
  };

  const handleRefresh = () => {
    onAction?.('refresh-account-status', { widgetId });
    console.log(`Action: Refresh Account Status for ${accountType} account`);
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return '#4CAF50';
      case 'connecting':
        return '#FF9800';
      case 'disconnected':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <OnlineIcon sx={{ color: '#4CAF50', fontSize: 16 }} />;
      case 'connecting':
        return <OnlineIcon sx={{ color: '#FF9800', fontSize: 16 }} />;
      case 'disconnected':
        return <OfflineIcon sx={{ color: '#F44336', fontSize: 16 }} />;
      default:
        return <OfflineIcon sx={{ color: '#757575', fontSize: 16 }} />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Disconnected';
      default:
        return 'Unknown';
    }
  };

  const getUserDisplayName = () => {
    if (!user) return 'Guest User';
    
    if (user.attributes?.name) {
      return user.attributes.name;
    }
    
    if (user.attributes?.email) {
      return user.attributes.email;
    }
    
    return user.email || 'User';
  };

  const getUserEmail = () => {
    if (!user) return '';
    
    return user.attributes?.email || user.email || '';
  };

  return (
    <BaseWidget
      widgetId={widgetId}
      accountType={accountType}
      title="Account Status"
      subtitle="Your connection and profile"
      onRefresh={handleRefresh}
    >
      <Box sx={{ width: '100%' }}>
        {/* User Info Card */}
        <Card 
          sx={{ 
            mb: 2,
            border: `2px solid ${getStatusColor()}20`,
            borderRadius: 2
          }}
        >
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar 
                sx={{ 
                  width: 48,
                  height: 48,
                  bgcolor: getStatusColor(),
                  color: 'white',
                  mr: 2
                }}
              >
                <PersonIcon />
              </Avatar>
              
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {getUserDisplayName()}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                  {getUserEmail()}
                </Typography>
              </Box>
              
              <IconButton 
                size="small" 
                onClick={handleEditProfile}
                sx={{ color: 'text.secondary' }}
              >
                <EditIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>

            {/* Connection Status */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Chip
                icon={getStatusIcon()}
                label={getStatusText()}
                size="small"
                sx={{
                  bgcolor: `${getStatusColor()}15`,
                  color: getStatusColor(),
                  border: `1px solid ${getStatusColor()}30`,
                  fontWeight: 600
                }}
              />
              
              <Typography variant="caption" color="text.secondary">
                {accountType.charAt(0).toUpperCase() + accountType.slice(1)} Account
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Divider sx={{ my: 2 }} />

        {/* Quick Actions */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={handleSettings}
            size="small"
            fullWidth
            sx={{ 
              justifyContent: 'flex-start',
              textTransform: 'none',
              borderColor: 'grey.300',
              color: 'text.primary'
            }}
          >
            Account Settings
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            size="small"
            fullWidth
            sx={{ 
              justifyContent: 'flex-start',
              textTransform: 'none',
              borderColor: 'error.main',
              color: 'error.main',
              '&:hover': {
                borderColor: 'error.dark',
                bgcolor: 'error.main',
                color: 'white'
              }
            }}
          >
            Sign Out
          </Button>
        </Box>

        {/* Account Type Info */}
        <Box sx={{ mt: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            Account Type
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {accountType.charAt(0).toUpperCase() + accountType.slice(1)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {accountType === 'personal' && 'Individual account with basic features'}
            {accountType === 'family' && 'Family account with shared features'}
            {accountType === 'business' && 'Business account with enterprise features'}
            {accountType === 'community' && 'Community account with collaboration tools'}
            {accountType === 'sporting' && 'Sports organization account'}
            {accountType === 'cultural' && 'Cultural organization account'}
          </Typography>
        </Box>
      </Box>
    </BaseWidget>
  );
};

export const AccountStatusWidgetDefinition = createWidget({
  id: 'account-status',
  name: 'Account Status',
  component: AccountStatusWidget,
  category: 'shared',
  permissions: ['personal', 'family', 'business', 'community', 'sporting', 'cultural'],
  gridSize: { cols: 4, rows: 8 },
  priority: 15,
});

WidgetRegistry.register(AccountStatusWidgetDefinition);

export default AccountStatusWidget;
