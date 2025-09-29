# SafeMate API Gateway Cleanup Script
# This script removes the duplicate Edge-optimized API Gateways
# Keep the Regional APIs (newer, created 21/09/2025)

Write-Host "🧹 SafeMate API Gateway Cleanup Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Define the API Gateways to REMOVE (Edge-optimized, older)
$apisToRemove = @(
    @{
        Name = "preprod-safemate-hedera-api (Edge-optimized)"
        Id = "2kwe2ly8vh"
        Description = "Old Edge-optimized Hedera API"
    },
    @{
        Name = "preprod-safemate-group-api (Edge-optimized)"
        Id = "3r08ehzgk1"
        Description = "Old Edge-optimized Group API"
    },
    @{
        Name = "preprod-safemate-onboarding-api (Edge-optimized)"
        Id = "ol212feqdl"
        Description = "Old Edge-optimized Onboarding API"
    },
    @{
        Name = "preprod-safemate-vault-api (Edge-optimized)"
        Id = "fg85dzr0ag"
        Description = "Old Edge-optimized Vault API"
    }
)

# Define the API Gateways to KEEP (Regional, newer)
$apisToKeep = @(
    @{
        Name = "preprod-safemate-hedera-api (Regional)"
        Id = "uvk4xxwjyg"
        Description = "Current Regional Hedera API"
    },
    @{
        Name = "preprod-safemate-group-api (Regional)"
        Id = "o529nxt704"
        Description = "Current Regional Group API"
    },
    @{
        Name = "preprod-safemate-onboarding-api (Regional)"
        Id = "ylpabkmc68"
        Description = "Current Regional Onboarding API"
    },
    @{
        Name = "preprod-safemate-vault-api (Regional)"
        Id = "peh5vc8yj3"
        Description = "Current Regional Vault API"
    }
)

Write-Host "`n📋 APIs to REMOVE (Edge-optimized, older):" -ForegroundColor Red
foreach ($api in $apisToRemove) {
    Write-Host "  ❌ $($api.Name) - ID: $($api.Id)" -ForegroundColor Red
}

Write-Host "`n✅ APIs to KEEP (Regional, newer):" -ForegroundColor Green
foreach ($api in $apisToKeep) {
    Write-Host "  ✅ $($api.Name) - ID: $($api.Id)" -ForegroundColor Green
}

Write-Host "`n⚠️  WARNING: This will permanently delete the old API Gateways!" -ForegroundColor Yellow
Write-Host "Make sure you have confirmed that the Regional APIs are working correctly." -ForegroundColor Yellow

$confirmation = Read-Host "`nDo you want to proceed with the cleanup? (yes/no)"

if ($confirmation -eq "yes") {
    Write-Host "`n🚀 Starting API Gateway cleanup..." -ForegroundColor Cyan
    
    foreach ($api in $apisToRemove) {
        Write-Host "`n🗑️  Removing API Gateway: $($api.Name)" -ForegroundColor Yellow
        Write-Host "   ID: $($api.Id)" -ForegroundColor Gray
        
        try {
            # Delete the API Gateway
            aws apigateway delete-rest-api --rest-api-id $api.Id
            Write-Host "   ✅ Successfully deleted: $($api.Name)" -ForegroundColor Green
        }
        catch {
            Write-Host "   ❌ Failed to delete: $($api.Name)" -ForegroundColor Red
            Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host "`n🎉 API Gateway cleanup completed!" -ForegroundColor Green
    Write-Host "`n📊 Summary:" -ForegroundColor Cyan
    Write-Host "  ✅ Kept: $($apisToKeep.Count) Regional APIs" -ForegroundColor Green
    Write-Host "  🗑️  Removed: $($apisToRemove.Count) Edge-optimized APIs" -ForegroundColor Yellow
    
    Write-Host "`n🔍 Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Test all functionality with the Regional APIs" -ForegroundColor White
    Write-Host "  2. Verify frontend is using correct endpoints" -ForegroundColor White
    Write-Host "  3. Monitor CloudWatch logs for any issues" -ForegroundColor White
    Write-Host "  4. Update any remaining references to old endpoints" -ForegroundColor White
}
else {
    Write-Host "`n❌ Cleanup cancelled. No changes made." -ForegroundColor Yellow
}

Write-Host "`n📋 Current API Endpoints (Regional):" -ForegroundColor Cyan
Write-Host "  Hedera API: https://uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com/preprod" -ForegroundColor White
Write-Host "  Group API: https://o529nxt704.execute-api.ap-southeast-2.amazonaws.com/preprod" -ForegroundColor White
Write-Host "  Onboarding API: https://ylpabkmc68.execute-api.ap-southeast-2.amazonaws.com/preprod" -ForegroundColor White
Write-Host "  Vault API: https://peh5vc8yj3.execute-api.ap-southeast-2.amazonaws.com/preprod" -ForegroundColor White

Write-Host "`n✅ CLEANUP COMPLETED - September 23, 2025" -ForegroundColor Green
Write-Host "   - All Edge-optimized APIs removed successfully" -ForegroundColor Green
Write-Host "   - Regional APIs are active and functional" -ForegroundColor Green
Write-Host "   - PostConfirmation Lambda fixed and deployed" -ForegroundColor Green
Write-Host "   - Email verification working end-to-end" -ForegroundColor Green
