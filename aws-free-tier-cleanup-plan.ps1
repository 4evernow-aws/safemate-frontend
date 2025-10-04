# AWS Free Tier Cleanup Plan for SafeMate
Write-Host "🧹 AWS Free Tier Cleanup Plan for SafeMate" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Current status from monitoring
Write-Host "`n📊 Current AWS Usage Status:" -ForegroundColor Yellow
Write-Host "Lambda Functions: 16/7 (OVER LIMIT)" -ForegroundColor Red
Write-Host "DynamoDB Tables: 32/25 (OVER LIMIT)" -ForegroundColor Red
Write-Host "S3 Buckets: 10/5 (OVER LIMIT)" -ForegroundColor Red
Write-Host "API Gateway APIs: 15/10 (OVER LIMIT)" -ForegroundColor Red
Write-Host "KMS Keys: 4/1 (OVER LIMIT)" -ForegroundColor Red
Write-Host "Cognito User Pools: 0/5 (WITHIN LIMIT)" -ForegroundColor Green
Write-Host "CloudFront Distributions: 2/2 (WITHIN LIMIT)" -ForegroundColor Green
Write-Host "Secrets Manager: 1/2 (WITHIN LIMIT)" -ForegroundColor Green

Write-Host "`n🎯 Cleanup Strategy:" -ForegroundColor Cyan
Write-Host "1. Remove ALL development environment resources" -ForegroundColor White
Write-Host "2. Keep ONLY preprod environment resources" -ForegroundColor White
Write-Host "3. Target: $1.40/month (within free tier)" -ForegroundColor Green

Write-Host "`n🗑️ Resources to Remove:" -ForegroundColor Yellow

# Lambda Functions to remove (dev environment)
Write-Host "`n📦 Lambda Functions (9 to remove):" -ForegroundColor Red
$devLambdaFunctions = @(
    "dev-safemate-user-onboarding",
    "dev-safemate-group-manager", 
    "dev-safemate-email-verification",
    "dev-safemate-wallet-manager",
    "dev-safemate-token-vault",
    "dev-safemate-directory-creator",
    "dev-safemate-hedera-service",
    "dev-safemate-post-confirmation-wallet-creator",
    "dev-safemate-hedera-service-backup"
)

foreach ($func in $devLambdaFunctions) {
    Write-Host "  - $func" -ForegroundColor Gray
}

# DynamoDB Tables to remove (dev environment)
Write-Host "`n🗄️ DynamoDB Tables (17 to remove):" -ForegroundColor Red
$devDynamoTables = @(
    "dev-safemate-user-profiles",
    "dev-safemate-wallet-metadata",
    "dev-safemate-wallet-keys",
    "dev-safemate-hedera-folders",
    "dev-safemate-group-memberships",
    "dev-safemate-email-verifications",
    "dev-safemate-token-vaults",
    "dev-safemate-directory-structure",
    "dev-safemate-hedera-transactions",
    "dev-safemate-user-sessions",
    "dev-safemate-wallet-backups",
    "dev-safemate-hedera-accounts",
    "dev-safemate-nft-collections",
    "dev-safemate-folder-hierarchy",
    "dev-safemate-user-preferences",
    "dev-safemate-audit-logs",
    "dev-safemate-system-config"
)

foreach ($table in $devDynamoTables) {
    Write-Host "  - $table" -ForegroundColor Gray
}

# S3 Buckets to remove (dev environment)
Write-Host "`n🪣 S3 Buckets (5 to remove):" -ForegroundColor Red
$devS3Buckets = @(
    "dev-safemate-static-hosting",
    "safemate-lambda-deployments-dev",
    "dev-safemate-user-uploads",
    "dev-safemate-backups",
    "dev-safemate-logs"
)

foreach ($bucket in $devS3Buckets) {
    Write-Host "  - $bucket" -ForegroundColor Gray
}

# API Gateway APIs to remove (dev environment)
Write-Host "`n🌐 API Gateway APIs (8 to remove):" -ForegroundColor Red
$devAPIs = @(
    "dev-safemate-user-api",
    "dev-safemate-wallet-api", 
    "dev-safemate-hedera-api",
    "dev-safemate-group-api",
    "dev-safemate-email-api",
    "dev-safemate-token-api",
    "dev-safemate-directory-api",
    "dev-safemate-admin-api"
)

foreach ($api in $devAPIs) {
    Write-Host "  - $api" -ForegroundColor Gray
}

# KMS Keys to remove (keep only preprod)
Write-Host "`n🔐 KMS Keys (3 to remove):" -ForegroundColor Red
$devKMSKeys = @(
    "dev-safemate-wallet-encryption",
    "dev-safemate-data-encryption", 
    "dev-safemate-backup-encryption"
)

foreach ($key in $devKMSKeys) {
    Write-Host "  - $key" -ForegroundColor Gray
}

Write-Host "`n✅ Resources to Keep (Preprod Environment):" -ForegroundColor Green

# Resources to keep
Write-Host "`n📦 Lambda Functions (7 to keep):" -ForegroundColor Green
$keepLambdaFunctions = @(
    "preprod-safemate-hedera-service",
    "preprod-safemate-user-onboarding",
    "preprod-safemate-wallet-manager",
    "preprod-safemate-group-manager",
    "preprod-safemate-email-verification",
    "preprod-safemate-token-vault",
    "preprod-safemate-directory-creator"
)

foreach ($func in $keepLambdaFunctions) {
    Write-Host "  - $func" -ForegroundColor White
}

Write-Host "`n🗄️ DynamoDB Tables (17 to keep):" -ForegroundColor Green
$keepDynamoTables = @(
    "preprod-safemate-user-profiles",
    "preprod-safemate-wallet-metadata",
    "preprod-safemate-wallet-keys",
    "preprod-safemate-hedera-folders",
    "preprod-safemate-group-memberships",
    "preprod-safemate-email-verifications",
    "preprod-safemate-token-vaults",
    "preprod-safemate-directory-structure",
    "preprod-safemate-hedera-transactions",
    "preprod-safemate-user-sessions",
    "preprod-safemate-wallet-backups",
    "preprod-safemate-hedera-accounts",
    "preprod-safemate-nft-collections",
    "preprod-safemate-folder-hierarchy",
    "preprod-safemate-user-preferences",
    "preprod-safemate-audit-logs",
    "preprod-safemate-system-config"
)

foreach ($table in $keepDynamoTables) {
    Write-Host "  - $table" -ForegroundColor White
}

Write-Host "`n🪣 S3 Buckets (5 to keep):" -ForegroundColor Green
$keepS3Buckets = @(
    "preprod-safemate-static-hosting",
    "safemate-lambda-deployments-preprod",
    "preprod-safemate-user-uploads",
    "preprod-safemate-backups",
    "preprod-safemate-logs"
)

foreach ($bucket in $keepS3Buckets) {
    Write-Host "  - $bucket" -ForegroundColor White
}

Write-Host "`n🌐 API Gateway APIs (7 to keep):" -ForegroundColor Green
$keepAPIs = @(
    "preprod-safemate-user-api",
    "preprod-safemate-wallet-api",
    "preprod-safemate-hedera-api", 
    "preprod-safemate-group-api",
    "preprod-safemate-email-api",
    "preprod-safemate-token-api",
    "preprod-safemate-directory-api"
)

foreach ($api in $keepAPIs) {
    Write-Host "  - $api" -ForegroundColor White
}

Write-Host "`n🔐 KMS Keys (1 to keep):" -ForegroundColor Green
Write-Host "  - preprod-safemate-wallet-encryption" -ForegroundColor White

Write-Host "`n💰 Cost Impact:" -ForegroundColor Cyan
Write-Host "Current Monthly Cost: $25-68" -ForegroundColor Red
Write-Host "After Cleanup: $1.40" -ForegroundColor Green
Write-Host "Monthly Savings: $23.60-66.60" -ForegroundColor Green
Write-Host "Annual Savings: $283-799" -ForegroundColor Green

Write-Host "`n🎯 Target State After Cleanup:" -ForegroundColor Cyan
Write-Host "Lambda Functions: 7/7 (WITHIN LIMIT)" -ForegroundColor Green
Write-Host "DynamoDB Tables: 17/25 (WITHIN LIMIT)" -ForegroundColor Green
Write-Host "S3 Buckets: 5/5 (WITHIN LIMIT)" -ForegroundColor Green
Write-Host "API Gateway APIs: 7/10 (WITHIN LIMIT)" -ForegroundColor Green
Write-Host "KMS Keys: 1/1 (WITHIN LIMIT)" -ForegroundColor Green
Write-Host "Cognito User Pools: 0/5 (WITHIN LIMIT)" -ForegroundColor Green
Write-Host "CloudFront Distributions: 2/2 (WITHIN LIMIT)" -ForegroundColor Green
Write-Host "Secrets Manager: 1/2 (WITHIN LIMIT)" -ForegroundColor Green

Write-Host "`n⚠️  WARNING: This cleanup will remove ALL development environment resources!" -ForegroundColor Red
Write-Host "Make sure you have backups of any important data before proceeding." -ForegroundColor Yellow

Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Review the resources to be removed" -ForegroundColor White
Write-Host "2. Backup any important development data" -ForegroundColor White
Write-Host "3. Run the cleanup script to remove dev resources" -ForegroundColor White
Write-Host "4. Verify all preprod resources are working" -ForegroundColor White
Write-Host "5. Monitor costs to ensure they stay within free tier" -ForegroundColor White
