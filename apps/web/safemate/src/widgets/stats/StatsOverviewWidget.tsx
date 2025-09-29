import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  IconButton, 
  Chip,
  LinearProgress
} from '@mui/material';
import { 
  Folder as FolderIcon,
  Storage as StorageIcon,
  AccountBalance as HbarIcon,
  Security as SecurityIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Remove as NeutralIcon
} from '@mui/icons-material';
import type { WidgetProps } from '../../dashboard/core/DashboardProvider';
import BaseWidget from '../shared/BaseWidget';
import { createWidget, WidgetRegistry } from '../../dashboard/core/WidgetRegistry';
import { useHedera } from '../../contexts/HederaContext';

interface StatItem {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

const StatsOverviewWidget: React.FC<WidgetProps> = ({ widgetId, accountType, onAction }) => {
  const { account, folders, isLoading, error } = useHedera();
  const [stats, setStats] = useState<StatItem[]>([]);

  useEffect(() => {
    const calculateStats = () => {
      const newStats: StatItem[] = [
        {
          title: 'Total Files',
          value: folders.length.toString(),
          change: folders.length > 0 ? `+${folders.length}` : '0',
          changeType: folders.length > 0 ? 'positive' : 'neutral',
          icon: <FolderIcon sx={{ fontSize: 40, color: '#2196F3' }} />,
          color: '#2196F3'
        },
        {
          title: 'Storage Used',
          value: '0.0 MB', // TODO: Calculate actual storage used
          change: '0%',
          changeType: 'neutral',
          icon: <StorageIcon sx={{ fontSize: 40, color: '#FF9800' }} />,
          color: '#FF9800'
        },
        {
          title: 'HBAR Balance',
          value: account?.balance || '0.0',
          change: account?.balance && parseFloat(account.balance) > 0 ? 'Active' : 'New',
          changeType: account?.balance && parseFloat(account.balance) > 0 ? 'positive' : 'neutral',
          icon: <HbarIcon sx={{ fontSize: 40, color: '#4CAF50' }} />,
          color: '#4CAF50'
        },
        {
          title: 'Security Level',
          value: account?.security === 'kms-enhanced' ? 'KMS Enhanced' : 'Standard',
          change: account?.security === 'kms-enhanced' ? 'Secure' : 'Basic',
          changeType: account?.security === 'kms-enhanced' ? 'positive' : 'neutral',
          icon: <SecurityIcon sx={{ fontSize: 40, color: '#9C27B0' }} />,
          color: '#9C27B0'
        }
      ];
      setStats(newStats);
    };

    calculateStats();
  }, [account, folders]);

  const handleRefresh = () => {
    onAction?.('refresh-stats', { widgetId });
    console.log(`Action: Refresh Stats for ${accountType} account`);
  };

  const renderChangeIcon = (changeType: 'positive' | 'negative' | 'neutral') => {
    switch (changeType) {
      case 'positive':
        return <TrendingUpIcon sx={{ fontSize: 16, color: '#4CAF50' }} />;
      case 'negative':
        return <TrendingDownIcon sx={{ fontSize: 16, color: '#F44336' }} />;
      default:
        return <NeutralIcon sx={{ fontSize: 16, color: '#9E9E9E' }} />;
    }
  };

  return (
    <BaseWidget
      widgetId={widgetId}
      accountType={accountType}
      title="Statistics Overview"
      subtitle="Your account statistics"
      loading={isLoading}
      error={error}
      onRefresh={handleRefresh}
    >
      <Box sx={{ width: '100%' }}>
        <Grid container spacing={2}>
          {stats.map((stat, index) => (
            <Grid item xs={6} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  border: `2px solid ${stat.color}20`,
                  '&:hover': {
                    border: `2px solid ${stat.color}40`,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease-in-out'
                  }
                }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {stat.icon}
                    <Box sx={{ ml: 1, flexGrow: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {stat.title}
                      </Typography>
                      <Typography variant="h6" component="div" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                        {stat.value}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Chip
                      icon={renderChangeIcon(stat.changeType)}
                      label={stat.change}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.6rem',
                        bgcolor: `${stat.color}10`,
                        color: stat.color,
                        border: `1px solid ${stat.color}30`
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </BaseWidget>
  );
};

export const StatsOverviewWidgetDefinition = createWidget({
  id: 'stats-overview',
  name: 'Account Statistics',
  component: StatsOverviewWidget,
  category: 'analytics',
  permissions: ['personal', 'family', 'business', 'community', 'sporting', 'cultural'],
  gridSize: { cols: 8, rows: 6 },
  priority: 5,
});

// Register the widget
console.log('📝 Registering StatsOverviewWidget...');
WidgetRegistry.register(StatsOverviewWidgetDefinition);
console.log('✅ StatsOverviewWidget registered successfully');

export default StatsOverviewWidget;
