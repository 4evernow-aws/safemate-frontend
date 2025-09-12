import { useState, useEffect, useCallback, type ReactNode } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FolderIcon from '@mui/icons-material/Folder';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import GroupIcon from '@mui/icons-material/Group';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser } from 'aws-amplify/auth';
import { useHedera } from '../../contexts/HederaContext';
import { useUser } from '../../contexts/UserContext';
import { config } from '../../config/environment';
import HederaApiService from '../../services/hederaApiService';
import Footer from './Footer';
import ThemeToggle from '../ThemeToggle';

const drawerWidth = 280;

interface AppShellProps {
  children: ReactNode;
}

const navigationItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/app/dashboard' },
  { text: 'My Files', icon: <FolderIcon />, path: '/app/files' },
  { text: 'Wallet', icon: <AccountBalanceWalletIcon />, path: '/app/wallet' },
  { text: 'Groups', icon: <GroupIcon />, path: '/app/shared' },
  { text: 'Gallery', icon: <PhotoLibraryIcon />, path: '/app/gallery' },
  { text: 'Monetise', icon: <MonetizationOnIcon />, path: '/app/monetise' },
  { text: 'How to', icon: <HelpOutlineIcon />, path: '/app/how-to' },
  { text: 'Help', icon: <HelpOutlineIcon />, path: '/app/help' },
  { text: 'Profile', icon: <PersonIcon />, path: '/app/profile' },
];

export default function AppShell({ children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notificationSettings, setNotificationSettings] = useState({
    fileUploads: true,
    groupInvitations: true,
    walletTransactions: true,
    systemUpdates: true
  });
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useUser();
  const { account, isInitialized } = useHedera();

  // Load notifications from localStorage on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('safemate_notifications');
    const savedSettings = localStorage.getItem('safemate_notification_settings');
    
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        setNotifications(parsed);
        setNotificationCount(parsed.length);
      } catch (error) {
        console.error('Failed to parse saved notifications:', error);
      }
    }
    
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setNotificationSettings(parsed);
      } catch (error) {
        console.error('Failed to parse saved notification settings:', error);
      }
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('safemate_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Save notification settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('safemate_notification_settings', JSON.stringify(notificationSettings));
  }, [notificationSettings]);

  // Load notifications when component mounts or account changes
  useEffect(() => {
    // Check if we have dismissed notifications for this user
    const dismissedKey = `safemate_dismissed_notifications_${account?.accountId || 'demo'}`;
    const dismissedNotifications = JSON.parse(localStorage.getItem(dismissedKey) || '[]');
    
    // Only load fresh notifications if this is a new session or user hasn't dismissed notifications
    const savedNotifications = JSON.parse(localStorage.getItem('safemate_notifications') || '[]');
    const hasUndismissedNotifications = savedNotifications.length > 0;
    
    if (!hasUndismissedNotifications) {
      if (account?.accountId && !config.isDemoMode) {
        loadRealNotifications(dismissedNotifications);
      } else if (config.isDemoMode) {
        loadMockNotifications(dismissedNotifications);
      }
    }
  }, [account?.accountId]); // Only depend on accountId, not the entire account object

  const loadRealNotifications = async (dismissedNotifications: string[] = []) => {
    if (!account?.accountId) return;
    
    try {
      console.log('🔍 Loading real notifications for account:', account.accountId);
      const [transactions, balance] = await Promise.all([
        HederaApiService.getAccountTransactions(account.accountId, 5),
        HederaApiService.getAccountBalance(account.accountId)
      ]);

      const realNotifications = [];

      // Add recent transaction notifications
      if (transactions.success && transactions.data?.length) {
        transactions.data.slice(0, 3).forEach((tx: any) => {
          const type = tx.name?.toLowerCase();
          let icon = 'wallet';
          let title = 'Transaction completed';
          let description = 'Recent blockchain activity';
          let bgColor = 'info.main';

          switch (type) {
            case 'cryptotransfer':
              icon = 'wallet';
              title = 'HBAR Transfer';
              description = `${formatTransactionTime(tx.consensus_timestamp)}`;
              bgColor = 'success.main';
              break;
            case 'filecreate':
            case 'fileappend':
              icon = 'upload';
              title = 'File uploaded successfully';
              description = `${formatTransactionTime(tx.consensus_timestamp)}`;
              bgColor = 'primary.main';
              break;
            case 'tokentransfer':
              icon = 'person';
              title = 'Token transfer';
              description = `${formatTransactionTime(tx.consensus_timestamp)}`;
              bgColor = 'warning.main';
              break;
          }

          realNotifications.push({
            id: tx.transaction_id,
            icon,
            title,
            description,
            bgColor,
            timestamp: tx.consensus_timestamp
          });
        });
      }

      // Add account balance notification if user has files stored
      if (balance.success && balance.data?.tokens && Object.keys(balance.data.tokens).length > 0) {
        const fileCount = Object.keys(balance.data.tokens).length;
        if (fileCount > 0) {
          realNotifications.push({
            id: 'file-storage',
            icon: 'folder',
            title: `You have ${fileCount} files stored`,
            description: 'Your files are secure on Hedera testnet!',
            bgColor: 'success.main',
            timestamp: new Date().toISOString()
          });
        }
      }

      // If no real notifications, show welcome message
      if (realNotifications.length === 0) {
        realNotifications.push({
          id: 'welcome',
          icon: 'dashboard',
          title: 'Welcome to SafeMate!',
          description: 'Start uploading files to see activity here',
          bgColor: 'info.main',
          timestamp: new Date().toISOString()
        });
      }

      // Filter out dismissed notifications
      const filteredNotifications = realNotifications.filter(
        notification => !dismissedNotifications.includes(notification.id)
      );

      setNotifications(filteredNotifications);
      setNotificationCount(filteredNotifications.length);
      console.log('✅ Loaded real notifications:', filteredNotifications.length);
    } catch (error: any) {
      console.error('Error loading real notifications:', error);
      // Don't show error for 404 - account might not have transactions yet
      if (error?.message?.includes('404')) {
        console.log('ℹ️ No transactions found for account (404) - this is normal for new accounts');
        // Show welcome notification instead
        const welcomeNotification = [{
          id: 'welcome',
          icon: 'dashboard',
          title: 'Welcome to SafeMate!',
          description: 'Start uploading files to see activity here',
          bgColor: 'info.main',
          timestamp: new Date().toISOString()
        }];
        setNotifications(welcomeNotification);
        setNotificationCount(1);
      } else {
        loadMockNotifications(dismissedNotifications);
      }
    }
  };

  const loadMockNotifications = (dismissedNotifications: string[] = []) => {
    // Mock notifications for demo mode
    const mockNotifications = [
      {
        id: 'mock-1',
        icon: 'folder',
        title: 'File uploaded successfully',
        description: 'Report.pdf • 2 minutes ago',
        bgColor: 'success.main'
      },
      {
        id: 'mock-2',
        icon: 'person',
        title: 'File uploaded successfully',
        description: 'Stored on Hedera testnet • 5 minutes ago',
        bgColor: 'warning.main'
      },
      {
        id: 'mock-3',
        icon: 'group',
        title: 'New group invitation',
        description: 'Project Alpha • 1 hour ago',
        bgColor: 'info.main'
      },
    ];
    
    // Filter out dismissed notifications
    const filteredNotifications = mockNotifications.filter(
      notification => !dismissedNotifications.includes(notification.id)
    );
    
    setNotifications(filteredNotifications);
    setNotificationCount(filteredNotifications.length);
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

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotificationAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    handleMenuClose();
    navigate('/');
  };

  const handleDismissNotification = (notificationId: string) => {
    // Remove from current notifications
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setNotificationCount(prev => Math.max(0, prev - 1));
    
    // Store dismissed notification to prevent it from reappearing
    const dismissedKey = `safemate_dismissed_notifications_${account?.accountId || 'demo'}`;
    const existingDismissed = JSON.parse(localStorage.getItem(dismissedKey) || '[]');
    const updatedDismissed = [...existingDismissed, notificationId];
    localStorage.setItem(dismissedKey, JSON.stringify(updatedDismissed));
  };

  const handleNotificationSettings = () => {
    setShowNotificationSettings(true);
    handleMenuClose();
  };

  const handleSaveNotificationSettings = (settings: any) => {
    setNotificationSettings(settings);
    setShowNotificationSettings(false);
  };

  const addNotification = useCallback((notification: any) => {
    const newNotification = {
      ...notification,
      id: notification.id || Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    setNotifications(prev => [newNotification, ...prev]);
    setNotificationCount(prev => prev + 1);
  }, []);

  // Expose addNotification function globally for other components to use
  useEffect(() => {
    (window as any).addNotification = addNotification;
    return () => {
      delete (window as any).addNotification;
    };
  }, [addNotification]);

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ px: 3, py: 2 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              color: '#ffffff',
              fontSize: '1.5rem',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
            }}
          >
            S
          </Box>
          <Box>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 800 }}>
              SafeMate
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Blockchain Portal
            </Typography>
          </Box>
        </Box>
      </Toolbar>
      
      <Divider />
      
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ px: 2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
          Navigation
        </Typography>
      </Box>
      
      <List sx={{ px: 2, flex: 1 }}>
        {navigationItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                borderRadius: 2,
                minHeight: 48,
                transition: 'all 0.2s ease-in-out',
                '&.Mui-selected': {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#ffffff',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    filter: 'brightness(1.1)',
                  },
                  '& .MuiListItemIcon-root': {
                    color: '#ffffff',
                  },
                },
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  transform: 'translateX(4px)',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: location.pathname === item.path ? 'inherit' : 'text.secondary',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: location.pathname === item.path ? 700 : 500,
                  fontSize: '0.875rem',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />
      
      <Box sx={{ p: 2 }}>
        <Box 
          sx={{ 
            p: 2, 
            background: alpha(theme.palette.primary.main, 0.05),
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            Account Status
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 600 }}>
            {user?.signInDetails?.loginId || user?.username || 'User'}
          </Typography>
          <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
            ● Connected
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {navigationItems.find(item => item.path === location.pathname)?.text || 'Dashboard'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ThemeToggle />
            
            <IconButton
              color="inherit"
              onClick={handleNotificationMenuOpen}
              sx={{ color: 'text.primary' }}
            >
              <Badge badgeContent={notificationCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <IconButton
              onClick={handleProfileMenuOpen}
              sx={{ ml: 1 }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                {(user?.signInDetails?.loginId || user?.username || 'User').charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundImage: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>
        
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundImage: 'none',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar />
        <Box sx={{ flexGrow: 1 }}>
          {children}
        </Box>
        <Footer />
      </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            mt: 1,
            minWidth: 200,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          },
        }}
      >
        <MenuItem onClick={() => { handleNavigation('/app/profile'); handleMenuClose(); }}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleNavigation('/app/settings'); handleMenuClose(); }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>

      {/* Notification Menu */}
      <Menu
        anchorEl={notificationAnchorEl}
        open={Boolean(notificationAnchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            mt: 1,
            minWidth: 300,
            maxWidth: 400,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" fontWeight={600}>
            Notifications
          </Typography>
        </Box>
        
        {notifications.map((notification) => {
          const getIcon = (iconName: string) => {
            switch (iconName) {
              case 'dashboard': return <DashboardIcon fontSize="small" />;
              case 'folder': return <FolderIcon fontSize="small" />;
              case 'person': return <PersonIcon fontSize="small" />;
              case 'group': return <GroupIcon fontSize="small" />;
              case 'upload': return <CloudUploadIcon fontSize="small" />;
              case 'wallet': return <AccountBalanceWalletIcon fontSize="small" />;
              default: return <DashboardIcon fontSize="small" />;
            }
          };

          return (
            <MenuItem 
              key={notification.id}
              sx={{ 
                '&:hover .dismiss-button': { 
                  opacity: 1 
                },
                alignItems: 'flex-start',
                py: 1.5
              }}
            >
              <ListItemIcon>
                <Avatar sx={{ width: 32, height: 32, backgroundColor: notification.bgColor }}>
                  {getIcon(notification.icon as string)}
                </Avatar>
              </ListItemIcon>
            <ListItemText
              primary={notification.title}
              secondary={notification.description}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
            <IconButton
              className="dismiss-button"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleDismissNotification(notification.id);
              }}
              sx={{
                opacity: 0,
                transition: 'opacity 0.2s',
                ml: 1,
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </MenuItem>
          );
        })}
        
        <Divider />
        
        <MenuItem onClick={handleNotificationSettings}>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Notification Settings" />
        </MenuItem>
      </Menu>

      {/* Notification Settings Dialog */}
      <Dialog 
        open={showNotificationSettings} 
        onClose={() => setShowNotificationSettings(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Notification Settings</DialogTitle>
        <DialogContent>
          <List>
            <ListItem>
              <ListItemIcon>
                <FolderIcon />
              </ListItemIcon>
              <ListItemText
                primary="File Upload Notifications"
                secondary="Get notified when files are uploaded successfully"
              />
              <Switch 
                checked={notificationSettings.fileUploads}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNotificationSettings(prev => ({ ...prev, fileUploads: e.target.checked }))}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <GroupIcon />
              </ListItemIcon>
              <ListItemText
                primary="Group Invitations"
                secondary="Get notified about group invitations and membership changes"
              />
              <Switch 
                checked={notificationSettings.groupInvitations}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNotificationSettings(prev => ({ ...prev, groupInvitations: e.target.checked }))}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <AccountBalanceWalletIcon />
              </ListItemIcon>
              <ListItemText
                primary="Wallet Transactions"
                secondary="Get notified about wallet transactions and balance changes"
              />
              <Switch 
                checked={notificationSettings.walletTransactions}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNotificationSettings(prev => ({ ...prev, walletTransactions: e.target.checked }))}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText
                primary="System Updates"
                secondary="Get notified about system updates and maintenance"
              />
              <Switch 
                checked={notificationSettings.systemUpdates}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNotificationSettings(prev => ({ ...prev, systemUpdates: e.target.checked }))}
              />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNotificationSettings(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              handleSaveNotificationSettings(notificationSettings);
              setShowNotificationSettings(false);
            }}
            variant="contained"
          >
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 