# Backend Architecture

This page explains the implemented FastAPI backend. The backend is a thin,
inspectable fixture/API spine for the Evidence Workbench, not a production AI
platform.

## Current API Spine

| Endpoint | Purpose |
| --- | --- |
| `GET /health/live` | Local process liveness. |
| `GET /health/ready` | Readiness for the implemented local API surface. |
| `GET /meta` | Runtime mode, contract mode and fixture set metadata. |
| `GET /evidence-workbench/answer` | Answer, claims, citations, warnings, prompt context, public context anchors and initial review state. |
| `GET /evidence-workbench/sources` | Source inventory, warning records and public context anchors. |
| `GET /evidence-workbench/graph` | Evidence graph, nodes, edges, warnings and text fallback steps. |
| `POST /evidence-workbench/review-actions` | Deterministic local review-action transition for the source-update action. |

The fixture endpoints return deterministic synthetic content. They include
contract labels such as `runtimeModeLabel: local_fixture` and
`contractMode: synthetic_fixture` so reviewers can see the data posture in API
responses and OpenAPI examples.

## Data And State Boundaries

Evidence sources are synthetic fixture records. Public context anchors use real
place names as context only and cannot satisfy citation or claim support.
Citation and claim-support fields reference source ids, not public context
anchor ids.

Review actions are local process state. The implemented action records a
source-update request for the current review fixture, updates the returned
review state and audit metadata and preserves active blocker warnings. The
read-only answer and graph fixture endpoints continue to return the initial
fixture state.

Restarting the API process resets the local review state.

## Validation And Error Shape

The review-action endpoint validates request bodies before applying state:

- unknown fields are rejected;
- required ids must match known fixture objects;
- reviewer notes are constrained;
- validation errors use a stable JSON error envelope;
- validation errors do not echo request values, secrets or external URLs.

FastAPI also exposes `/openapi.json`, `/docs` and `/redoc` for the implemented
fixture contract.

## Runtime Boundary

The backend enables CORS for local frontend development origins only. Wildcard
origins and credentialed browser requests are not enabled.

Provider boundary names exist for future adapter seams, but
`fixture_provider` is the only implemented provider. The backend currently
serves deterministic source, answer and graph fixtures.

## Evidence

Useful backend checks:

```text
backend/.venv/bin/python scripts/local-backend-smoke.py
pnpm --filter @aivis/backend release:preflight
pnpm docker:smoke
pnpm test:e2e:real
```

The local backend smoke checks health, readiness and metadata. The Docker
smoke checks the coordinated local backend plus frontend runtime, fixture
endpoints, review-action transition, rendered HTML and browser-visible static
assets.

## Not Claimed

The backend does not implement production retrieval, production graph
analytics, a graph database, Bedrock, Neo4j, source-system writeback,
production audit logging, formal security assurance or persisted multi-user
workflow. Those are production-next limits, not current capabilities.
