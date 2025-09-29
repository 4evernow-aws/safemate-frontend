# Fix Hedera Lambda Function Deployment Package
# This script creates a proper deployment package with all required files

Write-Host "🔧 Fixing Hedera Lambda deployment package..."

# Navigate to the hedera-service directory
Set-Location services\hedera-service

# Remove any existing zip files
Remove-Item -Path "*.zip" -Force -ErrorAction SilentlyContinue

# Create a new deployment package with all required files
$files = @("index.js", "hedera-client.js")
Write-Host "📦 Packaging files: $($files -join ', ')"

# Create the zip file
Compress-Archive -Path $files -DestinationPath "hedera-service.zip" -Force

# Verify the zip file was created
if (Test-Path "hedera-service.zip") {
    Write-Host "✅ Deployment package created: hedera-service.zip"
    
    # Show the contents of the zip file
    Write-Host "📋 Package contents:"
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $zip = [System.IO.Compression.ZipFile]::OpenRead("$PWD\hedera-service.zip")
    $zip.Entries | ForEach-Object { Write-Host "  - $($_.FullName)" }
    $zip.Dispose()
} else {
    Write-Host "❌ Failed to create deployment package"
    exit 1
}

# Return to the infrastructure directory
Set-Location ..\..

Write-Host "🎯 Ready to deploy with Terraform!"
