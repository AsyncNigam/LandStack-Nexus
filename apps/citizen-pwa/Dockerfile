FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json turbo.json ./
COPY packages/ ./packages/
COPY apps/citizen-pwa/ ./apps/citizen-pwa/

RUN npm ci --workspace=@landstack/citizen-pwa --workspace=@landstack/shared
RUN npm run build --workspace=@landstack/shared
RUN npm run build --workspace=@landstack/citizen-pwa

# ── Serve with Nginx ─────────────────────────────────────────────
FROM nginx:alpine
COPY --from=builder /app/apps/citizen-pwa/dist /usr/share/nginx/html

# SPA fallback + API reverse proxy
RUN echo 'server { listen 80; root /usr/share/nginx/html; location / { try_files $uri /index.html; } location /api { proxy_pass http://backend:3000; } }' > /etc/nginx/conf.d/default.conf

EXPOSE 80
