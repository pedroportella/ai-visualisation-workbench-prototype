import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QhdsGlobalAlert } from "@aivis/ui-library";
import { fallbackEvidenceWorkbenchData } from "@aivis/services/fixtures";

import { WorkbenchAppShell } from "./WorkbenchAppShell";

const styles = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "WorkbenchAppShell.scss"), "utf8");
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
      <WorkbenchAppShell initialData={fallbackEvidenceWorkbenchData}>
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
    expect(html).toContain('id="main-nav-mobile"');
    expect(html).toContain('aria-controls="main-nav"');
    expect(html).toContain("qld__main-nav qld__main-nav--mega qhds-header__main-nav");
    expect(html).toContain("qld__main-nav__content");
    expect(html).toContain("qld__main-nav__overlay");
    expect(html).toContain("qld__main-nav__cta-wrapper");
    expect(html).not.toContain("qhds-side-nav__heading");
    expect(html).toContain("Overview");
    expect(html).toContain("Review answer");
    expect(html).toContain("Source evidence");
    expect(html).toContain("Evidence map");
    expect(html).toContain("Audit state");
    expect(html).toContain('href="/evidence-workbench/review"');
    expect(html).toContain('href="/evidence-workbench/sources"');
    expect(html).toContain('href="/evidence-workbench/process"');
    expect(html).toContain('href="/evidence-workbench/audit"');
    expect(html).toContain('aria-current="page"');
    expect(html).not.toContain('href="#review-decision-title"');
    expect(html).not.toContain('href="#audit-summary"');
    expect(html).toContain("qld__left-nav__item-toggle qld__accordion--closed");
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain("qld__accordion--closed qld__accordion__body");
    expect(html).toContain('href="https://www.qld.gov.au/contact-us"');
    expect(html).toContain("Contact us");
    expect(html).toContain("Fixture reviewer");
    expect(html).toContain("Exit");
    expect(html).not.toContain('id="qld-header-main-nav"');
    expect(html).not.toContain('aria-label="Evidence data state"');
    expect(html).not.toContain("evidence-workbench-data-state");
    expect(html).not.toContain("workbench-task-header__server-state");
  });

  it("marks the review route separately from the overview route", () => {
    mockUsePathname.mockReturnValue("/evidence-workbench/review");

    const html = renderToStaticMarkup(
      <WorkbenchAppShell initialData={fallbackEvidenceWorkbenchData}>
        <section aria-labelledby="evidence-workbench-title">
          <h1 id="evidence-workbench-title">AI Visualisation Workbench</h1>
        </section>
      </WorkbenchAppShell>
    );
    const sideNavHtml = html.slice(html.indexOf('id="section-navigation"'));
    const activeItemIndex = sideNavHtml.indexOf('aria-current="page" class="active has-child qhds-side-nav__item"');
    const reviewLabelIndex = sideNavHtml.indexOf("Review answer");

    expect(activeItemIndex).toBeGreaterThanOrEqual(0);
    expect(reviewLabelIndex).toBeGreaterThan(activeItemIndex);
    expect(html).toContain('href="/evidence-workbench"');
    expect(html).not.toContain('href="/evidence-workbench/review"');
    expect(html).toContain("qld__left-nav__item-link--open");
    expect(html).toContain("qld__left-nav__item-toggle qld__accordion--open");
    expect(html).toContain('aria-expanded="true"');
  });

  it("keeps the review branch open when a nested workbench route is active", () => {
    mockUsePathname.mockReturnValue("/evidence-workbench/sources");

    const html = renderToStaticMarkup(
      <WorkbenchAppShell initialData={fallbackEvidenceWorkbenchData}>
        <section aria-labelledby="evidence-workbench-title">
          <h1 id="evidence-workbench-title">AI Visualisation Workbench</h1>
        </section>
      </WorkbenchAppShell>
    );
    const sideNavHtml = html.slice(html.indexOf('id="section-navigation"'));
    const openParentIndex = sideNavHtml.indexOf("qld__left-nav__item-link qld__left-nav__item-link--open");
    const sourcesActiveIndex = sideNavHtml.indexOf('aria-current="page" class="active qhds-side-nav__item"');
    const sourcesLabelIndex = sideNavHtml.indexOf("Source evidence");

    expect(openParentIndex).toBeGreaterThanOrEqual(0);
    expect(sourcesActiveIndex).toBeGreaterThan(openParentIndex);
    expect(sourcesLabelIndex).toBeGreaterThan(sourcesActiveIndex);
    expect(html).toContain('href="/evidence-workbench/review"');
    expect(html).not.toContain('href="/evidence-workbench/sources"');
    expect(html).toContain("qld__left-nav__item-toggle qld__accordion--open");
    expect(html).toContain("qld__accordion--open qld__accordion__body");
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
            Review can continue against the local fixture state.
          </QhdsGlobalAlert>
        }
        initialData={fallbackEvidenceWorkbenchData}
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

  it("keeps mobile side-nav hiding local without reaching into layout gutters", () => {
    expect(styles).toContain(".aivis-app-shell .qhds-layout__main");
    expect(styles).toContain("background: var(--aivis-shell-page)");
    expect(styles).toContain("color: var(--aivis-shell-text)");
    expect(styles).toContain("@media (max-width: 75rem)");
    expect(styles).toContain(
      ".aivis-app-shell.qhds-layout--has-left-nav .qhds-layout__left-nav"
    );
    expect(styles).not.toContain(
      ".qld__body--left-nav .qhds-layout__container"
    );
    expect(styles).not.toContain(
      "qhds-layout__main-section-body"
    );
  });
});
