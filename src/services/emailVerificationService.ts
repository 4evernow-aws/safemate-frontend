/**
 * SafeMate Email Verification Service
 * Uses AWS Cognito's native email verification functionality
 * Updated: 2025-01-15 - Fixed to use Cognito native service instead of custom API
 */

import { CognitoService } from '../cognito';

export class EmailVerificationService {
  /**
   * Send verification code to user's email using Cognito's native service
   * @param username - User's email/username
   */
  static async sendVerificationCode(username: string): Promise<{ message: string; destination?: string }> {
    try {
      console.log('📧 Sending verification code via Cognito native service to:', username);
      
      // Use Cognito's native resendConfirmationCode method
      const result = await CognitoService.resendConfirmationCode(username);
      
      console.log('✅ Verification code sent successfully via Cognito');
      return {
        message: 'Verification code sent successfully',
        destination: username
      };
    } catch (error: any) {
      console.error('❌ Error sending verification code via Cognito:', error);
      
      // Handle specific Cognito errors
      if (error.code === 'NotAuthorizedException') {
        if (error.message.includes('Auto verification not turned on')) {
          // This error suggests the user pool configuration needs to be updated
          console.error('🔧 Cognito user pool email verification not properly configured');
          throw new Error('Email verification is not properly configured. Please contact support.');
        } else if (error.message.includes('User does not exist')) {
          throw new Error('User does not exist. Please sign up first.');
        } else if (error.message.includes('User is already confirmed')) {
          throw new Error('User is already verified. Please sign in.');
        }
      }
      
      throw new Error(error.message || 'Failed to send verification code');
    }
  }

  /**
   * Verify the confirmation code entered by user using Cognito's native service
   * @param username - User's email/username
   * @param confirmationCode - 6-digit verification code
   */
  static async verifyCode(username: string, confirmationCode: string): Promise<{ message: string }> {
    try {
      console.log('🔍 Verifying code via Cognito native service for user:', username);
      
      // Use Cognito's native confirmSignUp method
      const result = await CognitoService.confirmSignUp(username, confirmationCode);
      
      console.log('✅ Email verification successful via Cognito');
      return {
        message: 'Email verification successful'
      };
    } catch (error: any) {
      console.error('❌ Error verifying code via Cognito:', error);
      throw new Error(error.message || 'Failed to verify code');
    }
  }

  /**
   * Check if user needs email verification
   * @param username - User's email/username
   */
  static async checkVerificationStatus(username: string): Promise<{ needsVerification: boolean }> {
    try {
      console.log('🔍 Checking verification status for:', username);
      
      // For Cognito, we assume verification is needed if user is not confirmed
      // This is a simplified check - in practice, you might want to call Cognito Admin APIs
      return { needsVerification: true };
    } catch (error: any) {
      console.error('❌ Error checking verification status:', error);
      throw new Error(error.message || 'Failed to check verification status');
    }
  }
}
