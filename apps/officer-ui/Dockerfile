FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json turbo.json ./
COPY packages/ ./packages/
COPY apps/officer-ui/ ./apps/officer-ui/

RUN npm ci --workspace=@landstack/officer-ui --workspace=@landstack/shared
RUN npm run build --workspace=@landstack/shared
RUN npm run build --workspace=@landstack/officer-ui

# ── Serve with Nginx ─────────────────────────────────────────────
FROM nginx:alpine
COPY --from=builder /app/apps/officer-ui/dist /usr/share/nginx/html

# SPA fallback: serve index.html for all routes
RUN echo 'server { listen 80; root /usr/share/nginx/html; location / { try_files $uri /index.html; } location /api { proxy_pass http://backend:3000; } }' > /etc/nginx/conf.d/default.conf

EXPOSE 80
