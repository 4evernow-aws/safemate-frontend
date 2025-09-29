/**
 * SafeMate v2 - Data Sources
 *
 * This file defines data sources for AWS resources.
 * VPC and subnets data sources removed as we're using S3 static hosting.
 *
 * @version 2.2.0
 * @author SafeMate Development Team
 * @lastUpdated 2025-01-01
 * @environment Pre-production (preprod)
 * @awsRegion ap-southeast-2
 */

data "aws_caller_identity" "current" {}

data "aws_region" "current" {} 