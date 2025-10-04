# SafeMate v2 Debug Folders API Script
# Tests the folders API with debug information

$baseUrl = "https://uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com"
$headers = @{
    "Content-Type" = "application/json"
    "Accept" = "application/json"
}

Write-Host "🔍 SafeMate v2 Debug Folders API Script" -ForegroundColor Green
Write-Host "Testing folders API with debug information..." -ForegroundColor Yellow
Write-Host ""

# Test 1: Basic folders endpoint
Write-Host "1️⃣ Testing Basic Folders Endpoint..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/folders" -Method GET -Headers $headers
    Write-Host "✅ Basic Folders Response: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Green
} catch {
    if ($_.Exception.Message -like "*403*") {
        Write-Host "✅ Basic Folders: Authentication required (Expected)" -ForegroundColor Green
    } else {
        Write-Host "❌ Basic Folders Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Test 2: Folders endpoint with debug parameter
Write-Host "2️⃣ Testing Folders Endpoint with Debug..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/folders?debug=1" -Method GET -Headers $headers
    Write-Host "✅ Debug Folders Response: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Green
} catch {
    if ($_.Exception.Message -like "*403*") {
        Write-Host "✅ Debug Folders: Authentication required (Expected)" -ForegroundColor Green
    } else {
        Write-Host "❌ Debug Folders Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Test 3: Check API Gateway response headers
Write-Host "3️⃣ Testing API Gateway Response Headers..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/folders" -Method GET -Headers $headers
    Write-Host "✅ API Gateway Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Headers: $($response.Headers | ConvertTo-Json)" -ForegroundColor White
} catch {
    if ($_.Exception.Message -like "*403*") {
        Write-Host "✅ API Gateway: 403 Forbidden (Expected without auth)" -ForegroundColor Green
    } else {
        Write-Host "❌ API Gateway Test Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Test 4: Check if debug endpoint exists
Write-Host "4️⃣ Testing Debug Endpoint Availability..." -ForegroundColor Cyan
$debugEndpoints = @(
    "/folders?debug=1",
    "/folders?debug=true",
    "/folders/debug",
    "/debug/folders"
)

foreach ($endpoint in $debugEndpoints) {
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl$endpoint" -Method GET -Headers $headers
        Write-Host "✅ Debug Endpoint $endpoint: Available" -ForegroundColor Green
    } catch {
        if ($_.Exception.Message -like "*403*") {
            Write-Host "✅ Debug Endpoint $endpoint: Available (Auth required)" -ForegroundColor Green
        } elseif ($_.Exception.Message -like "*404*") {
            Write-Host "❌ Debug Endpoint $endpoint: Not found" -ForegroundColor Red
        } else {
            Write-Host "⚠️ Debug Endpoint $endpoint: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
}

Write-Host ""

# Test 5: Check transaction-specific endpoint
Write-Host "5️⃣ Testing Transaction-Specific Endpoint..." -ForegroundColor Cyan
$transactionId = "0.0.6890393@1759201000.073126826"
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/transactions/$transactionId" -Method GET -Headers $headers
    Write-Host "✅ Transaction Endpoint: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Green
} catch {
    if ($_.Exception.Message -like "*403*") {
        Write-Host "✅ Transaction Endpoint: Authentication required (Expected)" -ForegroundColor Green
    } elseif ($_.Exception.Message -like "*404*") {
        Write-Host "❌ Transaction Endpoint: Not found" -ForegroundColor Red
    } else {
        Write-Host "⚠️ Transaction Endpoint: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host ""

# Summary
Write-Host "🎯 Debug Test Summary:" -ForegroundColor Green
Write-Host "1. Basic folders endpoint tested" -ForegroundColor White
Write-Host "2. Debug parameter tested" -ForegroundColor White
Write-Host "3. API Gateway headers checked" -ForegroundColor White
Write-Host "4. Debug endpoints availability checked" -ForegroundColor White
Write-Host "5. Transaction endpoint tested" -ForegroundColor White

Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Green
Write-Host "1. Use browser-test.html with JWT token for authenticated testing" -ForegroundColor White
Write-Host "2. Check CloudWatch logs for detailed Lambda execution" -ForegroundColor White
Write-Host "3. Verify transaction in Hedera Explorer" -ForegroundColor White
Write-Host "4. Add debug logging to Lambda function if needed" -ForegroundColor White

Write-Host ""
Write-Host "Debug API Test Complete!" -ForegroundColor Green
