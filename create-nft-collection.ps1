# Create NFT Collection Token Directly
# This script creates a NON_FUNGIBLE_UNIQUE collection token using Hedera SDK

Write-Host "🎯 Creating NFT Collection Token Directly" -ForegroundColor Green
Write-Host "This will create a new NON_FUNGIBLE_UNIQUE collection token for folders" -ForegroundColor Yellow
Write-Host ""

# Check if we have the required environment variables
$hederaAccountId = "0.0.6890393"
$hederaNetwork = "testnet"

Write-Host "🔧 Configuration:" -ForegroundColor Cyan
Write-Host "   Hedera Account: $hederaAccountId" -ForegroundColor White
Write-Host "   Network: $hederaNetwork" -ForegroundColor White
Write-Host ""

# We need the private key - let's check if it's in the Lambda environment
Write-Host "🔍 Checking Lambda environment for private key..." -ForegroundColor Cyan
try {
    $lambdaConfig = aws lambda get-function-configuration --function-name preprod-safemate-hedera-service --query 'Environment.Variables' --output json
    $envVars = $lambdaConfig | ConvertFrom-Json
    
    if ($envVars.HEDERA_PRIVATE_KEY) {
        Write-Host "✅ Found private key in Lambda environment" -ForegroundColor Green
        $hederaPrivateKey = $envVars.HEDERA_PRIVATE_KEY
    } else {
        Write-Host "❌ No private key found in Lambda environment" -ForegroundColor Red
        Write-Host "   We need the private key to create the collection token" -ForegroundColor Yellow
        Write-Host "   The private key should be stored in Lambda environment variable HEDERA_PRIVATE_KEY" -ForegroundColor White
        exit 1
    }
} catch {
    Write-Host "❌ Failed to get Lambda environment: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎯 Creating collection token using Lambda function..." -ForegroundColor Cyan

# Let's try to invoke the Lambda function directly to create the collection token
try {
    $payload = @{
        httpMethod = "POST"
        path = "/folders/create-collection"
        headers = @{
            "Content-Type" = "application/json"
            "Authorization" = "Bearer eyJraWQiOiJSSjlwaStibXlqVk81SjJsSEM5YnFPTlBNOGszbTk4VjFjRDFpa0Q5QlhFPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI5OTNlNzQ1OC0yMDAxLTcwODMtNWZjMy02MWY3NjljMTQ1OWMiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuYXAtc291dGhlYXN0LTIuYW1hem9uYXdzLmNvbVwvYXAtc291dGhlYXN0LTJfYTJydHA2NEpXIiwiY29nbml0bzp1c2VybmFtZSI6Ijk5M2U3NDU4LTIwMDEtNzA4My01ZmMzLTYxZjc2OWMxNDU5YyIsImdpdmVuX25hbWUiOiJTaW1vbiIsIm9yaWdpbl9qdGkiOiIyZTMwOTk2Yy1lMjQ1LTQ0Y2ItOTdmOC1hNGE4ZjljNjg2MjciLCJhdWQiOiI0dWNjZzZ1anVwcGhob3Z0MXV0djNpNjdhNyIsImN1c3RvbTphY2NvdW50X3R5cGUiOiJQZXJzb25hbCIsImV2ZW50X2lkIjoiZDE3ZWY2NzItY2MyMC00OWM0LWFiNjAtZTE3NDJjZmM3OGNhIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE3NTkzMDIzMzksImV4cCI6MTc1OTM4ODczOSwiaWF0IjoxNzU5MzAyMzM5LCJmYW1pbHlfbmFtZSI6Ildvb2RzIiwianRpIjoiMWEwYWZlZDQtY2MwOS00MTZmLWIzYjctMDJjOWI1M2VlNDUwIiwiZW1haWwiOiJzaW1vbi53b29kc0B0bmUuY29tLmF1In0.MFpUPUVtWqA_ZNLNSRXVQ_85DdQ2XI0MagxeyCQHdgEXKZsJ-JSgGvTvRl4iO2LgT1eINF6D-Od8O6cvpHnV2yXrPLumuQqqxukzOxYeU7yRgV32oPjfB2AR35r5FhZqhv4q9CfXb9P0l6biGyNxs18A00ZnvJCFtYWMcAvjZje1lJX7-Rf7ftsSOcU62ziCN0Zmj2lq3VIxZg0SWXHa6C-VljVIy1Nc1uHiKLnLFD4vRbafNyXOe-XCgAk5sJ4ipkFkSffw13qj9mL22bOHYCFlfnKzBFiKEgvF_4KHV4ozEppn3N8X_D5LOQqRdhk-aGHRb76-1_6wwCOAd4cr8Q"
        }
        body = ""
    } | ConvertTo-Json -Depth 3
    
    Write-Host "Invoking Lambda function directly..." -ForegroundColor White
    $response = aws lambda invoke --function-name preprod-safemate-hedera-service --payload $payload response.json
    
    if (Test-Path "response.json") {
        $result = Get-Content "response.json" | ConvertFrom-Json
        Write-Host "✅ Lambda Response: $($result | ConvertTo-Json)" -ForegroundColor Green
        
        if ($result.statusCode -eq 200) {
            $body = $result.body | ConvertFrom-Json
            if ($body.success) {
                Write-Host "🎉 Collection Token Created Successfully!" -ForegroundColor Green
                Write-Host "Token ID: $($body.tokenId)" -ForegroundColor Yellow
                
                # Save to file
                $tokenInfo = @{
                    tokenId = $body.tokenId
                    message = $body.message
                    createdAt = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                }
                $tokenInfo | ConvertTo-Json | Out-File -FilePath "collection-token-info.json" -Encoding UTF8
                Write-Host "💾 Token info saved to collection-token-info.json" -ForegroundColor Green
                
                Write-Host ""
                Write-Host "🔧 Next Steps:" -ForegroundColor Cyan
                Write-Host "1. Update Lambda environment with new token ID" -ForegroundColor White
                Write-Host "2. Test folder creation with new collection token" -ForegroundColor White
            } else {
                Write-Host "❌ Collection token creation failed: $($body.error)" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ Lambda returned error status: $($result.statusCode)" -ForegroundColor Red
        }
        
        Remove-Item "response.json" -ErrorAction SilentlyContinue
    }
    
} catch {
    Write-Host "❌ Failed to invoke Lambda function: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 Alternative: Let's check what collection tokens already exist..." -ForegroundColor Cyan

# Let's check what tokens the account currently has
try {
    Write-Host "Checking existing tokens for account $hederaAccountId..." -ForegroundColor White
    
    # We can use the mirror node to check existing tokens
    $mirrorUrl = "https://testnet.mirrornode.hedera.com/api/v1/accounts/$hederaAccountId/tokens"
    $tokensResponse = Invoke-RestMethod -Uri $mirrorUrl -Method GET
    
    Write-Host "✅ Found $($tokensResponse.tokens.Count) tokens for this account" -ForegroundColor Green
    
    foreach ($token in $tokensResponse.tokens) {
        Write-Host "   Token ID: $($token.token_id)" -ForegroundColor White
        Write-Host "   Symbol: $($token.symbol)" -ForegroundColor White
        Write-Host "   Name: $($token.name)" -ForegroundColor White
        Write-Host "   Type: $($token.type)" -ForegroundColor White
        Write-Host "   ---" -ForegroundColor Gray
    }
    
} catch {
    Write-Host "❌ Failed to check existing tokens: $($_.Exception.Message)" -ForegroundColor Red
}
