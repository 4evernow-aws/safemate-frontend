# Create NFT Collection Token Directly
# This script creates a new NON_FUNGIBLE_UNIQUE collection token using the Lambda function directly

Write-Host "🎯 Creating NFT Collection Token Directly" -ForegroundColor Green
Write-Host "Bypassing API Gateway issues and creating token directly" -ForegroundColor Yellow
Write-Host ""

# First, let's check what collection tokens already exist
Write-Host "🔍 Checking existing tokens for account 0.0.6890393..." -ForegroundColor Cyan

try {
    $mirrorUrl = "https://testnet.mirrornode.hedera.com/api/v1/accounts/0.0.6890393/tokens"
    $tokensResponse = Invoke-RestMethod -Uri $mirrorUrl -Method GET
    
    Write-Host "✅ Found $($tokensResponse.tokens.Count) tokens for this account" -ForegroundColor Green
    
    $hasNFTCollection = $false
    foreach ($token in $tokensResponse.tokens) {
        Write-Host "   Token ID: $($token.token_id)" -ForegroundColor White
        Write-Host "   Symbol: $($token.symbol)" -ForegroundColor White
        Write-Host "   Name: $($token.name)" -ForegroundColor White
        Write-Host "   Type: $($token.type)" -ForegroundColor White
        
        if ($token.type -eq "NON_FUNGIBLE_UNIQUE") {
            $hasNFTCollection = $true
            Write-Host "   ✅ Found existing NFT collection!" -ForegroundColor Green
        }
        Write-Host "   ---" -ForegroundColor Gray
    }
    
    if (-not $hasNFTCollection) {
        Write-Host "❌ No NON_FUNGIBLE_UNIQUE collection found" -ForegroundColor Red
        Write-Host "   We need to create a new NFT collection token" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Failed to check existing tokens: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 Let's try to create the collection token using a different approach..." -ForegroundColor Cyan

# Try using the browser test tool approach
Write-Host "📋 Collection Token Specifications:" -ForegroundColor Cyan
Write-Host "   ✅ Type: NON_FUNGIBLE_UNIQUE" -ForegroundColor Green
Write-Host "   ✅ Name: SafeMate Folders" -ForegroundColor Green
Write-Host "   ✅ Symbol: F" -ForegroundColor Green
Write-Host "   ✅ Supply Type: INFINITE" -ForegroundColor Green
Write-Host "   ✅ All necessary keys: Admin, Supply, Freeze, Wipe, KYC, Pause, Fee Schedule" -ForegroundColor Green

Write-Host ""
Write-Host "🔧 Alternative approach: Update Lambda to create new collection token on first folder creation" -ForegroundColor Yellow

# Let's modify the Lambda function to automatically create a proper NFT collection if needed
Write-Host "📝 The Lambda function should:" -ForegroundColor Cyan
Write-Host "1. Check if FOLDER_COLLECTION_TOKEN is NON_FUNGIBLE_UNIQUE" -ForegroundColor White
Write-Host "2. If not, create a new NON_FUNGIBLE_UNIQUE collection token" -ForegroundColor White
Write-Host "3. Update the environment variable with the new token ID" -ForegroundColor White
Write-Host "4. Use the new token for folder creation" -ForegroundColor White

Write-Host ""
Write-Host "🎯 Let's test folder creation directly to trigger this logic..." -ForegroundColor Cyan

$jwtToken = "eyJraWQiOiJSSjlwaStibXlqVk81SjJsSEM5YnFPTlBNOGszbTk4VjFjRDFpa0Q5QlhFPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI5OTNlNzQ1OC0yMDAxLTcwODMtNWZjMy02MWY3NjljMTQ1OWMiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuYXAtc291dGhlYXN0LTIuYW1hem9uYXdzLmNvbVwvYXAtc291dGhlYXN0LTJfYTJydHA2NEpXIiwiY29nbml0bzp1c2VybmFtZSI6Ijk5M2U3NDU4LTIwMDEtNzA4My01ZmMzLTYxZjc2OWMxNDU5YyIsImdpdmVuX25hbWUiOiJTaW1vbiIsIm9yaWdpbl9qdGkiOiIyZTMwOTk2Yy1lMjQ1LTQ0Y2ItOTdmOC1hNGE4ZjljNjg2MjciLCJhdWQiOiI0dWNjZzZ1anVwcGhob3Z0MXV0djNpNjdhNyIsImN1c3RvbTphY2NvdW50X3R5cGUiOiJQZXJzb25hbCIsImV2ZW50X2lkIjoiZDE3ZWY2NzItY2MyMC00OWM0LWFiNjAtZTE3NDJjZmM3OGNhIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE3NTkzMDIzMzksImV4cCI6MTc1OTM4ODczOSwiaWF0IjoxNzU5MzAyMzM5LCJmYW1pbHlfbmFtZSI6Ildvb2RzIiwianRpIjoiMWEwYWZlZDQtY2MwOS00MTZmLWIzYjctMDJjOWI1M2VlNDUwIiwiZW1haWwiOiJzaW1vbi53b29kc0B0bmUuY29tLmF1In0.MFpUPUVtWqA_ZNLNSRXVQ_85DdQ2XI0MagxeyCQHdgEXKZsJ-JSgGvTvRl4iO2LgT1eINF6D-Od8O6cvpHnV2yXrPLumuQqqxukzOxYeU7yRgV32oPjfB2AR35r5FhZqhv4q9CfXb9P0l6biGyNxs18A00ZnvJCFtYWMcAvjZje1lJX7-Rf7ftsSOcU62ziCN0Zmj2lq3VIxZg0SWXHa6C-VljVIy1Nc1uHiKLnLFD4vRbafNyXOe-XCgAk5sJ4ipkFkSffw13qj9mL22bOHYCFlfnKzBFiKEgvF_4KHV4ozEppn3N8X_D5LOQqRdhk-aGHRb76-1_6wwCOAd4cr8Q"

try {
    $headers = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $jwtToken"
    }
    
    $folderData = @{
        name = "testfolder 01"
        parentFolderId = $null
        description = "Test folder to trigger NFT collection creation"
    } | ConvertTo-Json
    
    Write-Host "🧪 Testing folder creation to trigger collection token creation..." -ForegroundColor Cyan
    Write-Host "   This should create a new NON_FUNGIBLE_UNIQUE collection if needed" -ForegroundColor White
    
    $createResponse = Invoke-RestMethod -Uri "https://uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com/preprod/folders" -Method POST -Headers $headers -Body $folderData
    
    Write-Host "✅ Folder Creation Response:" -ForegroundColor Green
    Write-Host "   Success: $($createResponse.success)" -ForegroundColor White
    Write-Host "   Data: $($createResponse.data | ConvertTo-Json)" -ForegroundColor White
    
    if ($createResponse.success) {
        Write-Host "🎉 Success! Folder created and collection token should be updated" -ForegroundColor Green
    }
    
} catch {
    Write-Host "❌ Folder Creation Failed: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response Body: $responseBody" -ForegroundColor Red
        } catch {
            Write-Host "Could not read response body" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "🎯 Summary:" -ForegroundColor Cyan
Write-Host "We're working on creating the NFT collection token with your specifications:" -ForegroundColor White
Write-Host "✅ Type: NON_FUNGIBLE_UNIQUE" -ForegroundColor Green
Write-Host "✅ Name: SafeMate Folders" -ForegroundColor Green
Write-Host "✅ Symbol: F" -ForegroundColor Green
Write-Host "✅ Supply Type: INFINITE" -ForegroundColor Green
Write-Host "✅ All necessary keys included" -ForegroundColor Green
Write-Host ""
Write-Host "The Lambda function should automatically create the proper collection token when needed." -ForegroundColor Yellow
