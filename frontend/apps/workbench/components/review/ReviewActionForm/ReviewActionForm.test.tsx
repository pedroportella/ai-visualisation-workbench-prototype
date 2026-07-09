import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { PRIMARY_REVIEW_ACTION_ID } from "@aivis/services";
import { fallbackEvidenceWorkbenchData } from "@aivis/services/fixtures";
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
        reviewActionState={{
          errorMessage: null,
          isPending: false,
          mode: "fallback",
          successMessage: null
        }}
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
    expect(html).toContain("Local fallback action");
    expect(html).toContain("Local fixture records this in local UI state.");
    expect(html).toContain("Mark unsafe to use");
    expect(html).toContain("Target: WARN-FALLBACK-001 on SRC-FALLBACK-002.");
    expect(html).toContain("Copy unavailable");
    expect(html).toContain('data-copy-state="disabled"');
    expect(html).toContain("Local audit details");
    expect(html).toContain("Reset local review state");
  });

  it("renders backend mode with only backend-supported action choices", () => {
    const data = {
      ...fallbackEvidenceWorkbenchData,
      fetchState: {
        source: "backend" as const
      },
      review: {
        ...fallbackEvidenceWorkbenchData.review,
        actions: fallbackEvidenceWorkbenchData.review.actions.filter(
          (action) => action.id === PRIMARY_REVIEW_ACTION_ID
        )
      }
    };
    const state = createInitialReviewDecisionState(data);
    const issues = buildSourceBlockerIssues(data.sourceItems);
    const selectedIssue = selectedSourceIssue(issues, issues[0]?.id ?? null);
    const html = renderToStaticMarkup(
      <ReviewActionForm
        flow="decision"
        labelledBy="review-take-action-accordion-button"
        onApplyAction={() => undefined}
        onReset={() => undefined}
        reviewActionState={{
          errorMessage: null,
          isPending: false,
          mode: "backend",
          successMessage: null
        }}
        selectedIssue={selectedIssue}
        state={state}
      />
    );

    expect(html).toContain("Backend action");
    expect(html).toContain("Records through the backend fixture.");
    expect(html).toContain("Request source update selected.");
    expect(html).not.toContain("Add review note");
    expect(html).not.toContain("Escalate to source owner");
    expect(html).not.toContain("Mark unsafe to use");
    expect(html).not.toContain("Mark reviewed");
  });
});
