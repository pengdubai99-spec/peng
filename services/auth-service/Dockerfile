FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile || pnpm install

# Generate Prisma client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source
COPY . .

# Build
RUN pnpm build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app

COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/package.json ./

EXPOSE 3001

CMD ["node", "dist/main"]
