# syntax=docker/dockerfile:1
# Productie-image voor DigiPlein (Next.js 16 standalone). Deploy: scrum4me-srv,
# achter Caddy op digiplein.jp-visser.nl, DB op de main-Postgres.

# --- deps: dependencies installeren (postinstall draait prisma generate) ---
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci

# --- builder: de standalone build maken ---
FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build-time dummy-env: lib/env valideert DATABASE_URL/SESSION_SECRET bij het builden
# (routes importeren lib/db -> lib/env). Geen echte DB nodig om te builden.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public"
ENV SESSION_SECRET="build-time-placeholder-secret-min-32chars"
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate && npm run build

# --- runner: minimale runtime ---
FROM node:22-alpine AS runner
WORKDIR /app
RUN apk add --no-cache libc6-compat msmtp \
  && ln -sf /usr/bin/msmtp /usr/sbin/sendmail
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN addgroup -g 1001 -S nodejs && adduser -u 1001 -S nextjs -G nodejs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Prisma-client (driver-adapter pg → geen query-engine-binary nodig, wel de
# gegenereerde client). prisma/ meegekopieerd voor evt. migrate-stappen.
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/prisma ./prisma
USER nextjs
EXPOSE 3000
# server.js is het standalone-entrypoint van Next.
CMD ["node", "server.js"]
