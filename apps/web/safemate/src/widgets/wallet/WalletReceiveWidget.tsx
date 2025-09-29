import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent,
  Button,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Alert
} from '@mui/material';
import { 
  ContentCopy as CopyIcon,
  QrCode as QrIcon,
  Refresh as RefreshIcon,
  AccountBalance as WalletIcon
} from '@mui/icons-material';
import type { WidgetProps } from '../../dashboard/core/types';
import { BaseWidget } from '../shared/BaseWidget';
import { createWidget } from '../../dashboard/core/WidgetRegistry';

interface WalletInfo {
  accountId: string;
  accountAlias?: string;
  publicKey: string;
  balance: string;
  currency: string;
}

const WalletReceiveWidgetComponent: React.FC<WidgetProps> = ({ 
  widgetId, 
  accountType, 
  config, 
  onAction 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // Simulate fetching wallet info
  useEffect(() => {
    const fetchWalletInfo = async () => {
      setLoading(true);
      setError(null);

      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock wallet data
        const mockWalletInfo: WalletInfo = {
          accountId: '0.0.123456',
          accountAlias: 'alias-eb40c718bdbaaf8810ca2be2156a77032d509aadf8d6086819a108da9dd05b47',
          publicKey: '302a300506032b6570032100eb40c718bdbaaf8810ca2be2156a77032d509aadf8d6086819a108da9dd05b47',
          balance: accountType === 'business' ? '15,342.50' : '1,234.56',
          currency: 'HBAR'
        };

        setWalletInfo(mockWalletInfo);
      } catch (err) {
        setError('Failed to load wallet information');
      } finally {
        setLoading(false);
      }
    };

    fetchWalletInfo();
  }, [accountType]);

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleRefresh = () => {
    setWalletInfo(null);
  };

  const handleShowQR = () => {
    onAction?.('show-qr', { accountId: walletInfo?.accountId });
  };

  const actions = [
    {
      label: 'Show QR Code',
      action: 'show-qr',
      icon: <QrIcon fontSize="small" />
    },
    {
      label: 'Refresh Balance',
      action: 'refresh-balance',
      icon: <RefreshIcon fontSize="small" />
    }
  ];

  const formatPublicKey = (publicKey: string) => {
    if (publicKey.length > 50) {
      return `${publicKey.substring(0, 25)}...${publicKey.substring(publicKey.length - 25)}`;
    }
    return publicKey;
  };

  return (
    <BaseWidget
      widgetId={widgetId}
      accountType={accountType}
      title="Receive Funds"
      subtitle="Share your account details to receive HBAR"
      loading={loading}
      error={error}
      refreshable
      onRefresh={handleRefresh}
      actions={actions}
      onAction={onAction}
    >
      {walletInfo && (
        <Box>
          {/* Current Balance */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current Balance
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <WalletIcon color="primary" sx={{ fontSize: 32 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {walletInfo.balance}
                  </Typography>
                  <Typography color="text.secondary">
                    {walletInfo.currency}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Divider sx={{ my: 2 }} />

          {/* Account ID */}
          <Typography variant="h6" gutterBottom>
            Account ID
          </Typography>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography 
                  variant="body1" 
                  fontFamily="monospace"
                  sx={{ wordBreak: 'break-all' }}
                >
                  {walletInfo.accountId}
                </Typography>
                <Tooltip title={copied === 'accountId' ? 'Copied!' : 'Copy Account ID'}>
                  <IconButton
                    onClick={() => handleCopy(walletInfo.accountId, 'accountId')}
                    color={copied === 'accountId' ? 'success' : 'default'}
                    size="small"
                  >
                    <CopyIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </CardContent>
          </Card>

          {/* Account Alias (if available) */}
          {walletInfo.accountAlias && (
            <>
              <Typography variant="h6" gutterBottom>
                Account Alias
              </Typography>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography 
                      variant="body1" 
                      fontFamily="monospace"
                      sx={{ wordBreak: 'break-all' }}
                    >
                      {walletInfo.accountAlias}
                    </Typography>
                    <Tooltip title={copied === 'alias' ? 'Copied!' : 'Copy Alias'}>
                      <IconButton
                        onClick={() => handleCopy(walletInfo.accountAlias!, 'alias')}
                        color={copied === 'alias' ? 'success' : 'default'}
                        size="small"
                      >
                        <CopyIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </>
          )}

          {/* Public Key */}
          <Typography variant="h6" gutterBottom>
            Public Key
          </Typography>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography 
                  variant="body2" 
                  fontFamily="monospace"
                  sx={{ wordBreak: 'break-all' }}
                >
                  {formatPublicKey(walletInfo.publicKey)}
                </Typography>
                <Tooltip title={copied === 'publicKey' ? 'Copied!' : 'Copy Public Key'}>
                  <IconButton
                    onClick={() => handleCopy(walletInfo.publicKey, 'publicKey')}
                    color={copied === 'publicKey' ? 'success' : 'default'}
                    size="small"
                  >
                    <CopyIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Box display="flex" gap={1}>
            <Button
              variant="contained"
              startIcon={<QrIcon />}
              onClick={handleShowQR}
              fullWidth
            >
              Show QR Code
            </Button>
          </Box>

          {/* Info Box */}
          <Box sx={{ mt: 2, p: 1, backgroundColor: 'info.light', borderRadius: 1 }}>
            <Typography variant="caption" color="info.contrastText">
              <strong>Network:</strong> Hedera Testnet<br />
              <strong>Supported:</strong> HBAR transfers<br />
              <strong>Confirmation:</strong> ~3-5 seconds
            </Typography>
          </Box>

          {/* Success Message */}
          {copied && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {copied === 'accountId' && 'Account ID copied to clipboard!'}
              {copied === 'alias' && 'Account alias copied to clipboard!'}
              {copied === 'publicKey' && 'Public key copied to clipboard!'}
            </Alert>
          )}
        </Box>
      )}
    </BaseWidget>
  );
};

// Create the widget definition
export const WalletReceiveWidget = createWidget({
  id: 'wallet-receive',
  name: 'Receive Funds',
  component: WalletReceiveWidgetComponent,
  category: 'wallet',
  permissions: ['personal', 'family', 'business', 'community', 'sporting', 'cultural'],
  gridSize: { cols: 4, rows: 6, minCols: 3, minRows: 5 },
  priority: 85
});

export default WalletReceiveWidgetComponent;
