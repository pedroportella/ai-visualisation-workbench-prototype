import asyncio
import json

import pytest
from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.routing import APIRoute
from pydantic import ValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.cors import CORSMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from aivis_api.errors import (
    http_exception_handler,
    request_validation_exception_handler,
)
from aivis_api.main import app
from aivis_api.review_state import (
    PRIMARY_REVIEWER_NOTE,
    ReviewActionRequest,
    reset_review_action_state,
)
from aivis_api.server import (
    APP_TARGET,
    DEFAULT_HOST,
    DEFAULT_PORT,
    HOST_ENV_VAR,
    PORT_ENV_VAR,
    get_backend_server_settings,
)


def get_route(path: str) -> APIRoute:
    for route in app.routes:
        if isinstance(route, APIRoute) and route.path == path:
            return route

    raise AssertionError(f"Expected route not found: {path}")


def get_openapi_operation(path: str, method: str) -> dict[str, object]:
    openapi = app.openapi()
    paths = require_mapping(openapi, "paths")
    path_item = require_mapping(paths, path)
    operation = require_mapping(path_item, method)

    return operation


def call_endpoint(path: str) -> dict[str, object]:
    route = get_route(path)
    payload = route.endpoint()

    assert isinstance(payload, dict)
    return payload


def call_review_action_endpoint(body: dict[str, object]) -> dict[str, object]:
    route = get_route("/evidence-workbench/review-actions")
    payload = route.endpoint(ReviewActionRequest(**body))

    assert isinstance(payload, dict)
    return payload


def call_review_action_error(body: dict[str, object]) -> HTTPException:
    route = get_route("/evidence-workbench/review-actions")

    try:
        route.endpoint(ReviewActionRequest(**body))
    except HTTPException as error:
        return error

    raise AssertionError("Expected review action endpoint to raise HTTPException.")


def make_request(path: str = "/evidence-workbench/review-actions") -> Request:
    return Request({"type": "http", "method": "POST", "path": path, "headers": []})


def decode_json_response(response: JSONResponse) -> dict[str, object]:
    payload = json.loads(response.body)

    assert isinstance(payload, dict)
    return payload


def handle_http_error(exception: StarletteHTTPException) -> dict[str, object]:
    response = asyncio.run(http_exception_handler(make_request(), exception))

    assert response.status_code == exception.status_code
    return decode_json_response(response)


def handle_validation_error(exception: RequestValidationError) -> dict[str, object]:
    response = asyncio.run(request_validation_exception_handler(make_request(), exception))

    assert response.status_code == 422
    return decode_json_response(response)


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


def assert_error_payload(
    payload: dict[str, object],
    *,
    status_code: int,
    code: str,
    message: str,
) -> dict[str, object]:
    error = require_mapping(payload, "error")

    assert error["statusCode"] == status_code
    assert error["code"] == code
    assert error["message"] == message
    assert error["runtimeModeLabel"] == "local_fixture"
    assert error["contractMode"] == "synthetic_fixture"
    assert error["contractVersion"] == "aivis-evidence-workbench-contract@0.1.0"
    assert error["sourceSetVersion"] == "synthetic-source-set-v1"
    assert error["publicContextSetVersion"] == "public-context-anchor-set-v1"
    return error


def test_app_imports_as_fastapi_instance() -> None:
    assert isinstance(app, FastAPI)
    assert app.title == "AI Visualisation Workbench API"
    assert app.version == "0.1.0"


def test_backend_server_settings_default_to_container_ready_runtime() -> None:
    settings = get_backend_server_settings({})

    assert settings.app_target == "aivis_api.main:app"
    assert settings.host == "0.0.0.0"
    assert settings.port == 8000
    assert settings.as_uvicorn_kwargs() == {
        "app": APP_TARGET,
        "host": DEFAULT_HOST,
        "port": DEFAULT_PORT,
    }


def test_backend_server_settings_allow_server_side_host_and_port_override() -> None:
    settings = get_backend_server_settings(
        {
            HOST_ENV_VAR: " 127.0.0.1 ",
            PORT_ENV_VAR: " 8077 ",
        }
    )

    assert settings.app_target == APP_TARGET
    assert settings.host == "127.0.0.1"
    assert settings.port == 8077


@pytest.mark.parametrize("port_value", ["not-a-port", "0", "65536", "-1"])
def test_backend_server_settings_reject_invalid_ports(port_value: str) -> None:
    with pytest.raises(ValueError, match=PORT_ENV_VAR):
        get_backend_server_settings({PORT_ENV_VAR: port_value})


def test_operational_routes_are_scaffolded() -> None:
    routes = {route.path: route for route in app.routes if isinstance(route, APIRoute)}

    assert routes["/health/live"].methods == {"GET"}
    assert routes["/health/ready"].methods == {"GET"}
    assert routes["/meta"].methods == {"GET"}


def test_fixture_routes_are_scaffolded_with_review_action_endpoint() -> None:
    routes = {route.path: route for route in app.routes if isinstance(route, APIRoute)}

    assert routes["/evidence-workbench/answer"].methods == {"GET"}
    assert routes["/evidence-workbench/sources"].methods == {"GET"}
    assert routes["/evidence-workbench/graph"].methods == {"GET"}
    assert routes["/evidence-workbench/review-actions"].methods == {"POST"}


def test_cors_is_limited_to_local_frontend_origins() -> None:
    cors_middleware = [
        middleware for middleware in app.user_middleware if middleware.cls is CORSMiddleware
    ]

    assert len(cors_middleware) == 1
    options = cors_middleware[0].kwargs
    assert options["allow_origins"] == [
        "http://localhost:3200",
        "http://127.0.0.1:3200",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
    assert options["allow_credentials"] is False
    assert options["allow_methods"] == ["GET", "POST", "OPTIONS"]
    assert options["allow_headers"] == ["content-type"]
    assert options["max_age"] == 600


def test_review_action_request_validation_rejects_extra_and_blank_fields() -> None:
    with pytest.raises(ValidationError):
        ReviewActionRequest(
            reviewActionId="ACT-REQUEST-SOURCE-UPDATE",
            reviewerNote=PRIMARY_REVIEWER_NOTE,
            unexpectedField="not part of the contract",
        )

    with pytest.raises(ValidationError):
        ReviewActionRequest(
            reviewActionId="",
            reviewerNote=PRIMARY_REVIEWER_NOTE,
        )

    with pytest.raises(ValidationError):
        ReviewActionRequest(
            reviewActionId="ACT-REQUEST-SOURCE-UPDATE",
            reviewerNote="x" * 601,
        )


def test_http_error_handler_returns_stable_public_safe_payload() -> None:
    payload = handle_http_error(
        StarletteHTTPException(
            status_code=404,
            detail={
                "code": "fixture_object_not_found",
                "message": "Unknown answer: ANS-404",
            },
        )
    )

    assert_error_payload(
        payload,
        status_code=404,
        code="fixture_object_not_found",
        message="Unknown answer: ANS-404",
    )
    assert "http://" not in json.dumps(payload)


def test_validation_error_handler_does_not_echo_request_values() -> None:
    payload = handle_validation_error(
        RequestValidationError(
            [
                {
                    "loc": ("body", "reviewerNote"),
                    "msg": "Field required",
                    "type": "missing",
                    "input": "private-input-value",
                },
                {
                    "loc": ("body", "unexpectedField"),
                    "msg": "Extra inputs are not permitted",
                    "type": "extra_forbidden",
                    "input": "also-not-echoed",
                },
            ]
        )
    )
    error = assert_error_payload(
        payload,
        status_code=422,
        code="request_validation_failed",
        message="Request body did not match the local API contract.",
    )

    assert error["invalidFields"] == [
        {"field": "reviewerNote", "issue": "missing"},
        {"field": "unexpectedField", "issue": "extra_forbidden"},
    ]
    serialized = json.dumps(payload)
    assert "private-input-value" not in serialized
    assert "also-not-echoed" not in serialized


def test_openapi_info_documents_contract_and_public_boundary() -> None:
    openapi = app.openapi()
    info = require_mapping(openapi, "info")
    tags = require_object_list(openapi, "tags")
    tags_by_name = {str(tag["name"]): tag for tag in tags}

    assert info["title"] == "AI Visualisation Workbench API"
    assert info["summary"] == "Local fixture API for AIVIS contract review."
    assert info["version"] == "0.1.0"

    description = str(info["description"])
    assert "runtimeModeLabel: local_fixture" in description
    assert "contractMode: synthetic_fixture" in description
    assert "contractVersion: aivis-evidence-workbench-contract@0.1.0" in description
    assert "sourceSetVersion: synthetic-source-set-v1" in description
    assert "publicContextSetVersion: public-context-anchor-set-v1" in description
    assert "PublicContextAnchor context labels" in description
    assert "not connected to TMR systems" in description
    assert "not QChat" in description
    assert "not an official Queensland Government service" in description

    assert set(tags_by_name) == {"health", "metadata", "evidence-workbench"}
    assert "fixture backend only" in str(tags_by_name["health"]["description"])
    assert "Runtime mode and contract labels" in str(tags_by_name["metadata"]["description"])
    assert "source-system writeback" in str(tags_by_name["evidence-workbench"]["description"])


def test_openapi_documents_route_summaries_and_fixture_examples() -> None:
    expected_operations = {
        ("/health/live", "get"): "Check live API process",
        ("/health/ready", "get"): "Check local readiness",
        ("/meta", "get"): "Return fixture contract metadata",
        ("/evidence-workbench/answer", "get"): "Get Evidence Workbench answer fixture",
        ("/evidence-workbench/sources", "get"): "Get Evidence Workbench source inventory fixture",
        ("/evidence-workbench/graph", "get"): "Get Evidence Workbench evidence graph fixture",
        ("/evidence-workbench/review-actions", "post"): (
            "Record local Evidence Workbench review action"
        ),
    }

    for (path, method), summary in expected_operations.items():
        operation = get_openapi_operation(path, method)
        responses = require_mapping(operation, "responses")
        ok_response = require_mapping(responses, "200")
        content = require_mapping(ok_response, "content")
        json_content = require_mapping(content, "application/json")

        assert operation["summary"] == summary
        assert "description" in operation
        assert "example" in json_content

    meta_example = require_mapping(
        require_mapping(
            require_mapping(
                require_mapping(
                    require_mapping(get_openapi_operation("/meta", "get"), "responses"),
                    "200",
                ),
                "content",
            ),
            "application/json",
        ),
        "example",
    )
    assert meta_example["runtimeModeLabel"] == "local_fixture"
    assert meta_example["contractMode"] == "synthetic_fixture"
    assert meta_example["contractVersion"] == "aivis-evidence-workbench-contract@0.1.0"
    assert meta_example["sourceSetVersion"] == "synthetic-source-set-v1"
    assert meta_example["publicContextSetVersion"] == "public-context-anchor-set-v1"


def test_openapi_examples_document_fixture_contract_ids() -> None:
    answer_operation = get_openapi_operation("/evidence-workbench/answer", "get")
    answer_example = require_mapping(
        require_mapping(
            require_mapping(
                require_mapping(require_mapping(answer_operation, "responses"), "200"),
                "content",
            ),
            "application/json",
        ),
        "example",
    )
    answer = require_mapping(answer_example, "answer")
    answer_claims = require_object_list(answer_example, "answerClaims")
    citations = require_object_list(answer_example, "citations")
    anchors = require_object_list(answer_example, "publicContextAnchors")

    assert answer_example["contractVersion"] == "aivis-evidence-workbench-contract@0.1.0"
    assert answer["id"] == "ANS-001"
    assert answer["defaultSelectedClaimId"] == "CLAIM-003"
    assert answer_claims[0]["id"] == "CLAIM-003"
    assert answer_claims[0]["requiredMissingSourceIds"] == ["SRC-006"]
    assert citations[0]["id"] == "CIT-003-B"
    assert citations[0]["relationship"] == "missing_evidence"
    assert anchors[0]["id"] == "PCA-001"
    assert anchors[0]["evidenceUseProhibited"] is True

    sources_operation = get_openapi_operation("/evidence-workbench/sources", "get")
    sources_example = require_mapping(
        require_mapping(
            require_mapping(
                require_mapping(require_mapping(sources_operation, "responses"), "200"),
                "content",
            ),
            "application/json",
        ),
        "example",
    )
    sources = require_object_list(sources_example, "sources")
    assert [source["id"] for source in sources] == ["SRC-002", "SRC-006"]
    assert sources[0]["freshness"] == "stale"
    assert sources[1]["sourceOrigin"] == "missing_source_placeholder"

    graph_operation = get_openapi_operation("/evidence-workbench/graph", "get")
    graph_example = require_mapping(
        require_mapping(
            require_mapping(
                require_mapping(require_mapping(graph_operation, "responses"), "200"),
                "content",
            ),
            "application/json",
        ),
        "example",
    )
    graph = require_mapping(graph_example, "evidenceGraph")
    edges = require_object_list(graph_example, "evidenceEdges")
    assert graph["id"] == "GRAPH-001"
    assert graph["defaultSelectedNodeId"] == "NODE-CLAIM-003"
    assert edges[0]["id"] == "EDGE-SRC006-CLAIM003"
    assert edges[0]["type"] == "missing_evidence"

    review_operation = get_openapi_operation("/evidence-workbench/review-actions", "post")
    request_body = require_mapping(review_operation, "requestBody")
    request_content = require_mapping(require_mapping(request_body, "content"), "application/json")
    request_examples = require_mapping(request_content, "examples")
    request_example = require_mapping(
        require_mapping(request_examples, "requestSourceUpdate"),
        "value",
    )
    assert request_example["reviewActionId"] == "ACT-REQUEST-SOURCE-UPDATE"
    assert request_example["reviewStateId"] == "REV-001"
    assert request_example["answerId"] == "ANS-001"

    review_example = require_mapping(
        require_mapping(
            require_mapping(
                require_mapping(require_mapping(review_operation, "responses"), "200"),
                "content",
            ),
            "application/json",
        ),
        "example",
    )
    review_state = require_mapping(review_example, "reviewState")
    local_state = require_mapping(review_example, "localState")
    assert review_state["status"] == "source_update_requested"
    assert review_state["lastActionId"] == "ACT-REQUEST-SOURCE-UPDATE"
    assert local_state["storage"] == "in_memory_process"
    assert local_state["sourceSystemWriteback"] == "not_performed"


def test_openapi_documents_review_action_validation_and_error_examples() -> None:
    openapi = app.openapi()
    review_operation = get_openapi_operation("/evidence-workbench/review-actions", "post")
    responses = require_mapping(review_operation, "responses")
    request_body = require_mapping(review_operation, "requestBody")
    request_content = require_mapping(require_mapping(request_body, "content"), "application/json")
    request_schema = require_mapping(request_content, "schema")
    schema_ref = str(request_schema["$ref"]).removeprefix("#/components/schemas/")
    review_action_schema = require_mapping(
        require_mapping(require_mapping(openapi, "components"), "schemas"),
        schema_ref,
    )
    properties = require_mapping(review_action_schema, "properties")

    assert review_action_schema["additionalProperties"] is False
    assert properties["reviewActionId"]["minLength"] == 1
    assert properties["reviewActionId"]["maxLength"] == 80
    assert properties["reviewerNote"]["minLength"] == 1
    assert properties["reviewerNote"]["maxLength"] == 600

    expected_errors = {
        "400": (
            "invalid_review_action_request",
            "ACT-REQUEST-SOURCE-UPDATE requires the deterministic reviewer note.",
        ),
        "404": ("fixture_object_not_found", "Unknown review state: REV-404"),
        "409": (
            "review_action_conflict",
            "ACT-MARK-REVIEWED is unavailable while WARN-001, WARN-002 or WARN-003 are active.",
        ),
        "422": (
            "request_validation_failed",
            "Request body did not match the local API contract.",
        ),
    }

    for status, (code, message) in expected_errors.items():
        response = require_mapping(responses, status)
        content = require_mapping(response, "content")
        json_content = require_mapping(content, "application/json")
        example = require_mapping(json_content, "example")
        assert_error_payload(
            example,
            status_code=int(status),
            code=code,
            message=message,
        )

    validation_error = require_mapping(
        require_mapping(
            require_mapping(require_mapping(responses, "422"), "content"),
            "application/json",
        ),
        "example",
    )
    validation_fields = require_mapping(validation_error, "error")["invalidFields"]
    assert validation_fields == [{"field": "reviewerNote", "issue": "missing"}]


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


def test_answer_fixture_returns_contract_shape_and_markdown() -> None:
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


def test_source_inventory_returns_sources_and_fixture_versions() -> None:
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


def test_evidence_graph_fixture_returns_contract_shape_and_fallback_metadata() -> None:
    payload = call_endpoint("/evidence-workbench/graph")
    graph = require_mapping(payload, "evidenceGraph")
    nodes = require_object_list(payload, "evidenceNodes")
    edges = require_object_list(payload, "evidenceEdges")
    fallback_steps = require_object_list(payload, "smallViewportFallbackSteps")
    review_state = require_mapping(payload, "reviewState")

    assert payload["runtimeModeLabel"] == "local_fixture"
    assert payload["contractMode"] == "synthetic_fixture"
    assert payload["contractVersion"] == "aivis-evidence-workbench-contract@0.1.0"
    assert payload["sourceSetVersion"] == "synthetic-source-set-v1"
    assert payload["publicContextSetVersion"] == "public-context-anchor-set-v1"

    assert graph["id"] == "GRAPH-001"
    assert graph["answerId"] == "ANS-001"
    assert graph["promptContextId"] == "CTX-001"
    assert graph["reviewStateId"] == "REV-001"
    assert graph["auditMetadataId"] == "AUDIT-001"
    assert graph["rootNodeId"] == "NODE-Q"
    assert graph["defaultSelectedNodeId"] == "NODE-CLAIM-003"
    assert graph["defaultSelectedClaimId"] == "CLAIM-003"
    assert graph["defaultFocusedSourceIds"] == ["SRC-003", "SRC-006"]
    assert graph["defaultFocusedWarningIds"] == ["WARN-002", "WARN-003"]
    assert graph["layoutHint"] == "left_to_right_review_flow"
    assert graph["supportsKeyboardSummary"] is True
    assert graph["smallViewportFallback"] == "step_list"
    assert [node["id"] for node in nodes] == graph["nodeIds"]
    assert [edge["id"] for edge in edges] == graph["edgeIds"]
    assert len(nodes) == 19
    assert len(edges) == 22

    accessible_summary = graph["accessibleSummary"]
    assert isinstance(accessible_summary, str)
    assert "context anchors are labels only and do not provide evidence" in accessible_summary
    assert "CLAIM-003 is selected by default" in accessible_summary
    assert "SRC-005 is present as uncited inventory only" in accessible_summary

    assert [step["step"] for step in fallback_steps] == [1, 2, 3, 4, 5, 6]
    assert fallback_steps[1]["heading"] == "Context anchors"
    assert fallback_steps[1]["includeIds"] == [
        "NODE-PCA-001",
        "NODE-PCA-002",
        "NODE-PCA-003",
        "NODE-PCA-004",
    ]
    assert "context only" in str(fallback_steps[1]["summary"])
    assert fallback_steps[4]["includeIds"] == [
        "NODE-SRC-003",
        "NODE-SRC-006",
        "NODE-CLAIM-003",
        "WARN-002",
        "WARN-003",
    ]
    assert "ACT-REQUEST-SOURCE-UPDATE" in review_state["availableActionIds"]
    assert "ACT-MARK-REVIEWED" not in review_state["availableActionIds"]


def test_evidence_graph_references_existing_fixture_objects() -> None:
    answer_payload = call_endpoint("/evidence-workbench/answer")
    source_payload = call_endpoint("/evidence-workbench/sources")
    graph_payload = call_endpoint("/evidence-workbench/graph")
    graph = require_mapping(graph_payload, "evidenceGraph")
    nodes = require_object_list(graph_payload, "evidenceNodes")
    edges = require_object_list(graph_payload, "evidenceEdges")
    review_state = require_mapping(graph_payload, "reviewState")

    node_ids = set(graph["nodeIds"])
    edge_ids = set(graph["edgeIds"])
    nodes_by_id = by_id(nodes)
    edges_by_id = by_id(edges)

    assert len(node_ids) == len(nodes)
    assert len(edge_ids) == len(edges)
    assert set(nodes_by_id) == node_ids
    assert set(edges_by_id) == edge_ids
    assert all(node["graphId"] == "GRAPH-001" for node in nodes)
    assert all(edge["graphId"] == "GRAPH-001" for edge in edges)

    prompt_context = require_mapping(answer_payload, "promptContext")
    source_ids = {source["id"] for source in require_object_list(source_payload, "sources")}
    anchor_ids = {anchor["id"] for anchor in require_object_list(source_payload, "publicContextAnchors")}
    claim_ids = {claim["id"] for claim in require_object_list(answer_payload, "answerClaims")}
    citation_ids = {citation["id"] for citation in require_object_list(answer_payload, "citations")}
    warning_ids = {warning["id"] for warning in require_object_list(answer_payload, "sourceWarnings")}
    action_ids = set(review_state["availableActionIds"])

    for node in nodes:
        assert node["id"] in node_ids
        ref_type = node["refObjectType"]
        ref_id = node["refObjectId"]
        if ref_type == "PromptContext":
            assert ref_id == prompt_context["id"]
        elif ref_type == "Source":
            assert ref_id in source_ids
        elif ref_type == "PublicContextAnchor":
            assert ref_id in anchor_ids
        elif ref_type == "AnswerClaim":
            assert ref_id in claim_ids
        elif ref_type == "ReviewAction":
            assert ref_id in action_ids
        else:
            raise AssertionError(f"Unexpected node ref type: {ref_type}")

    for edge in edges:
        assert edge["fromNodeId"] in node_ids
        assert edge["toNodeId"] in node_ids
        ref_type = edge["refObjectType"]
        ref_id = edge["refObjectId"]
        if ref_type == "PromptContext":
            assert ref_id == prompt_context["id"]
        elif ref_type == "Source":
            assert ref_id in source_ids
        elif ref_type == "PublicContextAnchor":
            assert ref_id in anchor_ids
        elif ref_type == "Citation":
            assert ref_id in citation_ids
        elif ref_type == "SourceWarning":
            assert ref_id in warning_ids
        elif ref_type == "ReviewAction":
            assert ref_id in action_ids
        else:
            raise AssertionError(f"Unexpected edge ref type: {ref_type}")

    assert edges_by_id["EDGE-Q-CONTEXT"]["fromNodeId"] == "NODE-Q"
    assert edges_by_id["EDGE-CONTEXT-SRC006"]["toNodeId"] == "NODE-SRC-006"
    assert edges_by_id["EDGE-SRC006-CLAIM003"]["toNodeId"] == "NODE-CLAIM-003"
    assert edges_by_id["EDGE-CLAIM003-ACT-WARN003"]["toNodeId"] == (
        "NODE-ACT-REQUEST-SOURCE-UPDATE"
    )


def test_evidence_graph_preserves_source_claim_warning_guardrails() -> None:
    answer_payload = call_endpoint("/evidence-workbench/answer")
    source_payload = call_endpoint("/evidence-workbench/sources")
    graph_payload = call_endpoint("/evidence-workbench/graph")
    nodes_by_id = by_id(require_object_list(graph_payload, "evidenceNodes"))
    edges = require_object_list(graph_payload, "evidenceEdges")
    edges_by_id = by_id(edges)
    claims_by_id = by_id(require_object_list(answer_payload, "answerClaims"))
    sources_by_id = by_id(require_object_list(source_payload, "sources"))

    support_like_edge_types = {
        "supports",
        "supports_with_warning",
        "partial_support",
        "missing_evidence",
        "cites",
    }
    support_like_edges = [
        edge for edge in edges if edge["type"] in support_like_edge_types
    ]

    assert nodes_by_id["NODE-SRC-002"]["type"] == "source_warning"
    assert nodes_by_id["NODE-SRC-002"]["warningIds"] == ["WARN-001"]
    assert nodes_by_id["NODE-CLAIM-002"]["warningIds"] == ["WARN-001"]
    assert sources_by_id["SRC-002"]["freshness"] == "stale"
    assert edges_by_id["EDGE-SRC002-CLAIM002"]["type"] == "supports_with_warning"
    assert edges_by_id["EDGE-SRC002-CLAIM002"]["warningIds"] == ["WARN-001"]

    assert claims_by_id["CLAIM-003"]["evidencePosture"] == "weak_support"
    assert claims_by_id["CLAIM-003"]["supportingSourceIds"] == ["SRC-003"]
    assert claims_by_id["CLAIM-003"]["requiredMissingSourceIds"] == ["SRC-006"]
    assert nodes_by_id["NODE-CLAIM-003"]["warningIds"] == ["WARN-002", "WARN-003"]
    assert edges_by_id["EDGE-SRC003-CLAIM003"]["type"] == "partial_support"
    assert edges_by_id["EDGE-SRC003-CLAIM003"]["refObjectId"] == "CIT-003-A"
    assert edges_by_id["EDGE-SRC003-CLAIM003"]["warningIds"] == ["WARN-002"]

    assert sources_by_id["SRC-006"]["sourceOrigin"] == "missing_source_placeholder"
    assert sources_by_id["SRC-006"]["isClaimSupportingEvidence"] is False
    assert nodes_by_id["NODE-SRC-006"]["type"] == "missing_source"
    assert nodes_by_id["NODE-SRC-006"]["warningIds"] == ["WARN-003"]
    assert edges_by_id["EDGE-SRC006-CLAIM003"]["type"] == "missing_evidence"
    assert edges_by_id["EDGE-SRC006-CLAIM003"]["refObjectId"] == "CIT-003-B"
    assert edges_by_id["EDGE-SRC006-CLAIM003"]["warningIds"] == ["WARN-003"]

    assert sources_by_id["SRC-005"]["citationCount"] == 0
    assert nodes_by_id["NODE-SRC-005"]["status"] == "current_uncited"
    assert [
        edge["id"]
        for edge in edges
        if edge["fromNodeId"] == "NODE-SRC-005" or edge["toNodeId"] == "NODE-SRC-005"
    ] == ["EDGE-CONTEXT-SRC005"]
    assert all(
        edge["fromNodeId"] != "NODE-SRC-005" and edge["toNodeId"] != "NODE-SRC-005"
        for edge in support_like_edges
    )

    citation_edge_refs = [
        edge["refObjectId"] for edge in support_like_edges if edge["refObjectType"] == "Citation"
    ]
    assert sorted(citation_edge_refs) == [
        "CIT-001-A",
        "CIT-002-A",
        "CIT-003-A",
        "CIT-003-B",
        "CIT-004-A",
        "CIT-005-A",
    ]


def test_evidence_graph_keeps_public_context_anchor_nodes_context_only() -> None:
    graph_payload = call_endpoint("/evidence-workbench/graph")
    source_payload = call_endpoint("/evidence-workbench/sources")
    nodes_by_id = by_id(require_object_list(graph_payload, "evidenceNodes"))
    edges = require_object_list(graph_payload, "evidenceEdges")
    anchors = require_object_list(source_payload, "publicContextAnchors")
    anchor_ids = {anchor["id"] for anchor in anchors}
    anchor_node_ids = {
        node["id"]
        for node in nodes_by_id.values()
        if node["type"] == "public_context_anchor"
    }
    support_like_edge_types = {
        "supports",
        "supports_with_warning",
        "partial_support",
        "missing_evidence",
        "cites",
    }

    assert anchor_node_ids == {
        "NODE-PCA-001",
        "NODE-PCA-002",
        "NODE-PCA-003",
        "NODE-PCA-004",
    }

    for anchor_node_id in anchor_node_ids:
        node = nodes_by_id[anchor_node_id]
        assert node["refObjectId"] in anchor_ids
        assert node["warningIds"] == []
        assert node["status"] == "context_only"

    for edge in edges:
        from_type = nodes_by_id[str(edge["fromNodeId"])]["type"]
        to_type = nodes_by_id[str(edge["toNodeId"])]["type"]

        if from_type == "public_context_anchor" or to_type == "public_context_anchor":
            assert edge["type"] == "uses_place_anchor"
            assert edge["refObjectType"] == "PublicContextAnchor"

        if edge["type"] in support_like_edge_types:
            assert from_type != "public_context_anchor"
            assert to_type != "public_context_anchor"
            assert not str(edge["refObjectId"]).startswith("PCA-")


def test_review_action_source_update_returns_post_primary_state() -> None:
    reset_review_action_state()

    payload = call_review_action_endpoint(
        {
            "reviewActionId": "ACT-REQUEST-SOURCE-UPDATE",
            "reviewStateId": "REV-001",
            "answerId": "ANS-001",
            "reviewerNote": PRIMARY_REVIEWER_NOTE,
        }
    )

    review_state = require_mapping(payload, "reviewState")
    audit_metadata = require_mapping(payload, "auditMetadata")
    source_warnings = require_object_list(payload, "sourceWarnings")
    local_state = require_mapping(payload, "localState")

    assert payload["runtimeModeLabel"] == "local_fixture"
    assert payload["contractMode"] == "synthetic_fixture"
    assert payload["contractVersion"] == "aivis-evidence-workbench-contract@0.1.0"
    assert payload["sourceSetVersion"] == "synthetic-source-set-v1"
    assert payload["publicContextSetVersion"] == "public-context-anchor-set-v1"
    assert payload["implementedActionIds"] == ["ACT-REQUEST-SOURCE-UPDATE"]

    assert review_state["id"] == "REV-001"
    assert review_state["answerId"] == "ANS-001"
    assert review_state["status"] == "source_update_requested"
    assert review_state["statusLabel"] == "Source update requested"
    assert review_state["activeWarningIds"] == [
        "WARN-001",
        "WARN-002",
        "WARN-003",
        "WARN-004",
        "WARN-006",
        "WARN-007",
    ]
    assert review_state["availableActionIds"] == [
        "ACT-ADD-REVIEW-NOTE",
        "ACT-ESCALATE-SOURCE-OWNER",
        "ACT-MARK-UNSAFE",
    ]
    assert "ACT-MARK-REVIEWED" not in review_state["availableActionIds"]
    assert review_state["completedActionIds"] == ["ACT-REQUEST-SOURCE-UPDATE"]
    assert review_state["lastActionId"] == "ACT-REQUEST-SOURCE-UPDATE"
    assert review_state["reviewerNote"] == PRIMARY_REVIEWER_NOTE
    assert review_state["updatedAt"] == "2026-06-27T09:15:00+10:00"
    assert review_state["copyState"] == "disabled"
    assert review_state["approvalBlockedByWarningIds"] == [
        "WARN-001",
        "WARN-002",
        "WARN-003",
    ]

    assert audit_metadata["id"] == "AUDIT-001"
    assert audit_metadata["reviewEventIds"] == [
        "AUDIT-EVT-001",
        "AUDIT-EVT-002",
        "AUDIT-EVT-003",
        "AUDIT-EVT-004",
    ]
    assert audit_metadata["lastReviewActionId"] == "ACT-REQUEST-SOURCE-UPDATE"
    assert audit_metadata["runtimeModeLabel"] == "local_fixture"

    warning_ids = {warning["id"] for warning in source_warnings}
    assert warning_ids == set(review_state["activeWarningIds"])
    assert "WARN-005" not in warning_ids
    assert by_id(source_warnings)["WARN-007"]["introducedByActionId"] == (
        "ACT-REQUEST-SOURCE-UPDATE"
    )

    assert local_state["storage"] == "in_memory_process"
    assert local_state["sourceSystemWriteback"] == "not_performed"
    assert local_state["productionAuditLogging"] == "not_performed"


def test_review_action_preserves_context_anchor_and_blocker_guardrails() -> None:
    reset_review_action_state()

    payload = call_review_action_endpoint(
        {
            "reviewActionId": "ACT-REQUEST-SOURCE-UPDATE",
            "reviewerNote": PRIMARY_REVIEWER_NOTE,
        }
    )

    review_state = require_mapping(payload, "reviewState")
    review_actions = require_object_list(payload, "reviewActions")
    source_warnings = require_object_list(payload, "sourceWarnings")

    assert "WARN-001" in review_state["activeWarningIds"]
    assert "WARN-002" in review_state["activeWarningIds"]
    assert "WARN-003" in review_state["activeWarningIds"]
    assert "ACT-MARK-REVIEWED" not in review_state["availableActionIds"]

    for action in review_actions:
        target_object_ids = action["targetObjectIds"]
        assert isinstance(target_object_ids, list)
        assert all(not str(target_id).startswith("PCA-") for target_id in target_object_ids)

    for warning in source_warnings:
        applies_to = warning["appliesTo"]
        assert isinstance(applies_to, list)
        assert all(
            not (
                isinstance(target, dict)
                and target.get("objectType") == "PublicContextAnchor"
            )
            for target in applies_to
        )


def test_review_action_rejects_repeated_primary_action_during_runtime() -> None:
    reset_review_action_state()
    request_body = {
        "reviewActionId": "ACT-REQUEST-SOURCE-UPDATE",
        "reviewerNote": PRIMARY_REVIEWER_NOTE,
    }

    first_payload = call_review_action_endpoint(request_body)
    second_error = call_review_action_error(request_body)

    assert require_mapping(first_payload, "reviewState")["lastActionId"] == (
        "ACT-REQUEST-SOURCE-UPDATE"
    )
    assert second_error.status_code == 409
    assert second_error.detail == {
        "code": "review_action_conflict",
        "message": "ACT-REQUEST-SOURCE-UPDATE has already been completed.",
    }
    assert_error_payload(
        handle_http_error(second_error),
        status_code=409,
        code="review_action_conflict",
        message="ACT-REQUEST-SOURCE-UPDATE has already been completed.",
    )


def test_review_action_rejects_mark_reviewed_while_blockers_remain() -> None:
    reset_review_action_state()

    error = call_review_action_error(
        {
            "reviewActionId": "ACT-MARK-REVIEWED",
            "reviewerNote": PRIMARY_REVIEWER_NOTE,
        }
    )

    assert error.status_code == 409
    assert error.detail == {
        "code": "review_action_conflict",
        "message": (
            "ACT-MARK-REVIEWED is unavailable while WARN-001, WARN-002 or WARN-003 are active."
        ),
    }
    assert_error_payload(
        handle_http_error(error),
        status_code=409,
        code="review_action_conflict",
        message=(
            "ACT-MARK-REVIEWED is unavailable while WARN-001, WARN-002 or WARN-003 are active."
        ),
    )


def test_review_action_requires_the_primary_fixture_note() -> None:
    reset_review_action_state()

    error = call_review_action_error(
        {
            "reviewActionId": "ACT-REQUEST-SOURCE-UPDATE",
            "reviewerNote": "Please refresh the map.",
        }
    )

    assert error.status_code == 400
    assert error.detail == {
        "code": "invalid_review_action_request",
        "message": "ACT-REQUEST-SOURCE-UPDATE requires the deterministic reviewer note.",
    }
    assert_error_payload(
        handle_http_error(error),
        status_code=400,
        code="invalid_review_action_request",
        message="ACT-REQUEST-SOURCE-UPDATE requires the deterministic reviewer note.",
    )


def test_review_action_returns_predictable_not_found_error() -> None:
    reset_review_action_state()

    error = call_review_action_error(
        {
            "reviewActionId": "ACT-REQUEST-SOURCE-UPDATE",
            "reviewStateId": "REV-404",
            "answerId": "ANS-001",
            "reviewerNote": PRIMARY_REVIEWER_NOTE,
        }
    )

    assert error.status_code == 404
    assert error.detail == {
        "code": "fixture_object_not_found",
        "message": "Unknown review state: REV-404",
    }
    assert_error_payload(
        handle_http_error(error),
        status_code=404,
        code="fixture_object_not_found",
        message="Unknown review state: REV-404",
    )
