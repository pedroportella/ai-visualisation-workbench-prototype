import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { fallbackEvidenceWorkbenchData } from "../../services/evidence-workbench/fallback-fixture";
import type { EvidenceWorkbenchClaim } from "../../services/evidence-workbench/types";
import { SelectedSourceInspector } from "./selected-source-inspector";

const selectedClaim: EvidenceWorkbenchClaim = {
  id: "CLAIM-003",
  status: "Missing evidence",
  text: "Step-free shuttle wording has only partial fixture support and still needs dispatch confirmation.",
  title: "Step-free shuttle wording",
  warningIds: ["WARN-FALLBACK-002", "WARN-FALLBACK-003"]
};

const sourceItems = fallbackEvidenceWorkbenchData.sourceItems.map((source) =>
  source.id === "SRC-FALLBACK-002"
    ? { ...source, isSelectedClaimSource: true }
    : source
);

describe("SelectedSourceInspector", () => {
  it("renders selected claim, linked sources and stable inventory anchors", () => {
    const html = renderInspector();

    expect(html).toContain('id="selected-claim-sources"');
    expect(html).toContain("CLAIM-003");
    expect(html).toContain("2 linked sources");
    expect(html).toContain('href="#source-SRC-FALLBACK-002"');
    expect(html).toContain('href="#source-SRC-FALLBACK-003"');
    expect(html).toContain('href="#source-inventory"');
    expect(html).toContain("Synthetic wayfinding map extract");
    expect(html).toContain("Dispatch confirmation placeholder");
    expect(html).not.toContain("Synthetic station access notice");
  });

  it("shows source status, owner, freshness and both warning kinds", () => {
    const html = renderInspector();

    expect(html).toContain("Stale source");
    expect(html).toContain("Missing evidence");
    expect(html).toContain("Fallback source set");
    expect(html).toContain("Freshness");
    expect(html).toContain("Direct source warning");
    expect(html).toContain("Citation or claim warning");
    expect(html).toContain("aivis-evidence-warning-list__item");
    expect(html).toContain("WARN-FALLBACK-001");
    expect(html).toContain("WARN-FALLBACK-002");
    expect(html).toContain("WARN-FALLBACK-003");
    expect(html).toContain("approval blocker");
    expect(html).not.toContain("qld__callout");
  });

  it("keeps selected-source warning groups closed by default while preserving the top blocker", () => {
    const html = renderInspector();
    const warningDetails = warningDetailsAttributes(html);

    expect(html).toContain('aria-label="Top selected-source blocker"');
    expect(html).toContain("Top selected-source blocker");
    expect(warningDetails).toHaveLength(2);
    expect(warningDetails.every((attrs) => attrs.includes("evidence-workbench-disclosure"))).toBe(true);
    expect(warningDetails.every((attrs) => !attrs.includes("open"))).toBe(true);
    expect(html).toContain("evidence-workbench-source-inspector__warning-panel");
    expect(html).toContain("evidence-workbench-disclosure__content");
    expect(html).toContain("evidence-workbench-disclosure__summary");
    expect(html).toContain("evidence-workbench-disclosure__toggle");
    expect(html).toContain("Show details");
    expect(html).toContain("Hide details");
  });
});

function renderInspector(): string {
  return renderToStaticMarkup(
    <SelectedSourceInspector
      selectedClaim={selectedClaim}
      selectedClaimId={selectedClaim.id}
      sources={sourceItems}
    />
  );
}

function warningDetailsAttributes(html: string): string[] {
  return Array.from(
    html.matchAll(
      /<details(?<attrs>[^>]*evidence-workbench-source-inspector__warning-details[^>]*)>/g
    )
  ).map((match) => match.groups?.attrs ?? "");
}
