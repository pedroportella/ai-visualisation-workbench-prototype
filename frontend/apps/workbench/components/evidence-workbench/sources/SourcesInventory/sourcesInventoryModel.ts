import type {
  EvidenceWorkbenchSource,
  EvidenceWorkbenchSourceFilter,
  EvidenceWorkbenchSourceWarning
} from "../../../../services/evidence-workbench/types";

interface SourceIssueSummary {
  description: string;
  label: string;
}

export function warningSeverityLabel(warning: EvidenceWorkbenchSourceWarning): string {
  return `${warning.severity}${warning.blocksApproval ? " approval blocker" : " review note"}`;
}

export function sourceFilterHref(filter: EvidenceWorkbenchSourceFilter): string {
  return filter.sourceIds.length === 1
    ? sourceAccordionHash(filter.sourceIds[0])
    : "#source-inventory-table";
}

export function sourceFilterAriaLabel(filter: EvidenceWorkbenchSourceFilter): string {
  const countLabel = `${filter.count} source${filter.count === 1 ? "" : "s"}`;

  if (filter.sourceIds.length === 1) {
    return `${filter.label}: ${countLabel}. Opens source record ${filter.sourceIds[0]}. ${filter.description}`;
  }

  if (filter.sourceIds.length === 0) {
    return `${filter.label}: no source records currently match. Moves focus to the source inventory table. ${filter.description}`;
  }

  return `${filter.label}: ${countLabel}. Moves focus to the source inventory table for matching records. ${filter.description}`;
}

export function sourceAccordionHash(sourceId: string): string {
  return `#${sourceAccordionButtonId(sourceId)}`;
}

export function sourceAccordionButtonId(sourceId: string): string {
  return `${sourceAccordionItemId(sourceId)}-accordion-button`;
}

export function sourceAccordionItemId(sourceId: string): string {
  return `source-${sourceId}`;
}

export function sourceInventoryOrder(
  sources: EvidenceWorkbenchSource[]
): EvidenceWorkbenchSource[] {
  return sources
    .map((source, index) => ({ index, source }))
    .sort((left, right) => {
      const priorityDelta = sourcePriorityRank(left.source) - sourcePriorityRank(right.source);

      return priorityDelta === 0 ? left.index - right.index : priorityDelta;
    })
    .map(({ source }) => source);
}

export function sourcePriority(source: EvidenceWorkbenchSource): string {
  if (source.isSelectedClaimSource && hasApprovalBlocker(source)) {
    return "selected_blocker";
  }

  if (hasApprovalBlocker(source)) {
    return "approval_blocker";
  }

  if (source.isSelectedClaimSource) {
    return "selected_claim_source";
  }

  if (sourceWarnings(source).length > 0) {
    return "warning";
  }

  if (source.citationCount > 0) {
    return "cited_source";
  }

  return "inventory_source";
}

export function sourceIssueSummary(source: EvidenceWorkbenchSource): SourceIssueSummary {
  const warnings = sourceWarnings(source);
  const approvalBlocker = warnings.find((warning) => warning.blocksApproval);
  const firstWarning = warnings[0];

  if (approvalBlocker) {
    return {
      description: approvalBlocker.message,
      label: `${approvalBlocker.id} blocks approval`
    };
  }

  if (firstWarning) {
    return {
      description: firstWarning.message,
      label: `${warnings.length} review warning${warnings.length === 1 ? "" : "s"}`
    };
  }

  if (source.isSelectedClaimSource) {
    return {
      description: "Linked to the selected answer claim.",
      label: "Selected claim evidence"
    };
  }

  if (source.citationCount === 0) {
    return {
      description: "Available in the source set but not cited by the draft answer.",
      label: "Uncited inventory"
    };
  }

  return {
    description: "No direct source or citation relationship warning.",
    label: "No active issue"
  };
}

export function hasApprovalBlocker(source: EvidenceWorkbenchSource): boolean {
  return sourceWarnings(source).some((warning) => warning.blocksApproval);
}

export function sourceWarnings(
  source: EvidenceWorkbenchSource
): EvidenceWorkbenchSourceWarning[] {
  return [...source.directWarnings, ...source.relationshipWarnings];
}

function sourcePriorityRank(source: EvidenceWorkbenchSource): number {
  const approvalBlocker = hasApprovalBlocker(source);

  if (source.isSelectedClaimSource && approvalBlocker) {
    return 0;
  }

  if (approvalBlocker) {
    return 1;
  }

  if (source.isSelectedClaimSource) {
    return 2;
  }

  if (sourceWarnings(source).length > 0) {
    return 3;
  }

  if (source.citationCount > 0) {
    return 4;
  }

  return 5;
}
