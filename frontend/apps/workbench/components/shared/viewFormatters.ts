import type { AivisEvidenceTone } from "@aivis/ui-library";

import type { EvidenceWorkbenchViewModel } from "../../services/evidence-workbench/types";

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
