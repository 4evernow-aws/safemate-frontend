import { config } from '../config/environment';
import { fetchAuthSession } from 'aws-amplify/auth';
import { type AuthUser } from 'aws-amplify/auth';

export interface OnboardingStatus {
  onboardingStatus: 'pending' | 'in_progress' | 'completed' | 'failed';
  hederaAccountId?: string;
  walletExists: boolean;
  onboardingError?: string;
  timestamp: string;
  isNewUser?: boolean;
}

export class OnboardingService {
  private static baseUrl = config.isDemoMode ? '' : config.onboardingApiUrl;

  /**
   * Get the current onboarding status for a user
   */
  static async getOnboardingStatus(user?: AuthUser): Promise<OnboardingStatus> {
    console.log('🔍 Debug: Starting getOnboardingStatus');
    console.log('🔍 Debug: User object:', { 
      username: user?.username, 
      signInDetails: user?.signInDetails,
      userId: user?.userId 
    });

    if (config.isDemoMode) {
      console.log('🔍 Debug: Demo mode - returning mock completed status');
      return {
        onboardingStatus: 'completed',
        hederaAccountId: '0.0.123456',
        walletExists: true,
        timestamp: new Date().toISOString()
      };
    }

    try {
      if (!user) {
        console.log('❌ Debug: No user provided');
        throw new Error('User not authenticated');
      }

      console.log('🔍 Debug: Getting auth session...');
      
      // Get ID token from Amplify (not access token for API Gateway Cognito authorizer)
      const session = await fetchAuthSession();
      console.log('🔍 Debug: Session:', {
        tokens: session.tokens ? 'Present' : 'Missing',
        idToken: session.tokens?.idToken ? 'Present' : 'Missing',
        tokenString: session.tokens?.idToken?.toString()?.substring(0, 50) + '...'
      });

      const idToken = session.tokens?.idToken?.toString();

      if (!idToken) {
        console.log('❌ Debug: No ID token available');
        throw new Error('No ID token available');
      }

      // Get user ID from JWT token
      const userId = session.tokens?.idToken?.payload?.sub || user.username;
      console.log('🔍 Debug: User ID extracted:', userId);

      const requestUrl = `${this.baseUrl}/onboarding/status`;
      const requestBody = { userId: userId };
      
      console.log('🔍 Debug: Making request to:', requestUrl);
      console.log('🔍 Debug: Request body:', requestBody);
      console.log('🔍 Debug: Authorization header:', `Bearer ${idToken.substring(0, 50)}...`);

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('🔍 Debug: Response received');
      console.log('🔍 Debug: Response status:', response.status);
      console.log('🔍 Debug: Response statusText:', response.statusText);
      console.log('🔍 Debug: Response ok:', response.ok);
      console.log('🔍 Debug: Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.status === 404) {
        console.log('🔍 Debug: 404 response - treating as new user');
        // User doesn't exist in our system yet - this is a new user
        console.log('New user detected, starting onboarding process');
        
        // Automatically start the onboarding process for new users
        return {
          onboardingStatus: 'pending',
          hederaAccountId: undefined,
          walletExists: false,
          timestamp: new Date().toISOString(),
          isNewUser: true
        };
      }

      if (!response.ok) {
        console.log('❌ Debug: Response not ok - status:', response.status);
        const errorText = await response.text();
        console.log('❌ Debug: Error response body:', errorText);
        throw new Error(`Failed to get onboarding status: ${response.statusText} - ${errorText}`);
      }

      console.log('🔍 Debug: Response is ok, reading JSON...');
      const responseText = await response.text();
      console.log('🔍 Debug: Raw response text:', responseText);
      
      let data;
             try {
         data = JSON.parse(responseText);
         console.log('🔍 Debug: Parsed JSON data:', data);
       } catch (parseError) {
         console.error('❌ Debug: JSON parse error:', parseError);
         console.log('❌ Debug: Failed to parse response text:', responseText);
         const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parse error';
         throw new Error(`Invalid JSON response: ${errorMessage}`);
       }

      console.log('✅ Debug: Successfully returning onboarding status:', data);
      return data;
    } catch (error) {
      console.error('❌ Debug: Error in getOnboardingStatus:', error);
      console.error('❌ Debug: Error type:', typeof error);
      console.error('❌ Debug: Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('❌ Debug: Error stack:', error instanceof Error ? error.stack : 'No stack');
     
      // If it's an authentication error, re-throw it
      if (error instanceof Error && error.message.includes('not authenticated')) {
        console.log('🔍 Debug: Re-throwing authentication error');
        throw error;
      }
      
      // For other errors, assume this is a new user and trigger onboarding
      console.log('🔍 Debug: Error checking onboarding status, treating as new user');
      return {
        onboardingStatus: 'pending',
        hederaAccountId: undefined,
        walletExists: false,
        timestamp: new Date().toISOString(),
        isNewUser: true,
        onboardingError: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Start the onboarding process for a new user
   */
  static async startOnboarding(user?: AuthUser): Promise<boolean> {
    if (config.isDemoMode) {
      // Mock success in demo mode
      return true;
    }

    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get ID token from Amplify (not access token for API Gateway Cognito authorizer)
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();

      if (!idToken) {
        throw new Error('No ID token available');
      }

      // Get user ID from JWT token
      const userId = session.tokens?.idToken?.payload?.sub || user.username;

      const response = await fetch(`${this.baseUrl}/onboarding/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          userId: userId,
          email: user.signInDetails?.loginId || '',
          name: user.username
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to start onboarding: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to start onboarding:', error);
      throw error;
    }
  }

  /**
   * Wait for onboarding to complete (with polling)
   */
  static async waitForOnboarding(user?: AuthUser, maxAttempts: number = 30): Promise<OnboardingStatus> {
    if (config.isDemoMode) {
      // Mock delay and return completed status
      await new Promise(resolve => setTimeout(resolve, 2000));
      return {
        onboardingStatus: 'completed',
        hederaAccountId: '0.0.123456',
        walletExists: true,
        timestamp: new Date().toISOString()
      };
    }

    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        const status = await this.getOnboardingStatus(user);
        
        if (status.onboardingStatus === 'completed') {
          return status;
        }
        
        if (status.onboardingStatus === 'failed') {
          throw new Error(status.onboardingError || 'Onboarding failed');
        }
        
        // If still pending or in progress, wait and try again
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
        
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw error;
        }
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    throw new Error('Onboarding timeout - please try again');
  }

  /**
   * Retry failed onboarding
   */
  static async retryOnboarding(user?: AuthUser): Promise<boolean> {
    if (config.isDemoMode) {
      return true;
    }

    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get ID token from Amplify (not access token for API Gateway Cognito authorizer)
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();

      if (!idToken) {
        throw new Error('No ID token available');
      }

      // Get user ID from JWT token
      const userId = session.tokens?.idToken?.payload?.sub || user.username;

      const response = await fetch(`${this.baseUrl}/onboarding/retry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          userId: userId
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to retry onboarding: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to retry onboarding:', error);
      throw error;
    }
  }
} 