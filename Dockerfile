FROM oven/bun:latest as base

ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

WORKDIR /app

# --- Dependencies Stage ---
FROM base AS deps
WORKDIR /app
COPY bun.lockb .
COPY package.json .
COPY server/package.json ./server/
RUN bun install --frozen-lockfile --all # Ensure all workspace dependencies are installed for build steps

# --- Builder Stage (Frontend Build Only) ---
FROM base AS builder
WORKDIR /app
# Copy only necessary files for the frontend build
COPY --from=deps /app/node_modules ./node_modules
COPY package.json bun.lockb ./
COPY tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY vite.config.ts tailwind.config.ts postcss.config.js ./
COPY index.html ./
COPY src ./src
COPY public ./public
COPY components.json ./components.json
# If shared types/code are DIRECTLY imported by frontend build (not as a workspace dep resolved via node_modules), copy it too:
# COPY shared ./shared
RUN bun run build # Build frontend

# --- Runner Stage ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install production dependencies for the root project (if any)
COPY package.json bun.lockb ./
RUN bun install --production --frozen-lockfile # Uses root package.json & bun.lockb

# Install production dependencies for the server
COPY server/package.json server/bun.lockb ./server/
WORKDIR /app/server
RUN bun install --production --frozen-lockfile # Uses server/package.json & server/bun.lockb
WORKDIR /app # Reset WORKDIR to /app for subsequent COPY and CMD

# Copy necessary source code for backend runtime
COPY server ./server
COPY shared ./shared

# Copy built frontend assets from builder stage
COPY --from=builder /app/dist ./public_html

EXPOSE 8080
# Use array form for CMD and ensure server entry point is correct
CMD ["bun", "run", "server/src/index.ts"]
