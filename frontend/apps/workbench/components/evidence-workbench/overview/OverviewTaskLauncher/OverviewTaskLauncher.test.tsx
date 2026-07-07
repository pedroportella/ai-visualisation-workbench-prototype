import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { OverviewTaskLauncher } from ".";

describe("OverviewTaskLauncher", () => {
  it("renders supporting workspace links without duplicating the primary review route", () => {
    const html = renderToStaticMarkup(<OverviewTaskLauncher />);

    expect(html).toContain('id="supporting-workspaces-title"');
    expect(html).toContain("Supporting workspaces");
    expect(html).toContain("Focused views for source evidence, process trace and local audit state.");
    expect(html).toContain('href="/evidence-workbench/sources"');
    expect(html).toContain('href="/evidence-workbench/process"');
    expect(html).toContain('href="/evidence-workbench/audit"');
    expect(html).not.toContain('href="/evidence-workbench/review"');
  });
});
