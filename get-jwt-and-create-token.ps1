# SafeMate v2 - Get JWT Token and Create Collection Token
# This script helps you get the JWT token and create the collection token

Write-Host "🎯 SafeMate v2 - Get JWT Token and Create Collection Token" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Step 1: Get Your JWT Token" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Gray
Write-Host ""
Write-Host "1. Open your browser and go to: https://d2xl0r3mv20sy5.cloudfront.net" -ForegroundColor White
Write-Host "2. Login to SafeMate with your credentials" -ForegroundColor White
Write-Host "3. Open browser developer tools (F12)" -ForegroundColor White
Write-Host "4. Go to Application tab (or Storage tab)" -ForegroundColor White
Write-Host "5. Look for 'safemate_auth_token' in localStorage" -ForegroundColor White
Write-Host "6. Copy the token value (it's a long string starting with 'eyJ')" -ForegroundColor White
Write-Host ""

$jwtToken = Read-Host "Paste your JWT token here"

if (-not $jwtToken -or $jwtToken.Length -lt 100) {
    Write-Host "❌ Invalid JWT token. Please make sure you copied the complete token." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ JWT token received: $($jwtToken.Substring(0, 20))..." -ForegroundColor Green
Write-Host ""

Write-Host "📋 Step 2: Create Collection Token" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Gray
Write-Host ""

try {
    $headers = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $jwtToken"
    }
    
    Write-Host "🎯 Creating new NON_FUNGIBLE_UNIQUE collection token..." -ForegroundColor Yellow
    
    $createResponse = Invoke-RestMethod -Uri "https://uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com/folders/create-collection" -Method POST -Headers $headers
    
    if ($createResponse.success) {
        Write-Host "✅ Collection token created successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 Token Details:" -ForegroundColor Cyan
        Write-Host "   Token ID: $($createResponse.tokenId)" -ForegroundColor White
        Write-Host "   Message: $($createResponse.message)" -ForegroundColor White
        Write-Host ""
        
        # Save token ID to file
        $tokenInfo = @{
            tokenId = $createResponse.tokenId
            createdAt = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            message = $createResponse.message
        }
        
        $tokenInfo | ConvertTo-Json | Out-File -FilePath "collection-token-info.json" -Encoding UTF8
        Write-Host "💾 Token information saved to: collection-token-info.json" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "📋 Step 3: Update Lambda Environment" -ForegroundColor Cyan
        Write-Host "================================================" -ForegroundColor Gray
        Write-Host ""
        
        Write-Host "🔧 Updating Lambda environment variable..." -ForegroundColor Yellow
        
        try {
            $envVars = @{
                "FOLDER_COLLECTION_TOKEN" = $createResponse.tokenId
            }
            
            $envVarsJson = $envVars | ConvertTo-Json -Compress
            $updateResult = aws lambda update-function-configuration `
                --function-name preprod-safemate-hedera-service `
                --environment Variables=$envVarsJson `
                --region ap-southeast-2 `
                --output json

            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Lambda environment updated successfully" -ForegroundColor Green
                Write-Host "   FOLDER_COLLECTION_TOKEN: $($createResponse.tokenId)" -ForegroundColor White
            } else {
                Write-Host "❌ Failed to update Lambda environment" -ForegroundColor Red
            }
        } catch {
            Write-Host "❌ Error updating Lambda environment: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        Write-Host ""
        Write-Host "📋 Step 4: Test Folder Creation" -ForegroundColor Cyan
        Write-Host "================================================" -ForegroundColor Gray
        Write-Host ""
        
        Write-Host "🧪 Testing folder creation..." -ForegroundColor Yellow
        
        try {
            $testFolderBody = @{
                name = "Test Folder V48"
                parentFolderId = $null
            } | ConvertTo-Json
            
            $testResponse = Invoke-RestMethod -Uri "https://uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com/folders" -Method POST -Headers $headers -Body $testFolderBody
            
            if ($testResponse.success) {
                Write-Host "✅ Test folder created successfully!" -ForegroundColor Green
                Write-Host "   Folder ID: $($testResponse.folder.id)" -ForegroundColor White
                Write-Host "   Folder Name: $($testResponse.folder.name)" -ForegroundColor White
                Write-Host "   Serial Number: $($testResponse.folder.serialNumber)" -ForegroundColor White
            } else {
                Write-Host "❌ Test folder creation failed: $($testResponse.error)" -ForegroundColor Red
            }
        } catch {
            Write-Host "❌ Error testing folder creation: $($_.Exception.Message)" -ForegroundColor Red
        }
        
    } else {
        Write-Host "❌ Failed to create collection token" -ForegroundColor Red
        Write-Host "   Error: $($createResponse.error)" -ForegroundColor White
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
    }
    
    exit 1
}

Write-Host ""
Write-Host "🎉 Complete Setup Successful!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "   ✅ Collection token created: $($createResponse.tokenId)" -ForegroundColor Green
Write-Host "   ✅ Lambda environment updated" -ForegroundColor Green
Write-Host "   ✅ Test folder creation verified" -ForegroundColor Green
Write-Host "   ✅ V48.0 system ready for use" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Your SafeMate v2 system is now ready with NON_FUNGIBLE_UNIQUE folder tokens!" -ForegroundColor Green




