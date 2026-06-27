# AI Visualisation Workbench Prototype

This repository contains the prototype implementation for AIVIS, the AI
Visualisation Workbench.

The first product surface will be the Evidence Workbench: a staff/reviewer
experience for inspecting a source-backed AI guidance answer, its citations,
evidence path, warnings and review state.

## Prototype Boundary

- Uses synthetic transport-service-flavoured content.
- Does not use real TMR data.
- Is not an official TMR system.
- Is not connected to TMR systems.
- Is not QChat and does not claim QChat integration.
- Does not claim production RAG, GraphRAG, AWS, SSO or platform operation until
  those capabilities are implemented and verified.

## Repo Shape

```text
backend/   Minimal API spine first: health, metadata and fixture contracts.
docs/      Public docs, claim boundaries and reviewer-facing notes.
docker/    Local runtime and deployment helpers when needed.
frontend/  React apps and shared frontend packages.
scripts/   Repo-local verification and guard helpers.
```

This is a pnpm monorepo.

## First Build Direction

1. Establish monorepo foundation and guardrails.
2. Add a minimal backend/API spine.
3. Adapt shared frontend packages.
4. Build the Evidence Workbench route.
5. Add rich markdown, citations, source traceability and evidence/process
   visualisation.
