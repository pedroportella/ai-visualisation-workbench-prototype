import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { WorkbenchCaseBar } from "./workbench-case-bar";

describe("WorkbenchCaseBar", () => {
  it("surfaces the compact review state and fixture metadata", () => {
    const html = renderToStaticMarkup(
      <WorkbenchCaseBar
        blockerCount={3}
        caseTitle="Step-free transfer guidance needs evidence review"
        dataSource="Backend fixture"
        fixtureMode="Synthetic fixture"
        generatedAt="2026-06-27T10:15:00+10:00"
        runtimeMode="Local fixture"
        status="Needs review"
      />
    );

    expect(html).toContain("evidence-workbench-case-bar");
    expect(html).toContain(
      '<h1 class="evidence-workbench-case-bar__heading" id="evidence-workbench-title">Evidence Workbench</h1>'
    );
    expect(html).toContain("Step-free transfer guidance needs evidence review");
    expect(html).toContain("Needs review");
    expect(html).toContain("3 approval blockers");
    expect(html).toContain("2026-06-27T10:15:00+10:00");
    expect(html).toContain("Synthetic fixture / Backend fixture");
    expect(html).toContain("Local fixture");
  });
});
