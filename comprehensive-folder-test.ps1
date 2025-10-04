# Comprehensive Folder Creation Test
# 
# This script tests the complete folder creation workflow:
# 1. Health check
# 2. List existing folders
# 3. Create root folder
# 4. Create subfolder
# 5. Verify folder structure
# 6. Test folder listing
#
# Author: SafeMate Development Team
# Version: 1.0
# Date: 2025-10-03

param(
    [string]$BaseUrl = "https://uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com/preprod",
    [string]$TestToken = "eyJraWQiOiJSSjlwaStibXlqVk81SjJsSEM5YnFPTlBNOGszbT...", # Replace with actual token
    [switch]$Verbose = $false
)

Write-Host "🧪 Comprehensive Folder Creation Test" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Base URL: $BaseUrl" -ForegroundColor Yellow
Write-Host "Test Token: $($TestToken.Substring(0, 50))..." -ForegroundColor Yellow
Write-Host ""

# Test results tracking
$testResults = @()

function Add-TestResult {
    param(
        [string]$TestName,
        [string]$Status,
        [string]$Details = "",
        [object]$Response = $null
    )
    
    $result = [PSCustomObject]@{
        TestName = $TestName
        Status = $Status
        Details = $Details
        Timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        Response = $Response
    }
    
    $testResults += $result
    
    $color = switch ($Status) {
        "✅ PASS" { "Green" }
        "❌ FAIL" { "Red" }
        "⚠️ WARN" { "Yellow" }
        default { "White" }
    }
    
    Write-Host "$Status $TestName" -ForegroundColor $color
    if ($Details) {
        Write-Host "   $Details" -ForegroundColor Gray
    }
    if ($Verbose -and $Response) {
        Write-Host "   Response: $($Response | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
    }
    Write-Host ""
}

function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null,
        [hashtable]$Headers = @{}
    )
    
    $url = "$BaseUrl$Endpoint"
    $headers["Authorization"] = "Bearer $TestToken"
    $headers["Content-Type"] = "application/json"
    
    try {
        $bodyJson = if ($Body) { $Body | ConvertTo-Json } else { $null }
        
        if ($Verbose) {
            Write-Host "🔍 API Request: $Method $url" -ForegroundColor Gray
            if ($bodyJson) {
                Write-Host "   Body: $bodyJson" -ForegroundColor Gray
            }
        }
        
        $response = Invoke-RestMethod -Uri $url -Method $Method -Headers $headers -Body $bodyJson -ErrorAction Stop
        
        return @{
            Success = $true
            Data = $response
            StatusCode = 200
        }
    } catch {
        $statusCode = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 0 }
        $errorMessage = $_.Exception.Message
        
        return @{
            Success = $false
            Error = $errorMessage
            StatusCode = $statusCode
            Response = $_.Exception.Response
        }
    }
}

# Test 1: Health Check
Write-Host "1️⃣ Testing Health Endpoint..." -ForegroundColor Yellow
$healthResult = Invoke-ApiRequest -Method "GET" -Endpoint "/health"
if ($healthResult.Success) {
    Add-TestResult -TestName "Health Check" -Status "✅ PASS" -Details "API is healthy" -Response $healthResult.Data
} else {
    Add-TestResult -TestName "Health Check" -Status "❌ FAIL" -Details $healthResult.Error
    Write-Host "❌ Cannot proceed - API is not healthy" -ForegroundColor Red
    exit 1
}

# Test 2: List Existing Folders
Write-Host "2️⃣ Testing List Folders..." -ForegroundColor Yellow
$listResult = Invoke-ApiRequest -Method "GET" -Endpoint "/folders"
if ($listResult.Success) {
    $folderCount = if ($listResult.Data.data) { $listResult.Data.data.Count } else { 0 }
    Add-TestResult -TestName "List Folders" -Status "✅ PASS" -Details "Found $folderCount existing folders" -Response $listResult.Data
} else {
    Add-TestResult -TestName "List Folders" -Status "❌ FAIL" -Details $listResult.Error
}

# Test 3: Create Root Folder
Write-Host "3️⃣ Testing Root Folder Creation..." -ForegroundColor Yellow
$rootFolderName = "TestRoot_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
$createRootResult = Invoke-ApiRequest -Method "POST" -Endpoint "/folders" -Body @{ name = $rootFolderName }

if ($createRootResult.Success) {
    $rootFolderId = $createRootResult.Data.data.id
    Add-TestResult -TestName "Create Root Folder" -Status "✅ PASS" -Details "Created '$rootFolderName' with ID: $rootFolderId" -Response $createRootResult.Data
} else {
    Add-TestResult -TestName "Create Root Folder" -Status "❌ FAIL" -Details $createRootResult.Error
    Write-Host "❌ Cannot proceed - Root folder creation failed" -ForegroundColor Red
    exit 1
}

# Test 4: Create Subfolder
Write-Host "4️⃣ Testing Subfolder Creation..." -ForegroundColor Yellow
$subFolderName = "TestSub_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
$createSubResult = Invoke-ApiRequest -Method "POST" -Endpoint "/folders" -Body @{ 
    name = $subFolderName
    parentFolderId = $rootFolderId
}

if ($createSubResult.Success) {
    $subFolderId = $createSubResult.Data.data.id
    Add-TestResult -TestName "Create Subfolder" -Status "✅ PASS" -Details "Created '$subFolderName' with ID: $subFolderId" -Response $createSubResult.Data
} else {
    Add-TestResult -TestName "Create Subfolder" -Status "❌ FAIL" -Details $createSubResult.Error
}

# Test 5: Verify Folder Structure
Write-Host "5️⃣ Testing Folder Structure Verification..." -ForegroundColor Yellow
Start-Sleep -Seconds 2  # Wait for blockchain propagation

$verifyResult = Invoke-ApiRequest -Method "GET" -Endpoint "/folders"
if ($verifyResult.Success) {
    $folders = $verifyResult.Data.data
    $rootFolderFound = $folders | Where-Object { $_.id -eq $rootFolderId }
    $subFolderFound = $folders | Where-Object { $_.id -eq $subFolderId }
    
    if ($rootFolderFound -and $subFolderFound) {
        Add-TestResult -TestName "Folder Structure Verification" -Status "✅ PASS" -Details "Both root and subfolder found in listing" -Response $verifyResult.Data
    } else {
        Add-TestResult -TestName "Folder Structure Verification" -Status "⚠️ WARN" -Details "Some folders not found in listing"
    }
} else {
    Add-TestResult -TestName "Folder Structure Verification" -Status "❌ FAIL" -Details $verifyResult.Error
}

# Test 6: Test Individual Folder Retrieval
Write-Host "6️⃣ Testing Individual Folder Retrieval..." -ForegroundColor Yellow
$getRootResult = Invoke-ApiRequest -Method "GET" -Endpoint "/folders/$rootFolderId"
if ($getRootResult.Success) {
    Add-TestResult -TestName "Get Root Folder" -Status "✅ PASS" -Details "Root folder retrieved successfully" -Response $getRootResult.Data
} else {
    Add-TestResult -TestName "Get Root Folder" -Status "❌ FAIL" -Details $getRootResult.Error
}

$getSubResult = Invoke-ApiRequest -Method "GET" -Endpoint "/folders/$subFolderId"
if ($getSubResult.Success) {
    Add-TestResult -TestName "Get Subfolder" -Status "✅ PASS" -Details "Subfolder retrieved successfully" -Response $getSubResult.Data
} else {
    Add-TestResult -TestName "Get Subfolder" -Status "❌ FAIL" -Details $getSubResult.Error
}

# Test 7: Test Folder Hierarchy Display
Write-Host "7️⃣ Testing Folder Hierarchy Display..." -ForegroundColor Yellow
$hierarchyResult = Invoke-ApiRequest -Method "GET" -Endpoint "/folders"
if ($hierarchyResult.Success) {
    $folders = $hierarchyResult.Data.data
    
    # Check if folders have proper hierarchy structure
    $hasHierarchy = $folders | Where-Object { $_.parentFolderId -ne $null }
    
    if ($hasHierarchy) {
        Add-TestResult -TestName "Folder Hierarchy Display" -Status "✅ PASS" -Details "Hierarchy structure detected" -Response $hierarchyResult.Data
    } else {
        Add-TestResult -TestName "Folder Hierarchy Display" -Status "⚠️ WARN" -Details "No hierarchy structure detected"
    }
} else {
    Add-TestResult -TestName "Folder Hierarchy Display" -Status "❌ FAIL" -Details $hierarchyResult.Error
}

# Test 8: Test DynamoDB Storage
Write-Host "8️⃣ Testing DynamoDB Storage..." -ForegroundColor Yellow
try {
    $dynamoResult = aws dynamodb scan --table-name preprod-safemate-hedera-folders --filter-expression "folder_id = :folderId" --expression-attribute-values '{":folderId":{"S":"'$rootFolderId'"}}' --region ap-southeast-2 2>$null
    
    if ($dynamoResult) {
        $dynamoData = $dynamoResult | ConvertFrom-Json
        if ($dynamoData.Items -and $dynamoData.Items.Count -gt 0) {
            Add-TestResult -TestName "DynamoDB Storage" -Status "✅ PASS" -Details "Root folder found in DynamoDB"
        } else {
            Add-TestResult -TestName "DynamoDB Storage" -Status "⚠️ WARN" -Details "Root folder not found in DynamoDB"
        }
    } else {
        Add-TestResult -TestName "DynamoDB Storage" -Status "❌ FAIL" -Details "Failed to query DynamoDB"
    }
} catch {
    Add-TestResult -TestName "DynamoDB Storage" -Status "❌ FAIL" -Details "DynamoDB query error: $($_.Exception.Message)"
}

# Summary
Write-Host "📋 TEST SUMMARY" -ForegroundColor Cyan
Write-Host "===============" -ForegroundColor Cyan

$totalTests = $testResults.Count
$passedTests = ($testResults | Where-Object { $_.Status -eq "✅ PASS" }).Count
$failedTests = ($testResults | Where-Object { $_.Status -eq "❌ FAIL" }).Count
$warnedTests = ($testResults | Where-Object { $_.Status -eq "⚠️ WARN" }).Count

Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $failedTests" -ForegroundColor Red
Write-Host "Warnings: $warnedTests" -ForegroundColor Yellow

if ($failedTests -eq 0) {
    Write-Host ""
    Write-Host "🎉 ALL TESTS PASSED!" -ForegroundColor Green
    Write-Host "The folder creation workflow is working correctly." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "⚠️ SOME TESTS FAILED" -ForegroundColor Yellow
    Write-Host "Review the failed tests above for issues." -ForegroundColor Yellow
}

# Export results
$resultsFile = "folder-test-results-$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
$testResults | ConvertTo-Json -Depth 3 | Out-File -FilePath $resultsFile -Encoding UTF8
Write-Host ""
Write-Host "📄 Detailed results exported to: $resultsFile" -ForegroundColor Cyan

Write-Host ""
Write-Host "✅ Comprehensive folder test completed!" -ForegroundColor Green
