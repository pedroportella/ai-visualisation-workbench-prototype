# Engineering Decisions

This page indexes the principal engineering decisions behind the current
prototype. It links to the deeper notes rather than duplicating every detail.

## Decision Index

| Decision | Current choice | Why it fits the prototype |
| --- | --- | --- |
| Product shape | Evidence Workbench vertical slice. | Keeps the first experience focused on answer review, source traceability, warnings and local reviewer action. |
| App architecture | Next.js App Router workbench routes. | Gives each review step a stable route while keeping backend fixture loading server-side. |
| Backend architecture | Thin FastAPI fixture/API spine. | Makes health, metadata, fixture contracts and local review actions inspectable without implying a production AI platform. |
| Data posture | Deterministic synthetic fixture evidence. | Keeps reviewer evidence repeatable and avoids real operational claims. |
| Backend-origin handling | Server-only backend origin. | Prevents browser-visible backend origin configuration and supports local fallback mode. |
| Server-state boundary | TanStack Query over same-origin workbench API routes. | Gives refresh, loading/error and review-action mutation state without exposing backend origins or replacing local reviewer UI state. |
| Visualisation | React Flow evidence map plus text fallback. | Supports interactive review while preserving a readable fallback path. |
| Design system | Local QHDS/QGDS-style adapters and tokens. | Keeps design implementation testable and repo-owned. |
| Verification | Guard scripts, package tests, browser checks and Docker smoke. | Connects public claims to checks reviewers can run locally. |
| Environment configuration | Optional non-secret env templates; no required local env file. | Keeps checked-in defaults usable while documenting server-side runtime overrides. |
| Release orchestration | Private backend and frontend pnpm release manifests. | Gives component-scoped release checks while keeping native package files authoritative. |

## Deeper Notes

- [Architecture](architecture.md): top-level layer responsibilities and
  evidence boundaries.
- [Frontend architecture](frontend-architecture.md): routes, server-only data
  loading, local review state, markdown rendering and React Flow.
- [Backend architecture](backend-architecture.md): FastAPI endpoints, fixture
  contract, validation and local process state.
- [Design-system adapter](design-system-adapter.md): local tokens, adapters
  and theme evidence.
- [API and security evidence](api-and-security-evidence.md): implemented
  review-grade API and security boundaries.
- [Accessibility and UI evidence](accessibility-and-ui-evidence.md): route,
  keyboard, fallback, layout and theme-token evidence.
- [Testing and guardrails](testing-and-guardrails.md): command matrix and
  guard strategy.
- [Environment configuration decision](environment-configuration-decision.md):
  why env templates are optional guidance rather than required setup.
- [Release orchestration decision](release-orchestration-decision.md): why
  backend and frontend release checks use private pnpm wrapper manifests.
- [AWS release readiness](aws-release-readiness.md): planned short review
  release boundary. It is readiness documentation only.

## Production-Next Limits

The current decisions do not claim real TMR data, official system status,
QChat integration, production RAG, production GraphRAG, Bedrock, Neo4j,
Terraform, SSO, source-system writeback, live AWS proof or formal assurance.
Those remain outside the implemented local prototype until they are built and
verified.
