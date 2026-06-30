"use client";

import { useId, useState, type ChangeEvent } from "react";
import {
  AivisEvidenceStatus,
  QhdsButton,
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
  type ReviewActionTarget,
  type ReviewDecisionState
} from "./review-action-state";

export interface ReviewDecisionBarProps {
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
  onApplyAction,
  onReset,
  selectedIssue,
  state
}: ReviewDecisionBarProps) {
  const baseId = useId();
  const copyReasonId = `${baseId}-copy-reason`;
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

  const handleNoteChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setReviewerNote(event.target.value);
  };
  const handleReset = () => {
    onReset();
    setReviewerNote(PRIMARY_REVIEWER_NOTE);
  };

  return (
    <section
      aria-labelledby="review-decision-title"
      className="evidence-workbench-review-actions"
      data-local-review-state={state.isDirty ? "changed" : "seeded"}
    >
      <div className="evidence-workbench-review-actions__heading">
        <div>
          <p className="evidence-workbench-review-actions__label">Review decision</p>
          <h2 id="review-decision-title">Action and audit flow</h2>
        </div>
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

      <QhdsSummaryList
        ariaLabel="Review action metadata"
        className="evidence-workbench-review-actions__summary"
        items={[
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
        ]}
      />

      <div className="evidence-workbench-review-actions__controls">
        <QhdsTextarea
          className="evidence-workbench-review-actions__note-input"
          hint="Stored only in this local prototype state."
          label="Reviewer note"
          onChange={handleNoteChange}
          rows={3}
          value={reviewerNote}
        />

        <fieldset
          aria-label="Review actions"
          className="evidence-workbench-review-actions__button-grid"
        >
          <legend className="evidence-workbench-review-actions__legend">
            Review actions
          </legend>
          {state.actions.map((action) => (
            <ReviewActionButton
              action={action}
              baseId={baseId}
              key={action.id}
              onApplyAction={onApplyAction}
              reviewerNote={reviewerNote}
              selectedIssue={selectedIssue}
              state={state}
            />
          ))}
        </fieldset>
      </div>

      <div className="evidence-workbench-review-actions__footer">
        <div className="evidence-workbench-review-actions__copy-state">
          <QhdsButton
            aria-describedby={copyReasonId}
            disabled={copyDisabled}
            type="button"
            variant="secondary"
          >
            Copy approved answer
          </QhdsButton>
          <p id={copyReasonId}>{copyReason}</p>
        </div>
        <QhdsButton onClick={handleReset} type="button" variant="tertiary">
          Reset local review state
        </QhdsButton>
      </div>
    </section>
  );
}

function ReviewActionButton({
  action,
  baseId,
  onApplyAction,
  reviewerNote,
  selectedIssue,
  state
}: {
  action: EvidenceWorkbenchReviewAction;
  baseId: string;
  onApplyAction: (
    actionId: string,
    reviewerNote: string,
    targetIssue: ReviewActionTarget | null
  ) => void;
  reviewerNote: string;
  selectedIssue: ReviewActionTarget | null;
  state: ReviewDecisionState;
}) {
  const availability = getReviewActionAvailability(state.review, action, reviewerNote);
  const reasonId = `${baseId}-${action.id.toLowerCase()}-reason`;
  const targetReason = selectedIssue
    ? ` Target: ${selectedIssue.warningId} on ${selectedIssue.sourceId}.`
    : "";
  const reason = availability.reason ?? `${action.description}${targetReason}`;

  return (
    <div
      className="evidence-workbench-review-actions__action"
      data-action-id={action.id}
      data-action-tone={action.uiTone}
    >
      <QhdsButton
        aria-describedby={reasonId}
        disabled={availability.disabled}
        onClick={(event) => {
          onApplyAction(action.id, reviewerNote, selectedIssue);
        }}
        type="button"
        variant={action.uiTone === "primary" ? "primary" : "secondary"}
      >
        {action.label}
      </QhdsButton>
      <small id={reasonId}>
        {action.id === MARK_REVIEWED_ACTION_ID && availability.disabled
          ? `${reason} Mark reviewed remains disabled in this fixture.`
          : reason}
      </small>
    </div>
  );
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
