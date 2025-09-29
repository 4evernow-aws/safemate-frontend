import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent,
  Grid,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { 
  AccountBalance as WalletIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Send as SendIcon,
  QrCode as QrIcon
} from '@mui/icons-material';
import type { WidgetProps } from '../../dashboard/core/types';
import { BaseWidget } from '../shared/BaseWidget';
import { createWidget } from '../../dashboard/core/WidgetRegistry';

interface WalletData {
  accountId: string;
  balance: string;
  currency: string;
  change24h: number;
  changePercent: number;
  lastUpdated: string;
}

const WalletOverviewWidgetComponent: React.FC<WidgetProps> = ({ 
  widgetId, 
  accountType, 
  config, 
  onAction 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [walletData, setWalletData] = useState<WalletData | null>(null);

  // Simulate fetching wallet data
  useEffect(() => {
    const fetchWalletData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock wallet data based on account type
        const mockData: WalletData = {
          accountId: '0.0.123456',
          balance: accountType === 'business' ? '15,342.50' : '1,234.56',
          currency: 'HBAR',
          change24h: accountType === 'business' ? 1250.75 : 45.23,
          changePercent: accountType === 'business' ? 8.9 : 3.8,
          lastUpdated: new Date().toLocaleTimeString()
        };

        setWalletData(mockData);
      } catch (err) {
        setError('Failed to load wallet data');
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, [accountType]);

  const handleSendFunds = () => {
    onAction?.('send-funds');
  };

  const handleReceiveFunds = () => {
    onAction?.('receive-funds');
  };

  const handleViewDetails = () => {
    onAction?.('view-details');
  };

  const actions = [
    {
      label: 'Send Funds',
      action: 'send-funds',
      icon: <SendIcon fontSize="small" />
    },
    {
      label: 'Receive Funds',
      action: 'receive-funds',
      icon: <QrIcon fontSize="small" />
    },
    {
      label: 'View Details',
      action: 'view-details',
      icon: <WalletIcon fontSize="small" />
    }
  ];

  const isPositiveChange = walletData?.change24h && walletData.change24h > 0;

  return (
    <BaseWidget
      widgetId={widgetId}
      accountType={accountType}
      title="Wallet Overview"
      subtitle="Your Hedera wallet balance and activity"
      loading={loading}
      error={error}
      refreshable
      onRefresh={() => window.location.reload()}
      actions={actions}
      onAction={onAction}
    >
      {walletData && (
        <Box>
          {/* Balance Card */}
          <Card sx={{ mb: 2, backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <WalletIcon sx={{ fontSize: 40 }} />
                <Box flex={1}>
                  <Typography variant="h4" component="div" gutterBottom={false}>
                    {walletData.balance}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {walletData.currency}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Account ID
              </Typography>
              <Typography variant="body1" fontFamily="monospace" noWrap>
                {walletData.accountId}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Last Updated
              </Typography>
              <Typography variant="body1">
                {walletData.lastUpdated}
              </Typography>
            </Grid>
          </Grid>

          {/* 24h Change */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                24h Change
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                {isPositiveChange ? (
                  <TrendingUpIcon color="success" />
                ) : (
                  <TrendingDownIcon color="error" />
                )}
                <Typography 
                  variant="h6" 
                  color={isPositiveChange ? 'success.main' : 'error.main'}
                >
                  {isPositiveChange ? '+' : ''}{walletData.change24h.toFixed(2)} {walletData.currency}
                </Typography>
                <Chip 
                  label={`${isPositiveChange ? '+' : ''}${walletData.changePercent.toFixed(1)}%`}
                  size="small"
                  color={isPositiveChange ? 'success' : 'error'}
                  variant="outlined"
                />
              </Box>
            </CardContent>
          </Card>

          <Divider sx={{ my: 2 }} />

          {/* Action Buttons */}
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Button
                variant="contained"
                startIcon={<SendIcon />}
                onClick={handleSendFunds}
                fullWidth
                size="small"
              >
                Send
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                variant="outlined"
                startIcon={<QrIcon />}
                onClick={handleReceiveFunds}
                fullWidth
                size="small"
              >
                Receive
              </Button>
            </Grid>
          </Grid>

          {/* Network Info */}
          <Box sx={{ mt: 2, p: 1, backgroundColor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              <strong>Network:</strong> Hedera Testnet<br />
              <strong>Status:</strong> Connected<br />
              <strong>Version:</strong> 2.0.0
            </Typography>
          </Box>
        </Box>
      )}
    </BaseWidget>
  );
};

// Create the widget definition
export const WalletOverviewWidget = createWidget({
  id: 'wallet-overview',
  name: 'Wallet Overview',
  component: WalletOverviewWidgetComponent,
  category: 'wallet',
  permissions: ['personal', 'family', 'business', 'community', 'sporting', 'cultural'],
  gridSize: { cols: 4, rows: 6, minCols: 3, minRows: 5 },
  priority: 100
});

export default WalletOverviewWidgetComponent;
