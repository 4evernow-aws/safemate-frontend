# SafeMate v2 Collection Token Creation Script
# Creates a new NON_FUNGIBLE_UNIQUE collection token for folders

param(
    [string]$ApiBaseUrl = "https://uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com",
    [string]$JwtToken = ""
)

Write-Host "🎯 SafeMate v2 Collection Token Creation Script" -ForegroundColor Green
Write-Host "Creating new NON_FUNGIBLE_UNIQUE collection token..." -ForegroundColor Yellow
Write-Host ""

# Check if JWT token is provided
if (-not $JwtToken) {
    Write-Host "❌ JWT token is required. Please provide it as a parameter:" -ForegroundColor Red
    Write-Host "   .\create-collection-token.ps1 -JwtToken 'your_jwt_token_here'" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 To get your JWT token:" -ForegroundColor Cyan
    Write-Host "   1. Login to SafeMate frontend" -ForegroundColor White
    Write-Host "   2. Open browser developer tools (F12)" -ForegroundColor White
    Write-Host "   3. Go to Application/Storage tab" -ForegroundColor White
    Write-Host "   4. Look for 'safemate_auth_token' in localStorage" -ForegroundColor White
    Write-Host "   5. Copy the token value" -ForegroundColor White
    exit 1
}

Write-Host "🔧 Configuration:" -ForegroundColor Cyan
Write-Host "   API Base URL: $ApiBaseUrl" -ForegroundColor White
Write-Host "   JWT Token: $($JwtToken.Substring(0, 20))..." -ForegroundColor White
Write-Host ""

# Test API connectivity first
Write-Host "🧪 Testing API connectivity..." -ForegroundColor Cyan
try {
    $healthResponse = Invoke-RestMethod -Uri "$ApiBaseUrl/health" -Method GET -Headers @{
        "Content-Type" = "application/json"
    }
    
    if ($healthResponse.success) {
        Write-Host "✅ API is healthy - Version: $($healthResponse.version)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  API health check returned: $($healthResponse.message)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ API connectivity test failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Please check if the API is running and accessible" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "🎯 Creating new collection token..." -ForegroundColor Cyan

try {
    $headers = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $JwtToken"
    }
    
    $createResponse = Invoke-RestMethod -Uri "$ApiBaseUrl/folders/create-collection" -Method POST -Headers $headers
    
    if ($createResponse.success) {
        Write-Host "✅ Collection token created successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 Token Details:" -ForegroundColor Cyan
        Write-Host "   Token ID: $($createResponse.tokenId)" -ForegroundColor White
        Write-Host "   Message: $($createResponse.message)" -ForegroundColor White
        Write-Host ""
        
        # Save token ID to file for easy reference
        $tokenInfo = @{
            tokenId = $createResponse.tokenId
            createdAt = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            message = $createResponse.message
        }
        
        $tokenInfo | ConvertTo-Json | Out-File -FilePath "collection-token-info.json" -Encoding UTF8
        Write-Host "💾 Token information saved to: collection-token-info.json" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "🔧 Next Steps:" -ForegroundColor Cyan
        Write-Host "1. Update Lambda environment variable:" -ForegroundColor White
        Write-Host "   FOLDER_COLLECTION_TOKEN=$($createResponse.tokenId)" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "2. Update Lambda function configuration:" -ForegroundColor White
        Write-Host "   aws lambda update-function-configuration `" -ForegroundColor Yellow
        Write-Host "     --function-name preprod-safemate-hedera-service `" -ForegroundColor Yellow
        Write-Host "     --environment Variables='{`"FOLDER_COLLECTION_TOKEN`":`"$($createResponse.tokenId)`"}'" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "3. Test folder creation:" -ForegroundColor White
        Write-Host "   Use the browser test tool to create your first folder" -ForegroundColor White
        Write-Host ""
        Write-Host "4. Verify in Hedera Explorer:" -ForegroundColor White
        Write-Host "   https://testnet.hederaexplorer.io/token/$($createResponse.tokenId)" -ForegroundColor Yellow
        
    } else {
        Write-Host "❌ Failed to create collection token" -ForegroundColor Red
        Write-Host "   Error: $($createResponse.error)" -ForegroundColor White
        
        if ($createResponse.error -like "*authentication*" -or $createResponse.error -like "*forbidden*") {
            Write-Host ""
            Write-Host "💡 Authentication Error - Possible solutions:" -ForegroundColor Cyan
            Write-Host "   1. Check if JWT token is valid and not expired" -ForegroundColor White
            Write-Host "   2. Make sure you're logged in to SafeMate frontend" -ForegroundColor White
            Write-Host "   3. Try getting a fresh JWT token" -ForegroundColor White
        }
        
        exit 1
    }
    
} catch {
    Write-Host "❌ Error creating collection token: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Message -like "*401*" -or $_.Exception.Message -like "*403*") {
        Write-Host ""
        Write-Host "💡 Authentication Error - Possible solutions:" -ForegroundColor Cyan
        Write-Host "   1. Check if JWT token is valid and not expired" -ForegroundColor White
        Write-Host "   2. Make sure you're logged in to SafeMate frontend" -ForegroundColor White
        Write-Host "   3. Try getting a fresh JWT token" -ForegroundColor White
    } elseif ($_.Exception.Message -like "*timeout*" -or $_.Exception.Message -like "*connection*") {
        Write-Host ""
        Write-Host "💡 Connection Error - Possible solutions:" -ForegroundColor Cyan
        Write-Host "   1. Check your internet connection" -ForegroundColor White
        Write-Host "   2. Verify the API URL is correct" -ForegroundColor White
        Write-Host "   3. Check if the Lambda function is deployed and running" -ForegroundColor White
    }
    
    exit 1
}

Write-Host ""
Write-Host "🎉 Collection token creation completed successfully! 🚀" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "   ✅ New NON_FUNGIBLE_UNIQUE collection token created" -ForegroundColor Green
Write-Host "   ✅ Token ID: $($createResponse.tokenId)" -ForegroundColor Green
Write-Host "   ✅ Ready for folder creation" -ForegroundColor Green
Write-Host "   ✅ Token info saved to collection-token-info.json" -ForegroundColor Green
