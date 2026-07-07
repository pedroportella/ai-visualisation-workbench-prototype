import type { ReactElement } from "react";

import {
  AivisEvidenceStatus,
  QhdsSummaryList
} from "@aivis/ui-library";

import { REVIEW_ROUTE } from "./routeModel";
import type {
  ReviewActionTarget,
  ReviewDecisionState
} from "./state/reviewDecisionState";

export function AuditSummary({
  decisionState,
  selectedIssue
}: Readonly<{
  decisionState: ReviewDecisionState;
  selectedIssue: ReviewActionTarget | null;
}>): ReactElement {
  const review = decisionState.review;
  const actionTarget = decisionState.lastActionTarget;
  const availableActions = decisionState.actions.filter((action) =>
    review.availableActionIds.includes(action.id)
  );

  return (
    <div
      className="evidence-workbench-panel evidence-workbench-audit-summary"
      tabIndex={0}
    >
      <p className="qhds-content-section__lead qhds-content-section__lead--compact">
        Read-only local state for copy availability, selected issue, recorded
        action target and feedback.
      </p>
      <div
        className="evidence-workbench-audit-summary__state"
        data-copy-state={review.copyState}
      >
        <AivisEvidenceStatus tone={review.copyState === "enabled" ? "success" : "warning"}>
          {review.copyState === "enabled" ? "Copy can be reviewed" : "Copy remains unavailable"}
        </AivisEvidenceStatus>
        <p className="evidence-workbench-review-note">
          Copy state is {review.copyState}. Approval remains blocked by{" "}
          {review.blockedByWarningIds.join(", ")}. Audit {decisionState.audit.id} last
          action is {decisionState.audit.lastReviewActionId ?? "none"}.
        </p>
      </div>
      <QhdsSummaryList
        ariaLabel="Local audit target summary"
        className="evidence-workbench-audit-summary__metadata"
        items={[
          {
            description: review.status,
            term: "Review state"
          },
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
            description: selectedIssue
              ? `${selectedIssue.warningId} on ${selectedIssue.sourceId}: ${selectedIssue.warningMessage}`
              : "No source issue is selected for the next local action.",
            term: "Selected source issue"
          },
          {
            description:
              availableActions.map((action) => action.label).join(", ") ||
              "No local actions are available.",
            term: "Available local actions"
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
          },
          {
            description: <a href={REVIEW_ROUTE}>Record local actions on Review answer</a>,
            term: "Action route"
          }
        ]}
      />
    </div>
  );
}
