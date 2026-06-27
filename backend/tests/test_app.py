from fastapi import FastAPI

from aivis_api.main import app


def test_app_imports_as_fastapi_instance() -> None:
    assert isinstance(app, FastAPI)
    assert app.title == "AI Visualisation Workbench API"
    assert app.version == "0.1.0"


def test_b02_operational_routes_are_not_scaffolded_yet() -> None:
    paths = {route.path for route in app.routes}

    assert "/health/live" not in paths
    assert "/health/ready" not in paths
    assert "/meta" not in paths
