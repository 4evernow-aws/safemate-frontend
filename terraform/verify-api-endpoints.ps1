# SafeMate API Endpoint Verification Script
# This script tests all the Regional API endpoints to ensure they're working

Write-Host "🔍 SafeMate API Endpoint Verification" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Define the Regional API endpoints to test
$apiEndpoints = @(
    @{
        Name = "Hedera API"
        Url = "https://uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com/preprod"
        Id = "uvk4xxwjyg"
        Description = "Hedera blockchain operations"
    },
    @{
        Name = "Group API"
        Url = "https://o529nxt704.execute-api.ap-southeast-2.amazonaws.com/preprod"
        Id = "o529nxt704"
        Description = "Group management operations"
    },
    @{
        Name = "Onboarding API"
        Url = "https://ylpabkmc68.execute-api.ap-southeast-2.amazonaws.com/preprod"
        Id = "ylpabkmc68"
        Description = "User onboarding operations"
    },
    @{
        Name = "Vault API"
        Url = "https://peh5vc8yj3.execute-api.ap-southeast-2.amazonaws.com/preprod"
        Id = "peh5vc8yj3"
        Description = "Token vault operations"
    }
)

Write-Host "`n🧪 Testing Regional API Endpoints..." -ForegroundColor Yellow

$results = @()

foreach ($api in $apiEndpoints) {
    Write-Host "`n🔍 Testing: $($api.Name)" -ForegroundColor Cyan
    Write-Host "   URL: $($api.Url)" -ForegroundColor Gray
    Write-Host "   ID: $($api.Id)" -ForegroundColor Gray
    
    try {
        # Test with OPTIONS request (CORS preflight)
        $response = Invoke-WebRequest -Uri $api.Url -Method OPTIONS -TimeoutSec 10 -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            Write-Host "   ✅ OPTIONS: Success (Status: $($response.StatusCode))" -ForegroundColor Green
            $results += @{
                Name = $api.Name
                Status = "✅ Working"
                Details = "OPTIONS request successful"
            }
        } else {
            Write-Host "   ⚠️  OPTIONS: Unexpected status ($($response.StatusCode))" -ForegroundColor Yellow
            $results += @{
                Name = $api.Name
                Status = "⚠️  Partial"
                Details = "OPTIONS returned status $($response.StatusCode)"
            }
        }
    }
    catch {
        Write-Host "   ❌ OPTIONS: Failed - $($_.Exception.Message)" -ForegroundColor Red
        $results += @{
            Name = $api.Name
            Status = "❌ Failed"
            Details = $_.Exception.Message
        }
    }
    
    # Test with GET request (should return 401/403 without auth, which is expected)
    try {
        $response = Invoke-WebRequest -Uri $api.Url -Method GET -TimeoutSec 10 -ErrorAction Stop
        
        if ($response.StatusCode -eq 401 -or $response.StatusCode -eq 403) {
            Write-Host "   ✅ GET: Authentication required (Status: $($response.StatusCode))" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  GET: Unexpected status ($($response.StatusCode))" -ForegroundColor Yellow
        }
    }
    catch {
        if ($_.Exception.Response.StatusCode -eq 401 -or $_.Exception.Response.StatusCode -eq 403) {
            Write-Host "   ✅ GET: Authentication required (Status: $($_.Exception.Response.StatusCode))" -ForegroundColor Green
        } else {
            Write-Host "   ❌ GET: Failed - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "`n📊 Verification Summary:" -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Cyan

foreach ($result in $results) {
    $statusColor = switch ($result.Status) {
        "✅ Working" { "Green" }
        "⚠️  Partial" { "Yellow" }
        "❌ Failed" { "Red" }
    }
    
    Write-Host "  $($result.Status) $($result.Name)" -ForegroundColor $statusColor
    Write-Host "    Details: $($result.Details)" -ForegroundColor Gray
}

$workingCount = ($results | Where-Object { $_.Status -eq "✅ Working" }).Count
$totalCount = $results.Count

Write-Host "`n📈 Results: $workingCount/$totalCount APIs working correctly" -ForegroundColor $(if ($workingCount -eq $totalCount) { "Green" } else { "Yellow" })

if ($workingCount -eq $totalCount) {
    Write-Host "`n🎉 All Regional APIs are working correctly!" -ForegroundColor Green
    Write-Host "✅ Safe to proceed with cleanup of Edge-optimized APIs" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Some APIs are not working correctly. Please investigate before cleanup." -ForegroundColor Yellow
}

Write-Host "`n🔗 Frontend Configuration Check:" -ForegroundColor Cyan
Write-Host "Make sure your frontend is using these Regional API endpoints:" -ForegroundColor White
Write-Host "  - hederaApiService.ts: https://uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com/preprod" -ForegroundColor White
Write-Host "  - secureWalletService.ts: https://uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com/preprod" -ForegroundColor White
Write-Host "  - Other services: Check for any hardcoded API endpoints" -ForegroundColor White
