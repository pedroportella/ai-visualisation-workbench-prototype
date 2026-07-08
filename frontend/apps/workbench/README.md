# Workbench App

Next.js App Router application for the AI Visualisation Workbench prototype.

The app opens the Evidence Workbench at `/evidence-workbench` and uses local
synthetic fixture content through the shared `@aivis/services` package.
Backend origin configuration is server-only and owned by
`@aivis/services/server`. If the backend fixture API is unavailable, the route
renders a local fallback state and labels it as fallback data.

Use this app's `.env.example` only for frontend-only fixture mode. Repository
root `.env.example` documents optional full-stack overrides. Do not expose
backend origin settings through browser-visible variables.

The source shape is intentionally simple and reviewable:

```text
AppShell/
components/
services/EvidenceWorkbenchQueryState.ts
```

`components/` is grouped by product responsibility: answer, audit, evidence,
overview, process, review, sources and warnings. Route helpers and local review
state sit under `components/shared/` and `components/state/`.
`components/evidence/EvidenceWorkbenchQueryProvider/` supplies the small
TanStack Query client boundary used by the Evidence Workbench.

App and route styles use SCSS entrypoints. Reusable theme styling comes from
`@aivis/ui-library/theme.scss`.
`pnpm guard:app-naming` keeps app shell, component TSX/SCSS modules and
workbench service boundary files in the current path shape.

Useful commands from the repository root:

```text
pnpm --filter @aivis/workbench dev
pnpm --filter @aivis/workbench check
pnpm --filter @aivis/workbench build
```

The production workbench can also run in the local Docker Compose rehearsal
runtime:

```text
pnpm docker:config
pnpm docker:build
pnpm docker:up
pnpm docker:smoke
pnpm docker:down
```

The container uses Next.js standalone output and reads
server-side runtime configuration through `@aivis/services/server`. The Docker
smoke checks that rendered HTML and browser-visible static assets stay free of
backend origins, private labels, local paths and fallback-only fixture markers.
