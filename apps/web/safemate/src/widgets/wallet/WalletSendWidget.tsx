import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Card, 
  CardContent,
  Alert,
  CircularProgress,
  InputAdornment,
  Chip
} from '@mui/material';
import { 
  Send as SendIcon,
  AccountBalance as WalletIcon,
  QrCode as QrIcon
} from '@mui/icons-material';
import type { WidgetProps } from '../../dashboard/core/types';
import { BaseWidget } from '../shared/BaseWidget';
import { createWidget } from '../../dashboard/core/WidgetRegistry';

interface SendFundsData {
  recipient: string;
  amount: string;
  currency: string;
  memo?: string;
}

const WalletSendWidgetComponent: React.FC<WidgetProps> = ({ 
  widgetId, 
  accountType, 
  config, 
  onAction 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<SendFundsData>({
    recipient: '',
    amount: '',
    currency: 'HBAR',
    memo: ''
  });

  const handleInputChange = (field: keyof SendFundsData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setError(null);
    setSuccess(null);
  };

  const validateForm = (): boolean => {
    if (!formData.recipient.trim()) {
      setError('Recipient address is required');
      return false;
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Amount must be greater than 0');
      return false;
    }

    // Basic Hedera account ID validation
    if (!formData.recipient.match(/^\d+\.\d+\.\d+$/)) {
      setError('Invalid Hedera account ID format (e.g., 0.0.123456)');
      return false;
    }

    return true;
  };

  const handleSend = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock successful transaction
      const transactionId = `0.0.${Math.floor(Math.random() * 1000000)}@${Date.now()}`;
      
      setSuccess(`Transaction successful! ID: ${transactionId}`);
      setFormData({
        recipient: '',
        amount: '',
        currency: 'HBAR',
        memo: ''
      });

      // Trigger action for parent components
      onAction?.('transaction-sent', {
        transactionId,
        recipient: formData.recipient,
        amount: formData.amount,
        currency: formData.currency
      });

    } catch (err) {
      setError('Failed to send transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleScanQR = () => {
    onAction?.('scan-qr');
  };

  const actions = [
    {
      label: 'Scan QR Code',
      action: 'scan-qr',
      icon: <QrIcon fontSize="small" />
    },
    {
      label: 'View Recent',
      action: 'view-recent',
      icon: <WalletIcon fontSize="small" />
    }
  ];

  return (
    <BaseWidget
      widgetId={widgetId}
      accountType={accountType}
      title="Send Funds"
      subtitle="Transfer HBAR to another account"
      loading={loading}
      error={error}
      actions={actions}
      onAction={onAction}
    >
      <Box>
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Transaction Details
            </Typography>
            
            <TextField
              fullWidth
              label="Recipient Account ID"
              value={formData.recipient}
              onChange={handleInputChange('recipient')}
              placeholder="0.0.123456"
              margin="normal"
              disabled={loading}
              helperText="Enter the Hedera account ID of the recipient"
            />

            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={handleInputChange('amount')}
              placeholder="0.00"
              margin="normal"
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Chip label={formData.currency} size="small" />
                  </InputAdornment>
                ),
              }}
              helperText="Enter the amount to send"
            />

            <TextField
              fullWidth
              label="Memo (Optional)"
              value={formData.memo}
              onChange={handleInputChange('memo')}
              placeholder="Transaction memo"
              margin="normal"
              disabled={loading}
              helperText="Add a note to this transaction"
            />
          </CardContent>
        </Card>

        <Box display="flex" gap={1}>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
            onClick={handleSend}
            disabled={loading || !formData.recipient || !formData.amount}
            fullWidth
          >
            {loading ? 'Sending...' : 'Send Funds'}
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<QrIcon />}
            onClick={handleScanQR}
            disabled={loading}
          >
            QR
          </Button>
        </Box>

        <Box sx={{ mt: 2, p: 1, backgroundColor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            <strong>Network:</strong> Hedera Testnet<br />
            <strong>Fee:</strong> ~0.0001 HBAR<br />
            <strong>Confirmation:</strong> ~3-5 seconds
          </Typography>
        </Box>
      </Box>
    </BaseWidget>
  );
};

// Create the widget definition
export const WalletSendWidget = createWidget({
  id: 'wallet-send',
  name: 'Send Funds',
  component: WalletSendWidgetComponent,
  category: 'wallet',
  permissions: ['personal', 'family', 'business', 'community', 'sporting', 'cultural'],
  gridSize: { cols: 4, rows: 6, minCols: 3, minRows: 5 },
  priority: 90
});

export default WalletSendWidgetComponent;
