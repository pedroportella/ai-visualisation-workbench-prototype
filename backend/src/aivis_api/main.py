from fastapi import FastAPI

from aivis_api import __version__

APP_TITLE = "AI Visualisation Workbench API"
APP_SUMMARY = "Local prototype API scaffold for AIVIS."
APP_DESCRIPTION = (
    "Minimal FastAPI API spine for the AI Visualisation Workbench prototype. "
    "The current surface exposes local health, readiness and mode metadata."
)
SERVICE_ID = "aivis-api"
RUNTIME_MODE_LABEL = "local_fixture"
CONTRACT_MODE = "synthetic_fixture"
CONTRACT_VERSION = "aivis-evidence-workbench-contract@0.1.0"
SOURCE_SET_VERSION = "synthetic-source-set-v1"
PUBLIC_CONTEXT_SET_VERSION = "public-context-anchor-set-v1"

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
    """Create the FastAPI app without fixture or business endpoints."""
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

    return api


app = create_app()
