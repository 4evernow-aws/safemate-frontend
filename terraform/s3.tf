/**
 * SafeMate v2 - S3 Static Website Hosting
 *
 * This file configures S3 bucket for static website hosting.
 *
 * @version 2.2.0
 * @author SafeMate Development Team
 * @lastUpdated 2025-01-01
 * @environment Pre-production (preprod)
 * @awsRegion ap-southeast-2
 * @bucketName preprod-safemate-static-hosting
 */

# S3 bucket for static website hosting
resource "aws_s3_bucket" "static_hosting" {
  bucket = "${local.name_prefix}-static-hosting"

  tags = {
    Environment = var.environment
    Application = var.app_name
  }
}

# S3 bucket versioning
resource "aws_s3_bucket_versioning" "static_hosting_versioning" {
  bucket = aws_s3_bucket.static_hosting.id
  versioning_configuration {
    status = "Enabled"
  }
}

# S3 bucket website configuration
resource "aws_s3_bucket_website_configuration" "static_hosting_website" {
  bucket = aws_s3_bucket.static_hosting.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

# S3 bucket public access block
resource "aws_s3_bucket_public_access_block" "static_hosting_pab" {
  bucket = aws_s3_bucket.static_hosting.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# S3 bucket policy for public read access
resource "aws_s3_bucket_policy" "static_hosting_policy" {
  bucket = aws_s3_bucket.static_hosting.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.static_hosting.arn}/*"
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.static_hosting_pab]
}

# S3 bucket CORS configuration
resource "aws_s3_bucket_cors_configuration" "static_hosting_cors" {
  bucket = aws_s3_bucket.static_hosting.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}
