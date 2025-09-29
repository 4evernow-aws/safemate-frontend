/**
 * SafeMate v2 - CloudFront Distribution for S3 Static Hosting
 *
 * This file configures CloudFront distribution for S3 static website hosting.
 *
 * @version 2.2.0
 * @author SafeMate Development Team
 * @lastUpdated 2025-01-01
 * @environment Pre-production (preprod)
 * @awsRegion ap-southeast-2
 * @origin preprod-safemate-static-hosting.s3-website-ap-southeast-2.amazonaws.com
 */

resource "aws_cloudfront_distribution" "app_distribution" {
  origin {
    domain_name = aws_s3_bucket_website_configuration.static_hosting_website.website_endpoint
    origin_id   = "S3-${local.name_prefix}"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  enabled = true
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${local.name_prefix}"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = false
      headers      = ["Origin", "Access-Control-Request-Headers", "Access-Control-Request-Method"]
      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 3600
    max_ttl     = 86400
  }

  # Handle SPA routing
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Environment = var.environment
    Application = var.app_name
  }
} 