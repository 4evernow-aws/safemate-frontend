import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_EMAIL_VERIFICATION_API_URL || 'https://your-api-gateway-url.amazonaws.com/dev';

export class EmailVerificationService {
  /**
   * Send verification code to user's email
   * @param username - User's email/username
   */
  static async sendVerificationCode(username: string): Promise<{ message: string; destination?: string }> {
    try {
      console.log('📧 Sending verification code to:', username);
      
      const response = await axios.post(`${API_BASE_URL}/email-verification`, {
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
      
      const response = await axios.post(`${API_BASE_URL}/email-verification`, {
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
      
      // This would typically call a Cognito API to check user status
      // For now, we'll return a default response
      return { needsVerification: false };
    } catch (error: any) {
      console.error('❌ Error checking verification status:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to check verification status');
    }
  }
}
