# Test the folder listing fix
Write-Host "Testing folder listing fix..." -ForegroundColor Green

# Test folder creation
$testPayload = @{
    name = "Test Folder $(Get-Date -Format 'HH:mm:ss')"
} | ConvertTo-Json

Write-Host "Creating test folder..." -ForegroundColor Yellow
try {
    $createResponse = Invoke-RestMethod -Uri "https://uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com/preprod/folders" -Method POST -Body $testPayload -ContentType "application/json" -Headers @{
        "Authorization" = "Bearer test-token"
    }
    
    Write-Host "✅ Folder creation successful!" -ForegroundColor Green
    Write-Host "Response: $($createResponse | ConvertTo-Json -Depth 5)" -ForegroundColor White
    
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
    } else {
        Write-Host "❌ No folders found - fix may not be working" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Test completed" -ForegroundColor Green
