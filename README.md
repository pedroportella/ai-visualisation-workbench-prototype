# AI Visualisation Workbench Prototype

This repository contains the prototype implementation for AIVIS, the AI
Visualisation Workbench: a simulated evidence review workbench for inspecting
source-backed AI guidance before it is used.

The primary product surface is the Evidence Workbench. It helps a staff
reviewer decide whether an AI-generated service-guidance answer is safe to use
by showing the answer, supporting sources, evidence gaps, process path,
warnings and local review actions in one place.

## Five-Minute Review

From the repository root:

```text
pnpm install
pnpm --filter @aivis/workbench dev
```

Open `http://127.0.0.1:3200/evidence-workbench`, then follow the route path in
[the reviewer pack](docs/reviewer-pack.md). For quick local evidence, run:

```text
pnpm test:reviewer-evidence
pnpm test:visual
```

## Reviewer Problem

AI-generated service guidance can sound confident even when the supporting
evidence is stale, weak, missing or conflicting. This prototype focuses on the
review gap between "the AI produced an answer" and "a reviewer understands why
the answer was produced, what supports it, what is unsafe and what should
happen next."

The current synthetic scenario uses recognisable Brisbane/Queensland place
anchors and simulated transport-service evidence. A reviewer inspects a draft
answer about South Brisbane station access and an accessible shuttle path,
checks source blockers and records a local action when the answer is not safe
to approve as written.

## Evidence Workbench Flow

The app is organised around one review task:

1. Arrive at `/evidence-workbench` and understand the current case.
2. Start the review at `/evidence-workbench/review`.
3. Inspect source blockers at `/evidence-workbench/sources`.
4. Read the evidence/process map at `/evidence-workbench/process`.
5. Record or reset local review state at `/evidence-workbench/audit`.

The workbench lets the reviewer inspect source-backed markdown, citations,
source records, warnings, a React Flow evidence/process map, action
availability, disabled reasons and local audit feedback.

## Screenshots

These screenshots are reviewer examples, not visual baselines. The dark
screenshots show a theme-token preview capture context, not proof of a
user-facing theme switcher.

| View | Light | Dark theme-token preview |
| --- | --- | --- |
| Overview | ![Evidence Workbench overview in the light theme](docs/screenshots/evidence-workbench-overview-light.png) | ![Evidence Workbench overview in a dark theme-token preview](docs/screenshots/evidence-workbench-overview-dark-theme-preview.png) |
| Evidence map | ![Evidence Workbench process map in the light theme](docs/screenshots/evidence-workbench-process-light.png) | ![Evidence Workbench process map in a dark theme-token preview](docs/screenshots/evidence-workbench-process-dark-theme-preview.png) |

## Implemented Technology Posture

- Frontend: Next.js App Router, React, TypeScript, local `@aivis/*` packages
  and local QHDS/QGDS-style adapters.
- Visualisation: React Flow through `@xyflow/react` for the evidence/process
  map, with a text fallback.
- Content rendering: an app-local safe markdown renderer for the fixture answer
  shape, including citations, lists, tables, code blocks and controlled
  diagram fixtures.
- State and data loading: server-only backend adapter configuration,
  deterministic fixture endpoints and local React state for simulated review
  actions.
- Backend: FastAPI health, readiness, metadata, answer, source, graph and
  review-action fixture endpoints.
- Verification: Vitest package tests, backend pytest, Playwright route and
  no-screenshot DOM/layout checks, local Docker smoke checks and public guard
  scripts.

The repository does not currently claim direct D3.js, Cytoscape.js, Mermaid,
TanStack Query, app-owned Zustand, Redux, axe, Lighthouse, WAVE, Dependabot or
Socket.dev automation.

## Prototype Boundary

- Uses synthetic transport-service-flavoured content.
- Does not use real TMR data.
- Is not an official TMR system.
- Is not connected to TMR systems.
- Is not QChat and does not claim QChat integration.
- Does not claim production RAG, GraphRAG, AWS, SSO or platform operation until
  those capabilities are implemented and verified.
- Does not implement production retrieval, graph database integration, cloud AI
  provider integration, source-system writeback or persisted multi-user review
  state.

## Repo Shape

```text
backend/   Minimal API spine first: health, metadata and fixture contracts.
docs/      Public docs, claim boundaries and reviewer-facing notes.
docker/    Local runtime and deployment helpers when needed.
frontend/  React apps and shared frontend packages.
scripts/   Repo-local verification and guard helpers.
```

This is a pnpm monorepo.

## Current Build Direction

The current local baseline focuses on a complete reviewer-facing vertical
slice: public-safe fixtures, backend contract endpoints, a front-door task
launcher, focused workbench routes, rich markdown, source traceability,
evidence/process visualisation, local review actions and no-screenshot
verification.

## Release Readiness

See [AWS release readiness](docs/aws-release-readiness.md) for the planned
short review-release boundary. No live AWS deployment has been run for this
repository.

## Local Verification

Use the root verification commands for public-safe local evidence:

```text
pnpm guard
pnpm check
pnpm test:e2e:mock
pnpm test:visual
pnpm test:reviewer-evidence
pnpm docker:build
pnpm test:e2e:real
pnpm guard:browser-bundles
```

The mock browser checks use bundled fallback fixture mode. The Docker-backed
browser check owns its local compose runtime, runs the Docker smoke first and
tears the stack down before it exits.
