#!/bin/sh
set -e

echo "Waiting for PostgreSQL to start..."
./wait-for-it.sh db:5432 -t 60

echo "Waiting for Redis to start..."
./wait-for-it.sh redis:6379 -t 30

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# If in development mode, use nodemon
if [ "$NODE_ENV" = "development" ]; then
  echo "Starting application in development mode..."
  exec npm run dev
else
  echo "Starting application in production mode..."
  # Then exec the container's main process (what's set as CMD in the Dockerfile)
  exec "$@"
fi