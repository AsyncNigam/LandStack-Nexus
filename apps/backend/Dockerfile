FROM node:20-alpine AS builder
WORKDIR /app

# Copy workspace root configs
COPY package.json package-lock.json turbo.json ./
COPY packages/ ./packages/
COPY apps/backend/ ./apps/backend/

# Install all workspace dependencies
RUN npm ci --workspace=@landstack/backend --workspace=@landstack/shared

# Build shared package first, then backend
RUN npm run build --workspace=@landstack/shared
RUN npm run build --workspace=@landstack/backend

# ── Production image ─────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/src/schema.sql ./apps/backend/dist/
COPY --from=builder /app/apps/backend/package.json ./apps/backend/
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "apps/backend/dist/index.js"]
