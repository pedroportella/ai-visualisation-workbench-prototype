import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { QhdsPageAlert } from "./QhdsPageAlert";

const styles = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "QhdsPageAlert.scss"), "utf8");

describe("QhdsPageAlert", () => {
  it("renders a region alert with QGDS anatomy and tone class", () => {
    const html = renderToStaticMarkup(
      <QhdsPageAlert heading="Saved" tone="success">
        <p>Your draft was saved.</p>
      </QhdsPageAlert>
    );

    expect(html).toContain('role="region"');
    expect(html).toContain('aria-label="Saved"');
    expect(html).toContain("qld__page-alerts");
    expect(html).toContain("qld__page-alerts--svg");
    expect(html).toContain("qld__page-alerts--success");
    expect(html).toContain("qld__page-alerts__icon");
    expect(html).toContain("qld__page-alerts--heading");
    expect(html).toContain("qhds-page-alert--success");
    expect(html).toContain("Saved");
    expect(html).toContain("Your draft was saved.");
  });

  it("pins the QGDS in-page alert surface anatomy", () => {
    expect(styles).toContain("--qhds-page-alert-strip-width: 2.5rem");
    expect(styles).toContain("border-left-width: var(--qhds-page-alert-strip-width)");
    expect(styles).toContain("position: relative");
    expect(styles).toContain("max-width: 48rem");
    expect(styles).toContain("--qhds-page-alert-text: var(--qhds-color-success-text)");
    expect(styles).toContain("--qhds-page-alert-text: var(--qhds-color-warning-text)");
  });
});
