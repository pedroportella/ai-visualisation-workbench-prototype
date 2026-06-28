import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { fallbackEvidenceWorkbenchData } from "../../services/evidence-workbench/fallback-fixture";
import EvidenceWorkbenchContainer from "./evidence-workbench-container";

describe("EvidenceWorkbenchContainer", () => {
  it("uses the government web-app content-section and grid pattern", () => {
    const html = renderToStaticMarkup(
      <EvidenceWorkbenchContainer data={fallbackEvidenceWorkbenchData} />
    );

    expect(html).toContain("ssq-page-header");
    expect(html).toContain(
      '<h1 class="ssq-page-header__heading" id="evidence-workbench-title">Evidence Workbench</h1>'
    );
    expect(html).not.toContain("ssq-page-header__context");
    expect(html).toContain("row evidence-workbench-grid");
    expect(html).toContain("col-xs-12 col-lg-12 col-xl-6");
    expect(html).toContain("ssq-content-section");
    expect(html).not.toContain("evidence-workbench-panel-wide");
  });
});
