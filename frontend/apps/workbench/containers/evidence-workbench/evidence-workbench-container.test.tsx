import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { fallbackEvidenceWorkbenchData } from "../../services/evidence-workbench/fallback-fixture";
import EvidenceWorkbenchContainer from "./evidence-workbench-container";

describe("EvidenceWorkbenchContainer", () => {
  it("uses the government web-app content-section and grid pattern", () => {
    const html = renderToStaticMarkup(
      <EvidenceWorkbenchContainer data={fallbackEvidenceWorkbenchData} />
    );

    expect(html).toContain("qhds-page-header");
    expect(html).toContain(
      '<h1 class="qhds-page-header__heading" id="evidence-workbench-title">Evidence Workbench</h1>'
    );
    expect(html).not.toContain("qhds-page-header__context");
    expect(html).toContain("row evidence-workbench-grid");
    expect(html).toContain("col-xs-12 col-lg-12 col-xl-6");
    expect(html).toContain("qhds-content-section");
    expect(html).toContain("qld__card");
    expect(html).toContain("aivis-evidence-claim-card");
    expect(html).toContain("aivis-evidence-path-list");
    expect(html).toContain("qld__table__wrapper");
    expect(html).toContain("qld__callout");
    expect(html).not.toContain("evidence-workbench-panel-wide");
    expect(html).not.toContain("evidence-workbench-claim ");
  });
});
