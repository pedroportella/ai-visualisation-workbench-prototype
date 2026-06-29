"use client";

import { useMemo, useReducer } from "react";
import {
  AivisEvidenceCallout,
  AivisEvidenceClaimCard,
  AivisEvidenceContextAnchors,
  AivisEvidencePanelHeader,
  AivisEvidenceWarningList,
  type AivisEvidenceTone,
  QhdsCol,
  QhdsContentSection,
  QhdsPageAlert,
  QhdsRow
} from "@aivis/ui-library";

import type { EvidenceWorkbenchViewModel } from "../../services/evidence-workbench/types";
import { AnswerMarkdown } from "./answer-markdown";
import { EvidenceProcessMap } from "./evidence-process-map";
import { ReviewDecisionBar } from "./review-decision-bar";
import {
  createInitialReviewDecisionState,
  reviewDecisionReducer
} from "./review-action-state";
import {
  SelectedSourceInspector,
  selectedSourceWarnings
} from "./selected-source-inspector";
import { SourceTracePanel } from "./source-trace-panel";
import { WorkbenchCaseBar } from "./workbench-case-bar";

const mobileSectionLinks = [
  {
    description: "Draft and inspector",
    href: "#answer-title",
    label: "Review"
  },
  {
    description: "Local decisions",
    href: "#review-decision-title",
    label: "Actions"
  },
  {
    description: "Inventory",
    href: "#sources-title",
    label: "Sources"
  },
  {
    description: "Process path",
    href: "#process-map-title",
    label: "Map"
  },
  {
    description: "Local events",
    href: "#audit-summary",
    label: "Audit"
  }
];

export default function EvidenceWorkbenchContainer({
  data
}: Readonly<{ data: EvidenceWorkbenchViewModel }>) {
  const summary = summaryMap(data);
  const initialDecisionState = useMemo(() => createInitialReviewDecisionState(data), [data]);
  const [decisionState, dispatchReviewDecision] = useReducer(
    reviewDecisionReducer,
    initialDecisionState
  );
  const review = decisionState.review;
  const selectedClaim = data.reviewClaims.find(
    (claim) => claim.id === review.selectedClaimId
  );
  const selectedSources = data.sourceItems.filter((source) => source.isSelectedClaimSource);
  const selectedClaimTopWarning = selectedSourceWarnings(selectedSources).find(
    (warning) => warning.blocksApproval
  );

  return (
    <section
      aria-labelledby="evidence-workbench-title"
      className="qld__body qld__body--light evidence-workbench"
    >
      <WorkbenchCaseBar
        blockerCount={review.blockedByWarningIds.length}
        caseTitle={data.context.title}
        dataSource={summary.get("Data source") ?? data.fetchState.source}
        fixtureMode={summary.get("Fixture mode") ?? "Synthetic fixture"}
        generatedAt={data.answer.generatedAt}
        runtimeMode={summary.get("Runtime") ?? "Local fixture"}
        status={review.status}
      />

      {data.fetchState.message ? (
        <QhdsPageAlert heading={data.fetchState.message} tone="warning">
          <p>Review can continue against the fallback fixture state.</p>
        </QhdsPageAlert>
      ) : null}

      <WorkbenchMobileSectionNav />

      <QhdsRow className="evidence-workbench-grid evidence-workbench-primary-frame">
        <QhdsCol lg={7} xl={7}>
          <QhdsContentSection
            className="evidence-workbench-panel"
            heading="Draft answer"
            headingId="answer-title"
            lead={data.answer.summary}
          >
            <AivisEvidencePanelHeader
              label="Draft answer"
              status={data.answer.status}
              statusTone="warning"
            />
            <p className="evidence-workbench-answer-meta">
              Fixture timestamp: {data.answer.generatedAt}
            </p>
            <AnswerMarkdown
              citations={data.citations}
              markdown={data.answer.markdown}
              selectedClaimId={review.selectedClaimId}
            />
            {selectedClaimTopWarning ? (
              <AivisEvidenceCallout
                className="evidence-workbench-selected-claim-warning"
                heading={`${review.selectedClaimId} selected blocker`}
                tone="warning"
              >
                <p>{selectedClaimTopWarning.message}</p>
                <p>
                  <a href="#selected-claim-sources">
                    Review the selected source inspector for linked evidence.
                  </a>
                </p>
              </AivisEvidenceCallout>
            ) : null}
          </QhdsContentSection>
        </QhdsCol>

        <QhdsCol lg={5} xl={5}>
          <QhdsContentSection
            className="evidence-workbench-panel evidence-workbench-source-inspector-section"
            heading="Source inspector"
            headingId="source-inspector-title"
            lead="Focused source evidence for the selected claim."
          >
            <SelectedSourceInspector
              selectedClaim={selectedClaim}
              selectedClaimId={review.selectedClaimId}
              sources={data.sourceItems}
            />
          </QhdsContentSection>
        </QhdsCol>

      </QhdsRow>

      <ReviewDecisionBar
        onApplyAction={(actionId, reviewerNote) =>
          dispatchReviewDecision({
            actionId,
            reviewerNote,
            type: "apply-action"
          })
        }
        onReset={() => dispatchReviewDecision({ type: "reset" })}
        state={decisionState}
      />

      <QhdsContentSection
        className="evidence-workbench-panel evidence-workbench-claims-section"
        heading="Claims requiring review"
        headingId="claims-title"
        lead="Selected claim states and evidence posture."
      >
        <div
          className="evidence-workbench-claim-stack"
          id="selected-claim"
          aria-label="Claims requiring review"
        >
          {data.reviewClaims.map((claim) => (
            <AivisEvidenceClaimCard
              claimId={claim.id}
              id={`claim-${claim.id}`}
              key={claim.id}
              selected={claim.id === review.selectedClaimId}
              selectedLabel="Selected claim"
              status={claim.status}
              statusTone={statusTone(claim.status)}
              text={claim.text}
              title={claim.title}
            />
          ))}
        </div>
      </QhdsContentSection>

      <QhdsRow className="evidence-workbench-grid evidence-workbench-lower-workspace">
        <QhdsCol xs={12}>
          <QhdsContentSection
            className="evidence-workbench-panel evidence-workbench-process-map-section"
            heading="Evidence process map"
            headingId="process-map-title"
            lead="Interactive graph view of the selected evidence gap, warning path and review action."
          >
            <AivisEvidencePanelHeader
              label="React Flow graph"
              status="Local fixture"
            />
            <EvidenceProcessMap graph={data.graph} />
            <aside
              aria-labelledby="audit-summary-title"
              className="evidence-workbench-audit-summary"
              id="audit-summary"
              tabIndex={0}
            >
              <h3 id="audit-summary-title">Audit summary</h3>
              <p className="evidence-workbench-review-note">
                Copy state is {review.copyState}. Approval remains blocked by{" "}
                {review.blockedByWarningIds.join(", ")} with{" "}
                {review.activeWarningCount} active fixture warnings. Audit{" "}
                {decisionState.audit.id} last action is{" "}
                {decisionState.audit.lastReviewActionId ?? "none"}.
              </p>
            </aside>
            <AivisEvidenceWarningList
              ariaLabel="Active fixture warnings"
              warnings={decisionState.warnings.map((warning) => ({
                id: warning.id,
                message: warning.message,
                severity: warning.severity
              }))}
            />
          </QhdsContentSection>
        </QhdsCol>

        <QhdsCol xs={12}>
          <QhdsContentSection
            className="evidence-workbench-panel"
            heading="Source inventory"
            headingId="sources-title"
            lead="Full source inventory, citation relationships and blocker state."
          >
            <AivisEvidencePanelHeader
              label="Source trace"
              status="Synthetic fixture"
            />
            <SourceTracePanel
              filters={data.sourceFilters}
              selectedClaimId={review.selectedClaimId}
              sources={data.sourceItems}
            />
          </QhdsContentSection>
        </QhdsCol>

        <QhdsCol xs={12}>
          <QhdsContentSection
            className="evidence-workbench-panel evidence-workbench-context-section"
            heading={data.context.title}
            headingId="scenario-title"
            lead="Local review case"
          >
            <AivisEvidenceContextAnchors
              anchorSummary="Place labels only; they are not treated as evidence sources."
              anchors={data.context.anchors.map((anchor) => ({
                description: anchor.supportingText,
                id: anchor.id,
                label: anchor.label,
                meta: "Context only"
              }))}
              dateLabel={`Planned fixture travel date: ${data.context.plannedTravelDate}`}
              summary={data.context.question}
            />
          </QhdsContentSection>
        </QhdsCol>
      </QhdsRow>
    </section>
  );
}

function WorkbenchMobileSectionNav() {
  return (
    <nav
      aria-label="Evidence Workbench mobile sections"
      className="evidence-workbench-mobile-nav"
    >
      <ul className="evidence-workbench-mobile-nav__list">
        {mobileSectionLinks.map((link) => (
          <li key={link.href}>
            <a
              aria-label={`Jump to ${link.label.toLowerCase()} section: ${link.description}`}
              className="evidence-workbench-mobile-nav__link"
              href={link.href}
            >
              <span>{link.label}</span>
              <small>{link.description}</small>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function summaryMap(data: EvidenceWorkbenchViewModel): Map<string, string> {
  return new Map(data.summary.map((item) => [item.label, item.value]));
}

function statusTone(status: string): AivisEvidenceTone {
  const isWarning = /missing|stale|weak|partial/i.test(status);

  return isWarning ? "warning" : "success";
}
