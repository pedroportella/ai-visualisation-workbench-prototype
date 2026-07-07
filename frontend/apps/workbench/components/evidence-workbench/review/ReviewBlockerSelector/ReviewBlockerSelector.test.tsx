import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { fallbackEvidenceWorkbenchData } from "../../../../services/evidence-workbench/fallback-fixture";
import {
  buildSourceBlockerIssues,
  selectedSourceIssue
} from "../../source-blocker-review";
import { ReviewBlockerSelector } from ".";

describe("ReviewBlockerSelector", () => {
  it("renders the selected approval blocker and review-owned selector", () => {
    const issues = buildSourceBlockerIssues(fallbackEvidenceWorkbenchData.sourceItems);
    const selectedIssue = selectedSourceIssue(issues, issues[1]?.id ?? null);
    const html = renderToStaticMarkup(
      <ReviewBlockerSelector
        issues={issues}
        onSelectIssue={() => undefined}
        selectedIssue={selectedIssue}
      />
    );

    expect(html).toContain("Approval blocker");
    expect(html).toContain("WARN-FALLBACK-002: Step-free shuttle wording is stronger than the evidence.");
    expect(html).toContain('data-selected-source-issue-id="SRC-FALLBACK-002-WARN-FALLBACK-002"');
    expect(html).toContain('href="/evidence-workbench/sources#source-SRC-FALLBACK-002"');
    expect(html).toContain("Change blocker");
    expect(html).toContain("Choose a different blocker");
    expect(html).toContain("evidence-workbench-review-blocker-selector__issue-selector");
    expect(html).toContain('checked="" value="SRC-FALLBACK-002-WARN-FALLBACK-002"');
  });

  it("keeps the empty fixture state message when no blocker is selected", () => {
    const html = renderToStaticMarkup(
      <ReviewBlockerSelector
        issues={[]}
        onSelectIssue={() => undefined}
        selectedIssue={null}
      />
    );

    expect(html).toContain("No source blocker issue is active in this local fixture state.");
  });
});
