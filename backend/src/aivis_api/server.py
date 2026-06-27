"""Container-compatible Uvicorn entrypoint for the backend API."""

from __future__ import annotations

import os
import sys
from dataclasses import dataclass
from typing import Mapping

import uvicorn

APP_TARGET = "aivis_api.main:app"
HOST_ENV_VAR = "AIVIS_BACKEND_HOST"
PORT_ENV_VAR = "AIVIS_BACKEND_PORT"
DEFAULT_HOST = "0.0.0.0"
DEFAULT_PORT = 8000


@dataclass(frozen=True)
class BackendServerSettings:
    """Server process settings used by the backend runtime command."""

    app_target: str
    host: str
    port: int

    def as_uvicorn_kwargs(self) -> dict[str, object]:
        return {
            "app": self.app_target,
            "host": self.host,
            "port": self.port,
        }


def parse_backend_port(value: str) -> int:
    try:
        port = int(value)
    except ValueError as error:
        raise ValueError(f"{PORT_ENV_VAR} must be an integer from 1 to 65535.") from error

    if port < 1 or port > 65535:
        raise ValueError(f"{PORT_ENV_VAR} must be an integer from 1 to 65535.")

    return port


def _nonblank_env(env: Mapping[str, str], key: str) -> str | None:
    value = env.get(key)
    if value is None:
        return None

    stripped = value.strip()
    if not stripped:
        return None

    return stripped


def get_backend_server_settings(
    env: Mapping[str, str] | None = None,
) -> BackendServerSettings:
    source = os.environ if env is None else env
    host = _nonblank_env(source, HOST_ENV_VAR) or DEFAULT_HOST
    port_value = _nonblank_env(source, PORT_ENV_VAR)
    port = DEFAULT_PORT if port_value is None else parse_backend_port(port_value)

    return BackendServerSettings(
        app_target=APP_TARGET,
        host=host,
        port=port,
    )


def main() -> int:
    try:
        settings = get_backend_server_settings()
    except ValueError as error:
        print(f"aivis backend startup: {error}", file=sys.stderr)
        return 2

    uvicorn.run(**settings.as_uvicorn_kwargs())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
