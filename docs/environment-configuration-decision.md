# Principal Software Engineer Environment Configuration Decision

Status: accepted, amended with optional templates

Date: 2026-07-04

Updated: 2026-07-08

## Context

This record captures the principal software engineer decision for local
environment configuration in the AIVIS prototype.

The current runtime has two local surfaces:

- a FastAPI backend with deterministic fixture endpoints;
- a Next.js Evidence Workbench frontend that resolves backend access
  server-side.

The prototype does not currently have a database, external service credentials,
browser runtime-config generation, multiple deployed frontend apps or local
secret material that needs to be represented in a required developer
environment file.

## Decision

Do not require local environment-file setup for the current AIVIS runtime.
Provide committed `.env.example` templates only as optional, non-secret
guidance for local overrides.

Keep local runtime defaults in code, scripts and Compose where they are already
clear and safe:

- backend container defaults live in `backend/Dockerfile`;
- Compose owns local backend and frontend host-port defaults;
- Compose injects the internal `AIVIS_BACKEND_ORIGIN` value for the frontend
  container;
- test and smoke scripts provide their own local URL defaults;
- the frontend must not expose backend origins through `NEXT_PUBLIC_*`
  variables.

Local environment files remain ignored. The committed templates document
frontend mock mode, backend-mode selection, local host-port overrides and the
server-side backend origin variable. Do not commit real local env files.

## Options Considered

Option 1: require local environment-file setup for all local development.

- Pros: familiar convention for many frontend projects.
- Cons: adds a configuration file that the current runtime does not need;
  encourages developers to look for local secrets; can blur the server-only
  backend-origin boundary.

Option 2: add `.env.example` now.

- Pros: discoverable list of optional override names.
- Cons: can make optional values look mandatory unless the template is clear
  that no local secret file is required.

Option 3: keep no env file requirement and document the decision.

- Pros: lowest configuration surface; fewer secret-handling mistakes; keeps
  backend origin handling server-side; makes local smoke and Docker commands
  work from checked-in defaults.
- Cons: developers must read the Docker or app README when they want optional
  port overrides.

## Main Reason

Choose option 3 with optional templates because AIVIS should stay small and
explicit while making server-side runtime switches discoverable.

The most important security boundary is that backend origins and privileged
runtime settings stay server-side. Requiring a local env file would add
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
- The committed `.env.example` files document optional, non-secret local
  overrides and do not introduce browser-visible backend configuration.
