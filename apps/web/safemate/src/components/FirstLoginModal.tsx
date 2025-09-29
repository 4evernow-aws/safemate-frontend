import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  LinearProgress,
  Step,
  StepLabel,
  Stepper,
  Alert,
  Button,
  Link,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassIcon from '@mui/icons-material/HourglassEmpty';
import { useHedera } from '../contexts/HederaContext';

interface FirstLoginModalProps {
  open: boolean;
  onClose: () => void;
}

const steps = [
  'Creating Hedera ledger account',
  'Retrieving ledger files',
  'Ready!',
];

export default function FirstLoginModal({ open, onClose }: FirstLoginModalProps) {
  const { initializeWithUserCredentials, isLoading, error, isInitialized } = useHedera();
  const [activeStep, setActiveStep] = useState(0);
  const [stepStatus, setStepStatus] = useState<('pending' | 'loading' | 'completed' | 'error')[]>([
    'pending',
    'pending',
    'pending',
  ]);

  useEffect(() => {
    if (open && !isInitialized && !isLoading) {
      startInitialization();
    }
  }, [open, isInitialized, isLoading]);

  const startInitialization = async () => {
    try {
      // Step 1: Creating Hedera account
      setActiveStep(0);
      setStepStatus(['loading', 'pending', 'pending']);
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
      
      // Step 2: Initialize Hedera and create wallet
      setStepStatus(['completed', 'loading', 'pending']);
      setActiveStep(1);
      
      // Get the current user's JWT token
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Call the wallet creation API
      const response = await fetch(`${import.meta.env.VITE_WALLET_API_URL}/wallet/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          initialBalance: 100000000 // 1 HBAR in tinybars
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create wallet: ${response.statusText}`);
      }

      const walletData = await response.json();
      
      // Initialize Hedera with real wallet credentials
      await initializeWithUserCredentials(
        walletData.accountId,
        walletData.privateKey || 'managed-by-backend',
        'testnet'
      );
      
      // Step 3: Ready
      setStepStatus(['completed', 'completed', 'loading']);
      setActiveStep(2);
      
      await new Promise(resolve => setTimeout(resolve, 500)); // Brief pause
      
      setStepStatus(['completed', 'completed', 'completed']);
      
      // Auto-close after success
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (err) {
      console.error('Initialization failed:', err);
      const errorStepStatus = [...stepStatus];
      errorStepStatus[activeStep] = 'error';
      setStepStatus(errorStepStatus);
    }
  };

  const getStepIcon = (stepIndex: number) => {
    const status = stepStatus[stepIndex];
    
    switch (status) {
      case 'loading':
        return <HourglassIcon color="primary" />;
      case 'completed':
        return <CheckCircleIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return null;
    }
  };

  const retry = () => {
    setActiveStep(0);
    setStepStatus(['pending', 'pending', 'pending']);
    startInitialization();
  };

  const hasError = stepStatus.includes('error') || error;

  return (
    <Dialog
      open={open}
      disableEscapeKeyDown
      PaperProps={{
        sx: {
          width: '100%',
          maxWidth: 500,
          m: 2,
        },
      }}
    >
      <DialogContent sx={{ p: 4 }}>
        <Box textAlign="center" mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Welcome to SafeMate Portal
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Setting up your Hedera account for secure file management
          </Typography>
          <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
            Powered by $MATE Token Ecosystem
          </Typography>
        </Box>

        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel
                icon={getStepIcon(index)}
                sx={{
                  '& .MuiStepLabel-label': {
                    fontSize: '1rem',
                    fontWeight: stepStatus[index] === 'loading' ? 600 : 400,
                  },
                }}
              >
                {label}
                {stepStatus[index] === 'loading' && (
                  <Box mt={1}>
                    <LinearProgress sx={{ width: 200 }} />
                  </Box>
                )}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {hasError && (
          <Box mt={3}>
            <Alert 
              severity="error" 
              sx={{ mb: 2 }}
            >
              <Typography variant="body2" gutterBottom>
                Failed to initialize your Hedera account. This might be due to network issues or configuration problems.
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 2 }}>
                Click the button below to set up your Hedera account manually:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button 
                  variant="contained" 
                  size="small" 
                  onClick={retry}
                  color="primary"
                >
                  Set Up Hedera Account
                </Button>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={retry}
                  color="inherit"
                >
                  Retry Setup
                </Button>
              </Box>
            </Alert>
            
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Setup includes:</strong>
              </Typography>
              <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                • Creating your Hedera account keys<br/>
                • Connecting to secure network<br/>
                • Initializing secure file storage<br/>
                • Preparing your $MATE token integration
              </Typography>
            </Alert>
            
            <Box textAlign="center" mt={2}>
              <Link 
                href="#" 
                variant="body2" 
                onClick={(e) => {
                  e.preventDefault();
                  // Open help documentation in new tab
                  window.open('https://docs.safemate.io/setup-guide', '_blank');
                }}
              >
                Need Help? View Setup Guide / Contact Support
              </Link>
            </Box>
          </Box>
        )}

        {isInitialized && !hasError && (
          <Box mt={3} textAlign="center">
            <Alert severity="success">
              <Typography variant="body2">
                Your Hedera account is ready! Welcome to the portal.
              </Typography>
            </Alert>
          </Box>
        )}

        {/* Bottom Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mt: 3,
          pt: 2,
          borderTop: '1px solid rgba(0,0,0,0.1)'
        }}>
          {/* Contact Help Button - Bottom Left */}
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              // Open help/support page
              window.open('https://docs.safemate.io/help', '_blank');
            }}
            sx={{
              textTransform: 'none',
            }}
          >
            Contact Help
          </Button>

          {/* Close Button - Bottom Right */}
          <Button
            variant="contained"
            size="small"
            onClick={onClose}
            sx={{
              textTransform: 'none',
              minWidth: 80,
              fontWeight: 600,
            }}
          >
            Close
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
} 