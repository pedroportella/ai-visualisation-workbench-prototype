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

Readiness is limited to the implemented local API health and metadata surface.
Fixture endpoints, review actions, schemas, Docker files and deployment
scripts are not implemented in this backend slice.

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
