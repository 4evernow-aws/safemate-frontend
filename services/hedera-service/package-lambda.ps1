# Package Lambda function with all required files
Set-Location services\hedera-service

# Create a new zip file with all required files
$files = @("index.js", "hedera-client.js")
Compress-Archive -Path $files -DestinationPath "..\..\hedera-service-fixed.zip" -Force

Write-Host "Lambda package created: hedera-service-fixed.zip"
Set-Location ..\..
