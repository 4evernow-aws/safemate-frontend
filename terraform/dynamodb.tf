resource "aws_dynamodb_table" "user_secrets" {
  name           = "${local.name_prefix}-user-secrets"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "user_id"

  attribute {
    name = "user_id"
    type = "S"
  }

  server_side_encryption {
    enabled     = true
    kms_key_arn = aws_kms_key.safemate_master_key.arn
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Name        = "${local.name_prefix}-user-secrets"
    Environment = var.environment
  }
}

# Dedicated table for wallet private keys with enhanced security
resource "aws_dynamodb_table" "wallet_keys" {
  name           = "${local.name_prefix}-wallet-keys"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "user_id"

  attribute {
    name = "user_id"
    type = "S"
  }

  attribute {
    name = "wallet_type"
    type = "S"
  }

  # Global Secondary Index for wallet type queries
  global_secondary_index {
    name     = "WalletTypeIndex"
    hash_key = "wallet_type"
    projection_type = "ALL"
  }

  server_side_encryption {
    enabled     = true
    kms_key_arn = aws_kms_key.safemate_master_key.arn
  }

  point_in_time_recovery {
    enabled = true
  }

  # Enable DynamoDB Streams for audit trail
  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  # Table-level resource policy for additional security
  tags = {
    Name        = "${local.name_prefix}-wallet-keys"
    Environment = var.environment
    Purpose     = "wallet-private-keys"
    Compliance  = "high-security"
  }
}

# DynamoDB table for wallet metadata and public information
resource "aws_dynamodb_table" "wallet_metadata" {
  name           = "${local.name_prefix}-wallet-metadata"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "user_id"
  range_key      = "wallet_id"

  attribute {
    name = "user_id"
    type = "S"
  }

  attribute {
    name = "wallet_id"
    type = "S"
  }

  attribute {
    name = "hedera_account_id"
    type = "S"
  }

  attribute {
    name = "created_at"
    type = "S"
  }

  # Global Secondary Index for Hedera account lookups
  global_secondary_index {
    name     = "HederaAccountIndex"
    hash_key = "hedera_account_id"
    projection_type = "ALL"
  }

  # Global Secondary Index for time-based queries
  global_secondary_index {
    name     = "CreatedAtIndex"
    hash_key = "created_at"
    projection_type = "ALL"
  }

  server_side_encryption {
    enabled     = true
    kms_key_arn = aws_kms_key.safemate_master_key.arn
  }

  point_in_time_recovery {
    enabled = true
  }

  # TTL for automatic cleanup of old records if needed
  ttl {
    attribute_name = "expires_at"
    enabled        = false  # Can be enabled later if needed
  }

  tags = {
    Name        = "${local.name_prefix}-wallet-metadata"
    Environment = var.environment
    Purpose     = "wallet-metadata"
  }
}

# DynamoDB table for wallet operation audit logs
resource "aws_dynamodb_table" "wallet_audit" {
  name           = "${local.name_prefix}-wallet-audit"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "operation_id"
  range_key      = "timestamp"

  attribute {
    name = "operation_id"
    type = "S"
  }

  attribute {
    name = "timestamp"
    type = "S"
  }

  attribute {
    name = "user_id"
    type = "S"
  }

  attribute {
    name = "operation_type"
    type = "S"
  }

  # Global Secondary Index for user-based audit queries
  global_secondary_index {
    name     = "UserAuditIndex"
    hash_key = "user_id"
    range_key = "timestamp"
    projection_type = "ALL"
  }

  # Global Secondary Index for operation type queries
  global_secondary_index {
    name     = "OperationTypeIndex"
    hash_key = "operation_type"
    range_key = "timestamp"
    projection_type = "ALL"
  }

  server_side_encryption {
    enabled     = true
    kms_key_arn = aws_kms_key.safemate_master_key.arn
  }

  point_in_time_recovery {
    enabled = true
  }

  # TTL for automatic cleanup of old audit logs (retain for 7 years for compliance)
  ttl {
    attribute_name = "expires_at"
    enabled        = true
  }

  tags = {
    Name        = "${local.name_prefix}-wallet-audit"
    Environment = var.environment
    Purpose     = "audit-trail"
    Compliance  = "audit-logging"
  }
}

# =======================
# GROUP MANAGEMENT TABLES
# =======================

# Groups table for team/organization management
resource "aws_dynamodb_table" "groups" {
  name           = "${local.name_prefix}-groups"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "group_id"

  attribute {
    name = "group_id"
    type = "S"
  }

  attribute {
    name = "owner_id"
    type = "S"
  }

  attribute {
    name = "group_name"
    type = "S"
  }

  attribute {
    name = "created_at"
    type = "S"
  }

  # Global Secondary Index for owner-based queries
  global_secondary_index {
    name     = "OwnerIndex"
    hash_key = "owner_id"
    range_key = "created_at"
    projection_type = "ALL"
  }

  # Global Secondary Index for group name searches
  global_secondary_index {
    name     = "GroupNameIndex"
    hash_key = "group_name"
    projection_type = "ALL"
  }

  server_side_encryption {
    enabled     = true
    kms_key_arn = aws_kms_key.safemate_master_key.arn
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Name        = "${local.name_prefix}-groups"
    Environment = var.environment
    Purpose     = "group-management"
  }
}

# Group memberships table
resource "aws_dynamodb_table" "group_memberships" {
  name           = "${local.name_prefix}-group-memberships"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "group_id"
  range_key      = "user_id"

  attribute {
    name = "group_id"
    type = "S"
  }

  attribute {
    name = "user_id"
    type = "S"
  }

  attribute {
    name = "role"
    type = "S"
  }

  attribute {
    name = "joined_at"
    type = "S"
  }

  # Global Secondary Index for user-based queries
  global_secondary_index {
    name     = "UserGroupsIndex"
    hash_key = "user_id"
    range_key = "joined_at"
    projection_type = "ALL"
  }

  # Global Secondary Index for role-based queries
  global_secondary_index {
    name     = "RoleIndex"
    hash_key = "role"
    range_key = "joined_at"
    projection_type = "ALL"
  }

  server_side_encryption {
    enabled     = true
    kms_key_arn = aws_kms_key.safemate_master_key.arn
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Name        = "${local.name_prefix}-group-memberships"
    Environment = var.environment
    Purpose     = "group-memberships"
  }
}

# Group permissions table
resource "aws_dynamodb_table" "group_permissions" {
  name           = "${local.name_prefix}-group-permissions"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "group_id"
  range_key      = "resource_type"

  attribute {
    name = "group_id"
    type = "S"
  }

  attribute {
    name = "resource_type"
    type = "S"
  }

  attribute {
    name = "permission_level"
    type = "S"
  }

  # Global Secondary Index for permission-based queries
  global_secondary_index {
    name     = "PermissionIndex"
    hash_key = "permission_level"
    range_key = "resource_type"
    projection_type = "ALL"
  }

  server_side_encryption {
    enabled     = true
    kms_key_arn = aws_kms_key.safemate_master_key.arn
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Name        = "${local.name_prefix}-group-permissions"
    Environment = var.environment
    Purpose     = "group-permissions"
  }
}

# Shared wallets table for group collaboration
resource "aws_dynamodb_table" "shared_wallets" {
  name           = "${local.name_prefix}-shared-wallets"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "group_id"
  range_key      = "wallet_id"

  attribute {
    name = "group_id"
    type = "S"
  }

  attribute {
    name = "wallet_id"
    type = "S"
  }

  attribute {
    name = "shared_by"
    type = "S"
  }

  attribute {
    name = "shared_at"
    type = "S"
  }

  # Global Secondary Index for wallet-based queries
  global_secondary_index {
    name     = "WalletSharesIndex"
    hash_key = "wallet_id"
    range_key = "shared_at"
    projection_type = "ALL"
  }

  # Global Secondary Index for user-based queries
  global_secondary_index {
    name     = "UserSharesIndex"
    hash_key = "shared_by"
    range_key = "shared_at"
    projection_type = "ALL"
  }

  server_side_encryption {
    enabled     = true
    kms_key_arn = aws_kms_key.safemate_master_key.arn
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Name        = "${local.name_prefix}-shared-wallets"
    Environment = var.environment
    Purpose     = "shared-wallets"
  }
}

# Group activities table for collaboration tracking
resource "aws_dynamodb_table" "group_activities" {
  name           = "${local.name_prefix}-group-activities"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "group_id"
  range_key      = "activity_id"

  attribute {
    name = "group_id"
    type = "S"
  }

  attribute {
    name = "activity_id"
    type = "S"
  }

  attribute {
    name = "user_id"
    type = "S"
  }

  attribute {
    name = "activity_type"
    type = "S"
  }

  attribute {
    name = "timestamp"
    type = "S"
  }

  # Global Secondary Index for user activity queries
  global_secondary_index {
    name     = "UserActivityIndex"
    hash_key = "user_id"
    range_key = "timestamp"
    projection_type = "ALL"
  }

  # Global Secondary Index for activity type queries
  global_secondary_index {
    name     = "ActivityTypeIndex"
    hash_key = "activity_type"
    range_key = "timestamp"
    projection_type = "ALL"
  }

  server_side_encryption {
    enabled     = true
    kms_key_arn = aws_kms_key.safemate_master_key.arn
  }

  point_in_time_recovery {
    enabled = true
  }

  # TTL for automatic cleanup of old activities
  ttl {
    attribute_name = "expires_at"
    enabled        = true
  }

  tags = {
    Name        = "${local.name_prefix}-group-activities"
    Environment = var.environment
    Purpose     = "collaboration-tracking"
  }
}

# DynamoDB table for storing hedera folders metadata
resource "aws_dynamodb_table" "hedera_folders" {
  name           = "${local.name_prefix}-hedera-folders"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "folderId"

  attribute {
    name = "folderId"
    type = "S"
  }

  attribute {
    name = "userId"
    type = "S"
  }

  global_secondary_index {
    name               = "UserIdIndex"
    hash_key           = "userId"
    projection_type    = "ALL"
  }

  tags = {
    Environment = var.environment
    Application = var.app_name
    Component   = "folders"
    Purpose     = "folder-metadata"
  }
}

# DynamoDB table for SafeMate directories
resource "aws_dynamodb_table" "safemate_directories" {
  name           = "${local.name_prefix}-directories"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "user_id"

  attribute {
    name = "user_id"
    type = "S"
  }

  attribute {
    name = "hedera_account_id"
    type = "S"
  }

  attribute {
    name = "directory_token_id"
    type = "S"
  }

  # GSI for querying by Hedera account
  global_secondary_index {
    name               = "HederaAccountIndex"
    hash_key           = "hedera_account_id"
    projection_type    = "ALL"
  }

  # GSI for querying by token ID
  global_secondary_index {
    name               = "TokenIndex"
    hash_key           = "directory_token_id"
    projection_type    = "ALL"
  }

  server_side_encryption {
    enabled     = true
    kms_key_arn = aws_kms_key.safemate_master_key.arn
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Environment = var.environment
    Application = var.app_name
    Component   = "directories"
    Purpose     = "user-directory-nft"
  }
}

# DynamoDB table for user notifications
resource "aws_dynamodb_table" "user_notifications" {
  name           = "${local.name_prefix}-user-notifications"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "userId"
  range_key      = "notificationId"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "notificationId"
    type = "S"
  }

  attribute {
    name = "timestamp"
    type = "S"
  }

  # GSI for querying notifications by timestamp
  global_secondary_index {
    name               = "NotificationTimestampIndex"
    hash_key           = "userId"
    range_key          = "timestamp"
    projection_type    = "ALL"
  }

  # TTL attribute for auto-deletion of old notifications (after 30 days)
  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }

  server_side_encryption {
    enabled     = true
    kms_key_arn = aws_kms_key.safemate_master_key.arn
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Environment = var.environment
    Application = var.app_name
    Purpose     = "user-notifications"
  }
}

# Group invitations table for invitation management
resource "aws_dynamodb_table" "group_invitations" {
  name           = "${local.name_prefix}-group-invitations"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "invitation_id"

  attribute {
    name = "invitation_id"
    type = "S"
  }

  attribute {
    name = "group_id"
    type = "S"
  }

  attribute {
    name = "invitee_user_id"
    type = "S"
  }

  attribute {
    name = "inviter_user_id"
    type = "S"
  }

  attribute {
    name = "status"
    type = "S"
  }

  attribute {
    name = "created_at"
    type = "S"
  }

  # GSI for querying invitations by group
  global_secondary_index {
    name               = "GroupInvitationsIndex"
    hash_key           = "group_id"
    range_key          = "created_at"
    projection_type    = "ALL"
  }

  # GSI for querying invitations by invitee
  global_secondary_index {
    name               = "InviteeInvitationsIndex"
    hash_key           = "invitee_user_id"
    range_key          = "created_at"
    projection_type    = "ALL"
  }

  # GSI for querying invitations by inviter
  global_secondary_index {
    name               = "InviterInvitationsIndex"
    hash_key           = "inviter_user_id"
    range_key          = "created_at"
    projection_type    = "ALL"
  }

  # GSI for querying invitations by status
  global_secondary_index {
    name               = "StatusInvitationsIndex"
    hash_key           = "status"
    range_key          = "created_at"
    projection_type    = "ALL"
  }

  # TTL for automatic cleanup of old invitations (after 30 days)
  ttl {
    attribute_name = "expires_at"
    enabled        = true
  }

  server_side_encryption {
    enabled     = true
    kms_key_arn = aws_kms_key.safemate_master_key.arn
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Environment = var.environment
    Application = var.app_name
    Purpose     = "group-invitations"
  }
}

# User profiles table for storing user information and account mappings
resource "aws_dynamodb_table" "user_profiles" {
  name           = "${local.name_prefix}-user-profiles"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "user_id"

  attribute {
    name = "user_id"
    type = "S"
  }

  attribute {
    name = "email"
    type = "S"
  }

  attribute {
    name = "hedera_account_id"
    type = "S"
  }

  # GSI for querying users by email
  global_secondary_index {
    name               = "EmailIndex"
    hash_key           = "email"
    projection_type    = "ALL"
  }

  # GSI for querying users by Hedera account ID
  global_secondary_index {
    name               = "HederaAccountIndex"
    hash_key           = "hedera_account_id"
    projection_type    = "ALL"
  }

  server_side_encryption {
    enabled     = true
    kms_key_arn = aws_kms_key.safemate_master_key.arn
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Environment = var.environment
    Application = var.app_name
    Purpose     = "user-profiles"
  }
}

# DynamoDB table for wallet management 
