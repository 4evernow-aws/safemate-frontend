# Hedera Lambda Deployment via S3 (for large packages)
param(
    [string]$PackagePath = "D:\safemate-infrastructure\services\hedera-service\hedera-service-infinite-supply-v24.zip",
    [string]$FunctionName = "preprod-safemate-hedera-service",
    [string]$S3Bucket = "safemate-lambda-deployments",
    [string]$S3Key = "hedera-service-infinite-supply-v24.zip"
)

Write-Host "Starting Hedera Lambda deployment via S3..." -ForegroundColor Green
Write-Host "Package: $PackagePath" -ForegroundColor Cyan
Write-Host "Function: $FunctionName" -ForegroundColor Cyan
Write-Host "S3 Bucket: $S3Bucket" -ForegroundColor Cyan
Write-Host "S3 Key: $S3Key" -ForegroundColor Cyan

# Verify package exists
if (-not (Test-Path $PackagePath)) {
    Write-Host "Package not found: $PackagePath" -ForegroundColor Red
    exit 1
}

$packageSize = (Get-Item $PackagePath).Length / 1MB
Write-Host "Package size: $([math]::Round($packageSize, 2)) MB" -ForegroundColor Yellow

# Test AWS connectivity
Write-Host "Testing AWS connectivity..." -ForegroundColor Yellow
try {
    $result = aws sts get-caller-identity --output json 2>&1
    if ($LASTEXITCODE -eq 0) {
        $identity = $result | ConvertFrom-Json
        Write-Host "AWS connected as: $($identity.Arn)" -ForegroundColor Green
    } else {
        Write-Host "AWS connectivity failed: $result" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "AWS connectivity test failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Check if S3 bucket exists, create if not
Write-Host "Checking S3 bucket..." -ForegroundColor Yellow
try {
    $bucketCheck = aws s3api head-bucket --bucket $S3Bucket 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Creating S3 bucket: $S3Bucket" -ForegroundColor Yellow
        $createBucket = aws s3api create-bucket --bucket $S3Bucket --region ap-southeast-2 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "S3 bucket created successfully" -ForegroundColor Green
        } else {
            Write-Host "Failed to create S3 bucket: $createBucket" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "S3 bucket exists" -ForegroundColor Green
    }
} catch {
    Write-Host "S3 bucket check failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Upload package to S3
Write-Host "Uploading package to S3..." -ForegroundColor Yellow
try {
    $uploadResult = aws s3 cp $PackagePath "s3://$S3Bucket/$S3Key" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Package uploaded to S3 successfully" -ForegroundColor Green
    } else {
        Write-Host "S3 upload failed: $uploadResult" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "S3 upload failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Update Lambda function to use S3 package
Write-Host "Updating Lambda function with S3 package..." -ForegroundColor Yellow
try {
    $updateResult = aws lambda update-function-code --function-name $FunctionName --s3-bucket $S3Bucket --s3-key $S3Key --output json 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        $functionInfo = $updateResult | ConvertFrom-Json
        Write-Host "Lambda function updated successfully!" -ForegroundColor Green
        Write-Host "Function ARN: $($functionInfo.FunctionArn)" -ForegroundColor Cyan
        Write-Host "Last Modified: $($functionInfo.LastModified)" -ForegroundColor Cyan
        Write-Host "Code Size: $([math]::Round($functionInfo.CodeSize / 1MB, 2)) MB" -ForegroundColor Cyan
    } else {
        Write-Host "Lambda update failed: $updateResult" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Lambda update failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Verify deployment
Write-Host "Verifying deployment..." -ForegroundColor Yellow
try {
    $functionInfo = aws lambda get-function --function-name $FunctionName --output json 2>&1
    if ($LASTEXITCODE -eq 0) {
        $function = $functionInfo | ConvertFrom-Json
        Write-Host "Function verification successful!" -ForegroundColor Green
        Write-Host "State: $($function.Configuration.State)" -ForegroundColor Cyan
        Write-Host "Runtime: $($function.Configuration.Runtime)" -ForegroundColor Cyan
        Write-Host "Handler: $($function.Configuration.Handler)" -ForegroundColor Cyan
        Write-Host "Last Modified: $($function.Configuration.LastModified)" -ForegroundColor Cyan
        
        if ($function.Configuration.State -eq "Active") {
            Write-Host "Function is Active and ready!" -ForegroundColor Green
        } else {
            Write-Host "Function state: $($function.Configuration.State)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "Function verification failed: $functionInfo" -ForegroundColor Red
    }
} catch {
    Write-Host "Verification failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Deployment completed successfully!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Test folder creation in frontend" -ForegroundColor White
Write-Host "2. Verify transactions on Hedera Explorer" -ForegroundColor White
Write-Host "3. Confirm folders appear in the list" -ForegroundColor White
