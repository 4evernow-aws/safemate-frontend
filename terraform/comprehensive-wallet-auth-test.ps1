# Comprehensive SafeMate Wallet Authentication Test Script
# This script tests the complete flow from login to wallet access
# Updated: 2025-01-22 - Enhanced debugging for 401 errors
# Updated: 2025-01-22 - CORS preflight fix applied

Write-Host "🔍 SafeMate Wallet Authentication Comprehensive Test" -ForegroundColor Yellow
Write-Host "=================================================" -ForegroundColor Yellow

# --- Configuration ---
$FrontendUrl = "https://d2xl0r3mv20sy5.cloudfront.net/"
$OnboardingApiUrl = "https://ylpabkmc68.execute-api.ap-southeast-2.amazonaws.com/preprod"
$HederaApiUrl = "https://uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com/preprod"
$WalletApiUrl = "https://ibgw4y7o4k.execute-api.ap-southeast-2.amazonaws.com/preprod"

# Cognito Configuration
$CognitoUserPoolId = "ap-southeast-2_a2rtp64JW"
$CognitoClientId = "4uccg6ujupphhovt1utv3i67a7"
$CognitoRegion = "ap-southeast-2"

Write-Host "`n📋 Test Configuration:" -ForegroundColor Cyan
Write-Host "  Frontend URL: $FrontendUrl" -ForegroundColor White
Write-Host "  Onboarding API: $OnboardingApiUrl" -ForegroundColor White
Write-Host "  Hedera API: $HederaApiUrl" -ForegroundColor White
Write-Host "  Wallet API: $WalletApiUrl" -ForegroundColor White
Write-Host "  Cognito User Pool: $CognitoUserPoolId" -ForegroundColor White
Write-Host "  Cognito Client ID: $CognitoClientId" -ForegroundColor White

# --- Step 1: Test API Gateway Endpoints (Without Authentication) ---
Write-Host "`n🔍 Step 1: Testing API Gateway Endpoints (No Auth)" -ForegroundColor Green

$endpoints = @(
    @{Name="Onboarding Status"; Url="$OnboardingApiUrl/onboarding/status"; Method="GET"},
    @{Name="Onboarding Start"; Url="$OnboardingApiUrl/onboarding/start"; Method="POST"},
    @{Name="Hedera Folders"; Url="$HederaApiUrl/folders"; Method="GET"},
    @{Name="Wallet Info"; Url="$WalletApiUrl/wallet"; Method="GET"}
)

foreach ($endpoint in $endpoints) {
    Write-Host "`n  Testing: $($endpoint.Name)" -ForegroundColor White
    Write-Host "  URL: $($endpoint.Url)" -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri $endpoint.Url -Method $endpoint.Method -ErrorAction Stop
        Write-Host "  ✅ Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "  📝 Response: $($response.Content)" -ForegroundColor Gray
    } catch {
        Write-Host "  ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode
            Write-Host "  📊 Status Code: $statusCode" -ForegroundColor Yellow
            
            if ($statusCode -eq 401) {
                Write-Host "  🔍 401 Analysis: This is expected - endpoint requires authentication" -ForegroundColor Yellow
            } elseif ($statusCode -eq 403) {
                Write-Host "  🔍 403 Analysis: Forbidden - possible CORS or authorizer issue" -ForegroundColor Yellow
            } elseif ($statusCode -eq 404) {
                Write-Host "  🔍 404 Analysis: Not found - endpoint may not be deployed" -ForegroundColor Yellow
            }
        }
    }
}

# --- Step 2: Test CORS Preflight Requests ---
Write-Host "`n🔍 Step 2: Testing CORS Preflight Requests" -ForegroundColor Green

$corsEndpoints = @(
    @{Name="Onboarding Status OPTIONS"; Url="$OnboardingApiUrl/onboarding/status"},
    @{Name="Hedera Folders OPTIONS"; Url="$HederaApiUrl/folders"},
    @{Name="Wallet Info OPTIONS"; Url="$WalletApiUrl/wallet"}
)

foreach ($endpoint in $corsEndpoints) {
    Write-Host "`n  Testing CORS: $($endpoint.Name)" -ForegroundColor White
    
    try {
        $headers = @{
            "Origin" = "https://d2xl0r3mv20sy5.cloudfront.net"
            "Access-Control-Request-Method" = "GET"
            "Access-Control-Request-Headers" = "Authorization,Content-Type"
        }
        
        $response = Invoke-WebRequest -Uri $endpoint.Url -Method OPTIONS -Headers $headers -ErrorAction Stop
        Write-Host "  ✅ CORS Status: $($response.StatusCode)" -ForegroundColor Green
        
        # Check CORS headers
        $corsHeaders = @(
            "Access-Control-Allow-Origin",
            "Access-Control-Allow-Methods", 
            "Access-Control-Allow-Headers",
            "Access-Control-Allow-Credentials"
        )
        
        foreach ($header in $corsHeaders) {
            if ($response.Headers.ContainsKey($header)) {
                Write-Host "  📋 $header`: $($response.Headers[$header])" -ForegroundColor Gray
            } else {
                Write-Host "  ⚠️ Missing CORS header: $header" -ForegroundColor Yellow
            }
        }
        
    } catch {
        Write-Host "  ❌ CORS Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            Write-Host "  📊 CORS Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
        }
    }
}

# --- Step 3: Manual Token Testing Instructions ---
Write-Host "`n🔍 Step 3: Manual Token Testing Instructions" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

Write-Host "`n📝 To test with real authentication tokens:" -ForegroundColor White
Write-Host "1. Open the frontend: $FrontendUrl" -ForegroundColor White
Write-Host "2. Sign in with your credentials" -ForegroundColor White
Write-Host "3. Open browser developer console (F12)" -ForegroundColor White
Write-Host "4. Navigate to Application > Local Storage" -ForegroundColor White
Write-Host "5. Look for Cognito tokens (ID token and Access token)" -ForegroundColor White
Write-Host "6. Copy the tokens and run the following commands:" -ForegroundColor White

Write-Host "`n🔧 Test Commands (replace YOUR_ID_TOKEN with actual token):" -ForegroundColor Cyan
Write-Host "`n# Test Onboarding API with ID Token:" -ForegroundColor White
Write-Host "curl -H `"Authorization: Bearer YOUR_ID_TOKEN`" -H `"Content-Type: application/json`" $OnboardingApiUrl/onboarding/status" -ForegroundColor Gray

Write-Host "`n# Test Hedera API with ID Token:" -ForegroundColor White
Write-Host "curl -H `"Authorization: Bearer YOUR_ID_TOKEN`" -H `"Content-Type: application/json`" $HederaApiUrl/folders" -ForegroundColor Gray

Write-Host "`n# Test Wallet API with ID Token:" -ForegroundColor White
Write-Host "curl -H `"Authorization: Bearer YOUR_ID_TOKEN`" -H `"Content-Type: application/json`" $WalletApiUrl/wallet" -ForegroundColor Gray

# --- Step 4: API Gateway Configuration Analysis ---
Write-Host "`n🔍 Step 4: API Gateway Configuration Analysis" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

Write-Host "`n📋 Expected Configuration:" -ForegroundColor White
Write-Host "✅ All API Gateways should have:" -ForegroundColor Green
Write-Host "  - Cognito User Pool Authorizer configured" -ForegroundColor White
Write-Host "  - CORS enabled with proper headers" -ForegroundColor White
Write-Host "  - OPTIONS methods for preflight requests" -ForegroundColor White
Write-Host "  - GET/POST methods with COGNITO_USER_POOLS authorization" -ForegroundColor White

Write-Host "`n🔧 Cognito User Pool Configuration:" -ForegroundColor White
Write-Host "  - User Pool ID: $CognitoUserPoolId" -ForegroundColor Gray
Write-Host "  - Client ID: $CognitoClientId" -ForegroundColor Gray
Write-Host "  - Region: $CognitoRegion" -ForegroundColor Gray

# --- Step 5: Common Issues and Solutions ---
Write-Host "`n🔍 Step 5: Common Issues and Solutions" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

Write-Host "`n❌ HTTP 401 Unauthorized Issues:" -ForegroundColor Red
Write-Host "1. Token Format: Ensure 'Bearer ' prefix is included" -ForegroundColor White
Write-Host "2. Token Expiry: Check if token is expired" -ForegroundColor White
Write-Host "3. Wrong Token Type: Use ID token, not Access token" -ForegroundColor White
Write-Host "4. API Gateway Authorizer: Verify Cognito User Pool is configured" -ForegroundColor White
Write-Host "5. CORS Issues: Check preflight request handling" -ForegroundColor White

Write-Host "`n❌ HTTP 403 Forbidden Issues:" -ForegroundColor Red
Write-Host "1. CORS Configuration: Check allowed origins and methods" -ForegroundColor White
Write-Host "2. API Gateway Deployment: Ensure latest deployment is active" -ForegroundColor White
Write-Host "3. Lambda Permissions: Verify API Gateway can invoke Lambda" -ForegroundColor White

Write-Host "`n❌ HTTP 404 Not Found Issues:" -ForegroundColor Red
Write-Host "1. API Gateway Deployment: Check if endpoints are deployed" -ForegroundColor White
Write-Host "2. Resource Configuration: Verify API Gateway resources exist" -ForegroundColor White
Write-Host "3. Stage Configuration: Ensure correct stage is deployed" -ForegroundColor White

# --- Step 6: Debugging Commands ---
Write-Host "`n🔍 Step 6: Debugging Commands" -ForegroundColor Green
Write-Host "============================" -ForegroundColor Green

Write-Host "`n🔧 AWS CLI Commands to Check Configuration:" -ForegroundColor White

Write-Host "`n# Check API Gateway deployments:" -ForegroundColor White
Write-Host "aws apigateway get-rest-apis --query `"items[?contains(name,'safemate')].{id:id,name:name}`"" -ForegroundColor Gray

Write-Host "`n# Check specific API Gateway:" -ForegroundColor White
Write-Host "aws apigateway get-rest-api --rest-api-id ylpabkmc68" -ForegroundColor Gray

Write-Host "`n# Check API Gateway stages:" -ForegroundColor White
Write-Host "aws apigateway get-stages --rest-api-id ylpabkmc68" -ForegroundColor Gray

Write-Host "`n# Check API Gateway resources:" -ForegroundColor White
Write-Host "aws apigateway get-resources --rest-api-id ylpabkmc68" -ForegroundColor Gray

Write-Host "`n# Check Cognito User Pool:" -ForegroundColor White
Write-Host "aws cognito-idp describe-user-pool --user-pool-id $CognitoUserPoolId" -ForegroundColor Gray

Write-Host "`n# Check Cognito User Pool Client:" -ForegroundColor White
Write-Host "aws cognito-idp describe-user-pool-client --user-pool-id $CognitoUserPoolId --client-id $CognitoClientId" -ForegroundColor Gray

# --- Step 7: Frontend Debugging ---
Write-Host "`n🔍 Step 7: Frontend Debugging" -ForegroundColor Green
Write-Host "============================" -ForegroundColor Green

Write-Host "`n🔧 Browser Console Commands:" -ForegroundColor White
Write-Host "Run these in the browser console after signing in:" -ForegroundColor White

Write-Host "`n# Test authentication status:" -ForegroundColor White
Write-Host "SecureWalletService.debugWalletAuthentication()" -ForegroundColor Gray

Write-Host "`n# Test token format:" -ForegroundColor White
Write-Host "SecureWalletService.debugTokenFormat()" -ForegroundColor Gray

Write-Host "`n# Test API Gateway configuration:" -ForegroundColor White
Write-Host "SecureWalletService.testApiGatewayConfiguration()" -ForegroundColor Gray

Write-Host "`n# Test authentication only:" -ForegroundColor White
Write-Host "SecureWalletService.testAuthenticationOnly()" -ForegroundColor Gray

Write-Host "`n# Test API call:" -ForegroundColor White
Write-Host "SecureWalletService.testApiCall()" -ForegroundColor Gray

# --- Step 8: Complete Flow Test ---
Write-Host "`n🔍 Step 8: Complete Flow Test" -ForegroundColor Green
Write-Host "============================" -ForegroundColor Green

Write-Host "`n📋 Expected Complete Flow:" -ForegroundColor White
Write-Host "1. User signs in to frontend" -ForegroundColor White
Write-Host "2. Cognito returns ID token and Access token" -ForegroundColor White
Write-Host "3. Frontend stores tokens in localStorage" -ForegroundColor White
Write-Host "4. Frontend calls /onboarding/status with ID token" -ForegroundColor White
Write-Host "5. API Gateway validates token with Cognito User Pool" -ForegroundColor White
Write-Host "6. Lambda function receives request with user claims" -ForegroundColor White
Write-Host "7. Lambda queries DynamoDB for user wallet" -ForegroundColor White
Write-Host "8. Lambda returns wallet status to frontend" -ForegroundColor White

Write-Host "`n🔧 Test Each Step:" -ForegroundColor White
Write-Host "1. ✅ Frontend loads and user can sign in" -ForegroundColor Green
Write-Host "2. ✅ Tokens are retrieved and stored" -ForegroundColor Green
Write-Host "3. ❓ API calls work with proper authentication" -ForegroundColor Yellow
Write-Host "4. ❓ Lambda functions receive user claims" -ForegroundColor Yellow
Write-Host "5. ❓ DynamoDB queries return correct data" -ForegroundColor Yellow

Write-Host "`n🎯 Next Steps:" -ForegroundColor White
Write-Host "1. Run this script to test API Gateway endpoints" -ForegroundColor White
Write-Host "2. Sign in to frontend and test with real tokens" -ForegroundColor White
Write-Host "3. Check browser console for detailed error messages" -ForegroundColor White
Write-Host "4. Use AWS CLI commands to verify configuration" -ForegroundColor White
Write-Host "5. Check CloudWatch logs for Lambda function errors" -ForegroundColor White

Write-Host "`n✅ Test Script Complete!" -ForegroundColor Green
Write-Host "Run this script and follow the manual testing steps above." -ForegroundColor White
