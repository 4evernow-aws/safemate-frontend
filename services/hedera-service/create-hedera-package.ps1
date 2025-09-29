# Create proper Hedera Lambda deployment package
Write-Host "Creating Hedera Lambda deployment package..."

# Create temporary directory
$tempDir = "temp-hedera-package"
if (Test-Path $tempDir) {
    Remove-Item -Recurse -Force $tempDir
}
New-Item -ItemType Directory -Path $tempDir

# Copy required files
Copy-Item "services\hedera-service\index.js" "$tempDir\index.js"
Copy-Item "services\hedera-service\hedera-client.js" "$tempDir\hedera-client.js"

# Create zip file
Compress-Archive -Path "$tempDir\*" -DestinationPath "services\hedera-service\hedera-service.zip" -Force

# Clean up
Remove-Item -Recurse -Force $tempDir

Write-Host "Package created successfully!"

# Verify contents
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead("$PWD\services\hedera-service\hedera-service.zip")
Write-Host "Package contents:"
$zip.Entries | ForEach-Object { Write-Host "  - $($_.FullName)" }
$zip.Dispose()
