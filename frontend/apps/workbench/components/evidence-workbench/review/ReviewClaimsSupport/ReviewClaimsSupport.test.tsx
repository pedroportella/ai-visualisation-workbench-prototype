import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { fallbackEvidenceWorkbenchData } from "../../../../services/evidence-workbench/fallback-fixture";
import { ReviewClaimsSupport } from ".";

describe("ReviewClaimsSupport", () => {
  it("renders selected claim support in the review supporting-evidence panel", () => {
    const html = renderToStaticMarkup(
      <ReviewClaimsSupport
        asPanel
        data={fallbackEvidenceWorkbenchData}
        selectedClaimId="Claim 3"
      />
    );

    expect(html).toContain('id="claims-title"');
    expect(html).toContain("Claims requiring review");
    expect(html).toContain("Selected claim states and evidence posture.");
    expect(html).toContain("qld__card-list evidence-workbench-claim-stack");
    expect(html).toContain('id="claim-Claim 3"');
    expect(html).toContain("Selected claim");
  });
});
