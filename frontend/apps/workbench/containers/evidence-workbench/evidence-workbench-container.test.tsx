import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { fallbackEvidenceWorkbenchData } from "../../services/evidence-workbench/fallback-fixture";
import EvidenceWorkbenchContainer from "./evidence-workbench-container";

const styles = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "evidence-workbench.scss"), "utf8");

describe("EvidenceWorkbenchContainer", () => {
  it("uses a compact case bar and government web-app content-section grid", () => {
    const html = renderToStaticMarkup(
      <EvidenceWorkbenchContainer data={fallbackEvidenceWorkbenchData} />
    );
    const caseBarIndex = html.indexOf("evidence-workbench-case-bar");
    const answerIndex = html.indexOf('id="answer-title"');
    const inspectorIndex = html.indexOf('id="source-inspector-title"');
    const processMapIndex = html.indexOf('id="process-map-title"');
    const inventoryIndex = html.indexOf('id="sources-title"');
    const scenarioIndex = html.indexOf('id="scenario-title"');

    expect(html).toContain('class="qld__body qld__body--light evidence-workbench"');
    expect(html).toContain("evidence-workbench-case-bar");
    expect(html).toContain(
      '<h1 class="evidence-workbench-case-bar__heading" id="evidence-workbench-title">Evidence Workbench</h1>'
    );
    expect(html).toContain("Step-free transfer guidance needs evidence review");
    expect(html).toContain("3 approval blockers");
    expect(html).toContain("Bundled fallback");
    expect(html).not.toContain("qhds-page-header");
    expect(html).not.toContain("qhds-page-header__context");
    expect(caseBarIndex).toBeGreaterThanOrEqual(0);
    expect(answerIndex).toBeGreaterThan(caseBarIndex);
    expect(inspectorIndex).toBeGreaterThan(answerIndex);
    expect(processMapIndex).toBeGreaterThan(inspectorIndex);
    expect(inventoryIndex).toBeGreaterThan(processMapIndex);
    expect(scenarioIndex).toBeGreaterThan(inventoryIndex);
    expect(html).toContain("row evidence-workbench-grid");
    expect(html).toContain("evidence-workbench-primary-frame");
    expect(html).toContain("col-xs-12 col-lg-7 col-xl-7");
    expect(html).toContain("col-xs-12 col-lg-5 col-xl-5");
    expect(html).toContain("qhds-content-section");
    expect(html).toContain("Source inspector");
    expect(html).toContain("Evidence process map");
    expect(html).toContain("React Flow graph");
    expect(html).toContain("evidence-workbench-process-map");
    expect(html).toContain("Text process map");
    expect(html).toContain("selected-claim-sources");
    expect(html).toContain("View full source inventory");
    expect(html).toContain("qld__card");
    expect(html).toContain("aivis-evidence-claim-card");
    expect(html).toContain("qld__table__wrapper");
    expect(html).toContain("qld__callout");
    expect(html).not.toContain("evidence-workbench-panel-wide");
    expect(html).not.toContain("evidence-workbench-claim ");
  });

  it("scopes answer content to a readable tokenized work surface", () => {
    expect(styles).toContain("background: var(--aivis-color-panel-surface);");
    expect(styles).toContain(".evidence-workbench .qhds-content-section");
    expect(styles).toContain(".evidence-workbench-answer-markdown");
    expect(styles).toContain(".evidence-workbench-process-map__viewport");
    expect(styles).toContain("data-node-tone=\"warning\"");
    expect(styles).not.toMatch(/#[0-9a-fA-F]{3,8}|rgb\(|rgba\(/);
  });
});
