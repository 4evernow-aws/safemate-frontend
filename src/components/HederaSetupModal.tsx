import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Link,
  Chip,
  Divider,
  Card,
  CardContent,
  alpha,
  useTheme,
} from '@mui/material';
import { AccountBalanceWallet as WalletIcon } from '@mui/icons-material';
import { useHedera } from '../contexts/HederaContext';
import HederaApiService from '../services/hederaApiService';
import { config } from '../config/environment';

interface HederaSetupModalProps {
  open: boolean;
  onClose: () => void;
}

const steps = [
  'Enter Credentials',
  'Verify Account', 
  'Complete Setup'
];

export default function HederaSetupModal({ open, onClose }: HederaSetupModalProps) {
  const { initializeWithUserCredentials, isLoading } = useHedera();
  const [activeStep, setActiveStep] = useState(0);
  const [accountId, setAccountId] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [network, setNetwork] = useState<'testnet' | 'mainnet'>(config.hederaNetwork);
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);

  const handleReset = () => {
    setActiveStep(0);
    setAccountId('');
    setPrivateKey('');
    setError(null);
    setValidating(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const validateCredentials = async () => {
    setValidating(true);
    setError(null);

    try {
      // Validate account ID format
      if (!HederaApiService.validateAccountId(accountId)) {
        throw new Error('Invalid account ID format. Expected format: x.y.z (e.g., 0.0.123456)');
      }

      // Validate private key format (basic check)
      if (!privateKey || privateKey.length < 64) {
        throw new Error('Invalid private key. Private key should be a 64-character hex string.');
      }

      // Test account exists on the network
      const accountInfo = await HederaApiService.getAccountInfo(accountId);
      if (!accountInfo.success) {
        throw new Error(`Account ${accountId} not found on ${network}. Please check the account ID and network.`);
      }

      setActiveStep(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Validation failed');
    } finally {
      setValidating(false);
    }
  };

  const handleSetup = async () => {
    setError(null);

    try {
      await initializeWithUserCredentials(accountId, privateKey, network);
      setActiveStep(2);
      
      // Auto-close after success
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Setup failed');
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                To use SafeMate with real Hedera integration, you need to provide your Hedera account credentials.
                Your private key will be encrypted and stored securely.
              </Typography>
            </Alert>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Network</InputLabel>
              <Select
                value={network}
                label="Network"
                onChange={(e) => setNetwork(e.target.value as 'testnet' | 'mainnet')}
              >
                <MenuItem value="testnet">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Testnet
                    <Chip label="Recommended" size="small" color="primary" />
                  </Box>
                </MenuItem>
                <MenuItem value="mainnet">Mainnet</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Account ID"
              placeholder="0.0.123456"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value.trim())}
              sx={{ mb: 2 }}
              helperText="Your Hedera account ID (format: x.y.z)"
            />

            <TextField
              fullWidth
              label="Private Key"
              type="password"
              placeholder="302e020100300506032b657004220420..."
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value.trim())}
              sx={{ mb: 2 }}
              helperText="Your Hedera account private key (64-character hex string)"
            />

            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Don't have a Hedera account yet?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You can create one using the{' '}
                <Link 
                  href="https://portal.hedera.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Hedera Portal
                </Link>{' '}
                or{' '}
                <Link 
                  href="https://hashpack.app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  HashPack Wallet
                </Link>
                .
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Verifying Account
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Account ID: {accountId}
              <br />
              Network: {network.charAt(0).toUpperCase() + network.slice(1)}
            </Typography>
            
            {isLoading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <CircularProgress />
                <Typography variant="body2">
                  Setting up your Hedera integration...
                </Typography>
              </Box>
            ) : (
              <Alert severity="success">
                <Typography variant="body2">
                  Account verified successfully! Click "Complete Setup" to finish.
                </Typography>
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Setup Complete! 🎉
              </Typography>
              <Typography variant="body2">
                Your Hedera account has been connected successfully. You can now:
              </Typography>
            </Alert>

            <Box sx={{ mt: 2, textAlign: 'left' }}>
              <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
                <li>Upload files to Hedera File Service</li>
                <li>View your real account balance</li>
                <li>Transfer HBAR and tokens</li>
                <li>Access all SafeMate features with real blockchain integration</li>
              </Typography>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm" 
      fullWidth
      disableEscapeKeyDown={isLoading}
    >
      <DialogTitle>
        Set up Hedera Integration
      </DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent()}
      </DialogContent>

      <DialogActions>
        {activeStep === 0 && (
          <>
            <Button onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={validateCredentials}
              disabled={!accountId || !privateKey || validating}
              startIcon={validating ? <CircularProgress size={16} /> : undefined}
            >
              {validating ? 'Validating...' : 'Validate & Continue'}
            </Button>
          </>
        )}

        {activeStep === 1 && (
          <>
            <Button onClick={() => setActiveStep(0)} disabled={isLoading}>
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleSetup}
              disabled={isLoading}
            >
              Complete Setup
            </Button>
          </>
        )}

        {activeStep === 2 && (
          <Button variant="contained" onClick={handleClose}>
            Done
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
} 