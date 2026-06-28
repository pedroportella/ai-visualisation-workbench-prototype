import "server-only";

import { fallbackEvidenceWorkbenchData } from "./fallback-fixture";
import type { EvidenceWorkbenchViewModel } from "./types";

const DEFAULT_BACKEND_ORIGIN = "http://127.0.0.1:8000";

interface BackendServiceConfig {
  backendOrigin: string;
}

interface FixtureMetadata {
  contractMode: string;
  runtimeModeLabel: string;
}

interface PromptContext {
  plannedTravelDate: string;
  question: string;
}

interface PublicContextAnchor {
  fixtureUse: string;
  id: string;
  label: string;
}

interface AnswerFixture {
  defaultSelectedClaimId: string;
  generatedAt: string;
  markdown: string;
  status?: string;
  displayStatusLabel: string;
  summary: string;
  title: string;
}

interface AnswerClaimFixture {
  displayOrder: number;
  evidencePosture: string;
  id: string;
  reviewRequired: boolean;
  text: string;
  warningIds: string[];
}

interface ReviewStateFixture {
  activeWarningIds: string[];
  approvalBlockedByWarningIds: string[];
  copyState: string;
  statusLabel: string;
}

interface SourceWarningFixture {
  id: string;
  message: string;
  severity: string;
}

interface CitationFixture {
  claimId: string;
  confidenceLabel: string;
  id: string;
  marker: string;
  sourceId: string;
  sourceLocationLabel: string;
  warningIds: string[];
}

interface SourceFixture {
  citationCount: number;
  freshness: string;
  id: string;
  lastUpdated: string | null;
  sourceOrigin: string;
  syntheticExcerptPreview: string;
  title: string;
  warningIds: string[];
}

interface EvidenceGraphFixture {
  accessibleSummary: string;
}

interface EvidenceGraphStepFixture {
  heading: string;
  step: number;
  summary: string;
}

interface AnswerFixtureResponse extends FixtureMetadata {
  answer: AnswerFixture;
  answerClaims: AnswerClaimFixture[];
  citations: CitationFixture[];
  promptContext: PromptContext;
  publicContextAnchors: PublicContextAnchor[];
  reviewState: ReviewStateFixture;
  sourceWarnings: SourceWarningFixture[];
}

interface SourceInventoryResponse extends FixtureMetadata {
  sources: SourceFixture[];
}

interface EvidenceGraphResponse extends FixtureMetadata {
  evidenceGraph: EvidenceGraphFixture;
  smallViewportFallbackSteps: EvidenceGraphStepFixture[];
}

export function loadEvidenceBackendConfig(env: NodeJS.ProcessEnv = process.env): BackendServiceConfig {
  return {
    backendOrigin: (env.AIVIS_BACKEND_ORIGIN ?? DEFAULT_BACKEND_ORIGIN).replace(/\/$/, "")
  };
}

export async function getEvidenceWorkbenchData(): Promise<EvidenceWorkbenchViewModel> {
  try {
    const config = loadEvidenceBackendConfig();
    const [answerResponse, sourceResponse, graphResponse] = await Promise.all([
      fetchFixture<AnswerFixtureResponse>(config, "/evidence-workbench/answer"),
      fetchFixture<SourceInventoryResponse>(config, "/evidence-workbench/sources"),
      fetchFixture<EvidenceGraphResponse>(config, "/evidence-workbench/graph")
    ]);

    return buildEvidenceWorkbenchViewModel(answerResponse, sourceResponse, graphResponse);
  } catch {
    return fallbackEvidenceWorkbenchData;
  }
}

async function fetchFixture<TResponse>(
  config: BackendServiceConfig,
  path: string
): Promise<TResponse> {
  const response = await fetch(`${config.backendOrigin}${path}`, {
    cache: "no-store",
    headers: {
      accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`fixture request failed: ${response.status}`);
  }

  return (await response.json()) as TResponse;
}

function buildEvidenceWorkbenchViewModel(
  answerResponse: AnswerFixtureResponse,
  sourceResponse: SourceInventoryResponse,
  graphResponse: EvidenceGraphResponse
): EvidenceWorkbenchViewModel {
  const warningsById = new Map(
    answerResponse.sourceWarnings.map((warning) => [warning.id, warning])
  );
  const activeWarnings = answerResponse.reviewState.activeWarningIds
    .map((warningId) => warningsById.get(warningId))
    .filter((warning): warning is SourceWarningFixture => Boolean(warning));

  return {
    answer: {
      generatedAt: answerResponse.answer.generatedAt,
      markdown: answerResponse.answer.markdown,
      status: answerResponse.answer.displayStatusLabel,
      summary: answerResponse.answer.summary,
      title: answerResponse.answer.title
    },
    citations: answerResponse.citations.map((citation) => ({
      claimId: citation.claimId,
      id: citation.id,
      marker: citation.marker,
      sourceId: citation.sourceId,
      sourceLabel: citation.sourceLocationLabel,
      status: formatLabel(citation.confidenceLabel),
      warningIds: citation.warningIds
    })),
    context: {
      anchors: answerResponse.publicContextAnchors.map((anchor) => ({
        id: anchor.id,
        label: anchor.label,
        supportingText: anchor.fixtureUse
      })),
      plannedTravelDate: answerResponse.promptContext.plannedTravelDate,
      question: contextSummary(answerResponse.promptContext),
      title: "Step-free transfer guidance needs evidence review"
    },
    fetchState: {
      source: "backend"
    },
    graph: {
      accessibleSummary: graphResponse.evidenceGraph.accessibleSummary,
      fallbackSteps: graphResponse.smallViewportFallbackSteps
        .slice()
        .sort((left, right) => left.step - right.step)
        .map((step) => ({
          heading: step.heading,
          summary: step.summary
        }))
    },
    review: {
      activeWarningCount: answerResponse.reviewState.activeWarningIds.length,
      blockedByWarningIds: answerResponse.reviewState.approvalBlockedByWarningIds,
      copyState: answerResponse.reviewState.copyState,
      selectedClaimId: answerResponse.answer.defaultSelectedClaimId,
      status: answerResponse.reviewState.statusLabel
    },
    reviewClaims: answerResponse.answerClaims
      .slice()
      .sort((left, right) => left.displayOrder - right.displayOrder)
      .filter((claim) => claim.reviewRequired || claim.warningIds.length > 0)
      .map((claim) => ({
        id: claim.id,
        status: formatEvidencePosture(claim.evidencePosture),
        text: claimReviewText(claim),
        title: formatClaimTitle(claim),
        warningIds: claim.warningIds
      })),
    sourceItems: sourceResponse.sources
      .filter((source) => source.citationCount > 0 || source.warningIds.length > 0)
      .map((source) => ({
        id: source.id,
        meta: sourceMeta(source),
        preview: source.syntheticExcerptPreview,
        status: sourceStatus(source),
        title: source.title
      })),
    summary: [
      {
        label: "Fixture mode",
        value: formatLabel(answerResponse.contractMode)
      },
      {
        label: "Runtime",
        value: formatLabel(answerResponse.runtimeModeLabel)
      },
      {
        label: "Data source",
        value: "Backend fixture"
      },
      {
        label: "Review state",
        value: answerResponse.reviewState.statusLabel
      }
    ],
    warnings: activeWarnings.map((warning) => ({
      id: warning.id,
      message: warning.message,
      severity: formatLabel(warning.severity)
    }))
  };
}

function formatEvidencePosture(posture: string): string {
  const labels: Record<string, string> = {
    missing_evidence: "Missing evidence",
    partial_support: "Partial support",
    supported: "Supported",
    weak_support: "Weak support"
  };

  return labels[posture] ?? formatLabel(posture);
}

function formatClaimTitle(claim: AnswerClaimFixture): string {
  const titles: Record<string, string> = {
    "CLAIM-002": "Temporary boarding point wording",
    "CLAIM-003": "Step-free shuttle wording"
  };

  if (titles[claim.id]) {
    return titles[claim.id];
  }

  const firstSentence = claim.text.split(".")[0] ?? claim.text;
  return firstSentence.replace(/^The /, "").replace(/^Staff should /, "");
}

function claimReviewText(claim: AnswerClaimFixture): string {
  const summaries: Record<string, string> = {
    "CLAIM-002":
      "Temporary boarding-point wording depends on a stale synthetic map and needs a source update before reuse.",
    "CLAIM-003":
      "Step-free shuttle wording has only partial fixture support and still needs dispatch confirmation."
  };

  return summaries[claim.id] ?? claim.text;
}

function contextSummary(promptContext: PromptContext): string {
  return (
    `Synthetic mobility-access review case for ${promptContext.plannedTravelDate}. ` +
    "Fixture data supplies the answer, source trace and evidence path for the context anchors below."
  );
}

function formatLabel(value: string): string {
  return value
    .split("_")
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}

function sourceMeta(source: SourceFixture): string {
  if (source.lastUpdated) {
    return `Fixture source updated: ${source.lastUpdated}`;
  }

  return "Evidence state: missing-source placeholder";
}

function sourceStatus(source: SourceFixture): string {
  if (source.sourceOrigin === "missing_source_placeholder" || source.freshness === "missing") {
    return "Missing evidence";
  }

  if (source.freshness === "stale") {
    return "Stale source";
  }

  return "Synthetic fixture";
}
