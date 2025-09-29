import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  Avatar,
  Stack
} from '@mui/material';
import { 
  CloudUpload as UploadIcon,
  FolderOpen as BrowseIcon,
  Group as TeamIcon,
  AccountBalance as BlockchainIcon,
  Person as ProfileIcon,
  Settings as SettingsIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import type { WidgetProps } from '../../dashboard/core/DashboardProvider';
import BaseWidget from '../shared/BaseWidget';
import { createWidget, WidgetRegistry } from '../../dashboard/core/WidgetRegistry';
import { useNavigate } from 'react-router-dom';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonText: string;
  buttonColor: string;
  path: string;
  bgColor: string;
  iconColor: string;
}

const QuickActionsGridWidget: React.FC<WidgetProps> = ({ widgetId, accountType, onAction }) => {
  const navigate = useNavigate();

  const actions: QuickAction[] = [
    {
      title: 'Upload Files',
      description: 'Securely store your files on Hedera',
      icon: <UploadIcon sx={{ fontSize: 28 }} />,
      buttonText: 'Upload Now',
      buttonColor: '#4285F4',
      path: '/upload',
      bgColor: '#E3F2FD',
      iconColor: '#4285F4'
    },
    {
      title: 'Browse Files',
      description: 'Access your encrypted file library',
      icon: <BrowseIcon sx={{ fontSize: 28 }} />,
      buttonText: 'Browse Files',
      buttonColor: '#00BCD4',
      path: '/files',
      bgColor: '#E0F7FA',
      iconColor: '#00BCD4'
    },
    {
      title: 'Team Groups',
      description: 'Collaborate securely with your team',
      icon: <TeamIcon sx={{ fontSize: 28 }} />,
      buttonText: 'Join Groups',
      buttonColor: '#FF9800',
      path: '/groups',
      bgColor: '#FFF3E0',
      iconColor: '#FF9800'
    },
    {
      title: 'Blockchain',
      description: 'View network activity and transactions',
      icon: <BlockchainIcon sx={{ fontSize: 28 }} />,
      buttonText: 'View Blockchain',
      buttonColor: '#4CAF50',
      path: '/blockchain',
      bgColor: '#E8F5E8',
      iconColor: '#4CAF50'
    },
    {
      title: 'Profile',
      description: 'Manage your account and settings',
      icon: <ProfileIcon sx={{ fontSize: 28 }} />,
      buttonText: 'Manage Profile',
      buttonColor: '#E91E63',
      path: '/profile',
      bgColor: '#FCE4EC',
      iconColor: '#E91E63'
    },
    {
      title: 'Settings',
      description: 'Configure your SafeMate preferences',
      icon: <SettingsIcon sx={{ fontSize: 28 }} />,
      buttonText: 'Open Settings',
      buttonColor: '#9C27B0',
      path: '/settings',
      bgColor: '#F3E5F5',
      iconColor: '#9C27B0'
    }
  ];

  const handleActionClick = (action: QuickAction) => {
    onAction?.('quick-action-grid', { 
      widgetId, 
      actionTitle: action.title, 
      path: action.path 
    });
    console.log(`Action: ${action.title} clicked for ${accountType} account`);
    navigate(`/app${action.path}`);
  };

  const handleRefresh = () => {
    onAction?.('refresh-quick-actions', { widgetId });
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
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease-in-out',
                  border: '2px solid transparent',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                    border: `2px solid ${action.iconColor}30`
                  }
                }}
                onClick={() => handleActionClick(action)}
              >
                <CardContent sx={{ p: 3, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {/* Icon */}
                  <Avatar 
                    sx={{ 
                      bgcolor: action.bgColor,
                      color: action.iconColor,
                      width: 64,
                      height: 64,
                      mx: 'auto',
                      mb: 2
                    }}
                  >
                    {action.icon}
                  </Avatar>

                  {/* Title */}
                  <Typography 
                    variant="h6" 
                    component="div" 
                    sx={{ 
                      fontWeight: 600,
                      fontSize: '1rem',
                      mb: 1,
                      color: 'text.primary'
                    }}
                  >
                    {action.title}
                  </Typography>

                  {/* Description */}
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      fontSize: '0.85rem',
                      mb: 2,
                      flexGrow: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {action.description}
                  </Typography>

                  {/* Button */}
                  <Button 
                    variant="contained"
                    endIcon={<ArrowIcon />}
                    sx={{ 
                      bgcolor: action.buttonColor,
                      color: 'white',
                      textTransform: 'none',
                      fontWeight: 600,
                      py: 1,
                      borderRadius: 2,
                      '&:hover': {
                        bgcolor: action.buttonColor,
                        filter: 'brightness(0.9)'
                      }
                    }}
                  >
                    {action.buttonText}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </BaseWidget>
  );
};

export const QuickActionsGridWidgetDefinition = createWidget({
  id: 'quick-actions-grid',
  name: 'Quick Actions Grid',
  component: QuickActionsGridWidget,
  category: 'shared',
  permissions: ['personal', 'family', 'business', 'community', 'sporting', 'cultural'],
  gridSize: { cols: 12, rows: 8 },
  priority: 10
});

WidgetRegistry.register(QuickActionsGridWidgetDefinition);

export default QuickActionsGridWidget;
