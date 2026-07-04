import type { ReactElement } from "react";

import {
  AivisEvidenceStatus,
  QhdsContentSection,
  QhdsSummaryList
} from "@aivis/ui-library";

import type { ReviewDecisionState } from "./review-action-state";

export function AuditSummary({
  decisionState
}: Readonly<{ decisionState: ReviewDecisionState }>): ReactElement {
  const review = decisionState.review;
  const actionTarget = decisionState.lastActionTarget;

  return (
    <QhdsContentSection
      className="evidence-workbench-panel evidence-workbench-audit-summary"
      heading="Audit summary"
      headingId="audit-summary"
      tabIndex={0}
      withBodyClass={false}
    >
      <div
        className="evidence-workbench-audit-summary__state"
        data-copy-state={review.copyState}
      >
        <AivisEvidenceStatus tone={review.copyState === "enabled" ? "success" : "warning"}>
          {review.copyState === "enabled" ? "Copy can be reviewed" : "Copy remains unavailable"}
        </AivisEvidenceStatus>
        <p className="evidence-workbench-review-note">
          Copy state is {review.copyState}. Approval remains blocked by{" "}
          {review.blockedByWarningIds.join(", ")} with {review.activeWarningCount}{" "}
          active fixture warnings. Audit {decisionState.audit.id} last action is{" "}
          {decisionState.audit.lastReviewActionId ?? "none"}.
        </p>
      </div>
      <QhdsSummaryList
        ariaLabel="Local audit target summary"
        className="evidence-workbench-audit-summary__metadata"
        items={[
          {
            description: review.copyState,
            term: "Copy state"
          },
          {
            description: review.blockedByWarningIds.join(", ") || "No approval blockers recorded.",
            term: "Approval blockers"
          },
          {
            description: review.activeWarningCount,
            term: "Active warnings"
          },
          {
            description: decisionState.audit.lastReviewActionId ?? "None",
            term: "Last action"
          },
          {
            description: actionTarget
              ? `${actionTarget.warningId} on ${actionTarget.sourceId}: ${actionTarget.warningMessage}`
              : "No local action target recorded.",
            term: "Action target"
          },
          {
            description: decisionState.feedback,
            term: "Feedback"
          },
          {
            description: decisionState.isDirty
              ? "Local state has changed from the loaded fixture seed."
              : "Local state is at the loaded fixture seed.",
            term: "Reset state"
          }
        ]}
      />
    </QhdsContentSection>
  );
}
