/**
 * SafeMate v2 - IAM Roles and Policies
 *
 * This file configures IAM roles and policies for Lambda functions and Cognito groups.
 * ECS-related roles have been removed as we're using S3 static hosting.
 *
 * @version 2.2.0
 * @author SafeMate Development Team
 * @lastUpdated 2025-01-01
 * @environment Pre-production (preprod)
 * @awsRegion ap-southeast-2
 */

# Token Vault Permissions Policy
resource "aws_iam_policy" "vault_permissions" {
  name        = "${local.name_prefix}-vault-permissions"
  description = "Permissions for Token Vault service"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:Encrypt",
          "kms:GenerateDataKey",
          "kms:DescribeKey"
        ]
        Resource = aws_kms_key.safemate_master_key.arn
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem"
        ]
        Resource = aws_dynamodb_table.user_secrets.arn
      }
    ]
  })
}

# =======================
# WALLET MANAGEMENT ROLES
# =======================

# Wallet Lambda execution role
resource "aws_iam_role" "wallet_lambda_exec" {
  name = "${local.name_prefix}-wallet-lambda-exec"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Environment = var.environment
    Application = var.app_name
    Component   = "wallet-management"
  }
}

# Wallet key management permissions
resource "aws_iam_policy" "wallet_key_permissions" {
  name        = "${local.name_prefix}-wallet-key-permissions"
  description = "Permissions for Wallet Key management operations"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "WalletKMSAccess"
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:Encrypt",
          "kms:GenerateDataKey",
          "kms:DescribeKey",
          "kms:ReEncrypt*"
        ]
        Resource = [
          aws_kms_key.safemate_master_key.arn,
          aws_kms_key.safemate_master_key.arn
        ]
      },
      {
        Sid    = "WalletDynamoDBAccess"
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [
          aws_dynamodb_table.wallet_keys.arn,
          aws_dynamodb_table.wallet_metadata.arn,
          "${aws_dynamodb_table.wallet_keys.arn}/index/*",
          "${aws_dynamodb_table.wallet_metadata.arn}/index/*"
        ]
        Condition = {
          "ForAllValues:StringEquals" = {
            "dynamodb:Attributes" = [
              "user_id",
              "wallet_id",
              "wallet_type",
              "encrypted_private_key",
              "public_key",
              "hedera_account_id",
              "created_at",
              "updated_at",
              "status",
              "balance",
              "last_activity"
            ]
          }
        }
      },
      {
        Sid    = "WalletAuditLogging"
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:Query"
        ]
        Resource = [
          aws_dynamodb_table.wallet_audit.arn,
          "${aws_dynamodb_table.wallet_audit.arn}/index/*"
        ]
      },
      {
        Sid    = "CognitoUserAttributeUpdate"
        Effect = "Allow"
        Action = [
          "cognito-idp:AdminGetUser",
          "cognito-idp:AdminUpdateUserAttributes"
        ]
        Resource = aws_cognito_user_pool.app_pool_v3.arn
        Condition = {
          StringEquals = {
            "cognito-idp:username" = "$${aws:userid}"
          }
        }
      }
    ]
  })
}

# Wallet transaction signing permissions (restricted)
resource "aws_iam_policy" "wallet_signing_permissions" {
  name        = "${local.name_prefix}-wallet-signing-permissions"
  description = "Restricted permissions for wallet transaction signing"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "RestrictedWalletKeyAccess"
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:DescribeKey"
        ]
        Resource = aws_kms_key.safemate_master_key.arn
        Condition = {
          StringEquals = {
            "kms:ViaService" = "dynamodb.${var.region}.amazonaws.com"
          }
          StringLike = {
            "kms:EncryptionContext:purpose" = "wallet-signing"
          }
        }
      },
      {
        Sid    = "RestrictedWalletKeyRead"
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem"
        ]
        Resource = aws_dynamodb_table.wallet_keys.arn
        Condition = {
          "ForAllValues:StringEquals" = {
            "dynamodb:Attributes" = [
              "user_id",
              "encrypted_private_key"
            ]
          }
        }
      },
      {
        Sid    = "TransactionAuditLogging"
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem"
        ]
        Resource = aws_dynamodb_table.wallet_audit.arn
      }
    ]
  })
}

# Wallet Lambda logging policy
resource "aws_iam_policy" "wallet_lambda_logging" {
  name        = "${local.name_prefix}-wallet-lambda-logging"
  description = "IAM policy for wallet lambda logging"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

# Wallet operator role (for Hedera account creation operations)
resource "aws_iam_role" "wallet_operator" {
  name = "${local.name_prefix}-wallet-operator"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Environment = var.environment
    Application = var.app_name
    Component   = "hedera-operator"
  }
}

# Hedera operator permissions
resource "aws_iam_policy" "hedera_operator_permissions" {
  name        = "${local.name_prefix}-hedera-operator-permissions"
  description = "Permissions for Hedera operator account operations"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "HederaOperatorSecrets"
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:DescribeKey"
        ]
        Resource = aws_kms_key.safemate_master_key.arn
      },
      {
        Sid    = "HederaOperatorSecretsAccess"
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem"
        ]
        Resource = aws_dynamodb_table.user_secrets.arn
        Condition = {
          "ForAllValues:StringEquals" = {
            "dynamodb:Attributes" = [
              "user_id",
              "hedera_operator_id",
              "hedera_operator_key"
            ]
          }
        }
      },
      {
        Sid    = "HederaFoldersAccess"
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Scan",
          "dynamodb:Query"
        ]
        Resource = [
          aws_dynamodb_table.hedera_folders.arn,
          "${aws_dynamodb_table.hedera_folders.arn}/*"
        ]
      },
      {
        Sid    = "HederaRelatedTables"
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Scan",
          "dynamodb:Query"
        ]
        Resource = [
          aws_dynamodb_table.groups.arn,
          "${aws_dynamodb_table.groups.arn}/*",
          aws_dynamodb_table.group_activities.arn,
          "${aws_dynamodb_table.group_activities.arn}/*",
          aws_dynamodb_table.shared_wallets.arn,
          "${aws_dynamodb_table.shared_wallets.arn}/*",
          aws_dynamodb_table.wallet_audit.arn,
          "${aws_dynamodb_table.wallet_audit.arn}/*",
          aws_dynamodb_table.wallet_keys.arn,
          "${aws_dynamodb_table.wallet_keys.arn}/*",
          aws_dynamodb_table.wallet_metadata.arn,
          "${aws_dynamodb_table.wallet_metadata.arn}/*"
        ]
      }
    ]
  })
}

# Role policy attachments
resource "aws_iam_role_policy_attachment" "wallet_lambda_logs" {
  role       = aws_iam_role.wallet_lambda_exec.name
  policy_arn = aws_iam_policy.wallet_lambda_logging.arn
}

resource "aws_iam_role_policy_attachment" "wallet_lambda_key_permissions" {
  role       = aws_iam_role.wallet_lambda_exec.name
  policy_arn = aws_iam_policy.wallet_key_permissions.arn
}

resource "aws_iam_role_policy_attachment" "wallet_operator_logs" {
  role       = aws_iam_role.wallet_operator.name
  policy_arn = aws_iam_policy.wallet_lambda_logging.arn
}

resource "aws_iam_role_policy_attachment" "wallet_operator_permissions" {
  role       = aws_iam_role.wallet_operator.name
  policy_arn = aws_iam_policy.hedera_operator_permissions.arn
}

# =======================
# GROUP MANAGEMENT ROLES
# =======================

# Admin role for Cognito group
resource "aws_iam_role" "group_admin_role" {
  name = "${local.name_prefix}-group-admin-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = "cognito-identity.amazonaws.com"
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "cognito-identity.amazonaws.com:aud" = aws_cognito_identity_pool.main.id
          }
          "ForAnyValue:StringLike" = {
            "cognito-identity.amazonaws.com:amr" = "authenticated"
          }
        }
      }
    ]
  })

  tags = {
    Environment = var.environment
    Application = var.app_name
    Role        = "admin"
  }
}

# Team Owner role for Cognito group
resource "aws_iam_role" "group_team_owner_role" {
  name = "${local.name_prefix}-group-team-owner-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = "cognito-identity.amazonaws.com"
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "cognito-identity.amazonaws.com:aud" = aws_cognito_identity_pool.main.id
          }
          "ForAnyValue:StringLike" = {
            "cognito-identity.amazonaws.com:amr" = "authenticated"
          }
        }
      }
    ]
  })

  tags = {
    Environment = var.environment
    Application = var.app_name
    Role        = "team-owner"
  }
}

# Team Member role for Cognito group
resource "aws_iam_role" "group_team_member_role" {
  name = "${local.name_prefix}-group-team-member-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = "cognito-identity.amazonaws.com"
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "cognito-identity.amazonaws.com:aud" = aws_cognito_identity_pool.main.id
          }
          "ForAnyValue:StringLike" = {
            "cognito-identity.amazonaws.com:amr" = "authenticated"
          }
        }
      }
    ]
  })

  tags = {
    Environment = var.environment
    Application = var.app_name
    Role        = "team-member"
  }
}

# Individual User role for Cognito group
resource "aws_iam_role" "group_individual_user_role" {
  name = "${local.name_prefix}-group-individual-user-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = "cognito-identity.amazonaws.com"
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "cognito-identity.amazonaws.com:aud" = aws_cognito_identity_pool.main.id
          }
          "ForAnyValue:StringLike" = {
            "cognito-identity.amazonaws.com:amr" = "authenticated"
          }
        }
      }
    ]
  })

  tags = {
    Environment = var.environment
    Application = var.app_name
    Role        = "individual-user"
  }
}

# Group Management Lambda execution role
resource "aws_iam_role" "group_lambda_exec" {
  name = "${local.name_prefix}-group-lambda-exec"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Environment = var.environment
    Application = var.app_name
    Component   = "group-management"
  }
}

# =======================
# GROUP MANAGEMENT POLICIES
# =======================

# Admin permissions policy
resource "aws_iam_policy" "group_admin_permissions" {
  name        = "${local.name_prefix}-group-admin-permissions"
  description = "Full administrative permissions for group admins"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "FullGroupManagement"
        Effect = "Allow"
        Action = [
          "dynamodb:*"
        ]
        Resource = [
          aws_dynamodb_table.groups.arn,
          aws_dynamodb_table.group_memberships.arn,
          aws_dynamodb_table.group_permissions.arn,
          aws_dynamodb_table.shared_wallets.arn,
          "${aws_dynamodb_table.groups.arn}/index/*",
          "${aws_dynamodb_table.group_memberships.arn}/index/*",
          "${aws_dynamodb_table.group_permissions.arn}/index/*",
          "${aws_dynamodb_table.shared_wallets.arn}/index/*"
        ]
      },
      {
        Sid    = "CognitoGroupManagement"
        Effect = "Allow"
        Action = [
          "cognito-idp:AdminAddUserToGroup",
          "cognito-idp:AdminRemoveUserFromGroup",
          "cognito-idp:AdminListGroupsForUser",
          "cognito-idp:ListUsersInGroup"
        ]
        Resource = aws_cognito_user_pool.app_pool_v3.arn
      },
      {
        Sid    = "WalletReadAccess"
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [
          aws_dynamodb_table.wallet_metadata.arn,
          "${aws_dynamodb_table.wallet_metadata.arn}/index/*"
        ]
      }
    ]
  })
}

# Team Owner permissions policy
resource "aws_iam_policy" "group_team_owner_permissions" {
  name        = "${local.name_prefix}-group-team-owner-permissions"
  description = "Team owner permissions for group management"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "TeamManagement"
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query"
        ]
        Resource = [
          aws_dynamodb_table.groups.arn,
          aws_dynamodb_table.group_memberships.arn,
          aws_dynamodb_table.group_permissions.arn,
          aws_dynamodb_table.shared_wallets.arn,
          "${aws_dynamodb_table.groups.arn}/index/*",
          "${aws_dynamodb_table.group_memberships.arn}/index/*",
          "${aws_dynamodb_table.group_permissions.arn}/index/*",
          "${aws_dynamodb_table.shared_wallets.arn}/index/*"
        ]
        Condition = {
          StringEquals = {
            "dynamodb:Attributes" = [
              "group_id",
              "group_name",
              "owner_id",
              "user_id",
              "role",
              "permissions",
              "wallet_id",
              "created_at",
              "updated_at"
            ]
          }
        }
      },
      {
        Sid    = "OwnedGroupsOnly"
        Effect = "Allow"
        Action = [
          "dynamodb:Query"
        ]
        Resource = [
          aws_dynamodb_table.groups.arn,
          "${aws_dynamodb_table.groups.arn}/index/*"
        ]
        Condition = {
          "ForAllValues:StringEquals" = {
            "dynamodb:Attributes" = ["owner_id"]
          }
          StringEquals = {
            "dynamodb:Select" = "SpecificAttributes"
          }
        }
      }
    ]
  })
}

# Team Member permissions policy
resource "aws_iam_policy" "group_team_member_permissions" {
  name        = "${local.name_prefix}-group-team-member-permissions"
  description = "Team member permissions for group collaboration"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "ReadGroupMembership"
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:Query"
        ]
        Resource = [
          aws_dynamodb_table.groups.arn,
          aws_dynamodb_table.group_memberships.arn,
          aws_dynamodb_table.shared_wallets.arn,
          "${aws_dynamodb_table.groups.arn}/index/*",
          "${aws_dynamodb_table.group_memberships.arn}/index/*",
          "${aws_dynamodb_table.shared_wallets.arn}/index/*"
        ]
      },
      {
        Sid    = "ReadSharedWallets"
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:Query"
        ]
        Resource = [
          aws_dynamodb_table.wallet_metadata.arn,
          "${aws_dynamodb_table.wallet_metadata.arn}/index/*"
        ]
      }
    ]
  })
}

# Individual User permissions policy
resource "aws_iam_policy" "group_individual_user_permissions" {
  name        = "${local.name_prefix}-group-individual-user-permissions"
  description = "Individual user permissions for personal wallet access"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "PersonalWalletAccess"
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem"
        ]
        Resource = [
          aws_dynamodb_table.wallet_metadata.arn
        ]
        Condition = {
          "ForAllValues:StringEquals" = {
            "dynamodb:Attributes" = [
              "user_id",
              "wallet_id",
              "hedera_account_id",
              "public_key",
              "balance",
              "last_activity"
            ]
          }
        }
      }
    ]
  })
}

# Group Management Lambda permissions
resource "aws_iam_policy" "group_lambda_permissions" {
  name        = "${local.name_prefix}-group-lambda-permissions"
  description = "Permissions for Group Management Lambda functions"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "GroupDynamoDBAccess"
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [
          aws_dynamodb_table.groups.arn,
          aws_dynamodb_table.group_memberships.arn,
          aws_dynamodb_table.group_permissions.arn,
          aws_dynamodb_table.shared_wallets.arn,
          aws_dynamodb_table.group_activities.arn,
          aws_dynamodb_table.user_notifications.arn,
          aws_dynamodb_table.group_invitations.arn,
          aws_dynamodb_table.user_profiles.arn,
          "${aws_dynamodb_table.groups.arn}/index/*",
          "${aws_dynamodb_table.group_memberships.arn}/index/*",
          "${aws_dynamodb_table.group_permissions.arn}/index/*",
          "${aws_dynamodb_table.shared_wallets.arn}/index/*",
          "${aws_dynamodb_table.group_activities.arn}/index/*",
          "${aws_dynamodb_table.user_notifications.arn}/index/*",
          "${aws_dynamodb_table.group_invitations.arn}/index/*",
          "${aws_dynamodb_table.user_profiles.arn}/index/*"
        ]
      },
      {
        Sid    = "CognitoGroupOperations"
        Effect = "Allow"
        Action = [
          "cognito-idp:AdminAddUserToGroup",
          "cognito-idp:AdminRemoveUserFromGroup",
          "cognito-idp:AdminListGroupsForUser",
          "cognito-idp:ListUsersInGroup",
          "cognito-idp:AdminGetUser"
        ]
        Resource = aws_cognito_user_pool.app_pool_v3.arn
      },
      {
        Sid    = "WalletMetadataAccess"
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:UpdateItem",
          "dynamodb:Query"
        ]
        Resource = [
          aws_dynamodb_table.wallet_metadata.arn,
          "${aws_dynamodb_table.wallet_metadata.arn}/index/*"
        ]
      },
      {
        Sid    = "AppSecretsKMSAccess"
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:Encrypt",
          "kms:GenerateDataKey",
          "kms:DescribeKey"
        ]
        Resource = aws_kms_key.safemate_master_key.arn
      }
    ]
  })
}

# Group Lambda logging policy
resource "aws_iam_policy" "group_lambda_logging" {
  name        = "${local.name_prefix}-group-lambda-logging"
  description = "IAM policy for group lambda logging"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

# =======================
# ROLE POLICY ATTACHMENTS
# =======================

# Admin role policy attachments
resource "aws_iam_role_policy_attachment" "group_admin_permissions" {
  role       = aws_iam_role.group_admin_role.name
  policy_arn = aws_iam_policy.group_admin_permissions.arn
}

# Team Owner role policy attachments
resource "aws_iam_role_policy_attachment" "group_team_owner_permissions" {
  role       = aws_iam_role.group_team_owner_role.name
  policy_arn = aws_iam_policy.group_team_owner_permissions.arn
}

# Team Member role policy attachments
resource "aws_iam_role_policy_attachment" "group_team_member_permissions" {
  role       = aws_iam_role.group_team_member_role.name
  policy_arn = aws_iam_policy.group_team_member_permissions.arn
}

# Individual User role policy attachments
resource "aws_iam_role_policy_attachment" "group_individual_user_permissions" {
  role       = aws_iam_role.group_individual_user_role.name
  policy_arn = aws_iam_policy.group_individual_user_permissions.arn
}

# Group Lambda role policy attachments
resource "aws_iam_role_policy_attachment" "group_lambda_logs" {
  role       = aws_iam_role.group_lambda_exec.name
  policy_arn = aws_iam_policy.group_lambda_logging.arn
}

resource "aws_iam_role_policy_attachment" "group_lambda_permissions" {
  role       = aws_iam_role.group_lambda_exec.name
  policy_arn = aws_iam_policy.group_lambda_permissions.arn
} 
