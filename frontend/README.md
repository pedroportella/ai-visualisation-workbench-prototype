# Frontend

The frontend follows this monorepo layout:

```text
frontend/apps/*
frontend/packages/*
```

The first app should expose the Evidence Workbench. Shared packages should hold
AIVIS-local adapters, tokens, assets, services and utilities.

## Frontend Release Manifest

`frontend/package.json` is a private release manifest for the frontend runtime.
It does not make the frontend a separate repository. It gives frontend-scoped
release checks one stable command surface:

```text
pnpm --filter @aivis/frontend release:preflight
```

Use it for frontend-only or coordinated release rehearsal. Backend release
checks remain owned by the backend package and runtime scripts.
