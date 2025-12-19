# Stage 1: Build the frontend
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production image
FROM node:20-alpine
ENV TZ=Asia/Bangkok
RUN apk add --no-cache tzdata && \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone

WORKDIR /app

# Create app directory and set permissions
RUN mkdir -p /app/imgcar && chown -R node:node /app

# Copy package files with correct ownership
COPY --chown=node:node package*.json ./

# Switch to non-root user
USER node

# Install production dependencies
RUN npm install --only=production

# Copy built frontend assets
COPY --chown=node:node --from=builder /app/dist ./dist

# Copy backend code
COPY --chown=node:node --from=builder /app/server ./server

# Expose the port the app runs on
EXPOSE 3210

# Start the application
CMD ["npm", "run", "start"]
