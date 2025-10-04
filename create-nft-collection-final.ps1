# Create NFT Collection Token with Exact Specifications
# Based on the user's requirements for SafeMate Folders

Write-Host "🎯 Creating NFT Collection Token - SafeMate Folders" -ForegroundColor Green
Write-Host "Using exact specifications provided" -ForegroundColor Yellow
Write-Host ""

$jwtToken = "eyJraWQiOiJSSjlwaStibXlqVk81SjJsSEM5YnFPTlBNOGszbTk4VjFjRDFpa0Q5QlhFPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI5OTNlNzQ1OC0yMDAxLTcwODMtNWZjMy02MWY3NjljMTQ1OWMiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuYXAtc291dGhlYXN0LTIuYW1hem9uYXdzLmNvbVwvYXAtc291dGhlYXN0LTJfYTJydHA2NEpXIiwiY29nbml0bzp1c2VybmFtZSI6Ijk5M2U3NDU4LTIwMDEtNzA4My01ZmMzLTYxZjc2OWMxNDU5YyIsImdpdmVuX25hbWUiOiJTaW1vbiIsIm9yaWdpbl9qdGkiOiIyZTMwOTk2Yy1lMjQ1LTQ0Y2ItOTdmOC1hNGE4ZjljNjg2MjciLCJhdWQiOiI0dWNjZzZ1anVwcGhob3Z0MXV0djNpNjdhNyIsImN1c3RvbTphY2NvdW50X3R5cGUiOiJQZXJzb25hbCIsImV2ZW50X2lkIjoiZDE3ZWY2NzItY2MyMC00OWM0LWFiNjAtZTE3NDJjZmM3OGNhIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE3NTkzMDIzMzksImV4cCI6MTc1OTM4ODczOSwiaWF0IjoxNzU5MzAyMzM5LCJmYW1pbHlfbmFtZSI6Ildvb2RzIiwianRpIjoiMWEwYWZlZDQtY2MwOS00MTZmLWIzYjctMDJjOWI1M2VlNDUwIiwiZW1haWwiOiJzaW1vbi53b29kc0B0bmUuY29tLmF1In0.MFpUPUVtWqA_ZNLNSRXVQ_85DdQ2XI0MagxeyCQHdgEXKZsJ-JSgGvTvRl4iO2LgT1eINF6D-Od8O6cvpHnV2yXrPLumuQqqxukzOxYeU7yRgV32oPjfB2AR35r5FhZqhv4q9CfXb9P0l6biGyNxs18A00ZnvJCFtYWMcAvjZje1lJX7-Rf7ftsSOcU62ziCN0Zmj2lq3VIxZg0SWXHa6C-VljVIy1Nc1uHiKLnLFD4vRbafNyXOe-XCgAk5sJ4ipkFkSffw13qj9mL22bOHYCFlfnKzBFiKEgvF_4KHV4ozEppn3N8X_D5LOQqRdhk-aGHRb76-1_6wwCOAd4cr8Q"

$baseUrl = "https://uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com/preprod"

Write-Host "📋 NFT Collection Token Specifications:" -ForegroundColor Cyan
Write-Host "   ✅ Type: NON_FUNGIBLE_UNIQUE" -ForegroundColor Green
Write-Host "   ✅ Name: SafeMate Folders" -ForegroundColor Green
Write-Host "   ✅ Symbol: F (for folders) / SF (for subfolders)" -ForegroundColor Green
Write-Host "   ✅ Supply Type: INFINITE" -ForegroundColor Green
Write-Host "   ✅ All necessary keys: Admin, Supply, Freeze, Wipe, KYC, Pause, Fee Schedule" -ForegroundColor Green
Write-Host ""

Write-Host "🎯 Creating collection token..." -ForegroundColor Cyan

try {
    $headers = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $jwtToken"
    }
    
    Write-Host "   Making request to: $baseUrl/folders/create-collection" -ForegroundColor White
    Write-Host "   Headers: Authorization Bearer [JWT Token]" -ForegroundColor Gray
    
    $createResponse = Invoke-RestMethod -Uri "$baseUrl/folders/create-collection" -Method POST -Headers $headers
    
    Write-Host "✅ Collection Token Created Successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Token Details:" -ForegroundColor Cyan
    Write-Host "   Token ID: $($createResponse.tokenId)" -ForegroundColor Yellow
    Write-Host "   Message: $($createResponse.message)" -ForegroundColor White
    Write-Host "   Success: $($createResponse.success)" -ForegroundColor Green
    
    # Save token info to file
    $tokenInfo = @{
        tokenId = $createResponse.tokenId
        message = $createResponse.message
        success = $createResponse.success
        createdAt = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        specifications = @{
            type = "NON_FUNGIBLE_UNIQUE"
            name = "SafeMate Folders"
            symbol = "F"
            supplyType = "INFINITE"
            keys = @("Admin", "Supply", "Freeze", "Wipe", "KYC", "Pause", "Fee Schedule")
        }
    }
    
    $tokenInfo | ConvertTo-Json -Depth 3 | Out-File -FilePath "collection-token-info.json" -Encoding UTF8
    Write-Host ""
    Write-Host "💾 Token information saved to: collection-token-info.json" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "🔧 Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Update Lambda environment with new token ID: $($createResponse.tokenId)" -ForegroundColor White
    Write-Host "2. Test folder creation with new collection token" -ForegroundColor White
    Write-Host "3. Create first folder NFT" -ForegroundColor White
    Write-Host "4. Test folder listing and hierarchy" -ForegroundColor White
    
} catch {
    Write-Host "❌ Collection Token Creation Failed: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response Body: $responseBody" -ForegroundColor Red
        } catch {
            Write-Host "Could not read response body" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    Write-Host "🔍 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Check if Lambda function is running properly" -ForegroundColor White
    Write-Host "2. Verify JWT token is valid and not expired" -ForegroundColor White
    Write-Host "3. Check Lambda logs for detailed error information" -ForegroundColor White
    Write-Host "4. Ensure all environment variables are set correctly" -ForegroundColor White
}

Write-Host ""
Write-Host "🧪 Testing folder listing with current collection token..." -ForegroundColor Cyan

try {
    $headers = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $jwtToken"
    }
    
    $folderResponse = Invoke-RestMethod -Uri "$baseUrl/folders" -Method GET -Headers $headers
    
    Write-Host "✅ Folder Listing Response:" -ForegroundColor Green
    Write-Host "   Success: $($folderResponse.success)" -ForegroundColor White
    Write-Host "   Data: $($folderResponse.data | ConvertTo-Json)" -ForegroundColor White
    
} catch {
    Write-Host "❌ Folder Listing Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   This is expected if no folders exist yet" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Ready to create folder NFTs with rich metadata!" -ForegroundColor Green
