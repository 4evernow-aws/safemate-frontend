# Test KMS decryption of user's private key
$encryptedKey = "1,2,2,0,120,20,181,217,144,92,69,5,163,35,54,53,29,173,191,41,68,183,241,84,145,21,169,71,71,194,65,110,94,234,130,142,19,1,8,234,84,5,80,100,10,12,96,207,63,44,85,217,151,108,0,0,0,194,48,129,191,6,9,42,134,72,134,247,13,1,7,6,160,129,177,48,129,174,2,1,0,48,129,168,6,9,42,134,72,134,247,13,1,7,1,48,30,6,9,96,134,72,1,101,3,4,1,46,48,17,4,12,161,102,64,95,92,115,115,74,12,155,11,91,2,1,16,128,123,32,67,196,194,80,162,93,83,20,76,194,232,234,166,242,30,154,54,181,160,70,74,35,76,59,103,215,102,206,195,254,185,226,138,162,229,27,116,108,178,196,20,35,252,106,12,221,70,243,7,59,248,164,175,7,226,13,19,210,161,236,126,20,34,159,57,160,1,160,175,67,198,227,65,242,240,232,28,158,220,81,183,142,34,31,48,182,35,23,191,216,33,92,225,10,224,39,113,247,154,61,17,83,240,66,155,215,175,101,74,160,180,251,137,231,127,104,103,54,31,99,37,38"

# Convert comma-separated string to byte array
$keyBytes = $encryptedKey -split ',' | ForEach-Object { [byte]$_ }

# Convert to base64
$keyBase64 = [System.Convert]::ToBase64String($keyBytes)

Write-Host "Encrypted key (first 50 chars): $($keyBase64.Substring(0, 50))..."

# Decrypt using KMS
$kmsKeyId = "arn:aws:kms:ap-southeast-2:994220462693:key/3b18b0c0-dd1f-41db-8bac-6ec857c1ed05"

Write-Host "Decrypting with KMS key: $kmsKeyId"

# Create a temporary file for the ciphertext
$tempFile = [System.IO.Path]::GetTempFileName()
[System.IO.File]::WriteAllBytes($tempFile, $keyBytes)

try {
    $decryptResult = aws kms decrypt --ciphertext-blob "fileb://$tempFile" --key-id $kmsKeyId --output json
    Write-Host "Decrypt result: $decryptResult"
    
    if ($decryptResult) {
        # Parse the result
        $decryptData = $decryptResult | ConvertFrom-Json
        $plaintextBase64 = $decryptData.Plaintext
        
        # Convert from base64 to bytes
        $plaintextBytes = [System.Convert]::FromBase64String($plaintextBase64)
        
        Write-Host "Decrypted plaintext length: $($plaintextBytes.Length) bytes"
        Write-Host "Decrypted plaintext first 10 bytes: $($plaintextBytes[0..9] -join ',')"
        
        # Convert to base64 for Hedera SDK
        $hederaKeyBase64 = [System.Convert]::ToBase64String($plaintextBytes)
        if ($hederaKeyBase64.Length -ge 50) {
            Write-Host "Hedera key base64 (first 50 chars): $($hederaKeyBase64.Substring(0, 50))..."
        } else {
            Write-Host "Hedera key base64: $hederaKeyBase64"
        }
    } else {
        Write-Host "No decrypt result received"
    }
} finally {
    # Clean up temp file
    if (Test-Path $tempFile) {
        Remove-Item $tempFile -Force
    }
}
