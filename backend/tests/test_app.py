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


def test_app_imports_as_fastapi_instance() -> None:
    assert isinstance(app, FastAPI)
    assert app.title == "AI Visualisation Workbench API"
    assert app.version == "0.1.0"


def test_b02_operational_routes_are_scaffolded() -> None:
    routes = {route.path: route for route in app.routes if isinstance(route, APIRoute)}

    assert routes["/health/live"].methods == {"GET"}
    assert routes["/health/ready"].methods == {"GET"}
    assert routes["/meta"].methods == {"GET"}


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
