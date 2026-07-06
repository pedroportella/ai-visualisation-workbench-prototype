# Design-System Adapter

This page explains the local QHDS/QGDS-style adapter strategy used by the
Evidence Workbench. The goal is design consistency and reviewability without
scattering upstream imports through app code.

## What Exists

The frontend packages hold the design system layer:

- `@aivis/ui-tokens` defines QHDS/QGDS-style semantic variables and AIVIS
  workbench variables.
- `@aivis/ui-library` exposes React adapters such as headers, navigation,
  cards, tables, alerts, buttons, form controls, layout helpers and
  evidence-specific components.
- `@aivis/ui-assets` provides local icon and logo asset exports.
- The workbench app imports `@aivis/ui-library/theme.scss` once from the app
  layout.

App-specific layout and evidence-map styling stays in the workbench app. Shared
tokens and reusable adapters stay in packages.

## Why Use Local Adapters

Local adapters keep the prototype honest:

- the repo can test the exact components it renders;
- AIVIS-specific workbench variants can be named clearly;
- token changes can be reviewed in one package;
- browser-visible assets remain in the public repo;
- app code does not depend on private or machine-local design references.

This also makes future replacement easier. If an official design-system
package is introduced later, the adapter boundary is the place to map the new
source into existing workbench components.

## Tokens And Theme Posture

The token package exposes semantic CSS variables for surfaces, text, focus,
spacing, radius, layout and workbench-specific evidence states. Components
consume semantic variables such as `--qhds-*` and `--aivis-*` instead of
hard-coding every visual value at the point of use.

Dark screenshots in the reviewer pack are theme-token preview examples. They
are not proof of a user-facing theme switcher. Current maintained visual
evidence comes from no-screenshot DOM/layout and theme-token checks.

## Evidence

Useful checks:

```text
pnpm --filter @aivis/ui-tokens check
pnpm --filter @aivis/ui-library check
pnpm test:visual
```

The visual check verifies route-level layout, focus visibility, responsive
navigation, theme surfaces and overflow without capturing new screenshots.

## Known Limits

The adapter layer is a local prototype implementation. It is not a formal
design-system conformance certificate, not a formal accessibility assurance
and not proof of a production Queensland Government service.
