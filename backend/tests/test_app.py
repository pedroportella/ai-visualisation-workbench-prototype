from fastapi import FastAPI
from fastapi.routing import APIRoute

from aivis_api.main import app


def get_route(path: str) -> APIRoute:
    for route in app.routes:
        if isinstance(route, APIRoute) and route.path == path:
            return route

    raise AssertionError(f"Expected route not found: {path}")


def call_endpoint(path: str) -> dict[str, object]:
    route = get_route(path)
    payload = route.endpoint()

    assert isinstance(payload, dict)
    return payload


def require_mapping(payload: dict[str, object], key: str) -> dict[str, object]:
    value = payload[key]
    assert isinstance(value, dict)
    return value


def require_object_list(payload: dict[str, object], key: str) -> list[dict[str, object]]:
    value = payload[key]
    assert isinstance(value, list)
    assert all(isinstance(item, dict) for item in value)
    return value


def by_id(items: list[dict[str, object]]) -> dict[str, dict[str, object]]:
    return {str(item["id"]): item for item in items}


def test_app_imports_as_fastapi_instance() -> None:
    assert isinstance(app, FastAPI)
    assert app.title == "AI Visualisation Workbench API"
    assert app.version == "0.1.0"


def test_b02_operational_routes_are_scaffolded() -> None:
    routes = {route.path: route for route in app.routes if isinstance(route, APIRoute)}

    assert routes["/health/live"].methods == {"GET"}
    assert routes["/health/ready"].methods == {"GET"}
    assert routes["/meta"].methods == {"GET"}


def test_b03_fixture_routes_are_scaffolded_without_graph_or_review_mutation() -> None:
    routes = {route.path: route for route in app.routes if isinstance(route, APIRoute)}

    assert routes["/evidence-workbench/answer"].methods == {"GET"}
    assert routes["/evidence-workbench/sources"].methods == {"GET"}
    assert "/evidence-workbench/graph" not in routes
    assert "/evidence-workbench/review-actions" not in routes


def test_health_live_returns_deterministic_json() -> None:
    assert call_endpoint("/health/live") == {
        "status": "ok",
        "service": "aivis-api",
        "apiVersion": "0.1.0",
        "runtimeModeLabel": "local_fixture",
    }


def test_health_ready_returns_implemented_local_api_readiness() -> None:
    assert call_endpoint("/health/ready") == {
        "status": "ready",
        "service": "aivis-api",
        "apiVersion": "0.1.0",
        "runtimeModeLabel": "local_fixture",
        "readyFor": ["local_api_health_and_metadata"],
        "checks": {
            "app": "ready",
            "healthEndpoints": "ready",
            "metadataEndpoint": "ready",
        },
    }


def test_meta_returns_mode_and_contract_version_labels() -> None:
    assert call_endpoint("/meta") == {
        "service": "aivis-api",
        "serviceName": "AI Visualisation Workbench API",
        "apiVersion": "0.1.0",
        "runtimeModeLabel": "local_fixture",
        "contractMode": "synthetic_fixture",
        "contractVersion": "aivis-evidence-workbench-contract@0.1.0",
        "sourceSetVersion": "synthetic-source-set-v1",
        "publicContextSetVersion": "public-context-anchor-set-v1",
        "implementedCapabilities": ["health", "readiness", "mode_metadata"],
    }


def test_answer_fixture_returns_contract_shape_and_c02_markdown() -> None:
    payload = call_endpoint("/evidence-workbench/answer")
    answer = require_mapping(payload, "answer")
    claims = require_object_list(payload, "answerClaims")
    citations = require_object_list(payload, "citations")
    warnings = require_object_list(payload, "sourceWarnings")
    prompt_context = require_mapping(payload, "promptContext")
    review_state = require_mapping(payload, "reviewState")
    audit_metadata = require_mapping(payload, "auditMetadata")

    assert payload["runtimeModeLabel"] == "local_fixture"
    assert payload["contractMode"] == "synthetic_fixture"
    assert payload["contractVersion"] == "aivis-evidence-workbench-contract@0.1.0"
    assert payload["sourceSetVersion"] == "synthetic-source-set-v1"
    assert payload["publicContextSetVersion"] == "public-context-anchor-set-v1"
    assert answer["id"] == "ANS-001"
    assert answer["promptContextId"] == "CTX-001"
    assert answer["reviewStateId"] == "REV-001"
    assert answer["auditMetadataId"] == "AUDIT-001"
    assert answer["copyState"] == "disabled"
    assert answer["defaultSelectedClaimId"] == "CLAIM-003"
    assert answer["claimIds"] == [
        "CLAIM-001",
        "CLAIM-002",
        "CLAIM-003",
        "CLAIM-004",
        "CLAIM-005",
    ]
    assert answer["citationIds"] == [
        "CIT-001-A",
        "CIT-002-A",
        "CIT-003-A",
        "CIT-003-B",
        "CIT-004-A",
        "CIT-005-A",
    ]
    assert answer["warningIds"] == [
        "WARN-001",
        "WARN-002",
        "WARN-003",
        "WARN-004",
        "WARN-005",
        "WARN-006",
    ]

    markdown = answer["markdown"]
    assert isinstance(markdown, str)
    for citation in citations:
        assert citation["marker"] in markdown

    assert [claim["id"] for claim in claims] == answer["claimIds"]
    assert {warning["id"] for warning in warnings} == set(answer["warningIds"])
    assert prompt_context["id"] == "CTX-001"
    assert review_state["activeWarningIds"] == answer["warningIds"]
    assert "ACT-MARK-REVIEWED" not in review_state["availableActionIds"]
    assert audit_metadata["id"] == "AUDIT-001"
    assert audit_metadata["runtimeModeLabel"] == "local_fixture"


def test_source_inventory_returns_c03_sources_and_fixture_versions() -> None:
    payload = call_endpoint("/evidence-workbench/sources")
    sources = require_object_list(payload, "sources")
    warnings = require_object_list(payload, "sourceWarnings")
    anchors = require_object_list(payload, "publicContextAnchors")

    assert payload["contractVersion"] == "aivis-evidence-workbench-contract@0.1.0"
    assert payload["sourceSetVersion"] == "synthetic-source-set-v1"
    assert payload["publicContextSetVersion"] == "public-context-anchor-set-v1"
    assert [source["id"] for source in sources] == [
        "SRC-001",
        "SRC-002",
        "SRC-003",
        "SRC-004",
        "SRC-005",
        "SRC-006",
        "SRC-007",
    ]
    assert [anchor["id"] for anchor in anchors] == [
        "PCA-001",
        "PCA-002",
        "PCA-003",
        "PCA-004",
    ]
    assert {warning["id"] for warning in warnings} == {
        "WARN-001",
        "WARN-002",
        "WARN-003",
        "WARN-004",
        "WARN-005",
        "WARN-006",
    }
    assert sum(int(source["citationCount"]) for source in sources) == 6


def test_fixture_preserves_stale_weak_and_missing_support_states() -> None:
    answer_payload = call_endpoint("/evidence-workbench/answer")
    sources_payload = call_endpoint("/evidence-workbench/sources")
    claims_by_id = by_id(require_object_list(answer_payload, "answerClaims"))
    citations_by_id = by_id(require_object_list(answer_payload, "citations"))
    sources_by_id = by_id(require_object_list(sources_payload, "sources"))

    assert sources_by_id["SRC-002"]["freshness"] == "stale"
    assert sources_by_id["SRC-002"]["warningIds"] == ["WARN-001"]
    assert sources_by_id["SRC-003"]["freshness"] == "current"
    assert sources_by_id["SRC-003"]["warningIds"] == []
    assert sources_by_id["SRC-006"]["freshness"] == "missing"
    assert sources_by_id["SRC-006"]["sourceOrigin"] == "missing_source_placeholder"
    assert sources_by_id["SRC-006"]["isClaimSupportingEvidence"] is False

    claim_003 = claims_by_id["CLAIM-003"]
    assert claim_003["evidencePosture"] == "weak_support"
    assert claim_003["supportingSourceIds"] == ["SRC-003"]
    assert claim_003["requiredMissingSourceIds"] == ["SRC-006"]
    assert claim_003["warningIds"] == ["WARN-002", "WARN-003"]
    assert citations_by_id["CIT-003-A"]["relationship"] == "partial_support"
    assert citations_by_id["CIT-003-A"]["sourceId"] == "SRC-003"
    assert citations_by_id["CIT-003-B"]["relationship"] == "missing_evidence"
    assert citations_by_id["CIT-003-B"]["sourceId"] == "SRC-006"


def test_public_context_anchors_are_context_only_not_evidence_sources() -> None:
    answer_payload = call_endpoint("/evidence-workbench/answer")
    source_payload = call_endpoint("/evidence-workbench/sources")
    claims = require_object_list(answer_payload, "answerClaims")
    citations = require_object_list(answer_payload, "citations")
    warnings = require_object_list(answer_payload, "sourceWarnings")
    sources = require_object_list(source_payload, "sources")
    anchors = require_object_list(source_payload, "publicContextAnchors")

    source_ids = {source["id"] for source in sources}
    anchor_ids = {anchor["id"] for anchor in anchors}

    for anchor in anchors:
        assert anchor["isOperationalTruth"] is False
        assert anchor["evidenceUseProhibited"] is True
        assert anchor["allowedGraphEdgeTypes"] == ["uses_place_anchor"]

    for citation in citations:
        assert citation["sourceId"] in source_ids
        assert citation["sourceId"] not in anchor_ids

    for claim in claims:
        supporting_source_ids = claim["supportingSourceIds"]
        assert isinstance(supporting_source_ids, list)
        assert set(supporting_source_ids).issubset(source_ids)
        assert set(supporting_source_ids).isdisjoint(anchor_ids)

    for warning in warnings:
        applies_to = warning["appliesTo"]
        assert isinstance(applies_to, list)
        assert all(
            not (
                isinstance(target, dict)
                and target.get("objectType") == "PublicContextAnchor"
            )
            for target in applies_to
        )
