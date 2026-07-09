export type AivisStatusTone = "success" | "warning";

export function formatStateLabel(value: string): string {
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function statusTone(status: string): AivisStatusTone {
  const isWarning = /blocked|escalat|missing|needs|partial|review|stale|unsafe|update|weak/i.test(status);

  return isWarning ? "warning" : "success";
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
