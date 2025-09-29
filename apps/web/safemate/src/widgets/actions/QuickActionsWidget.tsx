import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  Avatar,
  CardActions
} from '@mui/material';
import { 
  Upload as UploadIcon,
  Folder as FolderIcon,
  AccountBalance as BlockchainIcon,
  Group as GroupIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import type { WidgetProps } from '../../dashboard/core/DashboardProvider';
import BaseWidget from '../shared/BaseWidget';
import { createWidget, WidgetRegistry } from '../../dashboard/core/WidgetRegistry';
import { useNavigate } from 'react-router-dom';

interface ActionItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonText: string;
  path: string;
  color: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error';
  bgColor: string;
}

const QuickActionsWidget: React.FC<WidgetProps> = ({ widgetId, accountType, onAction }) => {
  const navigate = useNavigate();

  const actions: ActionItem[] = [
    {
      title: 'Upload Files',
      description: 'Securely store files on the blockchain',
      icon: <UploadIcon sx={{ fontSize: 24 }} />,
      buttonText: 'Upload',
      path: '/upload',
      color: 'primary',
      bgColor: '#1976d210'
    },
    {
      title: 'View Files',
      description: 'Access your stored files',
      icon: <FolderIcon sx={{ fontSize: 24 }} />,
      buttonText: 'View',
      path: '/files',
      color: 'secondary',
      bgColor: '#9c27b010'
    },
    {
      title: 'Blockchain Dashboard',
      description: 'Monitor your Hedera account',
      icon: <BlockchainIcon sx={{ fontSize: 24 }} />,
      buttonText: 'Monitor',
      path: '/blockchain',
      color: 'success',
      bgColor: '#2e7d3210'
    },
    {
      title: 'Groups',
      description: 'Manage shared wallets and groups',
      icon: <GroupIcon sx={{ fontSize: 24 }} />,
      buttonText: 'Manage',
      path: '/groups',
      color: 'info',
      bgColor: '#0288d110'
    }
  ];

  const handleActionClick = (action: ActionItem) => {
    onAction?.('quick-action', { 
      widgetId, 
      actionTitle: action.title, 
      path: action.path 
    });
    console.log(`Action: ${action.title} clicked for ${accountType} account`);
    navigate(`/app${action.path}`);
  };

  const handleRefresh = () => {
    onAction?.('refresh-actions', { widgetId });
    console.log(`Action: Refresh Quick Actions for ${accountType} account`);
  };

  return (
    <BaseWidget
      widgetId={widgetId}
      accountType={accountType}
      title="Quick Actions"
      subtitle="Common tasks and operations"
      onRefresh={handleRefresh}
    >
      <Box sx={{ width: '100%' }}>
        <Grid container spacing={2}>
          {actions.map((action, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                  }
                }}
                onClick={() => handleActionClick(action)}
              >
                <CardContent sx={{ pb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: action.bgColor, 
                        color: `${action.color}.main`,
                        mr: 2,
                        width: 48,
                        height: 48
                      }}
                    >
                      {action.icon}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="div" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                        {action.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                        {action.description}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                <CardActions sx={{ pt: 0, pb: 2, px: 2 }}>
                  <Button 
                    variant="contained" 
                    color={action.color}
                    endIcon={<ArrowIcon />}
                    fullWidth
                    size="small"
                    sx={{ 
                      textTransform: 'none',
                      fontWeight: 600
                    }}
                  >
                    {action.buttonText}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </BaseWidget>
  );
};

export const QuickActionsWidgetDefinition = createWidget({
  id: 'quick-actions',
  name: 'Quick Actions',
  component: QuickActionsWidget,
  category: 'shared',
  permissions: ['personal', 'family', 'business', 'community', 'sporting', 'cultural'],
  gridSize: { cols: 8, rows: 8 },
  priority: 15,
});

WidgetRegistry.register(QuickActionsWidgetDefinition);

export default QuickActionsWidget;
