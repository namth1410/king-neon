FROM node:22.14.0-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN pnpm add -g turbo
COPY . .
RUN turbo prune --scope=@king-neon/cms --docker

FROM base AS installer
RUN apk add --no-cache libc6-compat build-base gcc autoconf automake zlib-dev libpng-dev nasm bash vips-dev git
WORKDIR /app

COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install

COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
ENV NODE_ENV=production
RUN pnpm turbo run build --filter=@king-neon/cms...

# Deploy the pruned workspace to a separate directory to get a clean node_modules
RUN pnpm deploy --filter=@king-neon/cms --prod /app/deployed

FROM base AS runner
RUN apk add --no-cache vips-dev
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 strapi

COPY --from=installer --chown=strapi:nodejs /app/deployed .
COPY --from=installer --chown=strapi:nodejs /app/apps/cms/public ./public
COPY --from=installer --chown=strapi:nodejs /app/apps/cms/favicon.png ./favicon.png

ENV NODE_ENV=production
USER strapi
CMD ["npm", "run", "start"]
