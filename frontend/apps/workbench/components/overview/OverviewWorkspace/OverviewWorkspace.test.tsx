import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { fallbackEvidenceWorkbenchData } from "../../../services/evidence-workbench/fallback-fixture";
import { createInitialReviewDecisionState } from "../../state/reviewDecisionState";
import { summaryMap } from "../../shared/viewFormatters";
import { OverviewWorkspace } from ".";

describe("OverviewWorkspace", () => {
  it("renders the current review task and overview task launcher", () => {
    const html = renderToStaticMarkup(
      <OverviewWorkspace
        data={fallbackEvidenceWorkbenchData}
        decisionState={createInitialReviewDecisionState(fallbackEvidenceWorkbenchData)}
        summary={summaryMap(fallbackEvidenceWorkbenchData)}
      />
    );

    expect(html).toContain('id="overview-title"');
    expect(html).toContain("Current review task");
    expect(html).toContain("Step-free transfer guidance needs evidence review");
    expect(html).toContain('aria-label="Current review state"');
    expect(html).toContain("3 approval blockers");
    expect(html).toContain("Available next actions");
    expect(html).toContain("Request source update");
    expect(html).toContain("Source blockers");
    expect(html).toContain("Temporary boarding map needs a freshness check.");
    expect(html).toContain('id="task-launcher-title"');
    expect(html).toContain('aria-label="Evidence Workbench task launcher"');
    expect(html).toContain('href="/evidence-workbench/review"');
    expect(html).toContain(">Start review<");
    expect(html).toContain(">Review source evidence<");
    expect(html).toContain(">Open evidence map<");
    expect(html).toContain(">View audit state<");
  });
});
