# syntax=docker/dockerfile:1

# -------------------------------------------------------------
# Stage 1: Build Web Artifacts
# -------------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@10.34.7 --activate

# Copy root dependency manifests
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./

# Copy workspace package manifests
COPY packages/parser-core/package.json ./packages/parser-core/
COPY packages/parser-core/tsconfig.json ./packages/parser-core/
COPY packages/device-specs/package.json ./packages/device-specs/
COPY packages/device-specs/tsconfig.json ./packages/device-specs/
COPY apps/explorer/package.json ./apps/explorer/
COPY apps/explorer/tsconfig.json ./apps/explorer/
COPY apps/explorer/tsconfig.app.json ./apps/explorer/
COPY apps/explorer/tsconfig.node.json ./apps/explorer/

# Install workspace dependencies
RUN pnpm install --frozen-lockfile

# Copy package source code
COPY packages/parser-core ./packages/parser-core
COPY packages/device-specs ./packages/device-specs
COPY apps/explorer ./apps/explorer
COPY nginx.conf ./nginx.conf

# Build packages and explorer application for web target
ENV VITE_TARGET=web
RUN pnpm --filter @chci/parser-core build && \
    pnpm --filter @chci/device-specs build && \
    pnpm --filter @chci/explorer build

# -------------------------------------------------------------
# Stage 2: Serve Web Application with Endured Nginx
# -------------------------------------------------------------
FROM nginx:alpine-slim AS runner

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy build artifacts and custom nginx configuration
COPY --from=builder /app/apps/explorer/dist /usr/share/nginx/html
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf

# Expose standard HTTP port
EXPOSE 80

# Basic container health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1/ || exit 1

# Launch nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
