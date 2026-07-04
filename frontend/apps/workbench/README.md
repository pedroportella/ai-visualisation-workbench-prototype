# Workbench App

Next.js App Router application for the AI Visualisation Workbench prototype.

The app opens the Evidence Workbench at `/evidence-workbench` and uses local
synthetic fixture content through the local backend fixture API. Backend origin
configuration is server-only:

```text
AIVIS_BACKEND_ORIGIN=http://127.0.0.1:8000
```

If the backend fixture API is unavailable, the route renders a bundled fallback
state and labels it as fallback data. Do not expose backend origin settings
through `NEXT_PUBLIC_*` variables.

The route follows an app-shell plus app-owned component split:

```text
app-shell/
components/evidence-workbench/
```

App and route styles use SCSS entrypoints. Reusable theme styling comes from
`@aivis/ui-library/theme.scss`.

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
`AIVIS_BACKEND_ORIGIN` server-side. The Docker smoke checks that rendered HTML
and browser-visible static assets stay free of backend origins, private labels,
local paths and fallback-only fixture markers.
