# KMS Master Key for SafeMate encryption
resource "aws_kms_key" "safemate_master_key" {
  description             = "SafeMate master encryption key for private key protection"
  deletion_window_in_days = 7
  enable_key_rotation     = true
  is_enabled              = true

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "Enable IAM User Permissions"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::994220462693:root"
        }
        Action   = "kms:*"
        Resource = "*"
      }
    ]
  })

  tags = {
    Name        = "SafeMate Master Key"
    Environment = "development"
    Service     = "safemate"
    Migration   = "kms-enhancement"
    Security    = "high"
    Rotation    = "enabled"
  }
}

resource "aws_kms_alias" "safemate_master_key_alias" {
  name          = "alias/safemate-master-key-dev"
  target_key_id = aws_kms_key.safemate_master_key.key_id
}

# CloudWatch Alarms for KMS monitoring
resource "aws_cloudwatch_metric_alarm" "kms_key_usage" {
  alarm_name          = "safemate-kms-key-usage"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "NumberOfRequests"
  namespace           = "AWS/KMS"
  period              = "300"
  statistic           = "Sum"
  threshold           = "1000"
  alarm_description   = "Monitor KMS key usage for SafeMate"
  alarm_actions       = []

  dimensions = {
    KeyId = aws_kms_key.safemate_master_key.key_id
  }

  tags = {
    Name        = "SafeMate KMS Usage Alarm"
    Environment = "development"
    Service     = "safemate"
  }
}

# Output the KMS key ARN for use in other resources
output "safemate_kms_key_arn" {
  value = aws_kms_key.safemate_master_key.arn
}

output "safemate_kms_key_id" {
  value = aws_kms_key.safemate_master_key.key_id
}

output "safemate_kms_alias" {
  value = aws_kms_alias.safemate_master_key_alias.name
}

 