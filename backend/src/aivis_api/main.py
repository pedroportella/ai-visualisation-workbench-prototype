from fastapi import FastAPI

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

APP_TITLE = "AI Visualisation Workbench API"
APP_SUMMARY = "Local prototype API scaffold for AIVIS."
APP_DESCRIPTION = (
    "Minimal FastAPI API spine for the AI Visualisation Workbench prototype. "
    "The current surface exposes local health, readiness, mode metadata and "
    "deterministic answer/source/graph fixtures."
)

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


def create_app() -> FastAPI:
    """Create the FastAPI app for the local fixture backend."""
    api = FastAPI(
        title=APP_TITLE,
        summary=APP_SUMMARY,
        description=APP_DESCRIPTION,
        version=__version__,
    )

    @api.get("/health/live", tags=["health"])
    def health_live() -> dict[str, object]:
        return LIVE_RESPONSE

    @api.get("/health/ready", tags=["health"])
    def health_ready() -> dict[str, object]:
        return READY_RESPONSE

    @api.get("/meta", tags=["metadata"])
    def meta() -> dict[str, object]:
        return META_RESPONSE

    @api.get("/evidence-workbench/answer", tags=["evidence-workbench"])
    def evidence_workbench_answer() -> dict[str, object]:
        return get_answer_fixture_response()

    @api.get("/evidence-workbench/sources", tags=["evidence-workbench"])
    def evidence_workbench_sources() -> dict[str, object]:
        return get_source_inventory_response()

    @api.get("/evidence-workbench/graph", tags=["evidence-workbench"])
    def evidence_workbench_graph() -> dict[str, object]:
        return get_evidence_graph_response()

    return api


app = create_app()
