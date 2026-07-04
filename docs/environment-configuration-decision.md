# Principal Software Engineer Environment Configuration Decision

Status: accepted

Date: 2026-07-04

## Context

This record captures the principal software engineer decision for local
environment configuration in the AIVIS prototype.

The current runtime has two local surfaces:

- a FastAPI backend with deterministic fixture endpoints;
- a Next.js Evidence Workbench frontend that resolves backend access
  server-side.

The prototype does not currently have a database, external service credentials,
browser runtime-config generation, multiple deployed frontend apps or local
secret material that needs to be represented in a developer environment file.

## Decision

Do not require `.env`, `.env.local` or any other local environment file for the
current AIVIS runtime.

Keep local runtime defaults in code, scripts and Compose where they are already
clear and safe:

- backend container defaults live in `backend/Dockerfile`;
- Compose owns local backend and frontend host-port defaults;
- Compose injects the internal `AIVIS_BACKEND_ORIGIN` value for the frontend
  container;
- test and smoke scripts provide their own local URL defaults;
- the frontend must not expose backend origins through `NEXT_PUBLIC_*`
  variables.

Local `.env*` files remain ignored. If future local overrides become useful,
add a committed `.env.example` with browser-safe, non-secret values only. Do
not add a committed real `.env` or `.env.local`.

## Options Considered

Option 1: require `.env.local` for all local development.

- Pros: familiar convention for many frontend projects.
- Cons: adds a configuration file that the current runtime does not need;
  encourages developers to look for local secrets; can blur the server-only
  backend-origin boundary.

Option 2: add `.env.example` now.

- Pros: discoverable list of optional override names.
- Cons: mostly repeats defaults already present in Docker, scripts and docs;
  risks making optional values look mandatory.

Option 3: keep no env file requirement and document the decision.

- Pros: lowest configuration surface; fewer secret-handling mistakes; keeps
  backend origin handling server-side; makes local smoke and Docker commands
  work from checked-in defaults.
- Cons: developers must read the Docker or app README when they want optional
  port overrides.

## Main Reason

Choose option 3 because AIVIS should stay small and explicit until it has a
real need for environment-file-driven configuration.

The most important security boundary is that backend origins and privileged
runtime settings stay server-side. Requiring a local env file now would add
process without improving runtime proof.

## Consequences

- `pnpm docker:config`, `pnpm docker:up`, `pnpm docker:smoke` and the local E2E
  wrapper should continue to work without copying an env file.
- Local port overrides can still be passed as shell environment variables when
  needed.
- Production-like frontend runs still require an explicitly provided
  server-side backend origin or an explicitly selected mock mode.
- No secret values should be introduced into source, Docker build args,
  browser bundles or public documentation.
- A future `.env.example` is acceptable only when it documents optional,
  non-secret local overrides and does not introduce browser-visible backend
  configuration.

