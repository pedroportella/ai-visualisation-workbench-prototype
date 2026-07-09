import type { ReactElement } from "react";

import {
  QhdsButton,
  QhdsContentSection
} from "@aivis/ui-library";

import { AivisEvidencePanelHeader } from "../../evidence/AivisEvidence";
import type { ReviewDecisionState } from "../../state/reviewDecisionState";
import type { SourceBlockerIssue } from "../../sources/SourcesBlockerTarget";

interface ReviewDecisionGateProps {
  review: ReviewDecisionState["review"];
  selectedIssue: SourceBlockerIssue | null;
}

export function ReviewDecisionGate({
  review,
  selectedIssue
}: Readonly<ReviewDecisionGateProps>): ReactElement {
  const selectedBlockerLabel = selectedIssue
    ? `${selectedIssue.warningId}: ${selectedIssue.warningMessage}`
    : "No source blocker is selected.";

  return (
    <QhdsContentSection
      className="evidence-workbench-panel evidence-workbench-review-decision-section"
      heading="Decision required"
      headingId="review-decision-required-title"
      lead="Start here: decide what must happen before this answer can be copied or approved."
      leadDensity="compact"
      withBodyClass={false}
    >
      <div className="evidence-workbench-summary-card evidence-workbench-summary-card--warning evidence-workbench-review-decision-card">
        <AivisEvidencePanelHeader
          label="Current decision"
          status={review.copyState === "enabled" ? "Ready to copy" : "Do not use yet"}
          statusTone={review.copyState === "enabled" ? "success" : "warning"}
        />
        <h3>
          {review.copyState === "enabled"
            ? "This answer can be copied after review."
            : "This answer cannot be used yet."}
        </h3>
        <p>
          {selectedIssue
            ? `${selectedBlockerLabel} is blocking approval. Record a local review action before anyone uses the answer.`
            : "A source blocker must be selected before the next local review action can be recorded."}
        </p>
        <div className="evidence-workbench-summary-card__actions evidence-workbench-review-decision-card__actions">
          <QhdsButton
            aria-controls="review-current-blocker-accordion-panel"
            href="#review-current-blocker-accordion-button"
            onNavigate={openReviewAccordionAnchor}
          >
            Review blocker
          </QhdsButton>
          <QhdsButton
            aria-controls="review-take-action-accordion-panel"
            href="#review-take-action-accordion-button"
            onNavigate={openReviewAccordionAnchor}
            variant="secondary"
          >
            Skip to final action
          </QhdsButton>
          <QhdsButton
            aria-controls="review-answer-accordion-panel"
            href="#review-answer-accordion-button"
            onNavigate={openReviewAccordionAnchor}
            variant="tertiary"
          >
            Read draft answer
          </QhdsButton>
        </div>
      </div>
    </QhdsContentSection>
  );
}

function openReviewAccordionAnchor(href: string): void {
  if (typeof document === "undefined") {
    return;
  }

  const targetId = href.startsWith("#") ? href.slice(1) : href;
  const target = document.getElementById(targetId);

  if (!target) {
    return;
  }

  if (typeof window !== "undefined" && href.startsWith("#")) {
    window.history.pushState(null, "", href);
  }

  if (target instanceof HTMLButtonElement && target.getAttribute("aria-expanded") !== "true") {
    target.click();
  }

  target.focus({ preventScroll: true });
  target.scrollIntoView({ block: "start" });
}
