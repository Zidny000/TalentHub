#!/bin/sh
set -e

echo "Checking if PostgreSQL is ready..."
# Try a simpler approach using pg_isready
for i in $(seq 1 30); do
  pg_isready -h db -p 5432 -U postgres && break
  echo "Waiting for PostgreSQL to become available... $i/30"
  sleep 2
done

echo "Checking if Redis is ready..."
# Use redis-cli directly which is more reliable
for i in $(seq 1 15); do
  if redis-cli -h redis ping | grep -q PONG; then
    echo "Redis is up!"
    break
  fi
  echo "Waiting for Redis to become available... $i/15"
  sleep 2
done

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