# Frontend Architecture

This page explains the implemented frontend architecture for the Evidence
Workbench. It focuses on route ownership, data loading, package boundaries and
review-state behaviour.

## Route Model

The workbench is a Next.js App Router app under `frontend/apps/workbench`.

| Route | Purpose |
| --- | --- |
| `/evidence-workbench` | Case orientation and task launcher. |
| `/evidence-workbench/review` | Draft answer, citations, blocker issue and review action. |
| `/evidence-workbench/sources` | Source inventory, warnings and selected evidence gaps. |
| `/evidence-workbench/process` | React Flow evidence map and text process map fallback. |
| `/evidence-workbench/audit` | Local action status, audit summary and reset control. |

Routes use `runtime = "nodejs"` and `dynamic = "force-dynamic"` where backend
fixture data is loaded. The layout fetches the same view model used by the
route content so the shell can show fallback state consistently.

## Server-Only Data Loading

The Evidence Workbench resolves fixture data in
`frontend/apps/workbench/services/EvidenceWorkbenchBackendService.ts`.
That module imports `server-only`, reads `AIVIS_BACKEND_ORIGIN` on the server
and falls back to bundled fixture data if the backend fixture API is
unavailable.

This server-only backend origin boundary is intentional:

- browser bundles do not need backend hostnames;
- local backend and frontend runtimes can be tested separately;
- fallback mode remains explicit to reviewers;
- production-like runs can require a server-side backend origin without adding
  `NEXT_PUBLIC_*BACKEND` configuration.

The shared `@aivis/services` package also keeps its runtime configuration and
backend adapters server-only. Current Evidence Workbench fixture loading is
app-local because the route uses a specialised answer, source, graph and
review-action shape.

The app-local service boundary is intentionally flat under
`frontend/apps/workbench/services/`. The service modules use
`EvidenceWorkbench*` PascalCase filenames so the boundary stays easy to scan
beside PascalCase app shell and component modules.

## Package Boundaries

The frontend monorepo uses local AIVIS packages:

- `@aivis/ui-library`: QHDS/QGDS-style React component adapters and shared
  theme entrypoint.
- `@aivis/ui-tokens`: semantic CSS variables and design tokens.
- `@aivis/ui-assets`: local icon and logo assets consumed by adapters.
- `@aivis/services`: server-only service adapter patterns for prototype data
  sources.
- `@aivis/utils`: small shared formatting and utility functions.

The workbench app imports local adapters rather than scattered upstream design
system references. That keeps implementation ownership clear and makes package
checks meaningful.

## Review State And Rendering

The loaded fixture data is converted into a workbench view model. Client
components then manage local review state with React reducer state. The
current action path records a local source-update request and can reset back
to the loaded fixture seed.

The answer renderer treats AI-generated markdown as untrusted content. It
parses a constrained subset of markdown, renders citation markers from known
fixture citations and only allows safe hash, root-relative, `http` and `https`
links. Unknown or unsafe links are rendered as text instead of active links.

The evidence map uses React Flow for the interactive graph and keeps a text
process map region in the DOM. The fallback region is keyboard focusable and
appears in route and no-screenshot visual checks.

## Evidence

Useful checks for the frontend architecture:

```text
pnpm --filter @aivis/workbench check
pnpm test:e2e:mock
pnpm test:visual
pnpm guard:browser-origins
pnpm guard:browser-bundles
```

`pnpm test:visual` is a no-screenshot DOM/layout check. It verifies landmarks,
headings, ARIA references, focus behaviour, route height, overflow, theme
tokens and the text process map fallback across desktop and mobile contexts.

## Known Limits

Frontend state is local review state, not persisted multi-user workflow state.
Fallback mode is a reviewer-safe local resilience path, not proof of backend
availability. The frontend does not implement production SSO, protected
routes, production retrieval or source-system writeback.
