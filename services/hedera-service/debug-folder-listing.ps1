# Debug script to test folder listing functionality
param(
    [string]$ApiUrl = "https://uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com/preprod",
    [string]$TestFolderName = "Debug Test Folder $(Get-Date -Format 'HH:mm:ss')"
)

Write-Host "Debugging folder listing functionality..." -ForegroundColor Green
Write-Host "API URL: $ApiUrl" -ForegroundColor Cyan
Write-Host "Test Folder: $TestFolderName" -ForegroundColor Cyan

# Test payload for folder creation
$testPayload = @{
    name = $TestFolderName
} | ConvertTo-Json

Write-Host "Step 1: Creating test folder..." -ForegroundColor Yellow
try {
    $createResponse = Invoke-RestMethod -Uri "$ApiUrl/folders" -Method POST -Body $testPayload -ContentType "application/json" -Headers @{
        "Authorization" = "Bearer test-token"
    }
    
    Write-Host "✅ Folder creation successful!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    $createResponse | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor White
    
    if ($createResponse.data) {
        $folderId = $createResponse.data.folderId
        $transactionId = $createResponse.data.transactionId
        
        Write-Host "Folder ID: $folderId" -ForegroundColor Green
        Write-Host "Transaction ID: $transactionId" -ForegroundColor Green
        
        # Wait a moment for blockchain propagation
        Write-Host "Waiting 5 seconds for blockchain propagation..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
        
        # Test folder listing
        Write-Host "Step 2: Testing folder listing..." -ForegroundColor Yellow
        try {
            $listResponse = Invoke-RestMethod -Uri "$ApiUrl/folders" -Method GET -Headers @{
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
                $testFolder = $listResponse.data | Where-Object { $_.name -eq $TestFolderName }
                if ($testFolder) {
                    Write-Host "✅ Test folder found in list!" -ForegroundColor Green
                    Write-Host "Test folder details:" -ForegroundColor Cyan
                    $testFolder | ConvertTo-Json -Depth 5 | Write-Host -ForegroundColor White
                } else {
                    Write-Host "❌ Test folder NOT found in list" -ForegroundColor Red
                    Write-Host "This indicates a problem with the folder listing logic" -ForegroundColor Red
                }
            } else {
                Write-Host "❌ No folders found in list" -ForegroundColor Red
                Write-Host "This indicates a problem with the folder listing logic" -ForegroundColor Red
            }
        } catch {
            Write-Host "❌ Folder listing failed: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # Test direct folder metadata retrieval
        Write-Host "Step 3: Testing direct folder metadata retrieval..." -ForegroundColor Yellow
        try {
            $metadataResponse = Invoke-RestMethod -Uri "$ApiUrl/metadata/$folderId" -Method GET -Headers @{
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
    Write-Host "❌ Folder creation failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response content: $($_.Exception.Response)" -ForegroundColor Red
}

Write-Host "Debug completed" -ForegroundColor Green
