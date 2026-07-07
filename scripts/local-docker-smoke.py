#!/usr/bin/env python3
"""Smoke-check the local Docker Compose AIVIS backend and workbench frontend."""

from __future__ import annotations

import argparse
import html
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from collections.abc import Iterable
from typing import Any


DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8080"
DEFAULT_FRONTEND_BASE_URL = "http://127.0.0.1:3200"
EXPECTED_CONTRACT_VERSION = "aivis-evidence-workbench-contract@0.1.0"
EXPECTED_REVIEW_CONFLICT = "ACT-REQUEST-SOURCE-UPDATE has already been completed."
PRIMARY_REVIEWER_NOTE = (
    "Do not approve as written. Refresh the temporary boarding map and change the "
    "step-free shuttle wording to require day-of-service confirmation before staff "
    "advise the customer."
)

ROUTE_CHECKS = [
    (
        "/evidence-workbench",
        ("Evidence Workbench", "Choose the next task"),
        ("Backend fixture", "CLAIM-003: Step-free shuttle wording"),
    ),
    (
        "/evidence-workbench/review",
        ("Review answer", "Decision required", "Take action"),
        (
            "South Brisbane lift outage and PA Hospital accessible shuttle advice",
            "CIT-003-A",
            "SRC-006",
        ),
    ),
    (
        "/evidence-workbench/sources",
        ("Source blockers", "Source inventory"),
        (
            "SRC-006",
            "Day-Of-Service Shuttle Dispatch Confirmation",
            "operations-control-dispatch-confirmation",
        ),
    ),
    (
        "/evidence-workbench/process",
        ("Evidence map", "Evidence process map"),
        ("GRAPH-001", "NODE-SRC-006", "Selected evidence gap"),
    ),
    (
        "/evidence-workbench/audit",
        ("Audit state", "Audit summary"),
        ("AUDIT-001", "ACT-REQUEST-SOURCE-UPDATE"),
    ),
]

FORBIDDEN_FRONTEND_MARKERS = (
    "AIVIS_BACKEND_ORIGIN",
    "NEXT_PUBLIC_AIVIS_BACKEND_ORIGIN",
    "127.0.0.1:8080",
    "localhost:8080",
    "backend:8000",
    "SRC-FALLBACK",
    "WARN-FALLBACK",
    "GRAPH-FALLBACK",
    "Backend fixture unavailable. Showing bundled fallback data.",
    "Bundled fallback",
    "bundled_fallback",
    "/Users/pedroportella",
    "ai-" "notes",
    "deep-" "end",
    "delivery " "lane",
    "-----BEGIN PRIVATE KEY-----",
    "AWS_SECRET_ACCESS_KEY",
    "AWS_ACCESS_KEY_ID",
)

FORBIDDEN_FRONTEND_PATTERNS = (
    ("public backend env", re.compile(r"NEXT_PUBLIC_[A-Z0-9_]*BACKEND")),
    (
        "private planning label",
        re.compile(r"\b(?:[BCIQR][0-9]{2}[A-Z]?|F(?:0[0-9]|1[3-9]|2[0-9])[A-Z]?)\b"),
    ),
    ("AWS access key", re.compile(r"\bAKIA[0-9A-Z]{16}\b")),
)

STATIC_ASSET_PATTERN = re.compile(
    r"""(?:(?:href|src)=["'](?P<attr>[^"']*/_next/static/[^"']+)["']|(?P<path>/_next/static/[^\s"'<>]+))"""
)


class SmokeFailure(RuntimeError):
    """Raised when a local Docker smoke assertion fails."""


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Smoke-check the Docker Compose backend and frontend runtime."
    )
    parser.add_argument(
        "--backend-base-url",
        default=DEFAULT_BACKEND_BASE_URL,
        help=f"Host-visible backend base URL. Defaults to {DEFAULT_BACKEND_BASE_URL}.",
    )
    parser.add_argument(
        "--frontend-base-url",
        default=DEFAULT_FRONTEND_BASE_URL,
        help=f"Host-visible frontend base URL. Defaults to {DEFAULT_FRONTEND_BASE_URL}.",
    )
    parser.add_argument(
        "--timeout",
        type=float,
        default=5.0,
        help="Per-request timeout in seconds. Defaults to 5.",
    )
    parser.add_argument(
        "--wait-seconds",
        type=float,
        default=60.0,
        help="How long to wait for services to become reachable. Defaults to 60.",
    )
    return parser.parse_args()


def request_json(
    method: str,
    url: str,
    *,
    payload: dict[str, object] | None = None,
    timeout: float,
) -> tuple[int, dict[str, Any]]:
    body = None if payload is None else json.dumps(payload).encode("utf-8")
    headers = {"Accept": "application/json"}
    if payload is not None:
        headers["Content-Type"] = "application/json"

    request = urllib.request.Request(url, data=body, headers=headers, method=method)

    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            status = response.status
            raw_body = response.read().decode("utf-8")
    except urllib.error.HTTPError as error:
        status = error.code
        raw_body = error.read().decode("utf-8")
    except urllib.error.URLError as error:
        raise SmokeFailure(f"{method} {url} failed to connect: {error.reason}.") from error
    except TimeoutError as error:
        raise SmokeFailure(f"{method} {url} timed out.") from error

    try:
        decoded = json.loads(raw_body)
    except json.JSONDecodeError as error:
        raise SmokeFailure(f"{method} {url} did not return JSON.") from error

    if not isinstance(decoded, dict):
        raise SmokeFailure(f"{method} {url} did not return a JSON object.")

    return status, decoded


def request_text(url: str, *, timeout: float, accept: str = "text/html") -> tuple[int, str]:
    request = urllib.request.Request(url, headers={"Accept": accept})

    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            return response.status, response.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as error:
        body = error.read().decode("utf-8", errors="replace")
        return error.code, body
    except urllib.error.URLError as error:
        raise SmokeFailure(f"GET {url} failed to connect: {error.reason}.") from error
    except TimeoutError as error:
        raise SmokeFailure(f"GET {url} timed out.") from error


def wait_for_json(url: str, *, timeout: float, wait_seconds: float) -> dict[str, Any]:
    deadline = time.monotonic() + wait_seconds
    last_error: Exception | None = None

    while time.monotonic() < deadline:
        try:
            status, payload = request_json("GET", url, timeout=timeout)
            if status == 200:
                return payload
            last_error = SmokeFailure(f"GET {url} returned HTTP {status}.")
        except SmokeFailure as error:
            last_error = error
        time.sleep(1)

    raise SmokeFailure(f"Timed out waiting for {url}: {last_error}")


def wait_for_text(url: str, *, timeout: float, wait_seconds: float) -> str:
    deadline = time.monotonic() + wait_seconds
    last_error: Exception | None = None

    while time.monotonic() < deadline:
        try:
            status, body = request_text(url, timeout=timeout)
            if status == 200:
                return body
            last_error = SmokeFailure(f"GET {url} returned HTTP {status}.")
        except SmokeFailure as error:
            last_error = error
        time.sleep(1)

    raise SmokeFailure(f"Timed out waiting for {url}: {last_error}")


def require_fields(
    label: str,
    payload: dict[str, Any],
    expected: dict[str, object],
) -> None:
    for key, expected_value in expected.items():
        if payload.get(key) != expected_value:
            raise SmokeFailure(f"{label} field {key!r} did not match expected value.")


def require_contract(label: str, payload: dict[str, Any]) -> None:
    require_fields(
        label,
        payload,
        {
            "contractMode": "synthetic_fixture",
            "contractVersion": EXPECTED_CONTRACT_VERSION,
            "runtimeModeLabel": "local_fixture",
        },
    )


def require_contains(label: str, values: Iterable[str], body: str) -> None:
    missing = [value for value in values if value not in body]
    if missing:
        raise SmokeFailure(f"{label} missing expected rendered text: {', '.join(missing)}")


def require_no_forbidden_frontend_markers(label: str, body: str) -> None:
    forbidden = [marker for marker in FORBIDDEN_FRONTEND_MARKERS if marker in body]
    forbidden.extend(
        pattern_label
        for pattern_label, pattern in FORBIDDEN_FRONTEND_PATTERNS
        if pattern.search(body)
    )
    if forbidden:
        raise SmokeFailure(f"{label} exposed forbidden marker(s): {', '.join(forbidden)}")


def collect_static_asset_paths(route_bodies: Iterable[str]) -> list[str]:
    asset_paths: set[str] = set()

    for body in route_bodies:
        for match in STATIC_ASSET_PATTERN.finditer(body):
            raw_path = html.unescape(match.group("attr") or match.group("path") or "")
            parsed = urllib.parse.urlparse(raw_path)
            if parsed.scheme and parsed.netloc:
                path = parsed.path
            else:
                marker_start = raw_path.find("/_next/static/")
                if marker_start == -1:
                    continue
                path = raw_path[marker_start:]

            if parsed.query:
                path = f"{path}?{parsed.query}"
            asset_paths.add(path)

    return sorted(asset_paths)


def run_static_asset_smoke(
    base_url: str,
    route_bodies: Iterable[str],
    *,
    timeout: float,
) -> None:
    asset_paths = collect_static_asset_paths(route_bodies)
    if not asset_paths:
        raise SmokeFailure("frontend route HTML did not reference any /_next/static assets.")

    for asset_path in asset_paths:
        asset_url = urllib.parse.urljoin(f"{base_url}/", asset_path.lstrip("/"))
        status, body = request_text(asset_url, timeout=timeout, accept="*/*")
        if status != 200:
            raise SmokeFailure(f"GET {asset_path} returned HTTP {status}.")
        require_no_forbidden_frontend_markers(f"GET {asset_path}", body)

    print(
        f"GET /_next/static assets -> checked={len(asset_paths)}; "
        "no backend-origin, fallback-data, private-label or secret-like marker",
        flush=True,
    )


def run_backend_smoke(base_url: str, *, timeout: float, wait_seconds: float) -> None:
    base_url = base_url.rstrip("/")
    print("AIVIS Docker backend smoke", flush=True)
    print(f"backendBaseUrl: {base_url}", flush=True)

    live = wait_for_json(f"{base_url}/health/live", timeout=timeout, wait_seconds=wait_seconds)
    require_fields("/health/live", live, {"runtimeModeLabel": "local_fixture", "status": "ok"})
    print("GET /health/live -> HTTP 200; status=ok", flush=True)

    status, ready = request_json("GET", f"{base_url}/health/ready", timeout=timeout)
    if status != 200:
        raise SmokeFailure(f"GET /health/ready returned HTTP {status}.")
    require_fields("/health/ready", ready, {"runtimeModeLabel": "local_fixture", "status": "ready"})
    print("GET /health/ready -> HTTP 200; status=ready", flush=True)

    status, meta = request_json("GET", f"{base_url}/meta", timeout=timeout)
    if status != 200:
        raise SmokeFailure(f"GET /meta returned HTTP {status}.")
    require_contract("/meta", meta)
    print(f"GET /meta -> HTTP 200; contractVersion={meta['contractVersion']}", flush=True)

    status, answer = request_json(
        "GET",
        f"{base_url}/evidence-workbench/answer",
        timeout=timeout,
    )
    if status != 200:
        raise SmokeFailure(f"GET /evidence-workbench/answer returned HTTP {status}.")
    require_contract("/evidence-workbench/answer", answer)
    if answer.get("answer", {}).get("id") != "ANS-001":
        raise SmokeFailure("GET /evidence-workbench/answer returned an unexpected answer id.")
    print(
        "GET /evidence-workbench/answer -> HTTP 200; "
        f"claims={len(answer['answerClaims'])} citations={len(answer['citations'])}",
        flush=True,
    )

    status, sources = request_json(
        "GET",
        f"{base_url}/evidence-workbench/sources",
        timeout=timeout,
    )
    if status != 200:
        raise SmokeFailure(f"GET /evidence-workbench/sources returned HTTP {status}.")
    require_contract("/evidence-workbench/sources", sources)
    print(
        "GET /evidence-workbench/sources -> HTTP 200; "
        f"sources={len(sources['sources'])} publicContextAnchors={len(sources['publicContextAnchors'])}",
        flush=True,
    )

    status, graph = request_json(
        "GET",
        f"{base_url}/evidence-workbench/graph",
        timeout=timeout,
    )
    if status != 200:
        raise SmokeFailure(f"GET /evidence-workbench/graph returned HTTP {status}.")
    require_contract("/evidence-workbench/graph", graph)
    if graph.get("evidenceGraph", {}).get("id") != "GRAPH-001":
        raise SmokeFailure("GET /evidence-workbench/graph returned an unexpected graph id.")
    print(
        "GET /evidence-workbench/graph -> HTTP 200; "
        f"nodes={len(graph['evidenceNodes'])} edges={len(graph['evidenceEdges'])}",
        flush=True,
    )

    review_body = {
        "reviewActionId": "ACT-REQUEST-SOURCE-UPDATE",
        "reviewerNote": PRIMARY_REVIEWER_NOTE,
    }
    status, review_action = request_json(
        "POST",
        f"{base_url}/evidence-workbench/review-actions",
        payload=review_body,
        timeout=timeout,
    )
    if status == 200:
        if review_action.get("reviewState", {}).get("status") != "source_update_requested":
            raise SmokeFailure("POST /evidence-workbench/review-actions returned unexpected state.")
        print(
            "POST /evidence-workbench/review-actions -> HTTP 200; "
            "status=source_update_requested",
            flush=True,
        )
    elif status == 409:
        error = review_action.get("error", {})
        if not isinstance(error, dict) or error.get("message") != EXPECTED_REVIEW_CONFLICT:
            raise SmokeFailure("POST /evidence-workbench/review-actions returned unexpected 409.")
        print(
            "POST /evidence-workbench/review-actions -> HTTP 409; "
            "primary local action was already recorded in this container",
            flush=True,
        )
    else:
        raise SmokeFailure(f"POST /evidence-workbench/review-actions returned HTTP {status}.")


def run_frontend_smoke(base_url: str, *, timeout: float, wait_seconds: float) -> None:
    base_url = base_url.rstrip("/")
    print("AIVIS Docker frontend smoke", flush=True)
    print(f"frontendBaseUrl: {base_url}", flush=True)

    wait_for_text(f"{base_url}/evidence-workbench", timeout=timeout, wait_seconds=wait_seconds)

    route_bodies: list[str] = []

    for path, expected_text, backend_markers in ROUTE_CHECKS:
        status, body = request_text(f"{base_url}{path}", timeout=timeout)
        if status != 200:
            raise SmokeFailure(f"GET {path} returned HTTP {status}.")
        require_contains(path, expected_text, body)
        require_contains(f"{path} backend-backed markers", backend_markers, body)
        require_no_forbidden_frontend_markers(f"GET {path}", body)
        route_bodies.append(body)
        print(
            f"GET {path} -> HTTP 200; rendered={', '.join(expected_text)}; "
            "backend-backed; no backend-origin, fallback-data, private-label or secret-like marker",
            flush=True,
        )

    run_static_asset_smoke(base_url, route_bodies, timeout=timeout)


def main() -> int:
    args = parse_args()

    try:
        run_backend_smoke(
            args.backend_base_url,
            timeout=args.timeout,
            wait_seconds=args.wait_seconds,
        )
        run_frontend_smoke(
            args.frontend_base_url,
            timeout=args.timeout,
            wait_seconds=args.wait_seconds,
        )
    except SmokeFailure as error:
        print(f"smoke: failed: {error}", file=sys.stderr)
        return 1

    print("smoke: ok", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
