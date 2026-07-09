#!/usr/bin/env node

const baseUrl = (
  process.env.AIVIS_BACKEND_RELEASE_PROOF_BASE_URL ??
  process.env.AIVIS_E2E_BASE_URL ??
  "http://127.0.0.1:3200"
).replace(/\/$/, "");

const PRIMARY_REVIEW_ACTION_ID = "ACT-REQUEST-SOURCE-UPDATE";
const forbiddenFallbackMarkers = [
  "Backend fixture unavailable",
  "Bundled fallback",
  "SRC-FALLBACK",
  "WARN-FALLBACK",
  "GRAPH-FALLBACK",
  "bundled_fallback"
];
const forbiddenBackendActionLabels = [
  "Add review note",
  "Escalate to source owner",
  "Mark unsafe to use",
  "Mark reviewed"
];

try {
  const viewModel = await requestJson("/api/evidence-workbench/view-model");
  requireBackendViewModel(viewModel);

  const overviewHtml = await requestText("/evidence-workbench");
  requireBackendRouteHtml("/evidence-workbench", overviewHtml, [
    "Evidence Workbench",
    "Backend fixture",
    "CLAIM-003: Step-free shuttle wording"
  ]);

  const reviewHtml = await requestText("/evidence-workbench/review");
  requireBackendRouteHtml("/evidence-workbench/review", reviewHtml, [
    "Review answer",
    "Backend action",
    "Request source update"
  ]);
  requireNoUnsupportedBackendActions(reviewHtml);

  console.log(
    [
      "Backend release proof passed.",
      `baseUrl=${baseUrl}`,
      "viewModelSource=backend",
      `implementedReviewActions=${PRIMARY_REVIEW_ACTION_ID}`
    ].join("\n")
  );
} catch (error) {
  console.error(`Backend release proof failed: ${error.message}`);
  process.exit(1);
}

async function requestJson(path) {
  const response = await fetch(`${baseUrl}${path}`, {
    cache: "no-store",
    headers: {
      accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`GET ${path} returned HTTP ${response.status}.`);
  }

  return response.json();
}

async function requestText(path) {
  const response = await fetch(`${baseUrl}${path}`, {
    cache: "no-store",
    headers: {
      accept: "text/html"
    }
  });

  if (!response.ok) {
    throw new Error(`GET ${path} returned HTTP ${response.status}.`);
  }

  return response.text();
}

function requireBackendViewModel(viewModel) {
  const source = viewModel?.fetchState?.source;
  if (source !== "backend") {
    throw new Error(
      `same-origin view model reported ${JSON.stringify(source)} instead of backend.`
    );
  }

  const summary = new Map(
    Array.isArray(viewModel.summary)
      ? viewModel.summary.map((item) => [item.label, item.value])
      : []
  );
  if (summary.get("Data source") !== "Backend fixture") {
    throw new Error("same-origin view model did not report Backend fixture.");
  }

  const actionIds = Array.isArray(viewModel.review?.actions)
    ? viewModel.review.actions.map((action) => action.id)
    : [];
  if (actionIds.length !== 1 || actionIds[0] !== PRIMARY_REVIEW_ACTION_ID) {
    throw new Error(
      `backend review actions were not constrained to ${PRIMARY_REVIEW_ACTION_ID}.`
    );
  }

  requireNoMarkers("same-origin view model", JSON.stringify(viewModel), forbiddenFallbackMarkers);
}

function requireBackendRouteHtml(path, body, expectedMarkers) {
  for (const marker of expectedMarkers) {
    if (!body.includes(marker)) {
      throw new Error(`${path} did not render expected backend marker: ${marker}.`);
    }
  }

  requireNoMarkers(path, body, forbiddenFallbackMarkers);
}

function requireNoUnsupportedBackendActions(body) {
  requireNoMarkers(
    "/evidence-workbench/review",
    body,
    forbiddenBackendActionLabels
  );
}

function requireNoMarkers(label, body, markers) {
  const matches = markers.filter((marker) => body.includes(marker));
  if (matches.length > 0) {
    throw new Error(`${label} exposed forbidden marker(s): ${matches.join(", ")}.`);
  }
}
