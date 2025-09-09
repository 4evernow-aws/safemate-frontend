import React, { useState } from 'react';
import { SecureWalletService } from '../services/secureWalletService';
import { Button, Card, Typography, Box, Alert, CircularProgress } from '@mui/material';

export function SecureWalletTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [hasWallet, setHasWallet] = useState<boolean | null>(null);
  const [walletInfo, setWalletInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const checkWallet = async () => {
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const hasSecureWallet = await SecureWalletService.hasSecureWallet();
      setHasWallet(hasSecureWallet);
      
      if (hasSecureWallet) {
        const wallet = await SecureWalletService.getSecureWallet();
        setWalletInfo(wallet);
        setMessage('Secure wallet found!');
      } else {
        setMessage('No secure wallet found. You can create one.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const createWallet = async () => {
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const result = await SecureWalletService.createSecureWallet(
        {},
        (status) => {
          setMessage(`${status.message} (${status.progress}%)`);
        }
      );

      if (result.success) {
        setHasWallet(true);
        setWalletInfo(result.wallet);
        setMessage('Secure wallet created successfully with KMS encryption!');
      } else {
        setError(result.error || 'Failed to create wallet');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const getNetworkInfo = () => {
    const info = SecureWalletService.getNetworkInfo();
    setMessage(`Network: ${info.network}, Security: ${info.security}`);
  };

  return (
    <Card sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        🔐 Secure Wallet Test (KMS-Enhanced)
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Test the KMS-enhanced secure wallet integration
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          onClick={checkWallet}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={16} /> : null}
        >
          Check Wallet
        </Button>
        
        <Button
          variant="contained"
          onClick={createWallet}
          disabled={isLoading || hasWallet === true}
          startIcon={isLoading ? <CircularProgress size={16} /> : null}
        >
          Create Secure Wallet
        </Button>
        
        <Button
          variant="outlined"
          onClick={getNetworkInfo}
          disabled={isLoading}
        >
          Network Info
        </Button>
      </Box>

      {message && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {hasWallet && walletInfo && (
        <Card variant="outlined" sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Secure Wallet Details
          </Typography>
          <Box sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
            <div><strong>Account Alias:</strong> {walletInfo.accountAlias}</div>
            <div><strong>Public Key:</strong> {walletInfo.publicKey?.substring(0, 50)}...</div>
            <div><strong>Security:</strong> {walletInfo.security}</div>
            <div><strong>Account Type:</strong> {walletInfo.accountType}</div>
            <div><strong>Version:</strong> {walletInfo.version}</div>
            <div><strong>Created:</strong> {walletInfo.createdAt}</div>
            {walletInfo.encryptionInfo && (
              <>
                <div><strong>KMS Key ID:</strong> {walletInfo.encryptionInfo.kmsKeyId}</div>
                <div><strong>Secret Name:</strong> {walletInfo.encryptionInfo.secretName}</div>
              </>
            )}
          </Box>
        </Card>
      )}

      {hasWallet === false && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          No secure wallet found. Click "Create Secure Wallet" to create one with KMS encryption.
        </Alert>
      )}
    </Card>
  );
} 