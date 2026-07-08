import type {
  EvidenceWorkbenchReviewAction,
  EvidenceWorkbenchWarning
} from "./types";

export const PRIMARY_REVIEW_ACTION_ID = "ACT-REQUEST-SOURCE-UPDATE";
export const ADD_REVIEW_NOTE_ACTION_ID = "ACT-ADD-REVIEW-NOTE";
export const ESCALATE_SOURCE_OWNER_ACTION_ID = "ACT-ESCALATE-SOURCE-OWNER";
export const MARK_UNSAFE_ACTION_ID = "ACT-MARK-UNSAFE";
export const MARK_REVIEWED_ACTION_ID = "ACT-MARK-REVIEWED";

export const PRIMARY_REVIEWER_NOTE =
  "Do not approve as written. Refresh the temporary boarding map and change the step-free shuttle wording to require day-of-service confirmation before staff advise the customer.";

export const REVIEW_ACTION_RECORDS: EvidenceWorkbenchReviewAction[] = [
  {
    addsWarningIds: ["WARN-001", "WARN-002", "WARN-003", "WARN-007"],
    allowedFromStatuses: ["needs_review"],
    auditEventType: "review.source_update_requested",
    clearsWarningIds: ["WARN-005"],
    description: "Hold the answer for source-owner confirmation before use.",
    id: PRIMARY_REVIEW_ACTION_ID,
    label: "Request source update",
    requiresNote: true,
    statusAfter: "source_update_requested",
    targetObjectIds: ["SRC-002", "CLAIM-002", "CLAIM-003", "SRC-006", "REV-001"],
    type: "request_source_update",
    uiTone: "primary"
  },
  {
    addsWarningIds: [],
    allowedFromStatuses: [
      "needs_review",
      "source_update_requested",
      "escalated",
      "unsafe_to_use",
      "reviewed"
    ],
    auditEventType: "review.note_added",
    clearsWarningIds: [],
    description: "Add a local reviewer note without changing approval state.",
    id: ADD_REVIEW_NOTE_ACTION_ID,
    label: "Add review note",
    requiresNote: true,
    statusAfter: "unchanged",
    targetObjectIds: ["REV-001", "AUDIT-001"],
    type: "add_review_note",
    uiTone: "secondary"
  },
  {
    addsWarningIds: ["WARN-001", "WARN-002", "WARN-003", "WARN-007"],
    allowedFromStatuses: ["needs_review", "source_update_requested"],
    auditEventType: "review.escalated_to_source_owner",
    clearsWarningIds: ["WARN-005"],
    description: "Route unresolved source issues to the synthetic owner queues.",
    id: ESCALATE_SOURCE_OWNER_ACTION_ID,
    label: "Escalate to source owner",
    requiresNote: true,
    statusAfter: "escalated",
    targetObjectIds: ["SRC-002", "SRC-006", "CLAIM-002", "CLAIM-003", "REV-001"],
    type: "escalate_to_source_owner",
    uiTone: "caution"
  },
  {
    addsWarningIds: ["WARN-001", "WARN-002", "WARN-003", "WARN-006"],
    allowedFromStatuses: ["needs_review", "source_update_requested", "escalated"],
    auditEventType: "review.marked_unsafe_to_use",
    clearsWarningIds: ["WARN-005", "WARN-007"],
    description: "Mark the draft answer as not suitable for staff use in its current form.",
    id: MARK_UNSAFE_ACTION_ID,
    label: "Mark unsafe to use",
    requiresNote: true,
    statusAfter: "unsafe_to_use",
    targetObjectIds: ["ANS-001", "CLAIM-002", "CLAIM-003", "REV-001"],
    type: "mark_unsafe_to_use",
    uiTone: "destructive"
  },
  {
    addsWarningIds: [],
    allowedFromStatuses: ["needs_review", "source_update_requested", "escalated"],
    auditEventType: "review.marked_reviewed",
    clearsWarningIds: ["WARN-005", "WARN-006", "WARN-007"],
    description: "Approve the answer only after blocker warnings are resolved outside this fixture.",
    id: MARK_REVIEWED_ACTION_ID,
    label: "Mark reviewed",
    requiresNote: true,
    statusAfter: "reviewed",
    targetObjectIds: ["ANS-001", "REV-001", "AUDIT-001"],
    type: "mark_reviewed",
    uiTone: "secondary"
  }
];

export const SOURCE_UPDATE_WARNING: EvidenceWorkbenchWarning = {
  blocksApproval: true,
  code: "Source update requested",
  evidenceImpact:
    "The local request records reviewer intent but does not resolve stale, weak or missing evidence blockers.",
  id: "WARN-007",
  introducedByActionId: PRIMARY_REVIEW_ACTION_ID,
  message: "Local source-update request has been recorded for the synthetic fixture.",
  severity: "Medium"
};
