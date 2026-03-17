FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

# Monorepo kök bağımlılıkları
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile || pnpm install

# Prisma
COPY prisma ./prisma
RUN npx prisma generate

# Kaynak kodu
COPY . .
RUN pnpm build

# Production
FROM node:20-alpine AS production
WORKDIR /app

COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/package.json ./

EXPOSE 3002

CMD ["node", "dist/main"]
