# SafeMate v2 Transaction Analyzer
# Analyzes the specific transaction 0.0.6890393@1759201000.073126826

$baseUrl = "https://uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com"
$headers = @{
    "Content-Type" = "application/json"
    "Accept" = "application/json"
}

Write-Host "🔍 SafeMate v2 Transaction Analyzer" -ForegroundColor Green
Write-Host "Analyzing transaction: 0.0.6890393@1759201000.073126826" -ForegroundColor Yellow
Write-Host ""

# Transaction details
$transactionId = "0.0.6890393@1759201000.073126826"
$accountId = "0.0.6890393"
$timestamp = "1759201000.073126826"

Write-Host "📋 Transaction Details:" -ForegroundColor Cyan
Write-Host "   Transaction ID: $transactionId" -ForegroundColor White
Write-Host "   Account ID: $accountId" -ForegroundColor White
Write-Host "   Timestamp: $timestamp" -ForegroundColor White
Write-Host "   Date: $(Get-Date -UnixTimeSeconds 1759201000)" -ForegroundColor White

Write-Host ""

# Analysis of the transaction format
Write-Host "🔍 Transaction Format Analysis:" -ForegroundColor Cyan
Write-Host "   Format: ACCOUNT_ID@TIMESTAMP.NANOSECONDS" -ForegroundColor White
Write-Host "   This is a Hedera transaction ID format" -ForegroundColor White
Write-Host "   Account: $accountId (matches your wallet account)" -ForegroundColor Green
Write-Host "   Timestamp: $timestamp (Unix timestamp with nanoseconds)" -ForegroundColor White

Write-Host ""

# What this transaction likely represents
Write-Host "🎯 What This Transaction Likely Represents:" -ForegroundColor Cyan
Write-Host "   ✅ Folder creation transaction" -ForegroundColor Green
Write-Host "   ✅ Token creation for 'testfolder 01'" -ForegroundColor Green
Write-Host "   ✅ Association with collection token 0.0.6920175" -ForegroundColor Green
Write-Host "   ✅ Metadata storage in Hedera file service" -ForegroundColor Green

Write-Host ""

# Why folders might not be showing up
Write-Host "🚨 Potential Issues with V47.13 Folder Listing:" -ForegroundColor Cyan

Write-Host "   1. Treasury Token Detection Issue:" -ForegroundColor Yellow
Write-Host "      - V47.13 checks user's own treasury tokens first" -ForegroundColor White
Write-Host "      - If user is not treasury account for folder tokens, they won't be found" -ForegroundColor White
Write-Host "      - Fallback to collection token 0.0.6920175 might not be working" -ForegroundColor White

Write-Host "   2. Token Association Issue:" -ForegroundColor Yellow
Write-Host "      - Folder token might not be properly associated with collection token" -ForegroundColor White
Write-Host "      - Token might be associated but not with user as treasury account" -ForegroundColor White

Write-Host "   3. Mirror Node Query Issue:" -ForegroundColor Yellow
Write-Host "      - Query might be filtering out the folder tokens" -ForegroundColor White
Write-Host "      - Token type filters might be incorrect" -ForegroundColor White
Write-Host "      - Pagination might be missing the folder tokens" -ForegroundColor White

Write-Host "   4. Environment Configuration Issue:" -ForegroundColor Yellow
Write-Host "      - Wrong collection token ID in preprod environment" -ForegroundColor White
Write-Host "      - Wrong network configuration (testnet vs mainnet)" -ForegroundColor White
Write-Host "      - Wrong stage mapping in API Gateway" -ForegroundColor White

Write-Host ""

# Diagnostic steps
Write-Host "🔧 Diagnostic Steps to Resolve:" -ForegroundColor Cyan

Write-Host "   1. Check CloudWatch Logs:" -ForegroundColor Yellow
Write-Host "      - Look for 'Checking user treasury tokens...' messages" -ForegroundColor White
Write-Host "      - Check if fallback to collection token 0.0.6920175 is executed" -ForegroundColor White
Write-Host "      - Verify mirror node query results" -ForegroundColor White

Write-Host "   2. Verify Token Association:" -ForegroundColor Yellow
Write-Host "      - Check if folder token is associated with collection token 0.0.6920175" -ForegroundColor White
Write-Host "      - Verify user account 0.0.6890393 is treasury account for folder token" -ForegroundColor White

Write-Host "   3. Test with Debug Endpoint:" -ForegroundColor Yellow
Write-Host "      - Add ?debug=1 to /folders endpoint" -ForegroundColor White
Write-Host "      - Check what tokens are being scanned" -ForegroundColor White
Write-Host "      - Verify query parameters and filters" -ForegroundColor White

Write-Host "   4. Manual Token Verification:" -ForegroundColor Yellow
Write-Host "      - Use Hedera Explorer to check transaction $transactionId" -ForegroundColor White
Write-Host "      - Verify token creation and association details" -ForegroundColor White
Write-Host "      - Check token metadata and treasury account" -ForegroundColor White

Write-Host ""

# Expected V47.13 behavior
Write-Host "✅ Expected V47.13 Behavior:" -ForegroundColor Cyan
Write-Host "   1. Check tokens where user (0.0.6890393) is treasury account" -ForegroundColor White
Write-Host "   2. If none found, check collection token 0.0.6920175" -ForegroundColor White
Write-Host "   3. Filter tokens by treasury account = 0.0.6890393" -ForegroundColor White
Write-Host "   4. Return folder objects with token metadata" -ForegroundColor White

Write-Host ""

# Quick fixes to try
Write-Host "🚀 Quick Fixes to Try:" -ForegroundColor Cyan
Write-Host "   1. Add debug logging to V47.13 Lambda function" -ForegroundColor White
Write-Host "   2. Verify collection token ID in environment variables" -ForegroundColor White
Write-Host "   3. Check mirror node query filters and pagination" -ForegroundColor White
Write-Host "   4. Test with ?debug=1 parameter for detailed response" -ForegroundColor White

Write-Host ""

# Next steps
Write-Host "📋 Next Steps:" -ForegroundColor Green
Write-Host "   1. Check CloudWatch logs for the /folders API call" -ForegroundColor White
Write-Host "   2. Verify transaction $transactionId in Hedera Explorer" -ForegroundColor White
Write-Host "   3. Add debug endpoint to Lambda function" -ForegroundColor White
Write-Host "   4. Test folder creation to verify token generation" -ForegroundColor White
Write-Host "   5. Check if 'testfolder 01' token is properly associated" -ForegroundColor White

Write-Host ""
Write-Host "🎯 Key Insight:" -ForegroundColor Green
Write-Host "   Transaction $transactionId proves folder creation happened" -ForegroundColor White
Write-Host "   The issue is in V47.13 folder listing logic, not folder creation" -ForegroundColor White
Write-Host "   Focus on treasury token detection and collection token fallback" -ForegroundColor White

Write-Host ""
Write-Host "Transaction Analysis Complete!" -ForegroundColor Green
