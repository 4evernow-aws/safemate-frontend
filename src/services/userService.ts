import { CognitoUserAttribute, CognitoUser } from 'amazon-cognito-identity-js';
import { fetchAuthSession } from 'aws-amplify/auth';
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
      const cognitoUser = await CognitoService.getCurrentUser();
      if (!cognitoUser) return null;

      const attributes = await this.getUserAttributes(cognitoUser);
      
      return {
        email: attributes.email || '',
        username: attributes.preferred_username || attributes.email || '',
        sub: attributes.sub || '',
            hederaAccountId: attributes['custom:hedera_account'],
    assetCount: attributes['custom:asset_count'] ? parseInt(attributes['custom:asset_count']) : 0,
    subscriptionTier: attributes['custom:subscription_tier'] as 'basic' | 'premium' | 'enterprise' || 'basic',
    mateTokenBalance: attributes['custom:mate_balance'] ? parseInt(attributes['custom:mate_balance']) : 0,
    kycVerificationStatus: attributes['custom:kyc_status'] as 'pending' | 'approved' | 'rejected' | 'in_review' || 'pending',
    lastBlockchainActivity: attributes['custom:last_activity'],
    storageQuotaUsed: attributes['custom:storage_used'] ? parseInt(attributes['custom:storage_used']) : 0,
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Get user attributes from Cognito
   */
  private static getUserAttributes(cognitoUser: CognitoUser): Promise<Record<string, string>> {
    return new Promise((resolve, reject) => {
      cognitoUser.getUserAttributes((err: any, attributes: any) => {
        if (err) {
          reject(err);
          return;
        }
        
        const attributeMap: Record<string, string> = {};
        attributes?.forEach((attr: any) => {
          attributeMap[attr.Name] = attr.Value;
        });
        
        resolve(attributeMap);
      });
    });
  }

  /**
   * Update user profile with custom attributes
   */
  static async updateUserProfile(updates: Partial<UserProfile>): Promise<boolean> {
    try {
      const cognitoUser = await CognitoService.getCurrentUser();
      console.log('🔍 UserService: Cognito user object:', cognitoUser);
      
      if (!cognitoUser) {
        console.log('❌ UserService: No Cognito user found');
        return false;
      }

      console.log('🔍 UserService: Attempting to update user attributes...');
      const attributesToUpdate: CognitoUserAttribute[] = [];

      // Map profile fields to Cognito attributes
      if (updates.hederaAccountId !== undefined) {
        attributesToUpdate.push(new CognitoUserAttribute({
          Name: 'custom:hedera_account',
          Value: updates.hederaAccountId,
        }));
      }
      if (updates.assetCount !== undefined) {
        attributesToUpdate.push(new CognitoUserAttribute({
          Name: 'custom:asset_count',
          Value: updates.assetCount.toString(),
        }));
      }
      if (updates.subscriptionTier !== undefined) {
        attributesToUpdate.push(new CognitoUserAttribute({
          Name: 'custom:subscription_tier',
          Value: updates.subscriptionTier,
        }));
      }
      if (updates.mateTokenBalance !== undefined) {
        attributesToUpdate.push(new CognitoUserAttribute({
          Name: 'custom:mate_balance',
          Value: updates.mateTokenBalance.toString(),
        }));
      }
      if (updates.kycVerificationStatus !== undefined) {
        attributesToUpdate.push(new CognitoUserAttribute({
          Name: 'custom:kyc_status',
          Value: updates.kycVerificationStatus,
        }));
      }
      if (updates.lastBlockchainActivity !== undefined) {
        attributesToUpdate.push(new CognitoUserAttribute({
          Name: 'custom:last_activity',
          Value: updates.lastBlockchainActivity,
        }));
      }
      if (updates.storageQuotaUsed !== undefined) {
        attributesToUpdate.push(new CognitoUserAttribute({
          Name: 'custom:storage_used',
          Value: updates.storageQuotaUsed.toString(),
        }));
      }

      console.log('🔍 UserService: Attributes to update:', attributesToUpdate);
      await this.updateUserAttributes(cognitoUser, attributesToUpdate);
      console.log('✅ UserService: User attributes updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  }

  /**
   * Update user attributes in Cognito
   */
  private static updateUserAttributes(cognitoUser: CognitoUser, attributes: CognitoUserAttribute[]): Promise<void> {
    return new Promise((resolve, reject) => {
      cognitoUser.updateAttributes(attributes, (err: any) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
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