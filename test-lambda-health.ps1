# Test Lambda function health
Write-Host "🧪 Testing Lambda Function Health" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "https://uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com/preprod/health" -Method GET
    Write-Host "✅ Health Check Response: $($response | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Yellow
}

Write-Host "`n🔍 Testing Folder Listing..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com/preprod/folders" -Method GET
    Write-Host "✅ Folder Listing Response: $($response | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "❌ Folder Listing Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
}
