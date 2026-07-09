import type { EvidenceWorkbenchViewModel } from "@aivis/services";

export function summaryMap(data: EvidenceWorkbenchViewModel): Map<string, string> {
  return new Map(data.summary.map((item) => [item.label, item.value]));
}
