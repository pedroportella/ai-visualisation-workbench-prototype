import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { fallbackEvidenceWorkbenchData } from "@aivis/services/fixtures";
import { EvidenceWorkbenchTaskHeader } from ".";

describe("EvidenceWorkbenchTaskHeader", () => {
  it("renders the active workbench view title and review status chips", () => {
    const html = renderToStaticMarkup(
      <EvidenceWorkbenchTaskHeader
        activeView="sources"
        review={fallbackEvidenceWorkbenchData.review}
      />
    );

    expect(html).toContain(
      '<h1 class="workbench-task-header__heading" id="evidence-workbench-title">Source evidence</h1>'
    );
    expect(html).toContain('aria-label="Review task state"');
    expect(html).toContain("Needs review");
    expect(html).toContain('aria-label="3 approval blockers"');
    expect(html).toContain("3 blockers");
    expect(html).toContain("Copy Disabled");
    expect(html).not.toContain('aria-label="Evidence data state"');
    expect(html).not.toContain("Local fixture");
    expect(html).not.toContain("Refresh evidence");
    expect(html).not.toContain("workbench-task-header__server-state");
  });
});
