import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  IconButton,
  Divider,
  Button
} from '@mui/material';
import { 
  AccountCircle as AccountIcon,
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  Group as GroupIcon,
  Security as SecurityIcon,
  Payment as PaymentIcon,
  Folder as FolderIcon,
  Launch as LaunchIcon,
  TrendingUp as ActivityIcon,
  CheckCircle as SuccessIcon
} from '@mui/icons-material';
import type { WidgetProps } from '../../dashboard/core/DashboardProvider';
import BaseWidget from '../shared/BaseWidget';
import { createWidget, WidgetRegistry } from '../../dashboard/core/WidgetRegistry';
import { useHedera } from '../../contexts/HederaContext';

interface ActivityItem {
  id: string;
  type: 'account_created' | 'file_upload' | 'file_download' | 'group_joined' | 'security_update' | 'payment' | 'folder_created';
  title: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
  color: string;
  status: 'success' | 'pending' | 'failed';
  metadata?: {
    accountId?: string;
    fileName?: string;
    groupName?: string;
    amount?: string;
  };
}

const RecentActivityWidget: React.FC<WidgetProps> = ({ widgetId, accountType, onAction }) => {
  const { account } = useHedera();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Mock activities based on the account information
    const mockActivities: ActivityItem[] = [
      {
        id: '1',
        type: 'account_created',
        title: 'Account created',
        description: account?.accountId ? `Hedera account ${account.accountId} • Welcome to SafeMate!` : 'Welcome to SafeMate!',
        timestamp: '2 hours ago',
        icon: <AccountIcon />,
        color: '#4CAF50',
        status: 'success',
        metadata: {
          accountId: account?.accountId
        }
      }
    ];

    setActivities(mockActivities);
  }, [account]);

  const handleRefresh = () => {
    setIsLoading(true);
    onAction?.('refresh-activity', { widgetId });
    console.log(`Action: Refresh Recent Activity for ${accountType} account`);
    
    // Simulate refresh
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handleViewActivity = (activity: ActivityItem) => {
    onAction?.('view-activity', { widgetId, activityId: activity.id });
    console.log(`Action: View activity ${activity.title} for ${accountType} account`);
    
    // Open relevant views based on activity type
    switch (activity.type) {
      case 'account_created':
        if (activity.metadata?.accountId) {
          window.open(`https://hashscan.io/testnet/account/${activity.metadata.accountId}`, '_blank');
        }
        break;
      case 'file_upload':
      case 'file_download':
      case 'folder_created':
        onAction?.('navigate-to-files', { widgetId });
        break;
      case 'group_joined':
        onAction?.('navigate-to-groups', { widgetId });
        break;
      default:
        break;
    }
  };

  const getActivityIcon = (activity: ActivityItem) => {
    const iconProps = {
      sx: { color: 'white', fontSize: 20 }
    };

    switch (activity.type) {
      case 'account_created':
        return <AccountIcon {...iconProps} />;
      case 'file_upload':
        return <UploadIcon {...iconProps} />;
      case 'file_download':
        return <DownloadIcon {...iconProps} />;
      case 'group_joined':
        return <GroupIcon {...iconProps} />;
      case 'security_update':
        return <SecurityIcon {...iconProps} />;
      case 'payment':
        return <PaymentIcon {...iconProps} />;
      case 'folder_created':
        return <FolderIcon {...iconProps} />;
      default:
        return <ActivityIcon {...iconProps} />;
    }
  };

  const getStatusChip = (status: string) => {
    const props = {
      size: 'small' as const,
      sx: { height: 20, fontSize: '0.7rem' }
    };

    switch (status) {
      case 'success':
        return <Chip label="Completed" color="success" {...props} />;
      case 'pending':
        return <Chip label="Pending" color="warning" {...props} />;
      case 'failed':
        return <Chip label="Failed" color="error" {...props} />;
      default:
        return <Chip label="Unknown" color="default" {...props} />;
    }
  };

  const renderEmptyState = () => (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Avatar sx={{ 
        width: 64, 
        height: 64, 
        mx: 'auto', 
        mb: 2,
        bgcolor: 'grey.100',
        color: 'grey.400'
      }}>
        <ActivityIcon sx={{ fontSize: 32 }} />
      </Avatar>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        No recent activity
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Your account activity will appear here
      </Typography>
    </Box>
  );

  const renderActivities = () => (
    <List sx={{ width: '100%', py: 0 }}>
      {activities.map((activity, index) => (
        <React.Fragment key={activity.id}>
          <ListItem 
            sx={{ 
              px: 0,
              py: 2,
              cursor: 'pointer',
              borderRadius: 1,
              '&:hover': {
                bgcolor: 'grey.50'
              }
            }}
            onClick={() => handleViewActivity(activity)}
          >
            <ListItemAvatar>
              <Avatar sx={{ 
                bgcolor: activity.color,
                color: 'white',
                width: 40,
                height: 40
              }}>
                {getActivityIcon(activity)}
              </Avatar>
            </ListItemAvatar>
            
            <ListItemText
              primary={
                <Box 
                  component="span" 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    mb: 0.5,
                    fontWeight: 600,
                    fontSize: '0.875rem'
                  }}
                >
                  <span>{activity.title}</span>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getStatusChip(activity.status)}
                    <IconButton size="small" sx={{ color: 'text.secondary' }}>
                      <LaunchIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                </Box>
              }
              secondary={
                <Box component="span">
                  <Box
                    component="span"
                    sx={{ 
                      color: 'text.secondary',
                      fontSize: '0.75rem',
                      display: 'block',
                      mb: 0.5
                    }}
                  >
                    {activity.description}
                  </Box>
                  <Box
                    component="span" 
                    sx={{ 
                      fontSize: '0.6875rem', 
                      color: 'text.secondary',
                      display: 'block'
                    }}
                  >
                    {activity.timestamp}
                  </Box>
                </Box>
              }
            />
          </ListItem>
          {index < activities.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </List>
  );

  return (
    <BaseWidget
      widgetId={widgetId}
      accountType={accountType}
      title="Recent Activity"
      subtitle="Your latest actions and events"
      loading={isLoading}
      onRefresh={handleRefresh}
      actions={[
        { label: 'View All', action: 'view-all' },
        { label: 'Export', action: 'export' }
      ]}
    >
      <Box sx={{ width: '100%', minHeight: 200 }}>
        {activities.length === 0 ? renderEmptyState() : renderActivities()}
      </Box>
    </BaseWidget>
  );
};

export const RecentActivityWidgetDefinition = createWidget({
  id: 'recent-activity',
  name: 'Recent Activity',
  component: RecentActivityWidget,
  category: 'shared',
  permissions: ['personal', 'family', 'business', 'community', 'sporting', 'cultural'],
  gridSize: { cols: 8, rows: 8 },
  priority: 14
});

WidgetRegistry.register(RecentActivityWidgetDefinition);

export default RecentActivityWidget;
