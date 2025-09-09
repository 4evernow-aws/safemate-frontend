import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Divider,
  Chip
} from '@mui/material';
import { useUser } from '../contexts/UserContext';

interface DebugInfo {
  currentUser: any;
  authSession: any;
  tokenService: any;
  generalError: string | null;
}

export const AuthDebugger: React.FC = () => {
  const { user, logout, isAuthenticated } = useUser();
  const [info, setInfo] = useState<DebugInfo>({
    currentUser: null,
    authSession: null,
    tokenService: null,
    generalError: null
  });

  useEffect(() => {
    const updateInfo = async () => {
      const newInfo: DebugInfo = {
        currentUser: null,
        authSession: null,
        tokenService: null,
        generalError: null
      };

      // Check current user
      try {
        newInfo.currentUser = user;
      } catch (error) {
        newInfo.currentUser = { error: (error as Error).message };
      }

      // Check auth session
      try {
        // Mock session data for now
        const session = {
          tokens: {
            accessToken: 'mock-access-token',
            idToken: 'mock-id-token'
          }
        };
        newInfo.authSession = {
          isSignedIn: isAuthenticated,
          hasAccessToken: !!session.tokens?.accessToken,
          hasIdToken: !!session.tokens?.idToken,
          hasRefreshToken: false,
        };
      } catch (error) {
        newInfo.authSession = { error: (error as Error).message };
      }

      // Check token service
      try {
        newInfo.tokenService = {
          hasTokens: isAuthenticated,
          tokenCount: isAuthenticated ? 2 : 0
        };
      } catch (error) {
        newInfo.tokenService = { error: (error as Error).message };
      }

      setInfo(newInfo);
    };

    updateInfo();
  }, [user, isAuthenticated]);

  const handleClearAuth = async () => {
    try {
      await logout();
    } catch (error) {
      alert(`Error clearing auth: ${(error as Error).message}`);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          🔧 Auth Debugger
        </Typography>
        
        <Box display="flex" gap={1} mb={2}>
          <Chip label="Development Only" color="warning" size="small" />
          <Chip label={`User: ${isAuthenticated ? 'Signed In' : 'Not Signed In'}`} 
                color={isAuthenticated ? 'success' : 'error'} 
                size="small" />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Current User */}
        <Typography variant="h6" gutterBottom>
          Current User
        </Typography>
        <Alert severity={info.currentUser ? 'success' : 'error'} sx={{ mb: 2 }}>
          <pre style={{ fontSize: '0.8rem', margin: 0 }}>
            {JSON.stringify(info.currentUser, null, 2)}
          </pre>
        </Alert>

        {/* Auth Session */}
        <Typography variant="h6" gutterBottom>
          Auth Session
        </Typography>
        <Alert severity={info.authSession?.isSignedIn ? 'success' : 'warning'} sx={{ mb: 2 }}>
          <pre style={{ fontSize: '0.8rem', margin: 0 }}>
            {JSON.stringify(info.authSession, null, 2)}
          </pre>
        </Alert>

        {/* Token Service */}
        <Typography variant="h6" gutterBottom>
          Token Service
        </Typography>
        <Alert severity={info.tokenService?.hasTokens ? 'success' : 'warning'} sx={{ mb: 2 }}>
          <pre style={{ fontSize: '0.8rem', margin: 0 }}>
            {JSON.stringify(info.tokenService, null, 2)}
          </pre>
        </Alert>

        {info.generalError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {info.generalError}
          </Alert>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Actions */}
        <Box display="flex" gap={1}>
          <Button variant="contained" onClick={handleRefresh}>
            Refresh
          </Button>
          <Button variant="outlined" onClick={handleClearAuth}>
            Clear Auth
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AuthDebugger;
