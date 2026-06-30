import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { QhdsContentSection } from "./QhdsContentSection";

describe("QhdsContentSection", () => {
  it("renders a QHDS body section with labelled heading and content", () => {
    const html = renderToStaticMarkup(
      <QhdsContentSection heading="Request summary" lead="Review the submitted request.">
        <p>Reference SC-2026-0001</p>
      </QhdsContentSection>
    );

    expect(html).toContain("qld__body");
    expect(html).toContain("qhds-content-section");
    expect(html).toContain('aria-labelledby="request-summary-section"');
    expect(html).toContain("<h2");
    expect(html).toContain("qld__abstract");
    expect(html).toContain("Reference SC-2026-0001");
  });

  it("renders compact dense-section leads without qld abstract styling", () => {
    const html = renderToStaticMarkup(
      <QhdsContentSection
        heading="Source inspector"
        headingLevel={3}
        lead="Focused source evidence for the selected claim."
        leadDensity="compact"
      >
        <p>Selected source detail.</p>
      </QhdsContentSection>
    );

    expect(html).toContain("<h3");
    expect(html).toContain("qhds-content-section__lead--compact");
    expect(html).not.toContain("qld__abstract");
  });

  it("can omit the qld body class for nested app-owned sections", () => {
    const html = renderToStaticMarkup(
      <QhdsContentSection
        className="evidence-workbench-panel"
        heading="Nested panel"
        withBodyClass={false}
      >
        <p>Panel content.</p>
      </QhdsContentSection>
    );

    expect(html).toContain("qhds-content-section evidence-workbench-panel");
    expect(html).not.toContain("qld__body");
  });
});
