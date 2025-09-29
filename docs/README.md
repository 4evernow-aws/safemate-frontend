# SafeMate Documentation

This repository contains comprehensive documentation for the SafeMate application, including architecture guides, deployment instructions, and development workflows.

## Repository Structure

- **Architecture**: System design and infrastructure documentation
- **Deployment**: Guides for deploying to different environments
- **Development**: Team setup and development workflows
- **API**: API documentation and integration guides
- **Security**: Security best practices and configuration

## Environment-First Structure

This repository follows the environment-first branching strategy:

- `dev` - Development documentation and experimental features
- `preprod` - Pre-production documentation and staging guides
- `main` - Production-ready documentation

## Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/4evernow-aws/safemate-docs.git
   cd safemate-docs
   ```

2. **Switch to your working branch**:
   ```bash
   git checkout dev  # or preprod/main
   ```

3. **Read the relevant documentation**:
   - Start with `SAFEMATE_PROJECT_DOCUMENTATION.md` for overview
   - Check `DEPLOYMENT_GUIDE.md` for deployment instructions
   - Review `TEAM_DEVELOPMENT_GUIDE.md` for development workflows

## Contributing

1. Create a feature branch from `dev`
2. Make your documentation changes
3. Test locally with markdown validators
4. Submit a pull request to `dev`
5. After review, merge to `preprod` for staging
6. Finally merge to `main` for production

## CI/CD Pipeline

This repository includes automated validation:
- Markdown syntax checking
- Link validation
- Documentation structure verification

## Related Repositories

- [safemate-frontend](https://github.com/4evernow-aws/safemate-frontend) - React frontend application
- [safemate-backend](https://github.com/4evernow-aws/safemate-backend) - Lambda functions and API
- [safemate-infrastructure](https://github.com/4evernow-aws/safemate-infrastructure) - Terraform infrastructure
- [safemate-shared](https://github.com/4evernow-aws/safemate-shared) - Shared utilities and types