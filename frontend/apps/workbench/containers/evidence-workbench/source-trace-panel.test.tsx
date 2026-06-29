import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type {
  EvidenceWorkbenchContextAnchor,
  EvidenceWorkbenchSource,
  EvidenceWorkbenchSourceFilter
} from "../../services/evidence-workbench/types";
import { SourceTracePanel } from "./source-trace-panel";

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
  }
];

describe("SourceTracePanel", () => {
  it("renders compact source inventory controls and row content", () => {
    const html = renderPanel();

    expect(html).toContain("Compact source inventory");
    expect(html).toContain("CLAIM-003 is aligned to 2 selected sources.");
    expect(html).toContain("3 sources currently block approval.");
    expect(html).toContain('href="#source-SRC-003"');
    expect(html).toContain('href="#source-SRC-006"');
    expect(html).toContain("All sources");
    expect(html).toContain("Needs owner action");
    expect(html).toContain('aria-label="Needs owner action: 2 sources.');
    expect(html).toContain("Source inventory table");
    expect(html).toContain("qld__table__wrapper");
    expect(html).toContain("evidence-workbench-source-inventory");
    expect(html).toContain("Status");
    expect(html).toContain("Freshness");
    expect(html).toContain("Owner");
    expect(html).toContain("Citations");
    expect(html).toContain("Issue");
    expect(html).toContain("Press Enter to toggle source details.");
    expect(html).toContain("SRC-002");
    expect(html).toContain("Interchange Operations");
    expect(html).toContain("WARN-001 blocks approval");
    expect(html).toContain("Synthetic owner queue");
  });

  it("orders selected blocker sources before other blockers and inventory rows", () => {
    const html = renderPanel();
    const selectedRelationshipBlockerIndex = html.indexOf('id="source-SRC-003"');
    const selectedMissingBlockerIndex = html.indexOf('id="source-SRC-006"');
    const staleBlockerIndex = html.indexOf('id="source-SRC-002"');
    const uncitedInventoryIndex = html.indexOf('id="source-SRC-005"');

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
    const openSourceIds = sourceIdsWithAttribute(html, "open");
    const defaultCollapsedSourceIds = sourceIdsWithAttribute(
      html,
      'data-source-expanded-default="false"'
    );

    expect(openSourceIds).toEqual([]);
    expect(defaultCollapsedSourceIds).toEqual(["SRC-003", "SRC-006", "SRC-002", "SRC-005"]);
    expect(sourceHasAttribute(html, "SRC-003", 'data-source-expanded-default="false"')).toBe(true);
    expect(html).toContain("Press Enter to toggle source details.");
  });

  it("keeps warnings reachable through QHDS callouts without repeated source cards", () => {
    const html = renderPanel();

    expect(html).toContain('data-source-filter-state="stale_blocker"');
    expect(html).toContain('data-source-filter-state="current_conditional_support"');
    expect(html).not.toContain("aivis-evidence-source-card");
    expect(html).not.toContain("aivis-evidence-warning-group");
    expect(html).toContain("qld__callout");
    expect(html).toContain("Warning summary");
    expect(html).toContain("WARN-001");
    expect(html).toContain("WARN-002");
    expect(html).toContain("WARN-003");
    expect(html).toContain("High approval blocker");
  });

  it("preserves source anchors, claim links and public context boundary", () => {
    const html = renderPanel();

    expect(html).toContain('id="source-SRC-003"');
    expect(html).toContain('id="source-SRC-006"');
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
    <SourceTracePanel
      filters={filters}
      selectedClaimId="CLAIM-003"
      sources={sourceItems}
    />
  );
}

function sourceIdsWithAttribute(html: string, attribute: string): string[] {
  return Array.from(html.matchAll(/<details(?<attrs>[^>]*)>/g))
    .filter((match) => match.groups?.attrs.includes(attribute))
    .map((match) => {
      const idMatch = match.groups?.attrs.match(/id="source-([^"]+)"/);

      return idMatch?.[1] ?? "";
    })
    .filter(Boolean);
}

function sourceHasAttribute(html: string, sourceId: string, attribute: string): boolean {
  return Array.from(html.matchAll(/<details(?<attrs>[^>]*)>/g)).some(
    (match) =>
      Boolean(match.groups?.attrs.includes(`id="source-${sourceId}"`)) &&
      Boolean(match.groups?.attrs.includes(attribute))
  );
}
