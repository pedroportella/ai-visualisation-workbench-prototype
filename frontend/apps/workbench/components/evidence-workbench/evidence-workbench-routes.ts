export type EvidenceWorkbenchView = "overview" | "review" | "sources" | "process" | "audit";

export const OVERVIEW_ROUTE = "/evidence-workbench";
export const REVIEW_ROUTE = "/evidence-workbench/review";
export const SOURCE_INVENTORY_ROUTE = "/evidence-workbench/sources";
export const PROCESS_ROUTE = "/evidence-workbench/process";
export const AUDIT_ROUTE = "/evidence-workbench/audit";

export const workbenchRouteLinks: Array<{
  description: string;
  href: string;
  label: string;
  view: EvidenceWorkbenchView;
}> = [
  {
    description: "Welcome, case state and task launcher",
    href: OVERVIEW_ROUTE,
    label: "Overview",
    view: "overview"
  },
  {
    description: "Decision path, current blocker and local action",
    href: REVIEW_ROUTE,
    label: "Review",
    view: "review"
  },
  {
    description: "Source records, blockers and citation relationships",
    href: SOURCE_INVENTORY_ROUTE,
    label: "Source evidence",
    view: "sources"
  },
  {
    description: "Graph and text fallback path",
    href: PROCESS_ROUTE,
    label: "Evidence map",
    view: "process"
  },
  {
    description: "Local audit state and warnings",
    href: AUDIT_ROUTE,
    label: "Audit state",
    view: "audit"
  }
];
