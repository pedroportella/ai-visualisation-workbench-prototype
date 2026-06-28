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

The route follows the workbench app-shell and container split:

```text
app-shell/
containers/evidence-workbench/
```

App and route styles use SCSS entrypoints. Reusable theme styling comes from
`@aivis/ui-library/theme.scss`.

Useful commands from the repository root:

```text
pnpm --filter @aivis/workbench dev
pnpm --filter @aivis/workbench check
pnpm --filter @aivis/workbench build
```
