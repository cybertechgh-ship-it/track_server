FROM node:20-alpine AS builder

# Build tools for native modules
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production=false

COPY . .

# Compile TypeScript → dist/
RUN npm run build

# ──────────────────────────────────────────────
FROM node:20-alpine AS runner

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

# Copy compiled output
COPY --from=builder /app/dist ./dist

# Ensure upload directories exist
RUN mkdir -p uploads/vehicles uploads/drivers

EXPOSE 9040

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
