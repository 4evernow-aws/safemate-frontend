# SafeMate AWS Free Tier Monitoring Script
# 
# This script monitors AWS service usage to ensure we stay within free tier limits
# Run this script monthly to check your usage against AWS free tier limits
#
# Author: SafeMate Development Team
# Last Updated: 2025-10-03
# Version: 1.0

param(
    [string]$Region = "ap-southeast-2",
    [switch]$Detailed = $false,
    [switch]$ExportToCSV = $false
)

Write-Host "🔍 SafeMate AWS Free Tier Monitoring" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Region: $Region" -ForegroundColor Yellow
Write-Host "Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow
Write-Host ""

# Initialize results array
$results = @()

# Function to add result to array
function Add-Result {
    param(
        [string]$Service,
        [string]$Metric,
        [string]$Current,
        [string]$Limit,
        [string]$Status,
        [string]$Cost = "Free"
    )
    
    $result = [PSCustomObject]@{
        Service = $Service
        Metric = $Metric
        Current = $Current
        Limit = $Limit
        Status = $Status
        Cost = $Cost
        Timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    }
    
    $results += $result
}

# Function to format numbers
function Format-Number {
    param([string]$Number)
    
    if ($Number -match '^\d+$') {
        $num = [long]$Number
        if ($num -ge 1000000) {
            return "{0:N2}M" -f ($num / 1000000)
        } elseif ($num -ge 1000) {
            return "{0:N2}K" -f ($num / 1000)
        } else {
            return $Number
        }
    }
    return $Number
}

Write-Host "📊 Checking AWS Free Tier Usage..." -ForegroundColor Green
Write-Host ""

try {
    # 1. Lambda Functions
    Write-Host "1️⃣ Lambda Functions" -ForegroundColor Yellow
    try {
        $lambdaFunctions = aws lambda list-functions --region $Region --query 'Functions[].FunctionName' --output text 2>$null
        $lambdaCount = ($lambdaFunctions -split '\s+').Count
        $lambdaStatus = if ($lambdaCount -le 7) { "✅ Within Limit" } else { "⚠️ Over Limit" }
        Add-Result "Lambda" "Functions" $lambdaCount "7" $lambdaStatus
        Write-Host "   Functions: $lambdaCount/7 $lambdaStatus" -ForegroundColor $(if ($lambdaStatus -like "*Within*") { "Green" } else { "Red" })
        
        if ($Detailed) {
            Write-Host "   Function Names:" -ForegroundColor Gray
            foreach ($func in ($lambdaFunctions -split '\s+')) {
                if ($func) { Write-Host "     - $func" -ForegroundColor Gray }
            }
        }
    } catch {
        Write-Host "   ❌ Error checking Lambda functions: $($_.Exception.Message)" -ForegroundColor Red
        Add-Result "Lambda" "Functions" "Error" "7" "❌ Error"
    }
    Write-Host ""

    # 2. DynamoDB Tables
    Write-Host "2️⃣ DynamoDB Tables" -ForegroundColor Yellow
    try {
        $dynamoTables = aws dynamodb list-tables --region $Region --query 'TableNames' --output text 2>$null
        $dynamoCount = ($dynamoTables -split '\s+').Count
        $dynamoStatus = if ($dynamoCount -le 25) { "✅ Within Limit" } else { "⚠️ Over Limit" }
        Add-Result "DynamoDB" "Tables" $dynamoCount "25" $dynamoStatus
        Write-Host "   Tables: $dynamoCount/25 $dynamoStatus" -ForegroundColor $(if ($dynamoStatus -like "*Within*") { "Green" } else { "Red" })
        
        if ($Detailed) {
            Write-Host "   Table Names:" -ForegroundColor Gray
            foreach ($table in ($dynamoTables -split '\s+')) {
                if ($table) { Write-Host "     - $table" -ForegroundColor Gray }
            }
        }
    } catch {
        Write-Host "   ❌ Error checking DynamoDB tables: $($_.Exception.Message)" -ForegroundColor Red
        Add-Result "DynamoDB" "Tables" "Error" "25" "❌ Error"
    }
    Write-Host ""

    # 3. S3 Buckets
    Write-Host "3️⃣ S3 Buckets" -ForegroundColor Yellow
    try {
        $s3Buckets = aws s3api list-buckets --region $Region --query 'Buckets[].Name' --output text 2>$null
        $s3Count = ($s3Buckets -split '\s+').Count
        $s3Status = if ($s3Count -le 5) { "✅ Within Limit" } else { "⚠️ Over Limit" }
        Add-Result "S3" "Buckets" $s3Count "5" $s3Status
        Write-Host "   Buckets: $s3Count/5 $s3Status" -ForegroundColor $(if ($s3Status -like "*Within*") { "Green" } else { "Red" })
        
        if ($Detailed) {
            Write-Host "   Bucket Names:" -ForegroundColor Gray
            foreach ($bucket in ($s3Buckets -split '\s+')) {
                if ($bucket) { Write-Host "     - $bucket" -ForegroundColor Gray }
            }
        }
    } catch {
        Write-Host "   ❌ Error checking S3 buckets: $($_.Exception.Message)" -ForegroundColor Red
        Add-Result "S3" "Buckets" "Error" "5" "❌ Error"
    }
    Write-Host ""

    # 4. API Gateway APIs
    Write-Host "4️⃣ API Gateway APIs" -ForegroundColor Yellow
    try {
        $apiGateways = aws apigateway get-rest-apis --region $Region --query 'items[].name' --output text 2>$null
        $apiCount = ($apiGateways -split '\s+').Count
        $apiStatus = if ($apiCount -le 10) { "✅ Within Limit" } else { "⚠️ Over Limit" }
        Add-Result "API Gateway" "APIs" $apiCount "10" $apiStatus
        Write-Host "   APIs: $apiCount/10 $apiStatus" -ForegroundColor $(if ($apiStatus -like "*Within*") { "Green" } else { "Red" })
        
        if ($Detailed) {
            Write-Host "   API Names:" -ForegroundColor Gray
            foreach ($api in ($apiGateways -split '\s+')) {
                if ($api) { Write-Host "     - $api" -ForegroundColor Gray }
            }
        }
    } catch {
        Write-Host "   ❌ Error checking API Gateway: $($_.Exception.Message)" -ForegroundColor Red
        Add-Result "API Gateway" "APIs" "Error" "10" "❌ Error"
    }
    Write-Host ""

    # 5. Cognito User Pools
    Write-Host "5️⃣ Cognito User Pools" -ForegroundColor Yellow
    try {
        $cognitoPools = aws cognito-idp list-user-pools --region $Region --max-items 10 --query 'UserPools[].Name' --output text 2>$null
        $cognitoCount = ($cognitoPools -split '\s+').Count
        $cognitoStatus = if ($cognitoCount -le 5) { "✅ Within Limit" } else { "⚠️ Over Limit" }
        Add-Result "Cognito" "User Pools" $cognitoCount "5" $cognitoStatus
        Write-Host "   User Pools: $cognitoCount/5 $cognitoStatus" -ForegroundColor $(if ($cognitoStatus -like "*Within*") { "Green" } else { "Red" })
        
        if ($Detailed) {
            Write-Host "   User Pool Names:" -ForegroundColor Gray
            foreach ($pool in ($cognitoPools -split '\s+')) {
                if ($pool) { Write-Host "     - $pool" -ForegroundColor Gray }
            }
        }
    } catch {
        Write-Host "   ❌ Error checking Cognito: $($_.Exception.Message)" -ForegroundColor Red
        Add-Result "Cognito" "User Pools" "Error" "5" "❌ Error"
    }
    Write-Host ""

    # 6. CloudFront Distributions
    Write-Host "6️⃣ CloudFront Distributions" -ForegroundColor Yellow
    try {
        $cloudfrontDistributions = aws cloudfront list-distributions --query 'DistributionList.Items[].Id' --output text 2>$null
        $cloudfrontCount = ($cloudfrontDistributions -split '\s+').Count
        $cloudfrontStatus = if ($cloudfrontCount -le 2) { "✅ Within Limit" } else { "⚠️ Over Limit" }
        Add-Result "CloudFront" "Distributions" $cloudfrontCount "2" $cloudfrontStatus
        Write-Host "   Distributions: $cloudfrontCount/2 $cloudfrontStatus" -ForegroundColor $(if ($cloudfrontStatus -like "*Within*") { "Green" } else { "Red" })
        
        if ($Detailed) {
            Write-Host "   Distribution IDs:" -ForegroundColor Gray
            foreach ($dist in ($cloudfrontDistributions -split '\s+')) {
                if ($dist) { Write-Host "     - $dist" -ForegroundColor Gray }
            }
        }
    } catch {
        Write-Host "   ❌ Error checking CloudFront: $($_.Exception.Message)" -ForegroundColor Red
        Add-Result "CloudFront" "Distributions" "Error" "2" "❌ Error"
    }
    Write-Host ""

    # 7. KMS Keys
    Write-Host "7️⃣ KMS Keys" -ForegroundColor Yellow
    try {
        $kmsKeys = aws kms list-keys --region $Region --query 'Keys[].KeyId' --output text 2>$null
        $kmsCount = ($kmsKeys -split '\s+').Count
        $kmsStatus = if ($kmsCount -le 1) { "✅ Within Limit" } else { "⚠️ Over Limit" }
        Add-Result "KMS" "Keys" $kmsCount "1" $kmsStatus "Paid"
        Write-Host "   Keys: $kmsCount/1 $kmsStatus (Paid Service)" -ForegroundColor $(if ($kmsStatus -like "*Within*") { "Green" } else { "Red" })
        
        if ($Detailed) {
            Write-Host "   Key IDs:" -ForegroundColor Gray
            foreach ($key in ($kmsKeys -split '\s+')) {
                if ($key) { Write-Host "     - $key" -ForegroundColor Gray }
            }
        }
    } catch {
        Write-Host "   ❌ Error checking KMS keys: $($_.Exception.Message)" -ForegroundColor Red
        Add-Result "KMS" "Keys" "Error" "1" "❌ Error" "Paid"
    }
    Write-Host ""

    # 8. Secrets Manager
    Write-Host "8️⃣ Secrets Manager" -ForegroundColor Yellow
    try {
        $secrets = aws secretsmanager list-secrets --region $Region --query 'SecretList[].Name' --output text 2>$null
        $secretsCount = ($secrets -split '\s+').Count
        $secretsStatus = if ($secretsCount -le 2) { "✅ Within Limit" } else { "⚠️ Over Limit" }
        Add-Result "Secrets Manager" "Secrets" $secretsCount "2" $secretsStatus "Paid"
        Write-Host "   Secrets: $secretsCount/2 $secretsStatus (Paid Service)" -ForegroundColor $(if ($secretsStatus -like "*Within*") { "Green" } else { "Red" })
        
        if ($Detailed) {
            Write-Host "   Secret Names:" -ForegroundColor Gray
            foreach ($secret in ($secrets -split '\s+')) {
                if ($secret) { Write-Host "     - $secret" -ForegroundColor Gray }
            }
        }
    } catch {
        Write-Host "   ❌ Error checking Secrets Manager: $($_.Exception.Message)" -ForegroundColor Red
        Add-Result "Secrets Manager" "Secrets" "Error" "2" "❌ Error" "Paid"
    }
    Write-Host ""

} catch {
    Write-Host "❌ Error running monitoring script: $($_.Exception.Message)" -ForegroundColor Red
}

# Summary
Write-Host "📋 SUMMARY" -ForegroundColor Cyan
Write-Host "==========" -ForegroundColor Cyan

$totalServices = $results.Count
$withinLimit = ($results | Where-Object { $_.Status -like "*Within*" }).Count
$overLimit = ($results | Where-Object { $_.Status -like "*Over*" }).Count
$errors = ($results | Where-Object { $_.Status -like "*Error*" }).Count

Write-Host "Total Services Checked: $totalServices" -ForegroundColor White
Write-Host "Within Free Tier Limits: $withinLimit" -ForegroundColor Green
Write-Host "Over Free Tier Limits: $overLimit" -ForegroundColor Red
Write-Host "Errors: $errors" -ForegroundColor Yellow

if ($overLimit -gt 0) {
    Write-Host ""
    Write-Host "⚠️ WARNING: Some services are over free tier limits!" -ForegroundColor Red
    Write-Host "Consider optimizing or removing unused resources." -ForegroundColor Yellow
}

# Export to CSV if requested
if ($ExportToCSV) {
    $csvFile = "aws-free-tier-monitoring-$(Get-Date -Format 'yyyy-MM-dd').csv"
    $results | Export-Csv -Path $csvFile -NoTypeInformation
    Write-Host ""
    Write-Host "📄 Results exported to: $csvFile" -ForegroundColor Green
}

# Free Tier Limits Reference
Write-Host ""
Write-Host "📚 AWS FREE TIER LIMITS REFERENCE" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Lambda: 1M requests/month, 400,000 GB-seconds compute" -ForegroundColor Gray
Write-Host "DynamoDB: 25GB storage, 25 read/write capacity units" -ForegroundColor Gray
Write-Host "S3: 5GB storage, 20,000 GET requests, 2,000 PUT requests" -ForegroundColor Gray
Write-Host "API Gateway: 1M API calls/month" -ForegroundColor Gray
Write-Host "Cognito: 50,000 MAUs (Monthly Active Users)" -ForegroundColor Gray
Write-Host "CloudFront: 1TB data transfer, 10M requests" -ForegroundColor Gray
Write-Host "KMS: 20,000 requests/month (Paid service)" -ForegroundColor Gray
Write-Host "Secrets Manager: 30 days free trial (Paid service)" -ForegroundColor Gray

Write-Host ""
Write-Host "✅ Monitoring complete!" -ForegroundColor Green
Write-Host "Run this script monthly to track your AWS free tier usage." -ForegroundColor Yellow
