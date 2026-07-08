# Architecture

This page explains the implemented prototype architecture for review. It
describes what exists now, why the shape fits the Evidence Workbench slice and
what the architecture does not prove.

## What Exists

| Layer | Responsibility | Public evidence |
| --- | --- | --- |
| Next.js workbench app | Renders `/evidence-workbench` and the review, sources, process and audit routes. | `frontend/apps/workbench/app/evidence-workbench/*` |
| Workbench app shell | Provides the header, side navigation, main region and route framing. | `frontend/apps/workbench/AppShell/` |
| Evidence workspaces | Renders the answer, sources, evidence map, warnings and local action state. | `frontend/apps/workbench/components/` |
| Shared frontend packages | Hold local services, design-system adapters, tokens, assets and utilities. | `frontend/packages/*` |
| FastAPI API spine | Serves health, readiness, metadata and deterministic fixture endpoints. | `backend/src/aivis_api/main.py` |
| Synthetic contract data | Provides answer, source, graph, warning, context-anchor and review-action fixtures. | `backend/src/aivis_api/fixture_data.py` |
| Verification and guards | Check local behaviour, public docs, claim boundaries and reviewer evidence. | `scripts/`, `tests/` |

The current system has one reviewer-facing vertical slice. The frontend can
render from the local backend fixture API or from bundled fallback fixture
data. Review actions update local review state only. The backend fixture
endpoint stores action state in local process memory and resets when the
process restarts.

## Why This Shape

The prototype is built as an evidence review workbench, not as a general
chatbot. The architecture keeps the review task narrow:

- Next.js App Router gives the workbench a route-per-review-step model while
  keeping backend data loading server-side.
- FastAPI gives the fixture contract a small, inspectable API surface with
  OpenAPI docs, validation and local health endpoints.
- Deterministic synthetic fixture data lets reviewers repeat the same evidence
  path without implying live operations.
- React Flow is used where the reviewer benefits from an interactive evidence
  process map; a text fallback remains available for review resilience.
- Local packages keep AIVIS adapters, tokens and utilities under repo control.
- Guard scripts keep public docs and implementation text aligned with the
  prototype boundary.

## Evidence Boundaries

The workbench uses synthetic fixture evidence. Real Brisbane and Queensland
place names are public context anchors only; they are not evidence of an
operational event. Source records, citations, warning states, timestamps and
review actions are deterministic fixture content.

The frontend keeps backend origins server-side. Browser-visible code should
not expose private backend origin configuration. The backend exposes local CORS
origins only and the local Docker smoke checks rendered HTML and static assets
for backend-origin leakage.

## What This Does Not Prove

This architecture does not claim:

- real TMR data;
- an official TMR system;
- QChat integration;
- production RAG, production GraphRAG, Bedrock, Neo4j, Terraform or SSO;
- source-system writeback;
- persisted multi-user review workflow;
- formal security, privacy or accessibility assurance;
- live cloud deployment proof.

Those are production-next concerns unless they are implemented and verified in
future work.
