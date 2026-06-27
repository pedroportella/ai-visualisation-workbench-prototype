FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_ROOT_USER_ACTION=ignore \
    AIVIS_BACKEND_HOST=0.0.0.0 \
    AIVIS_BACKEND_PORT=8000

WORKDIR /app

RUN addgroup --system aivis && adduser --system --ingroup aivis aivis

COPY pyproject.toml ./
COPY src ./src

RUN python -m pip install --no-cache-dir .

USER aivis

EXPOSE 8000

CMD ["python", "-m", "aivis_api.server"]
