# Deploy Large Lambda Package via S3
Write-Host "🚀 Deploying Large Lambda Package via S3" -ForegroundColor Cyan

$packagePath = "hedera-service-v47-11-final.zip"
$packageSize = (Get-Item $packagePath).Length
$packageSizeMB = [math]::Round($packageSize / 1MB, 2)

Write-Host "📦 Package: $packagePath" -ForegroundColor Yellow
Write-Host "📦 Size: $packageSizeMB MB" -ForegroundColor Yellow

# Create S3 bucket for Lambda deployments
$bucketName = "safemate-lambda-deployments-$(Get-Random)"
$s3Key = "hedera-service-v47-11-final.zip"

Write-Host "`n🔧 Step 1: Creating S3 bucket..." -ForegroundColor Cyan
try {
    aws s3 mb "s3://$bucketName" --region "ap-southeast-2"
    Write-Host "✅ S3 bucket created: $bucketName" -ForegroundColor Green
} catch {
    Write-Host "❌ S3 bucket creation failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "🔧 Trying with existing bucket..." -ForegroundColor Yellow
    
    # Try with existing bucket
    $bucketName = "safemate-lambda-deployments"
    try {
        aws s3 mb "s3://$bucketName" --region "ap-southeast-2"
        Write-Host "✅ Using existing bucket: $bucketName" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Using existing bucket: $bucketName" -ForegroundColor Yellow
    }
}

Write-Host "`n🔧 Step 2: Uploading package to S3..." -ForegroundColor Cyan
try {
    aws s3 cp $packagePath "s3://$bucketName/$s3Key" --region "ap-southeast-2"
    Write-Host "✅ Package uploaded to S3: s3://$bucketName/$s3Key" -ForegroundColor Green
} catch {
    Write-Host "❌ S3 upload failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n🔧 Step 3: Deploying from S3..." -ForegroundColor Cyan
try {
    aws lambda update-function-code `
        --function-name "preprod-safemate-hedera-service" `
        --s3-bucket $bucketName `
        --s3-key $s3Key `
        --region "ap-southeast-2"
    
    Write-Host "✅ Lambda function deployed from S3 successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ S3 deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    
    # Try alternative: Use Lambda layers
    Write-Host "`n🔧 Alternative: Creating Lambda layer with dependencies..." -ForegroundColor Yellow
    try {
        # Extract dependencies from the large package
        $tempDir = "temp-dependencies"
        if (Test-Path $tempDir) {
            Remove-Item $tempDir -Recurse -Force
        }
        New-Item -ItemType Directory -Path $tempDir
        
        # Extract node_modules from the large package
        Expand-Archive -Path $packagePath -DestinationPath "temp-large-package" -Force
        Copy-Item "temp-large-package/node_modules" "$tempDir/node_modules" -Recurse -Force
        
        # Create layer package
        $layerPackage = "hedera-dependencies-layer.zip"
        if (Test-Path $layerPackage) {
            Remove-Item $layerPackage -Force
        }
        
        Compress-Archive -Path "$tempDir/*" -DestinationPath $layerPackage
        
        Write-Host "📦 Layer package created: $layerPackage" -ForegroundColor Green
        
        # Create Lambda layer
        aws lambda publish-layer-version `
            --layer-name "safemate-hedera-dependencies" `
            --zip-file "fileb://$layerPackage" `
            --compatible-runtimes "nodejs18.x" `
            --region "ap-southeast-2"
        
        Write-Host "✅ Lambda layer created successfully!" -ForegroundColor Green
        Write-Host "🔧 Next step: Update Lambda function to use the layer" -ForegroundColor Yellow
        
        # Cleanup
        Remove-Item $tempDir -Recurse -Force
        Remove-Item "temp-large-package" -Recurse -Force
        
    } catch {
        Write-Host "❌ Layer creation failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🎯 Deployment Summary:" -ForegroundColor Cyan
Write-Host "- Large package (68MB) deployment attempted via S3" -ForegroundColor White
Write-Host "- Should include all required dependencies" -ForegroundColor White
Write-Host "- Testing required to verify functionality" -ForegroundColor White
