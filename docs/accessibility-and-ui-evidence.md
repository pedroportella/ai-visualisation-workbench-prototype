# Accessibility And UI Evidence

This page explains accessibility-conscious and UI-quality evidence in the
current prototype. It is not a formal WCAG audit and not a formal
accessibility assurance.

## Implemented UI Evidence

| Area | Evidence |
| --- | --- |
| Main landmark and route headings | Each Evidence Workbench route is checked for a single visible H1 and a labelled main work region. |
| ARIA references | No-screenshot checks verify that `aria-controls`, `aria-describedby` and `aria-labelledby` targets resolve. |
| Keyboard focus | Route controls, review actions, citation links, the text process map and mobile menu controls are checked for focus behaviour. |
| Navigation state | Side navigation and mobile drawer state are checked for `aria-current`, `aria-expanded`, hidden main content while the drawer is open and focus restoration. |
| Text process map | The React Flow evidence map has a focusable text fallback region with ordered steps. |
| Warning posture | Blockers, missing evidence, stale sources and disabled action reasons are text labels, not colour-only signals. |
| Responsive layout | Checks cover desktop and mobile viewports, route height ceilings, horizontal overflow and action-control fit. |
| Theme-token stability | Light and dark colour-scheme contexts are checked without capturing new screenshots. |

## Why This Evidence Matters

The prototype is an evidence review tool. Reviewers need a path that remains
usable when visual density, evidence maps and warnings are all present. The
current checks focus on the practical failure modes for this slice: missing
headings, broken ARIA references, inaccessible fallback content, overflowing
controls and navigation states that trap or lose focus.

## Useful Checks

```text
pnpm test:visual
pnpm test:e2e:mock
pnpm --filter @aivis/ui-library check
```

`pnpm test:visual` is a no-screenshot DOM/layout check. It does not create new
screenshots and it is the maintained visual evidence while screenshot capture
is outside the current evidence set.

## Manual Review Notes

Automated route checks do not replace manual assistive technology review,
content review, contrast review across every state or formal WCAG assessment.
The repository also does not currently claim axe, Lighthouse, WAVE or other
accessibility automation.

## Limits

The current UI evidence is review-grade prototype evidence. It is not formal WCAG assurance,
not a production accessibility sign-off and not evidence of an official
service.
