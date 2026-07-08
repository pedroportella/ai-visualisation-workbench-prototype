import {
  ADD_REVIEW_NOTE_ACTION_ID,
  ESCALATE_SOURCE_OWNER_ACTION_ID,
  MARK_REVIEWED_ACTION_ID,
  MARK_UNSAFE_ACTION_ID,
  PRIMARY_REVIEW_ACTION_ID,
  SOURCE_UPDATE_WARNING
} from "../../services/EvidenceWorkbenchReviewActionFixture";
import type {
  EvidenceWorkbenchAuditMetadata,
  EvidenceWorkbenchReviewAction,
  EvidenceWorkbenchViewModel,
  EvidenceWorkbenchWarning
} from "../../services/EvidenceWorkbenchTypes";

export interface ReviewActionAvailability {
  disabled: boolean;
  reason: string | null;
}

export interface ReviewActionTarget {
  evidenceImpact: string;
  ownerLabel: string;
  reviewOwnerQueue: string;
  sourceId: string;
  sourceTitle: string;
  warningId: string;
  warningMessage: string;
}

export interface ReviewDecisionState {
  actions: EvidenceWorkbenchReviewAction[];
  audit: EvidenceWorkbenchAuditMetadata;
  feedback: string;
  fixtureSource: EvidenceWorkbenchViewModel["fetchState"]["source"];
  initialAudit: EvidenceWorkbenchAuditMetadata;
  initialReview: EvidenceWorkbenchViewModel["review"];
  isDirty: boolean;
  lastActionTarget: ReviewActionTarget | null;
  localStateLabel: string;
  review: EvidenceWorkbenchViewModel["review"];
  warningCatalog: EvidenceWorkbenchWarning[];
  warnings: EvidenceWorkbenchWarning[];
}

export type ReviewDecisionReducerAction =
  | {
      actionId: string;
      reviewerNote: string;
      targetIssue?: ReviewActionTarget | null;
      type: "apply-action";
    }
  | {
      data: EvidenceWorkbenchViewModel;
      feedback?: string;
      type: "replace-seed";
    }
  | {
      type: "reset";
    };

const REPEATABLE_ACTION_IDS = new Set([ADD_REVIEW_NOTE_ACTION_ID]);
const APPROVAL_BLOCKER_IDS = ["WARN-001", "WARN-002", "WARN-003"];

const ACTION_AUDIT_EVENT_IDS: Record<string, string[]> = {
  [PRIMARY_REVIEW_ACTION_ID]: ["AUDIT-EVT-003", "AUDIT-EVT-004"],
  [ADD_REVIEW_NOTE_ACTION_ID]: ["AUDIT-EVT-LOCAL-NOTE"],
  [ESCALATE_SOURCE_OWNER_ACTION_ID]: ["AUDIT-EVT-LOCAL-ESCALATION"],
  [MARK_UNSAFE_ACTION_ID]: ["AUDIT-EVT-LOCAL-UNSAFE"],
  [MARK_REVIEWED_ACTION_ID]: ["AUDIT-EVT-LOCAL-REVIEWED"]
};

const ACTION_UPDATED_AT: Record<string, string> = {
  [PRIMARY_REVIEW_ACTION_ID]: "2026-06-27T09:15:00+10:00",
  [ADD_REVIEW_NOTE_ACTION_ID]: "Local UI note",
  [ESCALATE_SOURCE_OWNER_ACTION_ID]: "Local UI escalation",
  [MARK_UNSAFE_ACTION_ID]: "Local UI unsafe mark",
  [MARK_REVIEWED_ACTION_ID]: "Local UI reviewed mark"
};

const STATUS_LABELS: Record<string, string> = {
  escalated: "Escalated to source owner",
  needs_review: "Needs review",
  reviewed: "Reviewed",
  source_update_requested: "Source update requested",
  unsafe_to_use: "Unsafe to use"
};

export function createInitialReviewDecisionState(
  data: EvidenceWorkbenchViewModel
): ReviewDecisionState {
  const warningCatalog = uniqueWarnings([...data.warnings, SOURCE_UPDATE_WARNING]);
  const review = normalizeReview(data.review);

  return {
    actions: data.review.actions,
    audit: cloneAudit(data.audit),
    feedback:
      data.fetchState.source === "backend"
        ? "Review state is seeded from the backend fixture."
        : "Local review state is seeded from the bundled fallback fixture.",
    fixtureSource: data.fetchState.source,
    initialAudit: cloneAudit(data.audit),
    initialReview: normalizeReview(data.review),
    isDirty: false,
    lastActionTarget: null,
    localStateLabel: "Local UI state",
    review,
    warningCatalog,
    warnings: warningsForIds(review.activeWarningIds, warningCatalog, review.blockedByWarningIds)
  };
}

export function reviewDecisionReducer(
  state: ReviewDecisionState,
  action: ReviewDecisionReducerAction
): ReviewDecisionState {
  if (action.type === "replace-seed") {
    const nextState = createInitialReviewDecisionState(action.data);

    return {
      ...nextState,
      feedback: action.feedback ?? nextState.feedback
    };
  }

  if (action.type === "reset") {
    const review = normalizeReview(state.initialReview);

    return {
      ...state,
      audit: cloneAudit(state.initialAudit),
      feedback:
        state.fixtureSource === "backend"
          ? "Review state reset to the backend fixture seed."
          : "Local review state reset to the bundled fallback fixture seed.",
      isDirty: false,
      lastActionTarget: null,
      review,
      warnings: warningsForIds(review.activeWarningIds, state.warningCatalog, review.blockedByWarningIds)
    };
  }

  const reviewAction = state.actions.find((candidate) => candidate.id === action.actionId);

  if (!reviewAction) {
    return {
      ...state,
      feedback: `Unknown local review action: ${action.actionId}.`
    };
  }

  const availability = getReviewActionAvailability(
    state.review,
    reviewAction,
    action.reviewerNote
  );

  if (availability.disabled) {
    return {
      ...state,
      feedback: availability.reason ?? `${reviewAction.label} is unavailable.`
    };
  }

  const reviewerNote = action.reviewerNote.trim();
  const activeWarningIds = nextActiveWarningIds(state.review.activeWarningIds, reviewAction);
  const blockedByWarningIds = nextApprovalBlockerIds(
    state.review.blockedByWarningIds,
    activeWarningIds
  );
  const statusId = nextStatusId(state.review.statusId, reviewAction);
  const completedActionIds = nextCompletedActionIds(
    state.review.completedActionIds,
    reviewAction.id
  );
  const review = normalizeReview({
    ...state.review,
    activeWarningIds,
    availableActionIds: nextAvailableActionIds(state.review.availableActionIds, reviewAction.id),
    blockedByWarningIds,
    completedActionIds,
    copyState: blockedByWarningIds.length > 0 ? "disabled" : "enabled",
    lastActionId: reviewAction.id,
    reviewerNote,
    status: STATUS_LABELS[statusId] ?? formatStatusLabel(statusId),
    statusId,
    updatedAt: ACTION_UPDATED_AT[reviewAction.id] ?? "Local UI update"
  });
  const audit = {
    ...state.audit,
    lastReviewActionId: reviewAction.id,
    reviewEventIds: uniqueStrings([
      ...state.audit.reviewEventIds,
      ...(ACTION_AUDIT_EVENT_IDS[reviewAction.id] ?? [])
    ])
  };

  return {
    ...state,
    audit,
    feedback: actionFeedback(reviewAction, review, action.targetIssue ?? null),
    isDirty: true,
    lastActionTarget: action.targetIssue ?? null,
    review,
    warnings: warningsForIds(review.activeWarningIds, state.warningCatalog, review.blockedByWarningIds)
  };
}

export function getReviewActionAvailability(
  review: EvidenceWorkbenchViewModel["review"],
  action: EvidenceWorkbenchReviewAction,
  reviewerNote: string
): ReviewActionAvailability {
  if (action.id === MARK_REVIEWED_ACTION_ID && review.blockedByWarningIds.length > 0) {
    return {
      disabled: true,
      reason: `Approval remains blocked by ${review.blockedByWarningIds.join(", ")}.`
    };
  }

  if (review.completedActionIds.includes(action.id) && !REPEATABLE_ACTION_IDS.has(action.id)) {
    return {
      disabled: true,
      reason: `${action.label} has already been recorded locally.`
    };
  }

  if (!review.availableActionIds.includes(action.id)) {
    return {
      disabled: true,
      reason: `${action.label} is not available from ${review.status}.`
    };
  }

  if (!action.allowedFromStatuses.includes(review.statusId)) {
    return {
      disabled: true,
      reason: `${action.label} is not allowed from ${review.status}.`
    };
  }

  if (action.requiresNote && reviewerNote.trim().length === 0) {
    return {
      disabled: true,
      reason: `${action.label} requires a reviewer note.`
    };
  }

  return {
    disabled: false,
    reason: null
  };
}

function normalizeReview(
  review: EvidenceWorkbenchViewModel["review"]
): EvidenceWorkbenchViewModel["review"] {
  return {
    ...review,
    activeWarningCount: review.activeWarningIds.length,
    activeWarningIds: [...review.activeWarningIds],
    availableActionIds: [...review.availableActionIds],
    blockedByWarningIds: [...review.blockedByWarningIds],
    completedActionIds: [...review.completedActionIds]
  };
}

function cloneAudit(metadata: EvidenceWorkbenchAuditMetadata): EvidenceWorkbenchAuditMetadata {
  return {
    ...metadata,
    reviewEventIds: [...metadata.reviewEventIds]
  };
}

function nextStatusId(currentStatusId: string, action: EvidenceWorkbenchReviewAction): string {
  if (action.statusAfter === "unchanged") {
    return currentStatusId;
  }

  return action.statusAfter;
}

function nextAvailableActionIds(currentActionIds: string[], actionId: string): string[] {
  if (actionId === PRIMARY_REVIEW_ACTION_ID) {
    return [ADD_REVIEW_NOTE_ACTION_ID, ESCALATE_SOURCE_OWNER_ACTION_ID, MARK_UNSAFE_ACTION_ID];
  }

  if (actionId === ESCALATE_SOURCE_OWNER_ACTION_ID) {
    return [ADD_REVIEW_NOTE_ACTION_ID, MARK_UNSAFE_ACTION_ID];
  }

  if (actionId === MARK_UNSAFE_ACTION_ID) {
    return [ADD_REVIEW_NOTE_ACTION_ID];
  }

  if (actionId === MARK_REVIEWED_ACTION_ID) {
    return [];
  }

  return currentActionIds;
}

function nextActiveWarningIds(
  currentWarningIds: string[],
  action: EvidenceWorkbenchReviewAction
): string[] {
  const clearedWarningIds = new Set(action.clearsWarningIds);
  const remainingWarningIds = currentWarningIds.filter(
    (warningId) => !clearedWarningIds.has(warningId)
  );

  return uniqueStrings([...remainingWarningIds, ...action.addsWarningIds]);
}

function nextApprovalBlockerIds(
  currentBlockerIds: string[],
  activeWarningIds: string[]
): string[] {
  const activeWarningIdSet = new Set(activeWarningIds);
  const existingBlockers = currentBlockerIds.filter((warningId) =>
    activeWarningIdSet.has(warningId)
  );
  const fixtureBlockers = APPROVAL_BLOCKER_IDS.filter((warningId) =>
    activeWarningIdSet.has(warningId)
  );

  return uniqueStrings([...existingBlockers, ...fixtureBlockers]);
}

function nextCompletedActionIds(currentActionIds: string[], actionId: string): string[] {
  if (REPEATABLE_ACTION_IDS.has(actionId)) {
    return uniqueStrings([...currentActionIds, actionId]);
  }

  return uniqueStrings([...currentActionIds, actionId]);
}

function warningsForIds(
  warningIds: string[],
  warningCatalog: EvidenceWorkbenchWarning[],
  blockerWarningIds: string[]
): EvidenceWorkbenchWarning[] {
  const warningsById = new Map(warningCatalog.map((warning) => [warning.id, warning]));
  const blockerWarningIdSet = new Set(blockerWarningIds);

  return warningIds.map((warningId) => {
    const warning = warningsById.get(warningId);

    if (warning) {
      return warning;
    }

    return {
      blocksApproval: blockerWarningIdSet.has(warningId),
      id: warningId,
      message: `${warningId} remains active in the local review state.`,
      severity: blockerWarningIdSet.has(warningId) ? "High" : "Review note"
    };
  });
}

function actionFeedback(
  action: EvidenceWorkbenchReviewAction,
  review: EvidenceWorkbenchViewModel["review"],
  targetIssue: ReviewActionTarget | null
): string {
  const approvalState =
    review.blockedByWarningIds.length > 0
      ? `Approval remains blocked by ${review.blockedByWarningIds.join(", ")}.`
      : "Approval blockers are clear.";
  const targetState = targetIssue
    ? ` Targeted ${targetIssue.warningId} on ${targetIssue.sourceId}.`
    : "";

  return `${action.label} recorded in local UI state.${targetState} ${approvalState}`;
}

function uniqueWarnings(warnings: EvidenceWorkbenchWarning[]): EvidenceWorkbenchWarning[] {
  const warningsById = new Map<string, EvidenceWorkbenchWarning>();

  for (const warning of warnings) {
    warningsById.set(warning.id, warning);
  }

  return [...warningsById.values()];
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values)];
}

function formatStatusLabel(statusId: string): string {
  return statusId
    .split("_")
    .filter(Boolean)
    .map((word) => `${word[0]?.toUpperCase() ?? ""}${word.slice(1)}`)
    .join(" ");
}
