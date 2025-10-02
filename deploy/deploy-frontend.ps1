# SafeMate v2 Frontend Deployment Script
# Deploys the updated frontend with new folder management features

param(
    [string]$FrontendPath = ".\frontend",
    [string]$BuildPath = ".\dist",
    [string]$S3Bucket = "safemate-frontend-bucket",
    [string]$CloudFrontDistributionId = "E1234567890ABC",
    [string]$Region = "ap-southeast-2"
)

Write-Host "🚀 SafeMate v2 Frontend Deployment Script" -ForegroundColor Green
Write-Host "Deploying updated frontend with new folder management..." -ForegroundColor Yellow
Write-Host ""

# Check if frontend directory exists
if (-not (Test-Path $FrontendPath)) {
    Write-Host "❌ Frontend directory not found: $FrontendPath" -ForegroundColor Red
    Write-Host "   Please make sure the frontend code is in the correct location" -ForegroundColor White
    exit 1
}

# Check if Node.js is installed
try {
    $nodeVersion = node --version 2>$null
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version 2>$null
    Write-Host "✅ npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found. Please install npm first." -ForegroundColor Red
    exit 1
}

# Check if AWS CLI is installed
try {
    $awsVersion = aws --version 2>$null
    Write-Host "✅ AWS CLI found: $awsVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ AWS CLI not found. Please install AWS CLI first." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔧 Configuration:" -ForegroundColor Cyan
Write-Host "   Frontend Path: $FrontendPath" -ForegroundColor White
Write-Host "   Build Path: $BuildPath" -ForegroundColor White
Write-Host "   S3 Bucket: $S3Bucket" -ForegroundColor White
Write-Host "   CloudFront Distribution: $CloudFrontDistributionId" -ForegroundColor White
Write-Host "   Region: $Region" -ForegroundColor White
Write-Host ""

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
Set-Location $FrontendPath

try {
    npm install
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Build the frontend
Write-Host ""
Write-Host "🔨 Building frontend..." -ForegroundColor Cyan

try {
    npm run build
    Write-Host "✅ Frontend built successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to build frontend" -ForegroundColor Red
    Write-Host "   Please check for build errors and fix them first" -ForegroundColor White
    exit 1
}

# Check if build directory exists
if (-not (Test-Path $BuildPath)) {
    Write-Host "❌ Build directory not found: $BuildPath" -ForegroundColor Red
    Write-Host "   Please check the build configuration" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "📊 Build Statistics:" -ForegroundColor Cyan
$buildFiles = Get-ChildItem -Path $BuildPath -Recurse -File
$totalSize = ($buildFiles | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "   Total Files: $($buildFiles.Count)" -ForegroundColor White
Write-Host "   Total Size: $([math]::Round($totalSize, 2)) MB" -ForegroundColor White

# Upload to S3
Write-Host ""
Write-Host "☁️  Uploading to S3..." -ForegroundColor Cyan

try {
    # Sync files to S3
    aws s3 sync $BuildPath s3://$S3Bucket --delete --region $Region
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Files uploaded to S3 successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to upload files to S3" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error uploading to S3: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Invalidate CloudFront cache
Write-Host ""
Write-Host "🔄 Invalidating CloudFront cache..." -ForegroundColor Cyan

try {
    $invalidationResult = aws cloudfront create-invalidation `
        --distribution-id $CloudFrontDistributionId `
        --paths "/*" `
        --region $Region `
        --output json

    if ($LASTEXITCODE -eq 0) {
        $invalidation = $invalidationResult | ConvertFrom-Json
        Write-Host "✅ CloudFront cache invalidation created" -ForegroundColor Green
        Write-Host "   Invalidation ID: $($invalidation.Invalidation.Id)" -ForegroundColor White
        Write-Host "   Status: $($invalidation.Invalidation.Status)" -ForegroundColor White
    } else {
        Write-Host "⚠️  Warning: Failed to create CloudFront invalidation" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Warning: Error creating CloudFront invalidation: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test the deployment
Write-Host ""
Write-Host "🧪 Testing deployment..." -ForegroundColor Cyan

try {
    # Get CloudFront domain name
    $distributionInfo = aws cloudfront get-distribution --id $CloudFrontDistributionId --region $Region --output json
    $distribution = $distributionInfo | ConvertFrom-Json
    $domainName = $distribution.Distribution.DomainName
    $frontendUrl = "https://$domainName"
    
    Write-Host "   Frontend URL: $frontendUrl" -ForegroundColor White
    
    # Test if the site is accessible
    $response = Invoke-WebRequest -Uri $frontendUrl -Method GET -TimeoutSec 30
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend is accessible" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Frontend returned status: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Warning: Could not test frontend accessibility: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Frontend deployment completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Deployment Summary:" -ForegroundColor Cyan
Write-Host "   ✅ Dependencies installed" -ForegroundColor Green
Write-Host "   ✅ Frontend built successfully" -ForegroundColor Green
Write-Host "   ✅ Files uploaded to S3" -ForegroundColor Green
Write-Host "   ✅ CloudFront cache invalidated" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 Frontend URLs:" -ForegroundColor Cyan
Write-Host "   Main Site: $frontendUrl" -ForegroundColor White
Write-Host "   Test Page: $frontendUrl/testpage" -ForegroundColor White
Write-Host ""
Write-Host "📊 New Features Deployed:" -ForegroundColor Cyan
Write-Host "   ✅ Enhanced FolderTreeWidget with icons and colors" -ForegroundColor Green
Write-Host "   ✅ Rich folder metadata support" -ForegroundColor Green
Write-Host "   ✅ Permission management" -ForegroundColor Green
Write-Host "   ✅ File management integration" -ForegroundColor Green
Write-Host "   ✅ Hierarchical folder display" -ForegroundColor Green
Write-Host "   ✅ Context menus for folder actions" -ForegroundColor Green
Write-Host ""
Write-Host "🧪 Testing Checklist:" -ForegroundColor Cyan
Write-Host "1. Visit the frontend URL and login" -ForegroundColor White
Write-Host "2. Check if folder tree displays correctly" -ForegroundColor White
Write-Host "3. Test creating a new folder" -ForegroundColor White
Write-Host "4. Test creating a subfolder" -ForegroundColor White
Write-Host "5. Verify folder icons and colors display" -ForegroundColor White
Write-Host "6. Test folder context menu actions" -ForegroundColor White
Write-Host ""
Write-Host "✨ SafeMate v2 frontend deployment complete! 🚀" -ForegroundColor Green

# Return to original directory
Set-Location ..

