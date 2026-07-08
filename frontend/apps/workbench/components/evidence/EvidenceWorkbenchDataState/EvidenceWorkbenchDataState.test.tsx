import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { EvidenceWorkbenchDataState } from ".";

describe("EvidenceWorkbenchDataState", () => {
  it("renders compact evidence data controls as a page-level region", () => {
    const html = renderToStaticMarkup(
      <EvidenceWorkbenchDataState
        state={{
          errorMessage: null,
          isError: false,
          isRefreshing: false,
          onRefresh: () => undefined,
          refreshLabel: "Loaded with page",
          source: "fallback"
        }}
      />
    );

    expect(html).toContain('aria-label="Evidence data state"');
    expect(html).toContain('class="evidence-workbench-data-state"');
    expect(html).toContain("Local fixture");
    expect(html).toContain("Loaded with page");
    expect(html).toContain(">Refresh<");
    expect(html).not.toContain("workbench-task-header__server-state");
  });
});
