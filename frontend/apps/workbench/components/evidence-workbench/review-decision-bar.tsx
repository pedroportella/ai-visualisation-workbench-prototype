"use client";

import { useId, useState, type ChangeEvent } from "react";
import {
  AivisEvidenceStatus,
  QhdsAccordion,
  QhdsButton,
  QhdsRadioGroup,
  QhdsSummaryList,
  QhdsTextarea,
  type AivisEvidenceTone
} from "@aivis/ui-library";

import {
  MARK_REVIEWED_ACTION_ID,
  PRIMARY_REVIEW_ACTION_ID,
  PRIMARY_REVIEWER_NOTE
} from "../../services/evidence-workbench/review-action-fixture";
import type { EvidenceWorkbenchReviewAction } from "../../services/evidence-workbench/types";
import {
  getReviewActionAvailability,
  type ReviewActionAvailability,
  type ReviewActionTarget,
  type ReviewDecisionState
} from "./review-action-state";

export interface ReviewDecisionBarProps {
  flow?: "audit" | "decision";
  labelledBy?: string;
  onApplyAction: (
    actionId: string,
    reviewerNote: string,
    targetIssue: ReviewActionTarget | null
  ) => void;
  onReset: () => void;
  selectedIssue: ReviewActionTarget | null;
  state: ReviewDecisionState;
}

export function ReviewDecisionBar({
  flow = "audit",
  labelledBy,
  onApplyAction,
  onReset,
  selectedIssue,
  state
}: ReviewDecisionBarProps) {
  const baseId = useId();
  const copyReasonId = `${baseId}-copy-reason`;
  const selectedActionReasonId = `${baseId}-selected-action-reason`;
  const [reviewerNote, setReviewerNote] = useState(
    state.review.reviewerNote ?? PRIMARY_REVIEWER_NOTE
  );
  const copyDisabled = state.review.copyState !== "enabled";
  const copyReason =
    state.review.blockedByWarningIds.length > 0
      ? `Copy stays disabled because ${formatList(state.review.blockedByWarningIds)} still block approval.`
      : "Copy can be enabled once the review state is marked reviewed.";
  const actionPath =
    selectedIssue
      ? `${selectedIssue.sourceId} -> ${selectedIssue.warningId} -> ${PRIMARY_REVIEW_ACTION_ID}`
      : state.review.blockedByWarningIds.length > 0
        ? `${state.review.selectedClaimId} -> ${formatList(state.review.blockedByWarningIds)} -> ${PRIMARY_REVIEW_ACTION_ID}`
      : `${state.review.selectedClaimId} has no active approval blockers.`;
  const selectedIssueLabel = selectedIssue
    ? `${selectedIssue.warningId}: ${selectedIssue.warningMessage} (${selectedIssue.sourceId}, ${selectedIssue.ownerLabel})`
    : "No source blocker issue selected.";
  const isDecisionFlow = flow === "decision";
  const primaryAction =
    state.actions.find((action) => action.id === PRIMARY_REVIEW_ACTION_ID) ??
    state.actions[0] ??
    null;
  const primaryActionDescription = primaryAction
    ? `${primaryAction.label}: ${
        getReviewActionAvailability(state.review, primaryAction, reviewerNote).reason ??
        actionReason(primaryAction, selectedIssue)
      }`
    : "No local review action is available in this fixture state.";
  const initialSelectedActionId = primaryAction?.id ?? state.actions[0]?.id ?? "";
  const [selectedActionId, setSelectedActionId] = useState(initialSelectedActionId);

  const handleNoteChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setReviewerNote(event.target.value);
  };
  const handleReset = () => {
    onReset();
    setReviewerNote(PRIMARY_REVIEWER_NOTE);
    setSelectedActionId(initialSelectedActionId);
  };
  const selectedAction =
    state.actions.find((action) => action.id === selectedActionId) ??
    primaryAction ??
    state.actions[0] ??
    null;
  const selectedActionAvailability = selectedAction
    ? getReviewActionAvailability(state.review, selectedAction, reviewerNote)
    : null;
  const selectedActionReason = selectedAction
    ? actionReasonText(selectedAction, selectedActionAvailability, selectedIssue)
    : "No local review action is available in this fixture state.";
  const selectedActionStatus = selectedAction
    ? `${selectedAction.label} selected.`
    : "No action selected.";
  const canSubmitSelectedAction =
    selectedAction !== null && selectedActionAvailability?.disabled !== true;
  const selectedActionSubmitLabel = selectedAction?.label ?? "Record action";
  const selectedActionSubmitVariant =
    selectedAction?.uiTone === "primary" && canSubmitSelectedAction
      ? "primary"
      : "secondary";
  const handleSelectedActionSubmit = () => {
    if (!selectedAction || selectedActionAvailability?.disabled) {
      return;
    }

    onApplyAction(selectedAction.id, reviewerNote, selectedIssue);
  };
  const copyState = (
    <div
      className="evidence-workbench-review-actions__copy-state"
      data-copy-state={copyDisabled ? "disabled" : "enabled"}
    >
      <div className="evidence-workbench-review-actions__footer-copy">
        <strong>{copyDisabled ? "Copy unavailable" : "Copy ready"}</strong>
        <p id={copyReasonId}>{copyReason}</p>
      </div>
      <QhdsButton
        aria-describedby={copyReasonId}
        disabled={copyDisabled}
        type="button"
        variant="secondary"
      >
        Copy approved answer
      </QhdsButton>
    </div>
  );
  const reviewerNoteInput = (
    <QhdsTextarea
      className="evidence-workbench-review-actions__note-input"
      hint="Stored only in this local prototype state."
      label="Reviewer note"
      onChange={handleNoteChange}
      rows={3}
      value={reviewerNote}
    />
  );
  const reviewActionChoices = (
    <QhdsRadioGroup
      beforeOptions={isDecisionFlow ? reviewerNoteInput : undefined}
      className="evidence-workbench-review-action-choices"
      hint="Choose one local action path, then record it once."
      legend="Decision option"
      name={`${baseId}-review-action-choice`}
      onChange={setSelectedActionId}
      options={state.actions.map((action) => {
        const availability = getReviewActionAvailability(
          state.review,
          action,
          reviewerNote
        );
        const isSelected = selectedAction?.id === action.id;

        return {
          disabled: availability.disabled,
          label: (
            <ReviewActionChoiceLabel
              action={action}
              isSelected={isSelected}
              reason={actionReasonText(action, availability, selectedIssue)}
              state={availability.disabled ? "unavailable" : isSelected ? "selected" : "available"}
            />
          ),
          value: action.id
        };
      })}
      value={selectedAction?.id ?? ""}
    />
  );
  const controlsClassName = [
    "evidence-workbench-review-actions__controls",
    isDecisionFlow ? "evidence-workbench-review-actions__controls--action-first" : ""
  ]
    .filter(Boolean)
    .join(" ");
  const controls = (
    <div className={controlsClassName}>
      {isDecisionFlow ? (
        <>
          {reviewActionChoices}
          <div
            aria-live="polite"
            className="evidence-workbench-review-actions__selected-action"
            data-action-enabled={canSubmitSelectedAction ? "true" : "false"}
            data-action-tone={selectedAction?.uiTone ?? "secondary"}
          >
            <div className="evidence-workbench-review-actions__footer-copy">
              <strong>{selectedActionStatus}</strong>
              <p id={selectedActionReasonId}>{selectedActionReason}</p>
            </div>
            <QhdsButton
              aria-describedby={selectedActionReasonId}
              aria-disabled={!canSubmitSelectedAction || undefined}
              className="evidence-workbench-review-actions__selected-action-button"
              disabled={!canSubmitSelectedAction}
              onClick={handleSelectedActionSubmit}
              type="button"
              variant={selectedActionSubmitVariant}
            >
              {selectedActionSubmitLabel}
            </QhdsButton>
          </div>
        </>
      ) : (
        <>
          {reviewerNoteInput}
          {reviewActionChoices}
        </>
      )}
    </div>
  );
  const standardSummaryItems = [
    { description: selectedIssueLabel, term: "Selected source issue" },
    { description: state.feedback, term: "Feedback" },
    { description: actionPath, term: "Warning path" },
    {
      description: lastActionTargetLabel(state.lastActionTarget),
      term: "Last local action target"
    },
    {
      description: `${state.audit.id}: ${state.audit.reviewEventIds.length} fixture events; last action ${state.audit.lastReviewActionId ?? "none"}.`,
      term: "Audit"
    },
    {
      description: `${state.localStateLabel}; reset returns this panel to the loaded fixture seed.`,
      term: "Local state"
    }
  ];
  const decisionSummaryItems = [
    { description: selectedIssueLabel, term: "Action target" },
    { description: primaryActionDescription, term: "Recommended action" },
    { description: state.feedback, term: "Local feedback" }
  ];
  const auditContextItems = [
    { description: actionPath, term: "Warning path" },
    {
      description: lastActionTargetLabel(state.lastActionTarget),
      term: "Last local action target"
    },
    {
      description: `${state.audit.id}: ${state.audit.reviewEventIds.length} fixture events; last action ${state.audit.lastReviewActionId ?? "none"}.`,
      term: "Audit"
    },
    {
      description: `${state.localStateLabel}; reset returns this panel to the loaded fixture seed.`,
      term: "Local state"
    }
  ];

  const sectionLead = isDecisionFlow
    ? "Record the local decision after checking the blocker, draft answer and supporting evidence."
    : undefined;

  return (
    <div className="evidence-workbench-panel evidence-workbench-review-actions-section">
      {sectionLead ? (
        <p className="qhds-content-section__lead qhds-content-section__lead--compact">
          {sectionLead}
        </p>
      ) : null}
      <section
        aria-labelledby={labelledBy}
        className="evidence-workbench-review-actions"
        data-local-review-state={state.isDirty ? "changed" : "seeded"}
      >
        <div className="evidence-workbench-review-actions__heading">
          <p className="evidence-workbench-review-actions__label">Review decision</p>
          <div
            aria-label="Review decision state"
            className="evidence-workbench-review-actions__status"
          >
            <AivisEvidenceStatus tone={reviewStatusTone(state.review.statusId)}>
              {state.review.status}
            </AivisEvidenceStatus>
            <AivisEvidenceStatus tone={copyDisabled ? "warning" : "success"}>
              Copy {formatStateLabel(state.review.copyState)}
            </AivisEvidenceStatus>
            <AivisEvidenceStatus
              tone={state.review.blockedByWarningIds.length > 0 ? "warning" : "success"}
            >
              {state.review.blockedByWarningIds.length} approval blockers
            </AivisEvidenceStatus>
          </div>
        </div>

        {isDecisionFlow ? (
          <>
            <p className="evidence-workbench-review-actions__description">
              Use the primary action when the answer needs better evidence before
              it can be copied. The copy action stays disabled until approval
              blockers are resolved.
            </p>
            <QhdsSummaryList
              ariaLabel="Primary review decision context"
              className="evidence-workbench-review-actions__summary evidence-workbench-review-actions__decision-context"
              items={decisionSummaryItems}
            />
            {controls}
            {copyState}
            <div className="evidence-workbench-review-actions__audit-details">
              <QhdsAccordion
                headingLevel={3}
                items={[
                  {
                    content: (
                      <div className="evidence-workbench-review-actions__audit-panel">
                        <QhdsSummaryList
                          ariaLabel="Local review audit context"
                          className="evidence-workbench-review-actions__summary evidence-workbench-review-actions__audit-context"
                          items={auditContextItems}
                        />
                      </div>
                    ),
                    id: "review-local-audit",
                    title: "Local audit details"
                  }
                ]}
              />
            </div>
          </>
        ) : (
          <>
            <QhdsSummaryList
              ariaLabel="Review action metadata"
              className="evidence-workbench-review-actions__summary"
              items={standardSummaryItems}
            />
            {controls}
          </>
        )}

        <div className="evidence-workbench-review-actions__footer">
          {isDecisionFlow ? null : copyState}
          <QhdsButton onClick={handleReset} type="button" variant="tertiary">
            Reset local review state
          </QhdsButton>
        </div>
      </section>
    </div>
  );
}

function ReviewActionChoiceLabel({
  action,
  isSelected,
  reason,
  state
}: {
  action: EvidenceWorkbenchReviewAction;
  isSelected: boolean;
  reason: string;
  state: "available" | "selected" | "unavailable";
}) {
  return (
    <span
      className="evidence-workbench-review-action-choice"
      data-action-tone={action.uiTone}
      data-choice-state={state}
    >
      <span className="evidence-workbench-review-action-choice__header">
        <span className="evidence-workbench-review-action-choice__label">
          {action.label}
        </span>
        <span className="evidence-workbench-review-action-choice__state">
          {state === "unavailable" ? "Unavailable" : isSelected ? "Selected" : "Available"}
        </span>
      </span>
      <small className="evidence-workbench-review-action-choice__hint">
        {reason}
      </small>
    </span>
  );
}

function actionReasonText(
  action: EvidenceWorkbenchReviewAction,
  availability: ReviewActionAvailability | null,
  selectedIssue: ReviewActionTarget | null
): string {
  const reason = availability?.reason ?? actionReason(action, selectedIssue);

  if (action.id === MARK_REVIEWED_ACTION_ID && availability?.disabled) {
    return `${reason} Mark reviewed remains disabled in this fixture.`;
  }

  return reason;
}

function actionReason(
  action: EvidenceWorkbenchReviewAction,
  selectedIssue: ReviewActionTarget | null
): string {
  const targetReason = selectedIssue
    ? ` Target: ${selectedIssue.warningId} on ${selectedIssue.sourceId}.`
    : "";

  return `${action.description}${targetReason}`;
}

function reviewStatusTone(statusId: string): AivisEvidenceTone {
  return statusId === "reviewed" ? "success" : "warning";
}

function formatStateLabel(value: string): string {
  return value
    .split("_")
    .filter(Boolean)
    .map((word) => `${word[0]?.toUpperCase() ?? ""}${word.slice(1)}`)
    .join(" ");
}

function formatList(values: string[]): string {
  if (values.length <= 1) {
    return values[0] ?? "none";
  }

  return `${values.slice(0, -1).join(", ")} and ${values[values.length - 1]}`;
}

function lastActionTargetLabel(target: ReviewActionTarget | null): string {
  if (!target) {
    return "No local action target recorded.";
  }

  return `${target.warningId} on ${target.sourceId}: ${target.warningMessage}`;
}
