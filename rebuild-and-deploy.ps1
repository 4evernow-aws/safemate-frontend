# SafeMate Frontend Rebuild and Deploy Script
# This script rebuilds the frontend and deploys it to AWS

Write-Host "🚀 SafeMate Frontend Rebuild and Deploy" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Yellow
Write-Host "Date: $(Get-Date)" -ForegroundColor Cyan
Write-Host "Environment: Preprod" -ForegroundColor Cyan

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the frontend directory." -ForegroundColor Red
    exit 1
}

Write-Host "`n📦 Step 1: Installing dependencies..." -ForegroundColor Green
try {
    npm install
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install dependencies: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n🔨 Step 2: Building frontend..." -ForegroundColor Green
try {
    npm run build
    Write-Host "✅ Frontend built successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to build frontend: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Check if dist directory exists
if (-not (Test-Path "dist")) {
    Write-Host "❌ Error: dist directory not found after build" -ForegroundColor Red
    exit 1
}

Write-Host "`n📤 Step 3: Deploying to S3..." -ForegroundColor Green
try {
    aws s3 sync dist/ s3://preprod-safemate-static-hosting --delete
    Write-Host "✅ Frontend deployed to S3 successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to deploy to S3: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n🔄 Step 4: Invalidating CloudFront cache..." -ForegroundColor Green
try {
    $invalidation = aws cloudfront create-invalidation --distribution-id E2XL0R3MV20SY5 --paths "/*" --output json
    $invalidationId = ($invalidation | ConvertFrom-Json).Invalidation.Id
    Write-Host "✅ CloudFront cache invalidation created: $invalidationId" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to invalidate CloudFront cache: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n🎉 Frontend rebuild and deployment completed successfully!" -ForegroundColor Green
Write-Host "Frontend URL: https://d2xl0r3mv20sy5.cloudfront.net/" -ForegroundColor Cyan
Write-Host "CloudFront invalidation ID: $invalidationId" -ForegroundColor Cyan
Write-Host "`n⏳ Note: It may take a few minutes for CloudFront to serve the new files." -ForegroundColor Yellow
Write-Host "You can check the invalidation status in the AWS Console." -ForegroundColor Yellow
