# SafeMate v2 Lambda Deployment Script
# Deploys the updated Lambda function with new NFT configuration

param(
    [string]$FunctionName = "preprod-safemate-hedera-service",
    [string]$Region = "ap-southeast-2",
    [string]$LambdaPath = ".\lambda"
)

Write-Host "🚀 SafeMate v2 Lambda Deployment Script" -ForegroundColor Green
Write-Host "Deploying Lambda function: $FunctionName" -ForegroundColor Yellow
Write-Host "Region: $Region" -ForegroundColor Yellow
Write-Host ""

# Check if Lambda directory exists
if (-not (Test-Path $LambdaPath)) {
    Write-Host "❌ Lambda directory not found: $LambdaPath" -ForegroundColor Red
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

# Check if Node.js is installed
try {
    $nodeVersion = node --version 2>$null
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
Set-Location $LambdaPath

try {
    npm install
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Creating deployment package..." -ForegroundColor Cyan

# Create deployment package
$zipFile = "safemate-hedera-service-v48.zip"
if (Test-Path $zipFile) {
    Remove-Item $zipFile
}

# Create zip file with all necessary files
Compress-Archive -Path "index.js", "package.json", "node_modules" -DestinationPath $zipFile -Force

if (Test-Path $zipFile) {
    Write-Host "✅ Deployment package created: $zipFile" -ForegroundColor Green
    $fileSize = (Get-Item $zipFile).Length / 1MB
    Write-Host "   Package size: $([math]::Round($fileSize, 2)) MB" -ForegroundColor White
} else {
    Write-Host "❌ Failed to create deployment package" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🚀 Deploying to AWS Lambda..." -ForegroundColor Cyan

try {
    # Update function code
    $updateResult = aws lambda update-function-code `
        --function-name $FunctionName `
        --zip-file "fileb://$zipFile" `
        --region $Region `
        --output json

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Lambda function updated successfully" -ForegroundColor Green
        
        # Get function info
        $functionInfo = $updateResult | ConvertFrom-Json
        Write-Host "   Function ARN: $($functionInfo.FunctionArn)" -ForegroundColor White
        Write-Host "   Runtime: $($functionInfo.Runtime)" -ForegroundColor White
        Write-Host "   Last Modified: $($functionInfo.LastModified)" -ForegroundColor White
    } else {
        Write-Host "❌ Failed to update Lambda function" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error deploying Lambda function: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔧 Updating environment variables..." -ForegroundColor Cyan

# Update environment variables
$envVars = @{
    "HEDERA_NETWORK" = "TESTNET"
    "HEDERA_ACCOUNT_ID" = "0.0.6890393"
    "MIRROR_NODE_URL" = "https://testnet.mirrornode.hedera.com"
    "VERSION" = "V48.0"
}

# Note: FOLDER_COLLECTION_TOKEN will need to be set after creating the new collection token
Write-Host "⚠️  Note: FOLDER_COLLECTION_TOKEN needs to be set after creating new collection token" -ForegroundColor Yellow

try {
    $envVarsJson = $envVars | ConvertTo-Json -Compress
    $updateEnvResult = aws lambda update-function-configuration `
        --function-name $FunctionName `
        --environment Variables=$envVarsJson `
        --region $Region `
        --output json

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Environment variables updated" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Warning: Failed to update environment variables" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Warning: Error updating environment variables: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🧪 Testing deployment..." -ForegroundColor Cyan

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
        Write-Host "⚠️  Warning: Failed to test deployment" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Warning: Error testing deployment: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Deployment completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Create new collection token using the API endpoint" -ForegroundColor White
Write-Host "2. Update FOLDER_COLLECTION_TOKEN environment variable" -ForegroundColor White
Write-Host "3. Test folder creation and listing" -ForegroundColor White
Write-Host "4. Update frontend to use new metadata structure" -ForegroundColor White
Write-Host ""
Write-Host "🔗 API Endpoints:" -ForegroundColor Cyan
Write-Host "   Health: GET /health" -ForegroundColor White
Write-Host "   Create Collection: POST /folders/create-collection" -ForegroundColor White
Write-Host "   List Folders: GET /folders" -ForegroundColor White
Write-Host "   Create Folder: POST /folders" -ForegroundColor White
Write-Host ""
Write-Host "📊 Function Details:" -ForegroundColor Cyan
Write-Host "   Function Name: $FunctionName" -ForegroundColor White
Write-Host "   Region: $Region" -ForegroundColor White
Write-Host "   Version: V48.0" -ForegroundColor White

# Clean up
Set-Location ..
Remove-Item "$LambdaPath\$zipFile" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "✨ SafeMate v2 Lambda deployment complete! 🚀" -ForegroundColor Green
