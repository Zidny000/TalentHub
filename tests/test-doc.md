# TalentHub API Tests

This directory contains end-to-end tests for the TalentHub API endpoints.

## Structure

- `tests/utils/`: Contains testing utilities and helper functions
- `tests/routes/`: Contains tests for all API routes
- `tests/services/`: Contains tests for service-level functionality

## Test Files

Each route file in the `src/routes/` directory has a corresponding test file in `tests/routes/` with the same name but ending with `.test.ts`.

For example:
- `src/routes/auth.routes.ts` → `tests/routes/auth.routes.test.ts`
- `src/routes/job.routes.ts` → `tests/routes/job.routes.test.ts`

## Running Tests

To run all tests:

```bash
npm test
```

To run a specific test file:

```bash
npm test -- tests/routes/auth.routes.test.ts
```

## Test Utilities

- `test-setup.ts`: Contains common setup and teardown functions
- Helper functions for authentication, data creation, and cleanup

## Test Database

Tests use the same Prisma client but should operate on a separate test database.
Make sure your environment is properly configured to use a test database during tests.

## Authentication

Most endpoints require authentication. The tests use helper functions from `test-setup.ts` to handle login and token management.

## Mock Data

The tests create necessary data for testing, including:
- Users (admin, employer, candidate)
- Jobs
- Applications
- Interviews
- Job Offers
- Payments

## Clean Up

After each test, the database is cleaned up to ensure tests don't interfere with each other.