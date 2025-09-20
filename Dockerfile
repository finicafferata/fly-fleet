# Fly-Fleet Railway Deployment Dockerfile
# Optimized for Next.js 15 with Turbopack and Prisma

FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --legacy-peer-deps

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Install ALL dependencies (including dev dependencies) for building
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application with Turbopack
# Note: We need to disable telemetry and skip docs generation for Railway
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Create a minimal build script that skips docs if swagger tools aren't available
RUN if command -v swagger-parser >/dev/null 2>&1; then \
      npm run build; \
    else \
      echo "Skipping docs generation in production build"; \
      npx next build --turbopack; \
    fi

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma files
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/generated ./src/generated

# Copy messages for i18n
COPY --from=builder /app/messages ./messages

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Railway will provide DATABASE_URL automatically
# Run database migrations and start the application
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]