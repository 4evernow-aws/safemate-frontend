# Deploy Lambda Function Following SafeMate Standards
Write-Host "🚀 Deploying Lambda Function Following SafeMate Standards" -ForegroundColor Cyan

# Create deployment directory following standards
$deployDir = "lambda-standards-compliant"
if (Test-Path $deployDir) {
    Remove-Item $deployDir -Recurse -Force
}
New-Item -ItemType Directory -Path $deployDir

# Copy our corrected Lambda function
Write-Host "`n📦 Copying Lambda function with fldr/sfldr symbols..." -ForegroundColor Yellow
Copy-Item "v47-2-extract/index.js" "$deployDir/index.js"

# Create standards-compliant package.json
Write-Host "`n📦 Creating standards-compliant package.json..." -ForegroundColor Yellow
$packageJson = @{
    name = "safemate-hedera-service"
    version = "1.0.0"
    description = "SafeMate Hedera Service Lambda Function - Standards Compliant"
    type = "commonjs"
    main = "index.js"
    dependencies = @{
        "@hashgraph/sdk" = "2.39.0"
        "@aws-sdk/client-dynamodb" = "^3.0.0"
        "@aws-sdk/lib-dynamodb" = "^3.0.0"
        "@aws-sdk/client-kms" = "^3.0.0"
    }
} | ConvertTo-Json -Depth 3

$packageJson | Out-File -FilePath "$deployDir/package.json" -Encoding UTF8

# Install standards-compliant dependencies
Write-Host "`n📦 Installing standards-compliant dependencies..." -ForegroundColor Yellow
Set-Location $deployDir

# Install Hedera SDK version 2.39.0 (CommonJS compatible)
Write-Host "Installing @hashgraph/sdk@2.39.0 (CommonJS compatible)..." -ForegroundColor Cyan
npm install @hashgraph/sdk@2.39.0 --production --no-optional --no-audit --no-fund

# Install AWS SDK dependencies
Write-Host "Installing AWS SDK dependencies..." -ForegroundColor Cyan
npm install @aws-sdk/client-dynamodb@3.0.0 --production --no-optional --no-audit --no-fund
npm install @aws-sdk/lib-dynamodb@3.0.0 --production --no-optional --no-audit --no-fund
npm install @aws-sdk/client-kms@3.0.0 --production --no-optional --no-audit --no-fund

Set-Location ..

Write-Host "✅ Standards-compliant dependencies installed" -ForegroundColor Green

# Create deployment package
$deploymentPackage = "hedera-service-standards-compliant.zip"

# Remove existing package if it exists
if (Test-Path $deploymentPackage) {
    Remove-Item $deploymentPackage -Force
}

# Create new package
Compress-Archive -Path "$deployDir/*" -DestinationPath $deploymentPackage

Write-Host "✅ Standards-compliant package created: $deploymentPackage" -ForegroundColor Green

# Check package size
$packageSize = (Get-Item $deploymentPackage).Length
$packageSizeMB = [math]::Round($packageSize / 1MB, 2)
Write-Host "📦 Package size: $packageSizeMB MB" -ForegroundColor Yellow

if ($packageSize -gt 50MB) {
    Write-Host "⚠️ Package is large ($packageSizeMB MB). Using S3 deployment..." -ForegroundColor Yellow
    
    # Create S3 bucket for deployment
    $bucketName = "safemate-lambda-standards-$(Get-Random)"
    $s3Key = "hedera-service-standards-compliant.zip"
    
    try {
        # Create S3 bucket
        aws s3 mb "s3://$bucketName" --region "ap-southeast-2"
        Write-Host "✅ S3 bucket created: $bucketName" -ForegroundColor Green
        
        # Upload package to S3
        aws s3 cp $deploymentPackage "s3://$bucketName/$s3Key" --region "ap-southeast-2"
        Write-Host "✅ Package uploaded to S3" -ForegroundColor Green
        
        # Deploy from S3
        aws lambda update-function-code `
            --function-name "preprod-safemate-hedera-service" `
            --s3-bucket $bucketName `
            --s3-key $s3Key `
            --region "ap-southeast-2"
        
        Write-Host "✅ Standards-compliant package deployed from S3!" -ForegroundColor Green
    } catch {
        Write-Host "❌ S3 deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    # Deploy directly
    Write-Host "`n🚀 Deploying standards-compliant package..." -ForegroundColor Yellow
    try {
        aws lambda update-function-code `
            --function-name "preprod-safemate-hedera-service" `
            --zip-file "fileb://$deploymentPackage" `
            --region "ap-southeast-2"
        
        Write-Host "✅ Standards-compliant package deployed successfully!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Direct deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🎯 Standards-Compliant Deployment Summary:" -ForegroundColor Cyan
Write-Host "- Hedera SDK: Version 2.39.0 (CommonJS compatible)" -ForegroundColor White
Write-Host "- Module System: CommonJS (require() statements)" -ForegroundColor White
Write-Host "- Node.js Runtime: 18.x (Lambda compatible)" -ForegroundColor White
Write-Host "- Package Size: $packageSizeMB MB" -ForegroundColor White
Write-Host "- Should resolve 502 errors completely" -ForegroundColor White

# Cleanup
Remove-Item $deployDir -Recurse -Force
