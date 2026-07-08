import "server-only";

import { fallbackEvidenceWorkbenchData } from "./EvidenceWorkbenchFallbackFixture";
import { REVIEW_ACTION_RECORDS } from "./EvidenceWorkbenchReviewActionFixture";
import type {
  EvidenceWorkbenchAuditMetadata,
  EvidenceWorkbenchCitation,
  EvidenceWorkbenchContextAnchor,
  EvidenceWorkbenchGraphEdge,
  EvidenceWorkbenchGraphNode,
  EvidenceWorkbenchGraphPosition,
  EvidenceWorkbenchReviewAction,
  EvidenceWorkbenchSource,
  EvidenceWorkbenchSourceFilter,
  EvidenceWorkbenchSourceWarning,
  EvidenceWorkbenchWarning,
  EvidenceWorkbenchViewModel
} from "./EvidenceWorkbenchTypes";

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
  evidenceUseProhibited?: boolean;
  fixtureUse: string;
  id: string;
  kind?: string;
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
  citationIds: string[];
  contextAnchorIds: string[];
  displayOrder: number;
  evidencePosture: string;
  id: string;
  requiredMissingSourceIds: string[];
  reviewRequired: boolean;
  supportingSourceIds: string[];
  text: string;
  warningIds: string[];
}

interface ReviewStateFixture {
  activeWarningIds: string[];
  approvalBlockedByWarningIds: string[];
  answerId: string;
  auditMetadataId: string;
  availableActionIds: string[];
  completedActionIds: string[];
  copyState: string;
  id: string;
  lastActionId: string | null;
  reviewerIdLabel: string;
  reviewerNote: string | null;
  status: string;
  statusLabel: string;
  updatedAt: string;
}

interface AuditMetadataFixture {
  boundaryNoteForDocs?: string;
  contractMode: string;
  id: string;
  lastReviewActionId: string | null;
  modelLabel: string;
  reviewEventIds: string[];
  runtimeModeLabel: string;
}

interface SourceWarningFixture {
  appliesTo?: SourceWarningAppliesToFixture[];
  blocksApproval?: boolean;
  code: string;
  evidenceImpact?: string;
  id: string;
  message: string;
  recommendedActionId?: string;
  severity: string;
}

interface SourceWarningAppliesToFixture {
  objectId: string;
  objectType: string;
}

interface CitationFixture {
  claimId: string;
  confidenceLabel: string;
  excerptId: string;
  id: string;
  marker: string;
  relationship: string;
  sourceId: string;
  sourceLocationLabel: string;
  warningIds: string[];
}

interface SourceFixture {
  citationCount: number;
  contextAnchorIds: string[];
  excerptIds: string[];
  expiresAt: string | null;
  freshness: string;
  id: string;
  isClaimSupportingEvidence: boolean;
  lastUpdated: string | null;
  ownerLabel: string;
  reviewOwnerQueue: string;
  sourceOrigin: string;
  sourceType: string;
  syntheticExcerptPreview: string;
  title: string;
  warningIds: string[];
}

interface EvidenceGraphFixture {
  accessibleSummary: string;
  defaultFocusedSourceIds: string[];
  defaultFocusedWarningIds: string[];
  defaultSelectedClaimId: string;
  defaultSelectedNodeId: string;
  id: string;
  layoutHint: string;
  smallViewportFallback: string;
}

interface EvidenceGraphPositionFixture {
  column: number;
  row: number;
}

interface EvidenceGraphNodeFixture {
  displayOrder: number;
  graphId: string;
  id: string;
  label: string;
  positionHint: EvidenceGraphPositionFixture;
  refObjectId: string;
  refObjectType: string;
  status: string;
  type: string;
  warningIds: string[];
}

interface EvidenceGraphEdgeFixture {
  fromNodeId: string;
  graphId: string;
  id: string;
  label: string;
  refObjectId: string;
  refObjectType: string;
  toNodeId: string;
  type: string;
  warningIds: string[];
}

interface EvidenceGraphStepFixture {
  heading: string;
  includeIds: string[];
  step: number;
  summary: string;
}

interface AnswerFixtureResponse extends FixtureMetadata {
  answer: AnswerFixture;
  answerClaims: AnswerClaimFixture[];
  auditMetadata: AuditMetadataFixture;
  citations: CitationFixture[];
  promptContext: PromptContext;
  publicContextAnchors: PublicContextAnchor[];
  reviewActions?: EvidenceWorkbenchReviewAction[];
  reviewState: ReviewStateFixture;
  sourceWarnings: SourceWarningFixture[];
}

interface SourceInventoryResponse extends FixtureMetadata {
  publicContextAnchors?: PublicContextAnchor[];
  sourceWarnings?: SourceWarningFixture[];
  sources: SourceFixture[];
}

interface EvidenceGraphResponse extends FixtureMetadata {
  evidenceEdges: EvidenceGraphEdgeFixture[];
  evidenceGraph: EvidenceGraphFixture;
  evidenceNodes: EvidenceGraphNodeFixture[];
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
  const sourceWarnings = sourceResponse.sourceWarnings ?? answerResponse.sourceWarnings;
  const warningsById = new Map(
    sourceWarnings.map((warning) => [warning.id, warning])
  );
  const activeWarnings = answerResponse.reviewState.activeWarningIds
    .map((warningId) => warningsById.get(warningId))
    .filter((warning): warning is SourceWarningFixture => Boolean(warning));
  const contextAnchors = sourceResponse.publicContextAnchors ?? answerResponse.publicContextAnchors;
  const contextAnchorsById = new Map(
    contextAnchors.map((anchor) => [anchor.id, mapContextAnchor(anchor)])
  );
  const citations = answerResponse.citations.map(mapCitation);
  const citationsBySourceId = groupCitationsBySourceId(citations);
  const selectedClaim = answerResponse.answerClaims.find(
    (claim) => claim.id === answerResponse.answer.defaultSelectedClaimId
  );
  const selectedClaimSourceIds = new Set([
    ...(selectedClaim?.supportingSourceIds ?? []),
    ...(selectedClaim?.requiredMissingSourceIds ?? [])
  ]);
  const sourceItems = sourceResponse.sources.map((source) =>
    mapSourceItem(source, {
      citations: citationsBySourceId.get(source.id) ?? [],
      contextAnchorsById,
      selectedClaimSourceIds,
      warningsById
    })
  );

  return {
    answer: {
      generatedAt: answerResponse.answer.generatedAt,
      markdown: answerResponse.answer.markdown,
      status: answerResponse.answer.displayStatusLabel,
      summary: answerResponse.answer.summary,
      title: answerResponse.answer.title
    },
    citations,
    context: {
      anchors: answerResponse.publicContextAnchors.map(mapContextAnchor),
      plannedTravelDate: answerResponse.promptContext.plannedTravelDate,
      question: contextSummary(answerResponse.promptContext),
      title: "Step-free transfer guidance needs evidence review"
    },
    fetchState: {
      source: "backend"
    },
    graph: {
      accessibleSummary: graphResponse.evidenceGraph.accessibleSummary,
      defaultFocusedSourceIds: graphResponse.evidenceGraph.defaultFocusedSourceIds,
      defaultFocusedWarningIds: graphResponse.evidenceGraph.defaultFocusedWarningIds,
      defaultSelectedClaimId: graphResponse.evidenceGraph.defaultSelectedClaimId,
      defaultSelectedNodeId: graphResponse.evidenceGraph.defaultSelectedNodeId,
      edges: graphResponse.evidenceEdges.map(mapGraphEdge),
      fallbackSteps: graphResponse.smallViewportFallbackSteps
        .slice()
        .sort((left, right) => left.step - right.step)
        .map((step) => ({
          includeIds: step.includeIds,
          step: step.step,
          heading: step.heading,
          summary: step.summary
        })),
      id: graphResponse.evidenceGraph.id,
      layoutHint: graphResponse.evidenceGraph.layoutHint,
      nodes: graphResponse.evidenceNodes
        .slice()
        .sort((left, right) => left.displayOrder - right.displayOrder)
        .map(mapGraphNode),
      smallViewportFallback: graphResponse.evidenceGraph.smallViewportFallback
    },
    review: {
      actions: answerResponse.reviewActions ?? REVIEW_ACTION_RECORDS,
      activeWarningCount: answerResponse.reviewState.activeWarningIds.length,
      activeWarningIds: answerResponse.reviewState.activeWarningIds,
      availableActionIds: answerResponse.reviewState.availableActionIds,
      blockedByWarningIds: answerResponse.reviewState.approvalBlockedByWarningIds,
      completedActionIds: answerResponse.reviewState.completedActionIds,
      copyState: answerResponse.reviewState.copyState,
      id: answerResponse.reviewState.id,
      lastActionId: answerResponse.reviewState.lastActionId,
      reviewerIdLabel: answerResponse.reviewState.reviewerIdLabel,
      reviewerNote: answerResponse.reviewState.reviewerNote,
      selectedClaimId: answerResponse.answer.defaultSelectedClaimId,
      status: answerResponse.reviewState.statusLabel,
      statusId: answerResponse.reviewState.status,
      updatedAt: answerResponse.reviewState.updatedAt
    },
    audit: mapAuditMetadata(answerResponse.auditMetadata),
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
    sourceFilters: buildSourceFilters(sourceItems),
    sourceItems,
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
    warnings: activeWarnings.map(mapWarning)
  };
}

function mapGraphNode(node: EvidenceGraphNodeFixture): EvidenceWorkbenchGraphNode {
  return {
    displayOrder: node.displayOrder,
    graphId: node.graphId,
    id: node.id,
    label: node.label,
    positionHint: mapGraphPosition(node.positionHint),
    refObjectId: node.refObjectId,
    refObjectType: node.refObjectType,
    status: node.status,
    type: node.type,
    warningIds: node.warningIds
  };
}

function mapGraphEdge(edge: EvidenceGraphEdgeFixture): EvidenceWorkbenchGraphEdge {
  return {
    fromNodeId: edge.fromNodeId,
    graphId: edge.graphId,
    id: edge.id,
    label: edge.label,
    refObjectId: edge.refObjectId,
    refObjectType: edge.refObjectType,
    toNodeId: edge.toNodeId,
    type: edge.type,
    warningIds: edge.warningIds
  };
}

function mapGraphPosition(position: EvidenceGraphPositionFixture): EvidenceWorkbenchGraphPosition {
  return {
    column: position.column,
    row: position.row
  };
}

interface MapSourceItemContext {
  citations: EvidenceWorkbenchCitation[];
  contextAnchorsById: Map<string, EvidenceWorkbenchContextAnchor>;
  selectedClaimSourceIds: Set<string>;
  warningsById: Map<string, SourceWarningFixture>;
}

function mapSourceItem(
  source: SourceFixture,
  context: MapSourceItemContext
): EvidenceWorkbenchSource {
  const directWarnings = source.warningIds
    .map((warningId) => context.warningsById.get(warningId))
    .filter((warning): warning is SourceWarningFixture => Boolean(warning))
    .map(mapSourceWarning);
  const directWarningIds = new Set(directWarnings.map((warning) => warning.id));
  const relationshipWarnings = uniqueStrings(
    context.citations.flatMap((citation) => citation.warningIds)
  )
    .filter((warningId) => !directWarningIds.has(warningId))
    .map((warningId) => context.warningsById.get(warningId))
    .filter((warning): warning is SourceWarningFixture => Boolean(warning))
    .map(mapSourceWarning);

  return {
    citationCount: source.citationCount,
    citations: context.citations,
    contextAnchors: source.contextAnchorIds.map(
      (anchorId) =>
        context.contextAnchorsById.get(anchorId) ?? {
          evidenceUseProhibited: true,
          id: anchorId,
          label: anchorId,
          supportingText: "Context anchor only"
        }
    ),
    directWarnings,
    excerptIds: source.excerptIds,
    expiresAt: source.expiresAt,
    freshness: formatLabel(source.freshness),
    id: source.id,
    isClaimSupportingEvidence: source.isClaimSupportingEvidence,
    isSelectedClaimSource: context.selectedClaimSourceIds.has(source.id),
    lastUpdated: source.lastUpdated,
    meta: sourceMeta(source),
    ownerLabel: source.ownerLabel,
    preview: source.syntheticExcerptPreview,
    relationshipWarnings,
    reviewOwnerQueue: source.reviewOwnerQueue,
    sourceOrigin: source.sourceOrigin,
    sourceType: formatLabel(source.sourceType),
    status: sourceStatus(source, relationshipWarnings),
    title: source.title,
    trustState: sourceTrustState(source, relationshipWarnings)
  };
}

function mapCitation(citation: CitationFixture): EvidenceWorkbenchCitation {
  return {
    claimId: citation.claimId,
    excerptId: citation.excerptId,
    id: citation.id,
    marker: citation.marker,
    relationship: formatLabel(citation.relationship),
    sourceId: citation.sourceId,
    sourceLabel: citation.sourceLocationLabel,
    status: formatLabel(citation.confidenceLabel),
    warningIds: citation.warningIds
  };
}

function mapContextAnchor(anchor: PublicContextAnchor): EvidenceWorkbenchContextAnchor {
  return {
    evidenceUseProhibited: anchor.evidenceUseProhibited ?? true,
    id: anchor.id,
    kind: anchor.kind ? formatLabel(anchor.kind) : undefined,
    label: anchor.label,
    supportingText: anchor.fixtureUse
  };
}

function mapSourceWarning(warning: SourceWarningFixture): EvidenceWorkbenchSourceWarning {
  return {
    blocksApproval: Boolean(warning.blocksApproval),
    code: formatLabel(warning.code),
    evidenceImpact: warning.evidenceImpact ?? warning.message,
    id: warning.id,
    message: warning.message,
    severity: formatLabel(warning.severity)
  };
}

function mapWarning(warning: SourceWarningFixture): EvidenceWorkbenchWarning {
  return {
    blocksApproval: Boolean(warning.blocksApproval),
    code: formatLabel(warning.code),
    evidenceImpact: warning.evidenceImpact,
    id: warning.id,
    message: warning.message,
    severity: formatLabel(warning.severity)
  };
}

function mapAuditMetadata(metadata: AuditMetadataFixture): EvidenceWorkbenchAuditMetadata {
  return {
    boundaryNoteForDocs: metadata.boundaryNoteForDocs,
    contractMode: metadata.contractMode,
    id: metadata.id,
    lastReviewActionId: metadata.lastReviewActionId,
    modelLabel: metadata.modelLabel,
    reviewEventIds: metadata.reviewEventIds,
    runtimeModeLabel: metadata.runtimeModeLabel
  };
}

function groupCitationsBySourceId(
  citations: EvidenceWorkbenchCitation[]
): Map<string, EvidenceWorkbenchCitation[]> {
  const groups = new Map<string, EvidenceWorkbenchCitation[]>();

  for (const citation of citations) {
    groups.set(citation.sourceId, [...(groups.get(citation.sourceId) ?? []), citation]);
  }

  return groups;
}

function buildSourceFilters(sources: EvidenceWorkbenchSource[]): EvidenceWorkbenchSourceFilter[] {
  return [
    sourceFilter("all-sources", "All sources", sources, "Every source inventory record."),
    sourceFilter(
      "cited-in-answer",
      "Cited in answer",
      sources.filter((source) => source.citationCount > 0),
      "Sources connected to citation markers in the draft answer."
    ),
    sourceFilter(
      "current-support",
      "Current support",
      sources.filter(
        (source) =>
          source.trustState === "current_supporting" &&
          source.citationCount > 0 &&
          source.directWarnings.length === 0 &&
          source.relationshipWarnings.length === 0
      ),
      "Current cited sources without active source or citation warnings."
    ),
    sourceFilter(
      "conditional-support",
      "Conditional support",
      sources.filter((source) => source.trustState === "current_conditional_support"),
      "Current sources with a warning on the citation or claim relationship."
    ),
    sourceFilter(
      "stale-blockers",
      "Stale blockers",
      sources.filter((source) => source.trustState === "stale_blocker"),
      "Sources blocked by a stale freshness state."
    ),
    sourceFilter(
      "missing-evidence",
      "Missing evidence",
      sources.filter((source) => source.trustState === "missing_blocker"),
      "Missing-source placeholders required before approval."
    ),
    sourceFilter(
      "uncited-inventory",
      "Uncited inventory",
      sources.filter((source) => source.trustState === "current_uncited"),
      "Source records present in the inventory but not cited by the answer."
    ),
    sourceFilter(
      "needs-owner-action",
      "Needs owner action",
      sources.filter((source) => source.trustState === "stale_blocker" || source.trustState === "missing_blocker"),
      "First source-owner queues for stale or missing evidence."
    )
  ];
}

function sourceFilter(
  id: string,
  label: string,
  sources: EvidenceWorkbenchSource[],
  description: string
): EvidenceWorkbenchSourceFilter {
  return {
    count: sources.length,
    description,
    id,
    label,
    sourceIds: sources.map((source) => source.id)
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
  const dateLabel = source.lastUpdated
    ? `Updated ${source.lastUpdated}`
    : "Missing-source placeholder";

  if (source.expiresAt) {
    return `${formatLabel(source.sourceType)}; ${dateLabel}; expires ${source.expiresAt}`;
  }

  return `${formatLabel(source.sourceType)}; ${dateLabel}`;
}

function sourceStatus(
  source: SourceFixture,
  relationshipWarnings: EvidenceWorkbenchSourceWarning[]
): string {
  if (source.sourceOrigin === "missing_source_placeholder" || source.freshness === "missing") {
    return "Missing evidence";
  }

  if (source.freshness === "stale") {
    return "Stale source";
  }

  if (relationshipWarnings.length > 0) {
    return "Conditional support";
  }

  if (source.citationCount === 0) {
    return "Uncited inventory";
  }

  return "Current support";
}

function sourceTrustState(
  source: SourceFixture,
  relationshipWarnings: EvidenceWorkbenchSourceWarning[]
): string {
  if (source.sourceOrigin === "missing_source_placeholder" || source.freshness === "missing") {
    return "missing_blocker";
  }

  if (source.freshness === "stale") {
    return "stale_blocker";
  }

  if (relationshipWarnings.length > 0) {
    return "current_conditional_support";
  }

  if (source.citationCount === 0) {
    return "current_uncited";
  }

  return "current_supporting";
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values)];
}
