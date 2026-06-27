# Backend

This folder contains the Python/FastAPI backend scaffold for the AIVIS
prototype.

## Current Scope

- Package: `aivis_api`.
- App target: `aivis_api.main:app`.
- Runtime dependencies: managed through `pyproject.toml`.
- Implemented routes: none beyond FastAPI's generated documentation routes.

Health, readiness and mode/version metadata endpoints are planned for B02.
Fixture endpoints, review actions, schemas, Docker files and deployment
scripts are future packets.

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

The Uvicorn command starts the importable scaffold only. It does not imply that
B02 health, readiness or metadata endpoints exist yet.
