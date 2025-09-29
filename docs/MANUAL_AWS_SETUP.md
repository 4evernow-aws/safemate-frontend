# Manual AWS Setup Guide for SafeMate

## Prerequisites
- AWS Account with appropriate permissions
- AWS CLI installed and configured (optional)

## Option 1: AWS Console Setup (Recommended)

### Step 1: Create S3 Bucket

1. **Go to AWS S3 Console**
   - Navigate to: https://console.aws.amazon.com/s3/
   - Click "Create bucket"

2. **Configure Bucket**
   - **Bucket name**: `default-safemate-static-hosting`
   - **Region**: `Asia Pacific (Sydney) ap-southeast-2`
   - **Block Public Access**: Uncheck "Block all public access" (we need public read access)
   - **Bucket Versioning**: Disabled
   - **Tags**: Optional
   - Click "Create bucket"

3. **Configure Website Hosting**
   - Select the bucket you just created
   - Go to "Properties" tab
   - Scroll down to "Static website hosting"
   - Click "Edit"
   - Select "Enable"
   - **Index document**: `index.html`
   - **Error document**: `index.html`
   - Click "Save changes"

4. **Set Bucket Policy**
   - Go to "Permissions" tab
   - Click "Bucket policy"
   - Add this policy:
   ```json
   {
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
   }
   ```
   - Click "Save changes"

### Step 2: Create CloudFront Distribution

1. **Go to AWS CloudFront Console**
   - Navigate to: https://console.aws.amazon.com/cloudfront/
   - Click "Create distribution"

2. **Configure Origin**
   - **Origin domain**: Select your S3 bucket website endpoint
   - **Origin path**: Leave empty
   - **Origin ID**: `S3-default-safemate-static-hosting`
   - **Origin protocol**: HTTP only
   - **Origin access**: Public

3. **Configure Default Cache Behavior**
   - **Viewer protocol policy**: Redirect HTTP to HTTPS
   - **Allowed HTTP methods**: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
   - **Cache key and origin requests**: Use legacy cache settings
   - **Forward headers**: All
   - **Forward cookies**: All
   - **Forward query strings**: All
   - **Object caching**: Customize
   - **TTL values**: 0 (no caching for now)

4. **Configure Error Pages**
   - Go to "Error pages" tab
   - Create custom error response for 403:
     - **HTTP error code**: 403
     - **Error caching minimum TTL**: 0
     - **Customize error response**: Yes
     - **Response page path**: `/index.html`
     - **HTTP response code**: 200
   - Create custom error response for 404:
     - **HTTP error code**: 404
     - **Error caching minimum TTL**: 0
     - **Customize error response**: Yes
     - **Response page path**: `/index.html`
     - **HTTP response code**: 200

5. **Complete Setup**
   - **Price class**: Use All Edge Locations
   - **Alternate domain names**: Leave empty
   - **SSL certificate**: Default CloudFront certificate
   - **Default root object**: `index.html`
   - Click "Create distribution"

## Option 2: AWS CLI Setup

### Step 1: Configure AWS CLI
```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter your default region: ap-southeast-2
# Enter your default output format: json
```

### Step 2: Run the Creation Scripts
```powershell
# Create S3 bucket only
.\create-s3-bucket-only.ps1

# Or create both S3 and CloudFront
.\create-s3-cloudfront.ps1
```

## Testing Your Setup

### S3 Website URL
- **URL**: `http://default-safemate-static-hosting.s3-website-ap-southeast-2.amazonaws.com`
- **Status**: Should work immediately after bucket creation

### CloudFront URL
- **URL**: Check your CloudFront distribution domain (e.g., `https://d1234567890abc.cloudfront.net`)
- **Status**: Takes 5-10 minutes to deploy

## Upload Your Website

### Using AWS CLI
```bash
# Build your React app first
cd apps/web/safemate
npm run build

# Upload to S3
aws s3 sync dist/ s3://default-safemate-static-hosting --delete
```

### Using AWS Console
1. Go to your S3 bucket
2. Click "Upload"
3. Select all files from your `dist/` folder
4. Click "Upload"

## Troubleshooting

### Common Issues
1. **"NoSuchBucket" error**: Check bucket name and region
2. **"Access Denied" error**: Check bucket policy
3. **CloudFront not updating**: Wait for deployment and invalidate cache
4. **SPA routing not working**: Check error page configurations

### Cache Invalidation
```bash
# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

## Expected Results
- ✅ S3 website serves your React app
- ✅ CloudFront provides HTTPS and CDN
- ✅ SPA routing works (404s redirect to index.html)
- ✅ All static assets load properly
- ✅ Authentication works correctly

## Files Created
- `create-s3-bucket-only.ps1` - Creates S3 bucket with website hosting
- `create-s3-cloudfront.ps1` - Creates both S3 bucket and CloudFront distribution
- `MANUAL_AWS_SETUP.md` - This manual setup guide
