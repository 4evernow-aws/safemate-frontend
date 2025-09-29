import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Button,
  Chip,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import { 
  AccountBalance as WalletIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Launch as LaunchIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  Public as NetworkIcon,
  Key as KeyIcon,
  AccountCircle as AccountIcon
} from '@mui/icons-material';
import type { WidgetProps } from '../../dashboard/core/DashboardProvider';
import BaseWidget from '../shared/BaseWidget';
import { createWidget, WidgetRegistry } from '../../dashboard/core/WidgetRegistry';
import { useHedera } from '../../contexts/HederaContext';

const WalletDetailsWidget: React.FC<WidgetProps> = ({ widgetId, accountType, onAction }) => {
  const { account, isLoading, error, refreshBalance } = useHedera();
  const [showPublicKey, setShowPublicKey] = useState(false);
  const [showCreateWalletDialog, setShowCreateWalletDialog] = useState(false);
  const [refreshingBalance, setRefreshingBalance] = useState(false);

  const handleRefreshBalance = async () => {
    if (refreshingBalance) return;
    
    setRefreshingBalance(true);
    try {
      await refreshBalance();
      onAction?.('balance-refreshed', { widgetId, balance: account?.balance });
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    } finally {
      setRefreshingBalance(false);
    }
  };

  const handleViewOnHashScan = () => {
    if (account?.accountId) {
      const url = `https://hashscan.io/testnet/account/${account.accountId}`;
      window.open(url, '_blank');
      onAction?.('view-hashscan', { widgetId, accountId: account.accountId });
    }
  };

  const handleCreateWallet = () => {
    setShowCreateWalletDialog(true);
    onAction?.('create-wallet-requested', { widgetId, accountType });
  };

  const renderWalletInfo = () => {
    if (!account) {
      return (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <WalletIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Wallet Found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create a secure Hedera wallet to get started with SafeMate
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<WalletIcon />}
            onClick={handleCreateWallet}
          >
            Create Secure Wallet
          </Button>
        </Box>
      );
    }

    return (
      <Box>
        {/* Header with balance */}
        <Card 
          sx={{ 
            mb: 3, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            color: 'white' 
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                ⚡ Hedera Wallet
              </Typography>
              <Chip 
                label={account.network.toUpperCase()} 
                size="small"
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  fontWeight: 600
                }}
              />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {account.balance} HBAR
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Current Balance
            </Typography>
          </CardContent>
        </Card>

        {/* Account Details */}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AccountIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Account ID
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                  {account.accountId}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SecurityIcon sx={{ mr: 1, color: 'success.main' }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Security Level
                </Typography>
                <Chip 
                  label={account.security === 'kms-enhanced' ? 'KMS Enhanced' : 'Standard'} 
                  color={account.security === 'kms-enhanced' ? 'success' : 'default'}
                  size="small"
                />
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <NetworkIcon sx={{ mr: 1, color: 'info.main' }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Network
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {account.network.charAt(0).toUpperCase() + account.network.slice(1)}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {account.publicKey && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <KeyIcon sx={{ mr: 1, color: 'warning.main' }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Public Key
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: 'monospace', 
                        fontSize: '0.75rem',
                        mr: 1
                      }}
                    >
                      {showPublicKey 
                        ? account.publicKey 
                        : `${account.publicKey.substring(0, 20)}...`
                      }
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => setShowPublicKey(!showPublicKey)}
                    >
                      {showPublicKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            </Grid>
          )}
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Action Buttons */}
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Button 
              variant="outlined" 
              fullWidth
              size="small"
              startIcon={<LaunchIcon />}
              onClick={handleViewOnHashScan}
            >
              HashScan
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button 
              variant="outlined" 
              fullWidth
              size="small"
              startIcon={<RefreshIcon />}
              onClick={handleRefreshBalance}
              disabled={refreshingBalance}
            >
              {refreshingBalance ? 'Refreshing...' : 'Refresh'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    );
  };

  return (
    <>
      <BaseWidget
        widgetId={widgetId}
        accountType={accountType}
        title="Wallet Details"
        subtitle="Your Hedera account information"
        loading={isLoading}
        error={error}
        onRefresh={handleRefreshBalance}
      >
        {renderWalletInfo()}
      </BaseWidget>

      {/* Create Wallet Dialog */}
      <Dialog open={showCreateWalletDialog} onClose={() => setShowCreateWalletDialog(false)}>
        <DialogTitle>Create Secure Wallet</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            This will create a new secure Hedera wallet for your {accountType} account.
          </Alert>
          <Typography variant="body2">
            Your wallet will be protected with KMS encryption and stored securely in AWS.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateWalletDialog(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={() => setShowCreateWalletDialog(false)}>
            Create Wallet
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export const WalletDetailsWidgetDefinition = createWidget({
  id: 'wallet-details',
  name: 'Wallet Details',
  component: WalletDetailsWidget,
  category: 'wallet',
  permissions: ['personal', 'family', 'business', 'community', 'sporting', 'cultural'],
  gridSize: { cols: 6, rows: 10 },
  priority: 8,
});

WidgetRegistry.register(WalletDetailsWidgetDefinition);

export default WalletDetailsWidget;
