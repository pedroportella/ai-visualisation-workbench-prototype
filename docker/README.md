# Docker

Docker support is limited to local backend container smoke checks.

Build the backend image from the repo root:

```text
docker build -f backend/Dockerfile -t aivis-backend:local backend
```

Run the backend container:

```text
docker run --rm --name aivis-backend-smoke -p 8080:8000 aivis-backend:local
```

Then smoke the health, readiness and metadata endpoints from the repo root:

```text
backend/.venv/bin/python scripts/local-backend-smoke.py --base-url http://127.0.0.1:8080
```

The container uses the backend server settings `AIVIS_BACKEND_HOST` and
`AIVIS_BACKEND_PORT`. No compose file, deployment script, cloud resource,
secret, auth layer or database is implemented here.
