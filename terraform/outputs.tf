output "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  value       = aws_cognito_user_pool.app_pool_v3.id
}

output "cognito_app_client_id" {
  description = "Cognito App Client ID"
  value       = aws_cognito_user_pool_client.app_client.id
}

output "s3_bucket_name" {
  description = "S3 bucket name for static website hosting"
  value       = aws_s3_bucket.static_hosting.bucket
}

output "s3_website_endpoint" {
  description = "S3 website endpoint URL"
  value       = aws_s3_bucket_website_configuration.static_hosting_website.website_endpoint
}

output "s3_website_url" {
  description = "S3 website URL"
  value       = "http://${aws_s3_bucket_website_configuration.static_hosting_website.website_endpoint}"
}

output "aws_account_id" {
  description = "AWS Account ID"
  value       = data.aws_caller_identity.current.account_id
}

output "region" {
  description = "AWS Region"
  value       = var.region
}

output "cognito_domain" {
  description = "Cognito Hosted UI Domain"
  value       = aws_cognito_user_pool_domain.app_domain.domain
}

output "cognito_hosted_ui_url" {
  description = "Cognito Hosted UI Login URL"
  value       = "https://${aws_cognito_user_pool_domain.app_domain.domain}.auth.${var.region}.amazoncognito.com"
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name (HTTPS enabled)"
  value       = aws_cloudfront_distribution.app_distribution.domain_name
}

output "app_url" {
  description = "Application URL with HTTPS"
  value       = "https://${aws_cloudfront_distribution.app_distribution.domain_name}"
}

# Token Vault API Gateway Output
output "vault_api_url" {
  description = "URL for the Token Vault API Gateway"
  value       = "https://${aws_api_gateway_rest_api.vault_api.id}.execute-api.${var.region}.amazonaws.com/${local.environment}"
}

output "vault_lambda_function_name" {
  description = "Name of the Token Vault Lambda function"
  value       = aws_lambda_function.token_vault.function_name
}

output "hedera_lambda_function_name" {
  description = "Name of the Hedera Service Lambda function"
  value       = aws_lambda_function.hedera_service.function_name
}

# Wallet Manager API Gateway Output
output "hedera_api_url" {
  description = "URL for the Hedera Service API Gateway"
  value       = "https://${aws_api_gateway_rest_api.hedera_api.id}.execute-api.${var.region}.amazonaws.com/${local.environment}"
}

output "wallet_api_url" {
  description = "URL for the Wallet Manager API Gateway"
  value       = "https://${aws_api_gateway_rest_api.wallet_api.id}.execute-api.${var.region}.amazonaws.com/${local.environment}"
}

output "onboarding_api_url" {
  description = "URL for the User Onboarding API Gateway"
  value       = "https://${aws_api_gateway_rest_api.onboarding_api.id}.execute-api.${var.region}.amazonaws.com/${local.environment}"
}

output "group_api_url" {
  description = "URL for the Group Manager API Gateway"
  value       = "https://${aws_api_gateway_rest_api.group_api.id}.execute-api.${var.region}.amazonaws.com/${local.environment}"
}

output "wallet_lambda_function_name" {
  description = "Name of the Wallet Manager Lambda function"
  value       = aws_lambda_function.wallet_manager.function_name
}

output "user_onboarding_lambda_function_name" {
  description = "Name of the User Onboarding Lambda function"
  value       = aws_lambda_function.user_onboarding.function_name
}

# KMS Keys - Defined in kms.tf

# DynamoDB Tables
output "wallet_keys_table_name" {
  description = "Wallet Keys DynamoDB Table Name"
  value       = aws_dynamodb_table.wallet_keys.name
}

output "wallet_metadata_table_name" {
  description = "Wallet Metadata DynamoDB Table Name"
  value       = aws_dynamodb_table.wallet_metadata.name
}

output "wallet_audit_table_name" {
  description = "Wallet Audit DynamoDB Table Name"
  value       = aws_dynamodb_table.wallet_audit.name
} 