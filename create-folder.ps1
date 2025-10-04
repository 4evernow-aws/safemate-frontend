# SafeMate v2 Folder Creation Script
# Creates a folder using cURL to bypass CORS issues

param(
    [Parameter(Mandatory=$true)]
    [string]$JwtToken,
    
    [Parameter(Mandatory=$false)]
    [string]$FolderName = "testfolder 01"
)

$API_BASE = "https://uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com"

Write-Host "🌳 SafeMate v2 Folder Creation Script" -ForegroundColor Green
Write-Host "Creating folder: $FolderName" -ForegroundColor Yellow
Write-Host ""

# Clean the JWT token (remove any non-ASCII characters)
$CleanToken = $JwtToken -replace '[^\x00-\x7F]', ''

Write-Host "📋 Request Details:" -ForegroundColor Cyan
Write-Host "   API Endpoint: $API_BASE/folders" -ForegroundColor White
Write-Host "   Folder Name: $FolderName" -ForegroundColor White
Write-Host "   Token Length: $($CleanToken.Length)" -ForegroundColor White
Write-Host ""

# Create the request body
$RequestBody = @{
    name = $FolderName
    parentFolderId = $null
    description = "Root folder created via PowerShell script"
} | ConvertTo-Json

Write-Host "📤 Sending request..." -ForegroundColor Cyan

try {
    # Make the API request
    $Response = Invoke-RestMethod -Uri "$API_BASE/folders" -Method POST -Headers @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $CleanToken"
    } -Body $RequestBody

    Write-Host "✅ Folder created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Response:" -ForegroundColor Cyan
    $Response | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor White
    
    Write-Host ""
    Write-Host "🎯 Next Steps:" -ForegroundColor Green
    Write-Host "1. Refresh your SafeMate application" -ForegroundColor White
    Write-Host "2. Check the FolderTreeWidget for the new folder" -ForegroundColor White
    Write-Host "3. Create subfolders using the same method" -ForegroundColor White

} catch {
    Write-Host "❌ Error creating folder:" -ForegroundColor Red
    Write-Host "   Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor White
    Write-Host "   Error Message: $($_.Exception.Message)" -ForegroundColor White
    
    if ($_.Exception.Response) {
        $ErrorStream = $_.Exception.Response.GetResponseStream()
        $Reader = New-Object System.IO.StreamReader($ErrorStream)
        $ErrorBody = $Reader.ReadToEnd()
        Write-Host "   Response Body: $ErrorBody" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "Script completed!" -ForegroundColor Green
