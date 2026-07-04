"""AI provider boundary metadata for the fixture-only backend."""

from __future__ import annotations

from copy import deepcopy
from typing import Final


JsonObject = dict[str, object]

FIXTURE_PROVIDER_ID: Final = "fixture_provider"
PROVIDER_MODE: Final = "fixture_only"
RETRIEVAL_PROVIDER_BOUNDARY: Final = "retrieval_provider"
GENERATION_PROVIDER_BOUNDARY: Final = "generation_provider"
GRAPH_PROVIDER_BOUNDARY: Final = "graph_provider"

AI_PROVIDER_BOUNDARY_NAMES: Final = [
    RETRIEVAL_PROVIDER_BOUNDARY,
    GENERATION_PROVIDER_BOUNDARY,
    GRAPH_PROVIDER_BOUNDARY,
]

UNSUPPORTED_AI_CAPABILITY_IDS: Final = [
    "production_rag",
    "production_graphrag",
    "amazon_bedrock",
    "neo4j",
    "mcp_server",
    "agent_runtime",
]

AI_PROVIDER_BOUNDARIES: Final[list[JsonObject]] = [
    {
        "boundaryName": RETRIEVAL_PROVIDER_BOUNDARY,
        "implementedProviderId": FIXTURE_PROVIDER_ID,
        "implementedProviderRole": (
            "Serves deterministic source, citation and warning fixture records."
        ),
        "futureProviderRole": (
            "May adapt verified retrieval results after a future implementation."
        ),
        "status": "fixture_provider_only",
    },
    {
        "boundaryName": GENERATION_PROVIDER_BOUNDARY,
        "implementedProviderId": FIXTURE_PROVIDER_ID,
        "implementedProviderRole": (
            "Serves the deterministic draft answer fixture and prompt context."
        ),
        "futureProviderRole": (
            "May adapt generated draft answers after a future implementation."
        ),
        "status": "fixture_provider_only",
    },
    {
        "boundaryName": GRAPH_PROVIDER_BOUNDARY,
        "implementedProviderId": FIXTURE_PROVIDER_ID,
        "implementedProviderRole": (
            "Serves the deterministic evidence graph fixture and fallback steps."
        ),
        "futureProviderRole": (
            "May adapt graph retrieval or knowledge-graph results after a future "
            "implementation."
        ),
        "status": "fixture_provider_only",
    },
]

AI_PROVIDER_BOUNDARY_METADATA: Final[JsonObject] = {
    "providerMode": PROVIDER_MODE,
    "implementedProviderIds": [FIXTURE_PROVIDER_ID],
    "providerBoundaryNames": AI_PROVIDER_BOUNDARY_NAMES,
    "providerBoundaries": AI_PROVIDER_BOUNDARIES,
    "unsupportedCapabilityIds": UNSUPPORTED_AI_CAPABILITY_IDS,
}


def get_ai_provider_boundary_metadata() -> JsonObject:
    return deepcopy(AI_PROVIDER_BOUNDARY_METADATA)
