# Testing And Guardrails

This page maps the main checks reviewers can run and what each check proves.
It is intended to make the evidence surface inspectable without implying that
every production concern is solved.

## Fast Reviewer Checks

| Command | What it checks |
| --- | --- |
| `pnpm test:reviewer-evidence` | Required public docs, reviewer files, root scripts, Markdown links, screenshot files and key caveats. |
| `pnpm guard:public-docs` | Public docs are free of private planning markers and local-only references. |
| `pnpm guard:claim-boundaries` | Public docs and implementation text keep unsupported official, live and production claims in negative guardrail contexts. |
| `git diff --check` | Whitespace errors in the current diff. |

These are the fastest checks for docs and reviewer-handover changes.

## Frontend And UI Checks

| Command | What it checks |
| --- | --- |
| `pnpm --filter @aivis/workbench test` | Workbench unit tests, including the review reducer, TanStack Query same-origin route constants and query-cache update from review-action mutation results. |
| `pnpm --filter @aivis/workbench typecheck` | Workbench TypeScript types, including Next route handlers and TanStack Query hook integration. |
| `pnpm --filter @aivis/workbench check` | Workbench package type, test and build checks through its package script. |
| `pnpm --filter @aivis/ui-library check` | UI adapter package checks. |
| `pnpm --filter @aivis/ui-tokens check` | Token package checks. |
| `pnpm test:e2e:mock` | Evidence Workbench route journey in bundled fallback fixture mode. |
| `pnpm test:visual` | No-screenshot route, semantic, layout, focus, overflow and theme-token checks. |

Mock-mode browser checks use a dedicated local Next server and bundled
fallback fixture mode.

## Backend And Runtime Checks

| Command | What it checks |
| --- | --- |
| `backend/.venv/bin/python scripts/local-backend-smoke.py` | Existing local FastAPI health, readiness and metadata endpoints. |
| `pnpm --filter @aivis/backend release:preflight` | Backend-scoped package checks and local release rehearsal commands. |
| `pnpm docker:smoke` | Local Docker Compose backend plus frontend runtime, fixture endpoints, review action and rendered assets. |
| `pnpm test:e2e:real` | Browser journey against the Docker-backed runtime after Docker smoke. |

Docker-backed checks are heavier because they own or require a local Compose
runtime.

## Guard Families

| Command | What it protects |
| --- | --- |
| `pnpm guard` | Runs artifact, app-naming, public-doc, claim-boundary, secret and browser-origin guards. |
| `pnpm guard:app-naming` | Prevents drift from the current PascalCase app shell, component-module and flat service-boundary source shape. |
| `pnpm guard:artifacts` | Prevents generated outputs and local environment files from being committed. |
| `pnpm guard:secrets` | Scans text candidates for common secret markers. |
| `pnpm guard:browser-origins` | Keeps backend origins and local paths out of browser-visible source files, including same-origin frontend API route boundaries. |
| `pnpm guard:browser-bundles` | Scans built browser assets for backend origins, private labels and secret markers after the workbench bundle exists. |

`pnpm guard:browser-bundles` requires a built frontend bundle. It is a
release-path check rather than a default docs-only check.

## Reviewer Evidence Strategy

The default docs-only review loop is:

```text
pnpm test:reviewer-evidence
pnpm guard:public-docs
pnpm guard:claim-boundaries
git diff --check
```

Use broader package, browser, Docker and bundle checks when the change touches
runtime code, package scripts, examples, TypeScript, Python or release
configuration.

For source-structure refactors, include `pnpm guard:app-naming` explicitly
when reviewing the diff. It is also part of `pnpm guard`.

## Limits

These checks provide local prototype evidence. They do not prove formal
security assurance, formal WCAG assurance, high availability, production SSO,
live cloud operation, production retrieval or source-system writeback.
