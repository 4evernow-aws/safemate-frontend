# Test KMS decryption for the operator's private key
$encryptedKey = "AQICAHgUtdmQXEUFoyM2NR2tvylEt/FUkRWpR0fCQW5e6oKOEwGZ2I6HapfS+2+62Z9empyuAAAAqjCBpwYJKoZIhvcNAQcGoIGZMIGWAgEAMIGQBgkqhkiG9w0BBwEwHgYJYIZIAWUDBAEuMBEEDO+M37AEj9+qngsrBgIBEIBj5omAh//hN/OBP9rnwPKNfAW7vJE1eABl/kAangUzPCKJGjfIPT4ck+LtFSX7tP37Uo1BrXEdP65qccpGmteKSzKHfDDtV9AmWRRrvswP9BgbVp7UY6j0GPmm83AcTQEBUmwr"
$kmsKeyId = "arn:aws:kms:ap-southeast-2:994220462693:key/3b18b0c0-dd1f-41db-8bac-6ec857c1ed05"

Write-Host "Testing operator KMS decryption..."
Write-Host "Ciphertext length: $($encryptedKey.Length) characters (base64)"
Write-Host "KMS Key ID: $kmsKeyId"

# Test KMS decryption
try {
    $decryptResult = aws kms decrypt --key-id $kmsKeyId --ciphertext-blob $encryptedKey --output json
    Write-Host "KMS decryption successful"
    Write-Host "Decrypt result: $decryptResult"
    
    # Parse the result to get the plaintext
    $result = $decryptResult | ConvertFrom-Json
    $plaintext = $result.Plaintext
    Write-Host "Plaintext: $plaintext"
    
    # Decode base64 to see the actual content
    $decoded = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($plaintext))
    Write-Host "Decoded plaintext: $decoded"
} catch {
    Write-Host "KMS decryption failed: $($_.Exception.Message)"
}
