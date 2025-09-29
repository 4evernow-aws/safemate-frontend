# Lambda layer for Hedera SDK dependencies
resource "aws_lambda_layer_version" "hedera_dependencies_layer" {
  filename         = "lambda-layer/hedera-layer.zip"
  layer_name       = "${local.name_prefix}-hedera-dependencies"
  description      = "Layer containing Hedera SDK and AWS SDK dependencies - Minimal essential dependencies - Updated 20250922"
  source_code_hash = filebase64sha256("lambda-layer/hedera-layer.zip")

  compatible_runtimes = ["nodejs18.x"]

  lifecycle {
    create_before_destroy = true
  }
}

# Token Vault Lambda Function
resource "aws_lambda_function" "token_vault" {
  filename         = "services/token-vault/token-vault.zip"
  function_name    = "${local.name_prefix}-token-vault"
  role            = aws_iam_role.vault_lambda_exec.arn
  handler         = "index.handler"
  source_code_hash = filebase64sha256("services/token-vault/token-vault.zip")
  runtime         = "nodejs18.x"
  timeout         = 30
  
  # Temporarily removed layers due to size constraints
  # layers = [
  #   aws_lambda_layer_version.safemate_dependencies_layer.arn
  # ]

  environment {
    variables = {
      USER_SECRETS_TABLE     = aws_dynamodb_table.user_secrets.name
      WALLET_KEYS_TABLE      = aws_dynamodb_table.wallet_keys.name
      WALLET_METADATA_TABLE  = aws_dynamodb_table.wallet_metadata.name
      TOKEN_VAULT_KMS_KEY_ID = aws_kms_key.safemate_master_key.key_id
      APP_SECRETS_KMS_KEY_ID = aws_kms_key.safemate_master_key.key_id
      HEDERA_NETWORK         = "testnet"
    }
  }

  tags = {
    Environment = var.environment
    Application = var.app_name
    Component   = "token-vault"
  }

  depends_on = [
    aws_iam_role_policy_attachment.vault_lambda_logs,
    aws_cloudwatch_log_group.vault_lambda_logs,
  ]
}

# Hedera Service Lambda Function (Comprehensive blockchain operations)
# Hedera Service Lambda Function (Comprehensive blockchain operations)
resource "aws_lambda_function" "hedera_service" {
  s3_bucket       = aws_s3_bucket.static_hosting.bucket
  s3_key          = "lambda-packages/hedera-service-treasury-fix-v20.zip"
  function_name    = "${local.name_prefix}-hedera-service"
  role            = aws_iam_role.hedera_lambda_exec.arn
  handler         = "index.handler"
  source_code_hash = filebase64sha256("services/hedera-service/hedera-service-treasury-fix-v20.zip")
  runtime         = "nodejs18.x"
  timeout         = 90  # Longer timeout for complex blockchain operations
  memory_size     = 1024  # Increased memory for Hedera SDK operations
  
  # No layers needed - Hedera SDK included in package
  # layers = [
  #   aws_lambda_layer_version.hedera_dependencies_layer.arn
  # ]
  
  # Force new deployment
  description = "Hedera Service Lambda - Treasury Fix v20 (Fixed NFT Ownership Detection + Dependencies)"

  environment {
    variables = {
      USER_SECRETS_TABLE         = aws_dynamodb_table.user_secrets.name
      WALLET_KEYS_TABLE          = aws_dynamodb_table.wallet_keys.name
      WALLET_METADATA_TABLE      = aws_dynamodb_table.wallet_metadata.name
      WALLET_AUDIT_TABLE         = aws_dynamodb_table.wallet_audit.name
      HEDERA_TOKENS_TABLE        = aws_dynamodb_table.groups.name  # Reuse groups table for tokens
      HEDERA_NFTS_TABLE          = aws_dynamodb_table.group_activities.name  # Reuse activities table for NFTs
      SAFEMATE_FOLDERS_TABLE     = aws_dynamodb_table.hedera_folders.name
      HEDERA_CONTRACTS_TABLE     = aws_dynamodb_table.shared_wallets.name  # Reuse shared wallets for contracts
      BLOCKCHAIN_AUDIT_TABLE     = aws_dynamodb_table.wallet_audit.name
      WALLET_KMS_KEY_ID          = aws_kms_key.safemate_master_key.key_id
      APP_SECRETS_KMS_KEY_ID     = aws_kms_key.safemate_master_key.key_id
      COGNITO_USER_POOL_ID       = aws_cognito_user_pool.app_pool_v3.id
      HEDERA_NETWORK             = "testnet"
    }
  }

  tags = {
    Environment = var.environment
    Application = var.app_name
    Component   = "hedera-service"
  }

  depends_on = [
    aws_iam_role_policy_attachment.hedera_lambda_logs,
    aws_iam_role_policy_attachment.hedera_lambda_permissions,
    aws_cloudwatch_log_group.hedera_lambda_logs,
  ]
}

# Wallet Manager Lambda Function
resource "aws_lambda_function" "wallet_manager" {
  filename         = "services/wallet-manager/wallet-manager.zip"
  function_name    = "${local.name_prefix}-wallet-manager"
  role            = aws_iam_role.wallet_lambda_exec.arn
  handler         = "index.handler"
  source_code_hash = filebase64sha256("services/wallet-manager/wallet-manager.zip")
  runtime         = "nodejs18.x"
  timeout         = 60  # Longer timeout for Hedera operations
  
  # Temporarily removed layers due to size constraints
  # layers = [
  #   aws_lambda_layer_version.safemate_dependencies_layer.arn
  # ]

  environment {
    variables = {
      WALLET_KEYS_TABLE     = aws_dynamodb_table.wallet_keys.name
      WALLET_METADATA_TABLE = aws_dynamodb_table.wallet_metadata.name
      WALLET_AUDIT_TABLE    = aws_dynamodb_table.wallet_audit.name
      USER_SECRETS_TABLE    = aws_dynamodb_table.user_secrets.name
      WALLET_KMS_KEY_ID     = aws_kms_key.safemate_master_key.key_id
      APP_SECRETS_KMS_KEY_ID = aws_kms_key.safemate_master_key.key_id
      COGNITO_USER_POOL_ID  = aws_cognito_user_pool.app_pool_v3.id
      HEDERA_NETWORK        = "testnet"
    }
  }

  tags = {
    Environment = var.environment
    Application = var.app_name
    Component   = "wallet-manager"
  }

  depends_on = [
    aws_iam_role_policy_attachment.wallet_lambda_logs,
    aws_iam_role_policy_attachment.wallet_lambda_key_permissions,
    aws_cloudwatch_log_group.wallet_lambda_logs,
  ]
}

# User Onboarding Lambda Function
resource "aws_lambda_function" "user_onboarding" {
  s3_bucket        = "safemate-lambda-deployments"
  s3_key          = "user-onboarding.zip"
  function_name    = "${local.name_prefix}-user-onboarding"
  role            = aws_iam_role.user_onboarding_lambda_exec.arn
  handler         = "index.handler"
  source_code_hash = filebase64sha256("services/user-onboarding/user-onboarding.zip")
  runtime         = "nodejs18.x"
  timeout         = 90
  memory_size     = 512
  
  # Hedera SDK dependencies included directly in package (no layer needed)
  # layers = ["arn:aws:lambda:ap-southeast-2:994220462693:layer:hedera-sdk-layer:1"]

  environment {
    variables = {
      HEDERA_NETWORK                    = var.hedera_network
      WALLET_KEYS_TABLE                 = aws_dynamodb_table.wallet_keys.name
      WALLET_METADATA_TABLE             = aws_dynamodb_table.wallet_metadata.name
      WALLET_KMS_KEY_ID                 = aws_kms_key.safemate_master_key.arn
      APP_SECRETS_KMS_KEY_ID            = aws_kms_key.safemate_master_key.arn
      OPERATOR_PRIVATE_KEY_KMS_KEY_ID   = aws_kms_key.safemate_master_key.arn
      OPERATOR_ACCOUNT_ID               = "0.0.6428427"
      OPERATOR_PRIVATE_KEY_ENCRYPTED    = "PLACEHOLDER_ENCRYPTED_PRIVATE_KEY"
      COGNITO_USER_POOL_ID              = aws_cognito_user_pool.app_pool_v3.id
      REGION                            = data.aws_region.current.name
    }
  }

  tags = {
    Environment = var.environment
    Application = var.app_name
    Component   = "user-onboarding"
  }

  depends_on = [
    aws_iam_role_policy_attachment.user_onboarding_lambda_logs,
    aws_iam_role_policy_attachment.user_onboarding_lambda_permissions,
    aws_cloudwatch_log_group.user_onboarding_lambda_logs,
  ]
}

# Directory Creator Lambda execution role
resource "aws_iam_role" "directory_creator_lambda_exec" {
  name = "${local.name_prefix}-directory-creator-lambda-exec"

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
    Component   = "directory-creator"
  }
}

# Directory Creator Lambda logging policy
resource "aws_iam_policy" "directory_creator_lambda_logging" {
  name        = "${local.name_prefix}-directory-creator-lambda-logging"
  description = "IAM policy for logging from directory creator lambda"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Effect   = "Allow"
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

# Directory Creator Lambda permissions policy
resource "aws_iam_policy" "directory_creator_permissions" {
  name        = "${local.name_prefix}-directory-creator-permissions"
  description = "IAM policy for directory creator lambda permissions"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Effect   = "Allow"
        Resource = [
          aws_dynamodb_table.safemate_directories.arn,
          "${aws_dynamodb_table.safemate_directories.arn}/index/*"
        ]
      }
    ]
  })
}

# Attach logging policy to directory creator role
resource "aws_iam_role_policy_attachment" "directory_creator_lambda_logs" {
  role       = aws_iam_role.directory_creator_lambda_exec.name
  policy_arn = aws_iam_policy.directory_creator_lambda_logging.arn
}

# Attach permissions policy to directory creator role
resource "aws_iam_role_policy_attachment" "directory_creator_lambda_permissions" {
  role       = aws_iam_role.directory_creator_lambda_exec.name
  policy_arn = aws_iam_policy.directory_creator_permissions.arn
}

# SafeMate Directory Creator Lambda Function
resource "aws_lambda_function" "safemate_directory_creator" {
  filename         = "services/safemate-directory-creator/safemate-directory-creator.zip"
  function_name    = "${local.name_prefix}-directory-creator"
  role            = aws_iam_role.directory_creator_lambda_exec.arn
  handler         = "index.handler"
  source_code_hash = filebase64sha256("services/safemate-directory-creator/safemate-directory-creator.zip")
  runtime         = "nodejs18.x"
  timeout         = 90
  memory_size     = 512
  
  # Temporarily removed layers due to size constraints
  # layers = [
  #   aws_lambda_layer_version.safemate_dependencies_layer.arn
  # ]

  environment {
    variables = {
      HEDERA_NETWORK = var.hedera_network
      SAFEMATE_DIRECTORIES_TABLE = aws_dynamodb_table.safemate_directories.name
      REGION = data.aws_region.current.name
    }
  }

  tags = {
    Environment = var.environment
    Application = var.app_name
    Component   = "directory-creator"
  }

  depends_on = [
    aws_iam_role_policy_attachment.directory_creator_lambda_logs,
    aws_iam_role_policy_attachment.directory_creator_lambda_permissions,
    aws_cloudwatch_log_group.directory_creator_lambda_logs,
  ]
}

# Group Manager Lambda Function
resource "aws_lambda_function" "group_manager" {
  filename         = "services/group-manager/group-manager.zip"
  function_name    = "${local.name_prefix}-group-manager"
  role            = aws_iam_role.group_lambda_exec.arn
  handler         = "index.handler"
  source_code_hash = filebase64sha256("services/group-manager/group-manager.zip")
  runtime         = "nodejs18.x"
  timeout         = 30
  memory_size     = 256

  environment {
    variables = {
      HEDERA_NETWORK         = var.hedera_network
      GROUPS_TABLE           = aws_dynamodb_table.groups.name
      GROUP_MEMBERSHIPS_TABLE = aws_dynamodb_table.group_memberships.name
      GROUP_PERMISSIONS_TABLE = aws_dynamodb_table.group_permissions.name
      GROUP_ACTIVITIES_TABLE = aws_dynamodb_table.group_activities.name
      SHARED_WALLETS_TABLE   = aws_dynamodb_table.shared_wallets.name
      GROUP_INVITATIONS_TABLE = aws_dynamodb_table.group_invitations.name
      USER_PROFILES_TABLE    = aws_dynamodb_table.user_profiles.name
      USER_NOTIFICATIONS_TABLE = aws_dynamodb_table.user_notifications.name
      COGNITO_USER_POOL_ID   = aws_cognito_user_pool.app_pool_v3.id
      REGION                 = data.aws_region.current.name
    }
  }

  tags = {
    Environment = var.environment
    Application = var.app_name
    Component   = "group-manager"
  }

  depends_on = [
    aws_iam_role_policy_attachment.group_lambda_logs,
    aws_iam_role_policy_attachment.group_lambda_permissions,
    aws_cloudwatch_log_group.group_lambda_logs,
  ]
}

# CloudWatch Log Group for Group Manager Lambda
resource "aws_cloudwatch_log_group" "group_lambda_logs" {
  name              = "/aws/lambda/${local.name_prefix}-group-manager"
  retention_in_days = local.environment == "dev" ? 7 : 14

  tags = {
    Environment = var.environment
    Application = var.app_name
    Component   = "group-manager"
  }
}

# CloudWatch Log Group for Token Vault Lambda
resource "aws_cloudwatch_log_group" "vault_lambda_logs" {
  name              = "/aws/lambda/${local.name_prefix}-token-vault"
  retention_in_days = local.environment == "dev" ? 7 : 14

  tags = {
    Environment = var.environment
    Application = var.app_name
    Component   = "token-vault"
  }
}

# CloudWatch Log Group for Hedera Service Lambda
resource "aws_cloudwatch_log_group" "hedera_lambda_logs" {
  name              = "/aws/lambda/${local.name_prefix}-hedera-service"
  retention_in_days = local.environment == "dev" ? 7 : 14  # Reduced retention for cost optimization

  tags = {
    Environment = var.environment
    Application = var.app_name
    Component   = "hedera-service"
  }
}

# CloudWatch Log Group for Wallet Manager Lambda
resource "aws_cloudwatch_log_group" "wallet_lambda_logs" {
  name              = "/aws/lambda/${local.name_prefix}-wallet-manager"
  retention_in_days = local.environment == "dev" ? 7 : 14  # Environment-specific retention

  tags = {
    Environment = var.environment
    Application = var.app_name
    Component   = "wallet-manager"
  }
}

# CloudWatch Log Group for User Onboarding Lambda
resource "aws_cloudwatch_log_group" "user_onboarding_lambda_logs" {
  name              = "/aws/lambda/${local.name_prefix}-user-onboarding"
  retention_in_days = local.environment == "dev" ? 7 : 14  # Environment-specific retention

  tags = {
    Environment = var.environment
    Application = var.app_name
    Component   = "user-onboarding"
  }
}

# CloudWatch Log Group for Directory Creator Lambda
resource "aws_cloudwatch_log_group" "directory_creator_lambda_logs" {
  name              = "/aws/lambda/${local.name_prefix}-directory-creator"
  retention_in_days = local.environment == "dev" ? 7 : 14  # Environment-specific retention

  tags = {
    Environment = var.environment
    Application = var.app_name
    Component   = "directory-creator"
  }
}

# Hedera Service Lambda execution role
resource "aws_iam_role" "hedera_lambda_exec" {
  name = "${local.name_prefix}-hedera-lambda-exec"

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
    Component   = "hedera-service"
  }
}

# Hedera Service Lambda logging policy
resource "aws_iam_policy" "hedera_lambda_logging" {
  name        = "${local.name_prefix}-hedera-lambda-logging"
  description = "IAM policy for hedera service lambda logging"

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

resource "aws_iam_role_policy_attachment" "hedera_lambda_logs" {
  role       = aws_iam_role.hedera_lambda_exec.name
  policy_arn = aws_iam_policy.hedera_lambda_logging.arn
}

# Attach comprehensive permissions to Hedera Lambda role
resource "aws_iam_role_policy_attachment" "hedera_lambda_permissions" {
  role       = aws_iam_role.hedera_lambda_exec.name
  policy_arn = aws_iam_policy.hedera_operator_permissions.arn
}

# Lambda execution role
resource "aws_iam_role" "vault_lambda_exec" {
  name = "${local.name_prefix}-vault-lambda-exec"

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
    Component   = "token-vault"
  }
}

# Lambda logging policy
resource "aws_iam_policy" "vault_lambda_logging" {
  name        = "${local.name_prefix}-vault-lambda-logging"
  description = "IAM policy for logging from Lambda"

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

resource "aws_iam_role_policy_attachment" "vault_lambda_logs" {
  role       = aws_iam_role.vault_lambda_exec.name
  policy_arn = aws_iam_policy.vault_lambda_logging.arn
}

# Attach vault permissions to Lambda role
resource "aws_iam_role_policy_attachment" "vault_lambda_permissions" {
  role       = aws_iam_role.vault_lambda_exec.name
  policy_arn = aws_iam_policy.vault_permissions.arn
}

# User Onboarding Lambda execution role
resource "aws_iam_role" "user_onboarding_lambda_exec" {
  name = "${local.name_prefix}-user-onboarding-lambda-exec"

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
    Component   = "user-onboarding"
  }
}

# User Onboarding Lambda logging policy
resource "aws_iam_policy" "user_onboarding_lambda_logging" {
  name        = "${local.name_prefix}-user-onboarding-lambda-logging"
  description = "IAM policy for user onboarding lambda logging"

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

resource "aws_iam_role_policy_attachment" "user_onboarding_lambda_logs" {
  role       = aws_iam_role.user_onboarding_lambda_exec.name
  policy_arn = aws_iam_policy.user_onboarding_lambda_logging.arn
}

resource "aws_iam_role_policy_attachment" "user_onboarding_operator_permissions" {
  role       = aws_iam_role.user_onboarding_lambda_exec.name
  policy_arn = aws_iam_policy.hedera_operator_permissions.arn
}

# User Onboarding Lambda comprehensive permissions
resource "aws_iam_policy" "user_onboarding_permissions" {
  name        = "${local.name_prefix}-user-onboarding-permissions"
  description = "IAM policy for user onboarding operations"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
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
          aws_dynamodb_table.wallet_metadata.arn,
          aws_dynamodb_table.wallet_keys.arn,
          aws_dynamodb_table.user_secrets.arn,
          aws_dynamodb_table.wallet_audit.arn,
          "${aws_dynamodb_table.wallet_metadata.arn}/*",
          "${aws_dynamodb_table.wallet_keys.arn}/*",
          "${aws_dynamodb_table.user_secrets.arn}/*",
          "${aws_dynamodb_table.wallet_audit.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "kms:Encrypt",
          "kms:Decrypt",
          "kms:GenerateDataKey",
          "kms:DescribeKey"
        ]
                  Resource = [
            aws_kms_key.safemate_master_key.arn
          ]
      },
      {
        Effect = "Allow"
        Action = [
          "cognito-idp:AdminUpdateUserAttributes",
          "cognito-idp:AdminGetUser",
          "cognito-idp:AdminSetUserPassword"
        ]
        Resource = "arn:aws:cognito-idp:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:userpool/*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "user_onboarding_lambda_permissions" {
  role       = aws_iam_role.user_onboarding_lambda_exec.name
  policy_arn = aws_iam_policy.user_onboarding_permissions.arn
}



# API Gateway for Token Vault
resource "aws_api_gateway_rest_api" "vault_api" {
  name        = "${local.name_prefix}-vault-api"
  description = "API Gateway for SafeMate Token Vault"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = {
    Environment = var.environment
    Application = var.app_name
    Component   = "token-vault"
  }
}

# API Gateway for Hedera Service
resource "aws_api_gateway_rest_api" "hedera_api" {
  name        = "${local.name_prefix}-hedera-api"
  description = "API Gateway for SafeMate Hedera Service"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = {
    Environment = var.environment
    Application = var.app_name
    Component   = "hedera-service"
  }
}

# API Gateway for Wallet Manager
resource "aws_api_gateway_rest_api" "wallet_api" {
  name        = "${local.name_prefix}-wallet-api"
  description = "API Gateway for SafeMate Wallet Manager"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = {
    Environment = var.environment
    Application = var.app_name
    Component   = "wallet-manager"
  }
}

# API Gateway for User Onboarding
resource "aws_api_gateway_rest_api" "onboarding_api" {
  name        = "${local.name_prefix}-onboarding-api"
  description = "API Gateway for SafeMate User Onboarding"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = {
    Environment = var.environment
    Application = var.app_name
    Component   = "user-onboarding"
  }
}

# API Gateway resource for /vault
resource "aws_api_gateway_resource" "vault_resource" {
  rest_api_id = aws_api_gateway_rest_api.vault_api.id
  parent_id   = aws_api_gateway_rest_api.vault_api.root_resource_id
  path_part   = "vault"
}

# API Gateway resource for /vault/secrets
resource "aws_api_gateway_resource" "vault_secrets" {
  rest_api_id = aws_api_gateway_rest_api.vault_api.id
  parent_id   = aws_api_gateway_resource.vault_resource.id
  path_part   = "secrets"
}

# API Gateway resource for /wallet
resource "aws_api_gateway_resource" "wallet_resource" {
  rest_api_id = aws_api_gateway_rest_api.wallet_api.id
  parent_id   = aws_api_gateway_rest_api.wallet_api.root_resource_id
  path_part   = "wallet"
}

# API Gateway resource for /wallet/create
resource "aws_api_gateway_resource" "wallet_create" {
  rest_api_id = aws_api_gateway_rest_api.wallet_api.id
  parent_id   = aws_api_gateway_resource.wallet_resource.id
  path_part   = "create"
}

# API Gateway resource for /onboarding
resource "aws_api_gateway_resource" "onboarding_resource" {
  rest_api_id = aws_api_gateway_rest_api.onboarding_api.id
  parent_id   = aws_api_gateway_rest_api.onboarding_api.root_resource_id
  path_part   = "onboarding"
}

# API Gateway resource for /onboarding/status
resource "aws_api_gateway_resource" "onboarding_status" {
  rest_api_id = aws_api_gateway_rest_api.onboarding_api.id
  parent_id   = aws_api_gateway_resource.onboarding_resource.id
  path_part   = "status"
}

# API Gateway resource for /onboarding/retry
resource "aws_api_gateway_resource" "onboarding_retry" {
  rest_api_id = aws_api_gateway_rest_api.onboarding_api.id
  parent_id   = aws_api_gateway_resource.onboarding_resource.id
  path_part   = "retry"
}

# API Gateway resource for /onboarding/start
resource "aws_api_gateway_resource" "onboarding_start" {
  rest_api_id = aws_api_gateway_rest_api.onboarding_api.id
  parent_id   = aws_api_gateway_resource.onboarding_resource.id
  path_part   = "start"
}

# API Gateway resource for /files (Hedera Service)
resource "aws_api_gateway_resource" "files_resource" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  parent_id   = aws_api_gateway_rest_api.hedera_api.root_resource_id
  path_part   = "files"
}

# API Gateway resource for /files/upload
resource "aws_api_gateway_resource" "files_upload" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  parent_id   = aws_api_gateway_resource.files_resource.id
  path_part   = "upload"
}

# API Gateway resource for /files/{fileId}
resource "aws_api_gateway_resource" "files_file_id" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  parent_id   = aws_api_gateway_resource.files_resource.id
  path_part   = "{fileId}"
}

# API Gateway resource for /files/{fileId}/content
resource "aws_api_gateway_resource" "files_content" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  parent_id   = aws_api_gateway_resource.files_file_id.id
  path_part   = "content"
}

# API Gateway resource for /folders (Hedera Service)
resource "aws_api_gateway_resource" "folders_resource" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  parent_id   = aws_api_gateway_rest_api.hedera_api.root_resource_id
  path_part   = "folders"
}

# API Gateway resource for /folders/{folderId}
resource "aws_api_gateway_resource" "folders_folder_id" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  parent_id   = aws_api_gateway_resource.folders_resource.id
  path_part   = "{folderId}"
}

# Cognito User Pool Authorizers
resource "aws_api_gateway_authorizer" "vault_cognito_authorizer" {
  name          = "${local.name_prefix}-vault-cognito-authorizer"
  rest_api_id   = aws_api_gateway_rest_api.vault_api.id
  type          = "COGNITO_USER_POOLS"
  provider_arns = [aws_cognito_user_pool.app_pool_v3.arn]
}

resource "aws_api_gateway_authorizer" "wallet_cognito_authorizer" {
  name          = "${local.name_prefix}-wallet-cognito-authorizer"
  rest_api_id   = aws_api_gateway_rest_api.wallet_api.id
  type          = "COGNITO_USER_POOLS"
  provider_arns = [aws_cognito_user_pool.app_pool_v3.arn]
}

resource "aws_api_gateway_authorizer" "onboarding_cognito_authorizer" {
  name          = "${local.name_prefix}-onboarding-cognito-authorizer"
  rest_api_id   = aws_api_gateway_rest_api.onboarding_api.id
  type          = "COGNITO_USER_POOLS"
  provider_arns = [aws_cognito_user_pool.app_pool_v3.arn]
}

resource "aws_api_gateway_authorizer" "hedera_cognito_authorizer" {
  name          = "${local.name_prefix}-hedera-cognito-authorizer"
  rest_api_id   = aws_api_gateway_rest_api.hedera_api.id
  type          = "COGNITO_USER_POOLS"
  provider_arns = [aws_cognito_user_pool.app_pool_v3.arn]
}

# Groups API Gateway
resource "aws_api_gateway_rest_api" "group_api" {
  name        = "${local.name_prefix}-group-api"
  description = "API Gateway for SafeMate Group Management"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = {
    Environment = var.environment
    Application = var.app_name
    Component   = "group-api"
  }
}

resource "aws_api_gateway_rest_api" "directory_api" {
  name        = "${local.name_prefix}-directory-api"
  description = "API Gateway for SafeMate Directory NFT Management"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = {
    Environment = var.environment
    Application = var.app_name
    Component   = "directory-api"
  }
}

resource "aws_api_gateway_authorizer" "group_cognito_authorizer" {
  name          = "${local.name_prefix}-group-cognito-authorizer"
  rest_api_id   = aws_api_gateway_rest_api.group_api.id
  type          = "COGNITO_USER_POOLS"
  provider_arns = [aws_cognito_user_pool.app_pool_v3.arn]
}

# API Gateway resource for /groups
resource "aws_api_gateway_resource" "groups_resource" {
  rest_api_id = aws_api_gateway_rest_api.group_api.id
  parent_id   = aws_api_gateway_rest_api.group_api.root_resource_id
  path_part   = "groups"
}

# API Gateway resource for /groups/{groupId}
resource "aws_api_gateway_resource" "groups_group_id" {
  rest_api_id = aws_api_gateway_rest_api.group_api.id
  parent_id   = aws_api_gateway_resource.groups_resource.id
  path_part   = "{groupId}"
}

# API Gateway resource for /groups/{groupId}/members
resource "aws_api_gateway_resource" "groups_members" {
  rest_api_id = aws_api_gateway_rest_api.group_api.id
  parent_id   = aws_api_gateway_resource.groups_group_id.id
  path_part   = "members"
}

# API Gateway resource for /groups/{groupId}/wallets
resource "aws_api_gateway_resource" "groups_wallets" {
  rest_api_id = aws_api_gateway_rest_api.group_api.id
  parent_id   = aws_api_gateway_resource.groups_group_id.id
  path_part   = "wallets"
}

# API Gateway resource for /groups/{groupId}/invitations
resource "aws_api_gateway_resource" "groups_invitations" {
  rest_api_id = aws_api_gateway_rest_api.group_api.id
  parent_id   = aws_api_gateway_resource.groups_group_id.id
  path_part   = "invitations"
}

# API Gateway resource for /invitations
resource "aws_api_gateway_resource" "invitations_resource" {
  rest_api_id = aws_api_gateway_rest_api.group_api.id
  parent_id   = aws_api_gateway_rest_api.group_api.root_resource_id
  path_part   = "invitations"
}

# API Gateway resource for /invitations/{invitationId}
resource "aws_api_gateway_resource" "invitations_invitation_id" {
  rest_api_id = aws_api_gateway_rest_api.group_api.id
  parent_id   = aws_api_gateway_resource.invitations_resource.id
  path_part   = "{invitationId}"
}

# API Gateway resource for /invitations/{invitationId}/respond
resource "aws_api_gateway_resource" "invitations_respond" {
  rest_api_id = aws_api_gateway_rest_api.group_api.id
  parent_id   = aws_api_gateway_resource.invitations_invitation_id.id
  path_part   = "respond"
}

# GET method for retrieving secrets
resource "aws_api_gateway_method" "vault_get" {
  rest_api_id   = aws_api_gateway_rest_api.vault_api.id
  resource_id   = aws_api_gateway_resource.vault_secrets.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.vault_cognito_authorizer.id
}

# PUT method for storing secrets
resource "aws_api_gateway_method" "vault_put" {
  rest_api_id   = aws_api_gateway_rest_api.vault_api.id
  resource_id   = aws_api_gateway_resource.vault_secrets.id
  http_method   = "PUT"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.vault_cognito_authorizer.id
}

# OPTIONS method for CORS
resource "aws_api_gateway_method" "vault_options" {
  rest_api_id   = aws_api_gateway_rest_api.vault_api.id
  resource_id   = aws_api_gateway_resource.vault_secrets.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# GET method for retrieving wallet
resource "aws_api_gateway_method" "wallet_get" {
  rest_api_id   = aws_api_gateway_rest_api.wallet_api.id
  resource_id   = aws_api_gateway_resource.wallet_resource.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.wallet_cognito_authorizer.id
}

# POST method for creating wallet
resource "aws_api_gateway_method" "wallet_create_post" {
  rest_api_id   = aws_api_gateway_rest_api.wallet_api.id
  resource_id   = aws_api_gateway_resource.wallet_create.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.wallet_cognito_authorizer.id
}

# OPTIONS method for CORS on wallet endpoints
resource "aws_api_gateway_method" "wallet_options" {
  rest_api_id   = aws_api_gateway_rest_api.wallet_api.id
  resource_id   = aws_api_gateway_resource.wallet_resource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "wallet_create_options" {
  rest_api_id   = aws_api_gateway_rest_api.wallet_api.id
  resource_id   = aws_api_gateway_resource.wallet_create.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# POST method for getting onboarding status
resource "aws_api_gateway_method" "onboarding_status_post" {
  rest_api_id   = aws_api_gateway_rest_api.onboarding_api.id
  resource_id   = aws_api_gateway_resource.onboarding_status.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.onboarding_cognito_authorizer.id
}

# GET method for getting onboarding status
resource "aws_api_gateway_method" "onboarding_status_get" {
  rest_api_id   = aws_api_gateway_rest_api.onboarding_api.id
  resource_id   = aws_api_gateway_resource.onboarding_status.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.onboarding_cognito_authorizer.id
}

# POST method for retrying onboarding
resource "aws_api_gateway_method" "onboarding_retry_post" {
  rest_api_id   = aws_api_gateway_rest_api.onboarding_api.id
  resource_id   = aws_api_gateway_resource.onboarding_retry.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.onboarding_cognito_authorizer.id
}

# POST method for starting onboarding
resource "aws_api_gateway_method" "onboarding_start_post" {
  rest_api_id   = aws_api_gateway_rest_api.onboarding_api.id
  resource_id   = aws_api_gateway_resource.onboarding_start.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.onboarding_cognito_authorizer.id
}

# OPTIONS methods for CORS
resource "aws_api_gateway_method" "onboarding_status_options" {
  rest_api_id   = aws_api_gateway_rest_api.onboarding_api.id
  resource_id   = aws_api_gateway_resource.onboarding_status.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "onboarding_retry_options" {
  rest_api_id   = aws_api_gateway_rest_api.onboarding_api.id
  resource_id   = aws_api_gateway_resource.onboarding_retry.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "onboarding_start_options" {
  rest_api_id   = aws_api_gateway_rest_api.onboarding_api.id
  resource_id   = aws_api_gateway_resource.onboarding_start.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# Groups API Methods
resource "aws_api_gateway_method" "groups_get" {
  rest_api_id   = aws_api_gateway_rest_api.group_api.id
  resource_id   = aws_api_gateway_resource.groups_resource.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.group_cognito_authorizer.id
}

resource "aws_api_gateway_method" "groups_post" {
  rest_api_id   = aws_api_gateway_rest_api.group_api.id
  resource_id   = aws_api_gateway_resource.groups_resource.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.group_cognito_authorizer.id
}

resource "aws_api_gateway_method" "groups_options" {
  rest_api_id   = aws_api_gateway_rest_api.group_api.id
  resource_id   = aws_api_gateway_resource.groups_resource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "groups_members_get" {
  rest_api_id   = aws_api_gateway_rest_api.group_api.id
  resource_id   = aws_api_gateway_resource.groups_members.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.group_cognito_authorizer.id
}

resource "aws_api_gateway_method" "groups_members_post" {
  rest_api_id   = aws_api_gateway_rest_api.group_api.id
  resource_id   = aws_api_gateway_resource.groups_members.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.group_cognito_authorizer.id
}

# Groups Members OPTIONS method for CORS
resource "aws_api_gateway_method" "groups_members_options" {
  rest_api_id   = aws_api_gateway_rest_api.group_api.id
  resource_id   = aws_api_gateway_resource.groups_members.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# Groups Wallets GET method
resource "aws_api_gateway_method" "groups_wallets_get" {
  rest_api_id   = aws_api_gateway_rest_api.group_api.id
  resource_id   = aws_api_gateway_resource.groups_wallets.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.group_cognito_authorizer.id
}

# Groups Wallets OPTIONS method for CORS
resource "aws_api_gateway_method" "groups_wallets_options" {
  rest_api_id   = aws_api_gateway_rest_api.group_api.id
  resource_id   = aws_api_gateway_resource.groups_wallets.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# Groups Invitations API Methods
resource "aws_api_gateway_method" "groups_invitations_get" {
  rest_api_id   = aws_api_gateway_rest_api.group_api.id
  resource_id   = aws_api_gateway_resource.groups_invitations.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.group_cognito_authorizer.id
}

resource "aws_api_gateway_method" "groups_invitations_options" {
  rest_api_id   = aws_api_gateway_rest_api.group_api.id
  resource_id   = aws_api_gateway_resource.groups_invitations.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# Groups Individual PUT method for updating group details
resource "aws_api_gateway_method" "groups_put" {
  rest_api_id   = aws_api_gateway_rest_api.group_api.id
  resource_id   = aws_api_gateway_resource.groups_group_id.id
  http_method   = "PUT"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.group_cognito_authorizer.id
}

# Invitations API Methods
resource "aws_api_gateway_method" "invitations_get" {
  rest_api_id   = aws_api_gateway_rest_api.group_api.id
  resource_id   = aws_api_gateway_resource.invitations_resource.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.group_cognito_authorizer.id
}

resource "aws_api_gateway_method" "invitations_options" {
  rest_api_id   = aws_api_gateway_rest_api.group_api.id
  resource_id   = aws_api_gateway_resource.invitations_resource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "invitations_respond_post" {
  rest_api_id   = aws_api_gateway_rest_api.group_api.id
  resource_id   = aws_api_gateway_resource.invitations_respond.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.group_cognito_authorizer.id
}

resource "aws_api_gateway_method" "invitations_respond_options" {
  rest_api_id   = aws_api_gateway_rest_api.group_api.id
  resource_id   = aws_api_gateway_resource.invitations_respond.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# Lambda integration for GET
resource "aws_api_gateway_integration" "vault_get_integration" {
  rest_api_id = aws_api_gateway_rest_api.vault_api.id
  resource_id = aws_api_gateway_resource.vault_secrets.id
  http_method = aws_api_gateway_method.vault_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.token_vault.invoke_arn
}

# Lambda integration for PUT
resource "aws_api_gateway_integration" "vault_put_integration" {
  rest_api_id = aws_api_gateway_rest_api.vault_api.id
  resource_id = aws_api_gateway_resource.vault_secrets.id
  http_method = aws_api_gateway_method.vault_put.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.token_vault.invoke_arn
}

# CORS integration for OPTIONS
resource "aws_api_gateway_integration" "vault_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.vault_api.id
  resource_id = aws_api_gateway_resource.vault_secrets.id
  http_method = aws_api_gateway_method.vault_options.http_method

  type = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

# Lambda integration for wallet GET
resource "aws_api_gateway_integration" "wallet_get_integration" {
  rest_api_id = aws_api_gateway_rest_api.wallet_api.id
  resource_id = aws_api_gateway_resource.wallet_resource.id
  http_method = aws_api_gateway_method.wallet_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.wallet_manager.invoke_arn
}

# Lambda integration for wallet creation POST
resource "aws_api_gateway_integration" "wallet_create_integration" {
  rest_api_id = aws_api_gateway_rest_api.wallet_api.id
  resource_id = aws_api_gateway_resource.wallet_create.id
  http_method = aws_api_gateway_method.wallet_create_post.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.wallet_manager.invoke_arn
}

# CORS integrations for wallet endpoints
resource "aws_api_gateway_integration" "wallet_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.wallet_api.id
  resource_id = aws_api_gateway_resource.wallet_resource.id
  http_method = aws_api_gateway_method.wallet_options.http_method

  type = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_integration" "wallet_create_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.wallet_api.id
  resource_id = aws_api_gateway_resource.wallet_create.id
  http_method = aws_api_gateway_method.wallet_create_options.http_method

  type = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

# Lambda integration for onboarding status
resource "aws_api_gateway_integration" "onboarding_status_integration" {
  rest_api_id = aws_api_gateway_rest_api.onboarding_api.id
  resource_id = aws_api_gateway_resource.onboarding_status.id
  http_method = aws_api_gateway_method.onboarding_status_post.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:${var.region}:lambda:path/2015-03-31/functions/${aws_lambda_function.user_onboarding.arn}/invocations"
}

# Lambda integration for onboarding status GET
resource "aws_api_gateway_integration" "onboarding_status_get_integration" {
  rest_api_id = aws_api_gateway_rest_api.onboarding_api.id
  resource_id = aws_api_gateway_resource.onboarding_status.id
  http_method = aws_api_gateway_method.onboarding_status_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:${var.region}:lambda:path/2015-03-31/functions/${aws_lambda_function.user_onboarding.arn}/invocations"
}

# Lambda integration for onboarding retry
resource "aws_api_gateway_integration" "onboarding_retry_integration" {
  rest_api_id = aws_api_gateway_rest_api.onboarding_api.id
  resource_id = aws_api_gateway_resource.onboarding_retry.id
  http_method = aws_api_gateway_method.onboarding_retry_post.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:${var.region}:lambda:path/2015-03-31/functions/${aws_lambda_function.user_onboarding.arn}/invocations"
}

# Lambda integration for onboarding start
resource "aws_api_gateway_integration" "onboarding_start_integration" {
  rest_api_id = aws_api_gateway_rest_api.onboarding_api.id
  resource_id = aws_api_gateway_resource.onboarding_start.id
  http_method = aws_api_gateway_method.onboarding_start_post.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:${var.region}:lambda:path/2015-03-31/functions/${aws_lambda_function.user_onboarding.arn}/invocations"
}

# Groups API Integrations
resource "aws_api_gateway_integration" "groups_get_integration" {
  rest_api_id = aws_api_gateway_rest_api.group_api.id
  resource_id = aws_api_gateway_resource.groups_resource.id
  http_method = aws_api_gateway_method.groups_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:${var.region}:lambda:path/2015-03-31/functions/${aws_lambda_function.group_manager.arn}/invocations"
}

resource "aws_api_gateway_integration" "groups_post_integration" {
  rest_api_id = aws_api_gateway_rest_api.group_api.id
  resource_id = aws_api_gateway_resource.groups_resource.id
  http_method = aws_api_gateway_method.groups_post.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:${var.region}:lambda:path/2015-03-31/functions/${aws_lambda_function.group_manager.arn}/invocations"
}

resource "aws_api_gateway_integration" "groups_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.group_api.id
  resource_id = aws_api_gateway_resource.groups_resource.id
  http_method = aws_api_gateway_method.groups_options.http_method
  type        = "MOCK"
  
  request_templates = {
    "application/json" = jsonencode({
      statusCode = 200
    })
  }
}

resource "aws_api_gateway_integration" "groups_members_get_integration" {
  rest_api_id = aws_api_gateway_rest_api.group_api.id
  resource_id = aws_api_gateway_resource.groups_members.id
  http_method = aws_api_gateway_method.groups_members_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:${var.region}:lambda:path/2015-03-31/functions/${aws_lambda_function.group_manager.arn}/invocations"
}

resource "aws_api_gateway_integration" "groups_members_post_integration" {
  rest_api_id = aws_api_gateway_rest_api.group_api.id
  resource_id = aws_api_gateway_resource.groups_members.id
  http_method = aws_api_gateway_method.groups_members_post.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:${var.region}:lambda:path/2015-03-31/functions/${aws_lambda_function.group_manager.arn}/invocations"
}

# Groups Wallets integrations
resource "aws_api_gateway_integration" "groups_wallets_get_integration" {
  rest_api_id = aws_api_gateway_rest_api.group_api.id
  resource_id = aws_api_gateway_resource.groups_wallets.id
  http_method = aws_api_gateway_method.groups_wallets_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:${var.region}:lambda:path/2015-03-31/functions/${aws_lambda_function.group_manager.arn}/invocations"
}

resource "aws_api_gateway_integration" "groups_wallets_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.group_api.id
  resource_id = aws_api_gateway_resource.groups_wallets.id
  http_method = aws_api_gateway_method.groups_wallets_options.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:${var.region}:lambda:path/2015-03-31/functions/${aws_lambda_function.group_manager.arn}/invocations"
}

# Groups Invitations API Integrations
resource "aws_api_gateway_integration" "groups_invitations_get_integration" {
  rest_api_id = aws_api_gateway_rest_api.group_api.id
  resource_id = aws_api_gateway_resource.groups_invitations.id
  http_method = aws_api_gateway_method.groups_invitations_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:${var.region}:lambda:path/2015-03-31/functions/${aws_lambda_function.group_manager.arn}/invocations"
}

resource "aws_api_gateway_integration" "groups_invitations_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.group_api.id
  resource_id = aws_api_gateway_resource.groups_invitations.id
  http_method = aws_api_gateway_method.groups_invitations_options.http_method
  type        = "MOCK"
  
  request_templates = {
    "application/json" = jsonencode({
      statusCode = 200
    })
  }
}

# Groups PUT integration
resource "aws_api_gateway_integration" "groups_put_integration" {
  rest_api_id = aws_api_gateway_rest_api.group_api.id
  resource_id = aws_api_gateway_resource.groups_group_id.id
  http_method = aws_api_gateway_method.groups_put.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:${var.region}:lambda:path/2015-03-31/functions/${aws_lambda_function.group_manager.arn}/invocations"
}

# Method responses
resource "aws_api_gateway_method_response" "vault_get_response" {
  rest_api_id = aws_api_gateway_rest_api.vault_api.id
  resource_id = aws_api_gateway_resource.vault_secrets.id
  http_method = aws_api_gateway_method.vault_get.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
    "method.response.header.Access-Control-Allow-Credentials" = true
  }
}

resource "aws_api_gateway_method_response" "vault_put_response" {
  rest_api_id = aws_api_gateway_rest_api.vault_api.id
  resource_id = aws_api_gateway_resource.vault_secrets.id
  http_method = aws_api_gateway_method.vault_put.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
    "method.response.header.Access-Control-Allow-Credentials" = true
  }
}

resource "aws_api_gateway_method_response" "vault_options_response" {
  rest_api_id = aws_api_gateway_rest_api.vault_api.id
  resource_id = aws_api_gateway_resource.vault_secrets.id
  http_method = aws_api_gateway_method.vault_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

# Wallet API method responses
resource "aws_api_gateway_method_response" "wallet_get_response" {
  rest_api_id = aws_api_gateway_rest_api.wallet_api.id
  resource_id = aws_api_gateway_resource.wallet_resource.id
  http_method = aws_api_gateway_method.wallet_get.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
    "method.response.header.Access-Control-Allow-Credentials" = true
  }
}

resource "aws_api_gateway_method_response" "wallet_create_response" {
  rest_api_id = aws_api_gateway_rest_api.wallet_api.id
  resource_id = aws_api_gateway_resource.wallet_create.id
  http_method = aws_api_gateway_method.wallet_create_post.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
    "method.response.header.Access-Control-Allow-Credentials" = true
  }
}

resource "aws_api_gateway_method_response" "wallet_options_response" {
  rest_api_id = aws_api_gateway_rest_api.wallet_api.id
  resource_id = aws_api_gateway_resource.wallet_resource.id
  http_method = aws_api_gateway_method.wallet_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_method_response" "wallet_create_options_response" {
  rest_api_id = aws_api_gateway_rest_api.wallet_api.id
  resource_id = aws_api_gateway_resource.wallet_create.id
  http_method = aws_api_gateway_method.wallet_create_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

# Integration responses
resource "aws_api_gateway_integration_response" "vault_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.vault_api.id
  resource_id = aws_api_gateway_resource.vault_secrets.id
  http_method = aws_api_gateway_method.vault_options.http_method
  status_code = aws_api_gateway_method_response.vault_options_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-cognito-token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,PUT,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'https://d2xl0r3mv20sy5.cloudfront.net'"
  }
}

# Wallet CORS integration responses
resource "aws_api_gateway_integration_response" "wallet_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.wallet_api.id
  resource_id = aws_api_gateway_resource.wallet_resource.id
  http_method = aws_api_gateway_method.wallet_options.http_method
  status_code = aws_api_gateway_method_response.wallet_options_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-cognito-token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'https://d2xl0r3mv20sy5.cloudfront.net'"
  }
}

resource "aws_api_gateway_integration_response" "wallet_create_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.wallet_api.id
  resource_id = aws_api_gateway_resource.wallet_create.id
  http_method = aws_api_gateway_method.wallet_create_options.http_method
  status_code = aws_api_gateway_method_response.wallet_create_options_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-cognito-token'"
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'https://d2xl0r3mv20sy5.cloudfront.net'"
  }
}

# Integration responses for CORS
resource "aws_api_gateway_integration_response" "onboarding_status_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.onboarding_api.id
  resource_id = aws_api_gateway_resource.onboarding_status.id
  http_method = aws_api_gateway_method.onboarding_status_options.http_method
  status_code = aws_api_gateway_method_response.onboarding_status_options_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Credentials" = "'true'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-cognito-token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'https://d2xl0r3mv20sy5.cloudfront.net'"
  }
}

resource "aws_api_gateway_integration_response" "onboarding_retry_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.onboarding_api.id
  resource_id = aws_api_gateway_resource.onboarding_retry.id
  http_method = aws_api_gateway_method.onboarding_retry_options.http_method
  status_code = aws_api_gateway_method_response.onboarding_retry_options_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-cognito-token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'https://d2xl0r3mv20sy5.cloudfront.net'"
  }
}

resource "aws_api_gateway_integration_response" "onboarding_start_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.onboarding_api.id
  resource_id = aws_api_gateway_resource.onboarding_start.id
  http_method = aws_api_gateway_method.onboarding_start_options.http_method
  status_code = aws_api_gateway_method_response.onboarding_start_options_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-cognito-token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'https://d2xl0r3mv20sy5.cloudfront.net'"
    "method.response.header.Access-Control-Allow-Credentials" = "'true'"
  }
}

resource "aws_api_gateway_integration" "groups_members_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.group_api.id
  resource_id = aws_api_gateway_resource.groups_members.id
  http_method = aws_api_gateway_method.groups_members_options.http_method

  type = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

# Groups API Integration Responses for CORS
resource "aws_api_gateway_integration_response" "groups_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.group_api.id
  resource_id = aws_api_gateway_resource.groups_resource.id
  http_method = aws_api_gateway_method.groups_options.http_method
  status_code = aws_api_gateway_method_response.groups_options_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-cognito-token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'https://d2xl0r3mv20sy5.cloudfront.net'"
  }
}

resource "aws_api_gateway_integration_response" "groups_members_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.group_api.id
  resource_id = aws_api_gateway_resource.groups_members.id
  http_method = aws_api_gateway_method.groups_members_options.http_method
  status_code = aws_api_gateway_method_response.groups_members_options_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-cognito-token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'https://d2xl0r3mv20sy5.cloudfront.net'"
  }
}

# Groups Wallets integration responses
resource "aws_api_gateway_integration_response" "groups_wallets_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.group_api.id
  resource_id = aws_api_gateway_resource.groups_wallets.id
  http_method = aws_api_gateway_method.groups_wallets_options.http_method
  status_code = aws_api_gateway_method_response.groups_wallets_options_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = "'https://d2xl0r3mv20sy5.cloudfront.net'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-cognito-token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
  }

  depends_on = [aws_api_gateway_integration.groups_wallets_options_integration]
}

# Groups Invitations CORS Integration Response
resource "aws_api_gateway_integration_response" "groups_invitations_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.group_api.id
  resource_id = aws_api_gateway_resource.groups_invitations.id
  http_method = aws_api_gateway_method.groups_invitations_options.http_method
  status_code = aws_api_gateway_method_response.groups_invitations_options_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = "'https://d2xl0r3mv20sy5.cloudfront.net'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-cognito-token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS'"
  }

  depends_on = [aws_api_gateway_integration.groups_invitations_options_integration]
}

# Method responses for onboarding POST endpoints
resource "aws_api_gateway_method_response" "onboarding_status_post_response" {
  rest_api_id = aws_api_gateway_rest_api.onboarding_api.id
  resource_id = aws_api_gateway_resource.onboarding_status.id
  http_method = aws_api_gateway_method.onboarding_status_post.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
    "method.response.header.Access-Control-Allow-Credentials" = true
  }
}

# Method response for onboarding status GET
resource "aws_api_gateway_method_response" "onboarding_status_get_response" {
  rest_api_id = aws_api_gateway_rest_api.onboarding_api.id
  resource_id = aws_api_gateway_resource.onboarding_status.id
  http_method = aws_api_gateway_method.onboarding_status_get.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
    "method.response.header.Access-Control-Allow-Credentials" = true
  }
}

resource "aws_api_gateway_method_response" "onboarding_retry_post_response" {
  rest_api_id = aws_api_gateway_rest_api.onboarding_api.id
  resource_id = aws_api_gateway_resource.onboarding_retry.id
  http_method = aws_api_gateway_method.onboarding_retry_post.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
    "method.response.header.Access-Control-Allow-Credentials" = true
  }
}

resource "aws_api_gateway_method_response" "onboarding_start_post_response" {
  rest_api_id = aws_api_gateway_rest_api.onboarding_api.id
  resource_id = aws_api_gateway_resource.onboarding_start.id
  http_method = aws_api_gateway_method.onboarding_start_post.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
    "method.response.header.Access-Control-Allow-Credentials" = true
  }
}

# Method responses for onboarding CORS
resource "aws_api_gateway_method_response" "onboarding_status_options_response" {
  rest_api_id = aws_api_gateway_rest_api.onboarding_api.id
  resource_id = aws_api_gateway_resource.onboarding_status.id
  http_method = aws_api_gateway_method.onboarding_status_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Credentials" = true
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_method_response" "onboarding_retry_options_response" {
  rest_api_id = aws_api_gateway_rest_api.onboarding_api.id
  resource_id = aws_api_gateway_resource.onboarding_retry.id
  http_method = aws_api_gateway_method.onboarding_retry_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_method_response" "onboarding_start_options_response" {
  rest_api_id = aws_api_gateway_rest_api.onboarding_api.id
  resource_id = aws_api_gateway_resource.onboarding_start.id
  http_method = aws_api_gateway_method.onboarding_start_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
    "method.response.header.Access-Control-Allow-Credentials" = true
  }
}

# Groups API Method Responses
resource "aws_api_gateway_method_response" "groups_get_response" {
  rest_api_id = aws_api_gateway_rest_api.group_api.id
  resource_id = aws_api_gateway_resource.groups_resource.id
  http_method = aws_api_gateway_method.groups_get.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_method_response" "groups_post_response" {
  rest_api_id = aws_api_gateway_rest_api.group_api.id
  resource_id = aws_api_gateway_resource.groups_resource.id
  http_method = aws_api_gateway_method.groups_post.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_method_response" "groups_options_response" {
  rest_api_id = aws_api_gateway_rest_api.group_api.id
  resource_id = aws_api_gateway_resource.groups_resource.id
  http_method = aws_api_gateway_method.groups_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_method_response" "groups_members_get_response" {
  rest_api_id = aws_api_gateway_rest_api.group_api.id
  resource_id = aws_api_gateway_resource.groups_members.id
  http_method = aws_api_gateway_method.groups_members_get.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_method_response" "groups_members_post_response" {
  rest_api_id = aws_api_gateway_rest_api.group_api.id
  resource_id = aws_api_gateway_resource.groups_members.id
  http_method = aws_api_gateway_method.groups_members_post.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# Method responses for Groups CORS OPTIONS
resource "aws_api_gateway_method_response" "groups_members_options_response" {
  rest_api_id = aws_api_gateway_rest_api.group_api.id
  resource_id = aws_api_gateway_resource.groups_members.id
  http_method = aws_api_gateway_method.groups_members_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

# Groups Wallets method responses
resource "aws_api_gateway_method_response" "groups_wallets_get_response" {
  rest_api_id = aws_api_gateway_rest_api.group_api.id
  resource_id = aws_api_gateway_resource.groups_wallets.id
  http_method = aws_api_gateway_method.groups_wallets_get.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_method_response" "groups_wallets_options_response" {
  rest_api_id = aws_api_gateway_rest_api.group_api.id
  resource_id = aws_api_gateway_resource.groups_wallets.id
  http_method = aws_api_gateway_method.groups_wallets_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

# Groups Invitations API Method Responses
resource "aws_api_gateway_method_response" "groups_invitations_get_response" {
  rest_api_id = aws_api_gateway_rest_api.group_api.id
  resource_id = aws_api_gateway_resource.groups_invitations.id
  http_method = aws_api_gateway_method.groups_invitations_get.http_method
  status_code = "200"
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_method_response" "groups_invitations_options_response" {
  rest_api_id = aws_api_gateway_rest_api.group_api.id
  resource_id = aws_api_gateway_resource.groups_invitations.id
  http_method = aws_api_gateway_method.groups_invitations_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

# Groups PUT method response
resource "aws_api_gateway_method_response" "groups_put_response" {
  rest_api_id = aws_api_gateway_rest_api.group_api.id
  resource_id = aws_api_gateway_resource.groups_group_id.id
  http_method = aws_api_gateway_method.groups_put.http_method
  status_code = "200"
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# Invitations API Method Responses
resource "aws_api_gateway_method_response" "invitations_get_response" {
  rest_api_id = aws_api_gateway_rest_api.group_api.id
  resource_id = aws_api_gateway_resource.invitations_resource.id
  http_method = aws_api_gateway_method.invitations_get.http_method
  status_code = "200"
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_method_response" "invitations_options_response" {
  rest_api_id = aws_api_gateway_rest_api.group_api.id
  resource_id = aws_api_gateway_resource.invitations_resource.id
  http_method = aws_api_gateway_method.invitations_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = true
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
  }
}

resource "aws_api_gateway_method_response" "invitations_respond_post_response" {
  rest_api_id = aws_api_gateway_rest_api.group_api.id
  resource_id = aws_api_gateway_resource.invitations_respond.id
  http_method = aws_api_gateway_method.invitations_respond_post.http_method
  status_code = "200"
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_method_response" "invitations_respond_options_response" {
  rest_api_id = aws_api_gateway_rest_api.group_api.id
  resource_id = aws_api_gateway_resource.invitations_respond.id
  http_method = aws_api_gateway_method.invitations_respond_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = true
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
  }
}

# API Gateway deployment
resource "aws_api_gateway_deployment" "vault_deployment" {
  rest_api_id = aws_api_gateway_rest_api.vault_api.id

  depends_on = [
    aws_api_gateway_method.vault_get,
    aws_api_gateway_method.vault_put,
    aws_api_gateway_method.vault_options,
    aws_api_gateway_integration.vault_get_integration,
    aws_api_gateway_integration.vault_put_integration,
    aws_api_gateway_integration.vault_options_integration,
  ]
}

# Wallet API Gateway deployment
resource "aws_api_gateway_deployment" "wallet_deployment" {
  rest_api_id = aws_api_gateway_rest_api.wallet_api.id

  depends_on = [
    aws_api_gateway_method.wallet_get,
    aws_api_gateway_method.wallet_create_post,
    aws_api_gateway_method.wallet_options,
    aws_api_gateway_method.wallet_create_options,
    aws_api_gateway_integration.wallet_get_integration,
    aws_api_gateway_integration.wallet_create_integration,
    aws_api_gateway_integration.wallet_options_integration,
    aws_api_gateway_integration.wallet_create_options_integration,
  ]
}

# API Gateway deployment for onboarding
resource "aws_api_gateway_deployment" "onboarding_deployment" {
  rest_api_id = aws_api_gateway_rest_api.onboarding_api.id

  depends_on = [
    aws_api_gateway_method.onboarding_status_post,
    aws_api_gateway_method.onboarding_status_get,
    aws_api_gateway_method.onboarding_retry_post,
    aws_api_gateway_method.onboarding_start_post,
    aws_api_gateway_method.onboarding_status_options,
    aws_api_gateway_method.onboarding_retry_options,
    aws_api_gateway_method.onboarding_start_options,
    aws_api_gateway_integration.onboarding_status_integration,
    aws_api_gateway_integration.onboarding_status_get_integration,
    aws_api_gateway_integration.onboarding_retry_integration,
    aws_api_gateway_integration.onboarding_start_integration,
    aws_api_gateway_integration.onboarding_status_options_integration,
    aws_api_gateway_integration.onboarding_retry_options_integration,
    aws_api_gateway_integration.onboarding_start_options_integration,
    aws_api_gateway_integration_response.onboarding_status_options_integration_response,
    aws_api_gateway_integration_response.onboarding_retry_options_integration_response,
    aws_api_gateway_integration_response.onboarding_start_options_integration_response,
    aws_api_gateway_integration_response.onboarding_status_post_integration_response,
    aws_api_gateway_integration_response.onboarding_status_get_integration_response,
    aws_api_gateway_integration_response.onboarding_retry_post_integration_response,
    aws_api_gateway_integration_response.onboarding_start_post_integration_response,
    aws_api_gateway_method_response.onboarding_status_post_response,
    aws_api_gateway_method_response.onboarding_status_get_response,
    aws_api_gateway_method_response.onboarding_retry_post_response,
    aws_api_gateway_method_response.onboarding_start_post_response,
    aws_api_gateway_method_response.onboarding_status_options_response,
    aws_api_gateway_method_response.onboarding_retry_options_response,
    aws_api_gateway_method_response.onboarding_start_options_response,
    aws_api_gateway_gateway_response.onboarding_unauthorized,
    aws_api_gateway_gateway_response.onboarding_access_denied,
    aws_api_gateway_gateway_response.onboarding_default_4xx,
    aws_api_gateway_gateway_response.onboarding_default_5xx,
  ]

  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.onboarding_resource.id,
      aws_api_gateway_resource.onboarding_status.id,
      aws_api_gateway_resource.onboarding_retry.id,
      aws_api_gateway_resource.onboarding_start.id,
      aws_api_gateway_method.onboarding_status_post.id,
      aws_api_gateway_method.onboarding_status_get.id,
      aws_api_gateway_method.onboarding_retry_post.id,
      aws_api_gateway_method.onboarding_start_post.id,
      aws_api_gateway_integration.onboarding_status_integration.id,
      aws_api_gateway_integration.onboarding_status_get_integration.id,
      aws_api_gateway_integration.onboarding_retry_integration.id,
      aws_api_gateway_integration.onboarding_start_integration.id,
      aws_api_gateway_integration_response.onboarding_status_post_integration_response.id,
      aws_api_gateway_integration_response.onboarding_status_get_integration_response.id,
      aws_api_gateway_integration_response.onboarding_retry_post_integration_response.id,
      aws_api_gateway_integration_response.onboarding_start_post_integration_response.id,
      aws_api_gateway_integration_response.onboarding_status_options_integration_response.id,
      aws_api_gateway_integration_response.onboarding_retry_options_integration_response.id,
      aws_api_gateway_integration_response.onboarding_start_options_integration_response.id,
      aws_api_gateway_authorizer.onboarding_cognito_authorizer.id,
      "cors-preflight-fix-20250122-v2",
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Hedera API Gateway deployment
resource "aws_api_gateway_deployment" "hedera_deployment" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id

  depends_on = [
    # New endpoints
    aws_api_gateway_method.balance_get,
    aws_api_gateway_method.balance_options,
    aws_api_gateway_method.transactions_get,
    aws_api_gateway_method.transactions_options,
    aws_api_gateway_method.nft_get,
    aws_api_gateway_method.nft_options,
    aws_api_gateway_method.nft_create_post,
    aws_api_gateway_method.nft_create_options,
    aws_api_gateway_method.nft_list_get,
    aws_api_gateway_method.nft_list_options,
    # Existing endpoints
    aws_api_gateway_method.files_get,
    aws_api_gateway_method.files_upload_post,
    aws_api_gateway_method.files_content_get,
    aws_api_gateway_method.files_delete,
    aws_api_gateway_method.files_options,
    aws_api_gateway_method.files_upload_options,
    aws_api_gateway_method.files_content_options,
    aws_api_gateway_method.files_file_id_options,
    aws_api_gateway_method.folders_get,
    aws_api_gateway_method.folders_post,
    aws_api_gateway_method.folders_delete,
    aws_api_gateway_method.folders_options,
    aws_api_gateway_method.folders_folder_id_options,
    # New integrations
    aws_api_gateway_integration.balance_get_integration,
    aws_api_gateway_integration.balance_options_integration,
    aws_api_gateway_integration.transactions_get_integration,
    aws_api_gateway_integration.transactions_options_integration,
    aws_api_gateway_integration.nft_get_integration,
    aws_api_gateway_integration.nft_options_integration,
    aws_api_gateway_integration.nft_create_post_integration,
    aws_api_gateway_integration.nft_create_options_integration,
    aws_api_gateway_integration.nft_list_get_integration,
    aws_api_gateway_integration.nft_list_options_integration,
    # Existing integrations
    aws_api_gateway_integration.files_get_integration,
    aws_api_gateway_integration.files_upload_integration,
    aws_api_gateway_integration.files_content_integration,
    aws_api_gateway_integration.files_delete_integration,
    aws_api_gateway_integration.files_options_integration,
    aws_api_gateway_integration.files_upload_options_integration,
    aws_api_gateway_integration.files_content_options_integration,
    aws_api_gateway_integration.files_file_id_options_integration,
    aws_api_gateway_integration.folders_get_integration,
    aws_api_gateway_integration.folders_post_integration,
    aws_api_gateway_integration.folders_delete_integration,
    aws_api_gateway_integration.folders_options_integration,
    aws_api_gateway_integration.folders_folder_id_options_integration,
    # New method responses
    aws_api_gateway_method_response.balance_get_response,
    aws_api_gateway_method_response.balance_options_response,
    aws_api_gateway_method_response.transactions_get_response,
    aws_api_gateway_method_response.transactions_options_response,
    aws_api_gateway_method_response.nft_get_response,
    aws_api_gateway_method_response.nft_options_response,
    aws_api_gateway_method_response.nft_create_post_response,
    aws_api_gateway_method_response.nft_create_options_response,
    aws_api_gateway_method_response.nft_list_get_response,
    aws_api_gateway_method_response.nft_list_options_response,
    # Existing method responses
    aws_api_gateway_method_response.files_get_response,
    aws_api_gateway_method_response.files_upload_response,
    aws_api_gateway_method_response.files_content_response,
    aws_api_gateway_method_response.files_delete_response,
    aws_api_gateway_method_response.files_options_response,
    aws_api_gateway_method_response.files_upload_options_response,
    aws_api_gateway_method_response.files_content_options_response,
    aws_api_gateway_method_response.files_file_id_options_response,
    aws_api_gateway_method_response.folders_get_response,
    aws_api_gateway_method_response.folders_post_response,
    aws_api_gateway_method_response.folders_delete_response,
    aws_api_gateway_method_response.folders_options_response,
    aws_api_gateway_method_response.folders_folder_id_options_response,
    # New integration responses
    aws_api_gateway_integration_response.balance_get_integration_response,
    aws_api_gateway_integration_response.balance_options_integration_response,
    aws_api_gateway_integration_response.transactions_get_integration_response,
    aws_api_gateway_integration_response.transactions_options_integration_response,
    aws_api_gateway_integration_response.nft_get_integration_response,
    aws_api_gateway_integration_response.nft_options_integration_response,
    aws_api_gateway_integration_response.nft_create_post_integration_response,
    aws_api_gateway_integration_response.nft_create_options_integration_response,
    aws_api_gateway_integration_response.nft_list_get_integration_response,
    aws_api_gateway_integration_response.nft_list_options_integration_response,
    # Existing integration responses
    aws_api_gateway_integration_response.files_get_integration_response,
    aws_api_gateway_integration_response.files_upload_integration_response,
    aws_api_gateway_integration_response.files_content_integration_response,
    aws_api_gateway_integration_response.files_delete_integration_response,
    aws_api_gateway_integration_response.files_options_integration_response,
    aws_api_gateway_integration_response.files_upload_options_integration_response,
    aws_api_gateway_integration_response.files_content_options_integration_response,
    aws_api_gateway_integration_response.files_file_id_options_integration_response,
    aws_api_gateway_integration_response.folders_get_integration_response,
    aws_api_gateway_integration_response.folders_post_integration_response,
    aws_api_gateway_integration_response.folders_delete_integration_response,
    aws_api_gateway_integration_response.folders_options_integration_response,
    aws_api_gateway_integration_response.folders_folder_id_options_integration_response,
    aws_api_gateway_gateway_response.hedera_unauthorized,
    aws_api_gateway_gateway_response.hedera_access_denied,
    aws_api_gateway_gateway_response.hedera_default_4xx,
    aws_api_gateway_gateway_response.hedera_default_5xx,
    aws_api_gateway_gateway_response.hedera_missing_authentication_token,
  ]

  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.files_resource.id,
      aws_api_gateway_resource.files_upload.id,
      aws_api_gateway_resource.files_file_id.id,
      aws_api_gateway_resource.files_content.id,
      aws_api_gateway_resource.folders_resource.id,
      aws_api_gateway_resource.folders_folder_id.id,
      aws_api_gateway_method.files_get.id,
      aws_api_gateway_method.files_upload_post.id,
      aws_api_gateway_method.files_content_get.id,
      aws_api_gateway_method.files_delete.id,
      aws_api_gateway_method.folders_get.id,
      aws_api_gateway_method.folders_post.id,
      aws_api_gateway_method.folders_delete.id,
      aws_api_gateway_method.folders_options.id,
      aws_api_gateway_method.folders_folder_id_options.id,
      aws_api_gateway_integration.files_get_integration.id,
      aws_api_gateway_integration.files_upload_integration.id,
      aws_api_gateway_integration.files_content_integration.id,
      aws_api_gateway_integration.files_delete_integration.id,
      aws_api_gateway_integration.folders_get_integration.id,
      aws_api_gateway_integration.folders_post_integration.id,
      aws_api_gateway_integration.folders_delete_integration.id,
      aws_api_gateway_integration.folders_options_integration.id,
      aws_api_gateway_integration.folders_folder_id_options_integration.id,
      aws_api_gateway_method_response.folders_options_response.id,
      aws_api_gateway_method_response.folders_folder_id_options_response.id,
      aws_api_gateway_integration_response.files_get_integration_response.id,
      aws_api_gateway_integration_response.files_upload_integration_response.id,
      aws_api_gateway_integration_response.files_content_integration_response.id,
      aws_api_gateway_integration_response.files_delete_integration_response.id,
      aws_api_gateway_integration_response.folders_get_integration_response.id,
      aws_api_gateway_integration_response.folders_post_integration_response.id,
      aws_api_gateway_integration_response.folders_delete_integration_response.id,
      aws_api_gateway_integration_response.folders_options_integration_response.id,
      aws_api_gateway_integration_response.folders_folder_id_options_integration_response.id,
      aws_lambda_function.hedera_service.id,
      aws_api_gateway_authorizer.hedera_cognito_authorizer.id,
      "cors-preflight-fix-20250124-v3",
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Lambda permission for API Gateway
resource "aws_lambda_permission" "vault_api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.token_vault.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_api_gateway_rest_api.vault_api.execution_arn}/*/*"
}

# Lambda permission for Hedera Service API Gateway
resource "aws_lambda_permission" "hedera_api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.hedera_service.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_api_gateway_rest_api.hedera_api.execution_arn}/*/*"
}

# Lambda permission for Wallet API Gateway
resource "aws_lambda_permission" "wallet_api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.wallet_manager.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_api_gateway_rest_api.wallet_api.execution_arn}/*/*"
}

# Lambda permission for Cognito User Pool to invoke User Onboarding
resource "aws_lambda_permission" "user_onboarding_cognito" {
  statement_id  = "AllowExecutionFromCognito"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.user_onboarding.function_name
  principal     = "cognito-idp.amazonaws.com"

  source_arn = aws_cognito_user_pool.app_pool_v3.arn
}

# Lambda permission for Onboarding API Gateway
resource "aws_lambda_permission" "onboarding_api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.user_onboarding.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_api_gateway_rest_api.onboarding_api.execution_arn}/*/*"
}

# Lambda permission for Group Manager API Gateway
resource "aws_lambda_permission" "group_api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.group_manager.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_api_gateway_rest_api.group_api.execution_arn}/*/*"
}

# CORS integrations
resource "aws_api_gateway_integration" "onboarding_status_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.onboarding_api.id
  resource_id = aws_api_gateway_resource.onboarding_status.id
  http_method = aws_api_gateway_method.onboarding_status_options.http_method

  type = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_integration" "onboarding_retry_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.onboarding_api.id
  resource_id = aws_api_gateway_resource.onboarding_retry.id
  http_method = aws_api_gateway_method.onboarding_retry_options.http_method

  type = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_integration" "onboarding_start_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.onboarding_api.id
  resource_id = aws_api_gateway_resource.onboarding_start.id
  http_method = aws_api_gateway_method.onboarding_start_options.http_method

  type = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

# Gateway responses for CORS support on errors
resource "aws_api_gateway_gateway_response" "onboarding_unauthorized" {
  rest_api_id   = aws_api_gateway_rest_api.onboarding_api.id
  response_type = "UNAUTHORIZED"
  status_code   = "401"

  response_templates = {
    "application/json" = "{\"message\":\"Unauthorized\"}"
  }

  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Origin"  = "'https://d2xl0r3mv20sy5.cloudfront.net'"
    "gatewayresponse.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-cognito-token'"
    "gatewayresponse.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
    "gatewayresponse.header.Access-Control-Allow-Credentials" = "'true'"
  }
}

resource "aws_api_gateway_gateway_response" "onboarding_access_denied" {
  rest_api_id   = aws_api_gateway_rest_api.onboarding_api.id
  response_type = "ACCESS_DENIED"
  status_code   = "403"

  response_templates = {
    "application/json" = "{\"message\":\"Access Denied\"}"
  }

  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Origin"  = "'https://d2xl0r3mv20sy5.cloudfront.net'"
    "gatewayresponse.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-cognito-token'"
    "gatewayresponse.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
    "gatewayresponse.header.Access-Control-Allow-Credentials" = "'true'"
  }
}

resource "aws_api_gateway_gateway_response" "onboarding_default_4xx" {
  rest_api_id   = aws_api_gateway_rest_api.onboarding_api.id
  response_type = "DEFAULT_4XX"

  response_templates = {
    "application/json" = "{\"message\":$context.error.messageString}"
  }

  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Origin"  = "'https://d2xl0r3mv20sy5.cloudfront.net'"
    "gatewayresponse.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-cognito-token'"
    "gatewayresponse.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
    "gatewayresponse.header.Access-Control-Allow-Credentials" = "'true'"
  }
}

resource "aws_api_gateway_gateway_response" "onboarding_default_5xx" {
  rest_api_id   = aws_api_gateway_rest_api.onboarding_api.id
  response_type = "DEFAULT_5XX"

  response_templates = {
    "application/json" = "{\"message\":$context.error.messageString}"
  }

  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Origin"  = "'https://d2xl0r3mv20sy5.cloudfront.net'"
    "gatewayresponse.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-cognito-token'"
    "gatewayresponse.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
    "gatewayresponse.header.Access-Control-Allow-Credentials" = "'true'"
  }
}

# BALANCE API RESOURCE
resource "aws_api_gateway_resource" "balance_resource" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  parent_id   = aws_api_gateway_rest_api.hedera_api.root_resource_id
  path_part   = "balance"
}

# TRANSACTIONS API RESOURCE
resource "aws_api_gateway_resource" "transactions_resource" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  parent_id   = aws_api_gateway_rest_api.hedera_api.root_resource_id
  path_part   = "transactions"
}

# NFT API RESOURCE
resource "aws_api_gateway_resource" "nft_resource" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  parent_id   = aws_api_gateway_rest_api.hedera_api.root_resource_id
  path_part   = "nft"
}

# NFT CREATE API RESOURCE
resource "aws_api_gateway_resource" "nft_create_resource" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  parent_id   = aws_api_gateway_resource.nft_resource.id
  path_part   = "create"
}

# NFT LIST API RESOURCE
resource "aws_api_gateway_resource" "nft_list_resource" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  parent_id   = aws_api_gateway_resource.nft_resource.id
  path_part   = "list"
}

# BALANCE API METHODS
resource "aws_api_gateway_method" "balance_get" {
  rest_api_id   = aws_api_gateway_rest_api.hedera_api.id
  resource_id   = aws_api_gateway_resource.balance_resource.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.hedera_cognito_authorizer.id
}

resource "aws_api_gateway_method" "balance_options" {
  rest_api_id   = aws_api_gateway_rest_api.hedera_api.id
  resource_id   = aws_api_gateway_resource.balance_resource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# TRANSACTIONS API METHODS
resource "aws_api_gateway_method" "transactions_get" {
  rest_api_id   = aws_api_gateway_rest_api.hedera_api.id
  resource_id   = aws_api_gateway_resource.transactions_resource.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.hedera_cognito_authorizer.id
}

resource "aws_api_gateway_method" "transactions_options" {
  rest_api_id   = aws_api_gateway_rest_api.hedera_api.id
  resource_id   = aws_api_gateway_resource.transactions_resource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# NFT API METHODS
resource "aws_api_gateway_method" "nft_get" {
  rest_api_id   = aws_api_gateway_rest_api.hedera_api.id
  resource_id   = aws_api_gateway_resource.nft_resource.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.hedera_cognito_authorizer.id
}

resource "aws_api_gateway_method" "nft_options" {
  rest_api_id   = aws_api_gateway_rest_api.hedera_api.id
  resource_id   = aws_api_gateway_resource.nft_resource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# NFT CREATE API METHODS
resource "aws_api_gateway_method" "nft_create_post" {
  rest_api_id   = aws_api_gateway_rest_api.hedera_api.id
  resource_id   = aws_api_gateway_resource.nft_create_resource.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.hedera_cognito_authorizer.id
}

resource "aws_api_gateway_method" "nft_create_options" {
  rest_api_id   = aws_api_gateway_rest_api.hedera_api.id
  resource_id   = aws_api_gateway_resource.nft_create_resource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# NFT LIST API METHODS
resource "aws_api_gateway_method" "nft_list_get" {
  rest_api_id   = aws_api_gateway_rest_api.hedera_api.id
  resource_id   = aws_api_gateway_resource.nft_list_resource.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.hedera_cognito_authorizer.id
}

resource "aws_api_gateway_method" "nft_list_options" {
  rest_api_id   = aws_api_gateway_rest_api.hedera_api.id
  resource_id   = aws_api_gateway_resource.nft_list_resource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# FILES API METHODS
resource "aws_api_gateway_method" "files_get" {
  rest_api_id   = aws_api_gateway_rest_api.hedera_api.id
  resource_id   = aws_api_gateway_resource.files_resource.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.hedera_cognito_authorizer.id
}

resource "aws_api_gateway_method" "files_upload_post" {
  rest_api_id   = aws_api_gateway_rest_api.hedera_api.id
  resource_id   = aws_api_gateway_resource.files_upload.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.hedera_cognito_authorizer.id
}

resource "aws_api_gateway_method" "files_content_get" {
  rest_api_id   = aws_api_gateway_rest_api.hedera_api.id
  resource_id   = aws_api_gateway_resource.files_content.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.hedera_cognito_authorizer.id
}

resource "aws_api_gateway_method" "files_delete" {
  rest_api_id   = aws_api_gateway_rest_api.hedera_api.id
  resource_id   = aws_api_gateway_resource.files_file_id.id
  http_method   = "DELETE"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.hedera_cognito_authorizer.id
}

resource "aws_api_gateway_method" "files_options" {
  rest_api_id   = aws_api_gateway_rest_api.hedera_api.id
  resource_id   = aws_api_gateway_resource.files_resource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "files_upload_options" {
  rest_api_id   = aws_api_gateway_rest_api.hedera_api.id
  resource_id   = aws_api_gateway_resource.files_upload.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "files_content_options" {
  rest_api_id   = aws_api_gateway_rest_api.hedera_api.id
  resource_id   = aws_api_gateway_resource.files_content.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "files_file_id_options" {
  rest_api_id   = aws_api_gateway_rest_api.hedera_api.id
  resource_id   = aws_api_gateway_resource.files_file_id.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}



# API Gateway method for /folders GET
resource "aws_api_gateway_method" "folders_get" {
  rest_api_id   = aws_api_gateway_rest_api.hedera_api.id
  resource_id   = aws_api_gateway_resource.folders_resource.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.hedera_cognito_authorizer.id
}

# API Gateway method for /folders POST
resource "aws_api_gateway_method" "folders_post" {
  rest_api_id   = aws_api_gateway_rest_api.hedera_api.id
  resource_id   = aws_api_gateway_resource.folders_resource.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.hedera_cognito_authorizer.id
}

# API Gateway method for /folders/{folderId} DELETE
resource "aws_api_gateway_method" "folders_delete" {
  rest_api_id   = aws_api_gateway_rest_api.hedera_api.id
  resource_id   = aws_api_gateway_resource.folders_folder_id.id
  http_method   = "DELETE"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.hedera_cognito_authorizer.id
}

# API Gateway method for /folders OPTIONS
resource "aws_api_gateway_method" "folders_options" {
  rest_api_id   = aws_api_gateway_rest_api.hedera_api.id
  resource_id   = aws_api_gateway_resource.folders_resource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# API Gateway method for /folders/{folderId} OPTIONS
resource "aws_api_gateway_method" "folders_folder_id_options" {
  rest_api_id   = aws_api_gateway_rest_api.hedera_api.id
  resource_id   = aws_api_gateway_resource.folders_folder_id.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# BALANCE API INTEGRATIONS
resource "aws_api_gateway_integration" "balance_get_integration" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.balance_resource.id
  http_method = aws_api_gateway_method.balance_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.hedera_service.invoke_arn
}

resource "aws_api_gateway_integration" "balance_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.balance_resource.id
  http_method = aws_api_gateway_method.balance_options.http_method

  type = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

# TRANSACTIONS API INTEGRATIONS
resource "aws_api_gateway_integration" "transactions_get_integration" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.transactions_resource.id
  http_method = aws_api_gateway_method.transactions_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.hedera_service.invoke_arn
}

resource "aws_api_gateway_integration" "transactions_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.transactions_resource.id
  http_method = aws_api_gateway_method.transactions_options.http_method

  type = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

# NFT API INTEGRATIONS
resource "aws_api_gateway_integration" "nft_get_integration" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.nft_resource.id
  http_method = aws_api_gateway_method.nft_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.hedera_service.invoke_arn
}

resource "aws_api_gateway_integration" "nft_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.nft_resource.id
  http_method = aws_api_gateway_method.nft_options.http_method

  type = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

# NFT CREATE API INTEGRATIONS
resource "aws_api_gateway_integration" "nft_create_post_integration" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.nft_create_resource.id
  http_method = aws_api_gateway_method.nft_create_post.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.hedera_service.invoke_arn
}

resource "aws_api_gateway_integration" "nft_create_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.nft_create_resource.id
  http_method = aws_api_gateway_method.nft_create_options.http_method

  type = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

# NFT LIST API INTEGRATIONS
resource "aws_api_gateway_integration" "nft_list_get_integration" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.nft_list_resource.id
  http_method = aws_api_gateway_method.nft_list_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.hedera_service.invoke_arn
}

resource "aws_api_gateway_integration" "nft_list_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.nft_list_resource.id
  http_method = aws_api_gateway_method.nft_list_options.http_method

  type = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

# FILES API INTEGRATIONS
resource "aws_api_gateway_integration" "files_get_integration" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.files_resource.id
  http_method = aws_api_gateway_method.files_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.hedera_service.invoke_arn
}

resource "aws_api_gateway_integration" "files_upload_integration" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.files_upload.id
  http_method = aws_api_gateway_method.files_upload_post.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.hedera_service.invoke_arn
}

resource "aws_api_gateway_integration" "files_content_integration" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.files_content.id
  http_method = aws_api_gateway_method.files_content_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.hedera_service.invoke_arn
}

resource "aws_api_gateway_integration" "files_delete_integration" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.files_file_id.id
  http_method = aws_api_gateway_method.files_delete.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.hedera_service.invoke_arn
}

resource "aws_api_gateway_integration" "files_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.files_resource.id
  http_method = aws_api_gateway_method.files_options.http_method

  type = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_integration" "files_upload_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.files_upload.id
  http_method = aws_api_gateway_method.files_upload_options.http_method

  type = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_integration" "files_content_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.files_content.id
  http_method = aws_api_gateway_method.files_content_options.http_method

  type = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_integration" "files_file_id_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.files_file_id.id
  http_method = aws_api_gateway_method.files_file_id_options.http_method
  type        = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}



# API Gateway integration for /folders GET
resource "aws_api_gateway_integration" "folders_get_integration" {
  rest_api_id             = aws_api_gateway_rest_api.hedera_api.id
  resource_id             = aws_api_gateway_resource.folders_resource.id
  http_method             = aws_api_gateway_method.folders_get.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.hedera_service.invoke_arn
}

# API Gateway integration for /folders POST
resource "aws_api_gateway_integration" "folders_post_integration" {
  rest_api_id             = aws_api_gateway_rest_api.hedera_api.id
  resource_id             = aws_api_gateway_resource.folders_resource.id
  http_method             = aws_api_gateway_method.folders_post.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.hedera_service.invoke_arn
}

# API Gateway integration for /folders/{folderId} DELETE
resource "aws_api_gateway_integration" "folders_delete_integration" {
  rest_api_id             = aws_api_gateway_rest_api.hedera_api.id
  resource_id             = aws_api_gateway_resource.folders_folder_id.id
  http_method             = aws_api_gateway_method.folders_delete.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.hedera_service.invoke_arn
}

# API Gateway integration for /folders OPTIONS
resource "aws_api_gateway_integration" "folders_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.folders_resource.id
  http_method = aws_api_gateway_method.folders_options.http_method
  type        = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

# API Gateway integration for /folders/{folderId} OPTIONS
resource "aws_api_gateway_integration" "folders_folder_id_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.folders_folder_id.id
  http_method = aws_api_gateway_method.folders_folder_id_options.http_method
  type        = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

# BALANCE API METHOD RESPONSES
resource "aws_api_gateway_method_response" "balance_get_response" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.balance_resource.id
  http_method = aws_api_gateway_method.balance_get.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_method_response" "balance_options_response" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.balance_resource.id
  http_method = aws_api_gateway_method.balance_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

# TRANSACTIONS API METHOD RESPONSES
resource "aws_api_gateway_method_response" "transactions_get_response" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.transactions_resource.id
  http_method = aws_api_gateway_method.transactions_get.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_method_response" "transactions_options_response" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.transactions_resource.id
  http_method = aws_api_gateway_method.transactions_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

# NFT API METHOD RESPONSES
resource "aws_api_gateway_method_response" "nft_get_response" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.nft_resource.id
  http_method = aws_api_gateway_method.nft_get.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_method_response" "nft_options_response" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.nft_resource.id
  http_method = aws_api_gateway_method.nft_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

# NFT CREATE API METHOD RESPONSES
resource "aws_api_gateway_method_response" "nft_create_post_response" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.nft_create_resource.id
  http_method = aws_api_gateway_method.nft_create_post.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_method_response" "nft_create_options_response" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.nft_create_resource.id
  http_method = aws_api_gateway_method.nft_create_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

# NFT LIST API METHOD RESPONSES
resource "aws_api_gateway_method_response" "nft_list_get_response" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.nft_list_resource.id
  http_method = aws_api_gateway_method.nft_list_get.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_method_response" "nft_list_options_response" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.nft_list_resource.id
  http_method = aws_api_gateway_method.nft_list_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

# FILES API METHOD RESPONSES
resource "aws_api_gateway_method_response" "files_get_response" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.files_resource.id
  http_method = aws_api_gateway_method.files_get.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_method_response" "files_upload_response" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.files_upload.id
  http_method = aws_api_gateway_method.files_upload_post.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_method_response" "files_content_response" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.files_content.id
  http_method = aws_api_gateway_method.files_content_get.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_method_response" "files_delete_response" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.files_file_id.id
  http_method = aws_api_gateway_method.files_delete.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_method_response" "files_options_response" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.files_resource.id
  http_method = aws_api_gateway_method.files_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_method_response" "files_upload_options_response" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.files_upload.id
  http_method = aws_api_gateway_method.files_upload_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_method_response" "files_content_options_response" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.files_content.id
  http_method = aws_api_gateway_method.files_content_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_method_response" "files_file_id_options_response" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.files_file_id.id
  http_method = aws_api_gateway_method.files_file_id_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = true
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
  }
}

# BALANCE CORS INTEGRATION RESPONSES
# Integration response for balance GET method
resource "aws_api_gateway_integration_response" "balance_get_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.balance_resource.id
  http_method = aws_api_gateway_method.balance_get.http_method
  status_code = aws_api_gateway_method_response.balance_get_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'https://d2xl0r3mv20sy5.cloudfront.net'"
  }

  depends_on = [aws_api_gateway_integration.balance_get_integration]
}

# Integration response for balance OPTIONS method
resource "aws_api_gateway_integration_response" "balance_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.balance_resource.id
  http_method = aws_api_gateway_method.balance_options.http_method
  status_code = aws_api_gateway_method_response.balance_options_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-cognito-token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'https://d2xl0r3mv20sy5.cloudfront.net'"
  }

  depends_on = [aws_api_gateway_integration.balance_options_integration]
}

# TRANSACTIONS CORS INTEGRATION RESPONSES
# Integration response for transactions GET method
resource "aws_api_gateway_integration_response" "transactions_get_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.transactions_resource.id
  http_method = aws_api_gateway_method.transactions_get.http_method
  status_code = aws_api_gateway_method_response.transactions_get_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'https://d2xl0r3mv20sy5.cloudfront.net'"
  }

  depends_on = [aws_api_gateway_integration.transactions_get_integration]
}

# Integration response for transactions OPTIONS method
resource "aws_api_gateway_integration_response" "transactions_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.transactions_resource.id
  http_method = aws_api_gateway_method.transactions_options.http_method
  status_code = aws_api_gateway_method_response.transactions_options_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-cognito-token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'https://d2xl0r3mv20sy5.cloudfront.net'"
  }

  depends_on = [aws_api_gateway_integration.transactions_options_integration]
}

# NFT CORS INTEGRATION RESPONSES
# Integration response for nft GET method
resource "aws_api_gateway_integration_response" "nft_get_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.nft_resource.id
  http_method = aws_api_gateway_method.nft_get.http_method
  status_code = aws_api_gateway_method_response.nft_get_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'https://d2xl0r3mv20sy5.cloudfront.net'"
  }

  depends_on = [aws_api_gateway_integration.nft_get_integration]
}

# Integration response for nft OPTIONS method
resource "aws_api_gateway_integration_response" "nft_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.nft_resource.id
  http_method = aws_api_gateway_method.nft_options.http_method
  status_code = aws_api_gateway_method_response.nft_options_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-cognito-token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'https://d2xl0r3mv20sy5.cloudfront.net'"
  }

  depends_on = [aws_api_gateway_integration.nft_options_integration]
}

# NFT CREATE CORS INTEGRATION RESPONSES
# Integration response for nft create POST method
resource "aws_api_gateway_integration_response" "nft_create_post_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.nft_create_resource.id
  http_method = aws_api_gateway_method.nft_create_post.http_method
  status_code = aws_api_gateway_method_response.nft_create_post_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'https://d2xl0r3mv20sy5.cloudfront.net'"
  }

  depends_on = [aws_api_gateway_integration.nft_create_post_integration]
}

# Integration response for nft create OPTIONS method
resource "aws_api_gateway_integration_response" "nft_create_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.nft_create_resource.id
  http_method = aws_api_gateway_method.nft_create_options.http_method
  status_code = aws_api_gateway_method_response.nft_create_options_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-cognito-token'"
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'https://d2xl0r3mv20sy5.cloudfront.net'"
  }

  depends_on = [aws_api_gateway_integration.nft_create_options_integration]
}

# NFT LIST CORS INTEGRATION RESPONSES
# Integration response for nft list GET method
resource "aws_api_gateway_integration_response" "nft_list_get_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.nft_list_resource.id
  http_method = aws_api_gateway_method.nft_list_get.http_method
  status_code = aws_api_gateway_method_response.nft_list_get_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'https://d2xl0r3mv20sy5.cloudfront.net'"
  }

  depends_on = [aws_api_gateway_integration.nft_list_get_integration]
}

# Integration response for nft list OPTIONS method
resource "aws_api_gateway_integration_response" "nft_list_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.nft_list_resource.id
  http_method = aws_api_gateway_method.nft_list_options.http_method
  status_code = aws_api_gateway_method_response.nft_list_options_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-cognito-token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'https://d2xl0r3mv20sy5.cloudfront.net'"
  }

  depends_on = [aws_api_gateway_integration.nft_list_options_integration]
}

# FILES CORS INTEGRATION RESPONSES
# Integration response for files GET method
resource "aws_api_gateway_integration_response" "files_get_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.files_resource.id
  http_method = aws_api_gateway_method.files_get.http_method
  status_code = aws_api_gateway_method_response.files_get_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'https://d2xl0r3mv20sy5.cloudfront.net'"
  }
}

# Integration response for files upload POST method
resource "aws_api_gateway_integration_response" "files_upload_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.files_upload.id
  http_method = aws_api_gateway_method.files_upload_post.http_method
  status_code = aws_api_gateway_method_response.files_upload_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'https://d2xl0r3mv20sy5.cloudfront.net'"
  }
}

# Integration response for files content GET method
resource "aws_api_gateway_integration_response" "files_content_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.files_content.id
  http_method = aws_api_gateway_method.files_content_get.http_method
  status_code = aws_api_gateway_method_response.files_content_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'https://d2xl0r3mv20sy5.cloudfront.net'"
  }
}

# Integration response for files DELETE method
resource "aws_api_gateway_integration_response" "files_delete_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.files_file_id.id
  http_method = aws_api_gateway_method.files_delete.http_method
  status_code = aws_api_gateway_method_response.files_delete_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'https://d2xl0r3mv20sy5.cloudfront.net'"
  }
}

resource "aws_api_gateway_integration_response" "files_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.files_resource.id
  http_method = aws_api_gateway_method.files_options.http_method
  status_code = aws_api_gateway_method_response.files_options_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-cognito-token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,DELETE,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'https://d2xl0r3mv20sy5.cloudfront.net'"
  }
}

resource "aws_api_gateway_integration_response" "files_upload_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.files_upload.id
  http_method = aws_api_gateway_method.files_upload_options.http_method
  status_code = aws_api_gateway_method_response.files_upload_options_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-cognito-token'"
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'https://d2xl0r3mv20sy5.cloudfront.net'"
  }
}

resource "aws_api_gateway_integration_response" "files_content_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.files_content.id
  http_method = aws_api_gateway_method.files_content_options.http_method
  status_code = aws_api_gateway_method_response.files_content_options_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-cognito-token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'https://d2xl0r3mv20sy5.cloudfront.net'"
  }
}

resource "aws_api_gateway_integration_response" "files_file_id_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.files_file_id.id
  http_method = aws_api_gateway_method.files_file_id_options.http_method
  status_code = "200"
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = "'https://d2xl0r3mv20sy5.cloudfront.net'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-cognito-token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,DELETE,OPTIONS'"
  }
}

# FOLDERS API METHOD RESPONSES
resource "aws_api_gateway_method_response" "folders_get_response" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.folders_resource.id
  http_method = aws_api_gateway_method.folders_get.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
    "method.response.header.Access-Control-Allow-Credentials" = true
  }
}

resource "aws_api_gateway_method_response" "folders_post_response" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.folders_resource.id
  http_method = aws_api_gateway_method.folders_post.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
    "method.response.header.Access-Control-Allow-Credentials" = true
  }
}

resource "aws_api_gateway_method_response" "folders_delete_response" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.folders_folder_id.id
  http_method = aws_api_gateway_method.folders_delete.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
    "method.response.header.Access-Control-Allow-Credentials" = true
  }
}

resource "aws_api_gateway_method_response" "folders_options_response" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.folders_resource.id
  http_method = aws_api_gateway_method.folders_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
    "method.response.header.Access-Control-Allow-Credentials" = true
  }
}

resource "aws_api_gateway_method_response" "folders_folder_id_options_response" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.folders_folder_id.id
  http_method = aws_api_gateway_method.folders_folder_id_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
    "method.response.header.Access-Control-Allow-Credentials" = true
  }
}

# FOLDERS CORS INTEGRATION RESPONSES
# Integration response for folders GET method
resource "aws_api_gateway_integration_response" "folders_get_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.folders_resource.id
  http_method = aws_api_gateway_method.folders_get.http_method
  status_code = aws_api_gateway_method_response.folders_get_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'https://d2xl0r3mv20sy5.cloudfront.net'"
  }
}

# Integration response for folders POST method
resource "aws_api_gateway_integration_response" "folders_post_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.folders_resource.id
  http_method = aws_api_gateway_method.folders_post.http_method
  status_code = aws_api_gateway_method_response.folders_post_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'https://d2xl0r3mv20sy5.cloudfront.net'"
  }
}

# Integration response for folders DELETE method
resource "aws_api_gateway_integration_response" "folders_delete_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.folders_folder_id.id
  http_method = aws_api_gateway_method.folders_delete.http_method
  status_code = aws_api_gateway_method_response.folders_delete_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'https://d2xl0r3mv20sy5.cloudfront.net'"
  }
}

resource "aws_api_gateway_integration_response" "folders_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.folders_resource.id
  http_method = aws_api_gateway_method.folders_options.http_method
  status_code = aws_api_gateway_method_response.folders_options_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-cognito-token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,DELETE,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'https://d2xl0r3mv20sy5.cloudfront.net'"
  }
}

resource "aws_api_gateway_integration_response" "folders_folder_id_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.hedera_api.id
  resource_id = aws_api_gateway_resource.folders_folder_id.id
  http_method = aws_api_gateway_method.folders_folder_id_options.http_method
  status_code = aws_api_gateway_method_response.folders_folder_id_options_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-cognito-token'"
    "method.response.header.Access-Control-Allow-Methods" = "'DELETE,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'https://d2xl0r3mv20sy5.cloudfront.net'"
  }
}

# Hedera API Gateway responses for CORS support on errors
resource "aws_api_gateway_gateway_response" "hedera_unauthorized" {
  rest_api_id   = aws_api_gateway_rest_api.hedera_api.id
  response_type = "UNAUTHORIZED"
  status_code   = "401"

  response_templates = {
    "application/json" = "{\"message\":$context.error.messageString}"
  }

  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Origin"  = "'https://d2xl0r3mv20sy5.cloudfront.net'"
    "gatewayresponse.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-cognito-token'"
    "gatewayresponse.header.Access-Control-Allow-Methods" = "'GET,POST,DELETE,OPTIONS'"
    "gatewayresponse.header.Access-Control-Allow-Credentials" = "'true'"
  }
}

resource "aws_api_gateway_gateway_response" "hedera_access_denied" {
  rest_api_id   = aws_api_gateway_rest_api.hedera_api.id
  response_type = "ACCESS_DENIED"
  status_code   = "403"

  response_templates = {
    "application/json" = "{\"message\":$context.error.messageString}"
  }

  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Origin"  = "'https://d2xl0r3mv20sy5.cloudfront.net'"
    "gatewayresponse.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-cognito-token'"
    "gatewayresponse.header.Access-Control-Allow-Methods" = "'GET,POST,DELETE,OPTIONS'"
    "gatewayresponse.header.Access-Control-Allow-Credentials" = "'true'"
  }
}

resource "aws_api_gateway_gateway_response" "hedera_default_4xx" {
  rest_api_id   = aws_api_gateway_rest_api.hedera_api.id
  response_type = "DEFAULT_4XX"

  response_templates = {
    "application/json" = "{\"message\":$context.error.messageString}"
  }

  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Origin"  = "'https://d2xl0r3mv20sy5.cloudfront.net'"
    "gatewayresponse.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-cognito-token'"
    "gatewayresponse.header.Access-Control-Allow-Methods" = "'GET,POST,DELETE,OPTIONS'"
    "gatewayresponse.header.Access-Control-Allow-Credentials" = "'true'"
  }
}

resource "aws_api_gateway_gateway_response" "hedera_default_5xx" {
  rest_api_id   = aws_api_gateway_rest_api.hedera_api.id
  response_type = "DEFAULT_5XX"

  response_templates = {
    "application/json" = "{\"message\":$context.error.messageString}"
  }

  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Origin"  = "'https://d2xl0r3mv20sy5.cloudfront.net'"
    "gatewayresponse.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-cognito-token'"
    "gatewayresponse.header.Access-Control-Allow-Methods" = "'GET,POST,DELETE,OPTIONS'"
    "gatewayresponse.header.Access-Control-Allow-Credentials" = "'true'"
  }
}

resource "aws_api_gateway_gateway_response" "hedera_missing_authentication_token" {
  rest_api_id   = aws_api_gateway_rest_api.hedera_api.id
  response_type = "MISSING_AUTHENTICATION_TOKEN"
  status_code   = "200"

  response_templates = {
    "application/json" = "{}"
  }

  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Origin"  = "'https://d2xl0r3mv20sy5.cloudfront.net'"
    "gatewayresponse.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-cognito-token'"
    "gatewayresponse.header.Access-Control-Allow-Methods" = "'GET,POST,DELETE,OPTIONS'"
    "gatewayresponse.header.Access-Control-Allow-Credentials" = "'true'"
  }
}

# Groups API Gateway responses for CORS support on errors
resource "aws_api_gateway_gateway_response" "groups_unauthorized" {
  rest_api_id   = aws_api_gateway_rest_api.group_api.id
  response_type = "UNAUTHORIZED"
  status_code   = "401"

  response_templates = {
    "application/json" = "{\"message\":\"Unauthorized\"}"
  }

  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Origin"  = "'https://d2xl0r3mv20sy5.cloudfront.net'"
    "gatewayresponse.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-cognito-token'"
    "gatewayresponse.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,OPTIONS'"
    "gatewayresponse.header.Access-Control-Allow-Credentials" = "'true'"
  }
}

resource "aws_api_gateway_gateway_response" "groups_access_denied" {
  rest_api_id   = aws_api_gateway_rest_api.group_api.id
  response_type = "ACCESS_DENIED"
  status_code   = "403"

  response_templates = {
    "application/json" = "{\"message\":\"Access Denied\"}"
  }

  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Origin"  = "'https://d2xl0r3mv20sy5.cloudfront.net'"
    "gatewayresponse.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-cognito-token'"
    "gatewayresponse.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,OPTIONS'"
    "gatewayresponse.header.Access-Control-Allow-Credentials" = "'true'"
  }
}

resource "aws_api_gateway_gateway_response" "groups_default_4xx" {
  rest_api_id   = aws_api_gateway_rest_api.group_api.id
  response_type = "DEFAULT_4XX"

  response_templates = {
    "application/json" = "{\"message\":$context.error.messageString}"
  }

  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Origin"  = "'https://d2xl0r3mv20sy5.cloudfront.net'"
    "gatewayresponse.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-cognito-token'"
    "gatewayresponse.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,OPTIONS'"
    "gatewayresponse.header.Access-Control-Allow-Credentials" = "'true'"
  }
}

resource "aws_api_gateway_gateway_response" "groups_default_5xx" {
  rest_api_id   = aws_api_gateway_rest_api.group_api.id
  response_type = "DEFAULT_5XX"

  response_templates = {
    "application/json" = "{\"message\":$context.error.messageString}"
  }

  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Origin"  = "'https://d2xl0r3mv20sy5.cloudfront.net'"
    "gatewayresponse.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-cognito-token'"
    "gatewayresponse.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,OPTIONS'"
    "gatewayresponse.header.Access-Control-Allow-Credentials" = "'true'"
  }
}

# STAGES FOR ALL APIS
resource "aws_api_gateway_stage" "hedera_stage" {
  deployment_id = aws_api_gateway_deployment.hedera_deployment.id
  rest_api_id   = aws_api_gateway_rest_api.hedera_api.id
  stage_name    = "default"
  
  depends_on = [aws_api_gateway_deployment.hedera_deployment]
}

resource "aws_api_gateway_stage" "onboarding_stage" {
  deployment_id = aws_api_gateway_deployment.onboarding_deployment.id
  rest_api_id   = aws_api_gateway_rest_api.onboarding_api.id
  stage_name    = local.environment
  
  depends_on = [aws_api_gateway_deployment.onboarding_deployment]
}

resource "aws_api_gateway_stage" "wallet_stage" {
  deployment_id = aws_api_gateway_deployment.wallet_deployment.id
  rest_api_id   = aws_api_gateway_rest_api.wallet_api.id
  stage_name    = "default"
  
  depends_on = [aws_api_gateway_deployment.wallet_deployment]
}

resource "aws_api_gateway_stage" "vault_stage" {
  deployment_id = aws_api_gateway_deployment.vault_deployment.id
  rest_api_id   = aws_api_gateway_rest_api.vault_api.id
  stage_name    = "default"
  
  depends_on = [aws_api_gateway_deployment.vault_deployment]
}

# Groups API deployment
resource "aws_api_gateway_deployment" "group_deployment" {
  depends_on = [
    aws_api_gateway_method.groups_get,
    aws_api_gateway_method.groups_post,
    aws_api_gateway_method.groups_put,
    aws_api_gateway_method.groups_options,
    aws_api_gateway_method.groups_members_get,
    aws_api_gateway_method.groups_members_post,
    aws_api_gateway_method.groups_members_options,
    aws_api_gateway_method.groups_wallets_get,
    aws_api_gateway_method.groups_wallets_options,
    aws_api_gateway_method.groups_invitations_get,
    aws_api_gateway_method.groups_invitations_options,
    aws_api_gateway_method.invitations_get,
    aws_api_gateway_method.invitations_options,
    aws_api_gateway_method.invitations_respond_post,
    aws_api_gateway_method.invitations_respond_options,
    aws_api_gateway_integration.groups_get_integration,
    aws_api_gateway_integration.groups_post_integration,
    aws_api_gateway_integration.groups_put_integration,
    aws_api_gateway_integration.groups_options_integration,
    aws_api_gateway_integration.groups_members_get_integration,
    aws_api_gateway_integration.groups_members_post_integration,
    aws_api_gateway_integration.groups_members_options_integration,
    aws_api_gateway_integration.groups_wallets_get_integration,
    aws_api_gateway_integration.groups_wallets_options_integration,
    aws_api_gateway_integration.groups_invitations_get_integration,
    aws_api_gateway_integration.groups_invitations_options_integration,
    aws_api_gateway_integration.invitations_get_integration,
    aws_api_gateway_integration.invitations_options_integration,
    aws_api_gateway_integration.invitations_respond_post_integration,
    aws_api_gateway_integration.invitations_respond_options_integration,
    aws_api_gateway_method_response.groups_get_response,
    aws_api_gateway_method_response.groups_post_response,
    aws_api_gateway_method_response.groups_put_response,
    aws_api_gateway_method_response.groups_options_response,
    aws_api_gateway_method_response.groups_members_get_response,
    aws_api_gateway_method_response.groups_members_post_response,
    aws_api_gateway_method_response.groups_members_options_response,
    aws_api_gateway_method_response.groups_wallets_get_response,
    aws_api_gateway_method_response.groups_wallets_options_response,
    aws_api_gateway_method_response.groups_invitations_get_response,
    aws_api_gateway_method_response.groups_invitations_options_response,
    aws_api_gateway_method_response.invitations_get_response,
    aws_api_gateway_method_response.invitations_options_response,
    aws_api_gateway_method_response.invitations_respond_post_response,
    aws_api_gateway_method_response.invitations_respond_options_response,
    aws_api_gateway_integration_response.groups_options_integration_response,
    aws_api_gateway_integration_response.groups_members_options_integration_response,
    aws_api_gateway_integration_response.groups_wallets_options_integration_response,
    aws_api_gateway_integration_response.groups_invitations_options_integration_response,
    aws_api_gateway_integration_response.invitations_options_integration_response,
    aws_api_gateway_integration_response.invitations_respond_options_integration_response,
  ]

  rest_api_id = aws_api_gateway_rest_api.group_api.id
  
  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.groups_resource.id,
      aws_api_gateway_resource.groups_group_id.id,
      aws_api_gateway_resource.groups_members.id,
      aws_api_gateway_resource.groups_wallets.id,
      aws_api_gateway_resource.groups_invitations.id,
      aws_api_gateway_resource.invitations_resource.id,
      aws_api_gateway_resource.invitations_invitation_id.id,
      aws_api_gateway_resource.invitations_respond.id,
      aws_api_gateway_method.groups_get.id,
      aws_api_gateway_method.groups_post.id,
      aws_api_gateway_method.groups_put.id,
      aws_api_gateway_method.groups_options.id,
      aws_api_gateway_method.groups_members_get.id,
      aws_api_gateway_method.groups_members_post.id,
      aws_api_gateway_method.groups_members_options.id,
      aws_api_gateway_method.groups_wallets_get.id,
      aws_api_gateway_method.groups_wallets_options.id,
      aws_api_gateway_method.groups_invitations_get.id,
      aws_api_gateway_method.groups_invitations_options.id,
      aws_api_gateway_method.invitations_get.id,
      aws_api_gateway_method.invitations_options.id,
      aws_api_gateway_method.invitations_respond_post.id,
      aws_api_gateway_method.invitations_respond_options.id,
      aws_api_gateway_integration.groups_get_integration.id,
      aws_api_gateway_integration.groups_post_integration.id,
      aws_api_gateway_integration.groups_put_integration.id,
      aws_api_gateway_integration.groups_options_integration.id,
      aws_api_gateway_integration.groups_members_get_integration.id,
      aws_api_gateway_integration.groups_members_post_integration.id,
      aws_api_gateway_integration.groups_members_options_integration.id,
      aws_api_gateway_integration.groups_wallets_get_integration.id,
      aws_api_gateway_integration.groups_wallets_options_integration.id,
      aws_api_gateway_integration.groups_invitations_get_integration.id,
      aws_api_gateway_integration.groups_invitations_options_integration.id,
      aws_api_gateway_integration.invitations_get_integration.id,
      aws_api_gateway_integration.invitations_options_integration.id,
      aws_api_gateway_integration.invitations_respond_post_integration.id,
      aws_api_gateway_integration.invitations_respond_options_integration.id,
      aws_api_gateway_method_response.groups_options_response.id,
      aws_api_gateway_method_response.groups_members_options_response.id,
      aws_api_gateway_method_response.groups_wallets_options_response.id,
      aws_api_gateway_method_response.groups_invitations_options_response.id,
      aws_api_gateway_method_response.invitations_options_response.id,
      aws_api_gateway_method_response.invitations_respond_options_response.id,
      aws_api_gateway_integration_response.groups_options_integration_response.id,
      aws_api_gateway_integration_response.groups_members_options_integration_response.id,
      aws_api_gateway_integration_response.groups_wallets_options_integration_response.id,
      aws_api_gateway_integration_response.groups_invitations_options_integration_response.id,
      aws_api_gateway_integration_response.invitations_options_integration_response.id,
      aws_api_gateway_integration_response.invitations_respond_options_integration_response.id,
      "group-api-v4-invitations",
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "group_stage" {
  deployment_id = aws_api_gateway_deployment.group_deployment.id
  rest_api_id   = aws_api_gateway_rest_api.group_api.id
  stage_name    = "default"
  
  depends_on = [aws_api_gateway_deployment.group_deployment]
}

# Invitations API Integrations
resource "aws_api_gateway_integration" "invitations_get_integration" {
  rest_api_id = aws_api_gateway_rest_api.group_api.id
  resource_id = aws_api_gateway_resource.invitations_resource.id
  http_method = aws_api_gateway_method.invitations_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:${var.region}:lambda:path/2015-03-31/functions/${aws_lambda_function.group_manager.arn}/invocations"
}

resource "aws_api_gateway_integration" "invitations_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.group_api.id
  resource_id = aws_api_gateway_resource.invitations_resource.id
  http_method = aws_api_gateway_method.invitations_options.http_method
  type        = "MOCK"
  
  request_templates = {
    "application/json" = jsonencode({
      statusCode = 200
    })
  }
}

resource "aws_api_gateway_integration" "invitations_respond_post_integration" {
  rest_api_id = aws_api_gateway_rest_api.group_api.id
  resource_id = aws_api_gateway_resource.invitations_respond.id
  http_method = aws_api_gateway_method.invitations_respond_post.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:${var.region}:lambda:path/2015-03-31/functions/${aws_lambda_function.group_manager.arn}/invocations"
}

resource "aws_api_gateway_integration" "invitations_respond_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.group_api.id
  resource_id = aws_api_gateway_resource.invitations_respond.id
  http_method = aws_api_gateway_method.invitations_respond_options.http_method
  type        = "MOCK"
  
  request_templates = {
    "application/json" = jsonencode({
      statusCode = 200
    })
  }
}

# Invitations API Integration Responses
resource "aws_api_gateway_integration_response" "invitations_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.group_api.id
  resource_id = aws_api_gateway_resource.invitations_resource.id
  http_method = aws_api_gateway_method.invitations_options.http_method
  status_code = aws_api_gateway_method_response.invitations_options_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = "'https://d2xl0r3mv20sy5.cloudfront.net'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-cognito-token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
  }

  depends_on = [aws_api_gateway_integration.invitations_options_integration]
}

resource "aws_api_gateway_integration_response" "invitations_respond_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.group_api.id
  resource_id = aws_api_gateway_resource.invitations_respond.id
  http_method = aws_api_gateway_method.invitations_respond_options.http_method
  status_code = aws_api_gateway_method_response.invitations_respond_options_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = "'https://d2xl0r3mv20sy5.cloudfront.net'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-cognito-token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
  }

  depends_on = [aws_api_gateway_integration.invitations_respond_options_integration]
} 

# Post-Confirmation Wallet Creator Lambda Function
resource "aws_lambda_function" "post_confirmation_wallet_creator" {
  filename         = "services/post-confirmation-wallet-creator/post-confirmation-wallet-creator-final.zip"
  function_name    = "${local.name_prefix}-post-confirmation-wallet-creator"
  role            = aws_iam_role.post_confirmation_lambda_exec.arn
  handler         = "index.handler"
  source_code_hash = filebase64sha256("services/post-confirmation-wallet-creator/post-confirmation-wallet-creator-final.zip")
  runtime         = "nodejs18.x"
  timeout         = 30
  memory_size     = 256
  
  # Lambda layer containing Hedera SDK and dependencies
  layers = [
    "arn:aws:lambda:ap-southeast-2:994220462693:layer:hedera-sdk-layer:1"
  ]

  environment {
    variables = {
      USER_ONBOARDING_FUNCTION = aws_lambda_function.user_onboarding.function_name
      REGION                   = data.aws_region.current.name
      KMS_KEY_ID               = aws_kms_key.safemate_master_key.key_id
      USER_POOL_ID             = aws_cognito_user_pool.app_pool_v3.id
      DYNAMODB_TABLE           = aws_dynamodb_table.user_secrets.name
      WALLET_KEYS_TABLE        = aws_dynamodb_table.wallet_keys.name
      APP_SECRETS_KMS_KEY_ID   = aws_kms_key.safemate_master_key.key_id
      HEDERA_NETWORK           = "testnet"
    }
  }

  tags = {
    Environment = var.environment
    Application = var.app_name
    Component   = "post-confirmation-wallet-creator"
  }

  depends_on = [
    aws_iam_role_policy_attachment.post_confirmation_lambda_logs,
    aws_iam_role_policy_attachment.post_confirmation_lambda_permissions,
    aws_cloudwatch_log_group.post_confirmation_lambda_logs,
  ]
}

# Post-Confirmation Lambda execution role
resource "aws_iam_role" "post_confirmation_lambda_exec" {
  name = "${local.name_prefix}-post-confirmation-lambda-exec"

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
  }
}

# Post-Confirmation Lambda logging policy
resource "aws_iam_policy" "post_confirmation_lambda_logging" {
  name        = "${local.name_prefix}-post-confirmation-lambda-logging"
  description = "IAM policy for post-confirmation lambda logging"

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

# Post-Confirmation Lambda permissions policy
resource "aws_iam_policy" "post_confirmation_permissions" {
  name        = "${local.name_prefix}-post-confirmation-permissions"
  description = "IAM policy for post-confirmation operations"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "lambda:InvokeFunction"
        ]
        Resource = "arn:aws:lambda:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:function:${local.name_prefix}-user-onboarding"
      },
      {
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
          aws_dynamodb_table.wallet_metadata.arn,
          aws_dynamodb_table.wallet_keys.arn,
          aws_dynamodb_table.user_secrets.arn,
          aws_dynamodb_table.wallet_audit.arn,
          "${aws_dynamodb_table.wallet_metadata.arn}/*",
          "${aws_dynamodb_table.wallet_keys.arn}/*",
          "${aws_dynamodb_table.user_secrets.arn}/*",
          "${aws_dynamodb_table.wallet_audit.arn}/*"
        ]
      },
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
          "secretsmanager:GetSecretValue",
          "secretsmanager:PutSecretValue",
          "secretsmanager:UpdateSecret",
          "secretsmanager:CreateSecret",
          "secretsmanager:DescribeSecret"
        ]
        Resource = [
          "${aws_secretsmanager_secret.hedera_private_keys.arn}*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:ListSecrets"
        ]
        Resource = "*"
        Condition = {
          StringLike = {
            "secretsmanager:Name" = "safemate/*"
          }
        }
      }
    ]
  })
}

# Post-Confirmation Lambda CloudWatch log group
resource "aws_cloudwatch_log_group" "post_confirmation_lambda_logs" {
  name              = "/aws/lambda/${local.name_prefix}-post-confirmation-wallet-creator"
  retention_in_days = local.environment == "dev" ? 7 : 14  # Environment-specific retention

  tags = {
    Environment = var.environment
    Application = var.app_name
  }
}

# Post-Confirmation Lambda role policy attachments
resource "aws_iam_role_policy_attachment" "post_confirmation_lambda_logs" {
  role       = aws_iam_role.post_confirmation_lambda_exec.name
  policy_arn = aws_iam_policy.post_confirmation_lambda_logging.arn
}

resource "aws_iam_role_policy_attachment" "post_confirmation_lambda_permissions" {
  role       = aws_iam_role.post_confirmation_lambda_exec.name
  policy_arn = aws_iam_policy.post_confirmation_permissions.arn
}

# Attach KMS and Secrets Manager access policy
resource "aws_iam_role_policy_attachment" "post_confirmation_kms_secrets" {
  role       = aws_iam_role.post_confirmation_lambda_exec.name
  policy_arn = aws_iam_policy.safemate_kms_secrets_access.arn
}

# Integration responses for onboarding POST endpoints
resource "aws_api_gateway_integration_response" "onboarding_status_post_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.onboarding_api.id
  resource_id = aws_api_gateway_resource.onboarding_status.id
  http_method = aws_api_gateway_method.onboarding_status_post.http_method
  status_code = aws_api_gateway_method_response.onboarding_status_post_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'https://d2xl0r3mv20sy5.cloudfront.net'"
  }

  depends_on = [aws_api_gateway_integration.onboarding_status_integration]
}

# Integration response for onboarding status GET
resource "aws_api_gateway_integration_response" "onboarding_status_get_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.onboarding_api.id
  resource_id = aws_api_gateway_resource.onboarding_status.id
  http_method = aws_api_gateway_method.onboarding_status_get.http_method
  status_code = aws_api_gateway_method_response.onboarding_status_get_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'https://d2xl0r3mv20sy5.cloudfront.net'"
  }

  depends_on = [aws_api_gateway_integration.onboarding_status_get_integration]
}

resource "aws_api_gateway_integration_response" "onboarding_retry_post_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.onboarding_api.id
  resource_id = aws_api_gateway_resource.onboarding_retry.id
  http_method = aws_api_gateway_method.onboarding_retry_post.http_method
  status_code = aws_api_gateway_method_response.onboarding_retry_post_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'https://d2xl0r3mv20sy5.cloudfront.net'"
  }

  depends_on = [aws_api_gateway_integration.onboarding_retry_integration]
}

resource "aws_api_gateway_integration_response" "onboarding_start_post_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.onboarding_api.id
  resource_id = aws_api_gateway_resource.onboarding_start.id
  http_method = aws_api_gateway_method.onboarding_start_post.http_method
  status_code = aws_api_gateway_method_response.onboarding_start_post_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'https://d2xl0r3mv20sy5.cloudfront.net'"
  }

  depends_on = [aws_api_gateway_integration.onboarding_start_integration]
}

# Integration responses for CORS
