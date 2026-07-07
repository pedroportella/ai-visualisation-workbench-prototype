import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type {
  EvidenceWorkbenchContextAnchor,
  EvidenceWorkbenchSource,
  EvidenceWorkbenchSourceFilter
} from "../../services/evidence-workbench/types";
import { SourceRecordDetails, SourceTracePanel } from "./source-trace-panel";

const contextAnchors: EvidenceWorkbenchContextAnchor[] = [
  {
    evidenceUseProhibited: true,
    id: "PCA-002",
    kind: "Station",
    label: "South Brisbane station",
    supportingText: "Context anchor only"
  },
  {
    evidenceUseProhibited: true,
    id: "PCA-004",
    kind: "Hospital",
    label: "Princess Alexandra Hospital",
    supportingText: "Context anchor only"
  }
];

const sourceItems: EvidenceWorkbenchSource[] = [
  {
    citationCount: 1,
    citations: [
      {
        claimId: "CLAIM-002",
        excerptId: "SRC-002-EXCERPT-001",
        id: "CIT-002-A",
        marker: "[CIT-002-A]",
        relationship: "Supports With Warning",
        status: "Stale",
        warningIds: ["WARN-001"]
      }
    ],
    contextAnchors: [contextAnchors[0]],
    directWarnings: [
      {
        blocksApproval: true,
        code: "Source Stale",
        evidenceImpact: "Boarding point advice depends on an expired synthetic source.",
        id: "WARN-001",
        message: "Temporary boarding map is past its review date.",
        severity: "High"
      }
    ],
    excerptIds: ["SRC-002-EXCERPT-001"],
    expiresAt: "2026-06-20",
    freshness: "Stale",
    id: "SRC-002",
    isClaimSupportingEvidence: true,
    isSelectedClaimSource: false,
    lastUpdated: "2026-05-10",
    meta: "Wayfinding Map; Updated 2026-05-10; expires 2026-06-20",
    ownerLabel: "Interchange Operations",
    preview: "Fixture map places a temporary boarding marker on Grey Street near QPAC.",
    relationshipWarnings: [],
    reviewOwnerQueue: "interchange-operations-source-update",
    sourceOrigin: "synthetic_fixture",
    sourceType: "Wayfinding Map",
    status: "Stale source",
    title: "South Bank Temporary Shuttle Boarding Map",
    trustState: "stale_blocker"
  },
  {
    citationCount: 1,
    citations: [
      {
        claimId: "CLAIM-003",
        excerptId: "SRC-003-EXCERPT-001",
        id: "CIT-003-A",
        marker: "[CIT-003-A]",
        relationship: "Partial Support",
        status: "Conditional",
        warningIds: ["WARN-002"]
      }
    ],
    contextAnchors: [],
    directWarnings: [],
    excerptIds: ["SRC-003-EXCERPT-001"],
    expiresAt: null,
    freshness: "Current",
    id: "SRC-003",
    isClaimSupportingEvidence: true,
    isSelectedClaimSource: true,
    lastUpdated: "2026-06-01",
    meta: "Operations Guidance; Updated 2026-06-01",
    ownerLabel: "Fleet Scheduling",
    preview: "Fixture guidance keeps allocation wording conditional.",
    relationshipWarnings: [
      {
        blocksApproval: true,
        code: "Claim Weak Support",
        evidenceImpact: "Accessible vehicle guidance supports cautious planning language.",
        id: "WARN-002",
        message: "Step-free shuttle wording is stronger than the evidence.",
        severity: "High"
      }
    ],
    reviewOwnerQueue: "fleet-scheduling-guidance-review",
    sourceOrigin: "synthetic_fixture",
    sourceType: "Operations Guidance",
    status: "Conditional support",
    title: "Accessible Vehicle Allocation Guidance For Planned Shuttles",
    trustState: "current_conditional_support"
  },
  {
    citationCount: 1,
    citations: [
      {
        claimId: "CLAIM-003",
        excerptId: "SRC-006-EXCERPT-MISSING",
        id: "CIT-003-B",
        marker: "[CIT-003-B]",
        relationship: "Missing Evidence",
        status: "Not Available",
        warningIds: ["WARN-003"]
      }
    ],
    contextAnchors: [],
    directWarnings: [
      {
        blocksApproval: true,
        code: "Missing Source",
        evidenceImpact: "The step-free shuttle claim needs a missing dispatch confirmation source.",
        id: "WARN-003",
        message: "Dispatch confirmation needed for the specific travel time is not present.",
        severity: "High"
      }
    ],
    excerptIds: ["SRC-006-EXCERPT-MISSING"],
    expiresAt: null,
    freshness: "Missing",
    id: "SRC-006",
    isClaimSupportingEvidence: false,
    isSelectedClaimSource: true,
    lastUpdated: null,
    meta: "Missing Source Placeholder; Missing-source placeholder",
    ownerLabel: "Operations Control",
    preview: "Missing-placeholder preview states that dispatch confirmation is absent.",
    relationshipWarnings: [],
    reviewOwnerQueue: "operations-control-dispatch-confirmation",
    sourceOrigin: "missing_source_placeholder",
    sourceType: "Missing Source Placeholder",
    status: "Missing evidence",
    title: "Day-Of-Service Shuttle Dispatch Confirmation",
    trustState: "missing_blocker"
  },
  {
    citationCount: 0,
    citations: [],
    contextAnchors: [contextAnchors[1]],
    directWarnings: [],
    excerptIds: ["SRC-005-EXCERPT-001"],
    expiresAt: null,
    freshness: "Current",
    id: "SRC-005",
    isClaimSupportingEvidence: true,
    isSelectedClaimSource: false,
    lastUpdated: "2026-03-30",
    meta: "Service Note; Updated 2026-03-30",
    ownerLabel: "Revenue Support",
    preview: "Fixture note is present but not relied on by the answer fixture.",
    relationshipWarnings: [],
    reviewOwnerQueue: "revenue-support-transfer-note-review",
    sourceOrigin: "synthetic_fixture",
    sourceType: "Service Note",
    status: "Uncited inventory",
    title: "Hospital Precinct Transfer Handling Note",
    trustState: "current_uncited"
  }
];

const filters: EvidenceWorkbenchSourceFilter[] = [
  {
    count: 4,
    description: "Every source inventory record.",
    id: "all-sources",
    label: "All sources",
    sourceIds: ["SRC-002", "SRC-003", "SRC-006", "SRC-005"]
  },
  {
    count: 2,
    description: "First source-owner queues for stale or missing evidence.",
    id: "needs-owner-action",
    label: "Needs owner action",
    sourceIds: ["SRC-002", "SRC-006"]
  },
  {
    count: 1,
    description: "The selected claim source currently under review.",
    id: "selected-claim-source",
    label: "Selected claim source",
    sourceIds: ["SRC-003"]
  },
  {
    count: 0,
    description: "No source records currently match this fixture group.",
    id: "no-current-match",
    label: "No current match",
    sourceIds: []
  }
];

describe("SourceTracePanel", () => {
  it("renders compact source inventory controls and row content", () => {
    const html = renderPanel();

    expect(html).toContain("evidence-workbench-summary-card evidence-workbench-summary-card--warning evidence-workbench-source-summary-card");
    expect(html).toContain("evidence-workbench-summary-card__actions evidence-workbench-source-summary-card__actions");
    expect(html).toContain("evidence-workbench-source-summary-card");
    expect(html).toContain('aria-labelledby="source-inventory-summary-title"');
    expect(html).toContain("Source inventory summary");
    expect(html).toContain("Source trace");
    expect(html).toContain("3 source blockers");
    expect(html).toContain("Synthetic fixture source set");
    expect(html).toContain("4 source records");
    expect(html).toContain("CLAIM-003 is aligned to 2 selected sources;");
    expect(html).toContain("3 sources currently block approval.");
    expect(html).toContain("All sources");
    expect(html).toContain("All sources (4)");
    expect(html).toContain("Needs owner action");
    expect(html).toContain("Needs owner action (2)");
    expect(html).toContain('aria-label="Needs owner action: 2 sources. Moves focus to the source inventory table');
    expect(html).toContain('aria-label="Selected claim source: 1 source. Opens source record SRC-003.');
    expect(html).toContain('aria-label="No current match: no source records currently match.');
    expect(html).toContain("No current match (0)");
    expect(html).toContain('href="#source-inventory-table"');
    expect(html).not.toContain("aivis-evidence-filter-nav");
    expect(html).toContain("Source inventory table");
    expect(html).toContain("Primary source list ordered with approval blockers first, then selected claim sources, then remaining source records.");
    expect(html).toContain("qld__table__wrapper");
    expect(html).toContain("evidence-workbench-source-inventory");
    expect(html).toContain("Status");
    expect(html).toContain("Freshness");
    expect(html).toContain("Owner");
    expect(html).toContain("Citations");
    expect(html).toContain("Issue");
    expect(html).toContain("Details");
    expect(html).toContain('aria-label="Open details for SRC-003: Accessible Vehicle Allocation Guidance For Planned Shuttles"');
    expect(html).toContain('href="#source-SRC-003-accordion-button"');
    expect(html).toContain('href="#source-SRC-006-accordion-button"');
    expect(html).toContain("Source record details");
    expect(html).toContain("Record details");
    expect(html).toContain("Show details");
    expect(html).toContain("Hide details");
    expect(html).toContain("SRC-002");
    expect(html).toContain("Interchange Operations");
    expect(html).toContain("WARN-001 blocks approval");
    expect(html).toContain("Source title:");
    expect(html).toContain("Synthetic owner queue");
  });

  it("orders selected blocker sources before other blockers and inventory rows", () => {
    const html = renderPanel();
    const selectedRelationshipBlockerIndex = html.indexOf('id="source-SRC-003-accordion-button"');
    const selectedMissingBlockerIndex = html.indexOf('id="source-SRC-006-accordion-button"');
    const staleBlockerIndex = html.indexOf('id="source-SRC-002-accordion-button"');
    const uncitedInventoryIndex = html.indexOf('id="source-SRC-005-accordion-button"');

    expect(selectedRelationshipBlockerIndex).toBeGreaterThanOrEqual(0);
    expect(selectedMissingBlockerIndex).toBeGreaterThan(selectedRelationshipBlockerIndex);
    expect(staleBlockerIndex).toBeGreaterThan(selectedMissingBlockerIndex);
    expect(uncitedInventoryIndex).toBeGreaterThan(staleBlockerIndex);
    expect(html).toContain('data-source-priority="selected_blocker"');
    expect(html).toContain('data-source-priority="approval_blocker"');
    expect(html).toContain('data-source-priority="inventory_source"');
  });

  it("keeps source summaries collapsed by default and toggleable", () => {
    const html = renderPanel();
    const openSourceIds = sourceIdsWithButtonExpanded(html, "true");
    const defaultCollapsedSourceIds = sourceIdsWithButtonExpanded(html, "false");

    expect(openSourceIds).toEqual([]);
    expect(defaultCollapsedSourceIds).toEqual(["SRC-003", "SRC-006", "SRC-002", "SRC-005"]);
    expect(sourceHasPanelAttribute(html, "SRC-003", 'data-source-expanded-default="false"')).toBe(true);
    expect(html).toContain("qhds-accordion");
    expect(html).toContain('aria-controls="source-SRC-003-accordion-panel" aria-expanded="false"');
    expect(html).toContain('aria-labelledby="source-SRC-003-accordion-button"');
    expect(html).toContain('hidden="" id="source-SRC-003-accordion-panel"');
    expect(html).toContain("evidence-workbench-source-inventory__detail-panel");
    expect(html).toContain("evidence-workbench-source-inventory__summary");
    expect(html).not.toContain("<details");
    expect(html).toContain("Show details");
    expect(html).toContain("Hide details");
    expect(html).not.toContain("Press Enter to toggle source details.");
  });

  it("keeps warnings reachable through issue summaries without repeated source cards", () => {
    const html = renderPanel();

    expect(html).toContain('data-source-filter-state="stale_blocker"');
    expect(html).toContain('data-source-filter-state="current_conditional_support"');
    expect(html).not.toContain("aivis-evidence-source-card");
    expect(html).not.toContain("aivis-evidence-warning-group");
    expect(html).not.toContain("qld__callout");
    expect(html).toContain("evidence-workbench-source-inventory__warning-row");
    expect(html).toContain("Evidence impact");
    expect(html).toContain("SRC-002");
    expect(html).toContain("Warning summary");
    expect(html).toContain("WARN-001");
    expect(html).toContain("WARN-002");
    expect(html).toContain("WARN-003");
    expect(html).toContain("High approval blocker");
  });

  it("preserves source anchors, claim links and public context boundary", () => {
    const html = renderPanel();

    expect(html).toContain('id="source-SRC-003-accordion-button"');
    expect(html).toContain('id="source-SRC-006-accordion-button"');
    expect(html).toContain('href="#claim-CLAIM-003"');
    expect(html).toContain('href="#claim-CLAIM-002"');
    expect(html).toContain("aivis-evidence-anchor-chip-list");
    expect(html).toContain("South Brisbane station");
    expect(html).toContain("Princess Alexandra Hospital");
    expect(html).toContain("Context only");
    expect(html).toContain("Present in the inventory, not cited by this answer.");
    expect(html).not.toContain("PCA-004");
  });
});

function renderPanel(): string {
  return renderToStaticMarkup(
    <>
      <SourceTracePanel
        filters={filters}
        selectedClaimId="CLAIM-003"
        sources={sourceItems}
      />
      <section aria-labelledby="source-record-details-title">
        <h2 id="source-record-details-title">Source record details</h2>
        <SourceRecordDetails sources={sourceItems} />
      </section>
    </>
  );
}

function sourceIdsWithButtonExpanded(html: string, expanded: "false" | "true"): string[] {
  return Array.from(html.matchAll(/<button(?<attrs>[^>]*)>/g))
    .filter((match) =>
      Boolean(match.groups?.attrs.includes(`aria-expanded="${expanded}"`)) &&
      Boolean(match.groups?.attrs.includes("-accordion-button"))
    )
    .map((match) => {
      const idMatch = match.groups?.attrs.match(/id="source-(.+?)-accordion-button"/);

      return idMatch?.[1] ?? "";
    })
    .filter(Boolean);
}

function sourceHasPanelAttribute(html: string, sourceId: string, attribute: string): boolean {
  return Array.from(html.matchAll(/<div(?<attrs>[^>]*)>/g)).some(
    (match) =>
      Boolean(match.groups?.attrs.includes(`data-source-row-order=`)) &&
      Boolean(html.includes(`id="source-${sourceId}-accordion-panel"`)) &&
      Boolean(match.groups?.attrs.includes(attribute))
  );
}
