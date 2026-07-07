import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { fallbackEvidenceWorkbenchData } from "../../../../services/evidence-workbench/fallback-fixture";
import {
  buildSourceBlockerIssues,
  selectedSourceIssue
} from "../../sources/SourcesBlockerTarget";
import { createInitialReviewDecisionState } from "../../state/reviewDecisionState";
import { ReviewDecisionGate } from ".";

describe("ReviewDecisionGate", () => {
  it("renders the decision-required summary and accordion jump links", () => {
    const reviewState = createInitialReviewDecisionState(fallbackEvidenceWorkbenchData);
    const sourceBlockerIssues = buildSourceBlockerIssues(
      fallbackEvidenceWorkbenchData.sourceItems
    );
    const selectedIssue = selectedSourceIssue(
      sourceBlockerIssues,
      sourceBlockerIssues[0]?.id ?? null
    );
    const html = renderToStaticMarkup(
      <ReviewDecisionGate
        review={reviewState.review}
        selectedIssue={selectedIssue}
      />
    );

    expect(html).toContain('id="review-decision-required-title"');
    expect(html).toContain("Decision required");
    expect(html).toContain("This answer cannot be used yet.");
    expect(html).toContain("WARN-FALLBACK-001: Temporary boarding map needs a freshness check.");
    expect(html).toContain(">Review blocker<");
    expect(html).toContain('href="#review-current-blocker-accordion-button"');
    expect(html).toContain(">Skip to final action<");
    expect(html).toContain('href="#review-take-action-accordion-button"');
    expect(html).toContain(">Read draft answer<");
    expect(html).toContain('href="#review-answer-accordion-button"');
  });
});
