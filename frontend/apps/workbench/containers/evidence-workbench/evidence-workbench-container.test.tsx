import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { fallbackEvidenceWorkbenchData } from "../../services/evidence-workbench/fallback-fixture";
import EvidenceWorkbenchContainer from "./evidence-workbench-container";

const styles = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "evidence-workbench.scss"), "utf8");

describe("EvidenceWorkbenchContainer", () => {
  it("uses the decision route for the compact primary review task", () => {
    const html = renderToStaticMarkup(
      <EvidenceWorkbenchContainer data={fallbackEvidenceWorkbenchData} />
    );
    const caseBarIndex = html.indexOf("evidence-workbench-case-bar");
    const mobileNavIndex = html.indexOf("evidence-workbench-mobile-nav");
    const decisionIndex = html.indexOf('id="review-decision-title"');
    const answerIndex = html.indexOf('id="answer-title"');
    const inspectorIndex = html.indexOf('id="source-inspector-title"');

    expect(html).toContain('data-workbench-view="decision"');
    expect(html).toContain('class="qld__body qld__body--light evidence-workbench"');
    expect(html).toContain("evidence-workbench-case-bar");
    expect(html).toContain(
      '<h1 class="evidence-workbench-case-bar__heading" id="evidence-workbench-title">Evidence Workbench</h1>'
    );
    expect(html).toContain("Step-free transfer guidance needs evidence review");
    expect(html).toContain("3 approval blockers");
    expect(html).toContain("Bundled fallback");
    expect(html).toContain("Action and audit flow");
    expect(html).toContain("Request source update");
    expect(html).toContain("Mark unsafe to use");
    expect(html).toContain("Mark reviewed remains disabled in this fixture");
    expect(html).toContain('aria-disabled="true"');
    expect(html).toContain("Copy approved answer");
    expect(html).toContain("Local review state is seeded from the loaded fixture.");
    expect(html).toContain('aria-label="Evidence Workbench views"');
    expect(html).toContain('href="/evidence-workbench/sources"');
    expect(html).toContain('href="/evidence-workbench/process"');
    expect(html).toContain('href="/evidence-workbench/audit"');
    expect(html).toContain('href="/evidence-workbench/sources#source-SRC-FALLBACK-003"');
    expect(html).not.toContain("qhds-page-header");
    expect(html).not.toContain("qhds-page-header__context");
    expect(caseBarIndex).toBeGreaterThanOrEqual(0);
    expect(mobileNavIndex).toBeGreaterThan(caseBarIndex);
    expect(answerIndex).toBeGreaterThan(caseBarIndex);
    expect(inspectorIndex).toBeGreaterThan(answerIndex);
    expect(decisionIndex).toBeGreaterThan(inspectorIndex);
    expect(html).toContain("row evidence-workbench-grid");
    expect(html).toContain("evidence-workbench-primary-frame");
    expect(html).toContain("col-xs-12 col-lg-7 col-xl-7");
    expect(html).toContain("col-xs-12 col-lg-5 col-xl-5");
    expect(html).toContain("qhds-content-section");
    expect(html).toContain("Source inspector");
    expect(html).toContain("selected-claim-sources");
    expect(html).toContain("View full source inventory");
    expect(html).toContain("Supporting workspaces");
    expect(html).toContain("qld__card__action");
    expect(html).toContain("qld__card");
    expect(html).toContain("aivis-evidence-claim-card");
    expect(html).toContain("qld__card-list evidence-workbench-claim-stack");
    expect(html).toContain("qld__table__wrapper");
    expect(html).toContain("qld__callout");
    expect(html).toContain("evidence-workbench-generated-diagram");
    expect(html).toContain("Generated fallback review path");
    expect(html).toContain("Diagram text fallback");
    expect(html).toContain("evidence-workbench-code-block");
    expect(html).not.toContain('id="process-map-title"');
    expect(html).not.toContain('id="sources-title"');
    expect(html).not.toContain('id="audit-summary"');
    expect(html).not.toContain("qld__abstract");
    expect(html).not.toContain("evidence-workbench-panel-wide");
    expect(html).not.toContain("evidence-workbench-claim ");
  });

  it("renders the source inventory and context on the sources route", () => {
    const html = renderToStaticMarkup(
      <EvidenceWorkbenchContainer
        activeView="sources"
        data={fallbackEvidenceWorkbenchData}
      />
    );

    expect(html).toContain('data-workbench-view="sources"');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('id="sources-title"');
    expect(html).toContain("Compact source inventory");
    expect(html).toContain("evidence-workbench-source-inventory");
    expect(html).toContain('id="source-SRC-FALLBACK-002"');
    expect(html).toContain('data-source-expanded-default="false"');
    expect(html).toContain("Public context anchors");
    expect(html).not.toContain('id="answer-title"');
    expect(html).not.toContain('id="process-map-title"');
    expect(html).not.toContain("qld__abstract");
  });

  it("renders the React Flow process map and fallback on the process route", () => {
    const html = renderToStaticMarkup(
      <EvidenceWorkbenchContainer
        activeView="process"
        data={fallbackEvidenceWorkbenchData}
      />
    );

    expect(html).toContain('data-workbench-view="process"');
    expect(html).toContain('id="process-map-title"');
    expect(html).toContain("React Flow graph");
    expect(html).toContain("evidence-workbench-process-map");
    expect(html).toContain('role="region"');
    expect(html).toContain('aria-describedby="process-map-text-fallback"');
    expect(html).toContain("Text process map");
    expect(html).toContain('id="process-map-text-fallback"');
    expect(html).toContain("Selected graph node");
    expect(html).toContain("Active fixture warnings");
    expect(html).not.toContain('id="sources-title"');
    expect(html).not.toContain("qld__abstract");
  });

  it("keeps local review actions and audit state reachable on the audit route", () => {
    const html = renderToStaticMarkup(
      <EvidenceWorkbenchContainer
        activeView="audit"
        data={fallbackEvidenceWorkbenchData}
      />
    );

    expect(html).toContain('data-workbench-view="audit"');
    expect(html).toContain('id="review-decision-title"');
    expect(html).toContain("Request source update");
    expect(html).toContain("Mark unsafe to use");
    expect(html).toContain("Copy approved answer");
    expect(html).toContain("Audit summary");
    expect(html).toContain('id="audit-summary"');
    expect(html).toContain('tabindex="0"');
    expect(html).toContain("Active fixture warnings");
    expect(html).not.toContain('id="answer-title"');
    expect(html).not.toContain('id="sources-title"');
    expect(html).not.toContain("qld__abstract");
  });

  it("scopes answer content to a readable tokenized work surface", () => {
    expect(styles).toContain("background: var(--aivis-color-panel-surface);");
    expect(styles).toContain(".evidence-workbench .qhds-content-section");
    expect(styles).toContain(".evidence-workbench-answer-markdown");
    expect(styles).toContain(".evidence-workbench-review-actions");
    expect(styles).toContain(".evidence-workbench-mobile-nav");
    expect(styles).toContain("@media (max-width: 75rem)");
    expect(styles).toContain("@media (max-width: 61.9375rem)");
    expect(styles).toContain(".evidence-workbench-process-map__viewport");
    expect(styles).toContain(".evidence-workbench-process-map__fallback:focus-visible");
    expect(styles).toContain(".evidence-workbench-audit-summary:focus-visible");
    expect(styles).toContain("data-node-tone=\"warning\"");
    expect(styles).not.toMatch(/#[0-9a-fA-F]{3,8}|rgb\(|rgba\(/);
  });
});
