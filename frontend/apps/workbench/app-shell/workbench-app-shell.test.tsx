import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { WorkbenchAppShell } from "./workbench-app-shell";

const styles = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "workbench-app-shell.scss"), "utf8");

describe("WorkbenchAppShell", () => {
  it("renders the QGDS-style header, pre-header, crest lockup and side navigation", () => {
    const html = renderToStaticMarkup(
      <WorkbenchAppShell>
        <section aria-labelledby="evidence-workbench-title">
          <h1 id="evidence-workbench-title">AI Visualisation Workbench</h1>
        </section>
      </WorkbenchAppShell>
    );

    expect(html).toContain("qld__header__pre-header");
    expect(html).toContain("qld.gov.au");
    expect(html).toContain('alt="Queensland Government"');
    expect(html).toContain("ssq-header__qg-logo");
    expect(html).toContain("AI Visualisation Workbench");
    expect(html).toContain("Evidence Workbench");
    expect(html).toContain("qld__left-nav");
    expect(html).toContain("Skip to section navigation");
    expect(html).toContain('id="section-navigation"');
    expect(html).toContain('href="https://www.qld.gov.au/contact-us"');
    expect(html).toContain("Contact us");
    expect(html).not.toContain("Local fixture");
  });

  it("keeps the left-nav content gutter aligned with the government app shell", () => {
    expect(styles).toContain(
      ".aivis-app-shell.ssq-layout--has-left-nav .qld__body--left-nav .ssq-layout__container"
    );
    expect(styles).toContain("padding-left: clamp(3rem, 5vw, 8rem)");
    expect(styles).toContain("padding-right: var(--ssq-space-10)");
  });
});
