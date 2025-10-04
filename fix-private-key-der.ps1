# Fix Private Key DER Format
# Update Lambda environment variables with correct DER format

$envVars = @{
    "FOLDER_COLLECTION_TOKEN" = "0.0.6920175"
    "SAFEMATE_FOLDERS_TABLE" = "preprod-safemate-hedera-folders"
    "HEDERA_PRIVATE_KEY" = "302a300506032b6570032100f8c575bdaddf2db1ef668ad882d0664f08f874e5194b3273bc52084c1c91f575"
    "ACCOUNT_VALIDATION_INTERVAL" = "300000"
    "HEDERA_NETWORK" = "testnet"
    "BACKUP_ACCOUNT_IDS" = "0.0.6890394,0.0.6890395"
    "HIP_1299_COMPLIANCE" = "true"
    "MIRROR_NODE_URL" = "https://testnet.mirrornode.hedera.com"
    "VERSION" = "V47.2-FINAL"
    "WALLET_KMS_KEY_ID" = "3b18b0c0-dd1f-41db-8bac-6ec857c1ed05"
    "WALLET_METADATA_TABLE" = "preprod-safemate-wallet-metadata"
    "WALLET_KEYS_TABLE" = "preprod-safemate-wallet-keys"
    "HEDERA_ACCOUNT_ID" = "0.0.6890393"
}

$envVarsJson = $envVars | ConvertTo-Json -Compress
Write-Host "Updating Lambda environment variables with correct DER format..."
Write-Host "New HEDERA_PRIVATE_KEY: 302a300506032b6570032100f8c575bdaddf2db1ef668ad882d0664f08f874e5194b3273bc52084c1c91f575"

aws lambda update-function-configuration --function-name preprod-safemate-hedera-service --environment "Variables=$envVarsJson" --region ap-southeast-2
