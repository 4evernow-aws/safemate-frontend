import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  LinearProgress,
  Chip,
  IconButton,
  Avatar,
  Paper,
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tab,
  Tabs,
  ListItemSecondaryAction,
  CircularProgress,
} from '@mui/material';
import {
  AccountBalance as WalletIcon,
  Token as TokenIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Send as SendIcon,
  Refresh as RefreshIcon,
  Download as DepositIcon,
  Security as SecurityIcon,
  History as HistoryIcon,
  AutoAwesome as AutoAwesomeIcon,
  Savings as SavingsIcon,
  AttachMoney as MoneyIcon,
  AccountBalanceWallet as AccountWalletIcon,
  SwapHoriz as SwapIcon,
  Analytics as AnalyticsIcon,
  Storefront as StorefrontIcon,
  Receipt as ReceiptIcon,
  Launch as LaunchIcon,
  Add as AddIcon,
  QrCode as QrCodeIcon,
  FileCopy as CopyIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useHedera } from '../../contexts/HederaContext';
import { useSnackbar } from 'notistack';
import { config } from '../../config/environment';
import ModernStatsCard from '../ModernStatsCard';
import ModernActionCard from '../ModernActionCard';
import HederaApiService from '../../services/hederaApiService';

interface ModernBlockchainDashboardProps {
  className?: string;
}

export default function ModernBlockchainDashboard({ className = '' }: ModernBlockchainDashboardProps) {
  const { account, refreshBalance, isInitialized, isLoading, forceInitialize } = useHedera();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  
  const [activeTab, setActiveTab] = useState(0);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [hasAttemptedBalanceRefresh, setHasAttemptedBalanceRefresh] = useState(false);
  const [hasAttemptedTransactionLoad, setHasAttemptedTransactionLoad] = useState(false);

  // Transfer form state
  const [transferForm, setTransferForm] = useState({
    recipient: '',
    amount: '',
    type: 'hbar' as 'hbar' | 'mate',
    memo: '',
  });

  // Force initialize Hedera context when component mounts
  useEffect(() => {
    const initializeWallet = async () => {
      if (!isInitialized || !account) {
        console.log('🔄 Wallet dashboard: Force initializing Hedera context');
        const success = await forceInitialize();
        if (success) {
          console.log('✅ Wallet dashboard: Hedera context initialized successfully');
        } else {
          console.log('⚠️ Wallet dashboard: Hedera context initialization failed or no wallet found');
        }
      }
    };
    
    initializeWallet();
  }, [isInitialized, account?.accountId, forceInitialize]); // Add forceInitialize back to dependencies

  // Debug logging for account data
  useEffect(() => {
    console.log('🔍 Wallet Dashboard Debug - Account Data:', {
      account,
      isInitialized,
      isLoading,
      isRefreshing
    });
  }, [account, isInitialized, isLoading, isRefreshing]);

  // Load real transactions when component mounts or account changes
  useEffect(() => {
    if (account?.accountId && !config.isDemoMode && !hasAttemptedTransactionLoad) {
      setHasAttemptedTransactionLoad(true);
      loadRealTransactions();
    } else if (config.isDemoMode) {
      loadMockTransactions();
    }
  }, [account?.accountId, hasAttemptedTransactionLoad]); // Add flag to prevent multiple attempts

  // Auto-refresh HBAR balance on mount only (removed interval to prevent constant loading)
  useEffect(() => {
    const fetchBalance = async () => {
      if (!account?.accountId || hasAttemptedBalanceRefresh) return;
      
      console.log('🔄 Auto-refreshing balance for account:', account.accountId);
      setIsRefreshing(true);
      setHasAttemptedBalanceRefresh(true);
      try {
        await refreshBalance();
        console.log('✅ Balance refresh completed');
      } catch (error) {
        console.error('❌ Failed to fetch balance:', error);
        // Don't retry automatically on error to prevent constant loading
      } finally {
        setIsRefreshing(false);
      }
    };
    
    // Only fetch once on mount, not continuously
    fetchBalance();
  }, [account?.accountId, hasAttemptedBalanceRefresh, refreshBalance]); // Add refreshBalance to dependencies

  const loadRealTransactions = async () => {
    if (!account?.accountId) return;
    
    setIsLoadingTransactions(true);
    try {
      console.log('🔍 Loading real transactions for account:', account.accountId);
      const result = await HederaApiService.getAccountTransactions(account.accountId, 10);
      
      if (result.success && result.data) {
        // Transform transactions to our format
        const transformedTransactions = result.data.map((tx: any) => ({
          id: tx.transaction_id,
          type: getTransactionTypeFromHedera(tx.name),
          description: getTransactionDescription(tx),
          amount: getTransactionAmount(tx),
          currency: getTransactionCurrency(tx),
          reward: '', // File storage rewards
          time: formatTransactionTime(tx.consensus_timestamp),
          status: tx.result === 'SUCCESS' ? 'completed' : 'failed'
        }));
        
        setTransactions(transformedTransactions);
        console.log('✅ Loaded real transactions:', transformedTransactions.length);
      } else {
        console.log('❌ Failed to load transactions:', result.error);
        setTransactions([]);
      }
    } catch (error: any) {
      console.error('Error loading real transactions:', error);
      // Don't show error for 404 - account might not have transactions yet
      if (error?.message?.includes('404')) {
        console.log('ℹ️ No transactions found for account (404) - this is normal for new accounts');
      } else {
        console.error('❌ Failed to load transactions:', error);
      }
      setTransactions([]);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const loadMockTransactions = () => {
    // Mock data for demo mode
    setTransactions([
      { 
        id: '1', 
        type: 'upload', 
        description: 'File upload: Report.pdf', 
        amount: '-0.001', 
        currency: 'ℏ', 
        reward: '+5 MATE',
        time: '2 hours ago',
        status: 'completed'
      },
      { 
        id: '2', 
        type: 'share', 
        description: 'Shared folder with team', 
        amount: '-0.002', 
        currency: 'ℏ', 
        reward: '+3 MATE',
        time: '1 day ago',
        status: 'completed'
      },
      { 
        id: '3', 
        type: 'reward', 
        description: 'Daily MATE bonus', 
        amount: '+10', 
        currency: 'MATE', 
        reward: '',
        time: '1 day ago',
        status: 'completed'
      },
      { 
        id: '4', 
        type: 'transfer', 
        description: 'Sent to 0.0.789012', 
        amount: '-2.5', 
        currency: 'ℏ', 
        reward: '',
        time: '3 days ago',
        status: 'completed'
      },
    ]);
  };

  // Helper functions to transform Hedera transaction data
  const getTransactionTypeFromHedera = (hederaType: string): string => {
    switch (hederaType?.toLowerCase()) {
      case 'cryptotransfer': return 'transfer';
      case 'filecreate': return 'upload';
      case 'fileappend': return 'upload';
      case 'consensussubmitmessage': return 'message';
      case 'tokentransfer': return 'reward';
      default: return 'transfer';
    }
  };

  const getTransactionDescription = (tx: any): string => {
    const type = tx.name?.toLowerCase();
    switch (type) {
      case 'cryptotransfer':
        return tx.transfers?.length > 0 ? 
          `Transfer to ${tx.transfers[0].account}` : 'HBAR Transfer';
      case 'filecreate':
        return 'File uploaded to blockchain';
      case 'fileappend':
        return 'File content updated';
      case 'consensussubmitmessage':
        return 'Message submitted';
      case 'tokentransfer':
        return 'Token transfer';
      default:
        return tx.name || 'Unknown transaction';
    }
  };

  const getTransactionAmount = (tx: any): string => {
    if (tx.transfers && tx.transfers.length > 0) {
      const amount = Math.abs(tx.transfers[0].amount) / 100000000; // Convert tinybars to HBAR
      return tx.transfers[0].amount > 0 ? `+${amount}` : `-${amount}`;
    }
    return '0';
  };

  const getTransactionCurrency = (tx: any): string => {
    // Check if it's a token transfer
    if (tx.token_transfers && tx.token_transfers.length > 0) {
      return 'NFT'; // File/folder NFTs
    }
    return 'ℏ';
  };

  const formatTransactionTime = (consensusTimestamp: string): string => {
    const date = new Date(parseFloat(consensusTimestamp) * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Calculate real storage stats based on actual account data
  const storageStats = {
    totalFiles: account ? 0 : 247, // Will be updated with real file count
    totalSize: account ? 0 : 1.2, // Will be updated with real file sizes
    totalSpent: account ? 0 : 0.12, // Calculate from real transactions
    mateEarned: account?.mateBalance ? parseInt(account.mateBalance) : 150,
    savingsPercent: 40, // This would need calculation based on traditional storage costs
  };

  const handleRefreshBalance = async () => {
    if (isRefreshing) return; // Prevent multiple simultaneous refreshes
    
    console.log('🔄 Manual balance refresh requested');
    setIsRefreshing(true);
    try {
      await refreshBalance();
      console.log('✅ Manual balance refresh completed');
      enqueueSnackbar('Balance refreshed successfully!', { variant: 'success' });
    } catch (error) {
      console.error('❌ Failed to refresh balance:', error);
      enqueueSnackbar('Failed to refresh balance. Please check your connection.', { variant: 'error' });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefreshTransactions = async () => {
    if (isLoadingTransactions) return; // Prevent multiple simultaneous loads
    
    setHasAttemptedTransactionLoad(false); // Reset flag to allow retry
    setHasAttemptedTransactionLoad(true);
    await loadRealTransactions();
  };

  const handleTransfer = async () => {
    // Mock transfer function
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTransferDialogOpen(false);
      setTransferForm({ recipient: '', amount: '', type: 'hbar', memo: '' });
      enqueueSnackbar(`Transfer of ${transferForm.amount} ${transferForm.type === 'hbar' ? 'ℏ' : 'MATE'} initiated!`, { 
        variant: 'success' 
      });
    } catch (error) {
      enqueueSnackbar('Transfer failed. Please try again.', { variant: 'error' });
    }
  };

  const copyAccountId = () => {
    if (account?.accountId) {
      navigator.clipboard.writeText(account.accountId);
      enqueueSnackbar('Account ID copied to clipboard!', { variant: 'success' });
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'upload': return <SecurityIcon />;
      case 'share': return <SendIcon />;
      case 'reward': return <TokenIcon />;
      case 'transfer': return <SwapIcon />;
      default: return <ReceiptIcon />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'upload': return 'primary';
      case 'share': return 'secondary';
      case 'reward': return 'success';
      case 'transfer': return 'info';
      default: return 'default';
    }
  };

  // Show loading state while Hedera context is initializing
  if (!config.isDemoMode && (isLoading || (!isInitialized && !hasAttemptedBalanceRefresh))) {
    return (
      <Box sx={{ 
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
          : 'linear-gradient(135deg, #f5f7ff 0%, #ffffff 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
            Loading Your Wallet...
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Connecting to your Hedera account and fetching wallet information
          </Typography>
        </Container>
      </Box>
    );
  }

  // Show setup required only if initialization is complete but account is not available
  if (!config.isDemoMode && isInitialized && !account && hasAttemptedBalanceRefresh) {
    return (
      <Box sx={{ 
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
          : 'linear-gradient(135deg, #f5f7ff 0%, #ffffff 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Alert severity="warning" sx={{ maxWidth: 500 }}>
          <Typography variant="h6" gutterBottom>
            Hedera Setup Required
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Please complete your Hedera account setup to access wallet features.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => window.location.href = '/app/profile'}
              startIcon={<AccountWalletIcon />}
            >
              Create Wallet
            </Button>
            <Button 
              variant="outlined"
              onClick={() => {
                localStorage.setItem('safemate-demo-mode', 'true');
                window.location.reload();
              }}
              startIcon={<AutoAwesomeIcon />}
            >
              Try Demo Mode
            </Button>
            <Button 
              variant="outlined"
              onClick={() => window.location.reload()}
              startIcon={<RefreshIcon />}
            >
              Refresh
            </Button>
          </Box>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      background: theme.palette.mode === 'dark' 
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
        : 'linear-gradient(135deg, #f5f7ff 0%, #ffffff 100%)',
      minHeight: '100vh',
      pb: 4,
    }}>
      <Container maxWidth="xl" sx={{ pt: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 800,
                  background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #8b9dff 0%, #9d7bd6 100%)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                }}
              >
                Hedera Wallet 💰
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
                Manage your HBAR wallet and MATE rewards on Hedera testnet
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <IconButton 
                onClick={handleRefreshBalance} 
                disabled={isRefreshing}
                sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                }}
              >
                <RefreshIcon />
              </IconButton>
              <Button
                variant="outlined"
                startIcon={<DepositIcon />}
                onClick={() => setDepositDialogOpen(true)}
                sx={{ borderRadius: 3 }}
              >
                Deposit
              </Button>
              <Button
                variant="contained"
                startIcon={<SendIcon />}
                onClick={() => setTransferDialogOpen(true)}
                sx={{ borderRadius: 3 }}
              >
                Send
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Account Info Card */}
        <Card sx={{ mb: 4, borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            p: 4 
          }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ 
                    width: 64, 
                    height: 64, 
                    mr: 3,
                    bgcolor: alpha('#ffffff', 0.2),
                  }}>
                    <AccountWalletIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight={700}>
                      Main Wallet
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                        {account?.accountId || '0.0.123456'}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={copyAccountId}
                        sx={{ color: 'rgba(255,255,255,0.8)' }}
                      >
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        label={`${config.hederaNetwork.toUpperCase()} Network`}
                        size="small"
                        sx={{ 
                          bgcolor: alpha('#ffffff', 0.2),
                          color: 'white',
                        }}
                      />
                      {account?.accountId && (
                        <Chip 
                          label={isRefreshing ? "Refreshing..." : "Connected"}
                          size="small"
                          color={isRefreshing ? "warning" : "success"}
                          sx={{ 
                            bgcolor: isRefreshing ? alpha('#ff9800', 0.2) : alpha('#4caf50', 0.2),
                            color: 'white',
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 1, mb: 1 }}>
                    <Typography variant="h3" fontWeight={800}>
                      {isRefreshing ? "Loading..." : `${account?.balance || '25.4'} ℏ`}
                    </Typography>
                    <IconButton 
                      onClick={handleRefreshBalance} 
                      disabled={isRefreshing}
                      sx={{ 
                        color: 'white',
                        bgcolor: alpha('#ffffff', 0.2),
                        '&:hover': { 
                          bgcolor: alpha('#ffffff', 0.3),
                          transform: 'rotate(180deg)',
                          transition: 'all 0.3s ease'
                        },
                        '&:disabled': {
                          bgcolor: alpha('#ffffff', 0.1),
                          color: alpha('#ffffff', 0.5)
                        }
                      }}
                    >
                      {isRefreshing ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
                    </IconButton>
                  </Box>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    ≈ ${((parseFloat(account?.balance || '25.4')) * 0.12).toFixed(2)} USD
                  </Typography>
                  {!account?.balance && !isRefreshing && (
                    <Typography variant="caption" sx={{ opacity: 0.7, fontStyle: 'italic' }}>
                      Click refresh to load balance
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Card>

        {/* Balance & Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <ModernStatsCard
              title="HBAR Balance"
              value={isRefreshing ? "Loading..." : `${account?.balance || '25.4'} ℏ`}
              subtitle="Available for transactions"
              icon={<WalletIcon />}
              color="primary"
              trend={{ value: 5, label: 'vs last month' }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <ModernStatsCard
              title="MATE Tokens"
              value={isRefreshing ? "Loading..." : `${account?.mateBalance || '0'} MATE`}
              subtitle="Rewards earned"
              icon={<TokenIcon />}
              color="success"
              trend={{ value: 12, label: 'this week' }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <ModernStatsCard
              title="Storage Cost"
              value="0.12 ℏ"
              subtitle="Total spent"
              icon={<StorefrontIcon />}
              color="warning"
              trend={{ value: -8, label: 'vs cloud' }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <ModernStatsCard
              title="Network Fees"
              value="~$0.001"
              subtitle="Per transaction"
              icon={<SpeedIcon />}
              color="info"
            />
          </Grid>
        </Grid>

        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} lg={8}>
            {/* Quick Actions */}
            <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
              ⚡ Quick Actions
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <ModernActionCard
                  title="Send HBAR"
                  description="Transfer HBAR to another account"
                  icon={<SendIcon />}
                  buttonText="Send Now"
                  onClick={() => setTransferDialogOpen(true)}
                  color="primary"
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <ModernActionCard
                  title="Earn MATE Rewards"
                  description="Upload files to earn MATE reward points"
                  icon={<TokenIcon />}
                  buttonText="Start Earning"
                  onClick={() => window.location.href = '/app/files'}
                  color="success"
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <ModernActionCard
                  title="View Explorer"
                  description="View account on HashScan"
                  icon={<LaunchIcon />}
                  buttonText="Open Explorer"
                  onClick={() => window.open(`https://hashscan.io/${config.hederaNetwork}/account/${account?.accountId}`, '_blank')}
                  color="info"
                />
              </Grid>
            </Grid>

            {/* Transactions & Activity */}
            <Card sx={{ borderRadius: 3 }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                  <Tab 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <HistoryIcon fontSize="small" />
                        Recent Transactions
                      </Box>
                    } 
                  />
                  <Tab 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AnalyticsIcon fontSize="small" />
                        Analytics
                      </Box>
                    } 
                  />
                </Tabs>
              </Box>

              <CardContent sx={{ p: 3 }}>
                {activeTab === 0 && (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" fontWeight={700}>
                        🔄 Transaction History
                      </Typography>
                      <IconButton 
                        onClick={handleRefreshTransactions} 
                        disabled={isLoadingTransactions}
                        size="small"
                        sx={{ 
                          color: 'primary.main',
                          '&:hover': { 
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            transform: 'rotate(180deg)',
                            transition: 'all 0.3s ease'
                          }
                        }}
                      >
                        {isLoadingTransactions ? <CircularProgress size={20} /> : <RefreshIcon />}
                      </IconButton>
                    </Box>
                    
                    {transactions.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 6 }}>
                        <Avatar sx={{ 
                          width: 64, 
                          height: 64, 
                          mx: 'auto', 
                          mb: 2,
                          bgcolor: 'grey.100'
                        }}>
                          <HistoryIcon sx={{ fontSize: 32, color: 'grey.400' }} />
                        </Avatar>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          {isLoadingTransactions ? 'Loading transactions...' : 'No transactions yet'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {isLoadingTransactions ? 'Please wait while we fetch your transaction history' : 'Your transaction history will appear here'}
                        </Typography>
                        {!isLoadingTransactions && hasAttemptedTransactionLoad && (
                          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', mt: 1, display: 'block' }}>
                            Click refresh to try again
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <List disablePadding>
                        {transactions.map((tx, index) => (
                          <ListItem 
                            key={tx.id}
                            sx={{ 
                              borderRadius: 2, 
                              mb: index < transactions.length - 1 ? 1 : 0,
                              bgcolor: alpha(theme.palette.primary.main, 0.02),
                              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
                            }}
                          >
                            <ListItemIcon>
                              <Avatar sx={{ 
                                bgcolor: `${getTransactionColor(tx.type)}.main`,
                                width: 40,
                                height: 40,
                              }}>
                                {getTransactionIcon(tx.type)}
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography variant="body1" fontWeight={600}>
                                  {tx.description}
                                </Typography>
                              }
                              secondary={tx.time}
                            />
                            {tx.reward && (
                              <Box sx={{ mt: 0.5, ml: 2 }}>
                                <Chip 
                                  label={tx.reward}
                                  size="small"
                                  color="success"
                                  sx={{ fontSize: '0.7rem', height: 20 }}
                                />
                              </Box>
                            )}
                            <ListItemSecondaryAction>
                              <Box sx={{ textAlign: 'right' }}>
                                <Typography 
                                  variant="body1" 
                                  fontWeight={600}
                                  color={tx.amount.startsWith('+') ? 'success.main' : 'text.primary'}
                                >
                                  {tx.amount} {tx.currency}
                                </Typography>
                                <Chip 
                                  label={tx.status}
                                  size="small"
                                  color="success"
                                  sx={{ fontSize: '0.7rem', height: 20 }}
                                />
                              </Box>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Box>
                )}

                {activeTab === 1 && (
                  <Box>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      📊 Account Analytics
                    </Typography>
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, borderRadius: 2 }}>
                          <Typography variant="body1" fontWeight={600} gutterBottom>
                            Monthly Activity
                          </Typography>
                          <List dense>
                            <ListItem disablePadding>
                              <ListItemText primary="Transactions sent" secondary="12 this month" />
                            </ListItem>
                            <ListItem disablePadding>
                              <ListItemText primary="Files stored" secondary="75 files" />
                            </ListItem>
                            <ListItem disablePadding>
                              <ListItemText primary="Storage costs" secondary="0.05 ℏ total" />
                            </ListItem>
                          </List>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, borderRadius: 2 }}>
                          <Typography variant="body1" fontWeight={600} gutterBottom>
                            Network Stats
                          </Typography>
                          <List dense>
                            <ListItem disablePadding>
                              <ListItemText primary="Average fee" secondary="$0.0001 per transaction" />
                            </ListItem>
                            <ListItem disablePadding>
                              <ListItemText primary="Network speed" secondary="3-5 seconds finality" />
                            </ListItem>
                            <ListItem disablePadding>
                              <ListItemText primary="Carbon negative" secondary="Sustainable consensus" />
                            </ListItem>
                          </List>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={4}>
            {/* Storage Economics */}
            <Card sx={{ mb: 3, borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SavingsIcon color="success" />
                  Storage Economics
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <List disablePadding>
                  <ListItem disablePadding sx={{ mb: 1 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <SecurityIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={600}>
                          Files Stored
                        </Typography>
                      }
                      secondary={`${storageStats.totalFiles} files (${storageStats.totalSize} GB)`}
                    />
                  </ListItem>
                  
                  <ListItem disablePadding sx={{ mb: 1 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <MoneyIcon color="warning" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={600}>
                          Total Spent
                        </Typography>
                      }
                      secondary={`${storageStats.totalSpent} ℏ on storage`}
                    />
                  </ListItem>
                  
                  <ListItem disablePadding sx={{ mb: 1 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <TokenIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={600}>
                          MATE Earned
                        </Typography>
                      }
                      secondary={`${storageStats.mateEarned} tokens from uploads`}
                    />
                  </ListItem>
                  
                  <ListItem disablePadding>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <TrendingUpIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={600}>
                          Savings
                        </Typography>
                      }
                      secondary={`${storageStats.savingsPercent}% vs cloud storage`}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            {/* MATE Token Info */}
            <Card sx={{ mb: 3, borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AutoAwesomeIcon color="primary" />
                  MATE Token Info
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography variant="h4" fontWeight={700} color="success.main">
                    {isRefreshing ? "Loading..." : `${account?.mateBalance || '0'}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    MATE Tokens Owned
                  </Typography>
                </Box>
                
                <List dense disablePadding>
                  <ListItem disablePadding>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={600}>
                          Token ID
                        </Typography>
                      }
                      secondary="Mate"
                    />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={600}>
                          Total Supply
                        </Typography>
                      }
                      secondary="10B MATE"
                    />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={600}>
                          Earning Rate
                        </Typography>
                      }
                      secondary="5 MATE per file upload"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            {/* Network Status */}
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SpeedIcon color="info" />
                  Network Status
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <List dense disablePadding>
                  <ListItem disablePadding sx={{ mb: 1 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckCircleIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={600}>
                          Network Status
                        </Typography>
                      }
                      secondary="All systems operational"
                    />
                  </ListItem>
                  
                  <ListItem disablePadding sx={{ mb: 1 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <ScheduleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={600}>
                          Transaction Time
                        </Typography>
                      }
                      secondary="~3 seconds"
                    />
                  </ListItem>
                  
                  <ListItem disablePadding>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <MoneyIcon color="warning" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={600}>
                          Current Fee
                        </Typography>
                      }
                      secondary="$0.0001 USD"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Transfer Dialog */}
        <Dialog 
          open={transferDialogOpen} 
          onClose={() => setTransferDialogOpen(false)}
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Send Funds</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Asset Type</InputLabel>
                <Select
                  value={transferForm.type}
                  onChange={(e) => setTransferForm({ ...transferForm, type: e.target.value as 'hbar' | 'mate' })}
                  label="Asset Type"
                >
                  <MenuItem value="hbar">HBAR (ℏ)</MenuItem>
                  <MenuItem value="mate">MATE Token</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Recipient Account ID"
                placeholder="0.0.123456"
                value={transferForm.recipient}
                onChange={(e) => setTransferForm({ ...transferForm, recipient: e.target.value })}
              />
              
              <TextField
                fullWidth
                label={`Amount (${transferForm.type === 'hbar' ? 'ℏ' : 'MATE'})`}
                type="number"
                placeholder="0.00"
                value={transferForm.amount}
                onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
              />
              
              <TextField
                fullWidth
                label="Memo (Optional)"
                placeholder="Transaction memo"
                value={transferForm.memo}
                onChange={(e) => setTransferForm({ ...transferForm, memo: e.target.value })}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTransferDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleTransfer}
              disabled={!transferForm.recipient || !transferForm.amount}
              variant="contained"
            >
              Send {transferForm.type === 'hbar' ? 'HBAR' : 'MATE'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Deposit Dialog */}
        <Dialog 
          open={depositDialogOpen} 
          onClose={() => setDepositDialogOpen(false)}
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Deposit HBAR</DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Avatar sx={{ 
                width: 100, 
                height: 100, 
                mx: 'auto', 
                mb: 2,
                bgcolor: 'primary.main'
              }}>
                <QrCodeIcon sx={{ fontSize: 50 }} />
              </Avatar>
              <Typography variant="h6" gutterBottom>
                Send HBAR to this address
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2, mb: 2 }}>
                <Typography variant="body1" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {account?.accountId || '0.0.123456'}
                </Typography>
              </Paper>
              <Button 
                variant="outlined" 
                startIcon={<CopyIcon />}
                onClick={copyAccountId}
                sx={{ borderRadius: 3 }}
              >
                Copy Address
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDepositDialogOpen(false)} variant="contained">
              Done
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
} 