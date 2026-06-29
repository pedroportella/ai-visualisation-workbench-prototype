from __future__ import annotations

from copy import deepcopy
from typing import Final


JsonObject = dict[str, object]

SERVICE_ID: Final = "aivis-api"
RUNTIME_MODE_LABEL: Final = "local_fixture"
CONTRACT_MODE: Final = "synthetic_fixture"
CONTRACT_VERSION: Final = "aivis-evidence-workbench-contract@0.1.0"
SCENARIO_ID: Final = "brisbane-south-bank-pa-hospital-accessible-shuttle-review-v1"
FIXTURE_SET_ID: Final = "synthetic-south-bank-pa-hospital-v1"
SOURCE_SET_VERSION: Final = "synthetic-source-set-v1"
PUBLIC_CONTEXT_SET_VERSION: Final = "public-context-anchor-set-v1"
GENERATED_AT: Final = "2026-06-27T09:00:00+10:00"
FIXTURE_DATE: Final = "2026-06-27"
PLANNED_TRAVEL_DATE: Final = "2026-07-02"

ANSWER_MARKDOWN: Final = """\
# South Brisbane lift outage and PA Hospital accessible shuttle advice

**Review status:** Needs review. Do not approve as written.

For a customer using a mobility aid travelling from South Bank toward Princess
Alexandra Hospital on 2026-07-02, treat the South Brisbane station lift as
unavailable in this synthetic fixture. [CIT-001-A]

> Review blockers: `WARN-001` stale temporary boarding map, `WARN-002` weak
> step-free support, and `WARN-003` missing day-of-service dispatch
> confirmation.

## Generated evidence review path

```aivis-diagram
title: Generated evidence review path
summary: Static diagram generated from the synthetic answer fixture; place anchors remain context only.
- Prompt context | Customer need and place labels frame the review question | context
- Source checks | Boarding map freshness and shuttle allocation evidence are checked | evidence
- Claim review | Step-free guarantee remains blocked by weak and missing evidence | warning
- Reviewer action | Request source update before approving or copying advice | review
```

## What staff can say now

1. Explain that the fixture points to a temporary boarding point on Grey Street
  near QPAC, but the map is past its review date. Confirm the boarding point
  before giving final directions. [CIT-002-A]
2. Do not promise that the replacement shuttle is step-free from this draft
  alone. The accessible-vehicle guidance only supports a conditional planning
  intent, and the day-of-service dispatch confirmation is missing.
  [CIT-003-A] [CIT-003-B]
3. Ask for the customer's expected travel time and any assistance constraints
  before confirming final advice. `WARN-004`
4. If the customer cannot reach the temporary boarding point, arrange an
  assistance callback or alternate boarding check before closing the enquiry.
  [CIT-004-A]
5. Record the advice given, the evidence checked and any source-update request.
  [CIT-005-A]

```text
copy_state: disabled
required_review_action: request_source_update
```

## Evidence summary

| Claim | Current answer posture | Evidence state |
| --- | --- | --- |
| `CLAIM-001` | Lift unavailable during the fixture travel window | Supported by current synthetic brief [CIT-001-A] |
| `CLAIM-002` | Temporary Grey Street/QPAC boarding point | Blocked by stale map warning [CIT-002-A] |
| `CLAIM-003` | Step-free shuttle guarantee | Not safe to promise; partial guidance plus missing dispatch confirmation [CIT-003-A] [CIT-003-B] |
| `CLAIM-004` | Assistance callback or alternate boarding check | Supported as cautious next step [CIT-004-A] |
| `CLAIM-005` | Record advice and evidence checked | Supported by review process note [CIT-005-A] |

## Reviewer action

Request a source update before use. Refresh the temporary boarding map and
change any step-free wording from a guarantee to a verify-before-advice
instruction.

## Conditional wording to carry forward

"Please treat the shuttle accessibility advice as conditional until the
day-of-service allocation or assistance path is confirmed. I can help arrange a
callback or alternate boarding check if the temporary stop is not reachable."
""".strip()

PROMPT_CONTEXT: Final[JsonObject] = {
    "id": "CTX-001",
    "scenarioId": SCENARIO_ID,
    "fixtureDate": FIXTURE_DATE,
    "question": (
        "A customer using a mobility aid needs to travel from South Bank to "
        "Princess Alexandra Hospital next Thursday. The usual lift at South "
        "Brisbane station is listed as unavailable, and the shuttle stop "
        "appears to have moved. Can I advise that the replacement shuttle is "
        "step-free, where should the customer board, and what should I do if "
        "they cannot reach the temporary stop?"
    ),
    "staffChannel": "assisted_service_counter_or_phone",
    "customerNeed": "Step-free boarding and a path suitable for a mobility aid.",
    "plannedTravelDate": PLANNED_TRAVEL_DATE,
    "syntheticServiceLabel": "AIVIS-BNE-SB-PA shuttle",
    "contextAnchorIds": ["PCA-001", "PCA-002", "PCA-003", "PCA-004"],
    "constraintNotes": [
        "Use only synthetic source records as evidence.",
        "Treat real place names as context anchors only.",
        "Do not claim live operational confirmation.",
    ],
    "missingContext": [
        "exact_travel_time",
        "mobility_aid_dimensions",
        "day_of_service_vehicle_allocation",
        "current_temporary_stop_access_check",
    ],
    "warningIds": ["WARN-004"],
}

PUBLIC_CONTEXT_ANCHORS: Final[list[JsonObject]] = [
    {
        "id": "PCA-001",
        "label": "South Bank",
        "kind": "place",
        "fixtureUse": "Origin area context.",
        "isOperationalTruth": False,
        "evidenceUseProhibited": True,
        "allowedGraphEdgeTypes": ["uses_place_anchor"],
        "publicSourceUrl": None,
        "sourceAccessedDate": None,
        "licenceOrTermsNote": "No public snapshot is committed in this fixture.",
        "sourceRecordId": None,
        "transformNote": "Label-only context anchor from the synthetic scenario setup.",
    },
    {
        "id": "PCA-002",
        "label": "South Brisbane station",
        "kind": "station",
        "fixtureUse": "Lift-outage context anchor.",
        "isOperationalTruth": False,
        "evidenceUseProhibited": True,
        "allowedGraphEdgeTypes": ["uses_place_anchor"],
        "publicSourceUrl": None,
        "sourceAccessedDate": None,
        "licenceOrTermsNote": "No public snapshot is committed in this fixture.",
        "sourceRecordId": None,
        "transformNote": "Label-only context anchor from the synthetic scenario setup.",
    },
    {
        "id": "PCA-003",
        "label": "QPAC/Grey Street",
        "kind": "landmark",
        "fixtureUse": "Makes the temporary boarding point legible in the synthetic scenario.",
        "isOperationalTruth": False,
        "evidenceUseProhibited": True,
        "allowedGraphEdgeTypes": ["uses_place_anchor"],
        "publicSourceUrl": None,
        "sourceAccessedDate": None,
        "licenceOrTermsNote": "No public snapshot is committed in this fixture.",
        "sourceRecordId": None,
        "transformNote": "Label-only context anchor from the synthetic scenario setup.",
    },
    {
        "id": "PCA-004",
        "label": "Princess Alexandra Hospital",
        "kind": "hospital",
        "fixtureUse": "Destination context anchor.",
        "isOperationalTruth": False,
        "evidenceUseProhibited": True,
        "allowedGraphEdgeTypes": ["uses_place_anchor"],
        "publicSourceUrl": None,
        "sourceAccessedDate": None,
        "licenceOrTermsNote": "No public snapshot is committed in this fixture.",
        "sourceRecordId": None,
        "transformNote": "Label-only context anchor from the synthetic scenario setup.",
    },
]

ANSWER: Final[JsonObject] = {
    "id": "ANS-001",
    "contractVersion": CONTRACT_VERSION,
    "scenarioId": SCENARIO_ID,
    "fixtureSetId": FIXTURE_SET_ID,
    "promptContextId": "CTX-001",
    "title": "South Brisbane lift outage and PA Hospital accessible shuttle advice",
    "summary": (
        "Useful draft, but not approved until the boarding map is refreshed and "
        "step-free shuttle wording requires day-of-service confirmation."
    ),
    "markdown": ANSWER_MARKDOWN,
    "claimIds": ["CLAIM-001", "CLAIM-002", "CLAIM-003", "CLAIM-004", "CLAIM-005"],
    "citationIds": [
        "CIT-001-A",
        "CIT-002-A",
        "CIT-003-A",
        "CIT-003-B",
        "CIT-004-A",
        "CIT-005-A",
    ],
    "warningIds": ["WARN-001", "WARN-002", "WARN-003", "WARN-004", "WARN-005", "WARN-006"],
    "reviewStateId": "REV-001",
    "auditMetadataId": "AUDIT-001",
    "generatedAt": GENERATED_AT,
    "copyState": "disabled",
    "displayStatusLabel": "Needs review",
    "defaultSelectedClaimId": "CLAIM-003",
}

ANSWER_CLAIMS: Final[list[JsonObject]] = [
    {
        "id": "CLAIM-001",
        "answerId": "ANS-001",
        "displayOrder": 1,
        "text": "The South Brisbane station lift is unavailable during the planned travel window.",
        "evidencePosture": "supported",
        "citationIds": ["CIT-001-A"],
        "supportingSourceIds": ["SRC-001"],
        "requiredMissingSourceIds": [],
        "contextAnchorIds": ["PCA-002"],
        "warningIds": [],
        "reviewRequired": False,
    },
    {
        "id": "CLAIM-002",
        "answerId": "ANS-001",
        "displayOrder": 2,
        "text": "Staff should direct the customer to the temporary Grey Street boarding point near QPAC.",
        "evidencePosture": "partial_support",
        "citationIds": ["CIT-002-A"],
        "supportingSourceIds": ["SRC-002"],
        "requiredMissingSourceIds": [],
        "contextAnchorIds": ["PCA-001", "PCA-002", "PCA-003"],
        "warningIds": ["WARN-001"],
        "reviewRequired": True,
    },
    {
        "id": "CLAIM-003",
        "answerId": "ANS-001",
        "displayOrder": 3,
        "text": "The replacement shuttle will be step-free for customers using mobility aids.",
        "evidencePosture": "weak_support",
        "citationIds": ["CIT-003-A", "CIT-003-B"],
        "supportingSourceIds": ["SRC-003"],
        "requiredMissingSourceIds": ["SRC-006"],
        "contextAnchorIds": ["PCA-001", "PCA-004"],
        "warningIds": ["WARN-002", "WARN-003"],
        "reviewRequired": True,
    },
    {
        "id": "CLAIM-004",
        "answerId": "ANS-001",
        "displayOrder": 4,
        "text": (
            "If the customer cannot reach the temporary boarding point, staff should "
            "arrange an assistance callback or alternate boarding check."
        ),
        "evidencePosture": "supported",
        "citationIds": ["CIT-004-A"],
        "supportingSourceIds": ["SRC-004"],
        "requiredMissingSourceIds": [],
        "contextAnchorIds": ["PCA-001", "PCA-003", "PCA-004"],
        "warningIds": [],
        "reviewRequired": False,
    },
    {
        "id": "CLAIM-005",
        "answerId": "ANS-001",
        "displayOrder": 5,
        "text": "Staff should record the advice given and the evidence checked.",
        "evidencePosture": "supported",
        "citationIds": ["CIT-005-A"],
        "supportingSourceIds": ["SRC-007"],
        "requiredMissingSourceIds": [],
        "contextAnchorIds": [],
        "warningIds": [],
        "reviewRequired": False,
    },
]

CITATIONS: Final[list[JsonObject]] = [
    {
        "id": "CIT-001-A",
        "answerId": "ANS-001",
        "claimId": "CLAIM-001",
        "sourceId": "SRC-001",
        "marker": "[CIT-001-A]",
        "relationship": "supports",
        "excerptId": "SRC-001-EXCERPT-001",
        "warningIds": [],
        "sourceLocationLabel": "Synthetic lift works brief excerpt",
        "confidenceLabel": "supported",
    },
    {
        "id": "CIT-002-A",
        "answerId": "ANS-001",
        "claimId": "CLAIM-002",
        "sourceId": "SRC-002",
        "marker": "[CIT-002-A]",
        "relationship": "supports_with_warning",
        "excerptId": "SRC-002-EXCERPT-001",
        "warningIds": ["WARN-001"],
        "sourceLocationLabel": "Stale temporary boarding map excerpt",
        "confidenceLabel": "stale",
    },
    {
        "id": "CIT-003-A",
        "answerId": "ANS-001",
        "claimId": "CLAIM-003",
        "sourceId": "SRC-003",
        "marker": "[CIT-003-A]",
        "relationship": "partial_support",
        "excerptId": "SRC-003-EXCERPT-001",
        "warningIds": ["WARN-002"],
        "sourceLocationLabel": "Accessible vehicle allocation guidance excerpt",
        "confidenceLabel": "conditional",
    },
    {
        "id": "CIT-003-B",
        "answerId": "ANS-001",
        "claimId": "CLAIM-003",
        "sourceId": "SRC-006",
        "marker": "[CIT-003-B]",
        "relationship": "missing_evidence",
        "excerptId": "SRC-006-EXCERPT-MISSING",
        "warningIds": ["WARN-003"],
        "sourceLocationLabel": "Missing dispatch confirmation placeholder",
        "confidenceLabel": "not available",
    },
    {
        "id": "CIT-004-A",
        "answerId": "ANS-001",
        "claimId": "CLAIM-004",
        "sourceId": "SRC-004",
        "marker": "[CIT-004-A]",
        "relationship": "supports",
        "excerptId": "SRC-004-EXCERPT-001",
        "warningIds": [],
        "sourceLocationLabel": "Frontline assistance playbook excerpt",
        "confidenceLabel": "supported",
    },
    {
        "id": "CIT-005-A",
        "answerId": "ANS-001",
        "claimId": "CLAIM-005",
        "sourceId": "SRC-007",
        "marker": "[CIT-005-A]",
        "relationship": "supports",
        "excerptId": "SRC-007-EXCERPT-001",
        "warningIds": [],
        "sourceLocationLabel": "Reviewer audit procedure excerpt",
        "confidenceLabel": "supported",
    },
]

SOURCES: Final[list[JsonObject]] = [
    {
        "id": "SRC-001",
        "title": "South Brisbane Station Lift Works Service Brief",
        "sourceType": "planned_disruption_brief",
        "sourceOrigin": "synthetic_fixture",
        "ownerLabel": "Access Planning",
        "lastUpdated": "2026-06-24",
        "expiresAt": None,
        "freshness": "current",
        "excerptIds": ["SRC-001-EXCERPT-001"],
        "citationCount": 1,
        "warningIds": [],
        "isClaimSupportingEvidence": True,
        "contextAnchorIds": ["PCA-002"],
        "syntheticExcerptPreview": (
            "Fixture brief lists the South Brisbane station lift as unavailable "
            "for the planned travel window and tells staff to check temporary "
            "access advice."
        ),
        "reviewOwnerQueue": "access-planning-source-review",
    },
    {
        "id": "SRC-002",
        "title": "South Bank Temporary Shuttle Boarding Map",
        "sourceType": "wayfinding_map",
        "sourceOrigin": "synthetic_fixture",
        "ownerLabel": "Interchange Operations",
        "lastUpdated": "2026-05-10",
        "expiresAt": "2026-06-20",
        "freshness": "stale",
        "excerptIds": ["SRC-002-EXCERPT-001"],
        "citationCount": 1,
        "warningIds": ["WARN-001"],
        "isClaimSupportingEvidence": True,
        "contextAnchorIds": ["PCA-001", "PCA-002", "PCA-003"],
        "syntheticExcerptPreview": (
            "Fixture map places a temporary boarding marker on Grey Street near "
            "QPAC, but the map review date expired on 2026-06-20."
        ),
        "reviewOwnerQueue": "interchange-operations-source-update",
    },
    {
        "id": "SRC-003",
        "title": "Accessible Vehicle Allocation Guidance For Planned Shuttles",
        "sourceType": "operations_guidance",
        "sourceOrigin": "synthetic_fixture",
        "ownerLabel": "Fleet Scheduling",
        "lastUpdated": "2026-06-01",
        "expiresAt": None,
        "freshness": "current",
        "excerptIds": ["SRC-003-EXCERPT-001"],
        "citationCount": 1,
        "warningIds": [],
        "isClaimSupportingEvidence": True,
        "contextAnchorIds": [],
        "syntheticExcerptPreview": (
            "Fixture guidance says planned shuttles should prioritise accessible "
            "vehicles where available and confirm allocation close to service time."
        ),
        "reviewOwnerQueue": "fleet-scheduling-guidance-review",
    },
    {
        "id": "SRC-004",
        "title": "Frontline Assistance Playbook For Mobility Access Disruptions",
        "sourceType": "staff_playbook",
        "sourceOrigin": "synthetic_fixture",
        "ownerLabel": "Customer Support",
        "lastUpdated": "2026-04-18",
        "expiresAt": None,
        "freshness": "current",
        "excerptIds": ["SRC-004-EXCERPT-001"],
        "citationCount": 1,
        "warningIds": [],
        "isClaimSupportingEvidence": True,
        "contextAnchorIds": [],
        "syntheticExcerptPreview": (
            "Fixture playbook tells staff to arrange an assistance callback or "
            "alternate boarding check when a customer cannot reach a temporary stop."
        ),
        "reviewOwnerQueue": "customer-support-playbook-review",
    },
    {
        "id": "SRC-005",
        "title": "Hospital Precinct Transfer Handling Note",
        "sourceType": "service_note",
        "sourceOrigin": "synthetic_fixture",
        "ownerLabel": "Revenue Support",
        "lastUpdated": "2026-03-30",
        "expiresAt": None,
        "freshness": "current",
        "excerptIds": ["SRC-005-EXCERPT-001"],
        "citationCount": 0,
        "warningIds": [],
        "isClaimSupportingEvidence": True,
        "contextAnchorIds": ["PCA-004"],
        "syntheticExcerptPreview": (
            "Fixture note gives neutral hospital-precinct transfer wording, but "
            "the answer fixture does not cite or rely on it."
        ),
        "reviewOwnerQueue": "revenue-support-transfer-note-review",
    },
    {
        "id": "SRC-006",
        "title": "Day-Of-Service Shuttle Dispatch Confirmation",
        "sourceType": "missing_source_placeholder",
        "sourceOrigin": "missing_source_placeholder",
        "ownerLabel": "Operations Control",
        "lastUpdated": None,
        "expiresAt": None,
        "freshness": "missing",
        "excerptIds": ["SRC-006-EXCERPT-MISSING"],
        "citationCount": 1,
        "warningIds": ["WARN-003"],
        "isClaimSupportingEvidence": False,
        "contextAnchorIds": [],
        "syntheticExcerptPreview": (
            "Missing-placeholder preview states that no day-of-service dispatch "
            "confirmation is present for the fixture travel date or specific travel time."
        ),
        "reviewOwnerQueue": "operations-control-dispatch-confirmation",
    },
    {
        "id": "SRC-007",
        "title": "Reviewer Audit And Source Update Procedure",
        "sourceType": "review_process_note",
        "sourceOrigin": "synthetic_fixture",
        "ownerLabel": "AI Guidance Review",
        "lastUpdated": "2026-06-12",
        "expiresAt": None,
        "freshness": "current",
        "excerptIds": ["SRC-007-EXCERPT-001"],
        "citationCount": 1,
        "warningIds": [],
        "isClaimSupportingEvidence": True,
        "contextAnchorIds": [],
        "syntheticExcerptPreview": (
            "Fixture procedure tells reviewers to record evidence checked, "
            "source-update requests and approval state before the answer is marked reviewed."
        ),
        "reviewOwnerQueue": "ai-guidance-review-procedure-owner",
    },
]

SOURCE_WARNINGS: Final[list[JsonObject]] = [
    {
        "id": "WARN-001",
        "code": "source_stale",
        "severity": "high",
        "message": (
            "Temporary boarding map is past its review date. Confirm the current "
            "boarding point before this answer is used."
        ),
        "appliesTo": [
            {"objectType": "Source", "objectId": "SRC-002"},
            {"objectType": "AnswerClaim", "objectId": "CLAIM-002"},
            {"objectType": "Citation", "objectId": "CIT-002-A"},
        ],
        "evidenceImpact": "Boarding point advice depends on an expired synthetic source.",
        "blocksApproval": True,
        "recommendedActionId": "ACT-REQUEST-SOURCE-UPDATE",
    },
    {
        "id": "WARN-002",
        "code": "claim_weak_support",
        "severity": "high",
        "message": (
            "Step-free shuttle wording is stronger than the evidence. Treat the "
            "advice as conditional until dispatch or assistance confirmation exists."
        ),
        "appliesTo": [
            {"objectType": "AnswerClaim", "objectId": "CLAIM-003"},
            {"objectType": "Citation", "objectId": "CIT-003-A"},
        ],
        "evidenceImpact": (
            "Accessible vehicle guidance supports cautious planning language, not "
            "a step-free guarantee."
        ),
        "blocksApproval": True,
        "recommendedActionId": "ACT-REQUEST-SOURCE-UPDATE",
    },
    {
        "id": "WARN-003",
        "code": "missing_source",
        "severity": "high",
        "message": (
            "Dispatch confirmation needed for the specific travel time is not "
            "present in the fixture."
        ),
        "appliesTo": [
            {"objectType": "Source", "objectId": "SRC-006"},
            {"objectType": "AnswerClaim", "objectId": "CLAIM-003"},
            {"objectType": "Citation", "objectId": "CIT-003-B"},
        ],
        "evidenceImpact": "The step-free shuttle claim needs a missing dispatch confirmation source.",
        "blocksApproval": True,
        "recommendedActionId": "ACT-REQUEST-SOURCE-UPDATE",
    },
    {
        "id": "WARN-004",
        "code": "missing_user_context",
        "severity": "medium",
        "message": "Travel time and detailed assistance need are not yet known.",
        "appliesTo": [{"objectType": "PromptContext", "objectId": "CTX-001"}],
        "evidenceImpact": (
            "The final advice should confirm timing and assistance constraints "
            "before staff advise the customer."
        ),
        "blocksApproval": False,
    },
    {
        "id": "WARN-005",
        "code": "review_required",
        "severity": "medium",
        "message": "Answer has not been approved for use.",
        "appliesTo": [
            {"objectType": "Answer", "objectId": "ANS-001"},
            {"objectType": "ReviewState", "objectId": "REV-001"},
        ],
        "evidenceImpact": "The draft still needs local reviewer action before use.",
        "blocksApproval": True,
        "recommendedActionId": "ACT-REQUEST-SOURCE-UPDATE",
    },
    {
        "id": "WARN-006",
        "code": "unsafe_to_copy_until_reviewed",
        "severity": "medium",
        "message": "Copy or reuse should stay disabled while blocker warnings remain.",
        "appliesTo": [
            {"objectType": "Answer", "objectId": "ANS-001"},
            {"objectType": "ReviewState", "objectId": "REV-001"},
        ],
        "evidenceImpact": "The answer should not be copied as approved guidance until blockers resolve.",
        "blocksApproval": True,
    },
]

REVIEW_STATE: Final[JsonObject] = {
    "id": "REV-001",
    "answerId": "ANS-001",
    "status": "needs_review",
    "statusLabel": "Needs review",
    "activeWarningIds": ["WARN-001", "WARN-002", "WARN-003", "WARN-004", "WARN-005", "WARN-006"],
    "availableActionIds": [
        "ACT-REQUEST-SOURCE-UPDATE",
        "ACT-ADD-REVIEW-NOTE",
        "ACT-ESCALATE-SOURCE-OWNER",
        "ACT-MARK-UNSAFE",
    ],
    "completedActionIds": [],
    "lastActionId": None,
    "reviewerNote": None,
    "updatedAt": GENERATED_AT,
    "auditMetadataId": "AUDIT-001",
    "copyState": "disabled",
    "reviewerIdLabel": "reviewer-fixture-01",
    "approvalBlockedByWarningIds": ["WARN-001", "WARN-002", "WARN-003"],
}

AUDIT_METADATA: Final[JsonObject] = {
    "id": "AUDIT-001",
    "contractVersion": CONTRACT_VERSION,
    "scenarioId": SCENARIO_ID,
    "fixtureSetId": FIXTURE_SET_ID,
    "contractMode": CONTRACT_MODE,
    "generatedAt": GENERATED_AT,
    "sourceSetVersion": SOURCE_SET_VERSION,
    "publicContextSetVersion": PUBLIC_CONTEXT_SET_VERSION,
    "reviewEventIds": ["AUDIT-EVT-001", "AUDIT-EVT-002"],
    "lastReviewActionId": None,
    "modelLabel": "simulated_answer_fixture",
    "runtimeModeLabel": RUNTIME_MODE_LABEL,
    "boundaryNoteForDocs": (
        "Real Brisbane place names are context anchors. Operational events, "
        "source freshness, warnings and reviewer actions are synthetic fixture content."
    ),
}

EVIDENCE_GRAPH_ACCESSIBLE_SUMMARY: Final = (
    "The graph starts with the staff question, prompt context and four public "
    "context anchors. The context anchors are labels only and do not provide "
    "evidence. Current synthetic sources support the lift availability, "
    "assistance fallback and recordkeeping claims. The temporary boarding "
    "point claim is blocked by WARN-001 because SRC-002 is stale. CLAIM-003 is "
    "selected by default: SRC-003 provides only partial support, SRC-006 is "
    "missing, and WARN-002 plus WARN-003 require the request-source-update "
    "action. SRC-005 is present as uncited inventory only."
)

EVIDENCE_GRAPH_NODE_IDS: Final[list[str]] = [
    "NODE-Q",
    "NODE-CONTEXT",
    "NODE-PCA-001",
    "NODE-PCA-002",
    "NODE-PCA-003",
    "NODE-PCA-004",
    "NODE-SRC-001",
    "NODE-SRC-002",
    "NODE-SRC-003",
    "NODE-SRC-004",
    "NODE-SRC-005",
    "NODE-SRC-006",
    "NODE-SRC-007",
    "NODE-CLAIM-001",
    "NODE-CLAIM-002",
    "NODE-CLAIM-003",
    "NODE-CLAIM-004",
    "NODE-CLAIM-005",
    "NODE-ACT-REQUEST-SOURCE-UPDATE",
]

EVIDENCE_GRAPH_EDGE_IDS: Final[list[str]] = [
    "EDGE-Q-CONTEXT",
    "EDGE-CONTEXT-PCA001",
    "EDGE-CONTEXT-PCA002",
    "EDGE-CONTEXT-PCA003",
    "EDGE-CONTEXT-PCA004",
    "EDGE-CONTEXT-SRC001",
    "EDGE-CONTEXT-SRC002",
    "EDGE-CONTEXT-SRC003",
    "EDGE-CONTEXT-SRC004",
    "EDGE-CONTEXT-SRC005",
    "EDGE-CONTEXT-SRC006",
    "EDGE-CONTEXT-SRC007",
    "EDGE-SRC001-CLAIM001",
    "EDGE-SRC002-CLAIM002",
    "EDGE-SRC003-CLAIM003",
    "EDGE-SRC006-CLAIM003",
    "EDGE-SRC004-CLAIM004",
    "EDGE-SRC007-CLAIM005",
    "EDGE-CLAIM002-ACT-WARN001",
    "EDGE-CLAIM003-ACT-WARN002",
    "EDGE-CLAIM003-ACT-WARN003",
    "EDGE-CLAIM005-ACT-RECORDS",
]

EVIDENCE_GRAPH: Final[JsonObject] = {
    "id": "GRAPH-001",
    "contractVersion": CONTRACT_VERSION,
    "scenarioId": SCENARIO_ID,
    "answerId": "ANS-001",
    "promptContextId": "CTX-001",
    "reviewStateId": "REV-001",
    "auditMetadataId": "AUDIT-001",
    "sourceSetVersion": SOURCE_SET_VERSION,
    "publicContextSetVersion": PUBLIC_CONTEXT_SET_VERSION,
    "nodeIds": EVIDENCE_GRAPH_NODE_IDS,
    "edgeIds": EVIDENCE_GRAPH_EDGE_IDS,
    "rootNodeId": "NODE-Q",
    "defaultSelectedNodeId": "NODE-CLAIM-003",
    "defaultSelectedClaimId": "CLAIM-003",
    "defaultFocusedSourceIds": ["SRC-003", "SRC-006"],
    "defaultFocusedWarningIds": ["WARN-002", "WARN-003"],
    "accessibleSummary": EVIDENCE_GRAPH_ACCESSIBLE_SUMMARY,
    "layoutHint": "left_to_right_review_flow",
    "supportsKeyboardSummary": True,
    "smallViewportFallback": "step_list",
}

EVIDENCE_NODES: Final[list[JsonObject]] = [
    {
        "id": "NODE-Q",
        "graphId": "GRAPH-001",
        "type": "question",
        "label": "Staff mobility-access question",
        "refObjectType": "PromptContext",
        "refObjectId": "CTX-001",
        "warningIds": [],
        "displayOrder": 1,
        "status": "question",
        "positionHint": {"column": 1, "row": 1},
    },
    {
        "id": "NODE-CONTEXT",
        "graphId": "GRAPH-001",
        "type": "prompt_context",
        "label": "Travel date, access need and unknown time",
        "refObjectType": "PromptContext",
        "refObjectId": "CTX-001",
        "warningIds": ["WARN-004"],
        "displayOrder": 2,
        "status": "missing_context",
        "positionHint": {"column": 2, "row": 1},
    },
    {
        "id": "NODE-PCA-001",
        "graphId": "GRAPH-001",
        "type": "public_context_anchor",
        "label": "South Bank",
        "refObjectType": "PublicContextAnchor",
        "refObjectId": "PCA-001",
        "warningIds": [],
        "displayOrder": 3,
        "status": "context_only",
        "positionHint": {"column": 2, "row": 2},
    },
    {
        "id": "NODE-PCA-002",
        "graphId": "GRAPH-001",
        "type": "public_context_anchor",
        "label": "South Brisbane station",
        "refObjectType": "PublicContextAnchor",
        "refObjectId": "PCA-002",
        "warningIds": [],
        "displayOrder": 4,
        "status": "context_only",
        "positionHint": {"column": 2, "row": 3},
    },
    {
        "id": "NODE-PCA-003",
        "graphId": "GRAPH-001",
        "type": "public_context_anchor",
        "label": "QPAC/Grey Street",
        "refObjectType": "PublicContextAnchor",
        "refObjectId": "PCA-003",
        "warningIds": [],
        "displayOrder": 5,
        "status": "context_only",
        "positionHint": {"column": 2, "row": 4},
    },
    {
        "id": "NODE-PCA-004",
        "graphId": "GRAPH-001",
        "type": "public_context_anchor",
        "label": "Princess Alexandra Hospital",
        "refObjectType": "PublicContextAnchor",
        "refObjectId": "PCA-004",
        "warningIds": [],
        "displayOrder": 6,
        "status": "context_only",
        "positionHint": {"column": 2, "row": 5},
    },
    {
        "id": "NODE-SRC-001",
        "graphId": "GRAPH-001",
        "type": "source",
        "label": "Current lift-works brief",
        "refObjectType": "Source",
        "refObjectId": "SRC-001",
        "warningIds": [],
        "displayOrder": 7,
        "status": "current_supporting",
        "positionHint": {"column": 3, "row": 1},
    },
    {
        "id": "NODE-SRC-002",
        "graphId": "GRAPH-001",
        "type": "source_warning",
        "label": "Stale temporary boarding map",
        "refObjectType": "Source",
        "refObjectId": "SRC-002",
        "warningIds": ["WARN-001"],
        "displayOrder": 8,
        "status": "stale_blocker",
        "positionHint": {"column": 3, "row": 2},
    },
    {
        "id": "NODE-SRC-003",
        "graphId": "GRAPH-001",
        "type": "source",
        "label": "Conditional accessible-vehicle guidance",
        "refObjectType": "Source",
        "refObjectId": "SRC-003",
        "warningIds": [],
        "displayOrder": 9,
        "status": "current_conditional_support",
        "positionHint": {"column": 3, "row": 3},
    },
    {
        "id": "NODE-SRC-004",
        "graphId": "GRAPH-001",
        "type": "source",
        "label": "Current assistance playbook",
        "refObjectType": "Source",
        "refObjectId": "SRC-004",
        "warningIds": [],
        "displayOrder": 10,
        "status": "current_supporting",
        "positionHint": {"column": 3, "row": 4},
    },
    {
        "id": "NODE-SRC-005",
        "graphId": "GRAPH-001",
        "type": "source",
        "label": "Uncited transfer note",
        "refObjectType": "Source",
        "refObjectId": "SRC-005",
        "warningIds": [],
        "displayOrder": 11,
        "status": "current_uncited",
        "positionHint": {"column": 3, "row": 5},
    },
    {
        "id": "NODE-SRC-006",
        "graphId": "GRAPH-001",
        "type": "missing_source",
        "label": "Missing dispatch confirmation",
        "refObjectType": "Source",
        "refObjectId": "SRC-006",
        "warningIds": ["WARN-003"],
        "displayOrder": 12,
        "status": "missing_blocker",
        "positionHint": {"column": 3, "row": 6},
    },
    {
        "id": "NODE-SRC-007",
        "graphId": "GRAPH-001",
        "type": "source",
        "label": "Current review procedure note",
        "refObjectType": "Source",
        "refObjectId": "SRC-007",
        "warningIds": [],
        "displayOrder": 13,
        "status": "current_supporting",
        "positionHint": {"column": 3, "row": 7},
    },
    {
        "id": "NODE-CLAIM-001",
        "graphId": "GRAPH-001",
        "type": "answer_claim",
        "label": "Lift availability claim",
        "refObjectType": "AnswerClaim",
        "refObjectId": "CLAIM-001",
        "warningIds": [],
        "displayOrder": 14,
        "status": "supported",
        "positionHint": {"column": 4, "row": 1},
    },
    {
        "id": "NODE-CLAIM-002",
        "graphId": "GRAPH-001",
        "type": "answer_claim_warning",
        "label": "Temporary boarding point claim",
        "refObjectType": "AnswerClaim",
        "refObjectId": "CLAIM-002",
        "warningIds": ["WARN-001"],
        "displayOrder": 15,
        "status": "needs_source_update",
        "positionHint": {"column": 4, "row": 2},
    },
    {
        "id": "NODE-CLAIM-003",
        "graphId": "GRAPH-001",
        "type": "answer_claim_warning",
        "label": "Step-free shuttle guarantee claim",
        "refObjectType": "AnswerClaim",
        "refObjectId": "CLAIM-003",
        "warningIds": ["WARN-002", "WARN-003"],
        "displayOrder": 16,
        "status": "requires_review",
        "positionHint": {"column": 4, "row": 3},
    },
    {
        "id": "NODE-CLAIM-004",
        "graphId": "GRAPH-001",
        "type": "answer_claim",
        "label": "Assistance fallback claim",
        "refObjectType": "AnswerClaim",
        "refObjectId": "CLAIM-004",
        "warningIds": [],
        "displayOrder": 17,
        "status": "supported",
        "positionHint": {"column": 4, "row": 4},
    },
    {
        "id": "NODE-CLAIM-005",
        "graphId": "GRAPH-001",
        "type": "answer_claim",
        "label": "Record advice and evidence claim",
        "refObjectType": "AnswerClaim",
        "refObjectId": "CLAIM-005",
        "warningIds": [],
        "displayOrder": 18,
        "status": "supported",
        "positionHint": {"column": 4, "row": 5},
    },
    {
        "id": "NODE-ACT-REQUEST-SOURCE-UPDATE",
        "graphId": "GRAPH-001",
        "type": "review_action",
        "label": "Request source update",
        "refObjectType": "ReviewAction",
        "refObjectId": "ACT-REQUEST-SOURCE-UPDATE",
        "warningIds": ["WARN-005", "WARN-006"],
        "displayOrder": 19,
        "status": "primary_action_available",
        "positionHint": {"column": 5, "row": 3},
    },
]

EVIDENCE_EDGES: Final[list[JsonObject]] = [
    {
        "id": "EDGE-Q-CONTEXT",
        "graphId": "GRAPH-001",
        "fromNodeId": "NODE-Q",
        "toNodeId": "NODE-CONTEXT",
        "type": "frames",
        "label": "frames prompt context",
        "refObjectType": "PromptContext",
        "refObjectId": "CTX-001",
        "warningIds": [],
    },
    {
        "id": "EDGE-CONTEXT-PCA001",
        "graphId": "GRAPH-001",
        "fromNodeId": "NODE-CONTEXT",
        "toNodeId": "NODE-PCA-001",
        "type": "uses_place_anchor",
        "label": "context anchor only",
        "refObjectType": "PublicContextAnchor",
        "refObjectId": "PCA-001",
        "warningIds": [],
    },
    {
        "id": "EDGE-CONTEXT-PCA002",
        "graphId": "GRAPH-001",
        "fromNodeId": "NODE-CONTEXT",
        "toNodeId": "NODE-PCA-002",
        "type": "uses_place_anchor",
        "label": "context anchor only",
        "refObjectType": "PublicContextAnchor",
        "refObjectId": "PCA-002",
        "warningIds": [],
    },
    {
        "id": "EDGE-CONTEXT-PCA003",
        "graphId": "GRAPH-001",
        "fromNodeId": "NODE-CONTEXT",
        "toNodeId": "NODE-PCA-003",
        "type": "uses_place_anchor",
        "label": "context anchor only",
        "refObjectType": "PublicContextAnchor",
        "refObjectId": "PCA-003",
        "warningIds": [],
    },
    {
        "id": "EDGE-CONTEXT-PCA004",
        "graphId": "GRAPH-001",
        "fromNodeId": "NODE-CONTEXT",
        "toNodeId": "NODE-PCA-004",
        "type": "uses_place_anchor",
        "label": "context anchor only",
        "refObjectType": "PublicContextAnchor",
        "refObjectId": "PCA-004",
        "warningIds": [],
    },
    {
        "id": "EDGE-CONTEXT-SRC001",
        "graphId": "GRAPH-001",
        "fromNodeId": "NODE-CONTEXT",
        "toNodeId": "NODE-SRC-001",
        "type": "retrieves",
        "label": "retrieves synthetic source",
        "refObjectType": "Source",
        "refObjectId": "SRC-001",
        "warningIds": [],
    },
    {
        "id": "EDGE-CONTEXT-SRC002",
        "graphId": "GRAPH-001",
        "fromNodeId": "NODE-CONTEXT",
        "toNodeId": "NODE-SRC-002",
        "type": "retrieves",
        "label": "retrieves stale synthetic source",
        "refObjectType": "Source",
        "refObjectId": "SRC-002",
        "warningIds": ["WARN-001"],
    },
    {
        "id": "EDGE-CONTEXT-SRC003",
        "graphId": "GRAPH-001",
        "fromNodeId": "NODE-CONTEXT",
        "toNodeId": "NODE-SRC-003",
        "type": "retrieves",
        "label": "retrieves conditional guidance",
        "refObjectType": "Source",
        "refObjectId": "SRC-003",
        "warningIds": [],
    },
    {
        "id": "EDGE-CONTEXT-SRC004",
        "graphId": "GRAPH-001",
        "fromNodeId": "NODE-CONTEXT",
        "toNodeId": "NODE-SRC-004",
        "type": "retrieves",
        "label": "retrieves synthetic source",
        "refObjectType": "Source",
        "refObjectId": "SRC-004",
        "warningIds": [],
    },
    {
        "id": "EDGE-CONTEXT-SRC005",
        "graphId": "GRAPH-001",
        "fromNodeId": "NODE-CONTEXT",
        "toNodeId": "NODE-SRC-005",
        "type": "retrieves",
        "label": "retrieves uncited inventory source",
        "refObjectType": "Source",
        "refObjectId": "SRC-005",
        "warningIds": [],
    },
    {
        "id": "EDGE-CONTEXT-SRC006",
        "graphId": "GRAPH-001",
        "fromNodeId": "NODE-CONTEXT",
        "toNodeId": "NODE-SRC-006",
        "type": "retrieves",
        "label": "expects missing confirmation",
        "refObjectType": "Source",
        "refObjectId": "SRC-006",
        "warningIds": ["WARN-003"],
    },
    {
        "id": "EDGE-CONTEXT-SRC007",
        "graphId": "GRAPH-001",
        "fromNodeId": "NODE-CONTEXT",
        "toNodeId": "NODE-SRC-007",
        "type": "retrieves",
        "label": "retrieves review procedure",
        "refObjectType": "Source",
        "refObjectId": "SRC-007",
        "warningIds": [],
    },
    {
        "id": "EDGE-SRC001-CLAIM001",
        "graphId": "GRAPH-001",
        "fromNodeId": "NODE-SRC-001",
        "toNodeId": "NODE-CLAIM-001",
        "type": "supports",
        "label": "supports claim",
        "refObjectType": "Citation",
        "refObjectId": "CIT-001-A",
        "warningIds": [],
    },
    {
        "id": "EDGE-SRC002-CLAIM002",
        "graphId": "GRAPH-001",
        "fromNodeId": "NODE-SRC-002",
        "toNodeId": "NODE-CLAIM-002",
        "type": "supports_with_warning",
        "label": "supports with stale warning",
        "refObjectType": "Citation",
        "refObjectId": "CIT-002-A",
        "warningIds": ["WARN-001"],
    },
    {
        "id": "EDGE-SRC003-CLAIM003",
        "graphId": "GRAPH-001",
        "fromNodeId": "NODE-SRC-003",
        "toNodeId": "NODE-CLAIM-003",
        "type": "partial_support",
        "label": "conditional support only",
        "refObjectType": "Citation",
        "refObjectId": "CIT-003-A",
        "warningIds": ["WARN-002"],
    },
    {
        "id": "EDGE-SRC006-CLAIM003",
        "graphId": "GRAPH-001",
        "fromNodeId": "NODE-SRC-006",
        "toNodeId": "NODE-CLAIM-003",
        "type": "missing_evidence",
        "label": "confirmation missing",
        "refObjectType": "Citation",
        "refObjectId": "CIT-003-B",
        "warningIds": ["WARN-003"],
    },
    {
        "id": "EDGE-SRC004-CLAIM004",
        "graphId": "GRAPH-001",
        "fromNodeId": "NODE-SRC-004",
        "toNodeId": "NODE-CLAIM-004",
        "type": "supports",
        "label": "supports claim",
        "refObjectType": "Citation",
        "refObjectId": "CIT-004-A",
        "warningIds": [],
    },
    {
        "id": "EDGE-SRC007-CLAIM005",
        "graphId": "GRAPH-001",
        "fromNodeId": "NODE-SRC-007",
        "toNodeId": "NODE-CLAIM-005",
        "type": "supports",
        "label": "supports recordkeeping claim",
        "refObjectType": "Citation",
        "refObjectId": "CIT-005-A",
        "warningIds": [],
    },
    {
        "id": "EDGE-CLAIM002-ACT-WARN001",
        "graphId": "GRAPH-001",
        "fromNodeId": "NODE-CLAIM-002",
        "toNodeId": "NODE-ACT-REQUEST-SOURCE-UPDATE",
        "type": "requires_review",
        "label": "stale source requires update",
        "refObjectType": "SourceWarning",
        "refObjectId": "WARN-001",
        "warningIds": ["WARN-001"],
    },
    {
        "id": "EDGE-CLAIM003-ACT-WARN002",
        "graphId": "GRAPH-001",
        "fromNodeId": "NODE-CLAIM-003",
        "toNodeId": "NODE-ACT-REQUEST-SOURCE-UPDATE",
        "type": "requires_review",
        "label": "weak support requires review",
        "refObjectType": "SourceWarning",
        "refObjectId": "WARN-002",
        "warningIds": ["WARN-002"],
    },
    {
        "id": "EDGE-CLAIM003-ACT-WARN003",
        "graphId": "GRAPH-001",
        "fromNodeId": "NODE-CLAIM-003",
        "toNodeId": "NODE-ACT-REQUEST-SOURCE-UPDATE",
        "type": "requires_review",
        "label": "missing source requires update",
        "refObjectType": "SourceWarning",
        "refObjectId": "WARN-003",
        "warningIds": ["WARN-003"],
    },
    {
        "id": "EDGE-CLAIM005-ACT-RECORDS",
        "graphId": "GRAPH-001",
        "fromNodeId": "NODE-CLAIM-005",
        "toNodeId": "NODE-ACT-REQUEST-SOURCE-UPDATE",
        "type": "records_action",
        "label": "record evidence checked",
        "refObjectType": "ReviewAction",
        "refObjectId": "ACT-REQUEST-SOURCE-UPDATE",
        "warningIds": [],
    },
]

SMALL_VIEWPORT_FALLBACK_STEPS: Final[list[JsonObject]] = [
    {
        "step": 1,
        "heading": "Question and context",
        "includeIds": ["NODE-Q", "NODE-CONTEXT", "WARN-004"],
        "summary": (
            "The staff question is framed by a travel date, access need and "
            "missing exact travel time."
        ),
    },
    {
        "step": 2,
        "heading": "Context anchors",
        "includeIds": ["NODE-PCA-001", "NODE-PCA-002", "NODE-PCA-003", "NODE-PCA-004"],
        "summary": "Place labels are context only and cannot support claims.",
    },
    {
        "step": 3,
        "heading": "Current supported claims",
        "includeIds": [
            "NODE-SRC-001",
            "NODE-SRC-004",
            "NODE-SRC-007",
            "NODE-CLAIM-001",
            "NODE-CLAIM-004",
            "NODE-CLAIM-005",
        ],
        "summary": "These cited synthetic sources support the lower-risk claims.",
    },
    {
        "step": 4,
        "heading": "Stale source blocker",
        "includeIds": ["NODE-SRC-002", "NODE-CLAIM-002", "WARN-001"],
        "summary": (
            "The boarding point claim depends on an expired synthetic source "
            "and needs an update."
        ),
    },
    {
        "step": 5,
        "heading": "Selected evidence gap",
        "includeIds": ["NODE-SRC-003", "NODE-SRC-006", "NODE-CLAIM-003", "WARN-002", "WARN-003"],
        "summary": (
            "The selected step-free claim has only partial guidance and a "
            "missing confirmation source."
        ),
    },
    {
        "step": 6,
        "heading": "Reviewer action",
        "includeIds": ["NODE-ACT-REQUEST-SOURCE-UPDATE"],
        "summary": "Request a source update before approval; record the evidence checked.",
    },
]

BASE_FIXTURE_METADATA: Final[JsonObject] = {
    "contractVersion": CONTRACT_VERSION,
    "contractMode": CONTRACT_MODE,
    "runtimeModeLabel": RUNTIME_MODE_LABEL,
    "scenarioId": SCENARIO_ID,
    "fixtureSetId": FIXTURE_SET_ID,
    "sourceSetVersion": SOURCE_SET_VERSION,
    "publicContextSetVersion": PUBLIC_CONTEXT_SET_VERSION,
}

ANSWER_FIXTURE_RESPONSE: Final[JsonObject] = {
    **BASE_FIXTURE_METADATA,
    "promptContext": PROMPT_CONTEXT,
    "publicContextAnchors": PUBLIC_CONTEXT_ANCHORS,
    "answer": ANSWER,
    "answerClaims": ANSWER_CLAIMS,
    "citations": CITATIONS,
    "sourceWarnings": SOURCE_WARNINGS,
    "reviewState": REVIEW_STATE,
    "auditMetadata": AUDIT_METADATA,
}

SOURCE_INVENTORY_RESPONSE: Final[JsonObject] = {
    **BASE_FIXTURE_METADATA,
    "sources": SOURCES,
    "sourceWarnings": SOURCE_WARNINGS,
    "publicContextAnchors": PUBLIC_CONTEXT_ANCHORS,
}

EVIDENCE_GRAPH_RESPONSE: Final[JsonObject] = {
    **BASE_FIXTURE_METADATA,
    "evidenceGraph": EVIDENCE_GRAPH,
    "evidenceNodes": EVIDENCE_NODES,
    "evidenceEdges": EVIDENCE_EDGES,
    "sourceWarnings": SOURCE_WARNINGS,
    "publicContextAnchors": PUBLIC_CONTEXT_ANCHORS,
    "reviewState": REVIEW_STATE,
    "smallViewportFallbackSteps": SMALL_VIEWPORT_FALLBACK_STEPS,
}


def get_answer_fixture_response() -> JsonObject:
    return deepcopy(ANSWER_FIXTURE_RESPONSE)


def get_source_inventory_response() -> JsonObject:
    return deepcopy(SOURCE_INVENTORY_RESPONSE)


def get_evidence_graph_response() -> JsonObject:
    return deepcopy(EVIDENCE_GRAPH_RESPONSE)
