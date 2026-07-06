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
- FastAPI fixture backend with health, readiness, metadata, answer, source,
  graph and review-action endpoints.
- Server-only backend origin handling in the frontend app.
- React Flow through `@xyflow/react` for the evidence/process map.
- App-local safe markdown rendering for the fixture answer shape.
- Local React state for simulated review actions and reset behaviour.
- Vitest, backend pytest, Playwright route checks, no-screenshot DOM/layout
  checks, Docker smoke checks and public guard scripts.

Not claimed:

- direct D3.js, Cytoscape.js or Mermaid implementation;
- TanStack Query, app-owned Zustand or Redux integration;
- production retrieval, production graph analytics or persisted review state;
- axe, Lighthouse, WAVE, Dependabot or Socket.dev automation;
- production RAG, GraphRAG, Amazon Bedrock, Neo4j, Terraform, SSO,
  source-system writeback or live AWS operation.

Current docs:

- [Reviewer pack](reviewer-pack.md): five-minute route review, screenshot
  gallery, local evidence commands and prototype caveats for public reviewers.
- [AWS release readiness](aws-release-readiness.md): planned short AWS review
  release boundary, local gates, evidence model and teardown posture. This is
  readiness documentation only, not live AWS proof.
- [Principal software engineer environment configuration decision](environment-configuration-decision.md):
  why the current runtime works from checked-in defaults without local
  environment-file setup.
- [Principal software developer release orchestration decision](release-orchestration-decision.md):
  why the monorepo uses private backend and frontend pnpm release manifests
  while keeping native package files as source of truth.

Current local evidence commands are documented from the repository root in
`README.md` and `scripts/README.md`.
