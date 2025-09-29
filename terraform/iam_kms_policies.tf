# Enhanced IAM policy for KMS and Secrets Manager access
resource "aws_iam_policy" "safemate_kms_secrets_access" {
  name        = "SafeMateLambdaKMSSecretsAccess"
  description = "Allow SafeMate Lambda functions to access KMS and Secrets Manager"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "KMSAccess"
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:GenerateDataKey*",
          "kms:CreateGrant",
          "kms:DescribeKey",
          "kms:ReEncrypt*"
        ]
        Resource = [aws_kms_key.safemate_master_key.arn]
        Condition = {
          StringEquals = {
            "kms:ViaService" = "secretsmanager.ap-southeast-2.amazonaws.com"
          }
        }
      },
      {
        Sid    = "SecretsManagerAccess"
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
        Sid    = "ListSecrets"
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
      },
      {
        Sid    = "CloudWatchLogs"
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams"
        ]
        Resource = [
                  "arn:aws:logs:ap-southeast-2:994220462693:log-group:/aws/lambda/dev-safemate-*",
        "arn:aws:logs:ap-southeast-2:994220462693:log-group:/aws/lambda/dev-safemate-*:*"
        ]
      }
    ]
  })

  tags = {
    Name        = "SafeMate KMS Secrets Access Policy"
    Environment = "development"
    Service     = "safemate"
    Security    = "high"
  }
}

# Attach the policy to existing Lambda roles
resource "aws_iam_role_policy_attachment" "user_onboarding_kms_secrets" {
  role       = "dev-safemate-user-onboarding-lambda-exec"
  policy_arn = aws_iam_policy.safemate_kms_secrets_access.arn
}

resource "aws_iam_role_policy_attachment" "wallet_manager_kms_secrets" {
  role       = "dev-safemate-wallet-lambda-exec"
  policy_arn = aws_iam_policy.safemate_kms_secrets_access.arn
}

resource "aws_iam_role_policy_attachment" "hedera_service_kms_secrets" {
  role       = "dev-safemate-hedera-lambda-exec"
  policy_arn = aws_iam_policy.safemate_kms_secrets_access.arn
}

resource "aws_iam_role_policy_attachment" "group_manager_kms_secrets" {
  role       = "dev-safemate-group-lambda-exec"
  policy_arn = aws_iam_policy.safemate_kms_secrets_access.arn
}

resource "aws_iam_role_policy_attachment" "token_vault_kms_secrets" {
  role       = "dev-safemate-vault-lambda-exec"
  policy_arn = aws_iam_policy.safemate_kms_secrets_access.arn
}

# Additional security policy for audit logging
resource "aws_iam_policy" "safemate_audit_logging" {
  name        = "SafeMateAuditLogging"
  description = "Allow SafeMate Lambda functions to write audit logs"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AuditLogging"
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = [
          "arn:aws:logs:ap-southeast-2:994220462693:log-group:/aws/lambda/safemate-audit-*",
          "arn:aws:logs:ap-southeast-2:994220462693:log-group:/aws/lambda/safemate-audit-*:*"
        ]
      }
    ]
  })

  tags = {
    Name        = "SafeMate Audit Logging Policy"
    Environment = "development"
    Service     = "safemate"
    Security    = "audit"
  }
}

# Attach audit logging policy to key roles
resource "aws_iam_role_policy_attachment" "user_onboarding_audit" {
  role       = "dev-safemate-user-onboarding-lambda-exec"
  policy_arn = aws_iam_policy.safemate_audit_logging.arn
}

resource "aws_iam_role_policy_attachment" "wallet_manager_audit" {
  role       = "dev-safemate-wallet-lambda-exec"
  policy_arn = aws_iam_policy.safemate_audit_logging.arn
} 