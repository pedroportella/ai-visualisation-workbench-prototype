from __future__ import annotations

from copy import deepcopy
from threading import Lock
from typing import Final

from pydantic import BaseModel

from aivis_api.fixture_data import (
    AUDIT_METADATA,
    BASE_FIXTURE_METADATA,
    GENERATED_AT,
    REVIEW_STATE,
    SOURCE_WARNINGS,
    JsonObject,
)


PRIMARY_REVIEW_ACTION_ID: Final = "ACT-REQUEST-SOURCE-UPDATE"
MARK_REVIEWED_ACTION_ID: Final = "ACT-MARK-REVIEWED"
PRIMARY_ACTION_UPDATED_AT: Final = "2026-06-27T09:15:00+10:00"
PRIMARY_REVIEWER_NOTE: Final = (
    "Do not approve as written. Refresh the temporary boarding map and change the "
    "step-free shuttle wording to require day-of-service confirmation before staff "
    "advise the customer."
)
BLOCKER_WARNING_IDS: Final = ["WARN-001", "WARN-002", "WARN-003"]


class ReviewActionRequest(BaseModel):
    reviewActionId: str
    reviewerNote: str
    reviewStateId: str = "REV-001"
    answerId: str = "ANS-001"


class ReviewActionError(RuntimeError):
    def __init__(self, status_code: int, detail: str) -> None:
        super().__init__(detail)
        self.status_code = status_code
        self.detail = detail


REVIEW_ACTIONS: Final[list[JsonObject]] = [
    {
        "id": PRIMARY_REVIEW_ACTION_ID,
        "type": "request_source_update",
        "label": "Request source update",
        "description": "Hold the answer for source-owner confirmation before use.",
        "allowedFromStatuses": ["needs_review"],
        "statusAfter": "source_update_requested",
        "targetObjectIds": ["SRC-002", "CLAIM-002", "CLAIM-003", "SRC-006", "REV-001"],
        "requiresNote": True,
        "auditEventType": "review.source_update_requested",
        "addsWarningIds": ["WARN-001", "WARN-002", "WARN-003", "WARN-007"],
        "clearsWarningIds": ["WARN-005"],
        "uiTone": "primary",
    },
    {
        "id": "ACT-ADD-REVIEW-NOTE",
        "type": "add_review_note",
        "label": "Add review note",
        "description": "Add a local reviewer note without changing approval state.",
        "allowedFromStatuses": [
            "needs_review",
            "source_update_requested",
            "escalated",
            "unsafe_to_use",
            "reviewed",
        ],
        "statusAfter": "unchanged",
        "targetObjectIds": ["REV-001", "AUDIT-001"],
        "requiresNote": True,
        "auditEventType": "review.note_added",
        "addsWarningIds": [],
        "clearsWarningIds": [],
        "uiTone": "secondary",
    },
    {
        "id": "ACT-ESCALATE-SOURCE-OWNER",
        "type": "escalate_to_source_owner",
        "label": "Escalate to source owner",
        "description": "Route unresolved source issues to the synthetic owner queues.",
        "allowedFromStatuses": ["needs_review", "source_update_requested"],
        "statusAfter": "escalated",
        "targetObjectIds": ["SRC-002", "SRC-006", "CLAIM-002", "CLAIM-003", "REV-001"],
        "requiresNote": True,
        "auditEventType": "review.escalated_to_source_owner",
        "addsWarningIds": ["WARN-001", "WARN-002", "WARN-003", "WARN-007"],
        "clearsWarningIds": ["WARN-005"],
        "uiTone": "caution",
    },
    {
        "id": "ACT-MARK-UNSAFE",
        "type": "mark_unsafe_to_use",
        "label": "Mark unsafe to use",
        "description": "Mark the draft answer as not suitable for staff use in its current form.",
        "allowedFromStatuses": ["needs_review", "source_update_requested", "escalated"],
        "statusAfter": "unsafe_to_use",
        "targetObjectIds": ["ANS-001", "CLAIM-002", "CLAIM-003", "REV-001"],
        "requiresNote": True,
        "auditEventType": "review.marked_unsafe_to_use",
        "addsWarningIds": ["WARN-001", "WARN-002", "WARN-003", "WARN-006"],
        "clearsWarningIds": ["WARN-005", "WARN-007"],
        "uiTone": "destructive",
    },
    {
        "id": MARK_REVIEWED_ACTION_ID,
        "type": "mark_reviewed",
        "label": "Mark reviewed",
        "description": "Approve the answer only after blocker warnings are resolved outside this fixture.",
        "allowedFromStatuses": ["needs_review", "source_update_requested", "escalated"],
        "statusAfter": "reviewed",
        "targetObjectIds": ["ANS-001", "REV-001", "AUDIT-001"],
        "requiresNote": True,
        "auditEventType": "review.marked_reviewed",
        "addsWarningIds": [],
        "clearsWarningIds": ["WARN-005", "WARN-006", "WARN-007"],
        "uiTone": "secondary",
    },
]

REVIEW_ACTION_IDS: Final = {str(action["id"]) for action in REVIEW_ACTIONS}

WARN_007: Final[JsonObject] = {
    "id": "WARN-007",
    "code": "source_update_requested",
    "severity": "medium",
    "message": "Local source-update request has been recorded for the synthetic fixture.",
    "appliesTo": [{"objectType": "ReviewState", "objectId": "REV-001"}],
    "evidenceImpact": (
        "The local request records reviewer intent but does not resolve stale, "
        "weak or missing evidence blockers."
    ),
    "blocksApproval": True,
    "introducedByActionId": PRIMARY_REVIEW_ACTION_ID,
}

POST_PRIMARY_REVIEW_STATE: Final[JsonObject] = {
    **REVIEW_STATE,
    "status": "source_update_requested",
    "statusLabel": "Source update requested",
    "activeWarningIds": ["WARN-001", "WARN-002", "WARN-003", "WARN-004", "WARN-006", "WARN-007"],
    "availableActionIds": [
        "ACT-ADD-REVIEW-NOTE",
        "ACT-ESCALATE-SOURCE-OWNER",
        "ACT-MARK-UNSAFE",
    ],
    "completedActionIds": [PRIMARY_REVIEW_ACTION_ID],
    "lastActionId": PRIMARY_REVIEW_ACTION_ID,
    "reviewerNote": PRIMARY_REVIEWER_NOTE,
    "updatedAt": PRIMARY_ACTION_UPDATED_AT,
    "copyState": "disabled",
    "approvalBlockedByWarningIds": BLOCKER_WARNING_IDS,
}

POST_PRIMARY_AUDIT_METADATA: Final[JsonObject] = {
    **AUDIT_METADATA,
    "reviewEventIds": ["AUDIT-EVT-001", "AUDIT-EVT-002", "AUDIT-EVT-003", "AUDIT-EVT-004"],
    "lastReviewActionId": PRIMARY_REVIEW_ACTION_ID,
}

_source_warnings_by_id: Final = {
    **{str(warning["id"]): warning for warning in SOURCE_WARNINGS},
    "WARN-007": WARN_007,
}
_review_action_by_id: Final = {str(action["id"]): action for action in REVIEW_ACTIONS}
_state_lock = Lock()
_current_review_state: JsonObject = deepcopy(REVIEW_STATE)
_current_audit_metadata: JsonObject = deepcopy(AUDIT_METADATA)


def reset_review_action_state() -> None:
    global _current_audit_metadata, _current_review_state

    with _state_lock:
        _current_review_state = deepcopy(REVIEW_STATE)
        _current_audit_metadata = deepcopy(AUDIT_METADATA)


def apply_review_action(request: ReviewActionRequest) -> JsonObject:
    global _current_audit_metadata, _current_review_state

    _validate_request_scope(request)

    review_action_id = request.reviewActionId
    if review_action_id not in REVIEW_ACTION_IDS:
        raise ReviewActionError(404, f"Unknown review action: {review_action_id}")

    if review_action_id == MARK_REVIEWED_ACTION_ID:
        raise ReviewActionError(
            409,
            "ACT-MARK-REVIEWED is unavailable while WARN-001, WARN-002 or WARN-003 are active.",
        )

    if review_action_id != PRIMARY_REVIEW_ACTION_ID:
        raise ReviewActionError(
            409,
            f"{review_action_id} is a C05 follow-up action and is not implemented by the B05 endpoint.",
        )

    if request.reviewerNote.strip() != PRIMARY_REVIEWER_NOTE:
        raise ReviewActionError(
            400,
            "ACT-REQUEST-SOURCE-UPDATE requires the deterministic C05 reviewer note.",
        )

    with _state_lock:
        if _current_review_state["lastActionId"] == PRIMARY_REVIEW_ACTION_ID:
            raise ReviewActionError(409, "ACT-REQUEST-SOURCE-UPDATE has already been completed.")

        if _current_review_state["status"] != "needs_review":
            raise ReviewActionError(409, "ACT-REQUEST-SOURCE-UPDATE is not available from the current review state.")

        _current_review_state = deepcopy(POST_PRIMARY_REVIEW_STATE)
        _current_audit_metadata = deepcopy(POST_PRIMARY_AUDIT_METADATA)
        return _state_response(review_action_id)


def _validate_request_scope(request: ReviewActionRequest) -> None:
    if request.reviewStateId != "REV-001":
        raise ReviewActionError(404, f"Unknown review state: {request.reviewStateId}")

    if request.answerId != "ANS-001":
        raise ReviewActionError(404, f"Unknown answer: {request.answerId}")


def _state_response(review_action_id: str) -> JsonObject:
    review_state = deepcopy(_current_review_state)
    audit_metadata = deepcopy(_current_audit_metadata)
    source_warnings = [
        deepcopy(_source_warnings_by_id[str(warning_id)])
        for warning_id in review_state["activeWarningIds"]
    ]

    return {
        **BASE_FIXTURE_METADATA,
        "generatedAt": GENERATED_AT,
        "reviewAction": deepcopy(_review_action_by_id[review_action_id]),
        "reviewActions": deepcopy(REVIEW_ACTIONS),
        "implementedActionIds": [PRIMARY_REVIEW_ACTION_ID],
        "reviewState": review_state,
        "auditMetadata": audit_metadata,
        "sourceWarnings": source_warnings,
        "localState": {
            "storage": "in_memory_process",
            "resetBehavior": "Restarting the API process restores REV-001 and AUDIT-001 to the initial fixture state.",
            "sourceSystemWriteback": "not_performed",
            "productionAuditLogging": "not_performed",
        },
    }
