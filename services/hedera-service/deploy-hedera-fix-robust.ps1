# Robust Hedera Lambda Deployment Script
# Handles connection timeouts and retries

param(
    [string]$PackagePath = "D:\safemate-infrastructure\services\hedera-service\hedera-service-infinite-supply-v24.zip",
    [string]$FunctionName = "preprod-safemate-hedera-service",
    [int]$MaxRetries = 3,
    [int]$RetryDelay = 10
)

Write-Host "🚀 Starting robust Hedera Lambda deployment..." -ForegroundColor Green
Write-Host "📦 Package: $PackagePath" -ForegroundColor Cyan
Write-Host "🔧 Function: $FunctionName" -ForegroundColor Cyan
Write-Host "🔄 Max Retries: $MaxRetries" -ForegroundColor Cyan

# Verify package exists
if (-not (Test-Path $PackagePath)) {
    Write-Host "❌ Package not found: $PackagePath" -ForegroundColor Red
    exit 1
}

$packageSize = (Get-Item $PackagePath).Length / 1MB
Write-Host "📊 Package size: $([math]::Round($packageSize, 2)) MB" -ForegroundColor Yellow

# Function to test AWS connectivity
function Test-AWSConnectivity {
    Write-Host "Testing AWS connectivity..." -ForegroundColor Yellow
    try {
        $result = aws sts get-caller-identity --output json 2>&1
        if ($LASTEXITCODE -eq 0) {
            $identity = $result | ConvertFrom-Json
            Write-Host "AWS connected as: $($identity.Arn)" -ForegroundColor Green
            return $true
        } else {
            Write-Host "AWS connectivity failed: $result" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "AWS connectivity test failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function to deploy with retry logic
function Deploy-LambdaWithRetry {
    param([string]$PackagePath, [string]$FunctionName, [int]$MaxRetries, [int]$RetryDelay)
    
    for ($attempt = 1; $attempt -le $MaxRetries; $attempt++) {
        Write-Host "🔄 Deployment attempt $attempt of $MaxRetries..." -ForegroundColor Yellow
        
        try {
            # Test connectivity first
            if (-not (Test-AWSConnectivity)) {
                throw "AWS connectivity failed"
            }
            
            Write-Host "📤 Uploading package to Lambda..." -ForegroundColor Yellow
            
            # Deploy the function
            $deployResult = aws lambda update-function-code `
                --function-name $FunctionName `
                --zip-file "fileb://$PackagePath" `
                --output json 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                $functionInfo = $deployResult | ConvertFrom-Json
                Write-Host "✅ Deployment successful!" -ForegroundColor Green
                Write-Host "📋 Function ARN: $($functionInfo.FunctionArn)" -ForegroundColor Cyan
                Write-Host "📋 Last Modified: $($functionInfo.LastModified)" -ForegroundColor Cyan
                Write-Host "📋 Code Size: $([math]::Round($functionInfo.CodeSize / 1MB, 2)) MB" -ForegroundColor Cyan
                return $true
            } else {
                throw "Deployment failed: $deployResult"
            }
        } catch {
            Write-Host "❌ Attempt $attempt failed: $($_.Exception.Message)" -ForegroundColor Red
            
            if ($attempt -lt $MaxRetries) {
                Write-Host "⏳ Waiting $RetryDelay seconds before retry..." -ForegroundColor Yellow
                Start-Sleep -Seconds $RetryDelay
            } else {
                Write-Host "💥 All deployment attempts failed!" -ForegroundColor Red
                return $false
            }
        }
    }
    return $false
}

# Function to verify deployment
function Verify-Deployment {
    param([string]$FunctionName)
    
    Write-Host "🔍 Verifying deployment..." -ForegroundColor Yellow
    
    try {
        $functionInfo = aws lambda get-function --function-name $FunctionName --output json 2>&1
        if ($LASTEXITCODE -eq 0) {
            $function = $functionInfo | ConvertFrom-Json
            Write-Host "✅ Function verification successful!" -ForegroundColor Green
            Write-Host "📋 State: $($function.Configuration.State)" -ForegroundColor Cyan
            Write-Host "📋 Runtime: $($function.Configuration.Runtime)" -ForegroundColor Cyan
            Write-Host "📋 Handler: $($function.Configuration.Handler)" -ForegroundColor Cyan
            Write-Host "📋 Last Modified: $($function.Configuration.LastModified)" -ForegroundColor Cyan
            
            if ($function.Configuration.State -eq "Active") {
                Write-Host "🎯 Function is Active and ready!" -ForegroundColor Green
                return $true
            } else {
                Write-Host "⚠️ Function state: $($function.Configuration.State)" -ForegroundColor Yellow
                return $false
            }
        } else {
            Write-Host "❌ Function verification failed: $functionInfo" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ Verification failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Main deployment process
Write-Host "🎯 Starting deployment process..." -ForegroundColor Green

# Deploy with retry logic
$deploymentSuccess = Deploy-LambdaWithRetry -PackagePath $PackagePath -FunctionName $FunctionName -MaxRetries $MaxRetries -RetryDelay $RetryDelay

if ($deploymentSuccess) {
    Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
    
    # Verify the deployment
    $verificationSuccess = Verify-Deployment -FunctionName $FunctionName
    
    if ($verificationSuccess) {
        Write-Host "🎯 Ready to test folder creation!" -ForegroundColor Green
        Write-Host "📝 Next steps:" -ForegroundColor Yellow
        Write-Host "   1. Test folder creation in frontend" -ForegroundColor White
        Write-Host "   2. Verify transactions on Hedera Explorer" -ForegroundColor White
        Write-Host "   3. Confirm folders appear in the list" -ForegroundColor White
    } else {
        Write-Host "⚠️ Deployment completed but verification failed" -ForegroundColor Yellow
    }
} else {
    Write-Host "💥 Deployment failed after $MaxRetries attempts" -ForegroundColor Red
    Write-Host "🔧 Alternative deployment options:" -ForegroundColor Yellow
    Write-Host "   1. Deploy manually via AWS Console" -ForegroundColor White
    Write-Host "   2. Check AWS CLI configuration" -ForegroundColor White
    Write-Host "   3. Verify network connectivity" -ForegroundColor White
    Write-Host "   4. Try deploying from a different network" -ForegroundColor White
}

Write-Host "🏁 Deployment script completed" -ForegroundColor Green
