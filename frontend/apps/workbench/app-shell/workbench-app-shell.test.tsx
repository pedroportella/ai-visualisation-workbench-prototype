import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { WorkbenchAppShell } from "./workbench-app-shell";

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
    expect(html).toContain("ssq-header__qg-logo");
    expect(html).toContain("AI Visualisation Workbench");
    expect(html).toContain("Evidence Workbench");
    expect(html).toContain("qld__left-nav");
    expect(html).toContain("Skip to section navigation");
    expect(html).toContain('id="section-navigation"');
  });
});
