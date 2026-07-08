# Docs

Use this folder for public-facing prototype documentation, reviewer notes and
claim boundaries.

Public docs should state that the prototype uses synthetic data, is not
connected to TMR systems and is not an official TMR system.

## Product Definition

AIVIS is a simulated evidence workbench for reviewing source-backed AI guidance
before it is used. The Evidence Workbench helps a staff reviewer inspect one
AI-generated service-guidance answer, the sources and warnings behind it, and
the local review action that should happen next.

The prototype addresses a narrow review problem: AI guidance can sound
plausible while relying on stale, weak, missing or conflicting evidence. The
workbench makes that evidence visible so the reviewer can decide whether the
answer is safe to approve, needs a source update or should remain blocked.

## Current Review Flow

The public app routes map to one reviewer workflow:

- `/evidence-workbench`: front-door task summary and current case orientation.
- `/evidence-workbench/review`: draft answer, selected source issue and review
  actions.
- `/evidence-workbench/sources`: source blockers, source records and warning
  context.
- `/evidence-workbench/process`: React Flow evidence/process map with text
  fallback.
- `/evidence-workbench/audit`: local action status, audit summary and reset
  control.

The current synthetic case uses recognisable Brisbane/Queensland place anchors
with simulated transport-service evidence. Operational events, source records,
source dates, warning states and reviewer actions are synthetic.

## Technology Posture

Implemented now:

- Next.js App Router, React and TypeScript for the Evidence Workbench.
- Local `@aivis/*` frontend packages and local QHDS/QGDS-style adapters.
- App-owned workbench components grouped under
  `frontend/apps/workbench/components/`, with PascalCase app shell and flat
  workbench service-boundary modules.
- FastAPI fixture backend with health, readiness, metadata, answer, source,
  graph and review-action endpoints.
- Server-only backend origin handling in the frontend app.
- TanStack Query server-state boundary for same-origin Evidence Workbench
  view-model refresh and review-action mutation state, seeded from the
  server-rendered view model.
- React Flow through `@xyflow/react` for the evidence/process map.
- App-local safe markdown rendering for the fixture answer shape.
- Local React state for simulated review actions and reset behaviour.
- Vitest, backend pytest, Playwright route checks, no-screenshot DOM/layout
  checks, Docker smoke checks and public guard scripts, including source-shape
  naming protection.

Not claimed:

- direct D3.js, Cytoscape.js or Mermaid implementation;
- app-owned Zustand or Redux integration;
- production retrieval, production graph analytics or persisted review state;
- axe, Lighthouse, WAVE, Dependabot or Socket.dev automation;
- production RAG, GraphRAG, Amazon Bedrock, Neo4j, Terraform, SSO,
  source-system writeback or live AWS operation.

## Reviewer Path

- [Reviewer pack](reviewer-pack.md): five-minute route review, screenshot
  gallery, local evidence commands and prototype caveats for public reviewers.

## Architecture And Evidence

- [Architecture](architecture.md): top-level layer responsibilities, why the
  current shape fits the prototype and what it does not prove.
- [Frontend architecture](frontend-architecture.md): Next.js routes,
  server-only backend origin handling, local package boundaries, safe markdown
  rendering, React Flow and local review state.
- [Backend architecture](backend-architecture.md): FastAPI endpoints,
  deterministic fixture contract, local process state, validation and API
  limits.
- [Design-system adapter](design-system-adapter.md): local QHDS/QGDS-style
  adapters, semantic tokens, theme-token evidence and visual caveats.
- [API and security evidence](api-and-security-evidence.md): implemented
  server-only, markdown, API validation, browser-origin, secret and claim
  guardrails.
- [Accessibility and UI evidence](accessibility-and-ui-evidence.md):
  landmarks, headings, keyboard/focus checks, graph text fallback, responsive
  layout and formal-audit limits.
- [Testing and guardrails](testing-and-guardrails.md): reviewer evidence,
  guard, frontend, backend, Docker and release-path command matrix.
- [Engineering decisions](engineering-decisions.md): index of principal
  engineering choices and links to deeper decision records.

## Decisions And Release Readiness

- [AWS release readiness](aws-release-readiness.md): planned short AWS review
  release boundary, local gates, evidence model and teardown posture. This is
  readiness documentation only, not live AWS proof.
- [Principal software engineer environment configuration decision](environment-configuration-decision.md):
  why the current runtime works from checked-in defaults and uses env templates
  only as optional local guidance.
- [Principal software developer release orchestration decision](release-orchestration-decision.md):
  why the monorepo uses private backend and frontend pnpm release manifests
  while keeping native package files as source of truth.

Current local evidence commands are documented from the repository root in
`README.md` and `scripts/README.md`.
