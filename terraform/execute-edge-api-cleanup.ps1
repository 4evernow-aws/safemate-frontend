# SafeMate Edge API Cleanup Execution Script
# This script removes the Edge-optimized API Gateways after successful migration

Write-Host "🧹 SafeMate Edge API Cleanup Execution" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Define the Edge-optimized APIs to remove
$edgeApisToRemove = @(
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
        Name = "preprod-safemate-wallet-api (Edge-optimized)"
        Id = "9t9hk461kh"
        Description = "Old Edge-optimized Wallet API"
    },
    @{
        Name = "preprod-safemate-directory-api (Edge-optimized)"
        Id = "e3k7nfvzab"
        Description = "Old Edge-optimized Directory API"
    },
    @{
        Name = "preprod-safemate-vault-api (Edge-optimized)"
        Id = "fg85dzr0ag"
        Description = "Old Edge-optimized Vault API"
    },
    @{
        Name = "preprod-safemate-onboarding-api (Edge-optimized)"
        Id = "ol212feqdl"
        Description = "Old Edge-optimized Onboarding API"
    }
)

Write-Host "`n📋 Edge-optimized APIs to Remove:" -ForegroundColor Yellow
foreach ($api in $edgeApisToRemove) {
    Write-Host "  ❌ $($api.Name) (ID: $($api.Id))" -ForegroundColor Red
}

Write-Host "`n✅ Regional APIs (KEEP):" -ForegroundColor Green
Write-Host "  ✅ preprod-safemate-hedera-api (ID: uvk4xxwjyg) - Regional" -ForegroundColor Green
Write-Host "  ✅ preprod-safemate-group-api (ID: o529nxt704) - Regional" -ForegroundColor Green
Write-Host "  ✅ preprod-safemate-wallet-api (ID: ibgw4y7o4k) - Regional" -ForegroundColor Green
Write-Host "  ✅ preprod-safemate-directory-api (ID: bva6f26re7) - Regional" -ForegroundColor Green
Write-Host "  ✅ preprod-safemate-vault-api (ID: peh5vc8yj3) - Regional" -ForegroundColor Green
Write-Host "  ✅ preprod-safemate-onboarding-api (ID: ylpabkmc68) - Regional" -ForegroundColor Green

Write-Host "`n🚨 WARNING: This will permanently delete the Edge-optimized APIs!" -ForegroundColor Red
Write-Host "Make sure the frontend is deployed and working with Regional APIs." -ForegroundColor Red

$confirmation = Read-Host "`nDo you want to proceed with the cleanup? (yes/no)"

if ($confirmation -eq "yes") {
    Write-Host "`n🗑️ Starting Edge API cleanup..." -ForegroundColor Yellow
    
    $successCount = 0
    $errorCount = 0
    
    foreach ($api in $edgeApisToRemove) {
        Write-Host "`n🔄 Removing $($api.Name)..." -ForegroundColor Yellow
        
        try {
            # Delete the API Gateway
            aws apigateway delete-rest-api --rest-api-id $api.Id
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  ✅ Successfully removed $($api.Name)" -ForegroundColor Green
                $successCount++
            } else {
                Write-Host "  ❌ Failed to remove $($api.Name)" -ForegroundColor Red
                $errorCount++
            }
        } catch {
            Write-Host "  ❌ Error removing $($api.Name): $($_.Exception.Message)" -ForegroundColor Red
            $errorCount++
        }
    }
    
    Write-Host "`n📊 Cleanup Summary:" -ForegroundColor Yellow
    Write-Host "  ✅ Successfully removed: $successCount APIs" -ForegroundColor Green
    Write-Host "  ❌ Failed to remove: $errorCount APIs" -ForegroundColor Red
    
    if ($errorCount -eq 0) {
        Write-Host "`n🎉 Edge API cleanup completed successfully!" -ForegroundColor Green
        Write-Host "All Edge-optimized APIs have been removed." -ForegroundColor Green
        Write-Host "The application is now using Regional APIs exclusively." -ForegroundColor Green
    } else {
        Write-Host "`n⚠️ Edge API cleanup completed with some errors." -ForegroundColor Yellow
        Write-Host "Please check the failed removals and retry if necessary." -ForegroundColor Yellow
    }
} else {
    Write-Host "`n❌ Edge API cleanup cancelled." -ForegroundColor Yellow
    Write-Host "The Edge-optimized APIs remain active." -ForegroundColor Yellow
}

Write-Host "`n🔍 Verification Commands:" -ForegroundColor Yellow
Write-Host "# Check remaining APIs:" -ForegroundColor White
Write-Host "aws apigateway get-rest-apis --query 'items[?contains(name, `preprod-safemate`)].{Name:name,Id:id,EndpointConfiguration:endpointConfiguration}' --output table" -ForegroundColor Gray

Write-Host "`n✅ Edge API cleanup script completed!" -ForegroundColor Green
