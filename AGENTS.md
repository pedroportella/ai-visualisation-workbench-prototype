# AIVIS Prototype Contributor Guide

This repo contains the code for the AI Visualisation Workbench prototype.

## Current Product Direction

- Product H1/title: `AI Visualisation Workbench`.
- Primary product surface: `Evidence Workbench`.
- Content: transport-service-flavoured synthetic data only.
- Prototype behaviour: locally stateful review actions and a minimal backend/API
  spine.
- Repo shape: pnpm monorepo with `backend`, `frontend`, `docker` and `docs`
  folders.

## Product Guardrails

- Keep the first experience focused on the Evidence Workbench.
- Prioritise answer review, source traceability, evidence/process
  visualisation and reviewer trust states.
- Avoid turning the first screen into a marketing page, generic dashboard or
  public chatbot.
- Keep implementation choices aligned with the product direction described in
  this repository.

## Claim Boundaries

- Do not use real TMR data.
- Do not claim this is an official TMR system.
- Do not claim QChat integration.
- Do not claim production GraphRAG, RAG, AWS, SSO, Terraform or AI-platform
  delivery unless implemented and verified.
- Keep explicit "not connected to TMR systems" wording in repo docs and reviewer
  evidence, not as a foreground UI message.

## Implementation Direction

- Keep the first backend/API spine thin: health, mode/version metadata and
  deterministic fixture endpoints.
- Keep frontend code importing local AIVIS adapters and packages.
- Preserve `frontend/packages/*` as the shared package area.
- Prefer a complete Evidence Workbench vertical slice over a broad dashboard.
- Treat AI-generated markdown as untrusted content.
- Do not commit credentials, downloaded documents, local notes or
  machine-specific paths.

## Verification Discipline

Do not mark checks as passed unless they actually ran.

Planned command families:

```text
pnpm check
pnpm test
pnpm test:e2e:mock
pnpm test:visual
pnpm test:reviewer-evidence
pnpm guard
```

Backend stages should add backend unit/API tests, contract tests and smoke
checks once the API exists.
