# Multi-stage production Dockerfile for Absolutely No Baby Inventory
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first for Docker cache optimization
COPY package*.json ./
RUN npm ci

# Copy source and build production bundle
COPY . .
RUN npm run build

# Production runtime stage
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Install minimal production server
RUN npm install -g serve

# Copy compiled assets from builder
COPY --from=builder /app/dist ./dist

# Non-root security user (Public Cloud Security Standard)
USER node

EXPOSE 3000

# Healthcheck for container orchestration
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["serve", "-s", "dist", "-l", "3000"]
