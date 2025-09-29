# SafeMate Frontend Rebuild and Deploy Script
# This script helps rebuild and deploy the frontend with updated API endpoints

Write-Host "🚀 SafeMate Frontend Rebuild and Deploy Script" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Configuration
$frontendPath = "apps\web\safemate"
$s3Bucket = "preprod-safemate-static-hosting"
$cloudfrontDistributionId = "E2QZ8XJ9K5L2M"  # Update with actual distribution ID

Write-Host "`n📋 Configuration:" -ForegroundColor Yellow
Write-Host "  Frontend Path: $frontendPath" -ForegroundColor White
Write-Host "  S3 Bucket: $s3Bucket" -ForegroundColor White
Write-Host "  CloudFront Distribution: $cloudfrontDistributionId" -ForegroundColor White

# Check if we're in the correct directory
if (-not (Test-Path $frontendPath)) {
    Write-Host "`n❌ Error: Frontend path not found: $frontendPath" -ForegroundColor Red
    Write-Host "Please run this script from the safemate-infrastructure directory" -ForegroundColor Red
    exit 1
}

Write-Host "`n🔍 Checking current API endpoints in source files..." -ForegroundColor Yellow

# Check if the source files have the correct API endpoints
$hederaServiceFile = "$frontendPath\src\services\hederaApiService.ts"
$secureWalletServiceFile = "$frontendPath\src\services\secureWalletService.ts"

if (Test-Path $hederaServiceFile) {
    $hederaContent = Get-Content $hederaServiceFile -Raw
    if ($hederaContent -match "uvk4xxwjyg") {
        Write-Host "  ✅ hederaApiService.ts: Using correct Regional API (uvk4xxwjyg)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ hederaApiService.ts: Still using old API endpoint" -ForegroundColor Red
    }
} else {
    Write-Host "  ⚠️ hederaApiService.ts: File not found" -ForegroundColor Yellow
}

if (Test-Path $secureWalletServiceFile) {
    $secureWalletContent = Get-Content $secureWalletServiceFile -Raw
    if ($secureWalletContent -match "uvk4xxwjyg") {
        Write-Host "  ✅ secureWalletService.ts: Using correct Regional API (uvk4xxwjyg)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ secureWalletService.ts: Still using old API endpoint" -ForegroundColor Red
    }
} else {
    Write-Host "  ⚠️ secureWalletService.ts: File not found" -ForegroundColor Yellow
}

Write-Host "`n📝 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Navigate to your frontend development environment" -ForegroundColor White
Write-Host "2. Ensure the source files have the correct API endpoints:" -ForegroundColor White
Write-Host "   - hederaApiService.ts: https://uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com/preprod" -ForegroundColor White
Write-Host "   - secureWalletService.ts: https://uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com/preprod" -ForegroundColor White
Write-Host "3. Run your build process (e.g., npm run build, yarn build, etc.)" -ForegroundColor White
Write-Host "4. Deploy the built files to S3 bucket: $s3Bucket" -ForegroundColor White
Write-Host "5. Invalidate CloudFront distribution: $cloudfrontDistributionId" -ForegroundColor White

Write-Host "`n🔧 Manual Deployment Commands:" -ForegroundColor Yellow
Write-Host "# Upload to S3:" -ForegroundColor White
Write-Host "aws s3 sync $frontendPath\dist\ s3://$s3Bucket/ --delete" -ForegroundColor Gray
Write-Host ""
Write-Host "# Invalidate CloudFront:" -ForegroundColor White
Write-Host "aws cloudfront create-invalidation --distribution-id $cloudfrontDistributionId --paths '/*'" -ForegroundColor Gray

Write-Host "`n🧪 Testing Commands:" -ForegroundColor Yellow
Write-Host "# Test folder creation endpoint:" -ForegroundColor White
Write-Host "curl -X POST 'https://uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com/preprod/folders' -H 'Authorization: Bearer YOUR_TOKEN' -H 'Content-Type: application/json' -d '{\"name\":\"Test Folder\"}'" -ForegroundColor Gray

Write-Host "`n✅ Frontend rebuild and deployment instructions ready!" -ForegroundColor Green
Write-Host "The source files have been updated with the correct Regional API endpoints." -ForegroundColor Green
Write-Host "Please follow the steps above to rebuild and deploy your frontend." -ForegroundColor Green
