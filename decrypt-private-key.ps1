# Decrypt Hedera Private Key and Update Lambda Environment
# This script decrypts the private key from DynamoDB and updates the Lambda function

Write-Host "🔐 Decrypting Hedera Private Key" -ForegroundColor Green
Write-Host "Getting private key for account 0.0.6890393" -ForegroundColor Yellow
Write-Host ""

$accountId = "0.0.6890393"
$kmsKeyId = "3b18b0c0-dd1f-41db-8bac-6ec857c1ed05"
$tableName = "preprod-safemate-wallet-keys"

# Get the encrypted private key from DynamoDB
Write-Host "🔍 Getting encrypted private key from DynamoDB..." -ForegroundColor Cyan
try {
    $expressionValues = '{"account_id":{"S":"' + $accountId + '"}}'
    $scanResult = aws dynamodb scan --table-name $tableName --filter-expression "account_id = :account_id" --expression-attribute-values $expressionValues --output json
    $items = ($scanResult | ConvertFrom-Json).Items
    
    if ($items.Count -eq 0) {
        Write-Host "❌ No private key found for account $accountId" -ForegroundColor Red
        exit 1
    }
    
    $encryptedKey = $items[0].encrypted_private_key.S
    Write-Host "✅ Found encrypted private key" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Failed to get private key from DynamoDB: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Decrypt the private key using KMS
Write-Host "🔓 Decrypting private key using KMS..." -ForegroundColor Cyan
try {
    # Convert the encrypted key to base64
    $encryptedKeyBytes = [System.Convert]::FromBase64String($encryptedKey)
    $encryptedKeyBase64 = [System.Convert]::ToBase64String($encryptedKeyBytes)
    
    # Decrypt using AWS KMS
    $decryptResult = aws kms decrypt --ciphertext-blob fileb://<(echo $encryptedKeyBase64 | base64 -d) --output text --query Plaintext
    $decryptedKeyBase64 = $decryptResult.Trim()
    
    # Convert from base64 to get the actual private key
    $decryptedKeyBytes = [System.Convert]::FromBase64String($decryptedKeyBase64)
    $privateKeyHex = [System.BitConverter]::ToString($decryptedKeyBytes) -replace '-', ''
    
    Write-Host "✅ Private key decrypted successfully" -ForegroundColor Green
    Write-Host "Private Key (hex): $($privateKeyHex.Substring(0, 20))..." -ForegroundColor White
    
} catch {
    Write-Host "❌ Failed to decrypt private key: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Trying alternative decryption method..." -ForegroundColor Yellow
    
    # Alternative method - try direct KMS decrypt
    try {
        $tempFile = "temp_encrypted_key.bin"
        [System.IO.File]::WriteAllBytes($tempFile, $encryptedKeyBytes)
        
        $decryptResult = aws kms decrypt --ciphertext-blob fileb://$tempFile --output text --query Plaintext
        $decryptedKeyBase64 = $decryptResult.Trim()
        
        $decryptedKeyBytes = [System.Convert]::FromBase64String($decryptedKeyBase64)
        $privateKeyHex = [System.BitConverter]::ToString($decryptedKeyBytes) -replace '-', ''
        
        Write-Host "✅ Private key decrypted successfully (alternative method)" -ForegroundColor Green
        
        Remove-Item $tempFile -ErrorAction SilentlyContinue
        
    } catch {
        Write-Host "❌ Alternative decryption also failed: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Update Lambda environment with the decrypted private key
Write-Host ""
Write-Host "🔧 Updating Lambda environment with decrypted private key..." -ForegroundColor Cyan

try {
    # Get current environment variables
    $currentConfig = aws lambda get-function-configuration --function-name preprod-safemate-hedera-service --query 'Environment.Variables' --output json
    $currentEnvVars = $currentConfig | ConvertFrom-Json
    
    # Update the private key
    $currentEnvVars.HEDERA_PRIVATE_KEY = $privateKeyHex
    
    # Convert to JSON and update Lambda
    $envVarsJson = $currentEnvVars | ConvertTo-Json -Compress
    
    # Use a temporary file to avoid command line length issues
    $tempEnvFile = "temp_env_vars.json"
    $envVarsJson | Out-File -FilePath $tempEnvFile -Encoding UTF8
    
    $updateCommand = "aws lambda update-function-configuration --function-name preprod-safemate-hedera-service --environment Variables=file://$tempEnvFile"
    
    Write-Host "   Updating Lambda environment..." -ForegroundColor White
    Invoke-Expression $updateCommand
    
    Remove-Item $tempEnvFile -ErrorAction SilentlyContinue
    
    Write-Host "✅ Lambda environment updated with private key!" -ForegroundColor Green
    
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
Write-Host "🎯 Ready to create collection token!" -ForegroundColor Green
Write-Host "Now we can create the NON_FUNGIBLE_UNIQUE collection token" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Test collection token creation" -ForegroundColor White
Write-Host "2. Create first folder NFT" -ForegroundColor White
Write-Host "3. Test folder listing" -ForegroundColor White
