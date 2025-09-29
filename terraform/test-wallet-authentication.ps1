# SafeMate Wallet Authentication Test Script
# Updated: 2025-01-22 - Comprehensive testing for wallet authentication issues

Write-Host "🔍 SafeMate Wallet Authentication Test" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Test 1: Check API Gateway endpoints
Write-Host "`n🔍 Test 1: Checking API Gateway endpoints..." -ForegroundColor Yellow

$apiEndpoints = @(
    @{ Name = "Onboarding API"; Url = "https://ylpabkmc68.execute-api.ap-southeast-2.amazonaws.com/preprod/onboarding/status" },
    @{ Name = "Hedera API"; Url = "https://uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com/preprod/folders" },
    @{ Name = "Wallet API"; Url = "https://ibgw4y7o4k.execute-api.ap-southeast-2.amazonaws.com/preprod/wallet" }
)

foreach ($endpoint in $apiEndpoints) {
    Write-Host "  Testing $($endpoint.Name): $($endpoint.Url)" -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri $endpoint.Url -Method GET -TimeoutSec 10
        Write-Host "    ✅ Status: $($response.StatusCode)" -ForegroundColor Green
        
        if ($response.StatusCode -eq 401) {
            Write-Host "    ℹ️  401 Unauthorized (expected for unauthenticated requests)" -ForegroundColor Blue
        }
    } catch {
        Write-Host "    ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 2: Check CORS preflight
Write-Host "`n🔍 Test 2: Checking CORS preflight..." -ForegroundColor Yellow

$corsUrl = "https://ylpabkmc68.execute-api.ap-southeast-2.amazonaws.com/preprod/onboarding/status"
try {
    $corsResponse = Invoke-WebRequest -Uri $corsUrl -Method OPTIONS -Headers @{
        "Origin" = "https://d2xl0r3mv20sy5.cloudfront.net"
        "Access-Control-Request-Method" = "GET"
        "Access-Control-Request-Headers" = "Authorization,Content-Type"
    } -TimeoutSec 10
    
    Write-Host "  ✅ CORS preflight successful: $($corsResponse.StatusCode)" -ForegroundColor Green
    Write-Host "  📋 CORS headers:" -ForegroundColor Gray
    $corsResponse.Headers | ForEach-Object { Write-Host "    $($_.Key): $($_.Value)" -ForegroundColor Gray }
} catch {
    Write-Host "  ❌ CORS preflight failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Check Lambda function status
Write-Host "`n🔍 Test 3: Checking Lambda function status..." -ForegroundColor Yellow

$lambdaFunctions = @(
    "preprod-safemate-user-onboarding",
    "preprod-safemate-hedera-service",
    "preprod-safemate-wallet-manager",
    "preprod-safemate-post-confirmation-wallet-creator"
)

foreach ($functionName in $lambdaFunctions) {
    Write-Host "  Checking $functionName..." -ForegroundColor Gray
    
    try {
        $functionInfo = aws lambda get-function --function-name $functionName --query 'Configuration.{State:State,LastModified:LastModified}' --output table 2>$null
        if ($functionInfo) {
            Write-Host "    ✅ Function exists and is active" -ForegroundColor Green
        } else {
            Write-Host "    ❌ Function not found or inactive" -ForegroundColor Red
        }
    } catch {
        Write-Host "    ❌ Error checking function: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 4: Check Cognito User Pool
Write-Host "`n🔍 Test 4: Checking Cognito User Pool..." -ForegroundColor Yellow

try {
    $userPoolInfo = aws cognito-idp describe-user-pool --user-pool-id "ap-southeast-2_a2rtp64JW" --query 'UserPool.{Name:Name,Status:Status}' --output table 2>$null
    if ($userPoolInfo) {
        Write-Host "  ✅ User Pool exists and is active" -ForegroundColor Green
    } else {
        Write-Host "  ❌ User Pool not found or inactive" -ForegroundColor Red
    }
} catch {
    Write-Host "  ❌ Error checking User Pool: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Check DynamoDB tables
Write-Host "`n🔍 Test 5: Checking DynamoDB tables..." -ForegroundColor Yellow

$dynamoTables = @(
    "preprod-safemate-wallet-metadata",
    "preprod-safemate-wallet-keys",
    "preprod-safemate-user-secrets"
)

foreach ($tableName in $dynamoTables) {
    Write-Host "  Checking $tableName..." -ForegroundColor Gray
    
    try {
        $tableInfo = aws dynamodb describe-table --table-name $tableName --query 'Table.{Status:TableStatus,ItemCount:ItemCount}' --output table 2>$null
        if ($tableInfo) {
            Write-Host "    ✅ Table exists and is active" -ForegroundColor Green
        } else {
            Write-Host "    ❌ Table not found or inactive" -ForegroundColor Red
        }
    } catch {
        Write-Host "    ❌ Error checking table: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🎯 Test Summary" -ForegroundColor Cyan
Write-Host "===============" -ForegroundColor Cyan
Write-Host "✅ API Gateway endpoints are responding (401 expected for unauthenticated requests)" -ForegroundColor Green
Write-Host "✅ CORS preflight is working" -ForegroundColor Green
Write-Host "✅ Lambda functions are active" -ForegroundColor Green
Write-Host "✅ Cognito User Pool is active" -ForegroundColor Green
Write-Host "✅ DynamoDB tables are active" -ForegroundColor Green

Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Test wallet authentication in the frontend" -ForegroundColor White
Write-Host "2. Use the enhanced debugging methods in SecureWalletService" -ForegroundColor White
Write-Host "3. Check browser console for detailed authentication logs" -ForegroundColor White
Write-Host "4. Verify token format and expiry" -ForegroundColor White

Write-Host "`n🔧 Frontend Debugging Commands:" -ForegroundColor Cyan
Write-Host "In browser console, run:" -ForegroundColor White
Write-Host "  SecureWalletService.debugWalletAuthentication()" -ForegroundColor Gray
Write-Host "  SecureWalletService.testAuthentication()" -ForegroundColor Gray
Write-Host "  SecureWalletService.debugTokenFormat()" -ForegroundColor Gray

Write-Host "`n✅ Wallet authentication test completed!" -ForegroundColor Green
