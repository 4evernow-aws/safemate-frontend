// =============================================================================
// SafeMate Email Verification Service
// =============================================================================
//
// This service handles:
// - Sending verification codes to users (new and existing)
// - Verifying confirmation codes entered by users
// - Checking verification status for all users
// - Treating existing users the same as new users for email verification
//
// Environment: Development (dev)
// Last Updated: 2025-09-11
// Status: Fixed - simplified Lambda function to avoid layer dependency issues
//
// Key Features:
// - Universal email verification for ALL users (new and existing)
// - Integration with user onboarding Lambda function
// - Comprehensive error handling and logging
// - TypeScript support with proper type definitions
// - CORS-compliant API integration
//
// API Endpoints:
// - POST /onboarding/verify with action: 'send_verification_code'
// - POST /onboarding/verify with action: 'verify_code'
// - POST /onboarding/verify with action: 'check_verification_status'
//
// Note: Uses user onboarding API Gateway for email verification
// to leverage existing CORS configuration and infrastructure
//
// =============================================================================

import axios from 'axios';

// Temporarily use onboarding API until email verification API is deployed
const API_BASE_URL = import.meta.env.VITE_ONBOARDING_API_URL || 'https://527ye7o1j0.execute-api.ap-southeast-2.amazonaws.com/dev';

export class EmailVerificationService {
  /**
   * Send verification code to user's email
   * @param username - User's email/username
   */
  static async sendVerificationCode(username: string): Promise<{ message: string; destination?: string }> {
    try {
      console.log('📧 Sending verification code to:', username);
      
      const response = await axios.post(`${API_BASE_URL}/onboarding/verify`, {
        username,
        action: 'send_verification_code'
      });
      
      console.log('✅ Verification code sent successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error sending verification code:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to send verification code');
    }
  }

  /**
   * Verify the confirmation code entered by user
   * @param username - User's email/username
   * @param confirmationCode - 6-digit verification code
   */
  static async verifyCode(username: string, confirmationCode: string): Promise<{ message: string }> {
    try {
      console.log('🔍 Verifying code for user:', username);
      
      const response = await axios.post(`${API_BASE_URL}/onboarding/verify`, {
        username,
        confirmationCode,
        action: 'verify_code'
      });
      
      console.log('✅ Email verification successful');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error verifying code:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to verify code');
    }
  }

  /**
   * Check if user needs email verification
   * @param username - User's email/username
   */
  static async checkVerificationStatus(username: string): Promise<{ needsVerification: boolean }> {
    try {
      console.log('🔍 Checking verification status for:', username);
      
      const response = await axios.post(`${API_BASE_URL}/onboarding/verify`, {
        username,
        action: 'check_verification_status'
      });
      
      console.log('✅ Verification status check successful:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error checking verification status:', error);
      
      // If the API call fails, assume user needs verification to be safe
      // This ensures existing users are treated the same as new users
      console.log('⚠️ API call failed, assuming user needs verification');
      return { needsVerification: true };
    }
  }
}
