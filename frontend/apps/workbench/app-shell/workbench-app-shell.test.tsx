import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QhdsGlobalAlert } from "@aivis/ui-library";

import { WorkbenchAppShell } from "./workbench-app-shell";

const styles = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "workbench-app-shell.scss"), "utf8");
const mockUsePathname = vi.hoisted(() => vi.fn(() => "/evidence-workbench"));

vi.mock("next/navigation", () => ({
  usePathname: mockUsePathname
}));

describe("WorkbenchAppShell", () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue("/evidence-workbench");
  });

  it("renders the QGDS-style header, pre-header, crest lockup and side navigation", () => {
    const html = renderToStaticMarkup(
      <WorkbenchAppShell>
        <section aria-labelledby="evidence-workbench-title">
          <h1 id="evidence-workbench-title">AI Visualisation Workbench</h1>
        </section>
      </WorkbenchAppShell>
    );

    expect(html).toContain("qld__header__pre-header");
    expect(html).toContain("qld.gov.au");
    expect(html).toContain('alt="Queensland Government"');
    expect(html).toContain("qhds-header__qg-logo");
    expect(html).toContain("AI Visualisation Workbench");
    expect(html).toContain("Evidence Workbench");
    expect(html).toContain("qld__left-nav");
    expect(html).toContain("Skip to section navigation");
    expect(html).toContain('id="section-navigation"');
    expect(html).toContain("Overview");
    expect(html).toContain("Review answer");
    expect(html).toContain("Source blockers");
    expect(html).toContain("Evidence map");
    expect(html).toContain("Audit state");
    expect(html).toContain('href="/evidence-workbench/review"');
    expect(html).toContain('href="/evidence-workbench/sources"');
    expect(html).toContain('href="/evidence-workbench/process"');
    expect(html).toContain('href="/evidence-workbench/audit"');
    expect(html).toContain('aria-current="page"');
    expect(html).not.toContain('href="#review-decision-title"');
    expect(html).not.toContain('href="#audit-summary"');
    expect(html).not.toContain("qld__left-nav__item-toggle");
    expect(html).toContain('href="https://www.qld.gov.au/contact-us"');
    expect(html).toContain("Contact us");
    expect(html).not.toContain("Local fixture");
  });

  it("marks the review route separately from the overview route", () => {
    mockUsePathname.mockReturnValue("/evidence-workbench/review");

    const html = renderToStaticMarkup(
      <WorkbenchAppShell>
        <section aria-labelledby="evidence-workbench-title">
          <h1 id="evidence-workbench-title">AI Visualisation Workbench</h1>
        </section>
      </WorkbenchAppShell>
    );
    const activeItemIndex = html.indexOf('aria-current="page" class="active qhds-side-nav__item"');
    const reviewLabelIndex = html.indexOf("Review answer");

    expect(activeItemIndex).toBeGreaterThanOrEqual(0);
    expect(reviewLabelIndex).toBeGreaterThan(activeItemIndex);
    expect(html).toContain('href="/evidence-workbench"');
    expect(html).not.toContain('href="/evidence-workbench/review"');
  });

  it("renders a supplied global alert under the header before the workbench body", () => {
    const html = renderToStaticMarkup(
      <WorkbenchAppShell
        globalAlert={
          <QhdsGlobalAlert
            action={{ href: "/evidence-workbench/review", label: "Start review" }}
            dismissible
            level="general"
            title="Backend fixture unavailable. Showing bundled fallback data."
            verticalNav
          >
            Review can continue against the bundled fallback fixture state.
          </QhdsGlobalAlert>
        }
      >
        <section aria-labelledby="evidence-workbench-title">
          <h1 id="evidence-workbench-title">Evidence Workbench</h1>
        </section>
      </WorkbenchAppShell>
    );
    const headerIndex = html.indexOf("qld__header");
    const alertIndex = html.indexOf("qld__global_alert_include");
    const mainIndex = html.indexOf('class="main qhds-layout__main"');
    const bodyIndex = html.indexOf("Evidence Workbench</h1>");

    expect(alertIndex).toBeGreaterThan(headerIndex);
    expect(mainIndex).toBeGreaterThan(alertIndex);
    expect(bodyIndex).toBeGreaterThan(mainIndex);
    expect(html).toContain('aria-label="Information"');
    expect(html).toContain("qld__global-alert qld__global-alert--general");
    expect(html).toContain("qhds-global-alert-include--vertical-nav");
    expect(html).toContain('href="/evidence-workbench/review"');
    expect(html).toContain("Close alert");
  });

  it("scopes constrained left-nav gutters to the workbench app shell", () => {
    expect(styles).toContain("@media (max-width: 75rem)");
    expect(styles).toContain(
      ".aivis-app-shell.qhds-layout--app.qhds-layout--has-left-nav .qld__body--left-nav .qhds-layout__container"
    );
    expect(styles).not.toContain(
      "\n.qld__body--left-nav .qhds-layout__container"
    );
  });
});
