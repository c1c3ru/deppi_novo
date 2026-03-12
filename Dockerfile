# Multi-stage build for optimized production image
FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Build stage
FROM base AS builder
WORKDIR /app

# Copy all source files
COPY . .

# Install all dependencies (including dev)
RUN npm ci

# Build Angular application
RUN npm run build:prod

# Build backend
WORKDIR /app/backend
RUN npm ci && npm run build

# Production stage
FROM base AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built frontend
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist

# Copy built backend
COPY --from=builder --chown=nextjs:nodejs /app/backend/dist ./backend/dist
COPY --from=builder --chown=nextjs:nodejs /app/backend/node_modules ./backend/node_modules
COPY --from=builder --chown=nextjs:nodejs /app/backend/package.json ./backend/

# Copy production dependencies
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=nextjs:nodejs /app/package.json ./

# Copy other necessary files
COPY --from=builder --chown=nextjs:nodejs /app/.env.example /app/.env
COPY --from=builder --chown=nextjs:nodejs /app/nginx.conf /etc/nginx/nginx.conf

# Install nginx for serving frontend
RUN apk add --no-cache nginx

# Create nginx directories
RUN mkdir -p /var/cache/nginx /var/log/nginx /var/run

# Set correct permissions
RUN chown -R nextjs:nodejs /var/cache/nginx /var/log/nginx /var/run

# Copy and set permissions on entrypoint BEFORE switching to non-root user
COPY --from=builder --chown=nextjs:nodejs /app/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Switch to non-root user
USER nextjs

# Expose ports
EXPOSE 80 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "run", "start"]
