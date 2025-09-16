/**
 * SafeMate User Context
 * Manages user authentication state and user data
 * Updated: 2025-01-15 - Fixed authentication to use real Cognito attributes instead of mock data
 */

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
  account_type: 'personal' | 'family' | 'business' | 'community' | 'sporting' | 'cultural';
  wallet_created: boolean;
  wallet_address?: string;
  created_at: string;
  updated_at: string;
  signInDetails?: {
    loginId?: string;
  };
  attributes?: {
    name?: string;
    'custom:account_type'?: string;
    email?: string;
    given_name?: string;
    family_name?: string;
    account_type?: string;
  };
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  isLoading: boolean; // Alias for loading
  error: string | null;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Use refs to track current state in event listeners
  const userRef = useRef<User | null>(null);
  const isAuthenticatedRef = useRef(false);
  
  // Update refs when state changes
  useEffect(() => {
    userRef.current = user;
  }, [user]);
  
  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentUser = await getCurrentUser();
      
      // Get the user's attributes from Cognito
      const { fetchUserAttributes } = await import('aws-amplify/auth');
      const attributes = await fetchUserAttributes();
      
      console.log('🔍 UserContext: User attributes:', attributes);
      
      // Create a proper user object with real attributes
      const user: User = {
        id: currentUser.userId || 'unknown-user-id',
        username: attributes.email || currentUser.username || 'unknown-username',
        email: attributes.email || currentUser.signInDetails?.loginId || 'unknown@example.com',
        name: attributes.given_name || attributes.email?.split('@')[0] || 'User',
        account_type: attributes['custom:account_type'] || 'personal',
        wallet_created: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        signInDetails: currentUser.signInDetails,
        attributes: {
          name: attributes.given_name || attributes.email?.split('@')[0] || 'User',
          'custom:account_type': attributes['custom:account_type'] || 'personal',
          given_name: attributes.given_name || attributes.email?.split('@')[0] || 'User',
          family_name: attributes.family_name || '',
          email: attributes.email || currentUser.signInDetails?.loginId || 'unknown@example.com'
        }
      };

      setUser(user);
      setIsAuthenticated(true);
    } catch (err) {
      console.log('🔍 UserContext: No authenticated user found (this is normal on app startup)');
      setUser(null);
      setIsAuthenticated(false);
      // Don't set error for authentication failures - this is expected when user is not logged in
      if (err instanceof Error && !err.message?.includes('User needs to be authenticated')) {
        setError('Failed to load user data');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { signOut } = await import('aws-amplify/auth');
      await signOut();
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      console.error('❌ UserContext: Error logging out:', err);
    }
  };

  const refreshUser = async () => {
    await fetchUserData();
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;

    try {
      const updatedUser = { ...user, ...updates, updated_at: new Date().toISOString() };
      setUser(updatedUser);
    } catch (err) {
      console.error('❌ UserContext: Error updating user:', err);
    }
  };

  useEffect(() => {
    // Check for existing authentication session on app startup
    fetchUserData();
    
    // Listen for authentication events
    const hubListenerCancel = Hub.listen('auth', async ({ payload }) => {
      console.log('🔧 UserContext Auth Event:', payload.event, payload);
      
      switch (payload.event) {
        case 'signedIn':
          console.log('🔧 UserContext: User signed in, refreshing user data');
          fetchUserData();
          break;
        case 'signedOut':
          console.log('🔧 UserContext: User signed out event received');
          console.log('🔧 UserContext: Current user state before clearing:', userRef.current?.username);
          
          // Only clear if we actually have a user to clear
          if (userRef.current || isAuthenticatedRef.current) {
            console.log('🔧 UserContext: Clearing user data due to signedOut event');
            setUser(null);
            setIsAuthenticated(false);
          } else {
            console.log('🔍 UserContext: Ignoring signedOut event - no user was authenticated');
          }
          setLoading(false);
          break;
        case 'tokenRefresh':
          console.log('🔧 UserContext: Token refresh event');
          break;
        case 'tokenRefresh_failure':
          console.log('🔧 UserContext: Token refresh failed');
          break;
        default:
          console.log('🔧 UserContext: Unknown auth event:', payload.event);
      }
    });

    return () => {
      hubListenerCancel();
    };
  }, []); // Empty dependency array - only run once on mount

  const contextValue: UserContextType = {
    user,
    loading,
    isLoading: loading, // Alias for loading
    error,
    isAuthenticated,
    logout,
    refreshUser,
    updateUser
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext;
