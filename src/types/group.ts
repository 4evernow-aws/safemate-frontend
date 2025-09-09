export interface Group {
  groupId: string;
  groupName: string;
  description: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  status: 'active' | 'inactive';
  userRole?: PermissionLevel;
  joinedAt?: string;
}

export interface GroupMember {
  groupId: string;
  userId: string;
  role: PermissionLevel;
  joinedAt: string;
  addedBy: string;
  status: 'active' | 'inactive';
}

export interface SharedWallet {
  groupId: string;
  walletId: string;
  sharedBy: string;
  sharedAt: string;
  permissions: WalletPermissions;
  status: 'active' | 'inactive';
}

export interface GroupActivity {
  groupId: string;
  activityId: string;
  userId: string;
  activityType: ActivityType;
  timestamp: string;
  details: any;
  expiresAt: number;
}

export interface WalletPermissions {
  view_balance: boolean;
  view_transactions: boolean;
  initiate_transactions: boolean;
  share_wallet?: boolean;
  manage_permissions?: boolean;
}

export interface GroupPermissions {
  groupId: string;
  resourceType: ResourceType;
  permissionLevel: PermissionLevel;
  permissions: WalletPermissions;
}

export type PermissionLevel = 'owner' | 'admin' | 'editor' | 'viewer';

export type ResourceType = 'wallet' | 'group' | 'activity';

export type ActivityType = 
  | 'group_created'
  | 'member_added'
  | 'member_removed'
  | 'wallet_shared'
  | 'wallet_unshared'
  | 'permission_changed'
  | 'role_changed';

export interface CreateGroupRequest {
  groupName: string;
  description?: string;
}

export interface CreateGroupResponse {
  success: boolean;
  group?: Group;
  error?: string;
}

export interface AddMemberRequest {
  userId: string;
  role: PermissionLevel;
}

export interface ShareWalletRequest {
  walletId: string;
  permissions?: WalletPermissions;
}

export interface GroupCollaborationStats {
  totalGroups: number;
  ownedGroups: number;
  memberGroups: number;
  sharedWallets: number;
  recentActivities: number;
}

export interface GroupInvitation {
  invitationId: string;
  groupId: string;
  groupName: string;
  invitedBy: string;
  invitedUser: string;
  role: PermissionLevel;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: string;
  expiresAt: string;
}

// Group creation states for UI
export type GroupCreationState = 
  | 'idle'
  | 'creating'
  | 'success'
  | 'error';

export interface GroupOperationStatus {
  state: GroupCreationState;
  progress: number; // 0-100
  message: string;
  error?: string;
}

export interface GroupCreationRequest {
  groupName: string;
  description?: string;
}

export interface GroupCreationResponse {
  success: boolean;
  group?: Group;
  error?: string;
}

export interface GroupOperationResult {
  success: boolean;
  error?: string;
}