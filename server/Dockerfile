# =============================================================================
# Exyconn Workboard Server - Multi-stage Dockerfile
# Service: workboard-server | Port: 4011 | Domain: workboard-api.exyconn.com
# Build: Node16 moduleResolution fix - Feb 2026
# =============================================================================

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json ./
RUN rm -f package-lock.json && npm install --legacy-peer-deps --include=optional

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json tsconfig.json ./
COPY src ./src
RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS production
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    mkdir -p /app/logs && \
    chown -R nodejs:nodejs /app

# Copy production files
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./
RUN npm install --omit=dev --legacy-peer-deps && npm cache clean --force

USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget -q --spider http://127.0.0.1:4011/health || exit 1

EXPOSE 4011

ENV NODE_ENV=production
ENV PORT=4011

CMD ["node", "dist/index.js"]
