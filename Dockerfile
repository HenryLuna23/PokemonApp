# ===================================================
# Stage 1: Build Angular application
# ===================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Enable Corepack and activate pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package manifests and lockfile
COPY package.json pnpm-lock.yaml ./

# Install dependencies (approving needed native builds)
RUN pnpm install --frozen-lockfile

# Copy application source code
COPY . .

# Compile optimized Angular production bundle
RUN pnpm build

# ===================================================
# Stage 2: Serve with lightweight Nginx Alpine
# ===================================================
FROM nginx:alpine

# Remove default Nginx placeholder files
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled SPA bundle from builder stage
COPY --from=builder /app/dist/PokemonApp/browser /usr/share/nginx/html

# Copy custom Nginx config with HTML5 routing and gzip
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
