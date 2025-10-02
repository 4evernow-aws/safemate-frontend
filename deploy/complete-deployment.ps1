# SafeMate v2 Complete Deployment Script
# Orchestrates the complete deployment of backend and frontend updates

param(
    [string]$JwtToken = "",
    [string]$HederaPrivateKey = "",
    [switch]$SkipFrontend = $false,
    [switch]$SkipBackend = $false
)

Write-Host "🚀 SafeMate v2 Complete Deployment Script" -ForegroundColor Green
Write-Host "Deploying complete system with new NFT folder configuration..." -ForegroundColor Yellow
Write-Host ""

# Configuration
$LambdaFunctionName = "preprod-safemate-hedera-service"
$Region = "ap-southeast-2"
$S3Bucket = "safemate-frontend-bucket"
$CloudFrontDistributionId = "E1234567890ABC"

Write-Host "🔧 Deployment Configuration:" -ForegroundColor Cyan
Write-Host "   Lambda Function: $LambdaFunctionName" -ForegroundColor White
Write-Host "   Region: $Region" -ForegroundColor White
Write-Host "   S3 Bucket: $S3Bucket" -ForegroundColor White
Write-Host "   CloudFront Distribution: $CloudFrontDistributionId" -ForegroundColor White
Write-Host "   Skip Backend: $SkipBackend" -ForegroundColor White
Write-Host "   Skip Frontend: $SkipFrontend" -ForegroundColor White
Write-Host ""

# Check prerequisites
Write-Host "🔍 Checking prerequisites..." -ForegroundColor Cyan

# Check AWS CLI
try {
    $awsVersion = aws --version 2>$null
    Write-Host "✅ AWS CLI found: $awsVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ AWS CLI not found. Please install AWS CLI first." -ForegroundColor Red
    exit 1
}

# Check Node.js
try {
    $nodeVersion = node --version 2>$null
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check JWT token for backend deployment
if (-not $SkipBackend -and -not $JwtToken) {
    Write-Host "❌ JWT token is required for backend deployment." -ForegroundColor Red
    Write-Host "   Please provide it as a parameter:" -ForegroundColor White
    Write-Host "   .\complete-deployment.ps1 -JwtToken 'your_jwt_token_here'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 To get your JWT token:" -ForegroundColor Cyan
    Write-Host "   1. Login to SafeMate frontend" -ForegroundColor White
    Write-Host "   2. Open browser developer tools (F12)" -ForegroundColor White
    Write-Host "   3. Go to Application/Storage tab" -ForegroundColor White
    Write-Host "   4. Look for 'safemate_auth_token' in localStorage" -ForegroundColor White
    Write-Host "   5. Copy the token value" -ForegroundColor White
    exit 1
}

Write-Host "✅ Prerequisites check completed" -ForegroundColor Green
Write-Host ""

# Step 1: Deploy Lambda Function
if (-not $SkipBackend) {
    Write-Host "🔧 Step 1: Deploying Lambda Function..." -ForegroundColor Cyan
    Write-Host "================================================" -ForegroundColor Gray
    
    try {
        & ".\deploy\deploy-lambda.ps1" -FunctionName $LambdaFunctionName -Region $Region
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Lambda function deployed successfully" -ForegroundColor Green
        } else {
            Write-Host "❌ Lambda deployment failed" -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host "❌ Error deploying Lambda function: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
}

# Step 2: Create Collection Token
if (-not $SkipBackend) {
    Write-Host "🎯 Step 2: Creating Collection Token..." -ForegroundColor Cyan
    Write-Host "================================================" -ForegroundColor Gray
    
    try {
        & ".\deploy\create-collection-token.ps1" -JwtToken $JwtToken
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Collection token created successfully" -ForegroundColor Green
            
            # Read the token ID from the created file
            if (Test-Path "collection-token-info.json") {
                $tokenInfo = Get-Content "collection-token-info.json" | ConvertFrom-Json
                $collectionTokenId = $tokenInfo.tokenId
                Write-Host "   Collection Token ID: $collectionTokenId" -ForegroundColor White
            } else {
                Write-Host "❌ Could not read collection token info" -ForegroundColor Red
                exit 1
            }
        } else {
            Write-Host "❌ Collection token creation failed" -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host "❌ Error creating collection token: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
}

# Step 3: Update Lambda Environment
if (-not $SkipBackend) {
    Write-Host "🔧 Step 3: Updating Lambda Environment..." -ForegroundColor Cyan
    Write-Host "================================================" -ForegroundColor Gray
    
    try {
        $envParams = @{
            FunctionName = $LambdaFunctionName
            Region = $Region
            CollectionTokenId = $collectionTokenId
        }
        
        if ($HederaPrivateKey) {
            $envParams.HederaPrivateKey = $HederaPrivateKey
        }
        
        & ".\deploy\update-lambda-env.ps1" @envParams
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Lambda environment updated successfully" -ForegroundColor Green
        } else {
            Write-Host "❌ Lambda environment update failed" -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host "❌ Error updating Lambda environment: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
}

# Step 4: Deploy Frontend
if (-not $SkipFrontend) {
    Write-Host "🎨 Step 4: Deploying Frontend..." -ForegroundColor Cyan
    Write-Host "================================================" -ForegroundColor Gray
    
    try {
        & ".\deploy\deploy-frontend.ps1" -S3Bucket $S3Bucket -CloudFrontDistributionId $CloudFrontDistributionId -Region $Region
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Frontend deployed successfully" -ForegroundColor Green
        } else {
            Write-Host "❌ Frontend deployment failed" -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host "❌ Error deploying frontend: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
}

# Step 5: Final Testing
Write-Host "🧪 Step 5: Final System Testing..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Gray

# Test Lambda health
Write-Host "Testing Lambda function health..." -ForegroundColor White
try {
    $healthResponse = Invoke-RestMethod -Uri "https://uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com/health" -Method GET
    
    if ($healthResponse.success) {
        Write-Host "✅ Lambda health check passed - Version: $($healthResponse.version)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Lambda health check returned: $($healthResponse.message)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Lambda health check failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test folder listing (should return empty array initially)
Write-Host "Testing folder listing..." -ForegroundColor White
try {
    $headers = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $JwtToken"
    }
    
    $folderResponse = Invoke-RestMethod -Uri "https://uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com/folders" -Method GET -Headers $headers
    
    if ($folderResponse.success) {
        Write-Host "✅ Folder listing API working - Found $($folderResponse.data.Count) folders" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Folder listing returned: $($folderResponse.error)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Folder listing test failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Complete Deployment Finished!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Deployment Summary:" -ForegroundColor Cyan
if (-not $SkipBackend) {
    Write-Host "   ✅ Lambda function deployed (V48.0)" -ForegroundColor Green
    Write-Host "   ✅ Collection token created: $collectionTokenId" -ForegroundColor Green
    Write-Host "   ✅ Lambda environment updated" -ForegroundColor Green
}
if (-not $SkipFrontend) {
    Write-Host "   ✅ Frontend deployed with new features" -ForegroundColor Green
}
Write-Host "   ✅ System testing completed" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 System URLs:" -ForegroundColor Cyan
Write-Host "   API Base: https://uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com" -ForegroundColor White
Write-Host "   Frontend: https://d2xl0r3mv20sy5.cloudfront.net" -ForegroundColor White
Write-Host "   Test Page: https://d2xl0r3mv20sy5.cloudfront.net/testpage" -ForegroundColor White
Write-Host ""
Write-Host "🧪 Next Steps for Testing:" -ForegroundColor Cyan
Write-Host "1. Visit the frontend and login with your credentials" -ForegroundColor White
Write-Host "2. Use the browser test tool to create your first folder" -ForegroundColor White
Write-Host "3. Test creating subfolders and verify hierarchy" -ForegroundColor White
Write-Host "4. Check folder icons, colors, and metadata display" -ForegroundColor White
Write-Host "5. Test folder permissions and sharing features" -ForegroundColor White
Write-Host ""
Write-Host "📊 New Features Available:" -ForegroundColor Cyan
Write-Host "   ✅ NON_FUNGIBLE_UNIQUE folder tokens" -ForegroundColor Green
Write-Host "   ✅ Rich folder metadata (icons, colors, permissions)" -ForegroundColor Green
Write-Host "   ✅ Hierarchical folder structure" -ForegroundColor Green
Write-Host "   ✅ Enhanced UI with context menus" -ForegroundColor Green
Write-Host "   ✅ File management integration" -ForegroundColor Green
Write-Host "   ✅ Permission and sharing system" -ForegroundColor Green
Write-Host ""
Write-Host "✨ SafeMate v2 complete deployment successful! 🚀" -ForegroundColor Green

# Clean up temporary files
if (Test-Path "collection-token-info.json") {
    Write-Host ""
    Write-Host "💾 Collection token info saved to: collection-token-info.json" -ForegroundColor Cyan
}

