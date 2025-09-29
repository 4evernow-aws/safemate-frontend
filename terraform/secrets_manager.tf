# Secrets Manager for storing encrypted private keys
resource "aws_secretsmanager_secret" "hedera_private_keys" {
  name                    = "safemate/hedera/private-keys-dev"
  description             = "SafeMate Hedera private keys encrypted with KMS"
  kms_key_id             = aws_kms_key.safemate_master_key.arn
  recovery_window_in_days = 7

  # Cross-region replica for disaster recovery
  replica {
    region     = "us-east-1"
    kms_key_id = aws_kms_key.safemate_master_key.arn
  }

  tags = {
    Name        = "SafeMate Hedera Keys"
    Environment = "development"
    Service     = "safemate"
    Migration   = "kms-enhancement"
    Security    = "high"
    Type        = "private-keys"
  }
}

# IAM policy for Secrets Manager access
resource "aws_secretsmanager_secret_policy" "hedera_private_keys_policy" {
  secret_arn = aws_secretsmanager_secret.hedera_private_keys.arn

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowLambdaAccess"
        Effect    = "Allow"
        Principal = {
          AWS = [
                    "arn:aws:iam::994220462693:role/dev-safemate-user-onboarding-lambda-exec",
        "arn:aws:iam::994220462693:role/dev-safemate-wallet-lambda-exec",
        "arn:aws:iam::994220462693:role/dev-safemate-hedera-lambda-exec",
        "arn:aws:iam::994220462693:role/dev-safemate-group-lambda-exec",
        "arn:aws:iam::994220462693:role/dev-safemate-vault-lambda-exec"
          ]
        }
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:PutSecretValue",
          "secretsmanager:UpdateSecret",
          "secretsmanager:CreateSecret",
          "secretsmanager:DescribeSecret"
        ]
        Resource = "${aws_secretsmanager_secret.hedera_private_keys.arn}*"
      },
      {
        Sid       = "AllowListSecrets"
        Effect    = "Allow"
        Principal = {
          AWS = [
                    "arn:aws:iam::994220462693:role/dev-safemate-user-onboarding-lambda-exec",
        "arn:aws:iam::994220462693:role/dev-safemate-wallet-lambda-exec"
          ]
        }
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

# CloudWatch Alarms for Secrets Manager monitoring
resource "aws_cloudwatch_metric_alarm" "secrets_manager_access" {
  alarm_name          = "safemate-secrets-manager-access"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "SecretAccessCount"
  namespace           = "AWS/SecretsManager"
  period              = "300"
  statistic           = "Sum"
  threshold           = "100"
  alarm_description   = "Monitor Secrets Manager access for SafeMate"
  alarm_actions       = []

  dimensions = {
    SecretName = aws_secretsmanager_secret.hedera_private_keys.name
  }

  tags = {
    Name        = "SafeMate Secrets Manager Access Alarm"
    Environment = "development"
    Service     = "safemate"
  }
}

# Output the secrets manager ARN
output "secrets_manager_arn" {
  value = aws_secretsmanager_secret.hedera_private_keys.arn
}

output "secrets_manager_name" {
  value = aws_secretsmanager_secret.hedera_private_keys.name
} 