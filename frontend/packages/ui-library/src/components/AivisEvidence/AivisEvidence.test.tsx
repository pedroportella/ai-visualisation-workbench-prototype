import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  AivisEvidenceCallout,
  AivisEvidenceClaimCard,
  AivisEvidenceContextAnchors,
  AivisEvidenceFilterNav,
  AivisEvidencePathList,
  AivisEvidenceSourceCard,
  AivisEvidenceWarningGroup
} from "./AivisEvidence";

describe("AivisEvidence adapters", () => {
  it("composes selected claim cards from the government card and tag classes", () => {
    const html = renderToStaticMarkup(
      <AivisEvidenceClaimCard
        claimId="CLAIM-003"
        id="claim-CLAIM-003"
        selected
        selectedLabel="Selected claim"
        status="Missing evidence"
        statusTone="warning"
        text="Dispatch confirmation is not present."
        title="Step-free shuttle guarantee"
      />
    );

    expect(html).toContain("qld__card");
    expect(html).toContain("aivis-evidence-claim-card");
    expect(html).toContain('aria-current="true"');
    expect(html).toContain('data-selected-claim="true"');
    expect(html).toContain("qld__tag");
    expect(html).toContain("aivis-evidence-status--warning");
  });

  it("renders source cards with summary-list metadata and warning callouts", () => {
    const html = renderToStaticMarkup(
      <AivisEvidenceSourceCard
        data-source-filter-state="missing_blocker"
        id="source-SRC-006"
        metadataItems={[
          { description: "Missing", term: "Freshness" },
          { description: "Operations Control", term: "Owner" }
        ]}
        preview="Missing-placeholder preview states that dispatch confirmation is absent."
        selected
        selectedLabel="Selected claim source"
        sourceId="SRC-006"
        status="Missing evidence"
        statusTone="warning"
        title="Day-of-service dispatch confirmation"
      >
        <AivisEvidenceWarningGroup
          label="Direct source warning"
          warnings={[
            {
              id: "WARN-003",
              impact: "The claim needs a missing dispatch confirmation source.",
              message: "Dispatch confirmation is absent.",
              severity: "High approval blocker"
            }
          ]}
        />
      </AivisEvidenceSourceCard>
    );

    expect(html).toContain('data-source-filter-state="missing_blocker"');
    expect(html).toContain("qld__summary-list");
    expect(html).toContain("qld__callout");
    expect(html).toContain("Direct source warning");
    expect(html).toContain("WARN-003");
  });

  it("renders context, path and filter wrappers with local adapter classes", () => {
    const html = renderToStaticMarkup(
      <>
        <AivisEvidenceContextAnchors
          anchorSummary="Place labels only."
          anchors={[
            {
              description: "Context anchor only",
              id: "PCA-001",
              label: "South Brisbane station",
              meta: "Context only"
            }
          ]}
          dateLabel="Planned fixture travel date: 28 June 2026"
          summary="Customer travel question."
        />
        <AivisEvidencePathList
          items={[
            { heading: "Draft answer", summary: "Review the answer." },
            { heading: "Source trace", summary: "Check source blockers." }
          ]}
        />
        <AivisEvidenceFilterNav
          ariaLabel="Source trace filters"
          filters={[
            {
              ariaLabel: "Needs owner action: 2 sources.",
              count: 2,
              href: "#source-SRC-006",
              id: "needs-owner-action",
              label: "Needs owner action"
            }
          ]}
        />
      </>
    );

    expect(html).toContain("aivis-evidence-context");
    expect(html).toContain("Public context anchors");
    expect(html).toContain("aivis-evidence-path-list");
    expect(html).toContain("aivis-evidence-filter-nav");
    expect(html).toContain("qld__btn");
  });

  it("renders callouts with QHDS callout classes", () => {
    const html = renderToStaticMarkup(
      <AivisEvidenceCallout heading="Review note" tone="warning">
        <p>Keep the answer in review.</p>
      </AivisEvidenceCallout>
    );

    expect(html).toContain("qld__callout");
    expect(html).toContain('role="status"');
    expect(html).toContain("Keep the answer in review.");
  });
});
