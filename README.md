# TalentHub - Recruitment and Job Application Platform

A comprehensive platform for job postings, applications, interviews, and job offers.

## Docker Setup

TalentHub can be run easily using Docker. Follow the steps below to get started.

### Prerequisites

- Docker and Docker Compose installed on your machine
- Git (to clone the repository)

### Getting Started with Docker

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd TalentHub
   ```

2. Start the Docker containers:
   ```bash
   docker-compose up -d
   ```

   For development with hot-reloading:
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

3. Access the application:
   - API: http://localhost:3000
   - PgAdmin (Database Management): http://localhost:5050
     - Email: admin@talenthub.com
     - Password: admin

4. Stop the containers:
   ```bash
   docker-compose down
   ```

   To remove volumes as well:
   ```bash
   docker-compose down -v
   ```

### Environment Variables

The Docker setup uses the `.env.docker` file for environment variables. Modify this file to customize your setup.

### Database Access via pgAdmin

1. Access pgAdmin at http://localhost:5050
2. Login with the credentials above
3. Add a new server:
   - Name: TalentHub
   - Host: db (Docker service name)
   - Port: 5432
   - Database: talenthub
   - Username: postgres
   - Password: postgres