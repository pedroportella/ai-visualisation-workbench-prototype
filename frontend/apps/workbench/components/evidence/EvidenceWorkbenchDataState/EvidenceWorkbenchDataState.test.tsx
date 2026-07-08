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
    expect(html).toContain("<section");
    expect(html).not.toContain("<aside");
    expect(html).toContain('class="evidence-workbench-data-state"');
    expect(html).toContain("Source");
    expect(html).toContain("Local fixture");
    expect(html).toContain("Loaded with page");
    expect(html).toContain("Refresh evidence");
    expect(html).toContain("qhds-button--icon-lead");
    expect(html).toContain("#refresh");
    expect(html).not.toContain("aivis-evidence-status");
    expect(html).not.toContain("qld__tag");
    expect(html).not.toContain("workbench-task-header__server-state");
  });

  it("labels refresh progress on the action and adjacent status text", () => {
    const html = renderToStaticMarkup(
      <EvidenceWorkbenchDataState
        state={{
          errorMessage: null,
          isError: false,
          isRefreshing: true,
          onRefresh: () => undefined,
          refreshLabel: "Refreshed 10:42 am",
          source: "backend"
        }}
      />
    );

    expect(html).toContain('aria-busy="true"');
    expect(html).toContain("disabled");
    expect(html).toContain('role="status"');
    expect(html).toContain("Refreshing evidence");
    expect(html).not.toContain(">Refresh<");
  });
});
