# ── Build stage ────────────────────────────────────────────────────────────
FROM node:20-slim AS builder

# Install build dependencies for node-canvas
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    python3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy workspace manifests
COPY package.json package-lock.json* ./
COPY packages/backend/package.json ./packages/backend/
COPY packages/frontend/package.json ./packages/frontend/

# Install all dependencies
RUN npm ci

# Copy source
COPY . .

# Build backend (TypeScript → dist/)
RUN npm run build --workspace=packages/backend

# Build frontend (Vite → dist/)
RUN npm run build --workspace=packages/frontend

# ── Runtime stage ───────────────────────────────────────────────────────────
FROM node:20-slim AS runtime

# Runtime dependencies for node-canvas (native module)
# Also include build tools for platforms without prebuilt binaries (e.g. ARM v7)
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    pkg-config \
    libcairo2 \
    libcairo2-dev \
    libpango-1.0-0 \
    libpango1.0-dev \
    libpangocairo-1.0-0 \
    libjpeg62-turbo \
    libjpeg-dev \
    libgif7 \
    libgif-dev \
    librsvg2-2 \
    librsvg2-dev \
    libpixman-1-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy workspace manifests and install production deps only
COPY package.json package-lock.json* ./
COPY packages/backend/package.json ./packages/backend/
COPY packages/frontend/package.json ./packages/frontend/

RUN npm ci --omit=dev

# Copy built artifacts
COPY --from=builder /app/packages/backend/dist  ./packages/backend/dist
COPY --from=builder /app/packages/frontend/dist ./packages/frontend/dist

# Copy fonts (mount custom fonts as a volume at /fonts if needed)
# docker run -v /path/to/fonts:/fonts maintainerr-overlay-helper:latest
COPY fonts/ ./fonts/

# Create data directory
RUN mkdir -p /data /fonts

EXPOSE 3000

ENV NODE_ENV=production \
    PORT=3000 \
    DATA_DIR=/data \
    FONTS_DIR=/fonts

CMD ["node", "packages/backend/dist/index.js"]
