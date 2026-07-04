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
