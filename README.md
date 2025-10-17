# TalentHub - Recruitment and Job Application Platform

A comprehensive recruitment platform that connects employers and candidates, facilitating job postings, applications, interview scheduling, job offers, and secure payment processing.

## Project Overview

TalentHub is a robust backend system for managing the complete hiring process. The platform allows:
- Employers to post jobs, review applications, schedule interviews, and make job offers
- Candidates to create profiles, upload resumes, apply to jobs, and accept offers
- Secure messaging between employers and candidates
- Payment processing for job postings and employment payments
- Admin monitoring and management of the entire platform

## Technology Stack

- **Backend**: Node.js with Express.js and TypeScript
- **Database**: PostgreSQL with Prisma as ORM
- **Authentication**: JWT with refresh tokens and two-factor authentication
- **Caching**: Redis for performance optimization
- **Real-time Communication**: Socket.io for websocket messaging
- **Documentation**: Swagger/OpenAPI for API documentation
- **Payment Processing**: Stripe integration
- **Email Service**: Nodemailer
- **PDF Generation**: Puppeteer
- **Testing**: Jest with Supertest
- **Containerization**: Docker and Docker Compose

## Database Schema

TalentHub uses a comprehensive relational database with the following core models:

- **User**: Supports multiple roles (Admin, Employer, Candidate)
- **Job**: Job postings with detailed information
- **Application**: Job applications linking candidates to jobs
- **Resume**: Candidate resumes with experiences and skills
- **Interview**: Scheduled interviews between employers and candidates
- **JobOffer**: Formal offers made to candidates
- **Message**: Communication between platform users
- **Payment**: Payment processing for job postings
- **EmploymentPayment**: Salary and compensation payments

### Database Diagram

![TalentHub Database Schema](./talenthubdb-diagram.png)

For complete schema details, see the [Prisma Schema](./prisma/schema.prisma).

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/verify-email` - Verify email address
- `POST /api/v1/auth/two-factor/verify` - Verify two-factor code

### Jobs
- `GET /api/v1/jobs` - List all jobs
- `GET /api/v1/jobs/:id` - Get job details
- `POST /api/v1/jobs` - Create a job posting
- `PUT /api/v1/jobs/:id` - Update job details
- `DELETE /api/v1/jobs/:id` - Delete a job

### Applications
- `GET /api/v1/jobs/:jobId/applications` - List all applications for a job
- `GET /api/v1/applications` - List user's applications
- `POST /api/v1/jobs/:jobId/apply` - Apply for a job
- `PUT /api/v1/applications/:id/status` - Update application status

### Resumes
- `GET /api/v1/resumes` - List user's resumes
- `GET /api/v1/resumes/:id` - Get resume details
- `POST /api/v1/resumes` - Create a resume
- `PUT /api/v1/resumes/:id` - Update resume details
- `DELETE /api/v1/resumes/:id` - Delete a resume

### Interviews
- `GET /api/v1/interviews` - List user's interviews
- `GET /api/v1/interviews/:id` - Get interview details
- `POST /api/v1/interviews` - Schedule an interview
- `PUT /api/v1/interviews/:id` - Update interview details
- `DELETE /api/v1/interviews/:id` - Cancel an interview

### Job Offers
- `GET /api/v1/job-offers` - List job offers
- `GET /api/v1/job-offers/:id` - Get offer details
- `POST /api/v1/job-offers` - Create job offer
- `PUT /api/v1/job-offers/:id` - Update offer status
- `DELETE /api/v1/job-offers/:id` - Withdraw job offer

### Messages
- `GET /api/v1/messages` - List messages
- `GET /api/v1/messages/:id` - Get message details
- `POST /api/v1/messages` - Send a message
- `PUT /api/v1/messages/:id/status` - Update message status

### Payments
- `POST /api/v1/payments` - Create payment intent
- `GET /api/v1/payments` - List user's payments
- `POST /api/v1/payments/webhook/stripe` - Handle Stripe webhook events

## Admin Credentials

When the application starts for the first time, an admin user is automatically created with the following credentials:

**Email:** admin@talenthub.com  
**Password:** Admin123!

Use these credentials to access administrator features of the platform.

## Running Locally

### Prerequisites
- Node.js v18 or higher
- PostgreSQL 15
- Redis 7
- Stripe account for payment processing

### Local Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Zidny000/TalentHub.git
   cd TalentHub
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   # Server
   PORT=3000
   NODE_ENV=development
   
   # Database
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/talenthub?schema=public
   
   # Redis
   REDIS_URL=redis://localhost:6379
   
   # JWT
   JWT_SECRET=your_jwt_secret_here
   JWT_REFRESH_SECRET=your_refresh_token_secret_here
   JWT_EXPIRES_IN=1h
   JWT_REFRESH_EXPIRES_IN=7d
   
   # Stripe
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   
   # Email
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_USER=user@example.com
   SMTP_PASS=your_password
   EMAIL_FROM=noreply@talenthub.com
   ```

4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. (Optional) To receive Stripe webhook events locally, use the Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/v1/payments/webhook/stripe
   ```

### Running Tests

```bash
# Run all tests
npm test

# Run route tests only
npm run test:route

# Run with coverage report
npm run test:coverage
```

## Docker Setup

### Development Environment

1. Clone the repository:
   ```bash
   git clone https://github.com/Zidny000/TalentHub.git
   cd TalentHub
   ```

2. Create a `.env` file with appropriate values (see example in Local Setup section).

3. Start the development Docker environment:
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```
   This will:
   - Create a PostgreSQL database container
   - Set up a Redis cache container
   - Start pgAdmin for database management
   - Run the application in development mode with hot-reloading

4. Access the application:
   - API: http://localhost:3000
   - PgAdmin (Database Management): http://localhost:5050
     - Email: admin@talenthub.com
     - Password: admin

5. Stop the development environment:
   ```bash
   docker-compose -f docker-compose.dev.yml down
   ```

### Production Environment

1. Clone the repository:
   ```bash
   git clone https://github.com/Zidny000/TalentHub.git
   cd TalentHub
   ```

2. Create a `.env` file with production settings.

3. Start the production Docker environment:
   ```bash
   docker-compose up -d
   ```
   This will:
   - Build the application with optimized production settings
   - Create database and cache containers
   - Set up pgAdmin for database management
   - Run the application in production mode

4. Access the application:
   - API: http://localhost:3000
   - PgAdmin: http://localhost:5050 (Email: admin@talenthub.com, Password: admin)

5. Stop the production environment:
   ```bash
   docker-compose down
   ```

   To remove volumes as well (clears all data):
   ```bash
   docker-compose down -v
   ```

### Environment Variables

For both Docker environments, ensure your `.env` file contains the necessary variables as described in the Local Setup section. The Docker configurations will use these environment variables for proper setup.

### Database Access via pgAdmin

1. Access pgAdmin at http://localhost:5050
2. Login with the credentials: Email: admin@talenthub.com, Password: admin
3. Add a new server:
   - Name: TalentHub
   - Host: db (Docker service name)
   - Port: 5432
   - Database: talenthub
   - Username: postgres
   - Password: postgres

## API Documentation with Swagger

The TalentHub API is fully documented using Swagger/OpenAPI. To access the interactive documentation:

1. Start the application (locally or via Docker)
2. Navigate to `http://localhost:3000/api-docs` in your browser
3. You'll see the interactive Swagger UI with all available endpoints
4. Endpoints are grouped by tags (auth, jobs, applications, etc.)
5. You can:
   - Expand each endpoint to see details (parameters, request body schema, responses)
   - Try out endpoints directly from the UI (authenticate first for protected routes)
   - View model schemas and data structures
   - Download the OpenAPI specification

For authenticated endpoints, use the "Authorize" button and enter your JWT token in the format:
```
Bearer your_jwt_token_here
```

## CI/CD Pipeline

This project uses GitHub Actions for CI/CD pipeline integration with Render deployment:

### Workflow Overview

- **Continuous Integration**: Runs on all pull requests and pushes to the main branch
  - Linting and code quality checks
  - Unit and integration tests with PostgreSQL and Redis services
  - Prisma schema validation and migrations

- **Continuous Deployment**: Automatically deploys the application to Render when changes are pushed to the main branch
  - Zero-downtime deployments
  - Environment variable management through Render

For more details on the CI/CD setup, see the [CI/CD documentation](docs/ci-cd.md).