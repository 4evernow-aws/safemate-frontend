import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  LinearProgress,
  CircularProgress,
  Alert,
  Button,
  Paper,
  Grid
} from '@mui/material';
import { CheckCircle, Lock, Shield, Wallet, Copy, ExternalLink } from 'lucide-react';
import { SecureWalletService } from '../services/secureWalletService';
import { useHedera } from '../contexts/HederaContext';

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
  onCancel?: () => void;
  accountType?: string;
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'loading' | 'completed' | 'error';
  icon: React.ReactNode;
}

interface WalletDetails {
  accountId: string;
  publicKey: string;
  balance: string;
  network: string;
}

export default function OnboardingModal({ open, onComplete, onCancel, accountType = 'personal' }: OnboardingModalProps) {
  const { initializeAfterOnboarding } = useHedera();
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: 'account-created',
      title: 'User Account Created',
      description: 'Your SafeMate account has been successfully created',
      status: 'completed',
      icon: <CheckCircle size={24} color="#4CAF50" />
    },
    {
      id: 'wallet-init',
      title: 'Initializing Secure Wallet',
      description: 'Setting up your Hedera blockchain wallet',
      status: 'pending',
      icon: <Wallet size={24} color="#2196F3" />
    },
    {
      id: 'key-generation',
      title: 'Generating Secure Keys',
      description: 'Creating KMS-encrypted private keys',
      status: 'pending',
      icon: <Lock size={24} color="#FF9800" />
    },
    {
      id: 'account-creation',
      title: 'Creating Hedera Account',
      description: 'Setting up your account on Hedera testnet',
      status: 'pending',
      icon: <Shield size={24} color="#9C27B0" />
    },
    {
      id: 'completion',
      title: 'Wallet Setup Complete',
      description: 'Your secure wallet is ready to use',
      status: 'pending',
      icon: <CheckCircle size={24} color="#4CAF50" />
    }
  ]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [walletDetails, setWalletDetails] = useState<WalletDetails | null>(null);
  const [showWalletDetails, setShowWalletDetails] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);

  useEffect(() => {
    if (open && !isOnboardingCompleted) {
      console.log('🔍 OnboardingModal: Starting onboarding process...');
      startOnboarding();
    } else if (open && isOnboardingCompleted) {
      console.log('🔍 OnboardingModal: Onboarding completed, showing wallet details...');
      setShowWalletDetails(true);
    }
  }, [open, isOnboardingCompleted]);

  // Reset onboarding state when modal is closed
  useEffect(() => {
    if (!open) {
      setIsOnboardingCompleted(false);
      setShowWalletDetails(false);
      setError(null);
      setProgress(0);
      setCurrentStep(0);
      setSteps(prev => prev.map((step, index) => ({
        ...step,
        status: index === 0 ? 'completed' : 'pending'
      })));
    }
  }, [open]);

  const startOnboarding = async () => {
    console.log('🔍 OnboardingModal: startOnboarding called');
    try {
      console.log('🚀 Starting real wallet creation process...');
      
      // Step 1: Account already created (completed)
      await updateStep(0, 'completed');
      setProgress(20);
      
      // Step 2: Initialize wallet creation
      await updateStep(1, 'loading');
      setProgress(40);
      
      // Step 3: Generate keys (this happens during wallet creation)
      await updateStep(2, 'loading');
      setProgress(60);
      
      // Step 4: Create Hedera account (actual wallet creation)
      await updateStep(3, 'loading');
      setProgress(80);
      
      // Perform actual wallet creation
      console.log('🔄 Creating actual Hedera wallet...');
      const walletResult = await SecureWalletService.createSecureWallet({}, (status) => {
        console.log('🔄 Wallet creation status:', status.message);
      });
      
      console.log('🔍 OnboardingModal: Wallet creation result:', walletResult);
      
      if (walletResult.success && walletResult.wallet) {
        console.log('✅ Wallet created/retrieved successfully:', walletResult.wallet);
        
        // Extract wallet details
        const details: WalletDetails = {
          accountId: walletResult.wallet.accountId || 'N/A',
          publicKey: walletResult.wallet.publicKey || 'N/A',
          balance: String(walletResult.wallet.balance || '0'),
          network: 'Hedera Testnet'
        };
        
        console.log('🔍 OnboardingModal: Wallet details extracted:', details);
        setWalletDetails(details);
        
        // Mark steps as completed
        await updateStep(2, 'completed');
        await updateStep(3, 'completed');
        await updateStep(4, 'completed');
        setProgress(100);
        
        // Show wallet details
        setShowWalletDetails(true);
        
        // Mark onboarding as completed to prevent restart
        setIsOnboardingCompleted(true);
        
        // Initialize Hedera context with the new wallet
        console.log('🔄 Initializing Hedera context with new wallet...');
        await initializeAfterOnboarding();
        
        // Wait 3 seconds then proceed
        setTimeout(() => {
          onComplete();
        }, 3000);
        
      } else {
        throw new Error(walletResult.error || 'Failed to create wallet');
      }
      
    } catch (err) {
      console.error('❌ Wallet creation failed:', err);
      setError(err instanceof Error ? err.message : 'Wallet creation failed');
      
      // Mark current step as error
      if (currentStep < steps.length) {
        await updateStep(currentStep, 'error');
      }
    }
  };

  const updateStep = async (stepIndex: number, status: 'pending' | 'loading' | 'completed' | 'error') => {
    setSteps(prev => prev.map((step, index) =>
      index === stepIndex ? { ...step, status } : step
    ));
    setCurrentStep(stepIndex + 1);
    
    // Add a small delay for visual effect
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStepIcon = (step: OnboardingStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle size={24} color="#4CAF50" />;
      case 'loading':
        return <CircularProgress size={24} />;
      case 'error':
        return <Typography color="error">❌</Typography>;
      default:
        return step.icon;
    }
  };

  const getStepColor = (step: OnboardingStep) => {
    switch (step.status) {
      case 'completed':
        return '#4CAF50';
      case 'loading':
        return '#2196F3';
      case 'error':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  const handleCancel = () => {
    console.log('🔍 OnboardingModal: User cancelled onboarding');
    setIsCancelling(true);
    if (onCancel) {
      onCancel();
    }
  };

  // Only log when modal opens (not on every render)
  if (open && !showWalletDetails) {
    console.log('🔍 OnboardingModal: Opening with accountType=', accountType);
  }
  
  return (
    <Dialog
      open={open}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown
      sx={{
        zIndex: 9999  // Ensure modal appears above everything
      }}
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          zIndex: 9999,
          minHeight: '600px'  // Ensure minimum height for visibility
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1, position: 'relative' }}>
        <Box sx={{ fontWeight: 600, mb: 1 }}>
          🚀 Welcome to SafeMate!
        </Box>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Setting up your secure blockchain wallet
        </Typography>
        
        {/* Cancel button - only show during onboarding process, not when showing wallet details */}
        {!showWalletDetails && !isCancelling && (
          <Button
            variant="outlined"
            size="small"
            onClick={handleCancel}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              color: 'white',
              borderColor: 'rgba(255,255,255,0.5)',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            Cancel
          </Button>
        )}
      </DialogTitle>

      <DialogContent>
        {!showWalletDetails ? (
          <>
            <Box sx={{ mb: 3 }}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#4CAF50'
                  }
                }}
              />
              <Typography variant="body2" sx={{ mt: 1, textAlign: 'center', opacity: 0.8 }}>
                {Math.round(progress)}% Complete
              </Typography>
            </Box>

            <Box sx={{ space: 2 }}>
              {steps.map((step, index) => (
                <Box
                  key={step.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2,
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: step.status === 'loading' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                    border: step.status === 'loading' ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.1)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Box sx={{ mr: 2 }}>
                    {getStepIcon(step)}
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: getStepColor(step),
                        mb: 0.5
                      }}
                    >
                      {step.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        opacity: step.status === 'completed' ? 0.8 : 0.7
                      }}
                    >
                      {step.description}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </>
        ) : (
          <Box>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: 'rgba(76, 175, 80, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2
                }}
              >
                <CheckCircle size={40} color="#4CAF50" />
              </Box>
              <Typography variant="h4" sx={{ mb: 1, color: '#4CAF50' }}>
                🎉 Wallet Created Successfully!
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Your Hedera blockchain wallet is ready to use
              </Typography>
            </Box>

            {walletDetails && (
              <Paper sx={{ p: 3, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#4CAF50' }}>
                  📋 Wallet Details
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ opacity: 0.7, mb: 0.5 }}>
                        Account ID
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" sx={{ fontFamily: 'monospace', backgroundColor: 'rgba(0,0,0,0.2)', p: 1, borderRadius: 1, flex: 1 }}>
                          {walletDetails.accountId}
                        </Typography>
                        <Button
                          size="small"
                          onClick={() => copyToClipboard(walletDetails.accountId)}
                          sx={{ minWidth: 'auto', p: 1 }}
                        >
                          <Copy size={16} />
                        </Button>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ opacity: 0.7, mb: 0.5 }}>
                        Network
                      </Typography>
                      <Typography variant="body1" sx={{ fontFamily: 'monospace', backgroundColor: 'rgba(0,0,0,0.2)', p: 1, borderRadius: 1 }}>
                        {walletDetails.network}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ opacity: 0.7, mb: 0.5 }}>
                        Balance
                      </Typography>
                      <Typography variant="body1" sx={{ fontFamily: 'monospace', backgroundColor: 'rgba(0,0,0,0.2)', p: 1, borderRadius: 1 }}>
                        {walletDetails.balance} HBAR
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ opacity: 0.7, mb: 0.5 }}>
                        Public Key
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" sx={{ fontFamily: 'monospace', backgroundColor: 'rgba(0,0,0,0.2)', p: 1, borderRadius: 1, flex: 1, fontSize: '0.8rem' }}>
                          {walletDetails.publicKey.substring(0, 20)}...
                        </Typography>
                        <Button
                          size="small"
                          onClick={() => copyToClipboard(walletDetails.publicKey)}
                          sx={{ minWidth: 'auto', p: 1 }}
                        >
                          <Copy size={16} />
                        </Button>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ExternalLink size={16} />}
                    onClick={() => window.open(`https://hashscan.io/testnet/account/${walletDetails.accountId}`, '_blank')}
                    sx={{ color: 'white', borderColor: 'white', '&:hover': { borderColor: '#4CAF50' } }}
                  >
                    View on HashScan
                  </Button>
                </Box>
              </Paper>
            )}
            
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Redirecting to your dashboard...
              </Typography>
            </Box>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
}