# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build the application
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built assets
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy data directories and config directly from build context (more reliable than --from=builder)
COPY data ./data
COPY birthday.config.json ./birthday.config.json

# Copy startup script (handles symlinks to persistent volume on every boot)
COPY scripts/start.sh ./start.sh
RUN chmod +x ./start.sh

# Create placeholder dirs (will be replaced by symlinks to /app/storage on start)
# /app/storage is where the Railway Volume should be mounted
RUN mkdir -p public/uploads public/voice-notes public/original_images data/wishes storage && \
    chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

# Use startup script so persistent volume symlinks are set up before server starts
CMD ["sh", "/app/start.sh"]

