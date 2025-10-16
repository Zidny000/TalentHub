FROM node:18-alpine

# Install dependencies needed for wait-for-it script and build tools
RUN apk add --no-cache bash curl postgresql-client

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Generate Prisma client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy scripts and make them executable
COPY wait-for-it.sh docker-entrypoint.sh ./
RUN chmod +x ./wait-for-it.sh ./docker-entrypoint.sh

# Copy app source
COPY . .

# Build the app for production
RUN npm run build

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/server.js"]