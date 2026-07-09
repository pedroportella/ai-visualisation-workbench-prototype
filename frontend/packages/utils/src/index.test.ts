import { describe, expect, it } from "vitest";

import { formatStateLabel, refreshStateLabel, statusTone } from "./index";

describe("Evidence Workbench view formatting", () => {
  it("formats local review state identifiers for reviewer-facing labels", () => {
    expect(formatStateLabel("source_update_requested")).toBe("Source Update Requested");
    expect(formatStateLabel("copy_disabled")).toBe("Copy Disabled");
  });

  it("maps evidence posture wording to AIVIS status tones", () => {
    expect(statusTone("Needs review")).toBe("warning");
    expect(statusTone("Dispatch confirmation missing")).toBe("warning");
    expect(statusTone("Ready to copy")).toBe("success");
  });

  it("formats fixture refresh state without requiring a backend call", () => {
    expect(refreshStateLabel(0, false)).toBe("Loaded with page");
    expect(refreshStateLabel(Date.UTC(2026, 5, 28, 22, 15), true)).toMatch(/^Refreshed /);
  });
});
