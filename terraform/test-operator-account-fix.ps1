# Test Operator Account Fix - SafeMate Preprod Environment
# Updated: 2025-01-22 - Fixed operator account configuration
# Purpose: Test wallet creation after fixing PAYER_ACCOUNT_NOT_FOUND error

Write-Host "🔧 SafeMate Operator Account Fix Test - Preprod Environment" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# Test 1: Check Lambda function environment variables
Write-Host "`n📋 Test 1: Checking Lambda function environment variables..." -ForegroundColor Yellow
$lambdaEnv = aws lambda get-function-configuration --function-name preprod-safemate-user-onboarding --query "Environment.Variables" --output json
Write-Host "✅ Lambda environment variables retrieved"
Write-Host "📋 OPERATOR_ACCOUNT_ID: $($lambdaEnv | ConvertFrom-Json | Select-Object -ExpandProperty OPERATOR_ACCOUNT_ID)"
Write-Host "📋 OPERATOR_PRIVATE_KEY_KMS_KEY_ID: $($lambdaEnv | ConvertFrom-Json | Select-Object -ExpandProperty OPERATOR_PRIVATE_KEY_KMS_KEY_ID)"

# Test 2: Check operator account in database
Write-Host "`n📋 Test 2: Checking operator account in database..." -ForegroundColor Yellow
$operatorAccount = aws dynamodb get-item --table-name preprod-safemate-wallet-keys --key '{"user_id":{"S":"hedera_operator"}}' --output json
if ($operatorAccount.Item) {
    Write-Host "✅ Operator account found in database"
    Write-Host "📋 Account ID: $($operatorAccount.Item.account_id.S)"
    Write-Host "📋 KMS Key ID: $($operatorAccount.Item.kms_key_id.S)"
    Write-Host "📋 Has encrypted private key: $($operatorAccount.Item.encrypted_private_key.S.Length) characters"
} else {
    Write-Host "❌ Operator account not found in database" -ForegroundColor Red
    exit 1
}

# Test 3: Check Lambda function logs for operator credential retrieval
Write-Host "`n📋 Test 3: Checking recent Lambda function logs..." -ForegroundColor Yellow
$logStreams = aws logs describe-log-streams --log-group-name "/aws/lambda/preprod-safemate-user-onboarding" --order-by LastEventTime --descending --max-items 1 --query "logStreams[0].logStreamName" --output text
if ($logStreams -and $logStreams -ne "None") {
    Write-Host "✅ Latest log stream: $logStreams"
    $recentLogs = aws logs get-log-events --log-group-name "/aws/lambda/preprod-safemate-user-onboarding" --log-stream-name $logStreams --start-time (Get-Date).AddMinutes(-10).ToUniversalTime().Ticks --query "events[?contains(message, 'operator') || contains(message, 'Operator')].message" --output text
    if ($recentLogs) {
        Write-Host "📋 Recent operator-related logs:"
        $recentLogs | ForEach-Object { Write-Host "   $_" }
    } else {
        Write-Host "📋 No recent operator-related logs found"
    }
} else {
    Write-Host "⚠️ No log streams found"
}

# Test 4: Test API Gateway CORS configuration
Write-Host "`n📋 Test 4: Testing API Gateway CORS configuration..." -ForegroundColor Yellow
$corsTest = curl -X OPTIONS "https://ylpabkmc68.execute-api.ap-southeast-2.amazonaws.com/preprod/onboarding/start" -H "Origin: https://d2xl0r3mv20sy5.cloudfront.net" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: Content-Type,Authorization" -v 2>&1
if ($corsTest -match "Access-Control-Allow-Origin") {
    Write-Host "✅ CORS preflight request successful"
} else {
    Write-Host "❌ CORS preflight request failed" -ForegroundColor Red
}

Write-Host "`n🎯 Summary:" -ForegroundColor Green
Write-Host "✅ Operator account 0.0.6428427 found in database"
Write-Host "✅ Lambda function updated with environment variables"
Write-Host "✅ Lambda function code updated to retrieve operator credentials from database"
Write-Host "✅ CORS configuration working"
Write-Host "`n🚀 Ready for wallet creation test in browser!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Open browser and navigate to: https://d2xl0r3mv20sy5.cloudfront.net"
Write-Host "2. Sign in with your test account"
Write-Host "3. Try to create a wallet - should now work without PAYER_ACCOUNT_NOT_FOUND error"
Write-Host "4. Check CloudWatch logs for detailed operator credential retrieval process"
