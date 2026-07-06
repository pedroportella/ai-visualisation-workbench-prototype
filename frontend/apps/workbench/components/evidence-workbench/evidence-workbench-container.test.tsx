import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { fallbackEvidenceWorkbenchData } from "../../services/evidence-workbench/fallback-fixture";
import EvidenceWorkbenchContainer from "./evidence-workbench-container";

const styles = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "evidence-workbench.scss"), "utf8");

describe("EvidenceWorkbenchContainer", () => {
  it("uses the overview route as a compact welcome and task launcher", () => {
    const html = renderToStaticMarkup(
      <EvidenceWorkbenchContainer data={fallbackEvidenceWorkbenchData} />
    );
    const headerIndex = html.indexOf("workbench-task-header");
    const overviewIndex = html.indexOf('id="overview-title"');
    const launcherIndex = html.indexOf('id="task-launcher-title"');
    const taskHeader = extractTaskHeader(html);

    expect(html).not.toContain('data-workbench-view="overview"');
    expect(html).not.toContain('class="evidence-workbench"');
    expect(html).not.toContain('class="qld__body qld__body--light evidence-workbench"');
    expect(html).not.toContain('class="qld__body qhds-content-section evidence-workbench-panel');
    expect(html).not.toContain("qld__global-alert");
    expect(html).not.toContain("workbench-view-intro");
    expect(html.match(/<h1\b/g) ?? []).toHaveLength(1);
    expect(html).toContain(
      '<h1 class="workbench-task-header__heading" id="evidence-workbench-title">Evidence Workbench</h1>'
    );
    expect(taskHeader).toContain('aria-label="Review task state"');
    expect(taskHeader).toContain("Needs review");
    expect(taskHeader).toContain('aria-label="3 approval blockers"');
    expect(taskHeader).toContain("3 blockers");
    expect(taskHeader).toContain("Copy Disabled");
    expect(taskHeader).not.toContain("Step-free transfer guidance needs evidence review");
    expect(taskHeader).not.toContain("Bundled fallback");
    expect(html).not.toContain("AIVIS is a simulated evidence workbench");
    expect(html).toContain("Step-free transfer guidance needs evidence review");
    expect(html).toContain("Bundled fallback");
    expect(html).toContain("Current review task");
    expect(html).toContain("The current synthetic case shows the review state");
    expect(html).toContain("Available next actions");
    expect(html).toContain("Request source update");
    expect(html).toContain("Add review note");
    expect(html).toContain("Escalate to source owner");
    expect(html).toContain("Mark unsafe to use");
    expect(html).toContain("Source blockers");
    expect(html).toContain("Temporary boarding map needs a freshness check.");
    expect(html).toContain("Dispatch confirmation is missing.");
    expect(html).toContain("Choose the next task");
    expect(html).toContain('href="/evidence-workbench/review"');
    expect(html).toContain(">Start review<");
    expect(html).toContain(">Review source blockers<");
    expect(html).toContain(">Open evidence map<");
    expect(html).toContain(">View audit state<");
    expect(html).toContain("Local review state is seeded from the loaded fixture.");
    expect(html).not.toContain('aria-label="Evidence Workbench views"');
    expect(html).not.toContain("evidence-workbench-mobile-nav");
    expect(html).toContain('href="/evidence-workbench/sources"');
    expect(html).toContain('href="/evidence-workbench/process"');
    expect(html).toContain('href="/evidence-workbench/audit"');
    expect(html).not.toContain('id="answer-title"');
    expect(html).not.toContain('id="review-decision-title"');
    expect(html).not.toContain('id="source-inspector-title"');
    expect(html).not.toContain("evidence-workbench-generated-diagram");
    expect(html).not.toContain("qld__abstract");
    expect(headerIndex).toBeGreaterThanOrEqual(0);
    expect(overviewIndex).toBeGreaterThan(headerIndex);
    expect(launcherIndex).toBeGreaterThan(overviewIndex);
  });

  it("uses the review route for the compact primary review task", () => {
    const html = renderToStaticMarkup(
      <EvidenceWorkbenchContainer
        activeView="review"
        data={fallbackEvidenceWorkbenchData}
      />
    );
    const headerIndex = html.indexOf("workbench-task-header");
    const decisionIndex = html.indexOf('id="review-decision-title"');
    const answerIndex = html.indexOf('id="answer-title"');
    const inspectorIndex = html.indexOf('id="source-inspector-title"');
    const sourceIssueIndex = html.indexOf('id="source-issue-review-title"');
    const taskHeader = extractTaskHeader(html);

    expect(html).not.toContain('data-workbench-view="review"');
    expect(html).not.toContain("workbench-view-intro");
    expect(html.match(/<h1\b/g) ?? []).toHaveLength(1);
    expect(html).toContain(
      '<h1 class="workbench-task-header__heading" id="evidence-workbench-title">Review answer</h1>'
    );
    expect(taskHeader).toContain("Needs review");
    expect(taskHeader).toContain('aria-label="3 approval blockers"');
    expect(taskHeader).toContain("3 blockers");
    expect(taskHeader).toContain("Copy Disabled");
    expect(taskHeader).not.toContain("Inspect the draft answer");
    expect(taskHeader).not.toContain("Bundled fallback");
    expect(html).toContain("Action and audit flow");
    expect(html).toContain("Source issue review");
    expect(html).toContain("Inspect the blocker that the next local action will target.");
    expect(html).toContain("3 blocker issues");
    expect(html).toContain("Selected source issue");
    expect(html).toContain("WARN-FALLBACK-001: Temporary boarding map needs a freshness check.");
    expect(html).toContain("WARN-FALLBACK-002 on SRC-FALLBACK-002");
    expect(html).toContain("WARN-FALLBACK-003 on SRC-FALLBACK-003");
    expect(html).toContain("Selected for action");
    expect(html).toContain("Target: WARN-FALLBACK-001 on SRC-FALLBACK-002.");
    expect(html).toContain("Last local action target");
    expect(html).toContain("No local action target recorded.");
    expect(html).toContain("Request source update");
    expect(html).toContain("Mark unsafe to use");
    expect(html).toContain("Mark reviewed remains disabled in this fixture");
    expect(html).toContain('disabled="" type="button">Mark reviewed</button>');
    expect(html).toContain("Copy approved answer");
    expect(html).not.toContain('aria-label="Evidence Workbench views"');
    expect(html).not.toContain("evidence-workbench-mobile-nav");
    expect(html).toContain('href="/evidence-workbench/sources#source-SRC-FALLBACK-003"');
    expect(html).not.toContain("qhds-page-header");
    expect(html).not.toContain("qhds-page-header__context");
    expect(headerIndex).toBeGreaterThanOrEqual(0);
    expect(answerIndex).toBeGreaterThan(headerIndex);
    expect(inspectorIndex).toBeGreaterThan(answerIndex);
    expect(sourceIssueIndex).toBeGreaterThan(inspectorIndex);
    expect(decisionIndex).toBeGreaterThan(sourceIssueIndex);
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
    expect(html).toContain("evidence-workbench-selected-claim-warning");
    expect(html).toContain("aivis-evidence-warning-list__item");
    expect(html).not.toContain("qld__callout");
    expect(html).toContain("evidence-workbench-generated-diagram");
    expect(html).toContain("Generated fallback review path");
    expect(html).toContain("Diagram text fallback");
    expect(html).toContain("evidence-workbench-code-block");
    expect(html).not.toContain('id="overview-title"');
    expect(html).not.toContain('id="task-launcher-title"');
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

    expect(html).not.toContain('data-workbench-view="sources"');
    expect(html).toContain(
      '<h1 class="workbench-task-header__heading" id="evidence-workbench-title">Source blockers</h1>'
    );
    expect(html).not.toContain("Review the source records, warning relationships and approval blockers");
    expect(html).toContain('id="sources-title"');
    expect(html).toContain("Compact source inventory");
    expect(html).toContain("Blocker action target");
    expect(html).toContain("Choose a blocker to inspect");
    expect(html).toContain("Continue to review actions");
    expect(html).toContain('href="/evidence-workbench/review"');
    expect(html).toContain("evidence-workbench-source-inventory");
    expect(html).toContain('id="source-SRC-FALLBACK-002"');
    expect(html).toContain('data-source-expanded-default="false"');
    expect(html).toContain("Public context anchors");
    expect(html).not.toContain("qld__body--light aivis-evidence-context");
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

    expect(html).not.toContain('data-workbench-view="process"');
    expect(html).toContain(
      '<h1 class="workbench-task-header__heading" id="evidence-workbench-title">Evidence map</h1>'
    );
    expect(html).not.toContain("Trace the synthetic question, source evidence");
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

    expect(html).not.toContain('data-workbench-view="audit"');
    expect(html).toContain(
      '<h1 class="workbench-task-header__heading" id="evidence-workbench-title">Audit state</h1>'
    );
    expect(html).not.toContain("Check the current local action state");
    expect(html).toContain('id="review-decision-title"');
    expect(html).toContain("Request source update");
    expect(html).toContain("Mark unsafe to use");
    expect(html).toContain("Copy approved answer");
    expect(html).toContain("Audit summary");
    expect(html).toContain('id="audit-summary"');
    expect(html).toContain('tabindex="0"');
    expect(html).toContain("evidence-workbench-audit-summary__state");
    expect(html).toContain("Active fixture warnings");
    expect(html).not.toContain("qld__callout");
    expect(html).not.toContain('id="answer-title"');
    expect(html).not.toContain('id="sources-title"');
    expect(html).not.toContain("qld__abstract");
  });

  it("scopes answer content to a readable tokenized work surface", () => {
    expect(styles).toContain("background: var(--aivis-color-panel-surface);");
    expect(styles).toContain(".aivis-app-shell .qhds-layout__main-section-body .qhds-content-section");
    expect(styles).toContain(".workbench-task-header");
    expect(styles).toContain("border-block-end: var(--aivis-border-width-thin) solid var(--qhds-color-border);");
    expect(styles).toContain(".evidence-workbench-answer-markdown");
    expect(styles).toContain(".evidence-workbench-overview");
    expect(styles).toContain(".evidence-workbench-task-launcher");
    expect(styles).toContain(".evidence-workbench-review-actions");
    expect(styles).toContain(".evidence-workbench-source-review");
    expect(styles).toContain(".evidence-workbench-source-review__selected-summary");
    expect(styles).toContain("@media (max-width: 75rem)");
    expect(styles).not.toContain("evidence-workbench-mobile-nav");
    expect(styles).not.toContain(".evidence-workbench {");
    expect(styles).not.toContain("evidence-workbench-page-intro");
    expect(styles).not.toContain("@media (max-width: 61.9375rem)");
    expect(styles).toContain(".evidence-workbench-process-map__viewport");
    expect(styles).toContain("--xy-background-color: var(--aivis-color-panel-surface);");
    expect(styles).toContain("--xy-controls-button-background-color: var(--aivis-color-card-surface);");
    expect(styles).toContain("background: var(--aivis-color-card-surface);");
    expect(styles).toContain(".evidence-workbench-process-map__handle.react-flow__handle");
    expect(styles).toContain(".evidence-workbench-process-map__fallback:focus-visible");
    expect(styles).toContain(".evidence-workbench-audit-summary:focus-visible");
    expect(styles).toContain("data-node-tone=\"warning\"");
    expect(styles).not.toContain("workbench-view-intro");
    expect(styles).not.toContain("border-left");
    expect(styles).not.toContain("border-inline-start");
    expect(styles).not.toMatch(/#[0-9a-fA-F]{3,8}|rgb\(|rgba\(/);
  });
});

function extractTaskHeader(html: string): string {
  const match = html.match(/<header class="workbench-task-header">[\s\S]*?<\/header>/);

  expect(match).not.toBeNull();

  return match?.[0] ?? "";
}
