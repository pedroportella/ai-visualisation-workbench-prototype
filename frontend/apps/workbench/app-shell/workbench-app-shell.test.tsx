import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { WorkbenchAppShell } from "./workbench-app-shell";

const styles = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "workbench-app-shell.scss"), "utf8");

describe("WorkbenchAppShell", () => {
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
    expect(html).toContain('href="#review-decision-title"');
    expect(html).toContain('href="#audit-summary"');
    expect(html).not.toContain("qld__left-nav__item-toggle");
    expect(html).toContain('href="https://www.qld.gov.au/contact-us"');
    expect(html).toContain("Contact us");
    expect(html).not.toContain("Local fixture");
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
