# Test script to verify the Hedera folder creation fix
param(
    [string]$ApiUrl = "https://api.preprod.safemate.com.au",
    [string]$TestFolderName = "Test Folder $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
)

Write-Host "Testing Hedera folder creation fix..." -ForegroundColor Green
Write-Host "API URL: $ApiUrl" -ForegroundColor Cyan
Write-Host "Test Folder: $TestFolderName" -ForegroundColor Cyan

# Test payload for folder creation
$testPayload = @{
    folderName = $TestFolderName
    description = "Test folder created to verify infinite supply fix"
    parentFolderId = $null
} | ConvertTo-Json

Write-Host "Test payload:" -ForegroundColor Yellow
Write-Host $testPayload -ForegroundColor White

# Test the folder creation endpoint
Write-Host "Testing folder creation endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$ApiUrl/folders" -Method POST -Body $testPayload -ContentType "application/json" -Headers @{
        "Authorization" = "Bearer test-token"
        "Content-Type" = "application/json"
    }
    
    Write-Host "Folder creation successful!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor White
    
    if ($response.folderId) {
        Write-Host "Folder ID: $($response.folderId)" -ForegroundColor Green
        Write-Host "Transaction ID: $($response.transactionId)" -ForegroundColor Green
        
        # Test listing folders
        Write-Host "Testing folder listing..." -ForegroundColor Yellow
        try {
            $listResponse = Invoke-RestMethod -Uri "$ApiUrl/folders" -Method GET -Headers @{
                "Authorization" = "Bearer test-token"
            }
            
            Write-Host "Folder listing successful!" -ForegroundColor Green
            Write-Host "Total folders: $($listResponse.folders.Count)" -ForegroundColor Cyan
            
            # Check if our test folder is in the list
            $testFolder = $listResponse.folders | Where-Object { $_.name -eq $TestFolderName }
            if ($testFolder) {
                Write-Host "Test folder found in list!" -ForegroundColor Green
                Write-Host "Folder details:" -ForegroundColor Cyan
                $testFolder | ConvertTo-Json -Depth 5 | Write-Host -ForegroundColor White
            } else {
                Write-Host "Test folder not found in list" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "Folder listing failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "Folder creation failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response content: $($_.Exception.Response)" -ForegroundColor Red
}

Write-Host "Test completed" -ForegroundColor Green
Write-Host "Check Hedera Explorer for transaction details" -ForegroundColor Yellow
Write-Host "URL: https://hashscan.io/testnet" -ForegroundColor Cyan
