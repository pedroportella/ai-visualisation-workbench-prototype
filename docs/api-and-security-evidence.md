# API And Security Evidence

This page explains implemented API and security-relevant boundaries for
review. These checks are review-grade evidence, not a formal security assurance.

## Implemented Boundaries

| Boundary | Implemented posture | Evidence |
| --- | --- | --- |
| Server-only backend origin | The frontend reads backend origin configuration on the server and does not require `NEXT_PUBLIC_*BACKEND` variables. | `frontend/apps/workbench/services/EvidenceWorkbenchBackendService.ts`, `frontend/packages/services/src/server/runtimeConfig.ts` |
| Same-origin workbench API routes | Browser code fetches the Evidence Workbench view model and records review-action mutations through `/api/evidence-workbench/...` routes, while those route handlers call server-only service helpers. | `frontend/apps/workbench/app/api/evidence-workbench/view-model/route.ts`, `frontend/apps/workbench/app/api/evidence-workbench/review-actions/route.ts`, `frontend/apps/workbench/services/EvidenceWorkbenchQueryState.ts` |
| Browser-origin guard | Source scans fail browser-visible frontend files that expose backend origins or local machine paths. | `pnpm guard:browser-origins` |
| Browser bundle guard | Built static assets can be scanned for backend origins, private labels and secret markers. | `pnpm guard:browser-bundles` |
| Safe markdown rendering | Generated answer markdown is parsed through a constrained renderer instead of raw HTML injection. | `frontend/apps/workbench/components/answer/AnswerMarkdownRenderer/AnswerMarkdownRenderer.tsx`, `frontend/apps/workbench/components/answer/AnswerMarkdownRenderer/answerMarkdownParser.ts` |
| API validation | Review-action requests reject unknown fields, missing ids and invalid fixture state. | `backend/src/aivis_api/review_state.py`, backend tests |
| Local CORS | The backend allows local frontend development origins only and does not enable credentialed wildcard browser requests. | `backend/src/aivis_api/main.py` |
| Public docs leakage guard | Public docs are scanned for private planning markers and local-only references. | `pnpm guard:public-docs` |
| Claim-boundary guard | Public docs and implementation text are scanned for unsupported official, live or production claims. | `pnpm guard:claim-boundaries` |
| Secret marker guard | Text candidates are scanned for common secret markers. | `pnpm guard:secrets` |

## Server-Only Backend Origin

The workbench uses a server-only backend origin. The current backend fixture
loader imports `server-only`, reads `AIVIS_BACKEND_ORIGIN` server-side and
falls back to bundled fixture data when the API is unavailable.

This protects reviewability by keeping backend hostnames out of browser
configuration and by making fallback mode visible in the UI. It is also checked
by browser-origin and Docker smoke paths.

The client-side TanStack Query hooks call same-origin workbench API routes only.
Those route handlers run on the server, reuse the server-only workbench service
and keep backend origin configuration outside browser-visible source and built
assets.

## Generated Answer Content

The answer renderer treats generated-answer markdown as untrusted content. It
supports headings, paragraphs, blockquotes, lists, tables, code blocks,
controlled diagram fixtures, citation markers and safe links. It does not
render arbitrary raw HTML. Unsupported or unsafe link forms become text.

## API Contract Evidence

The FastAPI surface exposes only local fixture endpoints and local health
metadata. OpenAPI descriptions label the contract as `synthetic_fixture` and
`local_fixture`. Review-action responses include local-state notes and do not
claim source-system writeback or production audit logging.

## Useful Checks

```text
pnpm guard
pnpm test:reviewer-evidence
pnpm docker:smoke
pnpm guard:browser-bundles
git diff --check
```

`pnpm guard` runs the public-doc, claim-boundary, secret and browser-origin
guards together. `pnpm guard:browser-bundles` needs a built frontend bundle.

## Limits

This repository does not claim formal security assurance, penetration testing,
production SSO, protected routes, token storage, production privacy assurance,
live cloud security controls or production platform operation. Those are
production-next concerns.
