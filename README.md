# SafeMate Frontend

React-based frontend application for SafeMate blockchain document storage platform.

## Environment Structure

- dev - Development environment
- preprod - Pre-production environment  
- main - Production environment

## Development

`ash
npm install
npm run dev
`

## Deployment

Each branch automatically deploys to its corresponding environment:
- dev branch → Development S3 bucket
- preprod branch → Pre-production S3 bucket
- main branch → Production S3 bucket

## Environment Configuration

Environment-specific configurations are in the environments/ directory.
