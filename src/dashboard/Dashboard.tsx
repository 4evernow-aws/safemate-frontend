import React from 'react';
import { Box, Typography, Chip, Alert } from '@mui/material';
import { DashboardProvider, useDashboard } from './core/DashboardProvider';
import DashboardGrid from './layouts/DashboardGrid';
import { useWidgetRegistry } from './core/WidgetRegistry';
import { useUser } from '../contexts/UserContext';
import { WidgetRegistration } from './core/WidgetRegistration';
import { WidgetDevTools, DevModeIndicator, useWidgetDevTools } from './core/WidgetDevTools';
import { WalletOverviewWidget } from '../widgets/wallet/WalletOverviewWidget';
import { WalletSendWidget } from '../widgets/wallet/WalletSendWidget';
import { WalletReceiveWidget } from '../widgets/wallet/WalletReceiveWidget';

// Import all widgets here for registration
const AVAILABLE_WIDGETS = [
  WalletOverviewWidget,
  WalletSendWidget,
  WalletReceiveWidget,
  // Add other widgets here as they're created
];

// Import all widgets from central registry
import '../widgets/index';

// Dashboard Header Component
const DashboardHeader: React.FC = () => {
  const { user } = useUser();
  const { accountType, activeWidgets } = useDashboard();
  const { getStats } = useWidgetRegistry();

  const stats = getStats();

  // Helper function to get display name
  const getDisplayName = () => {
    const firstName = user?.attributes?.given_name;
    const lastName = user?.attributes?.family_name;
    const username = user?.username;
    
    // Debug logging to see what attributes are available
    console.log('🔍 User attributes debug:', {
      firstName,
      lastName,
      username,
      allAttributes: user?.attributes
    });
    
    if (firstName && lastName) {
      // Capitalize first letter of each name
      const capitalizedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
      const capitalizedLastName = lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();
      return `${capitalizedFirstName} ${capitalizedLastName}`;
    } else if (firstName) {
      const capitalizedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
      return capitalizedFirstName;
    } else if (lastName) {
      const capitalizedLastName = lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();
      return capitalizedLastName;
    } else if (username && username.includes('@')) {
      // Extract name from email (before @) and capitalize
      const emailName = username.split('@')[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1).toLowerCase();
    } else if (username) {
      return username;
    } else {
      return 'User';
    }
  };

  return (
    <Box 
      sx={{ 
        borderBottom: 1, 
        borderColor: 'divider', 
        pb: 2, 
        mb: 3,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2
      }}
    >
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          SafeMate Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back, {getDisplayName()}! 👋
        </Typography>
      </Box>
      
      <Box display="flex" gap={1} flexWrap="wrap">
        <Chip 
          label={`Account: ${accountType}`} 
          color="primary" 
          variant="outlined"
        />
        <Chip 
          label={`${activeWidgets.length} Active Widgets`} 
          color="secondary" 
          variant="outlined"
        />
        <Chip 
          label={`${stats.totalWidgets} Total Widgets`} 
          color="default" 
          variant="outlined"
        />
      </Box>
    </Box>
  );
};

// Dashboard Content Component
const DashboardContent: React.FC = () => {
  const { layout, accountType, activeWidgets } = useDashboard();

  if (!accountType) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        <Typography>
          Unable to determine account type. Please check your profile settings.
        </Typography>
      </Alert>
    );
  }

  if (activeWidgets.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography>
          No widgets available for account type "{accountType}". 
          Widgets may still be loading or you may need to refresh the page.
        </Typography>
      </Alert>
    );
  }

  if (!layout) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        <Typography>
          No dashboard layout configured for account type "{accountType}".
        </Typography>
      </Alert>
    );
  }

  return <DashboardGrid />;
};

// Main Dashboard Component (without provider)
const DashboardInner: React.FC = () => {
  const { isVisible, toggleDevTools } = useWidgetDevTools();

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        backgroundColor: 'background.default',
        p: { xs: 0.5, sm: 1, md: 1.5 }
      }}
    >
      <DashboardHeader />
      <DashboardContent />
      
      {/* Development Tools */}
      <DevModeIndicator />
      <WidgetDevTools isVisible={isVisible} onToggle={toggleDevTools} />
    </Box>
  );
};

// Main Dashboard Component (with provider)
export const Dashboard: React.FC = () => {
  return (
    <DashboardProvider>
      <WidgetRegistration widgets={AVAILABLE_WIDGETS} />
      <DashboardInner />
    </DashboardProvider>
  );
};

// Export additional components for flexibility
export { DashboardProvider, DashboardHeader, DashboardContent, DashboardGrid };
export default Dashboard;
