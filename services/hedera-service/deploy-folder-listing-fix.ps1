# Deploy folder listing fix
Write-Host "Deploying folder listing fix..." -ForegroundColor Green

# Create the package
Write-Host "Creating deployment package..." -ForegroundColor Yellow
cd D:\safemate-infrastructure\services\hedera-service
if (Test-Path "hedera-service-folder-listing-fix-v25.zip") {
    Remove-Item "hedera-service-folder-listing-fix-v25.zip" -Force
}
Compress-Archive -Path "index.js","hedera-client.js" -DestinationPath "hedera-service-folder-listing-fix-v25.zip" -Force
Write-Host "Package created successfully" -ForegroundColor Green

# Upload to S3
Write-Host "Uploading to S3..." -ForegroundColor Yellow
aws s3 cp "hedera-service-folder-listing-fix-v25.zip" "s3://safemate-lambda-deployments/hedera-service-folder-listing-fix-v25.zip"

# Update Lambda function
Write-Host "Updating Lambda function..." -ForegroundColor Yellow
aws lambda update-function-code --function-name "preprod-safemate-hedera-service" --s3-bucket "safemate-lambda-deployments" --s3-key "hedera-service-folder-listing-fix-v25.zip"

Write-Host "Deployment completed!" -ForegroundColor Green
cd D:\cursor_projects\safemate_v2
