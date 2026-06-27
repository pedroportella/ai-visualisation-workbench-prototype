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

Readiness is limited to the implemented local API health and metadata surface.
Graph endpoints, review-action mutation endpoints, schemas, Docker files and
deployment scripts are not implemented in this backend slice.

The Evidence Workbench fixture endpoints return deterministic synthetic
fixture payloads:

- `GET /evidence-workbench/answer` returns `ANS-001`, answer claims,
  citations, active warning state, prompt context, public context anchors,
  initial review state and audit metadata.
- `GET /evidence-workbench/sources` returns `SRC-001` through `SRC-007`,
  active warning records and `PublicContextAnchor` context records.

Public context anchors are context only. Citation and claim-support fields
reference `Source` ids only.

`/meta` reports the local synthetic fixture posture:

```text
runtimeModeLabel: local_fixture
contractMode: synthetic_fixture
contractVersion: aivis-evidence-workbench-contract@0.1.0
sourceSetVersion: synthetic-source-set-v1
publicContextSetVersion: public-context-anchor-set-v1
```

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
