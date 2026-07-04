# Principal Software Developer Release Orchestration Decision

Status: accepted

Date: 2026-07-04

## Context

This record captures the principal software developer decision for component
release orchestration in the AIVIS monorepo.

The prototype is a single monorepo with two separately releasable runtime
surfaces:

- a Python/FastAPI backend under `backend/`;
- a Next.js frontend under `frontend/`.

The backend and frontend should be able to move independently when a change is
limited to one runtime, while coordinated releases remain available when API
contracts, fixture shape, backend-origin handling or shared runtime
configuration changes affect both sides.

## Decision

Use private pnpm release orchestration manifests for both runtime surfaces:

- `backend/package.json` exposes `@aivis/backend` release scripts;
- `frontend/package.json` exposes `@aivis/frontend` release scripts.

Keep native package manifests as the source of truth:

- `backend/pyproject.toml` owns the Python backend package name, version and
  dependencies;
- frontend app and shared package `package.json` files own their local package
  dependencies and build settings.

The release wrapper manifests exist to make component release commands
consistent, filterable and easy to record in evidence. They do not turn the
backend into a Node.js service and they do not split the monorepo into multiple
repositories.

## Options Considered

Option 1: root-only release scripts.

- Pros: fewer files and less manifest overhead.
- Cons: backend and frontend evidence stays coupled; component-only releases
  become harder to prove; root scripts tend to grow conditional logic.

Option 2: native tooling only.

- Pros: each runtime uses only its natural ecosystem commands.
- Cons: release instructions become asymmetric; CI or local release rehearsal
  needs special-case command paths for Python and frontend packages.

Option 3: private pnpm orchestration manifests per runtime.

- Pros: `pnpm --filter @aivis/backend ...` and
  `pnpm --filter @aivis/frontend ...` give a consistent release interface;
  component tags can map cleanly to component checks; Python and frontend
  package ownership stays intact.
- Cons: adds small wrapper manifests; maintainers must avoid treating
  `backend/package.json` as Python package truth; release scripts must stay in
  sync with native backend and frontend commands.

## Main Reason

Choose option 3 because separated backend and frontend releases need a stable,
component-scoped command surface in the monorepo, but package ownership should
remain with each runtime's native tooling.

This gives the release process a clean operational interface without hiding the
fact that the backend is Python and the frontend is Next.js.

## Consequences

- Backend release rehearsal starts from
  `pnpm --filter @aivis/backend release:preflight`.
- Frontend release rehearsal starts from
  `pnpm --filter @aivis/frontend release:preflight`.
- Backend-only releases should record backend evidence and frontend contract
  compatibility.
- Frontend-only releases should record the backend release they were tested
  against.
- Coordinated releases should prove backend first, then prove frontend against
  that backend.
- Stable umbrella releases should wait until compatible backend and frontend
  release evidence exists.
