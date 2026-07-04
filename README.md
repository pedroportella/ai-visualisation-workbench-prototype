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
