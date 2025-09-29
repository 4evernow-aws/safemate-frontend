# SafeMate Infrastructure

This repository contains the Terraform infrastructure code for the SafeMate application, including AWS services configuration for different environments.

## Repository Structure

- **terraform/**: Terraform configuration files
- **.github/workflows/**: GitHub Actions CI/CD pipelines
- **README.md**: This file

## Environment-First Structure

This repository follows the environment-first branching strategy:

- `dev` - Development infrastructure and experimental configurations
- `preprod` - Pre-production infrastructure and staging environment
- `main` - Production-ready infrastructure

## Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/4evernow-aws/safemate-infrastructure.git
   cd safemate-infrastructure
   ```

2. **Switch to your working branch**:
   ```bash
   git checkout dev  # or preprod/main
   ```

3. **Initialize Terraform**:
   ```bash
   cd terraform
   terraform init
   ```

4. **Plan infrastructure changes**:
   ```bash
   terraform plan -var-file="preprod.tfvars"
   ```

5. **Apply infrastructure**:
   ```bash
   terraform apply -var-file="preprod.tfvars"
   ```

## AWS Services

This infrastructure deploys:

- **Cognito**: User authentication and management
- **Lambda**: Serverless functions for backend logic
- **API Gateway**: REST API endpoints
- **DynamoDB**: NoSQL database for data storage
- **S3**: Static website hosting and file storage
- **CloudFront**: CDN for global content delivery
- **KMS**: Encryption key management for DynamoDB-stored credentials
- **CloudWatch**: Logging and monitoring

## CI/CD Pipeline

GitHub Actions automatically:
- Validates Terraform configuration
- Plans infrastructure changes
- Applies approved changes
- Manages environment-specific deployments

## Contributing

1. Create a feature branch from `dev`
2. Make your infrastructure changes
3. Test with `terraform plan`
4. Submit a pull request to `dev`
5. After review, merge to `preprod` for staging
6. Finally merge to `main` for production

## Security

- All sensitive data is stored in GitHub Secrets
- Terraform state is stored in S3 with encryption
- AWS credentials are managed through IAM roles
- Infrastructure follows security best practices

## Related Repositories

- [safemate-frontend](https://github.com/4evernow-aws/safemate-frontend) - React frontend application
- [safemate-backend](https://github.com/4evernow-aws/safemate-backend) - Lambda functions and API
- [safemate-shared](https://github.com/4evernow-aws/safemate-shared) - Shared utilities and types
- [safemate-docs](https://github.com/4evernow-aws/safemate-docs) - Documentation
