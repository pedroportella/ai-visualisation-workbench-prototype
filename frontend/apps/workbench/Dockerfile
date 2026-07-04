FROM node:22-slim AS base

ENV NEXT_TELEMETRY_DISABLED=1 \
    PNPM_HOME=/pnpm
ENV PATH="${PNPM_HOME}:${PATH}"

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.18.3 --activate

FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY frontend/package.json ./frontend/package.json
COPY frontend/apps/workbench/package.json ./frontend/apps/workbench/package.json
COPY frontend/packages/services/package.json ./frontend/packages/services/package.json
COPY frontend/packages/ui-assets/package.json ./frontend/packages/ui-assets/package.json
COPY frontend/packages/ui-library/package.json ./frontend/packages/ui-library/package.json
COPY frontend/packages/ui-tokens/package.json ./frontend/packages/ui-tokens/package.json
COPY frontend/packages/utils/package.json ./frontend/packages/utils/package.json

RUN pnpm install --frozen-lockfile --filter @aivis/workbench...

FROM base AS builder

COPY --from=deps /app ./
COPY frontend ./frontend

RUN pnpm --filter @aivis/workbench build

FROM node:22-slim AS runner

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3200

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/frontend/apps/workbench/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/frontend/apps/workbench/.next/static ./frontend/apps/workbench/.next/static

USER nextjs

EXPOSE 3200

CMD ["node", "frontend/apps/workbench/server.js"]
