# SafeMate Frontend Deployment Script
# This script deploys the frontend with corrected API endpoints

Write-Host "🚀 SafeMate Frontend Deployment Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Configuration
$frontendPath = "apps\web\safemate"
$s3Bucket = "preprod-safemate-static-hosting"
$cloudfrontDistributionId = "E2QZ8XJ9K5L2M"  # Update with actual distribution ID

Write-Host "`n📋 Deployment Configuration:" -ForegroundColor Yellow
Write-Host "  Frontend Path: $frontendPath" -ForegroundColor White
Write-Host "  S3 Bucket: $s3Bucket" -ForegroundColor White
Write-Host "  CloudFront Distribution: $cloudfrontDistributionId" -ForegroundColor White

# Check if we're in the correct directory
if (-not (Test-Path $frontendPath)) {
    Write-Host "`n❌ Error: Frontend path not found: $frontendPath" -ForegroundColor Red
    Write-Host "Please run this script from the safemate-infrastructure directory" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n🔍 Verifying API endpoint fixes..." -ForegroundColor Cyan

# Check if API endpoints are correctly configured
$hederaApiService = "$frontendPath\src\services\hederaApiService.ts"
$secureWalletService = "$frontendPath\src\services\secureWalletService.ts"

$correctEndpoint = "https://uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com/preprod"
$oldEndpoint = "https://2kwe2ly8vh.execute-api.ap-southeast-2.amazonaws.com/preprod"

$needsFix = $false

if (Test-Path $hederaApiService) {
    $content = Get-Content $hederaApiService -Raw
    if ($content -match $oldEndpoint) {
        Write-Host "  ❌ hederaApiService.ts still contains old endpoint" -ForegroundColor Red
        $needsFix = $true
    } else {
        Write-Host "  ✅ hederaApiService.ts has correct endpoint" -ForegroundColor Green
    }
} else {
    Write-Host "  ⚠️  hederaApiService.ts not found" -ForegroundColor Yellow
}

if (Test-Path $secureWalletService) {
    $content = Get-Content $secureWalletService -Raw
    if ($content -match $oldEndpoint) {
        Write-Host "  ❌ secureWalletService.ts still contains old endpoint" -ForegroundColor Red
        $needsFix = $true
    } else {
        Write-Host "  ✅ secureWalletService.ts has correct endpoint" -ForegroundColor Green
    }
} else {
    Write-Host "  ⚠️  secureWalletService.ts not found" -ForegroundColor Yellow
}

if ($needsFix) {
    Write-Host "`n❌ API endpoints need to be fixed before deployment!" -ForegroundColor Red
    Write-Host "Please run the API endpoint fixes first." -ForegroundColor Yellow
    exit 1
}

Write-Host "`n✅ All API endpoints are correctly configured" -ForegroundColor Green

# Build the frontend
Write-Host "`n🔨 Building frontend..." -ForegroundColor Cyan
Set-Location $frontendPath

try {
    # Install dependencies if needed
    if (-not (Test-Path "node_modules")) {
        Write-Host "  📦 Installing dependencies..." -ForegroundColor Yellow
        npm install
    }
    
    # Build the project
    Write-Host "  🔨 Running build..." -ForegroundColor Yellow
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Build successful!" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Build failed!" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "  ❌ Build error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Deploy to S3
Write-Host "`n📤 Deploying to S3..." -ForegroundColor Cyan
Set-Location "..\..\.."  # Back to root directory

try {
    # Sync dist folder to S3
    aws s3 sync "$frontendPath\dist\" "s3://$s3Bucket/" --delete
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ S3 deployment successful!" -ForegroundColor Green
    } else {
        Write-Host "  ❌ S3 deployment failed!" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "  ❌ S3 deployment error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Invalidate CloudFront cache
Write-Host "`n🔄 Invalidating CloudFront cache..." -ForegroundColor Cyan

try {
    aws cloudfront create-invalidation --distribution-id $cloudfrontDistributionId --paths "/*"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ CloudFront invalidation successful!" -ForegroundColor Green
    } else {
        Write-Host "  ❌ CloudFront invalidation failed!" -ForegroundColor Red
    }
}
catch {
    Write-Host "  ❌ CloudFront invalidation error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Frontend deployment completed!" -ForegroundColor Green
Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Test the application at: https://d2xl0r3mv20sy5.cloudfront.net/" -ForegroundColor White
Write-Host "  2. Try creating a folder to verify the fix" -ForegroundColor White
Write-Host "  3. Check browser console for any errors" -ForegroundColor White
Write-Host "  4. Monitor CloudWatch logs for successful API calls" -ForegroundColor White

Write-Host "`n🔗 Application URL: https://d2xl0r3mv20sy5.cloudfront.net/" -ForegroundColor Green
