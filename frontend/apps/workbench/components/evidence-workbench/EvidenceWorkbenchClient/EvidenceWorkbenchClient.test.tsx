import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { fallbackEvidenceWorkbenchData } from "../../../services/evidence-workbench/fallback-fixture";
import { EVIDENCE_PROCESS_MAP_COLOR_MODE } from "../process/ProcessEvidenceMap";
import { EvidenceWorkbenchClient } from ".";

const componentDirectory = dirname(fileURLToPath(import.meta.url));
const styles = [
  readFileSync(join(componentDirectory, "../evidence-workbench.scss"), "utf8"),
  readFileSync(join(componentDirectory, "EvidenceWorkbenchClient.scss"), "utf8"),
  readFileSync(
    join(componentDirectory, "../process/ProcessWorkspace/ProcessWorkspace.scss"),
    "utf8"
  ),
  readFileSync(
    join(componentDirectory, "../process/ProcessEvidenceMap/ProcessEvidenceMap.scss"),
    "utf8"
  ),
  readFileSync(
    join(componentDirectory, "../warnings/WarningOwnershipSummary/WarningOwnershipSummary.scss"),
    "utf8"
  ),
  readFileSync(
    join(componentDirectory, "../audit/AuditWorkspace/AuditWorkspace.scss"),
    "utf8"
  ),
  readFileSync(
    join(componentDirectory, "../audit/AuditSummary/AuditSummary.scss"),
    "utf8"
  ),
  readFileSync(
    join(componentDirectory, "../audit/AuditResetBoundary/AuditResetBoundary.scss"),
    "utf8"
  ),
  readFileSync(
    join(componentDirectory, "../answer/AnswerMarkdownRenderer/AnswerMarkdownRenderer.scss"),
    "utf8"
  ),
  readFileSync(
    join(componentDirectory, "../EvidenceWorkbenchTaskHeader/EvidenceWorkbenchTaskHeader.scss"),
    "utf8"
  ),
  readFileSync(
    join(componentDirectory, "../overview/OverviewWorkspace/OverviewWorkspace.scss"),
    "utf8"
  ),
  readFileSync(
    join(componentDirectory, "../overview/OverviewTaskLauncher/OverviewTaskLauncher.scss"),
    "utf8"
  ),
  readFileSync(
    join(componentDirectory, "../review/ReviewWorkspace/ReviewWorkspace.scss"),
    "utf8"
  ),
  readFileSync(
    join(componentDirectory, "../review/ReviewDecisionGate/ReviewDecisionGate.scss"),
    "utf8"
  ),
  readFileSync(
    join(componentDirectory, "../review/ReviewBlockerSelector/ReviewBlockerSelector.scss"),
    "utf8"
  ),
  readFileSync(
    join(componentDirectory, "../review/ReviewSupportingEvidence/ReviewSupportingEvidence.scss"),
    "utf8"
  ),
  readFileSync(
    join(componentDirectory, "../review/ReviewClaimsSupport/ReviewClaimsSupport.scss"),
    "utf8"
  ),
  readFileSync(
    join(componentDirectory, "../review/ReviewActionForm/ReviewActionForm.scss"),
    "utf8"
  ),
  readFileSync(
    join(componentDirectory, "../sources/SourcesWorkspace/SourcesWorkspace.scss"),
    "utf8"
  ),
  readFileSync(
    join(componentDirectory, "../sources/SourcesInventory/SourcesInventory.scss"),
    "utf8"
  ),
  readFileSync(
    join(componentDirectory, "../sources/SourcesBlockerTarget/SourcesBlockerTarget.scss"),
    "utf8"
  ),
  readFileSync(
    join(
      componentDirectory,
      "../sources/SourcesSelectedSourceInspector/SourcesSelectedSourceInspector.scss"
    ),
    "utf8"
  ),
  readFileSync(
    join(componentDirectory, "../sources/SourcesScenarioContext/SourcesScenarioContext.scss"),
    "utf8"
  )
].join("\n");

describe("EvidenceWorkbenchClient", () => {
  it("uses the overview route as a compact welcome and task launcher", () => {
    const html = renderToStaticMarkup(
      <EvidenceWorkbenchClient data={fallbackEvidenceWorkbenchData} />
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
    expect(html).toContain(">Review source evidence<");
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
      <EvidenceWorkbenchClient
        activeView="review"
        data={fallbackEvidenceWorkbenchData}
      />
    );
    const headerIndex = html.indexOf("workbench-task-header");
    const decisionRequiredIndex = html.indexOf('id="review-decision-required-title"');
    const decisionIndex = html.indexOf('id="review-take-action-accordion-button"');
    const answerIndex = html.indexOf('id="review-answer-accordion-button"');
    const inspectorIndex = html.indexOf('id="source-inspector-title"');
    const sourceIssueIndex = html.indexOf('id="review-current-blocker-accordion-button"');
    const claimsIndex = html.indexOf('id="claims-title"');
    const supportingEvidenceIndex = html.indexOf('id="review-supporting-evidence-accordion-button"');
    const copyReasonIndex = html.indexOf("Copy stays disabled because");
    const primaryActionIndex = html.indexOf(">Request source update<");
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
    expect(html).toContain("Decision required");
    expect(html).toContain("Start here: decide what must happen before this answer can be copied or approved.");
    expect(html).toContain("This answer cannot be used yet.");
    expect(html).toContain(">Review blocker<");
    expect(html).toContain(">Skip to final action<");
    expect(html).toContain(">Read draft answer<");
    expect(html).toContain('href="#review-current-blocker-accordion-button"');
    expect(html).toContain('aria-controls="review-current-blocker-accordion-panel"');
    expect(html).toContain('href="#review-take-action-accordion-button"');
    expect(html).toContain('aria-controls="review-take-action-accordion-panel"');
    expect(html).toContain('href="#review-answer-accordion-button"');
    expect(html).toContain('aria-controls="review-answer-accordion-panel"');
    expect(html).toContain("evidence-workbench-review-accordion");
    expect(html).toContain("Current blocker");
    expect(html).toContain('id="review-current-blocker-accordion-button"');
    expect(html).toContain('aria-controls="review-current-blocker-accordion-panel"');
    expect(html).toContain('aria-controls="review-current-blocker-accordion-panel" aria-expanded="false"');
    expect(html).toContain('id="review-current-blocker-accordion-panel"');
    expect(html).toContain("Approval blocker");
    expect(html).toContain("Change blocker");
    expect(html).toContain("Draft answer");
    expect(html).toContain('id="review-answer-accordion-button"');
    expect(html).toContain('aria-controls="review-answer-accordion-panel"');
    expect(html).toContain('aria-controls="review-answer-accordion-panel" aria-expanded="false"');
    expect(html).toContain('id="review-answer-accordion-panel"');
    expect(html).toContain("Supporting evidence");
    expect(html).toContain('id="review-supporting-evidence-accordion-button"');
    expect(html).toContain('aria-controls="review-supporting-evidence-accordion-panel"');
    expect(html).toContain('aria-controls="review-supporting-evidence-accordion-panel" aria-expanded="false"');
    expect(html).toContain('id="review-supporting-evidence-accordion-panel"');
    expect(html).toContain("Take action");
    expect(html).toContain('id="review-take-action-accordion-button"');
    expect(html).toContain('aria-controls="review-take-action-accordion-panel"');
    expect(html).toContain('aria-controls="review-take-action-accordion-panel" aria-expanded="false"');
    expect(html).toContain('id="review-take-action-accordion-panel"');
    expect(html).toContain('aria-labelledby="review-take-action-accordion-button"');
    expect(html).toContain("Primary review decision context");
    expect(html).toContain("Recommended action");
    expect(html).toContain("Local feedback");
    expect(html).toContain("WARN-FALLBACK-001: Temporary boarding map needs a freshness check.");
    expect(html).toContain("WARN-FALLBACK-001 on SRC-FALLBACK-002");
    expect(html).toContain("WARN-FALLBACK-002 on SRC-FALLBACK-002");
    expect(html).toContain("WARN-FALLBACK-003 on SRC-FALLBACK-003");
    expect(html).toContain("Target: WARN-FALLBACK-001 on SRC-FALLBACK-002.");
    expect(html).toContain("Local audit details");
    expect(html).toContain('id="review-source-inspector-accordion-button"');
    expect(html).toContain('id="review-claims-accordion-button"');
    expect(html).toContain('id="review-local-audit-accordion-button"');
    expect(html).toContain("Last local action target");
    expect(html).toContain("No local action target recorded.");
    expect(html).toContain("Request source update");
    expect(html).toContain("Mark unsafe to use");
    expect(html).toContain("Decision option");
    expect(html).toContain("Choose one local action path, then record it once.");
    expect(html).toContain("evidence-workbench-review-action-choices");
    const decisionOptionIndex = html.indexOf(">Decision option<");
    const reviewerNoteIndex = html.indexOf(">Reviewer note<", decisionOptionIndex);
    const radioOptionsIndex = html.indexOf(
      'class="qld__control-group qhds-radio-group__options"',
      decisionOptionIndex
    );
    expect(reviewerNoteIndex).toBeGreaterThan(decisionOptionIndex);
    expect(radioOptionsIndex).toBeGreaterThan(reviewerNoteIndex);
    expect(html).toContain('value="ACT-MARK-REVIEWED"');
    expect(html).toContain('data-choice-state="unavailable"');
    expect(html).toContain(">Unavailable<");
    expect(html).toContain("Mark reviewed remains disabled in this fixture");
    expect(html).toContain('data-action-tone="primary"');
    expect(html).toContain('data-copy-state="disabled"');
    expect(html).toContain("evidence-workbench-review-actions__selected-action-button");
    expect(html).toContain("Request source update selected.");
    expect(html).toContain("Copy unavailable");
    expect(html).toContain("Copy approved answer");
    expect(html).not.toContain("Record selected action");
    expect(html).not.toContain('aria-label="Evidence Workbench views"');
    expect(html).not.toContain("evidence-workbench-mobile-nav");
    expect(html).toContain('href="/evidence-workbench/sources#source-SRC-FALLBACK-002"');
    expect(html).not.toContain("qhds-page-header");
    expect(html).not.toContain("qhds-page-header__context");
    expect(headerIndex).toBeGreaterThanOrEqual(0);
    expect(decisionRequiredIndex).toBeGreaterThan(headerIndex);
    expect(sourceIssueIndex).toBeGreaterThan(decisionRequiredIndex);
    expect(answerIndex).toBeGreaterThan(sourceIssueIndex);
    expect(supportingEvidenceIndex).toBeGreaterThan(answerIndex);
    expect(inspectorIndex).toBeGreaterThan(supportingEvidenceIndex);
    expect(claimsIndex).toBeGreaterThan(inspectorIndex);
    expect(decisionIndex).toBeGreaterThan(claimsIndex);
    expect(primaryActionIndex).toBeGreaterThan(decisionIndex);
    expect(copyReasonIndex).toBeGreaterThan(primaryActionIndex);
    expect(html).toContain("evidence-workbench-review-decision-card");
    expect(html).toContain("evidence-workbench-current-blocker");
    expect(html).toContain("evidence-workbench-supporting-evidence");
    expect(html).toContain("qhds-accordion");
    expect(html).toContain("qhds-content-section");
    expect(html).toContain("Source inspector");
    expect(html).toContain("evidence-workbench-review-actions__controls--action-first");
    expect(html).not.toContain("evidence-workbench-review-actions__button-grid");
    expect(html).toContain("selected-claim-sources");
    expect(html).toContain("View full source inventory");
    expect(html).not.toContain("Supporting workspaces");
    expect(html).not.toContain('id="supporting-workspaces-title"');
    expect(html).not.toContain("evidence-workbench-route-card");
    expect(html).not.toContain("Source blocker issues");
    expect(html).not.toContain("evidence-workbench-source-review__issue-table");
    expect(html).not.toContain('id="source-issue-review-title"');
    expect(html).not.toContain('id="answer-title"');
    expect(html).not.toContain('id="supporting-evidence-title"');
    expect(html).not.toContain('id="review-decision-title"');
    expect(html).toContain("qld__card");
    expect(html).toContain("aivis-evidence-claim-card");
    expect(html).toContain("qld__card-list evidence-workbench-claim-stack");
    expect(html).toContain("evidence-workbench-source-inspector__top-warning");
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
    expect(html).toContain("evidence-workbench-summary-card evidence-workbench-summary-card--warning evidence-workbench-review-decision-card");
    expect(html).toContain("evidence-workbench-summary-card__actions evidence-workbench-review-decision-card__actions");
  });

  it("renders the source inventory and context on the sources route", () => {
    const html = renderToStaticMarkup(
      <EvidenceWorkbenchClient
        activeView="sources"
        data={fallbackEvidenceWorkbenchData}
      />
    );
    const sourceInventoryIndex = html.indexOf('id="sources-title-accordion-button"');
    const blockerIndex = html.indexOf('id="source-action-target-accordion-button"');
    const recordDetailsIndex = html.indexOf('id="source-record-details-accordion-button"');
    const scenarioIndex = html.indexOf('id="scenario-accordion-button"');

    expect(html).not.toContain('data-workbench-view="sources"');
    expect(html).toContain(
      '<h1 class="workbench-task-header__heading" id="evidence-workbench-title">Source evidence</h1>'
    );
    expect(html).not.toContain("Review the source records, warning relationships and approval blockers");
    expect(html).toContain('id="sources-title-accordion-button"');
    expect(html).toContain('aria-controls="sources-title-accordion-panel" aria-expanded="true"');
    expect(html).toContain('id="sources-title-accordion-panel"');
    expect(html).toContain('aria-labelledby="sources-title-accordion-button"');
    expect(html).toContain("evidence-workbench-summary-card evidence-workbench-summary-card--warning evidence-workbench-source-summary-card");
    expect(html).toContain("evidence-workbench-source-summary-card");
    expect(html).toContain('aria-labelledby="source-inventory-summary-title"');
    expect(html).toContain("Source trace");
    expect(html).toContain("Source inventory summary");
    expect(html).toContain("Synthetic fixture source set");
    expect(html).toContain("All sources (3)");
    expect(html).toContain("Needs owner action (2)");
    expect(html).not.toContain("aivis-evidence-filter-nav");
    expect(html).toContain("Primary source list ordered with approval blockers first, then selected claim sources, then remaining source records.");
    expect(html).toContain('href="#source-inventory-table"');
    expect(html).toContain('aria-label="Cited in answer: no source records currently match.');
    expect(html).toContain("Open details");
    expect(html).toContain("Source record details");
    expect(html).toContain('id="source-record-details-accordion-button"');
    expect(html).toContain('aria-controls="source-record-details-accordion-panel" aria-expanded="false"');
    expect(html).toContain('hidden="" id="source-record-details-accordion-panel"');
    expect(html).toContain("Blocker action target");
    expect(html).toContain('id="source-action-target-accordion-button"');
    expect(html).toContain('aria-controls="source-action-target-accordion-panel" aria-expanded="false"');
    expect(html).toContain('hidden="" id="source-action-target-accordion-panel"');
    expect(html).toContain("Choose a blocker to inspect");
    expect(html).toContain("Continue to review actions");
    expect(html).toContain('href="/evidence-workbench/review"');
    expect(html).toContain("qld__direction-link");
    expect(html).toContain("evidence-workbench-source-inventory");
    expect(html).toContain('id="source-SRC-FALLBACK-002-accordion-button"');
    expect(html).toContain('aria-controls="source-SRC-FALLBACK-002-accordion-panel" aria-expanded="false"');
    expect(html).toContain('aria-labelledby="source-SRC-FALLBACK-002-accordion-button"');
    expect(html).toContain('hidden="" id="source-SRC-FALLBACK-002-accordion-panel"');
    expect(html).toContain('data-source-expanded-default="false"');
    expect(html).not.toContain("Source blocker issues");
    expect(html).not.toContain("evidence-workbench-source-review__issue-table");
    expect(html).toContain("Scenario context");
    expect(html).toContain('id="scenario-accordion-button"');
    expect(html).toContain('aria-controls="scenario-accordion-panel" aria-expanded="false"');
    expect(html).toContain('hidden="" id="scenario-accordion-panel"');
    expect(html).toContain("Public context anchors");
    expect(html).toContain("aivis-place-context");
    expect(sourceInventoryIndex).toBeGreaterThanOrEqual(0);
    expect(blockerIndex).toBeGreaterThan(sourceInventoryIndex);
    expect(recordDetailsIndex).toBeGreaterThan(blockerIndex);
    expect(scenarioIndex).toBeGreaterThan(recordDetailsIndex);
    expect(html).not.toContain("aivis-evidence-context");
    expect(html).not.toContain('id="answer-title"');
    expect(html).not.toContain('id="process-map-title"');
    expect(html).not.toContain("qld__abstract");
  });

  it("renders the React Flow process map and fallback on the process route", () => {
    const html = renderToStaticMarkup(
      <EvidenceWorkbenchClient
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
    expect(EVIDENCE_PROCESS_MAP_COLOR_MODE).toBe("light");
    expect(html).toContain('class="react-flow light"');
    expect(html).not.toContain('class="react-flow dark"');
    expect(html).not.toContain('class="react-flow system"');
    expect(html).toContain('role="region"');
    expect(html).toContain('aria-describedby="process-map-filter-summary"');
    expect(html).toContain('id="process-selected-node-accordion-button"');
    expect(html).toContain('aria-controls="process-selected-node-accordion-panel"');
    expect(html).toContain('id="process-selected-node-accordion-panel"');
    expect(html).toContain("Text process map");
    expect(html).toContain('id="process-text-map-accordion-button"');
    expect(html).toContain('aria-controls="process-text-map-accordion-panel"');
    expect(html).toContain('id="process-text-map-accordion-panel"');
    expect(html).toContain('id="process-map-text-fallback"');
    expect(html).toContain("Selected graph node");
    expect(html).toContain("Process warning ownership");
    expect(html).toContain('id="process-warning-ownership-accordion-button"');
    expect(html).toContain('aria-controls="process-warning-ownership-accordion-panel"');
    expect(html).toContain('id="process-warning-ownership-accordion-panel"');
    expect(html).toContain("The map explains how the evidence path happened.");
    expect(html).toContain("3 active warnings");
    expect(html).toContain("3 approval blockers");
    expect(html).toContain('href="/evidence-workbench/sources#source-SRC-FALLBACK-002"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('hidden=""');
    expect(html).not.toContain('id="process-supporting-warning-detail-accordion-button"');
    expect(html).toContain("Show details");
    expect(html).toContain("Hide details");
    expect(html).toContain("Full warning messages are supporting evidence here.");
    expect(html).not.toContain("Active fixture warnings");
    expect(html).not.toContain('id="sources-title"');
    expect(html).not.toContain("qld__abstract");
  });

  it("uses the audit route for read-only local action state plus reset", () => {
    const html = renderToStaticMarkup(
      <EvidenceWorkbenchClient
        activeView="audit"
        data={fallbackEvidenceWorkbenchData}
      />
    );

    expect(html).not.toContain('data-workbench-view="audit"');
    expect(html).toContain(
      '<h1 class="workbench-task-header__heading" id="evidence-workbench-title">Audit state</h1>'
    );
    expect(html).not.toContain("Check the current local action state");
    expect(html).not.toContain('id="review-decision-title"');
    expect(html).not.toContain('aria-label="Review actions"');
    expect(html).not.toContain("evidence-workbench-review-actions__button-grid");
    expect(html).not.toContain("Copy approved answer");
    expect(html).toContain("Request source update");
    expect(html).toContain("Mark unsafe to use");
    expect(html).toContain("evidence-workbench-audit-accordion");
    expect(html).toContain("Audit summary");
    expect(html).toContain('id="audit-summary-accordion-button"');
    expect(html).toContain('aria-controls="audit-summary-accordion-panel"');
    expect(html).toContain('aria-controls="audit-summary-accordion-panel" aria-expanded="true"');
    expect(html).toContain('id="audit-summary-accordion-panel"');
    expect(html).toContain('aria-labelledby="audit-summary-accordion-button" class="qld__accordion__body qld__accordion--open qhds-accordion__panel" id="audit-summary-accordion-panel" role="region"');
    expect(html).toContain('tabindex="0"');
    expect(html).toContain("Read-only local state for copy availability");
    expect(html).toContain("evidence-workbench-audit-summary__state");
    expect(html).toContain("Copy remains unavailable");
    expect(html).toContain("Selected source issue");
    expect(html).toContain("Available local actions");
    expect(html).toContain("Action route");
    expect(html).toContain('href="/evidence-workbench/review"');
    expect(html).toContain("Reset boundary");
    expect(html).toContain('id="audit-reset-boundary-accordion-button"');
    expect(html).toContain('aria-controls="audit-reset-boundary-accordion-panel"');
    expect(html).toContain('aria-controls="audit-reset-boundary-accordion-panel" aria-expanded="false"');
    expect(html).toContain('id="audit-reset-boundary-accordion-panel"');
    expect(html).toContain("Reset is the only state-changing control on this route.");
    expect(html).toContain("Audit is read-only local state plus reset.");
    expect(html).toContain("Reset local review state");
    expect(html).toContain("Audit warning ownership");
    expect(html).toContain('id="audit-warning-ownership-accordion-button"');
    expect(html).toContain('aria-controls="audit-warning-ownership-accordion-panel"');
    expect(html).toContain('aria-controls="audit-warning-ownership-accordion-panel" aria-expanded="false"');
    expect(html).toContain('id="audit-warning-ownership-accordion-panel"');
    expect(html).toContain("Audit records local action state.");
    expect(html).toContain("3 active warnings");
    expect(html).toContain("3 approval blockers");
    expect(html).toContain('href="/evidence-workbench/sources#source-SRC-FALLBACK-003"');
    expect(html).toContain('id="audit-supporting-warning-detail-accordion-button"');
    expect(html).toContain('aria-controls="audit-supporting-warning-detail-accordion-panel"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('id="audit-supporting-warning-detail-accordion-panel"');
    expect(html).toContain('hidden=""');
    expect(html).toContain("Supporting warning detail");
    expect(html).toContain("Show details");
    expect(html).toContain("Hide details");
    expect(html).toContain("Full warning messages are supporting evidence here.");
    expect(html).not.toContain('id="audit-reset-boundary-title"');
    expect(html).not.toContain('id="audit-warning-ownership-title"');
    expect(html).not.toContain("Active fixture warnings");
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
    expect(styles).toContain(".evidence-workbench-review-actions__controls--action-first");
    expect(styles).toContain(".evidence-workbench-review-action-choices .qhds-radio__label");
    expect(styles).toContain(".evidence-workbench-review-action-choices > .qhds-form-field .qhds-form-field__label");
    expect(styles).toContain(".evidence-workbench-review-action-choices > .qhds-form-field + .qhds-radio-group__options");
    expect(styles).toContain(".evidence-workbench-review-actions__selected-action");
    expect(styles).toContain(".evidence-workbench-review-actions__copy-state .qhds-button");
    expect(styles).not.toContain("box-shadow: inset 0.25rem 0 0");
    expect(styles).toContain(".evidence-workbench-review-decision-card");
    expect(styles).toContain(".evidence-workbench-source-summary-card");
    expect(styles).toContain(".evidence-workbench-summary-card");
    expect(styles).toContain(".evidence-workbench-summary-card--warning");
    expect(styles).toContain(".evidence-workbench-summary-card__actions");
    expect(styles).toContain(".evidence-workbench-summary-card .aivis-evidence-panel-header");
    expect(styles).toContain(".evidence-workbench-summary-card .aivis-evidence-status.qld__tag");
    expect(styles).toContain(".evidence-workbench-summary-card .aivis-evidence-status--warning.qld__tag");
    expect(styles).toContain("background: var(--qhds-color-surface);");
    expect(styles).toContain("color: var(--aivis-shell-text);");
    expect(styles).toContain("background: var(--aivis-color-warning-background);");
    expect(styles).toContain("border: var(--aivis-border-width-thin) solid var(--aivis-color-warning-border);");
    expect(styles).not.toContain("--qhds-color-warning-background: var(--qhds-palette-feedback-warning-background);");
    expect(styles).not.toContain("--qhds-button-secondary-color: var(--QLD-color-light__link);");
    expect(styles).toContain(".evidence-workbench-source-summary-card__actions");
    expect(styles).toContain(".evidence-workbench-review-accordion .qhds-accordion");
    expect(styles).toContain(".evidence-workbench-sources-accordion .qhds-accordion");
    expect(styles).toContain(".evidence-workbench-sources-accordion__panel");
    expect(styles).toContain(".evidence-workbench-current-blocker");
    expect(styles).toContain(".evidence-workbench-supporting-evidence");
    expect(styles).toContain(".evidence-workbench-supporting-evidence .qhds-accordion");
    expect(styles).toContain(".evidence-workbench-warning-ownership__counts");
    expect(styles).toContain(".evidence-workbench-audit-accordion .qhds-accordion");
    expect(styles).toContain(".evidence-workbench-audit-reset__actions");
    expect(styles).toContain(".evidence-workbench-source-review");
    expect(styles).toContain(".evidence-workbench-source-review-section--decision .evidence-workbench-source-review");
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
    expect(styles).toContain(".evidence-workbench-disclosure:not([open]) > .evidence-workbench-disclosure__content");
    expect(styles).toContain("display: none;");
    expect(styles).toContain(".evidence-workbench-disclosure[open] > .evidence-workbench-disclosure__content");
    expect(styles).toContain("display: grid;");
    expect(styles).toContain(".evidence-workbench-disclosure__summary");
    expect(styles).toContain("box-sizing: border-box;");
    expect(styles).toContain(".evidence-workbench-disclosure__toggle::after");
    expect(styles).toContain(".evidence-workbench-disclosure[open] > summary .evidence-workbench-disclosure__toggle-open");
    expect(styles).toContain(".evidence-workbench-source-records .qhds-accordion");
    expect(styles).toContain(".evidence-workbench-scenario-context .aivis-place-context");
    expect(styles).toContain(".evidence-workbench-source-records .qhds-accordion__button");
    expect(styles).toContain("[id^=\"source-\"][id$=\"-accordion-button\"]");
    expect(styles).toContain("align-self: start;");
    expect(styles).toContain("max-width: 100%;");
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
