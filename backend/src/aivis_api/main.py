from fastapi import FastAPI

from aivis_api import __version__

APP_TITLE = "AI Visualisation Workbench API"
APP_SUMMARY = "Local prototype API scaffold for AIVIS."
APP_DESCRIPTION = (
    "Minimal FastAPI scaffold for the AI Visualisation Workbench prototype. "
    "Health, readiness and mode metadata endpoints are planned for B02."
)


def create_app() -> FastAPI:
    """Create the FastAPI app without business endpoints."""
    return FastAPI(
        title=APP_TITLE,
        summary=APP_SUMMARY,
        description=APP_DESCRIPTION,
        version=__version__,
    )


app = create_app()
