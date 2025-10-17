FROM node:20-alpine

# Install dependencies needed for wait-for-it script, build tools, and native modules
RUN apk add --no-cache bash curl postgresql-client python3 make g++ netcat-openbsd redis

# Create app directory
WORKDIR /app

# Install dependencies and rebuild bcrypt
COPY package*.json ./
RUN npm install
RUN npm rebuild bcrypt --build-from-source

# Generate Prisma client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy app source first
COPY . .

# Copy scripts
COPY wait-for-it.sh docker-entrypoint.sh ./
RUN chmod +x ./wait-for-it.sh ./docker-entrypoint.sh

# Build the app for production
RUN npm run build
RUN npm run serve

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/server.js"]