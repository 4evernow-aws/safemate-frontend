# Simple Hedera Lambda Deployment Script
param(
    [string]$PackagePath = "D:\safemate-infrastructure\services\hedera-service\hedera-service-infinite-supply-v24.zip",
    [string]$FunctionName = "preprod-safemate-hedera-service"
)

Write-Host "Starting Hedera Lambda deployment..." -ForegroundColor Green
Write-Host "Package: $PackagePath" -ForegroundColor Cyan
Write-Host "Function: $FunctionName" -ForegroundColor Cyan

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

# Deploy the function
Write-Host "Uploading package to Lambda..." -ForegroundColor Yellow
try {
    $deployResult = aws lambda update-function-code --function-name $FunctionName --zip-file "fileb://$PackagePath" --output json 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        $functionInfo = $deployResult | ConvertFrom-Json
        Write-Host "Deployment successful!" -ForegroundColor Green
        Write-Host "Function ARN: $($functionInfo.FunctionArn)" -ForegroundColor Cyan
        Write-Host "Last Modified: $($functionInfo.LastModified)" -ForegroundColor Cyan
        Write-Host "Code Size: $([math]::Round($functionInfo.CodeSize / 1MB, 2)) MB" -ForegroundColor Cyan
    } else {
        Write-Host "Deployment failed: $deployResult" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
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

Write-Host "Deployment script completed" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Test folder creation in frontend" -ForegroundColor White
Write-Host "2. Verify transactions on Hedera Explorer" -ForegroundColor White
Write-Host "3. Confirm folders appear in the list" -ForegroundColor White
