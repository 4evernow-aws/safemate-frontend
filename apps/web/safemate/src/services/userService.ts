import { fetchAuthSession, updateUserAttribute } from 'aws-amplify/auth';
import { CognitoService } from '../cognito';
import { hederaConfig } from '../amplify-config';
import type { UserProfile, UserAttributes, UserStats, SubscriptionTier } from '../types/user';

export class UserService {
  /**
   * Get access token for API requests
   */
  static async getAccessToken(): Promise<string | null> {
    try {
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();
      return idToken || null;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  /**
   * Get user profile with custom attributes
   */
  static async getUserProfile(): Promise<UserProfile | null> {
    try {
      const session = await fetchAuthSession();
      if (!session.tokens?.idToken?.payload) return null;

      const attributes = session.tokens.idToken.payload;
      
      return {
        email: attributes.email as string || '',
        username: attributes.preferred_username as string || attributes.email as string || '',
        sub: attributes.sub as string || '',
        hederaAccountId: attributes['custom:hedera_account'] as string,
        assetCount: attributes['custom:asset_count'] ? parseInt(attributes['custom:asset_count'] as string) : 0,
        subscriptionTier: attributes['custom:subscription_tier'] as 'basic' | 'premium' | 'enterprise' || 'basic',
        mateTokenBalance: attributes['custom:mate_balance'] ? parseInt(attributes['custom:mate_balance'] as string) : 0,
        kycVerificationStatus: attributes['custom:kyc_status'] as 'pending' | 'approved' | 'rejected' | 'in_review' || 'pending',
        lastBlockchainActivity: attributes['custom:last_activity'] as string,
        storageQuotaUsed: attributes['custom:storage_used'] ? parseInt(attributes['custom:storage_used'] as string) : 0,
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }


  /**
   * Update user profile with custom attributes
   */
  static async updateUserProfile(updates: Partial<UserProfile>): Promise<boolean> {
    try {
      console.log('🔍 UserService: Attempting to update user attributes...');

      // Map profile fields to Cognito attributes and update them individually
      const updatePromises: Promise<void>[] = [];

      if (updates.hederaAccountId !== undefined) {
        updatePromises.push(updateUserAttribute({
          userAttributeKey: 'custom:hedera_account',
          value: updates.hederaAccountId,
        }));
      }
      if (updates.assetCount !== undefined) {
        updatePromises.push(updateUserAttribute({
          userAttributeKey: 'custom:asset_count',
          value: updates.assetCount.toString(),
        }));
      }
      if (updates.subscriptionTier !== undefined) {
        updatePromises.push(updateUserAttribute({
          userAttributeKey: 'custom:subscription_tier',
          value: updates.subscriptionTier,
        }));
      }
      if (updates.mateTokenBalance !== undefined) {
        updatePromises.push(updateUserAttribute({
          userAttributeKey: 'custom:mate_balance',
          value: updates.mateTokenBalance.toString(),
        }));
      }
      if (updates.kycVerificationStatus !== undefined) {
        updatePromises.push(updateUserAttribute({
          userAttributeKey: 'custom:kyc_status',
          value: updates.kycVerificationStatus,
        }));
      }
      if (updates.lastBlockchainActivity !== undefined) {
        updatePromises.push(updateUserAttribute({
          userAttributeKey: 'custom:last_activity',
          value: updates.lastBlockchainActivity,
        }));
      }
      if (updates.storageQuotaUsed !== undefined) {
        updatePromises.push(updateUserAttribute({
          userAttributeKey: 'custom:storage_used',
          value: updates.storageQuotaUsed.toString(),
        }));
      }

      console.log('🔍 UserService: Updating', updatePromises.length, 'attributes');
      await Promise.all(updatePromises);
      console.log('✅ UserService: User attributes updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  }


  /**
   * Initialize user profile with default values
   */
  static async initializeUserProfile(hederaAccountId: string): Promise<boolean> {
    try {
      const defaultAttributes = hederaConfig.defaultUserAttributes;
      const updates: Partial<UserProfile> = {
        hederaAccountId,
        assetCount: defaultAttributes.assetCount,
        subscriptionTier: defaultAttributes.subscriptionTier as 'basic' | 'premium' | 'enterprise',
        mateTokenBalance: defaultAttributes.mateTokenBalance,
        kycVerificationStatus: defaultAttributes.kycVerificationStatus as 'pending' | 'approved' | 'rejected' | 'in_review',
        storageQuotaUsed: defaultAttributes.storageQuotaUsed,
        lastBlockchainActivity: new Date().toISOString(),
      };

      return await this.updateUserProfile(updates);
    } catch (error) {
      console.error('Error initializing user profile:', error);
      return false;
    }
  }

  /**
   * Get user statistics
   */
  static async getUserStats(): Promise<UserStats | null> {
    try {
      const profile = await this.getUserProfile();
      if (!profile) return null;

      const subscriptionTier = this.getSubscriptionTier(profile.subscriptionTier || 'basic');
      
      return {
        totalAssets: profile.assetCount || 0,
        storageUsed: profile.storageQuotaUsed || 0,
        storageQuota: subscriptionTier.storageQuota,
        storagePercentage: subscriptionTier.storageQuota > 0 
          ? Math.round(((profile.storageQuotaUsed || 0) / subscriptionTier.storageQuota) * 100)
          : 0,
        mateTokenBalance: profile.mateTokenBalance || 0,
        lastActivity: profile.lastBlockchainActivity 
          ? new Date(profile.lastBlockchainActivity) 
          : null,
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return null;
    }
  }

  /**
   * Get subscription tier information
   */
  static getSubscriptionTier(tier: 'basic' | 'premium' | 'enterprise'): SubscriptionTier {
    return hederaConfig.subscriptionTiers[tier];
  }

  /**
   * Check if user can upload more assets
   */
  static async canUploadAsset(fileSize: number): Promise<{
    canUpload: boolean;
    reason?: string;
  }> {
    try {
      const stats = await this.getUserStats();
      if (!stats) return { canUpload: false, reason: 'Unable to fetch user stats' };

      const subscriptionTier = this.getSubscriptionTier(stats.storageQuota > 0 ? 'basic' : 'basic');
      
      // Check storage quota
      if (stats.storageUsed + fileSize > stats.storageQuota) {
        return {
          canUpload: false,
          reason: `Storage quota exceeded. Available: ${this.formatBytes(stats.storageQuota - stats.storageUsed)}, Required: ${this.formatBytes(fileSize)}`,
        };
      }

      // Check asset count limit
      if (stats.totalAssets >= subscriptionTier.maxAssets) {
        return {
          canUpload: false,
          reason: `Asset limit exceeded. Maximum assets for ${subscriptionTier.name} tier: ${subscriptionTier.maxAssets}`,
        };
      }

      return { canUpload: true };
    } catch (error) {
      console.error('Error checking upload eligibility:', error);
      return { canUpload: false, reason: 'Error checking upload eligibility' };
    }
  }

  /**
   * Update asset count after successful upload
   */
  static async incrementAssetCount(fileSize: number): Promise<boolean> {
    try {
      const profile = await this.getUserProfile();
      if (!profile) return false;

      const updates: Partial<UserProfile> = {
        assetCount: (profile.assetCount || 0) + 1,
        storageQuotaUsed: (profile.storageQuotaUsed || 0) + fileSize,
        lastBlockchainActivity: new Date().toISOString(),
      };

      return await this.updateUserProfile(updates);
    } catch (error) {
      console.error('Error incrementing asset count:', error);
      return false;
    }
  }

  /**
   * Format bytes to human readable format
   */
  private static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Check if user needs to complete KYC
   */
  static async needsKYC(): Promise<boolean> {
    try {
      const profile = await this.getUserProfile();
      return !profile || profile.kycVerificationStatus === 'pending' || profile.kycVerificationStatus === 'rejected';
    } catch (error) {
      console.error('Error checking KYC status:', error);
      return true;
    }
  }

  /**
   * Check if user has Hedera account
   */
  static async hasHederaAccount(): Promise<boolean> {
    try {
      const profile = await this.getUserProfile();
      return !!(profile && profile.hederaAccountId);
    } catch (error) {
      console.error('Error checking Hedera account:', error);
      return false;
    }
  }
}