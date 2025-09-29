# Test the 502 error fix
Write-Host "Testing 502 error fix..." -ForegroundColor Green

# Test folder listing first
Write-Host "Step 1: Testing folder listing..." -ForegroundColor Yellow
try {
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
    } else {
        Write-Host "No folders found (this is normal for a fresh account)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Folder listing failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
}

# Test folder creation
Write-Host "Step 2: Testing folder creation..." -ForegroundColor Yellow
$testPayload = @{
    name = "Test Folder $(Get-Date -Format 'HH:mm:ss')"
} | ConvertTo-Json

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
        
        # Test folder listing again
        Write-Host "Step 3: Testing folder listing after creation..." -ForegroundColor Yellow
        try {
            $listResponse2 = Invoke-RestMethod -Uri "https://uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com/preprod/folders" -Method GET -Headers @{
                "Authorization" = "Bearer test-token"
            }
            
            Write-Host "✅ Folder listing after creation successful!" -ForegroundColor Green
            Write-Host "Total folders: $($listResponse2.data.Count)" -ForegroundColor Cyan
            
            if ($listResponse2.data.Count -gt 0) {
                Write-Host "Folders found:" -ForegroundColor Green
                $listResponse2.data | ForEach-Object {
                    Write-Host "  - $($_.name) (ID: $($_.id))" -ForegroundColor White
                }
                
                # Check if our test folder is in the list
                $testFolder = $listResponse2.data | Where-Object { $_.name -like "Test Folder*" }
                if ($testFolder) {
                    Write-Host "✅ Test folder found in list!" -ForegroundColor Green
                    Write-Host "Test folder details:" -ForegroundColor Cyan
                    $testFolder | ConvertTo-Json -Depth 5 | Write-Host -ForegroundColor White
                } else {
                    Write-Host "❌ Test folder NOT found in list" -ForegroundColor Red
                }
            } else {
                Write-Host "❌ No folders found after creation" -ForegroundColor Red
            }
        } catch {
            Write-Host "❌ Folder listing after creation failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "❌ Folder creation failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
}

Write-Host "502 error fix test completed" -ForegroundColor Green
