FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build the React app
RUN npm run build

# ──────────────────────────────────────────────
FROM nginx:alpine AS runner

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx config: serve SPA and proxy /api → backend
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 9041

CMD ["nginx", "-g", "daemon off;"]
