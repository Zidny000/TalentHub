# CI/CD Pipeline with GitHub Actions and Render

This repository uses GitHub Actions for continuous integration and continuous deployment (CI/CD) in conjunction with Render for hosting the application.

## Workflow Overview

The CI/CD pipeline consists of two main jobs:

1. **Test**: Runs on every push to the `main` branch and on all pull requests.
   - Sets up PostgreSQL and Redis services
   - Installs dependencies
   - Generates Prisma client
   - Runs database migrations
   - Executes linting
   - Runs tests

2. **Deploy**: Runs only when code is pushed to the `main` branch and tests pass.
   - Triggers a deployment on Render using their Deploy Hook API
   - Waits for the deployment to complete

## Required Secrets

To use this workflow, you need to add the following secrets to your GitHub repository:

- `RENDER_SERVICE_ID`: The ID of your service on Render
- `RENDER_API_KEY`: Your API key for Render

## How to Set Up Secrets

1. Go to your repository on GitHub
2. Click on "Settings"
3. In the left sidebar, click on "Secrets and variables" → "Actions"
4. Click on "New repository secret"
5. Add both required secrets

## Render Configuration

This setup assumes you have already:

1. Created a service on Render
2. Connected it to your GitHub repository
3. Configured the necessary environment variables on Render

## Additional Notes

- The test environment uses PostgreSQL and Redis services spun up as Docker containers
- The workflow is configured to run tests in parallel for faster execution
- Linting errors will not stop the deployment, but they will be reported