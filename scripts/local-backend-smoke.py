#!/usr/bin/env python3
"""Smoke-check the local AIVIS FastAPI backend health and metadata routes."""

from __future__ import annotations

import argparse
import json
import sys
import urllib.error
import urllib.request
from typing import Any


DEFAULT_BASE_URL = "http://127.0.0.1:8000"

EXPECTED_LIVE = {
    "status": "ok",
    "runtimeModeLabel": "local_fixture",
}

EXPECTED_READY = {
    "status": "ready",
    "runtimeModeLabel": "local_fixture",
}

EXPECTED_META = {
    "runtimeModeLabel": "local_fixture",
    "contractMode": "synthetic_fixture",
    "contractVersion": "aivis-evidence-workbench-contract@0.1.0",
    "sourceSetVersion": "synthetic-source-set-v1",
    "publicContextSetVersion": "public-context-anchor-set-v1",
}


class SmokeFailure(RuntimeError):
    """Raised when the local backend does not match the smoke contract."""


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Smoke-check local AIVIS backend health/readiness/meta endpoints."
    )
    parser.add_argument(
        "--base-url",
        default=DEFAULT_BASE_URL,
        help=f"Local backend base URL. Defaults to {DEFAULT_BASE_URL}.",
    )
    parser.add_argument(
        "--timeout",
        type=float,
        default=5.0,
        help="Per-request timeout in seconds. Defaults to 5.",
    )
    return parser.parse_args()


def fetch_json(base_url: str, path: str, timeout: float) -> tuple[int, dict[str, Any]]:
    url = f"{base_url.rstrip('/')}{path}"
    request = urllib.request.Request(url, headers={"Accept": "application/json"})

    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            status = response.status
            encoding = response.headers.get_content_charset() or "utf-8"
            body = response.read().decode(encoding)
    except urllib.error.HTTPError as error:
        raise SmokeFailure(f"GET {path} returned HTTP {error.code}.") from error
    except urllib.error.URLError as error:
        raise SmokeFailure(f"GET {path} failed to connect: {error.reason}.") from error
    except TimeoutError as error:
        raise SmokeFailure(f"GET {path} timed out.") from error

    try:
        payload = json.loads(body)
    except json.JSONDecodeError as error:
        raise SmokeFailure(f"GET {path} did not return JSON.") from error

    if not isinstance(payload, dict):
        raise SmokeFailure(f"GET {path} did not return a JSON object.")

    return status, payload


def require_status(path: str, status: int) -> None:
    if status != 200:
        raise SmokeFailure(f"GET {path} returned HTTP {status}, expected HTTP 200.")


def require_fields(path: str, payload: dict[str, Any], expected: dict[str, Any]) -> None:
    for key, expected_value in expected.items():
        if payload.get(key) != expected_value:
            raise SmokeFailure(f"GET {path} did not match expected field: {key}.")


def require_ready_scope(payload: dict[str, Any]) -> None:
    if payload.get("readyFor") != ["local_api_health_and_metadata"]:
        raise SmokeFailure("GET /health/ready reported an unexpected readiness scope.")

    checks = payload.get("checks")
    if checks != {
        "app": "ready",
        "healthEndpoints": "ready",
        "metadataEndpoint": "ready",
    }:
        raise SmokeFailure("GET /health/ready reported unexpected readiness checks.")


def require_meta_capabilities(payload: dict[str, Any]) -> None:
    if payload.get("implementedCapabilities") != [
        "health",
        "readiness",
        "mode_metadata",
    ]:
        raise SmokeFailure("GET /meta reported unexpected implemented capabilities.")


def smoke_endpoint(
    base_url: str,
    path: str,
    timeout: float,
    expected: dict[str, Any],
) -> dict[str, Any]:
    status, payload = fetch_json(base_url, path, timeout)
    require_status(path, status)
    require_fields(path, payload, expected)
    return payload


def run_smoke(base_url: str, timeout: float) -> None:
    print("AIVIS local backend smoke", flush=True)
    print(f"baseUrl: {base_url.rstrip('/')}", flush=True)

    live = smoke_endpoint(base_url, "/health/live", timeout, EXPECTED_LIVE)
    print(
        "GET /health/live -> HTTP 200; "
        f"status={live['status']} runtimeModeLabel={live['runtimeModeLabel']}",
        flush=True,
    )

    ready = smoke_endpoint(base_url, "/health/ready", timeout, EXPECTED_READY)
    require_ready_scope(ready)
    print(
        "GET /health/ready -> HTTP 200; "
        f"status={ready['status']} runtimeModeLabel={ready['runtimeModeLabel']} "
        f"readyFor={','.join(ready['readyFor'])}",
        flush=True,
    )

    meta = smoke_endpoint(base_url, "/meta", timeout, EXPECTED_META)
    require_meta_capabilities(meta)
    print(
        "GET /meta -> HTTP 200; "
        f"runtimeModeLabel={meta['runtimeModeLabel']} "
        f"contractMode={meta['contractMode']} "
        f"contractVersion={meta['contractVersion']} "
        f"sourceSetVersion={meta['sourceSetVersion']} "
        f"publicContextSetVersion={meta['publicContextSetVersion']}",
        flush=True,
    )

    print("smoke: ok", flush=True)


def main() -> int:
    args = parse_args()

    try:
        run_smoke(args.base_url, args.timeout)
    except SmokeFailure as error:
        print(f"smoke: failed: {error}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
