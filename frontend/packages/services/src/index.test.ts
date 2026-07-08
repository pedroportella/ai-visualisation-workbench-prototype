import { describe, expect, it } from "vitest";

import { PRIMARY_REVIEW_ACTION_ID } from "./index";
import { fallbackEvidenceWorkbenchData } from "./fixtures";

describe("@aivis/services client-safe workbench exports", () => {
  it("exports bundled Evidence Workbench fallback data and action constants", () => {
    expect(fallbackEvidenceWorkbenchData.fetchState.source).toBe("fallback");
    expect(fallbackEvidenceWorkbenchData.review.availableActionIds).toContain(
      PRIMARY_REVIEW_ACTION_ID
    );
  });
});
