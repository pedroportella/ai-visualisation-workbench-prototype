# Backend

This folder contains the Python/FastAPI backend scaffold for the AIVIS
prototype.

## Current Scope

- Package: `aivis_api`.
- App target: `aivis_api.main:app`.
- Runtime dependencies: managed through `pyproject.toml`.
- Implemented routes:
  - `GET /health/live`
  - `GET /health/ready`
  - `GET /meta`
  - `GET /evidence-workbench/answer`
  - `GET /evidence-workbench/sources`
  - `GET /evidence-workbench/graph`
  - `POST /evidence-workbench/review-actions`

Readiness is limited to the implemented local API health and metadata surface.
Schema files and deployment scripts are not implemented in this backend slice.
A backend container is available for local health smoke checks.

The Evidence Workbench fixture endpoints return deterministic synthetic
fixture payloads:

- `GET /evidence-workbench/answer` returns `ANS-001`, answer claims,
  citations, active warning state, prompt context, public context anchors,
  initial review state and audit metadata.
- `GET /evidence-workbench/sources` returns `SRC-001` through `SRC-007`,
  active warning records and `PublicContextAnchor` context records.
- `GET /evidence-workbench/graph` returns `GRAPH-001`, its node and edge
  inventory, active warning records, public context anchors, the initial review
  state, accessible graph summary and small-viewport step-list fallback.
- `POST /evidence-workbench/review-actions` records the local
  `ACT-REQUEST-SOURCE-UPDATE` action for `REV-001`, returns the
  post-primary-action review state, introduces `WARN-007`, removes `WARN-005`
  from the active warning response and updates `AUDIT-001` metadata.

Public context anchors are context only. Citation and claim-support fields
reference `Source` ids only. Graph context-anchor nodes use
`uses_place_anchor` edges only and never originate citation or support-like
edges.

Review actions are local prototype state only. The review-action endpoint keeps
`ACT-MARK-REVIEWED` unavailable while `WARN-001`, `WARN-002` or `WARN-003`
remain active, does not write to external source systems and does not create
production audit logs. `GET /evidence-workbench/answer` and
`GET /evidence-workbench/graph` continue to return the initial read-only
fixture state; the post-action state is returned by the review-action response.

Review-action state is stored in memory for the running API process. Restarting
the API process resets `REV-001` and `AUDIT-001` to the initial fixture state.

`/meta` reports the local synthetic fixture posture:

```text
runtimeModeLabel: local_fixture
contractMode: synthetic_fixture
contractVersion: aivis-evidence-workbench-contract@0.1.0
sourceSetVersion: synthetic-source-set-v1
publicContextSetVersion: public-context-anchor-set-v1
```

## OpenAPI And Contract Docs

FastAPI exposes the implemented API contract at:

- `GET /openapi.json`
- `GET /docs`
- `GET /redoc`

The OpenAPI metadata documents only the implemented local fixture surface:
health, readiness, `/meta`, the answer fixture endpoint, the source inventory
fixture endpoint, the graph fixture endpoint and the local review-action
endpoint. Route summaries, tag descriptions and request/response examples
include the shared contract labels:

```text
runtimeModeLabel: local_fixture
contractMode: synthetic_fixture
contractVersion: aivis-evidence-workbench-contract@0.1.0
sourceSetVersion: synthetic-source-set-v1
publicContextSetVersion: public-context-anchor-set-v1
```

The OpenAPI descriptions preserve the public boundary: real Brisbane place
names are `PublicContextAnchor` context labels only, evidence sources are
synthetic fixture records, and review actions update local process state only.
The docs do not claim live retrieval, source-system writeback, production audit
logging, QChat integration or official Queensland Government service status.

## Validation, Errors And Local CORS

The review action endpoint validates its request body before applying local
state. The body rejects unknown fields, blank ids and oversized reviewer notes.

Error responses use a stable JSON envelope so frontend adapters can handle
validation, missing fixture objects and review-action conflicts consistently:

```json
{
  "error": {
    "code": "review_action_conflict",
    "message": "ACT-MARK-REVIEWED is unavailable while WARN-001, WARN-002 or WARN-003 are active.",
    "statusCode": 409,
    "runtimeModeLabel": "local_fixture",
    "contractMode": "synthetic_fixture",
    "contractVersion": "aivis-evidence-workbench-contract@0.1.0",
    "sourceSetVersion": "synthetic-source-set-v1",
    "publicContextSetVersion": "public-context-anchor-set-v1"
  }
}
```

Validation errors include only field names and issue codes. They do not echo
request values, fixture links, secrets or external URLs.

The backend enables CORS only for local frontend development origins:

```text
http://localhost:3000
http://127.0.0.1:3000
http://localhost:5173
http://127.0.0.1:5173
```

Wildcard origins and credentialed browser requests are not enabled.

## Local Setup

```text
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -e ".[dev]"
```

## Development Commands

From this `backend/` directory:

```text
python -m uvicorn aivis_api.main:app --reload --host 127.0.0.1 --port 8000
python -m pytest
```

## Local Runtime Smoke

Terminal A, from this `backend/` directory:

```text
python -m uvicorn aivis_api.main:app --host 127.0.0.1 --port 8000
```

Terminal B, from the repo root:

```text
backend/.venv/bin/python scripts/local-backend-smoke.py
```

The smoke command checks only:

- `GET /health/live`
- `GET /health/ready`
- `GET /meta`

It verifies the local fixture runtime label, synthetic contract mode, contract
version, source-set version and public-context-set version. It does not require
the frontend, Docker, AWS credentials or cloud resources.

## Backend Container Runtime

The backend has a server-side runtime entrypoint for container-compatible
process startup:

```text
python -m aivis_api.server
```

By default this runs the existing app target on a container-compatible host and
port:

```text
appTarget: aivis_api.main:app
AIVIS_BACKEND_HOST: 0.0.0.0
AIVIS_BACKEND_PORT: 8000
```

The host and port can be overridden by server process environment variables:

```text
AIVIS_BACKEND_HOST=0.0.0.0 AIVIS_BACKEND_PORT=8000 python -m aivis_api.server
```

For local-only development, keep using the loopback Uvicorn command above. For
container smoke checks, build the backend image from the repo root:

```text
docker build -f backend/Dockerfile -t aivis-backend:local backend
```

Then run the container with a host-visible port:

```text
docker run --rm --name aivis-backend-smoke -p 8080:8000 aivis-backend:local
```

In another terminal, from the repo root, run the existing smoke script against
the host-visible base URL:

```text
backend/.venv/bin/python scripts/local-backend-smoke.py --base-url http://127.0.0.1:8080
```

These settings are backend process settings only. They do not add browser
secrets, a compose file, cloud resources or deployment scripts. The image
copies the backend package metadata and source only; local virtual environments,
test caches and `.env` files are excluded from the build context.
