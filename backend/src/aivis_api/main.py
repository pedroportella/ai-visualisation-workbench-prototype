from typing import Annotated

from fastapi import Body, FastAPI, HTTPException

from aivis_api import __version__
from aivis_api.fixture_data import (
    CONTRACT_MODE,
    CONTRACT_VERSION,
    PUBLIC_CONTEXT_SET_VERSION,
    RUNTIME_MODE_LABEL,
    SERVICE_ID,
    SOURCE_SET_VERSION,
    get_answer_fixture_response,
    get_evidence_graph_response,
    get_source_inventory_response,
)
from aivis_api.review_state import (
    ReviewActionError,
    ReviewActionRequest,
    apply_review_action,
)

APP_TITLE = "AI Visualisation Workbench API"
APP_SUMMARY = "Local fixture API for AIVIS contract review."
APP_DESCRIPTION = (
    "Minimal FastAPI API spine for the AI Visualisation Workbench prototype. "
    "The current surface exposes local health, readiness, mode metadata, "
    "deterministic answer/source/graph fixtures and one local review-action "
    "state transition.\n\n"
    "Contract posture:\n"
    "- runtimeModeLabel: local_fixture\n"
    "- contractMode: synthetic_fixture\n"
    "- contractVersion: aivis-evidence-workbench-contract@0.1.0\n"
    "- sourceSetVersion: synthetic-source-set-v1\n"
    "- publicContextSetVersion: public-context-anchor-set-v1\n\n"
    "Public boundary: real Brisbane place names appear only as "
    "PublicContextAnchor context labels. Operational events, source freshness, "
    "warnings and review actions are deterministic synthetic fixture content. "
    "This prototype is not connected to TMR systems, is not QChat and is not an "
    "official Queensland Government service."
)
OPENAPI_TAGS = [
    {
        "name": "health",
        "description": (
            "Local process health and readiness checks for the implemented "
            "fixture backend only."
        ),
    },
    {
        "name": "metadata",
        "description": (
            "Runtime mode and contract labels shared by the Evidence Workbench "
            "fixture endpoints."
        ),
    },
    {
        "name": "evidence-workbench",
        "description": (
            "Deterministic synthetic fixture endpoints for answer review, "
            "source traceability, graph review and local review-action state. "
            "These routes do not perform live retrieval, source-system "
            "writeback or production audit logging."
        ),
    },
]

LIVE_RESPONSE: dict[str, object] = {
    "status": "ok",
    "service": SERVICE_ID,
    "apiVersion": __version__,
    "runtimeModeLabel": RUNTIME_MODE_LABEL,
}

READY_RESPONSE: dict[str, object] = {
    "status": "ready",
    "service": SERVICE_ID,
    "apiVersion": __version__,
    "runtimeModeLabel": RUNTIME_MODE_LABEL,
    "readyFor": ["local_api_health_and_metadata"],
    "checks": {
        "app": "ready",
        "healthEndpoints": "ready",
        "metadataEndpoint": "ready",
    },
}

META_RESPONSE: dict[str, object] = {
    "service": SERVICE_ID,
    "serviceName": APP_TITLE,
    "apiVersion": __version__,
    "runtimeModeLabel": RUNTIME_MODE_LABEL,
    "contractMode": CONTRACT_MODE,
    "contractVersion": CONTRACT_VERSION,
    "sourceSetVersion": SOURCE_SET_VERSION,
    "publicContextSetVersion": PUBLIC_CONTEXT_SET_VERSION,
    "implementedCapabilities": ["health", "readiness", "mode_metadata"],
}

CONTRACT_LABEL_EXAMPLE: dict[str, object] = {
    "runtimeModeLabel": RUNTIME_MODE_LABEL,
    "contractMode": CONTRACT_MODE,
    "contractVersion": CONTRACT_VERSION,
    "sourceSetVersion": SOURCE_SET_VERSION,
    "publicContextSetVersion": PUBLIC_CONTEXT_SET_VERSION,
}

ANSWER_OPENAPI_EXAMPLE: dict[str, object] = {
    **CONTRACT_LABEL_EXAMPLE,
    "answer": {
        "id": "ANS-001",
        "reviewStateId": "REV-001",
        "auditMetadataId": "AUDIT-001",
        "defaultSelectedClaimId": "CLAIM-003",
        "copyState": "disabled",
    },
    "answerClaims": [
        {
            "id": "CLAIM-003",
            "evidencePosture": "weak_support",
            "citationIds": ["CIT-003-A", "CIT-003-B"],
            "supportingSourceIds": ["SRC-003"],
            "requiredMissingSourceIds": ["SRC-006"],
            "contextAnchorIds": ["PCA-001", "PCA-004"],
            "warningIds": ["WARN-002", "WARN-003"],
        }
    ],
    "citations": [
        {
            "id": "CIT-003-B",
            "claimId": "CLAIM-003",
            "sourceId": "SRC-006",
            "relationship": "missing_evidence",
            "warningIds": ["WARN-003"],
        }
    ],
    "publicContextAnchors": [
        {
            "id": "PCA-001",
            "label": "South Bank",
            "isOperationalTruth": False,
            "evidenceUseProhibited": True,
        }
    ],
    "sourceWarnings": [{"id": "WARN-003", "code": "missing_source"}],
    "reviewState": {"id": "REV-001", "status": "needs_review"},
    "auditMetadata": {"id": "AUDIT-001", "runtimeModeLabel": RUNTIME_MODE_LABEL},
}

SOURCES_OPENAPI_EXAMPLE: dict[str, object] = {
    **CONTRACT_LABEL_EXAMPLE,
    "sources": [
        {
            "id": "SRC-002",
            "sourceOrigin": "synthetic_fixture",
            "freshness": "stale",
            "warningIds": ["WARN-001"],
            "isClaimSupportingEvidence": True,
        },
        {
            "id": "SRC-006",
            "sourceOrigin": "missing_source_placeholder",
            "freshness": "missing",
            "warningIds": ["WARN-003"],
            "isClaimSupportingEvidence": False,
        },
    ],
    "sourceWarnings": [{"id": "WARN-001", "code": "source_stale"}],
    "publicContextAnchors": [
        {
            "id": "PCA-002",
            "label": "South Brisbane station",
            "isOperationalTruth": False,
            "evidenceUseProhibited": True,
        }
    ],
}

GRAPH_OPENAPI_EXAMPLE: dict[str, object] = {
    **CONTRACT_LABEL_EXAMPLE,
    "evidenceGraph": {
        "id": "GRAPH-001",
        "defaultSelectedNodeId": "NODE-CLAIM-003",
        "defaultSelectedClaimId": "CLAIM-003",
        "smallViewportFallback": "step_list",
    },
    "evidenceNodes": [
        {
            "id": "NODE-CLAIM-003",
            "type": "answer_claim_warning",
            "refObjectType": "AnswerClaim",
            "refObjectId": "CLAIM-003",
            "warningIds": ["WARN-002", "WARN-003"],
        }
    ],
    "evidenceEdges": [
        {
            "id": "EDGE-SRC006-CLAIM003",
            "type": "missing_evidence",
            "refObjectType": "Citation",
            "refObjectId": "CIT-003-B",
            "warningIds": ["WARN-003"],
        }
    ],
    "publicContextAnchors": [
        {
            "id": "PCA-003",
            "label": "QPAC/Grey Street",
            "evidenceUseProhibited": True,
        }
    ],
    "reviewState": {"id": "REV-001", "status": "needs_review"},
    "smallViewportFallbackSteps": [{"step": 5, "heading": "Selected evidence gap"}],
}

REVIEW_ACTION_REQUEST_OPENAPI_EXAMPLES = {
    "requestSourceUpdate": {
        "summary": "Record the deterministic local source-update request",
        "value": {
            "reviewActionId": "ACT-REQUEST-SOURCE-UPDATE",
            "reviewStateId": "REV-001",
            "answerId": "ANS-001",
            "reviewerNote": (
                "Do not approve as written. Refresh the temporary boarding map "
                "and change the step-free shuttle wording to require "
                "day-of-service confirmation before staff advise the customer."
            ),
        },
    }
}

REVIEW_ACTION_OPENAPI_EXAMPLE: dict[str, object] = {
    **CONTRACT_LABEL_EXAMPLE,
    "reviewAction": {"id": "ACT-REQUEST-SOURCE-UPDATE"},
    "implementedActionIds": ["ACT-REQUEST-SOURCE-UPDATE"],
    "reviewState": {
        "id": "REV-001",
        "status": "source_update_requested",
        "lastActionId": "ACT-REQUEST-SOURCE-UPDATE",
        "activeWarningIds": [
            "WARN-001",
            "WARN-002",
            "WARN-003",
            "WARN-004",
            "WARN-006",
            "WARN-007",
        ],
    },
    "auditMetadata": {
        "id": "AUDIT-001",
        "lastReviewActionId": "ACT-REQUEST-SOURCE-UPDATE",
    },
    "sourceWarnings": [{"id": "WARN-007", "code": "source_update_requested"}],
    "localState": {
        "storage": "in_memory_process",
        "sourceSystemWriteback": "not_performed",
        "productionAuditLogging": "not_performed",
    },
}

REVIEW_ACTION_CONFLICT_EXAMPLE: dict[str, object] = {
    "detail": (
        "ACT-MARK-REVIEWED is unavailable while WARN-001, WARN-002 or "
        "WARN-003 are active."
    )
}


def create_app() -> FastAPI:
    """Create the FastAPI app for the local fixture backend."""
    api = FastAPI(
        title=APP_TITLE,
        summary=APP_SUMMARY,
        description=APP_DESCRIPTION,
        version=__version__,
        openapi_tags=OPENAPI_TAGS,
    )

    @api.get(
        "/health/live",
        tags=["health"],
        summary="Check live API process",
        description=(
            "Returns deterministic liveness for the local fixture API process. "
            "This check does not probe external data sources."
        ),
        response_description="Local API process liveness.",
        responses={
            200: {
                "description": "The local API process is reachable.",
                "content": {"application/json": {"example": LIVE_RESPONSE}},
            }
        },
    )
    def health_live() -> dict[str, object]:
        return LIVE_RESPONSE

    @api.get(
        "/health/ready",
        tags=["health"],
        summary="Check local readiness",
        description=(
            "Returns readiness for the implemented local API health and "
            "metadata surface. It does not assert fixture freshness, live "
            "retrieval or production integration."
        ),
        response_description="Implemented local readiness checks.",
        responses={
            200: {
                "description": "The implemented local API surface is ready.",
                "content": {"application/json": {"example": READY_RESPONSE}},
            }
        },
    )
    def health_ready() -> dict[str, object]:
        return READY_RESPONSE

    @api.get(
        "/meta",
        tags=["metadata"],
        summary="Return fixture contract metadata",
        description=(
            "Returns the local runtime mode, synthetic contract mode, contract "
            "version, source set version and public context set version used by "
            "the Evidence Workbench fixture endpoints."
        ),
        response_description="Current local fixture metadata.",
        responses={
            200: {
                "description": "Current local fixture metadata labels.",
                "content": {"application/json": {"example": META_RESPONSE}},
            }
        },
    )
    def meta() -> dict[str, object]:
        return META_RESPONSE

    @api.get(
        "/evidence-workbench/answer",
        tags=["evidence-workbench"],
        summary="Get Evidence Workbench answer fixture",
        description=(
            "Returns the read-only answer fixture for ANS-001 with answer "
            "claims, citations, source warnings, prompt context, public context "
            "anchors, initial review state and audit metadata. PublicContextAnchor "
            "records are context only; citations and claim support reference "
            "Source ids only."
        ),
        response_description="Deterministic synthetic answer fixture.",
        responses={
            200: {
                "description": "Answer, citation and initial review-state fixture.",
                "content": {"application/json": {"example": ANSWER_OPENAPI_EXAMPLE}},
            }
        },
    )
    def evidence_workbench_answer() -> dict[str, object]:
        return get_answer_fixture_response()

    @api.get(
        "/evidence-workbench/sources",
        tags=["evidence-workbench"],
        summary="Get Evidence Workbench source inventory fixture",
        description=(
            "Returns the read-only source inventory for SRC-001 through "
            "SRC-007, active warning records and PublicContextAnchor records. "
            "The sources are deterministic synthetic fixture evidence, and "
            "public context anchors cannot satisfy citation or claim support."
        ),
        response_description="Deterministic synthetic source inventory fixture.",
        responses={
            200: {
                "description": "Source inventory and public context anchors.",
                "content": {"application/json": {"example": SOURCES_OPENAPI_EXAMPLE}},
            }
        },
    )
    def evidence_workbench_sources() -> dict[str, object]:
        return get_source_inventory_response()

    @api.get(
        "/evidence-workbench/graph",
        tags=["evidence-workbench"],
        summary="Get Evidence Workbench evidence graph fixture",
        description=(
            "Returns the read-only GRAPH-001 evidence graph, node and edge "
            "inventory, active warning records, PublicContextAnchor records, "
            "initial review state, accessible summary and small-viewport "
            "fallback steps. Context-anchor graph edges use uses_place_anchor "
            "only and are not evidence support."
        ),
        response_description="Deterministic synthetic evidence graph fixture.",
        responses={
            200: {
                "description": "Graph, node, edge and fallback fixture.",
                "content": {"application/json": {"example": GRAPH_OPENAPI_EXAMPLE}},
            }
        },
    )
    def evidence_workbench_graph() -> dict[str, object]:
        return get_evidence_graph_response()

    @api.post(
        "/evidence-workbench/review-actions",
        tags=["evidence-workbench"],
        summary="Record local Evidence Workbench review action",
        description=(
            "Applies the deterministic ACT-REQUEST-SOURCE-UPDATE transition "
            "for REV-001 in local process memory. The endpoint returns "
            "post-action review state, audit metadata, active warnings and "
            "local-state reset notes. It does not mutate the read-only answer "
            "or graph fixture responses and does not perform source-system "
            "writeback."
        ),
        response_description="Local review-action state transition result.",
        responses={
            200: {
                "description": "Local review-action transition result.",
                "content": {"application/json": {"example": REVIEW_ACTION_OPENAPI_EXAMPLE}},
            },
            400: {"description": "The deterministic reviewer note is missing or changed."},
            404: {"description": "The requested review action, review state or answer is unknown."},
            409: {
                "description": "The requested review action is unavailable in the current local state.",
                "content": {"application/json": {"example": REVIEW_ACTION_CONFLICT_EXAMPLE}},
            },
        },
    )
    def evidence_workbench_review_action(
        request: Annotated[
            ReviewActionRequest,
            Body(openapi_examples=REVIEW_ACTION_REQUEST_OPENAPI_EXAMPLES),
        ],
    ) -> dict[str, object]:
        try:
            return apply_review_action(request)
        except ReviewActionError as error:
            raise HTTPException(status_code=error.status_code, detail=error.detail) from error

    return api


app = create_app()
