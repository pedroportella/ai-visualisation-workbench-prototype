# Scripts

Use this folder for repo-local verification, reviewer-evidence capture and
guardrail scripts.

Do not add scripts that imply checks passed unless they run real verification.

Current scripts:

- `local-backend-smoke.py`: checks the already-running local FastAPI backend
  at `GET /health/live`, `GET /health/ready` and `GET /meta`.
