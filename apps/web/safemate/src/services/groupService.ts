import { fetchAuthSession } from 'aws-amplify/auth';
import { config } from '../config/environment';

export interface Group {
  groupId: string;
  groupName: string;
  description?: string;
  ownerId: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
  status: string;
  userRole?: string;
  joinedAt?: string;
}

export interface GroupMember {
  userId: string;
  email?: string;
  hederaAccountId?: string;
  role: string;
  joinedAt: string;
  status: string;
  addedBy?: string;
}

export interface GroupInvitation {
  invitationId: string;
  groupId: string;
  groupName?: string;
  inviterUserId: string;
  inviterEmail?: string;
  inviteeUserId: string;
  inviteeEmail?: string;
  inviteeAccountId?: string;
  role: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: string;
  expiresAt: string;
  respondedAt?: string;
}

export interface SharedWallet {
  walletId: string;
  sharedBy: string;
  sharedAt: string;
  permissions: {
    viewBalance: boolean;
    viewTransactions: boolean;
    initiateTransactions: boolean;
  };
  status: string;
}

export interface GroupActivity {
  activityId: string;
  groupId: string;
  userId: string;
  activityType: string;
  details: any;
  timestamp: string;
}

export interface GroupOperationResult {
  success: boolean;
  error?: string;
  data?: any;
}

export interface CreateGroupRequest {
  groupName: string;
  description?: string;
}

export interface InviteMemberRequest {
  identifier: string; // email or hedera account ID
  role: 'owner' | 'admin' | 'editor' | 'viewer';
}

export interface UpdateGroupRequest {
  groupName?: string;
  description?: string;
}

export interface ShareWalletRequest {
  walletId: string;
  permissions?: {
    viewBalance: boolean;
    viewTransactions: boolean;
    initiateTransactions: boolean;
  };
}

export interface UnshareWalletRequest {
  walletId: string;
}

export interface RespondToInvitationRequest {
  response: 'accept' | 'decline';
}

export class GroupService {
  private static readonly BASE_URL = config.groupApiUrl;

  /**
   * Make authenticated request to the API
   */
  private static async makeAuthenticatedRequest(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE', 
    body?: any
  ): Promise<any> {
    try {
      console.log('🔍 Groups Debug: Starting makeAuthenticatedRequest');
      console.log('🔍 Groups Debug: Endpoint:', endpoint);
      console.log('🔍 Groups Debug: Method:', method);
      console.log('🔍 Groups Debug: Body:', body);
      console.log('🔍 Groups Debug: API_BASE_URL:', this.BASE_URL);
      
      // Get user's auth token
      const session = await fetchAuthSession();
      console.log('🔍 Groups Debug: Session received');
      
      const token = session.tokens?.idToken?.toString();
      console.log('🔍 Groups Debug: Token available:', !!token);
      console.log('🔍 Groups Debug: Token preview:', token?.substring(0, 50) + '...');

      if (!token) {
        console.log('❌ Groups Debug: No token available');
        throw new Error('User not authenticated');
      }

      const requestUrl = `${this.BASE_URL}${endpoint}`;
      console.log('🔍 Groups Debug: Full request URL:', requestUrl);
      console.log('🔍 Groups Debug: Request headers:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.substring(0, 50)}...`
      });

      const response = await fetch(requestUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: body ? JSON.stringify(body) : undefined
      });

      console.log('🔍 Groups Debug: Response received');
      console.log('🔍 Groups Debug: Response status:', response.status);
      console.log('🔍 Groups Debug: Response statusText:', response.statusText);
      console.log('🔍 Groups Debug: Response ok:', response.ok);

      if (!response.ok) {
        console.log('❌ Groups Debug: Response not ok');
        const errorText = await response.text();
        console.log('❌ Groups Debug: Error response body:', errorText);
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }

      console.log('🔍 Groups Debug: Reading JSON response...');
      const responseText = await response.text();
      console.log('🔍 Groups Debug: Raw response text:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('🔍 Groups Debug: Parsed JSON data:', data);
      } catch (parseError) {
        console.error('❌ Groups Debug: JSON parse error:', parseError);
        console.log('❌ Groups Debug: Failed to parse response text:', responseText);
        throw new Error(`Invalid JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
      }

      console.log('✅ Groups Debug: Successfully returning data:', data);
      return data;
    } catch (error) {
      console.error('❌ Groups Debug: API request error:', error);
      console.error('❌ Groups Debug: Error type:', typeof error);
      console.error('❌ Groups Debug: Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('❌ Groups Debug: Error stack:', error instanceof Error ? error.stack : 'No stack');
      throw error;
    }
  }
  
  /**
   * Get all groups for the current user
   */
  static async getUserGroups(): Promise<Group[]> {
    try {
      console.log('🔍 Groups Debug: Getting user groups');
      const response = await this.makeAuthenticatedRequest('/groups', 'GET');
      
      if (response.success && response.groups) {
        return response.groups;
      }
      
      throw new Error(response.error || 'Failed to fetch groups');
    } catch (error) {
      console.error('Error fetching user groups:', error);
      throw error;
    }
  }
  
  /**
   * Get a specific group by ID
   */
  static async getGroup(groupId: string): Promise<Group> {
    try {
      console.log('🔍 Groups Debug: Getting group:', groupId);
      const response = await this.makeAuthenticatedRequest(`/groups/${groupId}`, 'GET');
      
      if (response.success && response.group) {
        return response.group;
      }
      
      throw new Error(response.error || 'Failed to fetch group');
    } catch (error) {
      console.error('Error fetching group:', error);
      throw error;
    }
  }
  
  /**
   * Create a new group
   */
  static async createGroup(request: CreateGroupRequest): Promise<Group> {
    try {
      console.log('🔍 Groups Debug: Creating group:', request);
      const response = await this.makeAuthenticatedRequest('/groups', 'POST', request);
      
      if (response.success && response.group) {
        return response.group;
      }
      
      throw new Error(response.error || 'Failed to create group');
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing group
   */
  static async updateGroup(groupId: string, request: UpdateGroupRequest): Promise<GroupOperationResult> {
    try {
      console.log('🔍 Groups Debug: Updating group:', groupId, request);
      const response = await this.makeAuthenticatedRequest(`/groups/${groupId}`, 'PUT', request);
      
      return {
        success: response.success,
        error: response.error,
        data: response.group
      };
    } catch (error) {
      console.error('Error updating group:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
  
  /**
   * Get group members
   */
  static async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    try {
      console.log('🔍 Groups Debug: Getting group members:', groupId);
      const response = await this.makeAuthenticatedRequest(`/groups/${groupId}/members`, 'GET');
      
      if (response.success && response.members) {
        return response.members;
      }
      
      throw new Error(response.error || 'Failed to fetch group members');
    } catch (error) {
      console.error('Error fetching group members:', error);
      throw error;
    }
  }
  
  /**
   * Send invitation to join group
   */
  static async inviteMember(
    groupId: string,
    request: InviteMemberRequest
  ): Promise<GroupInvitation> {
    try {
      console.log('🔍 Groups Debug: Inviting member:', groupId, request);
      const response = await this.makeAuthenticatedRequest(
        `/groups/${groupId}/members`,
        'POST',
        request
      );
      
      if (response.success && response.invitation) {
        return response.invitation;
      }
      
      throw new Error(response.error || 'Failed to send invitation');
    } catch (error) {
      console.error('Error inviting member:', error);
      throw error;
    }
  }
  
  /**
   * Remove member from group
   */
  static async removeMember(
    groupId: string,
    userId: string
  ): Promise<GroupOperationResult> {
    try {
      console.log('🔍 Groups Debug: Removing member:', groupId, userId);
      const response = await this.makeAuthenticatedRequest(
        `/groups/${groupId}/members/${userId}`,
        'DELETE'
      );
      
      return {
        success: response.success,
        error: response.error
      };
    } catch (error) {
      console.error('Error removing member:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
  
  /**
   * Get group invitations (for group owners/admins)
   */
  static async getGroupInvitations(groupId: string): Promise<GroupInvitation[]> {
    try {
      console.log('🔍 Groups Debug: Getting group invitations:', groupId);
      const response = await this.makeAuthenticatedRequest(
        `/groups/${groupId}/invitations`,
        'GET'
      );
      
      if (response.success && response.invitations) {
        return response.invitations;
      }
      
      throw new Error(response.error || 'Failed to fetch group invitations');
    } catch (error) {
      console.error('Error fetching group invitations:', error);
      throw error;
    }
  }
  
  /**
   * Get user's invitations (received invitations)
   */
  static async getUserInvitations(status?: string): Promise<GroupInvitation[]> {
    try {
      console.log('🔍 Groups Debug: Getting user invitations, status:', status);
      const url = status ? `/invitations?status=${status}` : '/invitations';
      const response = await this.makeAuthenticatedRequest(url, 'GET');
      
      if (response.success && response.invitations) {
        return response.invitations;
      }
      
      throw new Error(response.error || 'Failed to fetch user invitations');
    } catch (error) {
      console.error('Error fetching user invitations:', error);
      throw error;
    }
  }
  
  /**
   * Respond to an invitation
   */
  static async respondToInvitation(
    invitationId: string,
    request: RespondToInvitationRequest
  ): Promise<GroupOperationResult> {
    try {
      console.log('🔍 Groups Debug: Responding to invitation:', invitationId, request);
      const response = await this.makeAuthenticatedRequest(
        `/invitations/${invitationId}/respond`,
        'POST',
        request
      );
      
      return {
        success: response.success,
        error: response.error,
        data: response.result
      };
    } catch (error) {
      console.error('Error responding to invitation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
  
  /**
   * Get shared wallets for a group
   */
  static async getSharedWallets(groupId: string): Promise<SharedWallet[]> {
    try {
      console.log('🔍 Groups Debug: Getting shared wallets:', groupId);
      const response = await this.makeAuthenticatedRequest(
        `/groups/${groupId}/wallets`,
        'GET'
      );
      
      if (response.success && response.wallets) {
        return response.wallets;
      }
      
      throw new Error(response.error || 'Failed to fetch shared wallets');
    } catch (error) {
      console.error('Error fetching shared wallets:', error);
      throw error;
    }
  }
  
  /**
   * Share a wallet with a group
   */
  static async shareWallet(
    groupId: string,
    request: ShareWalletRequest
  ): Promise<GroupOperationResult> {
    try {
      console.log('🔍 Groups Debug: Sharing wallet:', groupId, request);
      const response = await this.makeAuthenticatedRequest(
        `/groups/${groupId}/wallets`,
        'POST',
        request
      );
      
      return {
        success: response.success,
        error: response.error
      };
    } catch (error) {
      console.error('Error sharing wallet:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
  
  /**
   * Unshare a wallet from a group
   */
  static async unshareWallet(
    groupId: string,
    request: UnshareWalletRequest
  ): Promise<GroupOperationResult> {
    try {
      console.log('🔍 Groups Debug: Unsharing wallet:', groupId, request);
      const response = await this.makeAuthenticatedRequest(
        `/groups/${groupId}/wallets`,
        'DELETE',
        request
      );
      
      return {
        success: response.success,
        error: response.error
      };
    } catch (error) {
      console.error('Error unsharing wallet:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
  
  /**
   * Get group activities
   */
  static async getGroupActivities(groupId: string): Promise<GroupActivity[]> {
    try {
      console.log('🔍 Groups Debug: Getting group activities:', groupId);
      const response = await this.makeAuthenticatedRequest(
        `/groups/${groupId}/activities`,
        'GET'
      );
      
      if (response.success && response.activities) {
        return response.activities;
      }
      
      throw new Error(response.error || 'Failed to fetch group activities');
    } catch (error) {
      console.error('Error fetching group activities:', error);
      throw error;
    }
  }

  /**
   * Utility method to get user display name (email or account ID)
   */
  static getUserDisplayName(member: GroupMember): string {
    return member.email || member.hederaAccountId || member.userId || 'Unknown User';
  }

  /**
   * Utility method to check if user has permission for an action
   */
  static canUserPerformAction(userRole: string, action: string): boolean {
    const permissions = {
      owner: ['create_group', 'update_group', 'delete_group', 'invite_members', 'remove_members', 'change_roles', 'share_wallets', 'unshare_wallets', 'view_all'],
      admin: ['update_group', 'invite_members', 'remove_members', 'change_roles', 'share_wallets', 'unshare_wallets', 'view_all'],
      editor: ['invite_members', 'share_wallets', 'view_all'],
      viewer: ['view_all']
    };

    return permissions[userRole as keyof typeof permissions]?.includes(action) || false;
  }
}