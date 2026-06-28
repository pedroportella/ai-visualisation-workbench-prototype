# Workbench App

Next.js App Router application for the AI Visualisation Workbench prototype.

The app opens the Evidence Workbench at `/evidence-workbench` and uses local
synthetic fixture content for the first shell. It does not call a backend API.

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
