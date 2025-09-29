import { fetchAuthSession, updateUserAttribute } from 'aws-amplify/auth';
import { hederaConfig } from '../amplify-config';
import type { UserProfile, UserAttributes, UserStats, SubscriptionTier } from '../types/user';

export class UserService {
  /**
   * Get user profile from Cognito attributes
   */
  static async getUserProfile(): Promise<UserProfile | null> {
    try {
      const session = await fetchAuthSession();
      const userAttributes = session.tokens?.idToken?.payload;
      
      if (!userAttributes) {
        console.log('🔍 UserService: No user attributes found');
        return null;
      }

      console.log('🔍 UserService: ID Token payload:', userAttributes);

      const profile: UserProfile = {
        email: userAttributes.email as string || '',
        username: userAttributes['cognito:username'] as string || '',
        sub: userAttributes.sub as string || '',
        givenName: userAttributes.given_name as string || '',
        familyName: userAttributes.family_name as string || '',
        name: userAttributes.name as string || '',
        hederaAccountId: userAttributes['custom:hedera_account'] as string || '',
        assetCount: parseInt(userAttributes['custom:asset_count'] as string || '0'),
        subscriptionTier: (userAttributes['custom:subscription_tier'] as string || 'Free') as SubscriptionTier,
        mateTokenBalance: parseFloat(userAttributes['custom:mate_token_balance'] as string || '0'),
        lastLogin: userAttributes['custom:last_login'] as string || '',
        accountType: (userAttributes['custom:account_type'] as string || 'Personal') as 'Personal' | 'Business',
        isVerified: userAttributes.email_verified === 'true' || userAttributes.email_verified === true,
        createdAt: userAttributes['custom:created_at'] as string || '',
        updatedAt: userAttributes['custom:updated_at'] as string || ''
      };

      console.log('✅ UserService: User profile retrieved successfully');
      return profile;
    } catch (error) {
      console.error('❌ UserService: Error getting user profile:', error);
      return null;
    }
  }

  /**
   * Get user display name
   */
  static getDisplayName(userProfile: UserProfile): string {
    console.log('🔍 UserService: Getting display name for user:', {
      givenName: userProfile.givenName,
      familyName: userProfile.familyName,
      name: userProfile.name,
      username: userProfile.username,
      email: userProfile.email
    });

    // Priority: givenName + familyName > name > email-derived name
    if (userProfile.givenName && userProfile.familyName) {
      const fullName = `${userProfile.givenName} ${userProfile.familyName}`;
      console.log('🔍 UserService: Using givenName + familyName:', fullName);
      return fullName;
    }

    if (userProfile.name) {
      console.log('🔍 UserService: Using name field:', userProfile.name);
      return userProfile.name;
    }

    // Fallback to email-derived name
    if (userProfile.email) {
      const emailName = userProfile.email.split('@')[0]
        .split('.')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
      console.log('🔍 UserService: Using email-derived name from email:', emailName);
      return emailName;
    }

    console.log('🔍 UserService: Using username as fallback:', userProfile.username);
    return userProfile.username || 'User';
  }

  /**
   * Update user profile with custom attributes
   */
  static async updateUserProfile(updates: Partial<UserProfile>): Promise<boolean> {
    try {
      console.log('🔍 UserService: Attempting to update user attributes...');
      
      // Update attributes one by one using the new Amplify v6 auth
      const updatePromises: Promise<void>[] = [];

      if (updates.hederaAccountId !== undefined) {
        updatePromises.push(
          updateUserAttribute({
            userAttributeKey: 'custom:hedera_account',
            value: updates.hederaAccountId,
          })
        );
      }
      if (updates.assetCount !== undefined) {
        updatePromises.push(
          updateUserAttribute({
            userAttributeKey: 'custom:asset_count',
            value: updates.assetCount.toString(),
          })
        );
      }
      if (updates.subscriptionTier !== undefined) {
        updatePromises.push(
          updateUserAttribute({
            userAttributeKey: 'custom:subscription_tier',
            value: updates.subscriptionTier,
          })
        );
      }
      if (updates.mateTokenBalance !== undefined) {
        updatePromises.push(
          updateUserAttribute({
            userAttributeKey: 'custom:mate_token_balance',
            value: updates.mateTokenBalance.toString(),
          })
        );
      }
      if (updates.lastLogin !== undefined) {
        updatePromises.push(
          updateUserAttribute({
            userAttributeKey: 'custom:last_login',
            value: updates.lastLogin,
          })
        );
      }
      if (updates.accountType !== undefined) {
        updatePromises.push(
          updateUserAttribute({
            userAttributeKey: 'custom:account_type',
            value: updates.accountType,
          })
        );
      }
      if (updates.updatedAt !== undefined) {
        updatePromises.push(
          updateUserAttribute({
            userAttributeKey: 'custom:updated_at',
            value: updates.updatedAt,
          })
        );
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
   * Get user stats
   */
  static async getUserStats(): Promise<UserStats | null> {
    try {
      const profile = await this.getUserProfile();
      if (!profile) return null;

      const stats: UserStats = {
        totalAssets: profile.assetCount,
        mateTokenBalance: profile.mateTokenBalance,
        subscriptionTier: profile.subscriptionTier,
        accountAge: profile.createdAt ? 
          Math.floor((Date.now() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0,
        lastLogin: profile.lastLogin,
        isVerified: profile.isVerified
      };

      return stats;
    } catch (error) {
      console.error('Error getting user stats:', error);
      return null;
    }
  }

  /**
   * Update user stats
   */
  static async updateUserStats(stats: Partial<UserStats>): Promise<boolean> {
    try {
      const updates: Partial<UserProfile> = {};
      
      if (stats.totalAssets !== undefined) {
        updates.assetCount = stats.totalAssets;
      }
      if (stats.mateTokenBalance !== undefined) {
        updates.mateTokenBalance = stats.mateTokenBalance;
      }
      if (stats.subscriptionTier !== undefined) {
        updates.subscriptionTier = stats.subscriptionTier;
      }
      if (stats.lastLogin !== undefined) {
        updates.lastLogin = stats.lastLogin;
      }

      return await this.updateUserProfile(updates);
    } catch (error) {
      console.error('Error updating user stats:', error);
      return false;
    }
  }

  /**
   * Get user attributes for display
   */
  static async getUserAttributes(): Promise<UserAttributes | null> {
    try {
      const profile = await this.getUserProfile();
      if (!profile) return null;

      const attributes: UserAttributes = {
        email: profile.email,
        username: profile.username,
        displayName: this.getDisplayName(profile),
        hederaAccountId: profile.hederaAccountId,
        accountType: profile.accountType,
        isVerified: profile.isVerified,
        subscriptionTier: profile.subscriptionTier,
        createdAt: profile.createdAt,
        lastLogin: profile.lastLogin
      };

      return attributes;
    } catch (error) {
      console.error('Error getting user attributes:', error);
      return null;
    }
  }
}
