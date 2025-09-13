import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Avatar,
  Divider,
  Chip,
  IconButton,
  Alert,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  alpha,
  Paper,
  LinearProgress,
} from '@mui/material';
import {
  Person as PersonIcon,
  AccountBalance as WalletIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Security as SecurityIcon,
  Token as TokenIcon,
  Verified as VerifiedIcon,
  Email as EmailIcon,
  Schedule as ScheduleIcon,
  Storage as StorageIcon,
  TrendingUp as TrendingUpIcon,
  Settings as SettingsIcon,
  Badge as BadgeIcon,
  CreditCard as CreditCardIcon,
  Home as HomeIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Upload as UploadIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { getCurrentUser } from 'aws-amplify/auth';
import { useUser } from '../../contexts/UserContext';
import { useHedera } from '../../contexts/HederaContext';
import { useSnackbar } from 'notistack';
import { config } from '../../config/environment';
import ModernStatsCard from '../ModernStatsCard';

export default function ModernProfile() {
  const { user } = useUser();
  const { account, refreshBalance, isInitialized, folders } = useHedera();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  
  const [displayName, setDisplayName] = useState('');
  const [originalDisplayName, setOriginalDisplayName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // KYC State
  const [kycData, setKycData] = useState({
    personalInfo: {
      firstName: user?.attributes?.given_name || '',
      lastName: user?.attributes?.family_name || '',
      dateOfBirth: '',
      nationality: '',
      phoneNumber: '',
      address: {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: ''
      }
    },
    identityDocuments: {
      governmentId: { status: 'pending', type: 'passport', number: '', expiryDate: '' },
      driverLicense: { status: 'pending', number: '', expiryDate: '' },
      nationalId: { status: 'pending', number: '', expiryDate: '' }
    },
    financialInfo: {
      employmentStatus: '',
      occupation: '',
      employer: '',
      annualIncome: '',
      sourceOfFunds: ''
    },
    verificationStatus: {
      emailVerified: true,
      phoneVerified: false,
      identityVerified: false,
      addressVerified: false,
      financialVerified: false,
      overallStatus: 'incomplete'
    }
  });

  // Calculate user stats
  const totalFiles = folders.reduce((sum, folder) => sum + folder.files.length, 0);
  const totalSize = folders.reduce((sum, folder) => 
    sum + folder.files.reduce((fileSum, file) => fileSum + (file.size || 0), 0), 0
  );
  const mateTokensEarned = totalFiles * 2.5 + Math.floor(totalSize / (1024 * 1024)) * 1.5;

  useEffect(() => {
    const currentDisplayName = user?.signInDetails?.loginId?.split('@')[0] || user?.username || 'User';
    setDisplayName(currentDisplayName);
    setOriginalDisplayName(currentDisplayName);
  }, [user]);

  const handleEditName = () => {
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    setIsSaving(true);
    try {
      setOriginalDisplayName(displayName);
      setIsEditingName(false);
      enqueueSnackbar('Display name updated successfully!', { variant: 'success' });
    } catch (error) {
      console.error('Failed to update display name:', error);
      enqueueSnackbar('Failed to update display name', { variant: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setDisplayName(originalDisplayName);
    setIsEditingName(false);
  };

  const handleRefreshBalance = async () => {
    setIsRefreshing(true);
    try {
      await refreshBalance();
      enqueueSnackbar('Balance refreshed!', { variant: 'success' });
    } catch (error) {
      console.error('Failed to refresh balance:', error);
      enqueueSnackbar('Failed to refresh balance', { variant: 'error' });
    } finally {
      setIsRefreshing(false);
    }
  };

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
            Profile & Settings ⚙️
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
            Manage your account and view your SafeMate statistics
          </Typography>
        </Box>

        {/* Stats Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <ModernStatsCard
              title="Files Stored"
              value={totalFiles}
              subtitle="Total uploaded"
              icon={<StorageIcon />}
              color="primary"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <ModernStatsCard
              title="HBAR Balance"
              value={`${account?.balance || '0'} ℏ`}
              subtitle="Available balance"
              icon={<WalletIcon />}
              color="success"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <ModernStatsCard
              title="MATE Earned"
              value={Math.floor(mateTokensEarned)}
              subtitle="Reward tokens"
              icon={<TokenIcon />}
              color="warning"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <ModernStatsCard
              title="Storage Used"
              value={`${(totalSize / (1024 * 1024)).toFixed(1)} MB`}
              subtitle="Blockchain storage"
              icon={<TrendingUpIcon />}
              color="info"
            />
          </Grid>
        </Grid>

        <Grid container spacing={4}>
          {/* Profile Information */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ borderRadius: 3, mb: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar 
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      mr: 3,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      fontSize: '2rem',
                      fontWeight: 700,
                    }}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                      {displayName}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <Chip 
                        icon={<VerifiedIcon />}
                        label="Verified Account" 
                        color="success" 
                        size="small"
                        sx={{ borderRadius: 3 }}
                      />
                      <Chip 
                        label={isInitialized ? 'Hedera Connected' : 'Setup Required'} 
                        color={isInitialized ? 'primary' : 'warning'} 
                        size="small"
                        sx={{ borderRadius: 3 }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      SafeMate Portal Member
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Profile Fields */}
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom>
                        Display Name
                      </Typography>
                      {isEditingName ? (
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <TextField
                            fullWidth
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            size="small"
                            sx={{ borderRadius: 2 }}
                          />
                          <IconButton 
                            onClick={handleSaveName} 
                            disabled={isSaving}
                            color="primary"
                          >
                            <SaveIcon />
                          </IconButton>
                          <IconButton onClick={handleCancelEdit}>
                            <CancelIcon />
                          </IconButton>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1" sx={{ flex: 1 }}>
                            {displayName}
                          </Typography>
                          <IconButton onClick={handleEditName} size="small">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom>
                        Email Address
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmailIcon fontSize="small" color="primary" />
                        <Typography variant="body1">
                          {user?.signInDetails?.loginId || 'Not available'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom>
                        User ID
                      </Typography>
                      <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                        {user?.username || 'Not available'}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom>
                        Network
                      </Typography>
                      <Chip 
                        label={config.hederaNetwork.toUpperCase()}
                        color="primary"
                        size="small"
                        sx={{ borderRadius: 3 }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Account Security */}
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SecurityIcon color="primary" />
                  Account Security
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <List disablePadding>
                  <ListItem sx={{ px: 0, py: 2 }}>
                    <ListItemIcon>
                      <Box 
                        sx={{ 
                          width: 40, 
                          height: 40, 
                          borderRadius: '50%', 
                          background: alpha(theme.palette.success.main, 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <VerifiedIcon color="success" />
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body1" fontWeight={600}>
                          Secure Authentication
                        </Typography>
                      }
                      secondary="Your account is secured with enterprise-grade authentication"
                    />
                    <Chip label="Active" color="success" size="small" />
                  </ListItem>

                  <ListItem sx={{ px: 0, py: 2 }}>
                    <ListItemIcon>
                      <Box 
                        sx={{ 
                          width: 40, 
                          height: 40, 
                          borderRadius: '50%', 
                          background: alpha(theme.palette.primary.main, 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <SecurityIcon color="primary" />
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body1" fontWeight={600}>
                          Private Key Encryption
                        </Typography>
                      }
                      secondary="Your Hedera keys are encrypted locally in your browser"
                    />
                    <Chip label="Secure" color="primary" size="small" />
                  </ListItem>

                  <ListItem sx={{ px: 0, py: 2 }}>
                    <ListItemIcon>
                      <Box 
                        sx={{ 
                          width: 40, 
                          height: 40, 
                          borderRadius: '50%', 
                          background: alpha(theme.palette.warning.main, 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <TokenIcon color="warning" />
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body1" fontWeight={600}>
                          MATE Token Integration
                        </Typography>
                      }
                      secondary="Connected to SafeMate ecosystem rewards system"
                    />
                    <Chip label="Connected" color="warning" size="small" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            {/* KYC Section */}
            <Card sx={{ borderRadius: 3, mb: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <BadgeIcon sx={{ fontSize: 28, mr: 2, color: 'primary.main' }} />
                  <Typography variant="h5" fontWeight={700}>
                    KYC Verification
                  </Typography>
                </Box>
                
                <Divider sx={{ mb: 3 }} />

                {/* KYC Status Overview */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Verification Status
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
                        <CheckCircleIcon color="success" sx={{ fontSize: 32, mb: 1 }} />
                        <Typography variant="body2" fontWeight={600}>Email</Typography>
                        <Typography variant="caption">Verified</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 2 }}>
                        <PendingIcon color="warning" sx={{ fontSize: 32, mb: 1 }} />
                        <Typography variant="body2" fontWeight={600}>Phone</Typography>
                        <Typography variant="caption">Pending</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 2 }}>
                        <PendingIcon color="warning" sx={{ fontSize: 32, mb: 1 }} />
                        <Typography variant="body2" fontWeight={600}>Identity</Typography>
                        <Typography variant="caption">Pending</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 2 }}>
                        <PendingIcon color="warning" sx={{ fontSize: 32, mb: 1 }} />
                        <Typography variant="body2" fontWeight={600}>Address</Typography>
                        <Typography variant="caption">Pending</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                {/* KYC Requirements */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Required Documents & Information
                  </Typography>
                  
                  <Grid container spacing={3}>
                    {/* Personal Information */}
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <PersonIcon color="primary" sx={{ mr: 1 }} />
                          <Typography variant="subtitle1" fontWeight={600}>
                            Personal Information
                          </Typography>
                        </Box>
                        <List dense>
                          <ListItem disablePadding sx={{ mb: 1 }}>
                            <ListItemIcon>
                              <CheckCircleIcon color="success" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Full Name" 
                              secondary="First and Last Name"
                            />
                          </ListItem>
                          <ListItem disablePadding sx={{ mb: 1 }}>
                            <ListItemIcon>
                              <PendingIcon color="warning" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Date of Birth" 
                              secondary="Required for age verification"
                            />
                          </ListItem>
                          <ListItem disablePadding sx={{ mb: 1 }}>
                            <ListItemIcon>
                              <PendingIcon color="warning" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Nationality" 
                              secondary="Country of citizenship"
                            />
                          </ListItem>
                          <ListItem disablePadding>
                            <ListItemIcon>
                              <PendingIcon color="warning" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Phone Number" 
                              secondary="For SMS verification"
                            />
                          </ListItem>
                        </List>
                      </Paper>
                    </Grid>

                    {/* Identity Documents */}
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <CreditCardIcon color="primary" sx={{ mr: 1 }} />
                          <Typography variant="subtitle1" fontWeight={600}>
                            Identity Documents
                          </Typography>
                        </Box>
                        <List dense>
                          <ListItem disablePadding sx={{ mb: 1 }}>
                            <ListItemIcon>
                              <PendingIcon color="warning" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Government ID" 
                              secondary="Passport, National ID, or Driver's License"
                            />
                          </ListItem>
                          <ListItem disablePadding sx={{ mb: 1 }}>
                            <ListItemIcon>
                              <PendingIcon color="warning" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Proof of Address" 
                              secondary="Utility bill or bank statement (max 3 months old)"
                            />
                          </ListItem>
                          <ListItem disablePadding>
                            <ListItemIcon>
                              <PendingIcon color="warning" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Selfie Photo" 
                              secondary="Clear photo holding your ID document"
                            />
                          </ListItem>
                        </List>
                      </Paper>
                    </Grid>

                    {/* Financial Information */}
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <WorkIcon color="primary" sx={{ mr: 1 }} />
                          <Typography variant="subtitle1" fontWeight={600}>
                            Financial Information
                          </Typography>
                        </Box>
                        <List dense>
                          <ListItem disablePadding sx={{ mb: 1 }}>
                            <ListItemIcon>
                              <PendingIcon color="warning" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Employment Status" 
                              secondary="Employed, Self-employed, Student, etc."
                            />
                          </ListItem>
                          <ListItem disablePadding sx={{ mb: 1 }}>
                            <ListItemIcon>
                              <PendingIcon color="warning" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Occupation" 
                              secondary="Your current job title"
                            />
                          </ListItem>
                          <ListItem disablePadding>
                            <ListItemIcon>
                              <PendingIcon color="warning" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Source of Funds" 
                              secondary="How you fund your account"
                            />
                          </ListItem>
                        </List>
                      </Paper>
                    </Grid>

                    {/* Additional Requirements */}
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <SecurityIcon color="primary" sx={{ mr: 1 }} />
                          <Typography variant="subtitle1" fontWeight={600}>
                            Additional Requirements
                          </Typography>
                        </Box>
                        <List dense>
                          <ListItem disablePadding sx={{ mb: 1 }}>
                            <ListItemIcon>
                              <PendingIcon color="warning" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="PEP Status" 
                              secondary="Politically Exposed Person declaration"
                            />
                          </ListItem>
                          <ListItem disablePadding sx={{ mb: 1 }}>
                            <ListItemIcon>
                              <PendingIcon color="warning" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Sanctions Check" 
                              secondary="OFAC and international sanctions screening"
                            />
                          </ListItem>
                          <ListItem disablePadding>
                            <ListItemIcon>
                              <PendingIcon color="warning" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Risk Assessment" 
                              secondary="Automated risk scoring and review"
                            />
                          </ListItem>
                        </List>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    startIcon={<UploadIcon />}
                    size="large"
                    sx={{ borderRadius: 2, px: 4 }}
                  >
                    Start KYC Process
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<SettingsIcon />}
                    size="large"
                    sx={{ borderRadius: 2, px: 4 }}
                  >
                    Update Information
                  </Button>
                </Box>

                {/* KYC Notice */}
                <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
                  <Typography variant="body2" fontWeight={600} gutterBottom>
                    KYC Compliance Notice
                  </Typography>
                  <Typography variant="body2">
                    SafeMate is required to verify the identity of all users to comply with international 
                    anti-money laundering (AML) and know-your-customer (KYC) regulations. This process 
                    helps protect you and the platform from fraud and ensures regulatory compliance.
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Sidebar */}
          <Grid item xs={12} lg={4}>
            {/* Hedera Account */}
            {account && (
              <Card sx={{ mb: 3, borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" fontWeight={700}>
                      🔗 Hedera Account
                    </Typography>
                    <IconButton 
                      onClick={handleRefreshBalance} 
                      disabled={isRefreshing}
                      size="small"
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      Account ID
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                      {account.accountId}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      Balance
                    </Typography>
                    <Typography variant="h6" color="success.main" fontWeight={700}>
                      {account.balance} ℏ
                    </Typography>
                  </Box>

                  {isRefreshing && (
                    <LinearProgress sx={{ mt: 2, borderRadius: 1 }} />
                  )}
                </CardContent>
              </Card>
            )}

            {/* Activity Summary */}
            <Card sx={{ mb: 3, borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  📊 Activity Summary
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <List disablePadding>
                  <ListItem disablePadding sx={{ mb: 1 }}>
                    <ListItemIcon>
                      <ScheduleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={600}>
                          Account Status
                        </Typography>
                      }
                      secondary={isInitialized ? "Connected to Hedera" : "Setting up account"}
                    />
                  </ListItem>
                  
                  <ListItem disablePadding sx={{ mb: 1 }}>
                    <ListItemIcon>
                      <StorageIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={600}>
                          Files Stored
                        </Typography>
                      }
                      secondary={`${totalFiles} file${totalFiles !== 1 ? 's' : ''} uploaded`}
                    />
                  </ListItem>
                  
                  <ListItem disablePadding>
                    <ListItemIcon>
                      <TokenIcon color="warning" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={600}>
                          MATE Earned
                        </Typography>
                      }
                      secondary={`${Math.floor(mateTokensEarned)} tokens from uploads`}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            {/* Important Notices */}
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  📢 Important Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                  <Typography variant="body2" fontWeight={600} gutterBottom>
                    Security Notice
                  </Typography>
                  <Typography variant="body2">
                    Your account credentials are secured with enterprise-grade encryption. Keep your login information private.
                  </Typography>
                </Alert>
                
                <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                  <Typography variant="body2" fontWeight={600} gutterBottom>
                    Network Environment
                  </Typography>
                  <Typography variant="body2">
                    Connected to Hedera {config.hederaNetwork.toUpperCase()} network. {config.hederaNetwork === 'testnet' ? 'Test network for development purposes.' : 'Live network for production use.'}
                  </Typography>
                </Alert>
                
                {account && (
                  <Alert severity="success" sx={{ borderRadius: 2 }}>
                    <Typography variant="body2" fontWeight={600} gutterBottom>
                      Hedera Account Active
                    </Typography>
                    <Typography variant="body2">
                      Account ID: {account.accountId} | Balance: {account.balance} HBAR
                    </Typography>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
} 