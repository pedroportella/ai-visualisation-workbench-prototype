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

The Evidence Workbench resolves fixture data through
`@aivis/services/server`. The package service imports `server-only`, resolves
`AIVIS_FRONTEND_DATA_SOURCE` and `AIVIS_BACKEND_ORIGIN` on the server and
returns bundled fixture data in explicit mock mode or when a configured backend
fixture API is unavailable.

This server-only backend origin boundary is intentional:

- browser bundles do not need backend hostnames;
- local backend and frontend runtimes can be tested separately;
- fallback mode remains explicit to reviewers;
- production-like runs can require a server-side backend origin without adding
  `NEXT_PUBLIC_*BACKEND` configuration.

The app keeps same-origin route handlers and browser query state local. Backend
endpoint composition, DTO mapping, fallback data and review-action backend
mutation helpers live in `frontend/packages/services`.

## TanStack Query Server State

The workbench now has a narrow TanStack Query boundary for server-state
behaviour that is useful in the prototype:

- the initial view model is still rendered by the server route and passed to
  the client as the first query seed;
- browser code refreshes the workbench view model through the same-origin
  `/api/evidence-workbench/view-model` route;
- browser code records backend fixture review actions through the same-origin
  `/api/evidence-workbench/review-actions` route;
- the route handlers call `@aivis/services/server`, so backend origin
  configuration stays out of browser-visible code and bundles;
- the review-action mutation updates the TanStack Query cache from the backend
  fixture response, while bundled fallback mode keeps the existing local
  reducer transition and labels it as local fallback behaviour.

TanStack Query is not used for route selection, accordion open state, source
issue selection or process-map state. Those remain local UI state owned by the
relevant workbench components.

## Component Ownership

Workbench UI code is app-owned and grouped directly under
`frontend/apps/workbench/components/` by product responsibility: answer,
audit, evidence, overview, process, review, sources and warnings. Shared route
helpers live under `components/shared/`; review decision state lives under
`components/state/`.

Client boundaries stay narrow and explicit. The app shell owns navigation
interactions, `EvidenceWorkbenchClient` owns loaded view state,
`ReviewActionForm` owns the interactive decision form, `SourcesRecordAccordion`
owns source disclosure/hash focus and `ProcessEvidenceMap` owns React Flow.

`pnpm guard:app-naming` protects this shape by failing legacy app-shell paths,
legacy nested service paths and non-PascalCase app shell, component TSX/SCSS or
service-boundary module filenames.

## Package Boundaries

The frontend monorepo uses local AIVIS packages:

- `@aivis/ui-library`: QHDS/QGDS-style React component adapters and shared
  theme entrypoint.
- `@aivis/ui-tokens`: semantic CSS variables and design tokens.
- `@aivis/ui-assets`: local icon and logo assets consumed by adapters.
- `@aivis/services`: Evidence Workbench view-model types, fallback fixture data
  and server-only backend/runtime service helpers.
- `@aivis/utils`: small shared formatting and utility functions.

The workbench app imports local adapters rather than scattered upstream design
system references. That keeps implementation ownership clear and makes package
checks meaningful.

## Review State And Rendering

The loaded fixture data is converted into a workbench view model. TanStack
Query owns the client-side server-state read, refresh and backend review-action
mutation state. Client components still manage reviewer UI state with React
reducer state so fallback review actions, reset behaviour and route-local
choices remain understandable.

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
pnpm --filter @aivis/workbench test
pnpm --filter @aivis/workbench typecheck
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
