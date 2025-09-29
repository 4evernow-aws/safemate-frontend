# CloudFront and S3 Configuration Analysis & Fix

## Current Issues Identified

### 1. **CloudFront Origin Configuration Problem**
**Issue**: The CloudFront distribution is configured with `S3OriginConfig` but should use `CustomOriginConfig` for S3 website endpoints.

**Current (Incorrect)**:
```json
"S3OriginConfig": {
    "OriginAccessIdentity": ""
}
```

**Should Be**:
```json
"CustomOriginConfig": {
    "HTTPPort": 80,
    "HTTPSPort": 443,
    "OriginProtocolPolicy": "http-only",
    "OriginSslProtocols": {
        "Quantity": 1,
        "Items": ["TLSv1.2"]
    },
    "OriginReadTimeout": 30,
    "OriginKeepaliveTimeout": 5
}
```

### 2. **Domain Name Mismatch**
**Issue**: Using direct S3 bucket domain instead of S3 website endpoint.

**Current (Incorrect)**:
```
"DomainName": "default-safemate-static-hosting.s3.ap-southeast-2.amazonaws.com"
```

**Should Be**:
```
"DomainName": "default-safemate-static-hosting.s3-website-ap-southeast-2.amazonaws.com"
```

### 3. **S3 Bucket Configuration**
**Issue**: S3 bucket may not be properly configured for website hosting.

**Required Configuration**:
- Website hosting enabled
- Index document: `index.html`
- Error document: `index.html` (for SPA routing)
- Public read access policy

### 4. **CloudFront Cache Behavior**
**Issue**: Cache behavior may not be optimized for Single Page Application (SPA).

**Required Settings**:
- Forward all headers (`*`)
- Forward all cookies
- Forward query strings
- Custom error responses for 403/404 → `/index.html`

## Solution Steps

### Step 1: Configure S3 Bucket for Website Hosting
```bash
# Enable website hosting
aws s3api put-bucket-website \
  --bucket default-safemate-static-hosting \
  --website-configuration '{
    "IndexDocument": {"Suffix": "index.html"},
    "ErrorDocument": {"Key": "index.html"}
  }'

# Set bucket policy for public read access
aws s3api put-bucket-policy \
  --bucket default-safemate-static-hosting \
  --policy '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "PublicReadGetObject",
        "Effect": "Allow",
        "Principal": "*",
        "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::default-safemate-static-hosting/*"
      }
    ]
  }'
```

### Step 2: Update CloudFront Distribution
Use the corrected configuration in `corrected-cloudfront-config.json`:

```bash
# Get current ETag
aws cloudfront get-distribution-config --id EBZOQYI8VCOCW --query 'ETag' --output text

# Update distribution
aws cloudfront update-distribution \
  --id EBZOQYI8VCOCW \
  --distribution-config file://corrected-cloudfront-config.json \
  --if-match <ETAG_FROM_ABOVE>
```

### Step 3: Wait for Deployment and Invalidate Cache
```bash
# Wait for deployment (check status)
aws cloudfront get-distribution --id EBZOQYI8VCOCW --query 'Distribution.Status'

# Invalidate cache
aws cloudfront create-invalidation \
  --distribution-id EBZOQYI8VCOCW \
  --paths "/*"
```

## Key Differences in Corrected Configuration

### Origin Configuration
- **Before**: `S3OriginConfig` with empty `OriginAccessIdentity`
- **After**: `CustomOriginConfig` with proper HTTP settings

### Domain Name
- **Before**: `default-safemate-static-hosting.s3.ap-southeast-2.amazonaws.com`
- **After**: `default-safemate-static-hosting.s3-website-ap-southeast-2.amazonaws.com`

### Protocol Policy
- **Before**: Not specified (defaults to HTTPS)
- **After**: `"OriginProtocolPolicy": "http-only"` (S3 website endpoints are HTTP only)

## Testing URLs

### Working URLs (Expected)
- S3 Website: `http://default-safemate-static-hosting.s3-website-ap-southeast-2.amazonaws.com`
- CloudFront (after fix): `https://d19a5c2wn4mtdt.cloudfront.net`

### Error URLs (Current Issues)
- CloudFront (current): `https://d19a5c2wn4mtdt.cloudfront.net` → "NoSuchBucket" error

## Manual AWS Console Steps (Alternative)

If AWS CLI is not working, use the AWS Console:

1. **S3 Console**:
   - Go to `default-safemate-static-hosting` bucket
   - Properties → Static website hosting → Enable
   - Index document: `index.html`
   - Error document: `index.html`
   - Save

2. **S3 Bucket Policy**:
   - Go to bucket → Permissions → Bucket policy
   - Add the public read policy (see above)

3. **CloudFront Console**:
   - Go to distribution `EBZOQYI8VCOCW`
   - Origins → Edit origin
   - Change domain to: `default-safemate-static-hosting.s3-website-ap-southeast-2.amazonaws.com`
   - Origin protocol: HTTP only
   - Save

4. **CloudFront Cache Behavior**:
   - Go to Cache behaviors → Edit
   - Forward all headers: `*`
   - Forward all cookies: All
   - Forward query strings: All
   - Save

5. **CloudFront Error Pages**:
   - Go to Error pages
   - Create custom error responses for 403 and 404 → `/index.html`

## Expected Results

After applying these fixes:
- ✅ CloudFront should serve the S3 website content
- ✅ SPA routing should work (404s redirect to index.html)
- ✅ All static assets should load properly
- ✅ Authentication should work correctly

## Troubleshooting

### If CloudFront still shows errors:
1. Check S3 bucket website configuration
2. Verify bucket policy allows public read
3. Wait for CloudFront deployment (5-10 minutes)
4. Invalidate CloudFront cache
5. Clear browser cache

### If S3 website works but CloudFront doesn't:
1. Verify CloudFront origin configuration
2. Check CloudFront error logs
3. Ensure proper cache invalidation
4. Wait for full deployment

## Files Created
- `corrected-cloudfront-config.json` - Fixed CloudFront configuration
- `fix-cloudfront-s3.ps1` - Automated fix script
- `CLOUDFRONT_S3_ANALYSIS.md` - This analysis document
