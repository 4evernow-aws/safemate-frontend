import { fetchAuthSession, signOut } from 'aws-amplify/auth';

export interface TokenInfo {
  token: string;
  expiresAt: number;
  isValid: boolean;
  timeUntilExpiry: number;
}

export class TokenService {
  private static readonly TOKEN_BUFFER_TIME = 5 * 60 * 1000; // 5 minute buffer (increased from 1)
  private static readonly TOKEN_REFRESH_THRESHOLD = 10 * 60 * 1000; // 10 minutes threshold (increased from 5)

  /**
   * Get a valid access token, automatically refreshing if needed
   */
  static async getValidAccessToken(): Promise<string | null> {
    try {
      console.log('🔍 TokenService: Getting valid access token...');
      
      const tokenInfo = await this.getTokenInfo();
      
      if (!tokenInfo) {
        console.log('❌ TokenService: No token available');
        return null;
      }

      console.log(`🔍 TokenService: Token expires in ${Math.round(tokenInfo.timeUntilExpiry / 1000 / 60)} minutes`);
      console.log(`🔍 TokenService: Token preview: ${tokenInfo.token.substring(0, 50)}...`);

      // Check if token is expired or will expire soon
      if (!tokenInfo.isValid || tokenInfo.timeUntilExpiry < this.TOKEN_REFRESH_THRESHOLD) {
        console.log('⚠️ TokenService: Token expired or expiring soon, attempting refresh...');
        
        const refreshedToken = await this.refreshToken();
        if (refreshedToken) {
          console.log('✅ TokenService: Token refreshed successfully');
          return refreshedToken;
        } else {
          console.log('⚠️ TokenService: Token refresh failed, but allowing use of existing token');
          console.log('⚠️ TokenService: This may cause API calls to fail, but prevents auto sign-out');
          await this.handleTokenRefreshFailure();
          // Return the existing token even if expired, rather than null
          return tokenInfo.token;
        }
      }

      console.log('✅ TokenService: Using existing valid token');
      return tokenInfo.token;
    } catch (error) {
      console.error('❌ TokenService: Error getting valid access token:', error);
      return null;
    }
  }

  /**
   * Get a valid ID token, automatically refreshing if needed
   */
  static async getValidIdToken(): Promise<string | null> {
    try {
      console.log('🔍 TokenService: Getting valid ID token...');
      
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken;
      
      if (!idToken) {
        console.log('❌ TokenService: No ID token available');
        return null;
      }

      const tokenString = idToken.toString();
      const payload = idToken.payload;
      
      if (!payload || !payload.exp) {
        console.log('❌ TokenService: Invalid ID token payload');
        return null;
      }

      const now = Math.floor(Date.now() / 1000);
      const expiresAt = payload.exp * 1000;
      const timeUntilExpiry = expiresAt - Date.now();
      const isValid = timeUntilExpiry > this.TOKEN_BUFFER_TIME;

      console.log(`🔍 TokenService: ID token expires in ${Math.round(timeUntilExpiry / 1000 / 60)} minutes`);
      console.log(`🔍 TokenService: ID token preview: ${tokenString.substring(0, 50)}...`);

      if (!isValid) {
        console.log('⚠️ TokenService: ID token expired, attempting refresh...');
        const refreshedToken = await this.refreshToken();
        if (refreshedToken) {
          console.log('✅ TokenService: ID token refreshed successfully');
          return refreshedToken;
        } else {
          console.log('❌ TokenService: ID token refresh failed');
          return null;
        }
      }

      console.log('✅ TokenService: Using existing valid ID token');
      return tokenString;
    } catch (error) {
      console.error('❌ TokenService: Error getting valid ID token:', error);
      return null;
    }
  }

  /**
   * Get current token information
   */
  static async getTokenInfo(): Promise<TokenInfo | null> {
    try {
      const session = await fetchAuthSession();
      const accessToken = session.tokens?.accessToken;
      
      if (!accessToken) {
        console.log('❌ TokenService: No access token in session');
        return null;
      }

      const tokenString = accessToken.toString();
      const payload = accessToken.payload;
      
      if (!payload || !payload.exp) {
        console.log('❌ TokenService: Invalid token payload');
        return null;
      }

      const now = Math.floor(Date.now() / 1000);
      const expiresAt = payload.exp * 1000; // Convert to milliseconds
      const timeUntilExpiry = expiresAt - Date.now();
      const isValid = timeUntilExpiry > this.TOKEN_BUFFER_TIME;

      return {
        token: tokenString,
        expiresAt,
        isValid,
        timeUntilExpiry
      };
    } catch (error) {
      console.error('❌ TokenService: Error getting token info:', error);
      return null;
    }
  }

  /**
   * Attempt to refresh the token
   */
  private static async refreshToken(): Promise<string | null> {
    try {
      console.log('🔄 TokenService: Attempting token refresh...');
      
      // Amplify should automatically refresh tokens when fetchAuthSession is called
      // if the refresh token is still valid
      const session = await fetchAuthSession({ forceRefresh: true });
      const accessToken = session.tokens?.accessToken?.toString();
      
      if (accessToken) {
        console.log('✅ TokenService: Token refreshed successfully');
        return accessToken;
      } else {
        console.log('❌ TokenService: No token returned after refresh');
        return null;
      }
    } catch (error) {
      console.error('❌ TokenService: Error refreshing token:', error);
      return null;
    }
  }

  /**
   * Handle token refresh failure
   */
  private static async handleTokenRefreshFailure(): Promise<void> {
    try {
      console.log('⚠️ TokenService: Token refresh failed - but not signing out user automatically');
      console.log('⚠️ TokenService: User can continue using the app until they manually sign out');
      
      // Don't automatically sign out - let user continue with potentially expired token
      // This prevents aggressive auto sign-outs during development
      
      // Only log the issue for debugging
      console.log('🔍 TokenService: Consider manual sign out if experiencing issues');
    } catch (error) {
      console.error('❌ TokenService: Error handling token refresh failure:', error);
    }
  }

  /**
   * Check if user is authenticated with valid token
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      // First try to get current user to see if we have a session
      const { getCurrentUser } = await import('aws-amplify/auth');
      try {
        await getCurrentUser();
        console.log('✅ TokenService: User session exists');
      } catch (userError) {
        console.log('❌ TokenService: No user session found');
        return false;
      }

      // Then check token validity
      const tokenInfo = await this.getTokenInfo();
      const isValid = tokenInfo?.isValid || false;
      
      console.log(`🔍 TokenService: Token valid: ${isValid}`);
      return isValid;
    } catch (error) {
      console.error('❌ TokenService: Error checking authentication:', error);
      return false;
    }
  }

  /**
   * Get authentication headers for API requests
   */
  static async getAuthHeaders(): Promise<HeadersInit> {
    const token = await this.getValidAccessToken();
    
    if (!token) {
      throw new Error('No valid access token available');
    }

    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Log token status for debugging
   */
  static async logTokenStatus(): Promise<void> {
    try {
      const tokenInfo = await this.getTokenInfo();
      
      if (!tokenInfo) {
        console.log('🔍 TokenService: No token available');
        return;
      }

      const minutesUntilExpiry = Math.round(tokenInfo.timeUntilExpiry / 1000 / 60);
      const hoursUntilExpiry = Math.round(tokenInfo.timeUntilExpiry / 1000 / 60 / 60 * 10) / 10;

      console.log('🔍 TokenService: Token Status:');
      console.log(`  - Valid: ${tokenInfo.isValid ? '✅' : '❌'}`);
      console.log(`  - Expires in: ${minutesUntilExpiry} minutes (${hoursUntilExpiry} hours)`);
      console.log(`  - Expires at: ${new Date(tokenInfo.expiresAt).toISOString()}`);
      console.log(`  - Token preview: ${tokenInfo.token.substring(0, 50)}...`);
    } catch (error) {
      console.error('❌ TokenService: Error logging token status:', error);
    }
  }
} 