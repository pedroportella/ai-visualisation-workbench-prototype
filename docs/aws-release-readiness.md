# AWS Release Readiness

This note describes how the AIVIS prototype should be prepared for a short,
review-only AWS release. It is readiness documentation only.

No live AWS deployment has been run for this repository, and this document is
not evidence that AWS infrastructure, production platform operation, live
retrieval or production AI services exist.

## Current Release Anchors

The current prototype can support a future review release with these local
anchors:

- a FastAPI backend with health, readiness, metadata and deterministic fixture
  endpoints;
- a backend Docker image for local container smoke checks;
- a private backend release orchestration manifest for backend-scoped checks;
- a Next.js Evidence Workbench app with server-only backend origin handling;
- a frontend Docker image and local compose runtime for coordinated container
  rehearsal;
- a private frontend release manifest for frontend-scoped checks;
- deterministic fallback fixture behaviour if the backend is unavailable;
- local review-action state that resets with the running process;
- public-safe docs that state the synthetic-data and non-official-system
  boundary.

## Required Local Gates

Before any AWS account action, run the local checks that match the release
scope:

```text
pnpm --filter @aivis/backend release:preflight
backend/.venv/bin/python scripts/local-backend-smoke.py
docker build -f backend/Dockerfile -t aivis-backend:local backend
backend/.venv/bin/python scripts/local-backend-smoke.py --base-url http://127.0.0.1:8080
pnpm --filter @aivis/workbench check
pnpm --filter @aivis/ui-library check
pnpm --filter @aivis/frontend release:preflight
pnpm docker:build
pnpm docker:up
pnpm docker:smoke
pnpm docker:down
pnpm check
git diff --check
```

Use no-screenshot route checks while the screenshot pause is active:

```text
/evidence-workbench
/evidence-workbench/review
/evidence-workbench/sources
/evidence-workbench/process
/evidence-workbench/audit
```

## Monorepo Release Tracks

This repository is a monorepo, so a shared commit can contain backend code,
frontend code and shared release documentation. Release evidence should identify
which runtime is being promoted:

- backend API release: the FastAPI package, backend runtime image if one is
  produced, API health and fixture smoke evidence;
- frontend release: the Next.js Evidence Workbench app and the local
  frontend packages it consumes, web build/route evidence and the backend
  release it was tested against;
- coordinated review baseline: backend and frontend releases promoted together
  for a single reviewer-facing baseline.

Separated component releases should use distinct release names or tags, for
example:

```text
backend-v0.1.0-rc.1
frontend-v0.1.0-rc.1
```

Use a plain `v0.1.0-rc.1` or `v0.1.0` tag only for a coordinated review
baseline where backend and frontend proof are both complete and compatible.

Backend-only releases should prove the API contract remains compatible with the
target web runtime. Frontend-only releases should record the backend release or
review runtime they were checked against. Contract, fixture or backend-origin
changes should be treated as coordinated releases.

The backend folder has a private release orchestration manifest at
`backend/package.json`. Use `pnpm --filter @aivis/backend release:preflight` for
backend-scoped release rehearsal. The backend Python package name, version and
dependencies remain owned by `backend/pyproject.toml`.

The frontend folder has a private release manifest at `frontend/package.json`.
Use `pnpm --filter @aivis/frontend release:preflight` for frontend-scoped release
rehearsal.

## Future Review Release Shape

The first live review release should be short-lived and explicitly approved
before any AWS account action.

The likely release shape is:

- one backend API runtime exposing the health, metadata and fixture endpoints;
- one web runtime serving the Evidence Workbench routes;
- server-only backend origin configuration for the web runtime;
- redacted logs and smoke results captured before teardown;
- a public-safe release note that explains what passed and what was not
  claimed.

The exact AWS service choices, routing, secrets, budget controls and teardown
steps are still pending. They must be decided before live deployment.

## Evidence Model

Public-safe release evidence should include:

- release track: backend API, frontend or coordinated baseline;
- smoke timeline with timestamps and pass/fail status;
- local verification summary;
- backend health, readiness and metadata summary;
- Evidence Workbench route summary;
- fixture API and review-action behaviour summary;
- compatibility target for separated component releases;
- redacted runtime log snippets only where useful;
- teardown confirmation after the review window.

Private evidence may include exact commands, internal URLs, account-specific
resource identifiers and image digests. Do not publish those values.

## Not Claimed

The AWS release path must not claim:

- real TMR data;
- official TMR or Queensland Government system status;
- QChat integration;
- production RAG, GraphRAG, Bedrock, Neo4j or live retrieval;
- production platform operation, high availability or formal assurance;
- source-system writeback;
- production audit logging;
- live operational transport events.

The prototype remains a simulated evidence workbench for reviewing
source-backed AI guidance before it is used.

## Teardown Boundary

The review release should be destroyed after proof and any short reviewer
window. Public evidence can record a redacted teardown summary, but should not
publish raw account ids, hostnames, secret names or resource identifiers.
