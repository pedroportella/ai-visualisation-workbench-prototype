from __future__ import annotations

from http import HTTPStatus
from typing import Any, Iterable

from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.requests import Request
from starlette.responses import JSONResponse

from aivis_api.fixture_data import (
    CONTRACT_MODE,
    CONTRACT_VERSION,
    PUBLIC_CONTEXT_SET_VERSION,
    RUNTIME_MODE_LABEL,
    SOURCE_SET_VERSION,
)

HTTP_ERROR_CODE_BY_STATUS: dict[int, str] = {
    400: "invalid_request",
    404: "not_found",
    405: "method_not_allowed",
    409: "review_action_conflict",
    422: "request_validation_failed",
}


def build_error_payload(
    *,
    status_code: int,
    code: str,
    message: str,
    invalid_fields: list[dict[str, str]] | None = None,
) -> dict[str, object]:
    error: dict[str, object] = {
        "code": code,
        "message": message,
        "statusCode": status_code,
        "runtimeModeLabel": RUNTIME_MODE_LABEL,
        "contractMode": CONTRACT_MODE,
        "contractVersion": CONTRACT_VERSION,
        "sourceSetVersion": SOURCE_SET_VERSION,
        "publicContextSetVersion": PUBLIC_CONTEXT_SET_VERSION,
    }

    if invalid_fields:
        error["invalidFields"] = invalid_fields

    return {"error": error}


def error_response(
    *,
    status_code: int,
    code: str,
    message: str,
    invalid_fields: list[dict[str, str]] | None = None,
) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content=build_error_payload(
            status_code=status_code,
            code=code,
            message=message,
            invalid_fields=invalid_fields,
        ),
    )


async def http_exception_handler(
    _request: Request,
    exception: StarletteHTTPException,
) -> JSONResponse:
    code, message = _http_exception_detail(exception)
    return error_response(
        status_code=exception.status_code,
        code=code,
        message=message,
    )


async def request_validation_exception_handler(
    _request: Request,
    exception: RequestValidationError,
) -> JSONResponse:
    return error_response(
        status_code=422,
        code="request_validation_failed",
        message="Request body did not match the local API contract.",
        invalid_fields=_validation_fields(exception.errors()),
    )


def _http_exception_detail(exception: StarletteHTTPException) -> tuple[str, str]:
    detail = exception.detail
    code = HTTP_ERROR_CODE_BY_STATUS.get(exception.status_code, "http_error")
    message = _status_message(exception.status_code)

    if isinstance(detail, dict):
        raw_code = detail.get("code")
        raw_message = detail.get("message")
        if isinstance(raw_code, str) and raw_code:
            code = raw_code
        if isinstance(raw_message, str) and raw_message:
            message = raw_message
    elif isinstance(detail, str) and detail:
        message = detail

    if exception.status_code >= 500:
        message = "The local API could not complete the request."

    return code, message


def _validation_fields(errors: Iterable[dict[str, Any]]) -> list[dict[str, str]]:
    fields: dict[str, str] = {}

    for issue in errors:
        field = _field_name(issue.get("loc", ()))
        issue_type = str(issue.get("type", "invalid"))
        fields.setdefault(field, issue_type)

    return [
        {"field": field, "issue": issue}
        for field, issue in sorted(fields.items())
    ]


def _field_name(location: object) -> str:
    if not isinstance(location, (list, tuple)):
        return "request"

    parts = [str(part) for part in location if part not in ("body", "query", "path")]
    return ".".join(parts) if parts else "request"


def _status_message(status_code: int) -> str:
    try:
        return HTTPStatus(status_code).phrase
    except ValueError:
        return "HTTP error"
