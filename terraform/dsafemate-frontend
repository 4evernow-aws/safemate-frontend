/**
 * SafeMate Portal - Main Application Component
 * Environment: Development
 * Last Updated: September 2025 - Post Migration
 * Status: Active Development Environment
 * Migration Notes: Successfully migrated to preprod, dev environment restored
 */
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { Amplify } from 'aws-amplify';
import { Hub } from 'aws-amplify/utils';
import { ThemeProvider } from './contexts/ThemeContext';
import { HederaProvider } from './contexts/HederaContext';
import { UserProvider, useUser } from './contexts/UserContext';
import AppShell from './components/layout/AppShell';
import { ModernDashboard } from './components/pages/ModernDashboard';
import ModernMyFiles from './components/pages/ModernMyFiles';
import ModernUpload from './components/pages/ModernUpload';
import ModernProfile from './components/pages/ModernProfile';
import ModernGroupDashboard from './components/Groups/ModernGroupDashboard';
import ModernBlockchainDashboard from './components/Blockchain/ModernBlockchainDashboard';
import ModernGallery from './components/pages/ModernGallery';
import FAQ from './components/pages/FAQ';
import Personal from './components/pages/Personal';
import Family from './components/pages/Family';
import Business from './components/pages/Business';
import Community from './components/pages/Community';
import Cultural from './components/pages/Cultural';
import SportingTeams from './components/pages/SportingTeams';
import LandingPage from './components/LandingPage';
import ModernLogin from './components/ModernLogin';
import AuthDebugger from './components/AuthDebugger';
import DashboardRoutes from './dashboard/routing/DashboardRoutes';
import HowToPage from './components/pages/HowToPage';
import HelpPage from './components/pages/HelpPage';
import { Dashboard } from './dashboard/Dashboard';

import { amplifyConfig } from './amplify-config';
import './App.css';

// Configure Amplify
Amplify.configure(amplifyConfig);

// Authenticated App Component
function AuthenticatedApp() {
  console.log('🔧 App Debug: AuthenticatedApp component rendered');
  
  return (
    <AppShell>
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        {/* NEW: Primary dashboard now uses the new modular dashboard */}
        <Route path="dashboard/*" element={<DashboardRoutes />} />
        <Route path="files" element={<ModernMyFiles />} />
        <Route path="upload" element={<ModernUpload />} />
        <Route path="shared" element={<div style={{padding: '20px'}}><h2>👥 Groups - Coming Soon!</h2><p>This will be developed by the Groups team.</p></div>} />
        <Route path="wallet" element={<ModernBlockchainDashboard />} />
        <Route path="gallery" element={<ModernGallery />} />
        <Route path="monetise" element={<div style={{padding: '20px'}}><h2>💰 Monetise - Coming Soon!</h2><p>This will be developed by the Monetise team.</p></div>} />
        <Route path="how-to" element={<HowToPage />} />
        <Route path="help" element={<HelpPage />} />
        <Route path="profile" element={<ModernProfile />} />
        
        {/* OLD: Keep old dashboard available for comparison/fallback */}
        <Route path="old-dashboard" element={<ModernDashboard />} />
        
        {/* LEGACY: Redirect from new-dashboard to main dashboard */}
        <Route path="new-dashboard/*" element={<Navigate to="/app/dashboard" replace />} />
      </Routes>
    </AppShell>
  );
}

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useUser();
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const handleAuthSuccess = () => {
    // User state will be updated automatically by UserContext
    // Reset onboarding flag when user successfully completes auth
    setNeedsOnboarding(false);
  };

  const handleOnboardingNeeded = () => {
    // ModernLogin will call this when user needs onboarding after signup
    setNeedsOnboarding(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  // Show ModernLogin if not authenticated OR if authenticated but needs onboarding
  if (!isAuthenticated || (isAuthenticated && needsOnboarding)) {
    return (
      <ModernLogin 
        onAuthSuccess={handleAuthSuccess} 
        onOnboardingNeeded={handleOnboardingNeeded}
        forceShowOnboarding={needsOnboarding}
      />
    );
  }

  return <>{children}</>;
}

function App() {
  useEffect(() => {
    // App debug logging disabled for cleaner console
    
    // Ensure the document title is set
    document.title = 'SafeMate Portal';
  }, []);

  return (
    <ThemeProvider>
      <UserProvider>
        <HederaProvider>
          <SnackbarProvider 
            maxSnack={3}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
          >
            <Router>
              <Routes>
              {/* Public Routes - No authentication required */}
              <Route path="/" element={<LandingPage />} />
              
              {/* FAQ Page - Public Route */}
              <Route path="/faq" element={<FAQ />} />
              
              {/* Personal Page - Public Route */}
              <Route path="/personal" element={<Personal />} />
              
              {/* Family Page - Public Route */}
              <Route path="/family" element={<Family />} />
              
              {/* Business Page - Public Route */}
              <Route path="/business" element={<Business />} />
              
              {/* Community Page - Public Route */}
              <Route path="/community" element={<Community />} />
              
              {/* Cultural Page - Public Route */}
              <Route path="/cultural" element={<Cultural />} />
              
              {/* Sporting Teams Page - Public Route */}
              <Route path="/sporting-teams" element={<SportingTeams />} />
              
              {/* Test route for ModernLogin */}
              <Route path="/test-login" element={<ModernLogin onAuthSuccess={() => console.log('Test auth success')} />} />
              
              {/* Redirect legacy routes to /app */}
              <Route path="/login" element={<Navigate to="/app" replace />} />
              <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
              <Route path="/files" element={<Navigate to="/app/files" replace />} />
              <Route path="/shared" element={<Navigate to="/app/shared" replace />} />
              <Route path="/wallet" element={<Navigate to="/app/wallet" replace />} />
              <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
              
              {/* Main authenticated app route */}
              <Route path="/app/*" element={
                <ProtectedRoute>
                  <AuthenticatedApp />
                </ProtectedRoute>
              } />
            </Routes>
            <AuthDebugger />
          </Router>
        </SnackbarProvider>
      </HederaProvider>
    </UserProvider>
  </ThemeProvider>
  );
}

export default App;
