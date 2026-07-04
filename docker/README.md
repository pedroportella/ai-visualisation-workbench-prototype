# Docker

Docker support is for local release-runtime rehearsal only. It does not create
cloud resources, deployment infrastructure, secrets, auth, a database or a
production platform.

## Backend Image

Build the backend image from the repo root:

```text
docker build -f backend/Dockerfile -t aivis-backend:local backend
```

Run the backend container:

```text
docker run --rm --name aivis-backend-smoke -p 8080:8000 aivis-backend:local
```

Then smoke the health, readiness and metadata endpoints from the repo root:

```text
backend/.venv/bin/python scripts/local-backend-smoke.py --base-url http://127.0.0.1:8080
```

The container uses the backend server settings `AIVIS_BACKEND_HOST` and
`AIVIS_BACKEND_PORT`.

## Full Local Runtime

Build and run both local containers from the repo root:

```text
pnpm docker:config
pnpm docker:build
pnpm docker:up
```

The compose runtime exposes:

```text
frontend: http://127.0.0.1:3200/evidence-workbench
backend:  http://127.0.0.1:8080/health/live
```

The exposed host ports can be overridden with `AIVIS_BACKEND_HOST_PORT` and
`AIVIS_WORKBENCH_HOST_PORT`; the smoke script defaults to `8080` and `3200`.

The frontend container runs the production Next.js standalone server. Its
server-only backend origin is set to `http://backend:8000` inside the compose
network and must not be exposed through `NEXT_PUBLIC_*` variables.

Smoke the full local runtime:

```text
pnpm docker:smoke
```

The full smoke checks backend health, fixture endpoints, local review-action
state, all five Evidence Workbench routes and that rendered HTML does not leak
the backend origin or fallback fixture marker.

Stop the local containers:

```text
pnpm docker:down
```
