FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# ==========================================
# Bağımlılıklar (Deps)
# ==========================================
FROM base AS deps
WORKDIR /app

# Sadece monorepo kök ve package.json dosyalarını kopyala (önbellek için)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
# Tüm package.json dosyalarını koruyarak kopyala
COPY packages/*/package.json ./packages/*/
COPY apps/dashboard/package.json ./apps/dashboard/

# Yalnızca Dashboard'un bağımlı olduğu paketleri kur
RUN pnpm install --frozen-lockfile --filter=@saferide/dashboard...

# ==========================================
# Build
# ==========================================
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
# Tüm kaynak kodunu kopyala
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV DOCKER_BUILD=true

# Dashboard uygulamasını build et
RUN pnpm --filter @saferide/dashboard build

# ==========================================
# Production Runner
# ==========================================
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Public dosyalarını kopyala
COPY --from=builder /app/apps/dashboard/public ./public

# Standalone build çıktılarını kopyala (Next.js output: 'standalone' aktif olmalı)
COPY --from=builder --chown=nextjs:nodejs /app/apps/dashboard/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/dashboard/.next/static ./apps/dashboard/.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Standalone kopyalandığı klasör dizilimi: /app/apps/dashboard/server.js
CMD ["node", "apps/dashboard/server.js"]
