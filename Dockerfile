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

EXPOSE 3000

# Start the application using the dev script
CMD ["npm", "build"]
CMD ["npm", "run", "serve"]