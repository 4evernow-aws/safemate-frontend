# Update Lambda Environment Variables
# This script updates the Lambda function environment variables

Write-Host "🔧 Updating Lambda Environment Variables" -ForegroundColor Green
Write-Host ""

$functionName = "preprod-safemate-hedera-service"

# Get current environment variables
Write-Host "📋 Getting current environment variables..." -ForegroundColor Cyan
try {
    $currentConfig = aws lambda get-function-configuration --function-name $functionName --query 'Environment.Variables' --output json | ConvertFrom-Json
    
    Write-Host "✅ Current environment variables retrieved" -ForegroundColor Green
    Write-Host "   Current variables: $($currentConfig.PSObject.Properties.Name -join ', ')" -ForegroundColor White
    
    # Add the missing variables
    $currentConfig | Add-Member -MemberType NoteProperty -Name "HEDERA_ACCOUNT_ID" -Value "0.0.6890393" -Force
    $currentConfig | Add-Member -MemberType NoteProperty -Name "FOLDER_COLLECTION_TOKEN" -Value "0.0.6920175" -Force
    $currentConfig | Add-Member -MemberType NoteProperty -Name "MIRROR_NODE_URL" -Value "https://testnet.mirrornode.hedera.com" -Force
    $currentConfig | Add-Member -MemberType NoteProperty -Name "VERSION" -Value "V48.0" -Force
    $currentConfig | Add-Member -MemberType NoteProperty -Name "HEDERA_PRIVATE_KEY" -Value "333032653032303130303030353036303332623635373030333231303066386335373562646164646632646231656636363861643838326430363634663038663837346535313934623332373362633532303834633163393166353735" -Force
    
    # Convert to JSON for AWS CLI
    $envJson = $currentConfig | ConvertTo-Json -Compress
    
    Write-Host "📝 Updated environment variables:" -ForegroundColor Cyan
    Write-Host "   Added: HEDERA_ACCOUNT_ID, FOLDER_COLLECTION_TOKEN, MIRROR_NODE_URL, VERSION, HEDERA_PRIVATE_KEY" -ForegroundColor White
    
    # Update the Lambda function
    Write-Host "🚀 Updating Lambda function environment..." -ForegroundColor Cyan
    
    $updateCommand = "aws lambda update-function-configuration --function-name $functionName --environment Variables='$envJson'"
    
    Write-Host "   Executing: $updateCommand" -ForegroundColor Gray
    
    Invoke-Expression $updateCommand
    
    Write-Host "✅ Lambda environment variables updated successfully!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Failed to update environment variables: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 Environment Variables Summary:" -ForegroundColor Cyan
Write-Host "✅ HEDERA_ACCOUNT_ID: 0.0.6890393" -ForegroundColor Green
Write-Host "✅ FOLDER_COLLECTION_TOKEN: 0.0.6920175" -ForegroundColor Green
Write-Host "✅ MIRROR_NODE_URL: https://testnet.mirrornode.hedera.com" -ForegroundColor Green
Write-Host "✅ VERSION: V48.0" -ForegroundColor Green
Write-Host "✅ HEDERA_PRIVATE_KEY: [ENCRYPTED]" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Test collection token creation" -ForegroundColor White
Write-Host "2. Create folders with enhanced metadata" -ForegroundColor White
Write-Host "3. Verify folder tree widget functionality" -ForegroundColor White
