import { describe, expect, it } from "vitest";

import {
  ADD_REVIEW_NOTE_ACTION_ID,
  MARK_REVIEWED_ACTION_ID,
  PRIMARY_REVIEW_ACTION_ID,
  PRIMARY_REVIEWER_NOTE
} from "../../services/EvidenceWorkbenchReviewActionFixture";
import type { EvidenceWorkbenchViewModel } from "../../services/EvidenceWorkbenchTypes";
import { fallbackEvidenceWorkbenchData } from "../../services/EvidenceWorkbenchFallbackFixture";
import {
  createInitialReviewDecisionState,
  getReviewActionAvailability,
  reviewDecisionReducer
} from "./reviewDecisionState";

const backendLikeData: EvidenceWorkbenchViewModel = {
  ...fallbackEvidenceWorkbenchData,
  fetchState: {
    source: "backend"
  },
  review: {
    ...fallbackEvidenceWorkbenchData.review,
    activeWarningCount: 6,
    activeWarningIds: ["WARN-001", "WARN-002", "WARN-003", "WARN-004", "WARN-005", "WARN-006"],
    blockedByWarningIds: ["WARN-001", "WARN-002", "WARN-003"],
    id: "REV-001",
    selectedClaimId: "CLAIM-003",
    updatedAt: "2026-06-27T09:00:00+10:00"
  },
  audit: {
    ...fallbackEvidenceWorkbenchData.audit,
    id: "AUDIT-001",
    reviewEventIds: ["AUDIT-EVT-001", "AUDIT-EVT-002"]
  },
  warnings: [
    {
      blocksApproval: true,
      id: "WARN-001",
      message: "Stale boarding map.",
      severity: "High"
    },
    {
      blocksApproval: true,
      id: "WARN-002",
      message: "Weak shuttle support.",
      severity: "High"
    },
    {
      blocksApproval: true,
      id: "WARN-003",
      message: "Missing dispatch confirmation.",
      severity: "High"
    },
    {
      id: "WARN-004",
      message: "Review context warning.",
      severity: "Medium"
    },
    {
      id: "WARN-005",
      message: "Review action not recorded.",
      severity: "Medium"
    },
    {
      id: "WARN-006",
      message: "Copy disabled until reviewed.",
      severity: "Medium"
    }
  ]
};

const actionTarget = {
  evidenceImpact: "The step-free shuttle claim needs a missing dispatch confirmation source.",
  ownerLabel: "Operations Control",
  reviewOwnerQueue: "operations-control-dispatch-confirmation",
  sourceId: "SRC-006",
  sourceTitle: "Day-Of-Service Shuttle Dispatch Confirmation",
  warningId: "WARN-003",
  warningMessage: "Missing dispatch confirmation."
};

describe("review action state", () => {
  it("keeps mark reviewed disabled while approval blockers remain", () => {
    const state = createInitialReviewDecisionState(backendLikeData);
    const action = state.actions.find((candidate) => candidate.id === MARK_REVIEWED_ACTION_ID);

    expect(action).toBeDefined();
    expect(getReviewActionAvailability(state.review, action!, PRIMARY_REVIEWER_NOTE)).toEqual({
      disabled: true,
      reason: "Approval remains blocked by WARN-001, WARN-002, WARN-003."
    });
  });

  it("requires a reviewer note before applying local review actions", () => {
    const state = createInitialReviewDecisionState(backendLikeData);
    const action = state.actions.find((candidate) => candidate.id === PRIMARY_REVIEW_ACTION_ID);

    expect(action).toBeDefined();
    expect(getReviewActionAvailability(state.review, action!, "   ")).toEqual({
      disabled: true,
      reason: "Request source update requires a reviewer note."
    });
  });

  it("records the source-update action locally and updates review/audit state", () => {
    const state = createInitialReviewDecisionState(backendLikeData);
    const nextState = reviewDecisionReducer(state, {
      actionId: PRIMARY_REVIEW_ACTION_ID,
      reviewerNote: PRIMARY_REVIEWER_NOTE,
      targetIssue: actionTarget,
      type: "apply-action"
    });

    expect(nextState.isDirty).toBe(true);
    expect(nextState.review.status).toBe("Source update requested");
    expect(nextState.review.statusId).toBe("source_update_requested");
    expect(nextState.review.activeWarningIds).toContain("WARN-007");
    expect(nextState.review.activeWarningIds).not.toContain("WARN-005");
    expect(nextState.review.blockedByWarningIds).toEqual(["WARN-001", "WARN-002", "WARN-003"]);
    expect(nextState.review.copyState).toBe("disabled");
    expect(nextState.review.completedActionIds).toContain(PRIMARY_REVIEW_ACTION_ID);
    expect(nextState.review.availableActionIds).not.toContain(PRIMARY_REVIEW_ACTION_ID);
    expect(nextState.audit.lastReviewActionId).toBe(PRIMARY_REVIEW_ACTION_ID);
    expect(nextState.lastActionTarget).toEqual(actionTarget);
    expect(nextState.audit.reviewEventIds).toEqual([
      "AUDIT-EVT-001",
      "AUDIT-EVT-002",
      "AUDIT-EVT-003",
      "AUDIT-EVT-004"
    ]);
    expect(nextState.warnings.map((warning) => warning.id)).toContain("WARN-007");
    expect(nextState.feedback).toContain("recorded in local UI state");
    expect(nextState.feedback).toContain("Targeted WARN-003 on SRC-006");
  });

  it("keeps add-note as a status-preserving local action", () => {
    const state = createInitialReviewDecisionState(backendLikeData);
    const nextState = reviewDecisionReducer(state, {
      actionId: ADD_REVIEW_NOTE_ACTION_ID,
      reviewerNote: "Checked source labels before escalation.",
      type: "apply-action"
    });

    expect(nextState.review.statusId).toBe("needs_review");
    expect(nextState.review.status).toBe("Needs review");
    expect(nextState.review.lastActionId).toBe(ADD_REVIEW_NOTE_ACTION_ID);
    expect(nextState.review.availableActionIds).toContain(ADD_REVIEW_NOTE_ACTION_ID);
    expect(nextState.audit.lastReviewActionId).toBe(ADD_REVIEW_NOTE_ACTION_ID);
    expect(nextState.audit.reviewEventIds).toContain("AUDIT-EVT-LOCAL-NOTE");
  });

  it("resets local changes to the loaded fixture seed", () => {
    const state = createInitialReviewDecisionState(backendLikeData);
    const changedState = reviewDecisionReducer(state, {
      actionId: PRIMARY_REVIEW_ACTION_ID,
      reviewerNote: PRIMARY_REVIEWER_NOTE,
      targetIssue: actionTarget,
      type: "apply-action"
    });
    const resetState = reviewDecisionReducer(changedState, { type: "reset" });

    expect(resetState.isDirty).toBe(false);
    expect(resetState.review.status).toBe("Needs review");
    expect(resetState.review.activeWarningIds).toContain("WARN-005");
    expect(resetState.review.activeWarningIds).not.toContain("WARN-007");
    expect(resetState.audit.lastReviewActionId).toBeNull();
    expect(resetState.lastActionTarget).toBeNull();
    expect(resetState.feedback).toBe("Review state reset to the backend fixture seed.");
  });
});
