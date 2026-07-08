import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { fallbackEvidenceWorkbenchData } from "../../../services/evidence-workbench/fallback-fixture";
import {
  buildSourceBlockerIssues,
  selectedSourceIssue
} from "../../sources/SourcesBlockerTarget";
import { createInitialReviewDecisionState } from "../../state/reviewDecisionState";
import { ReviewActionForm } from ".";

describe("ReviewActionForm", () => {
  it("renders the decision flow with note, selected action and disabled copy state", () => {
    const state = createInitialReviewDecisionState(fallbackEvidenceWorkbenchData);
    const issues = buildSourceBlockerIssues(fallbackEvidenceWorkbenchData.sourceItems);
    const selectedIssue = selectedSourceIssue(issues, issues[0]?.id ?? null);
    const html = renderToStaticMarkup(
      <ReviewActionForm
        flow="decision"
        labelledBy="review-take-action-accordion-button"
        onApplyAction={() => undefined}
        onReset={() => undefined}
        selectedIssue={selectedIssue}
        state={state}
      />
    );

    expect(html).toContain('aria-labelledby="review-take-action-accordion-button"');
    expect(html).toContain("Review decision");
    expect(html).toContain("Primary review decision context");
    expect(html).toContain("Decision option");
    expect(html).toContain("Reviewer note");
    expect(html).toContain("Request source update selected.");
    expect(html).toContain("Target: WARN-FALLBACK-001 on SRC-FALLBACK-002.");
    expect(html).toContain("Copy unavailable");
    expect(html).toContain('data-copy-state="disabled"');
    expect(html).toContain("Local audit details");
    expect(html).toContain("Reset local review state");
  });
});
