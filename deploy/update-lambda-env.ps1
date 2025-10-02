# SafeMate v2 Lambda Environment Update Script
# Updates Lambda function environment variables with new collection token

param(
    [string]$FunctionName = "preprod-safemate-hedera-service",
    [string]$Region = "ap-southeast-2",
    [string]$CollectionTokenId = "",
    [string]$HederaAccountId = "0.0.6890393",
    [string]$HederaPrivateKey = ""
)

Write-Host "🔧 SafeMate v2 Lambda Environment Update Script" -ForegroundColor Green
Write-Host "Updating environment variables for Lambda function..." -ForegroundColor Yellow
Write-Host ""

# Check if collection token ID is provided
if (-not $CollectionTokenId) {
    Write-Host "❌ Collection token ID is required. Please provide it as a parameter:" -ForegroundColor Red
    Write-Host "   .\update-lambda-env.ps1 -CollectionTokenId '0.0.1234567'" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 To get the collection token ID:" -ForegroundColor Cyan
    Write-Host "   1. Run the create-collection-token.ps1 script first" -ForegroundColor White
    Write-Host "   2. Or check the collection-token-info.json file" -ForegroundColor White
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

Write-Host "🔧 Configuration:" -ForegroundColor Cyan
Write-Host "   Function Name: $FunctionName" -ForegroundColor White
Write-Host "   Region: $Region" -ForegroundColor White
Write-Host "   Collection Token: $CollectionTokenId" -ForegroundColor White
Write-Host "   Hedera Account: $HederaAccountId" -ForegroundColor White
Write-Host ""

# Check if function exists
Write-Host "🔍 Checking if Lambda function exists..." -ForegroundColor Cyan
try {
    $functionInfo = aws lambda get-function --function-name $FunctionName --region $Region --output json 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        $function = $functionInfo | ConvertFrom-Json
        Write-Host "✅ Lambda function found" -ForegroundColor Green
        Write-Host "   Function ARN: $($function.Configuration.FunctionArn)" -ForegroundColor White
        Write-Host "   Runtime: $($function.Configuration.Runtime)" -ForegroundColor White
        Write-Host "   Last Modified: $($function.Configuration.LastModified)" -ForegroundColor White
    } else {
        Write-Host "❌ Lambda function not found: $FunctionName" -ForegroundColor Red
        Write-Host "   Please check the function name and region" -ForegroundColor White
        exit 1
    }
} catch {
    Write-Host "❌ Error checking Lambda function: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔧 Updating environment variables..." -ForegroundColor Cyan

# Prepare environment variables
$environmentVariables = @{
    "HEDERA_NETWORK" = "TESTNET"
    "HEDERA_ACCOUNT_ID" = $HederaAccountId
    "FOLDER_COLLECTION_TOKEN" = $CollectionTokenId
    "MIRROR_NODE_URL" = "https://testnet.mirrornode.hedera.com"
    "VERSION" = "V48.0"
}

# Add private key if provided
if ($HederaPrivateKey) {
    $environmentVariables["HEDERA_PRIVATE_KEY"] = $HederaPrivateKey
    Write-Host "   ✅ Hedera private key will be updated" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Hedera private key not provided - using existing value" -ForegroundColor Yellow
}

try {
    $envVarsJson = $environmentVariables | ConvertTo-Json -Compress
    Write-Host "   Environment variables to update:" -ForegroundColor White
    foreach ($key in $environmentVariables.Keys) {
        if ($key -eq "HEDERA_PRIVATE_KEY") {
            Write-Host "     $key`: [HIDDEN]" -ForegroundColor Gray
        } else {
            Write-Host "     $key`: $($environmentVariables[$key])" -ForegroundColor Gray
        }
    }
    
    $updateResult = aws lambda update-function-configuration `
        --function-name $FunctionName `
        --environment "Variables=$envVarsJson" `
        --region $Region `
        --output json

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Environment variables updated successfully" -ForegroundColor Green
        
        $result = $updateResult | ConvertFrom-Json
        Write-Host "   Function ARN: $($result.FunctionArn)" -ForegroundColor White
        Write-Host "   Last Modified: $($result.LastModified)" -ForegroundColor White
    } else {
        Write-Host "❌ Failed to update environment variables" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error updating environment variables: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🧪 Testing updated function..." -ForegroundColor Cyan

try {
    # Test the health endpoint
    $testResult = aws lambda invoke `
        --function-name $FunctionName `
        --payload '{"httpMethod":"GET","path":"/health"}' `
        --region $Region `
        --output json `
        test-response.json

    if ($LASTEXITCODE -eq 0) {
        $response = Get-Content test-response.json | ConvertFrom-Json
        if ($response.statusCode -eq 200) {
            Write-Host "✅ Health check passed" -ForegroundColor Green
            $body = $response.body | ConvertFrom-Json
            Write-Host "   Version: $($body.version)" -ForegroundColor White
            Write-Host "   Message: $($body.message)" -ForegroundColor White
        } else {
            Write-Host "⚠️  Health check returned status: $($response.statusCode)" -ForegroundColor Yellow
        }
        Remove-Item test-response.json -ErrorAction SilentlyContinue
    } else {
        Write-Host "⚠️  Warning: Failed to test function" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Warning: Error testing function: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Environment update completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Updated Environment Variables:" -ForegroundColor Cyan
Write-Host "   ✅ HEDERA_NETWORK: TESTNET" -ForegroundColor Green
Write-Host "   ✅ HEDERA_ACCOUNT_ID: $HederaAccountId" -ForegroundColor Green
Write-Host "   ✅ FOLDER_COLLECTION_TOKEN: $CollectionTokenId" -ForegroundColor Green
Write-Host "   ✅ MIRROR_NODE_URL: https://testnet.mirrornode.hedera.com" -ForegroundColor Green
Write-Host "   ✅ VERSION: V48.0" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Test folder creation using browser test tool" -ForegroundColor White
Write-Host "2. Verify folder listing returns proper hierarchy" -ForegroundColor White
Write-Host "3. Test subfolder creation" -ForegroundColor White
Write-Host "4. Update frontend to use new metadata structure" -ForegroundColor White
Write-Host ""
Write-Host "🧪 Test Commands:" -ForegroundColor Cyan
Write-Host "   Health Check: GET /health" -ForegroundColor White
Write-Host "   List Folders: GET /folders" -ForegroundColor White
Write-Host "   Create Folder: POST /folders" -ForegroundColor White
Write-Host ""
Write-Host "✨ Lambda environment update complete! 🚀" -ForegroundColor Green

