# Scripts

Use this folder for repo-local verification, reviewer-evidence capture and
guardrail scripts.

Do not add scripts that imply checks passed unless they run real verification.

Current scripts:

- `local-backend-smoke.py`: checks the already-running local FastAPI backend
  at `GET /health/live`, `GET /health/ready` and `GET /meta`.
- `local-docker-smoke.py`: checks the Docker Compose backend and frontend
  runtime, including fixture endpoints, the local review-action transition,
  rendered workbench routes and backend-origin secrecy in returned HTML.
