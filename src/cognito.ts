/**
 * SafeMate Cognito Service
 * Updated to use AWS Amplify Auth for consistency with the rest of the application
 * Updated: 2025-01-15 - Migrated from amazon-cognito-identity-js to AWS Amplify Auth
 */

import { 
  signUp, 
  confirmSignUp, 
  signIn, 
  signOut, 
  getCurrentUser, 
  fetchAuthSession,
  resendSignUpCode,
  resetPassword
} from 'aws-amplify/auth';

export interface AuthUser {
  username: string;
  email: string;
  token: string;
}

export class CognitoService {
  static async signUp(email: string, password: string): Promise<any> {
    try {
      const result = await signUp({
        username: email,
        password: password,
        options: {
          userAttributes: {
            email: email,
          },
        },
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async confirmSignUp(email: string, confirmationCode: string): Promise<any> {
    try {
      const result = await confirmSignUp({
        username: email,
        confirmationCode: confirmationCode,
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async signIn(email: string, password: string): Promise<any> {
    try {
      const result = await signIn({
        username: email,
        password: password,
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async getCurrentUser(): Promise<any> {
    try {
      const user = await getCurrentUser();
      return user;
    } catch (error) {
      throw error;
    }
  }

  static async getCurrentSession(): Promise<any> {
    try {
      const session = await fetchAuthSession();
      return session;
    } catch (error) {
      throw error;
    }
  }

  static async signOut(): Promise<void> {
    try {
      await signOut();
    } catch (error) {
      throw error;
    }
  }

  static async getAuthenticatedUser(): Promise<AuthUser | null> {
    try {
      const session = await this.getCurrentSession();
      const user = await this.getCurrentUser();
      
      if (!user || !session.tokens) {
        return null;
      }

      return {
        username: user.username,
        email: session.tokens.idToken?.payload.email || '',
        token: session.tokens.idToken?.toString() || '',
      };
    } catch (error) {
      return null;
    }
  }

  static async resendConfirmationCode(email: string): Promise<any> {
    try {
      const result = await resendSignUpCode({
        username: email,
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async forgotPassword(username: string): Promise<any> {
    try {
      const result = await resetPassword({
        username: username,
      });
      return result;
    } catch (error) {
      throw error;
    }
  }
} 