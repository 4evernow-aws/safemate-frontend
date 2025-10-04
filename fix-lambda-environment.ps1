# Fix Lambda Environment Variables
# This script adds the missing environment variables to the Lambda function

Write-Host "🔧 Fixing Lambda Environment Variables" -ForegroundColor Green
Write-Host "Adding missing environment variables for NFT collection token creation" -ForegroundColor Yellow
Write-Host ""

$functionName = "preprod-safemate-hedera-service"
$region = "ap-southeast-2"

# Get current environment variables
Write-Host "🔍 Getting current environment variables..." -ForegroundColor Cyan
try {
    $currentConfig = aws lambda get-function-configuration --function-name $functionName --query 'Environment.Variables' --output json
    $currentEnvVars = $currentConfig | ConvertFrom-Json
    
    Write-Host "✅ Current environment variables:" -ForegroundColor Green
    foreach ($key in $currentEnvVars.PSObject.Properties.Name) {
        Write-Host "   $key = $($currentEnvVars.$key)" -ForegroundColor White
    }
    
} catch {
    Write-Host "❌ Failed to get current configuration: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Add missing environment variables
Write-Host "🔧 Adding missing environment variables..." -ForegroundColor Cyan

# Add the missing variables
$currentEnvVars | Add-Member -NotePropertyName "HEDERA_ACCOUNT_ID" -NotePropertyValue "0.0.6890393" -Force
$currentEnvVars | Add-Member -NotePropertyName "FOLDER_COLLECTION_TOKEN" -NotePropertyValue "0.0.6920175" -Force
$currentEnvVars | Add-Member -NotePropertyName "MIRROR_NODE_URL" -NotePropertyValue "https://testnet.mirrornode.hedera.com" -Force
$currentEnvVars | Add-Member -NotePropertyName "VERSION" -NotePropertyValue "V48.0" -Force

# For the private key, we need to get it from KMS or DynamoDB
Write-Host "🔍 Looking for Hedera private key..." -ForegroundColor Cyan

# Try to get the private key from the user secrets table
try {
    $userSecretsTable = $currentEnvVars.USER_SECRETS_TABLE
    Write-Host "   Checking user secrets table: $userSecretsTable" -ForegroundColor White
    
    # We need to scan the table to find the private key
    # For now, let's add a placeholder and we'll update it later
    $currentEnvVars | Add-Member -NotePropertyName "HEDERA_PRIVATE_KEY" -NotePropertyValue "PLACEHOLDER_PRIVATE_KEY" -Force
    
    Write-Host "   ⚠️  Added placeholder private key - will need to update with actual key" -ForegroundColor Yellow
    
} catch {
    Write-Host "   ❌ Could not access user secrets table" -ForegroundColor Red
    $currentEnvVars | Add-Member -NotePropertyName "HEDERA_PRIVATE_KEY" -NotePropertyValue "PLACEHOLDER_PRIVATE_KEY" -Force
}

Write-Host ""
Write-Host "📋 Updated environment variables:" -ForegroundColor Cyan
foreach ($key in $currentEnvVars.PSObject.Properties.Name) {
    if ($key -eq "HEDERA_PRIVATE_KEY") {
        Write-Host "   $key = [PLACEHOLDER - NEEDS ACTUAL KEY]" -ForegroundColor Yellow
    } else {
        Write-Host "   $key = $($currentEnvVars.$key)" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "🚀 Updating Lambda function environment..." -ForegroundColor Cyan

try {
    # Convert to the format AWS expects
    $envVarsJson = $currentEnvVars | ConvertTo-Json -Compress
    
    $updateCommand = "aws lambda update-function-configuration --function-name $functionName --environment Variables='$envVarsJson'"
    
    Write-Host "   Executing: $updateCommand" -ForegroundColor Gray
    
    Invoke-Expression $updateCommand
    
    Write-Host "✅ Lambda environment updated successfully!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Failed to update Lambda environment: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🧪 Testing the updated Lambda function..." -ForegroundColor Cyan

# Test the health endpoint
try {
    $healthResponse = Invoke-RestMethod -Uri "https://uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com/preprod/health" -Method GET
    Write-Host "✅ Health check passed: $($healthResponse | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Find the actual Hedera private key and update HEDERA_PRIVATE_KEY" -ForegroundColor White
Write-Host "2. Test collection token creation" -ForegroundColor White
Write-Host "3. Create first folder NFT" -ForegroundColor White

Write-Host ""
Write-Host "💡 To find the private key:" -ForegroundColor Yellow
Write-Host "   - Check DynamoDB table: $($currentEnvVars.USER_SECRETS_TABLE)" -ForegroundColor White
Write-Host "   - Check KMS key: $($currentEnvVars.APP_SECRETS_KMS_KEY_ID)" -ForegroundColor White
Write-Host "   - Or provide it manually if you have it" -ForegroundColor White
