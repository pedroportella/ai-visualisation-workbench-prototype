import type { AivisEvidenceTone } from "@aivis/ui-library";

import type { EvidenceWorkbenchViewModel } from "@aivis/services";

export function summaryMap(data: EvidenceWorkbenchViewModel): Map<string, string> {
  return new Map(data.summary.map((item) => [item.label, item.value]));
}

export function statusTone(status: string): AivisEvidenceTone {
  const isWarning = /blocked|escalat|missing|needs|partial|review|stale|unsafe|update|weak/i.test(status);

  return isWarning ? "warning" : "success";
}

export function formatStateLabel(value: string): string {
  return value
    .split("_")
    .filter(Boolean)
    .map((word) => `${word[0]?.toUpperCase() ?? ""}${word.slice(1)}`)
    .join(" ");
}

export function refreshStateLabel(dataUpdatedAt: number, isFetchedAfterMount: boolean): string {
  if (!isFetchedAfterMount || dataUpdatedAt === 0) {
    return "Loaded with page";
  }

  return `Refreshed ${new Intl.DateTimeFormat("en-AU", {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(dataUpdatedAt))}`;
}
