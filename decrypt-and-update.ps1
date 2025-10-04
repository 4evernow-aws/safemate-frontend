# Decrypt Private Key and Update Lambda Environment
Write-Host "🔐 Decrypting Private Key and Updating Lambda" -ForegroundColor Green

# Get the encrypted private key
$encryptedKey = "1,2,2,0,120,20,181,217,144,92,69,5,163,35,54,53,29,173,191,41,68,183,241,84,145,21,169,71,71,194,65,110,94,234,130,142,19,1,8,234,84,5,80,100,10,12,96,207,63,44,85,217,151,108,0,0,0,194,48,129,191,6,9,42,134,72,134,247,13,1,7,6,160,129,177,48,129,174,2,1,0,48,129,168,6,9,42,134,72,134,247,13,1,7,1,48,30,6,9,96,134,72,1,101,3,4,1,46,48,17,4,12,161,102,64,95,92,115,115,74,12,155,11,91,2,1,16,128,123,32,67,196,194,80,162,93,83,20,76,194,232,234,166,242,30,154,54,181,160,70,74,35,76,59,103,215,102,206,195,254,185,226,138,162,229,27,116,108,178,196,20,35,252,106,12,221,70,243,7,59,248,164,175,7,226,13,19,210,161,236,126,20,34,159,57,160,1,160,175,67,198,227,65,242,240,232,28,158,220,81,183,142,34,31,48,182,35,23,191,216,33,92,225,10,224,39,113,247,154,61,17,83,240,66,155,215,175,101,74,160,180,251,137,231,127,104,103,54,31,99,37,38"

Write-Host "🔓 Decrypting private key..." -ForegroundColor Cyan

# Convert comma-separated string to byte array
$encryptedBytes = $encryptedKey -split ',' | ForEach-Object { [byte]$_ }

# Save to temporary file
$tempFile = "temp_encrypted_key.bin"
[System.IO.File]::WriteAllBytes($tempFile, $encryptedBytes)

try {
    # Decrypt using KMS
    $decryptResult = aws kms decrypt --ciphertext-blob fileb://$tempFile --output text --query Plaintext
    $decryptedKeyBase64 = $decryptResult.Trim()
    
    # Convert from base64 to hex
    $decryptedKeyBytes = [System.Convert]::FromBase64String($decryptedKeyBase64)
    $privateKeyHex = [System.BitConverter]::ToString($decryptedKeyBytes) -replace '-', ''
    
    Write-Host "✅ Private key decrypted successfully" -ForegroundColor Green
    Write-Host "Private Key (first 20 chars): $($privateKeyHex.Substring(0, 20))..." -ForegroundColor White
    
    # Update Lambda environment
    Write-Host "🔧 Updating Lambda environment..." -ForegroundColor Cyan
    
    # Get current environment variables
    $currentConfig = aws lambda get-function-configuration --function-name preprod-safemate-hedera-service --query 'Environment.Variables' --output json
    $currentEnvVars = $currentConfig | ConvertFrom-Json
    
    # Update the private key
    $currentEnvVars | Add-Member -NotePropertyName "HEDERA_PRIVATE_KEY" -NotePropertyValue $privateKeyHex -Force
    
    # Save to temporary file and update
    $tempEnvFile = "temp_env_vars.json"
    $currentEnvVars | ConvertTo-Json -Compress | Out-File -FilePath $tempEnvFile -Encoding UTF8
    
    $updateCommand = "aws lambda update-function-configuration --function-name preprod-safemate-hedera-service --environment Variables=file://$tempEnvFile"
    Invoke-Expression $updateCommand
    
    Write-Host "✅ Lambda environment updated with private key!" -ForegroundColor Green
    
    # Clean up
    Remove-Item $tempFile -ErrorAction SilentlyContinue
    Remove-Item $tempEnvFile -ErrorAction SilentlyContinue
    
} catch {
    Write-Host "❌ Failed to decrypt or update: $($_.Exception.Message)" -ForegroundColor Red
    Remove-Item $tempFile -ErrorAction SilentlyContinue
    exit 1
}

Write-Host ""
Write-Host "🧪 Testing Lambda function..." -ForegroundColor Cyan
try {
    $healthResponse = Invoke-RestMethod -Uri "https://uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com/preprod/health" -Method GET
    Write-Host "✅ Health check passed" -ForegroundColor Green
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 Ready to create collection token!" -ForegroundColor Green
