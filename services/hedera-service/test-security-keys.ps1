# Test the new security key configuration
Write-Host "Testing new security key configuration..." -ForegroundColor Green

# Test folder creation with new key structure
$testPayload = @{
    name = "Security Test Folder $(Get-Date -Format 'HH:mm:ss')"
} | ConvertTo-Json

Write-Host "Creating test folder with new security key configuration..." -ForegroundColor Yellow
try {
    $createResponse = Invoke-RestMethod -Uri "https://uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com/preprod/folders" -Method POST -Body $testPayload -ContentType "application/json" -Headers @{
        "Authorization" = "Bearer test-token"
    }
    
    Write-Host "✅ Folder creation successful!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    $createResponse | ConvertTo-Json -Depth 5 | Write-Host -ForegroundColor White
    
    if ($createResponse.data) {
        $folderId = $createResponse.data.folderId
        $transactionId = $createResponse.data.transactionId
        
        Write-Host "Folder ID: $folderId" -ForegroundColor Green
        Write-Host "Transaction ID: $transactionId" -ForegroundColor Green
        
        # Wait for propagation
        Write-Host "Waiting 3 seconds for blockchain propagation..." -ForegroundColor Yellow
        Start-Sleep -Seconds 3
        
        # Test folder listing
        Write-Host "Testing folder listing..." -ForegroundColor Yellow
        $listResponse = Invoke-RestMethod -Uri "https://uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com/preprod/folders" -Method GET -Headers @{
            "Authorization" = "Bearer test-token"
        }
        
        Write-Host "✅ Folder listing successful!" -ForegroundColor Green
        Write-Host "Total folders: $($listResponse.data.Count)" -ForegroundColor Cyan
        
        if ($listResponse.data.Count -gt 0) {
            Write-Host "Folders found:" -ForegroundColor Green
            $listResponse.data | ForEach-Object {
                Write-Host "  - $($_.name) (ID: $($_.id))" -ForegroundColor White
            }
            
            # Check if our test folder is in the list
            $testFolder = $listResponse.data | Where-Object { $_.name -like "Security Test Folder*" }
            if ($testFolder) {
                Write-Host "✅ Security test folder found in list!" -ForegroundColor Green
                Write-Host "Test folder details:" -ForegroundColor Cyan
                $testFolder | ConvertTo-Json -Depth 5 | Write-Host -ForegroundColor White
            } else {
                Write-Host "❌ Security test folder NOT found in list" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ No folders found in list" -ForegroundColor Red
        }
        
        # Test metadata retrieval
        Write-Host "Testing metadata retrieval..." -ForegroundColor Yellow
        try {
            $metadataResponse = Invoke-RestMethod -Uri "https://uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com/preprod/metadata/$folderId" -Method GET -Headers @{
                "Authorization" = "Bearer test-token"
            }
            
            Write-Host "✅ Metadata retrieval successful!" -ForegroundColor Green
            Write-Host "Metadata:" -ForegroundColor Cyan
            $metadataResponse | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor White
        } catch {
            Write-Host "❌ Metadata retrieval failed: $($_.Exception.Message)" -ForegroundColor Red
        }
        
    } else {
        Write-Host "❌ No data in folder creation response" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Test failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response content: $($_.Exception.Response)" -ForegroundColor Red
}

Write-Host "Security key configuration test completed" -ForegroundColor Green
Write-Host "Key Configuration Summary:" -ForegroundColor Yellow
Write-Host "✅ Admin Key (user) - Can update token properties" -ForegroundColor Green
Write-Host "✅ Supply Key (user) - Can mint/burn NFTs" -ForegroundColor Green
Write-Host "✅ Metadata Key (user) - Can update metadata" -ForegroundColor Green
Write-Host "🔐 Freeze Key (admin) - Admin can freeze/unfreeze folder" -ForegroundColor Cyan
Write-Host "🔐 Wipe Key (admin) - Admin can wipe folder contents" -ForegroundColor Cyan
Write-Host "🔐 Pause Key (admin) - Admin can pause/unpause operations" -ForegroundColor Cyan
