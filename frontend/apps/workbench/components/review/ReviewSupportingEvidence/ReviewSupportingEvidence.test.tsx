import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { fallbackEvidenceWorkbenchData } from "../../../services/evidence-workbench/fallback-fixture";
import { ReviewSupportingEvidence } from ".";

describe("ReviewSupportingEvidence", () => {
  it("keeps source inspector and claims support inside the review accordion", () => {
    const html = renderToStaticMarkup(
      <ReviewSupportingEvidence
        data={fallbackEvidenceWorkbenchData}
        selectedClaimId="Claim 3"
      />
    );

    expect(html).toContain("evidence-workbench-supporting-evidence");
    expect(html).toContain('id="review-source-inspector-accordion-button"');
    expect(html).toContain('id="source-inspector-title"');
    expect(html).toContain("Focused source evidence for the selected claim.");
    expect(html).toContain("selected-claim-sources");
    expect(html).toContain('id="review-claims-accordion-button"');
    expect(html).toContain('id="claims-title"');
    expect(html).toContain("qld__card-list evidence-workbench-claim-stack");
  });
});
