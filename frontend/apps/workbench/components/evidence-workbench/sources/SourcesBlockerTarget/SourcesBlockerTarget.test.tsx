import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { fallbackEvidenceWorkbenchData } from "../../../../services/evidence-workbench/fallback-fixture";
import {
  SourcesBlockerTarget,
  buildSourceBlockerIssues,
  selectedSourceIssue
} from ".";

describe("SourcesBlockerTarget", () => {
  it("builds source blocker issues from direct and relationship warnings", () => {
    const issues = buildSourceBlockerIssues(fallbackEvidenceWorkbenchData.sourceItems);

    expect(issues.map((issue) => issue.warningId)).toEqual([
      "WARN-FALLBACK-001",
      "WARN-FALLBACK-002",
      "WARN-FALLBACK-003"
    ]);
    expect(issues.map((issue) => issue.sourceId)).toEqual([
      "SRC-FALLBACK-002",
      "SRC-FALLBACK-002",
      "SRC-FALLBACK-003"
    ]);
    expect(issues[0]?.warningMessage).toBe("Temporary boarding map needs a freshness check.");
    expect(issues[1]?.warningMessage).toBe("Step-free shuttle wording is stronger than the evidence.");
    expect(issues[2]?.warningMessage).toBe("Dispatch confirmation is missing.");
  });

  it("renders a selected source blocker as the local action target", () => {
    const issues = buildSourceBlockerIssues(fallbackEvidenceWorkbenchData.sourceItems);
    const selectedIssue = issues[1];
    const html = renderToStaticMarkup(
      <SourcesBlockerTarget
        issues={issues}
        onSelectIssue={() => undefined}
        selectedIssueId={selectedIssue?.id ?? null}
        sourceInventoryPath="/evidence-workbench/sources"
      />
    );

    expect(html).toContain("3 blocker issues");
    expect(html).toContain('data-selected-source-issue-id="SRC-FALLBACK-002-WARN-FALLBACK-002"');
    expect(html).toContain("Selected source issue for local action");
    expect(html).toContain("WARN-FALLBACK-002: Step-free shuttle wording is stronger than the evidence.");
    expect(html).toContain("SRC-FALLBACK-002: Synthetic wayfinding map extract");
    expect(html).toContain("Synthetic owner");
    expect(html).toContain("qld__radio-buttons");
    expect(html).toContain("Choose source issue for local action");
    expect(html).toContain('checked="" value="SRC-FALLBACK-002-WARN-FALLBACK-002"');
    expect(html).toContain("Source blocker issues");
    expect(html).toContain("Selected for action");
    expect(html).toContain('href="/evidence-workbench/sources#source-SRC-FALLBACK-002-accordion-button"');
    expect(html).toContain("qld__direction-link");
    expect(html).toContain("Open source record");
  });

  it("can render the selected blocker before selection controls without the issue table", () => {
    const issues = buildSourceBlockerIssues(fallbackEvidenceWorkbenchData.sourceItems);
    const selectedIssue = issues[0];
    const html = renderToStaticMarkup(
      <SourcesBlockerTarget
        issues={issues}
        onSelectIssue={() => undefined}
        selectedIssueId={selectedIssue?.id ?? null}
        selectedSummaryPosition="before-selector"
        showIssueTable={false}
        sourceInventoryPath="/evidence-workbench/sources"
      />
    );
    const selectedSummaryIndex = html.indexOf("Selected source issue for local action");
    const selectorIndex = html.indexOf("Choose source issue for local action");

    expect(selectedSummaryIndex).toBeGreaterThanOrEqual(0);
    expect(selectorIndex).toBeGreaterThan(selectedSummaryIndex);
    expect(html).toContain("WARN-FALLBACK-001: Temporary boarding map needs a freshness check.");
    expect(html).not.toContain("Source blocker issues");
    expect(html).not.toContain("Selected for action");
  });

  it("renders a lighter focused issue summary for source inspection", () => {
    const issues = buildSourceBlockerIssues(fallbackEvidenceWorkbenchData.sourceItems);
    const selectedIssue = issues[0];
    const html = renderToStaticMarkup(
      <SourcesBlockerTarget
        actionMode="inspect"
        issues={issues}
        onSelectIssue={() => undefined}
        reviewActionPath="/evidence-workbench/review"
        selectedIssueId={selectedIssue?.id ?? null}
        selectedSummaryPosition="before-selector"
        showIssueTable={false}
        sourceInventoryPath="/evidence-workbench/sources"
      />
    );

    expect(html).toContain("Focused source issue");
    expect(html).toContain("Focused issue");
    expect(html).toContain("Action route");
    expect(html).toContain("Continue to the review route to record a local action.");
    expect(html).toContain("Choose source issue to inspect");
    expect(html).toContain('href="/evidence-workbench/sources#source-SRC-FALLBACK-002-accordion-button"');
    expect(html).toContain('href="/evidence-workbench/review"');
    expect(html).toContain("qld__direction-link--right");
    expect(html).not.toContain("Source status");
    expect(html).not.toContain("Synthetic owner");
    expect(html).not.toContain("Selected for action");
  });

  it("falls back to the first blocker issue when the selected issue id is unavailable", () => {
    const issues = buildSourceBlockerIssues(fallbackEvidenceWorkbenchData.sourceItems);

    expect(selectedSourceIssue(issues, "unknown")?.warningId).toBe("WARN-FALLBACK-001");
  });
});
