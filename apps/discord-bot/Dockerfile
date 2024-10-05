# Adjust NODE_VERSION as desired
ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-slim AS base

# Install pnpm
ARG PNPM_VERSION=8.14.3
RUN npm install -g pnpm@$PNPM_VERSION

# Install packages needed for deployment
RUN apt-get update -qq && \
    apt-get install -y openssl

FROM base AS builder

# Set working directory
WORKDIR /app
RUN npm install -g turbo
COPY . .

# Generate a partial monorepo with a pruned lockfile for a target workspace.
RUN turbo prune discord-bot --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install -y build-essential pkg-config python-is-python3

# Install node modules
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY .npmrc .npmrc
RUN pnpm install --frozen-lockfile --prod=false

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

RUN pnpm turbo db:gen
RUN pnpm turbo build --filter=discord-bot...

# Remove development dependencies
RUN pnpm prune --prod

# Final stage for app image
FROM docker.io/oven/bun:1.1-slim AS runner

WORKDIR /app

# Don't run production as root
# RUN addgroup --system --gid 1001 docker
# RUN adduser --system --uid 1001 docker
# USER docker

# Copy built application
COPY --from=installer /app .

# Start the server by default, this can be overwritten at runtime
CMD [ "sh", "-c", "cd ./apps/discord-bot && bun run bun:start" ]
