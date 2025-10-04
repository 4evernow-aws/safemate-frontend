# Cleanup SafeMate Deployment Packages
Write-Host "🧹 Cleaning up SafeMate deployment packages..." -ForegroundColor Cyan

# Keep these essential packages (most recent and working)
$keepPackages = @(
    "hedera-service-standards-compliant.zip",  # Current working version (60MB)
    "hedera-service-v47-11-final.zip",         # Original working version (68MB)
    "hedera-service-v47-11-fldr-symbols.zip"  # Updated symbols version (69MB)
)

# Get all deployment packages
$allPackages = Get-ChildItem "hedera-service-*.zip"

Write-Host "`n📦 Found $($allPackages.Count) deployment packages" -ForegroundColor Yellow

# Show packages to keep
Write-Host "`n✅ Keeping essential packages:" -ForegroundColor Green
foreach ($package in $keepPackages) {
    if (Test-Path $package) {
        $size = [math]::Round((Get-Item $package).Length / 1MB, 2)
        Write-Host "  - $package ($size MB)" -ForegroundColor White
    }
}

# Show packages to remove
$packagesToRemove = $allPackages | Where-Object { $_.Name -notin $keepPackages }
Write-Host "`n🗑️ Removing $($packagesToRemove.Count) old packages:" -ForegroundColor Yellow

$totalSizeRemoved = 0
foreach ($package in $packagesToRemove) {
    $size = (Get-Item $package).Length
    $sizeMB = [math]::Round($size / 1MB, 2)
    $totalSizeRemoved += $size
    
    Write-Host "  - $($package.Name) ($sizeMB MB)" -ForegroundColor Gray
    Remove-Item $package.FullName -Force
}

$totalSizeRemovedMB = [math]::Round($totalSizeRemoved / 1MB, 2)

Write-Host "`n🎯 Cleanup Summary:" -ForegroundColor Cyan
Write-Host "- Kept: $($keepPackages.Count) essential packages" -ForegroundColor Green
Write-Host "- Removed: $($packagesToRemove.Count) old packages" -ForegroundColor Yellow
Write-Host "- Space freed: $totalSizeRemovedMB MB" -ForegroundColor White

# Also clean up old deployment scripts
Write-Host "`n🧹 Cleaning up old deployment scripts..." -ForegroundColor Yellow

$keepScripts = @(
    "deploy-with-standards.ps1",           # Current working deployment
    "deploy-large-package-via-s3.ps1",     # S3 deployment method
    "test-lambda-health.ps1"              # Testing script
)

$allScripts = Get-ChildItem "deploy-*.ps1", "test-*.ps1"
$scriptsToRemove = $allScripts | Where-Object { $_.Name -notin $keepScripts }

Write-Host "🗑️ Removing $($scriptsToRemove.Count) old scripts:" -ForegroundColor Yellow
foreach ($script in $scriptsToRemove) {
    Write-Host "  - $($script.Name)" -ForegroundColor Gray
    Remove-Item $script.FullName -Force
}

Write-Host "`n✅ Cleanup completed!" -ForegroundColor Green
Write-Host "- Essential packages preserved" -ForegroundColor White
Write-Host "- Old packages removed" -ForegroundColor White
Write-Host "- Deployment scripts cleaned up" -ForegroundColor White
Write-Host "- Project organized and streamlined" -ForegroundColor White
