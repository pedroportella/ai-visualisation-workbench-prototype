# Scripts

Use this folder for repo-local verification, reviewer-evidence capture and
guardrail scripts.

Do not add scripts that imply checks passed unless they run real verification.

Current scripts:

- `local-backend-smoke.py`: checks the already-running local FastAPI backend
  at `GET /health/live`, `GET /health/ready` and `GET /meta`.
- `local-docker-smoke.py`: checks the Docker Compose backend and frontend
  runtime, including fixture endpoints, the local review-action transition,
  backend-backed rendered workbench routes, returned HTML and browser-visible
  `/_next/static` assets.
- `backend-release-proof.mjs`: checks an already-running workbench through its
  same-origin view-model API and rendered routes, failing unless the frontend
  proves backend fixture mode and backend-supported review actions.
- `run-playwright.mjs`: wraps Playwright with mode, base URL, runtime owner and
  teardown-owner output. `pnpm test:e2e:mock` and `pnpm test:visual` use a
  dedicated mock-mode Next server on port `3210`.
- `run-docker-e2e.mjs`: owns the Docker-backed browser runtime for
  `pnpm test:e2e:real`, runs `pnpm docker:smoke` and
  `pnpm test:backend-release-proof` first and tears compose down before
  exiting.
- `quality-guards.mjs`: powers `pnpm guard`, `pnpm guard:app-naming`,
  `pnpm guard:artifacts`, `pnpm guard:public-docs`, `pnpm guard:claim-boundaries`,
  `pnpm guard:secrets`, `pnpm guard:browser-origins` and
  `pnpm guard:browser-bundles`.
- `reviewer-evidence-smoke.mjs`: powers `pnpm test:reviewer-evidence` by
  checking required public files, root scripts, command references and Markdown
  links.

Browser command matrix:

```text
pnpm test:e2e
pnpm test:e2e:mock
pnpm test:e2e:mock:headed
pnpm test:e2e:real
pnpm test:e2e:real:headed
pnpm test:e2e:report
pnpm test:backend-release-proof
pnpm test:visual
pnpm test:reviewer-evidence
```

`pnpm test:visual` is a no-screenshot DOM/layout check while screenshot
capture is not part of the current evidence set.

`pnpm test:backend-release-proof` expects a workbench runtime that can reach
the local fixture backend. Set `AIVIS_BACKEND_RELEASE_PROOF_BASE_URL` when the
workbench is not running on `http://127.0.0.1:3200`.
