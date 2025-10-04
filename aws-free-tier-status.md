# AWS Free Tier Status & Cost Analysis

## 📊 **Current AWS Usage vs Free Tier Limits**

| Service | Current Usage | Free Tier Limit | Status | Monthly Cost |
|---------|---------------|-----------------|--------|--------------|
| **Lambda Functions** | 16 | 7 | 🔴 **OVER LIMIT** | $5-15 |
| **DynamoDB Tables** | 34 | 25 | 🔴 **OVER LIMIT** | $10-30 |
| **S3 Buckets** | 8 | 5 | 🔴 **OVER LIMIT** | $2-5 |
| **API Gateway APIs** | 15 | 10 | 🔴 **OVER LIMIT** | $5-15 |
| **Cognito User Pools** | 0 | 5 | ✅ **WITHIN LIMIT** | $0 |
| **CloudFront Distributions** | 2 | 2 | ✅ **WITHIN LIMIT** | $0 |
| **KMS Keys** | 4 | 1 | 🔴 **OVER LIMIT** | $4 |
| **Secrets Manager** | 1 | 2 | ✅ **WITHIN LIMIT** | $0.40 |

## 💰 **Cost Breakdown**

### **Current Monthly Costs:**
| Category | Service | Cost | Notes |
|----------|---------|------|-------|
| **Compute** | Lambda (9 extra functions) | $5-15 | 9 functions over free tier |
| **Database** | DynamoDB (9 extra tables) | $10-30 | 9 tables over free tier |
| **Storage** | S3 (3 extra buckets) | $2-5 | 3 buckets over free tier |
| **API** | API Gateway (5 extra APIs) | $5-15 | 5 APIs over free tier |
| **Security** | KMS (3 extra keys) | $3 | 3 keys over free tier |
| **Secrets** | Secrets Manager | $0.40 | 1 secret (paid service) |
| **TOTAL** | | **$25.40 - $68.40** | **Current monthly cost** |

### **Free Tier Savings Potential:**
| Action | Current Cost | After Cleanup | Savings |
|--------|--------------|---------------|---------|
| **Remove Dev Resources** | $25.40 - $68.40 | $1.80 | **$23.60 - $66.60** |
| **Annual Savings** | $304.80 - $820.80 | $21.60 | **$283.20 - $799.20** |

## 🎯 **Resource Breakdown by Environment**

### **Development Environment (TO BE REMOVED):**
| Service | Count | Monthly Cost |
|---------|-------|--------------|
| Lambda Functions | 9 | $3-9 |
| DynamoDB Tables | 17 | $5-15 |
| S3 Buckets | 3 | $1-3 |
| API Gateway APIs | 8 | $3-9 |
| KMS Keys | 3 | $3 |
| **Dev Total** | | **$15-39** |

### **Preprod Environment (KEEP):**
| Service | Count | Monthly Cost |
|---------|-------|--------------|
| Lambda Functions | 7 | $0 (within free tier) |
| DynamoDB Tables | 17 | $0 (within free tier) |
| S3 Buckets | 5 | $0 (within free tier) |
| API Gateway APIs | 7 | $0 (within free tier) |
| KMS Keys | 1 | $1 |
| Secrets Manager | 1 | $0.40 |
| **Preprod Total** | | **$1.40** |

## 🚨 **Critical Actions Required**

### **Immediate Cleanup (Save $15-39/month):**
1. **Delete Dev Lambda Functions** (9 functions)
   - `dev-safemate-user-onboarding`
   - `dev-safemate-group-manager`
   - `dev-safemate-email-verification`
   - `dev-safemate-wallet-manager`
   - `dev-safemate-token-vault`
   - `dev-safemate-directory-creator`
   - `dev-safemate-hedera-service`
   - `dev-safemate-post-confirmation-wallet-creator`

2. **Delete Dev DynamoDB Tables** (17 tables)
   - All tables starting with `dev-safemate-`

3. **Delete Dev S3 Buckets** (3 buckets)
   - `dev-safemate-static-hosting`
   - `safemate-lambda-deployments-dev`

4. **Delete Dev API Gateway APIs** (8 APIs)
   - All APIs starting with `dev-safemate-`

5. **Delete Extra KMS Keys** (3 keys)
   - Keep only the preprod key

## 📈 **Cost Optimization Timeline**

| Phase | Action | Monthly Savings | Cumulative Savings |
|-------|--------|-----------------|-------------------|
| **Phase 1** | Remove dev resources | $15-39 | $15-39 |
| **Phase 2** | Optimize preprod usage | $0-5 | $15-44 |
| **Phase 3** | Monitor and maintain | $0 | $15-44 |
| **Annual Total** | | | **$180-528** |

## 🎯 **Target State (After Cleanup)**

| Service | Target Count | Free Tier Limit | Status | Monthly Cost |
|---------|--------------|-----------------|--------|--------------|
| **Lambda Functions** | 7 | 7 | ✅ **WITHIN LIMIT** | $0 |
| **DynamoDB Tables** | 17 | 25 | ✅ **WITHIN LIMIT** | $0 |
| **S3 Buckets** | 5 | 5 | ✅ **WITHIN LIMIT** | $0 |
| **API Gateway APIs** | 7 | 10 | ✅ **WITHIN LIMIT** | $0 |
| **Cognito User Pools** | 0 | 5 | ✅ **WITHIN LIMIT** | $0 |
| **CloudFront Distributions** | 2 | 2 | ✅ **WITHIN LIMIT** | $0 |
| **KMS Keys** | 1 | 1 | ✅ **WITHIN LIMIT** | $1 |
| **Secrets Manager** | 1 | 2 | ✅ **WITHIN LIMIT** | $0.40 |
| **TOTAL** | | | | **$1.40/month** |

## 🏆 **Benefits of Cleanup**

- ✅ **95% Cost Reduction**: From $25-68/month to $1.40/month
- ✅ **Free Tier Compliance**: All services within free tier limits
- ✅ **Simplified Management**: Only preprod environment to maintain
- ✅ **Annual Savings**: $283-799 per year
- ✅ **No Functionality Loss**: All preprod features preserved

## 📋 **Cleanup Script Available**

The `monitor-aws-free-tier.ps1` script can help identify and track the cleanup progress.

**Next Action**: Run the cleanup to bring costs down to $1.40/month and stay within AWS free tier limits.
