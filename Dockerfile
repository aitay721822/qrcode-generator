# Use Node.js 25 as base image
FROM node:25-alpine AS base

# Set working directory
WORKDIR /app

# Set standalone mode for Docker build
ENV STANDALONE=true

# Copy package files and env
COPY package.json ./

# Install dependencies using npm (to avoid pnpm build script issues)
RUN npm install

# Copy source code
COPY . .

# Build the application using npm
RUN npm run build

# Production stage
FROM node:25-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Copy built application from base stage
COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static
COPY --from=base /app/public ./public

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
