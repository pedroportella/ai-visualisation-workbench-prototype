"use client";

import { useMemo, useReducer } from "react";
import {
  AivisEvidenceCallout,
  AivisEvidenceClaimCard,
  AivisEvidenceContextAnchors,
  AivisEvidencePanelHeader,
  AivisEvidenceWarningList,
  type AivisEvidenceTone,
  QhdsCard,
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
  reviewDecisionReducer,
  type ReviewDecisionState
} from "./review-action-state";
import {
  SelectedSourceInspector,
  selectedSourceWarnings
} from "./selected-source-inspector";
import { SourceTracePanel } from "./source-trace-panel";
import { WorkbenchCaseBar } from "./workbench-case-bar";

export type EvidenceWorkbenchView = "decision" | "sources" | "process" | "audit";

const SOURCE_INVENTORY_ROUTE = "/evidence-workbench/sources";
const PROCESS_ROUTE = "/evidence-workbench/process";
const AUDIT_ROUTE = "/evidence-workbench/audit";

const workbenchRouteLinks: Array<{
  description: string;
  href: string;
  label: string;
  view: EvidenceWorkbenchView;
}> = [
  {
    description: "Draft, inspector and local review decision",
    href: "/evidence-workbench",
    label: "Decision",
    view: "decision"
  },
  {
    description: "Full inventory and citation relationships",
    href: SOURCE_INVENTORY_ROUTE,
    label: "Sources",
    view: "sources"
  },
  {
    description: "Graph and text fallback path",
    href: PROCESS_ROUTE,
    label: "Process",
    view: "process"
  },
  {
    description: "Local audit state and warnings",
    href: AUDIT_ROUTE,
    label: "Audit",
    view: "audit"
  }
];

export default function EvidenceWorkbenchContainer({
  activeView = "decision",
  data
}: Readonly<{
  activeView?: EvidenceWorkbenchView;
  data: EvidenceWorkbenchViewModel;
}>) {
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
      data-workbench-view={activeView}
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

      <WorkbenchMobileSectionNav activeView={activeView} />

      {activeView === "decision" ? (
        <>
          <QhdsRow className="evidence-workbench-grid evidence-workbench-primary-frame">
            <QhdsCol lg={7} xl={7}>
              <QhdsContentSection
                className="evidence-workbench-panel"
                heading="Draft answer"
                headingId="answer-title"
                lead={data.answer.summary}
                leadDensity="compact"
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
                  sourceInventoryPath={SOURCE_INVENTORY_ROUTE}
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
                leadDensity="compact"
              >
                <SelectedSourceInspector
                  selectedClaim={selectedClaim}
                  selectedClaimId={review.selectedClaimId}
                  sourceInventoryPath={SOURCE_INVENTORY_ROUTE}
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

          <ClaimsReviewSection data={data} selectedClaimId={review.selectedClaimId} />
          <WorkbenchRouteCards />
        </>
      ) : null}

      {activeView === "sources" ? (
        <QhdsContentSection
          className="evidence-workbench-panel"
          heading="Source inventory"
          headingId="sources-title"
          lead="Full source inventory, citation relationships and blocker state."
          leadDensity="compact"
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
          <ScenarioContextSection data={data} />
        </QhdsContentSection>
      ) : null}

      {activeView === "process" ? (
        <QhdsContentSection
          className="evidence-workbench-panel evidence-workbench-process-map-section"
          heading="Evidence process map"
          headingId="process-map-title"
          lead="Interactive graph view of the selected evidence gap, warning path and review action."
          leadDensity="compact"
        >
          <AivisEvidencePanelHeader
            label="React Flow graph"
            status="Local fixture"
          />
          <EvidenceProcessMap graph={data.graph} />
          <AivisEvidenceWarningList
            ariaLabel="Active fixture warnings"
            warnings={decisionState.warnings.map((warning) => ({
              id: warning.id,
              message: warning.message,
              severity: warning.severity
            }))}
          />
        </QhdsContentSection>
      ) : null}

      {activeView === "audit" ? (
        <>
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
          <AuditSummary decisionState={decisionState} />
          <AivisEvidenceWarningList
            ariaLabel="Active fixture warnings"
            warnings={decisionState.warnings.map((warning) => ({
              id: warning.id,
              message: warning.message,
              severity: warning.severity
            }))}
          />
        </>
      ) : null}
    </section>
  );
}

function WorkbenchMobileSectionNav({
  activeView
}: Readonly<{ activeView: EvidenceWorkbenchView }>) {
  return (
    <nav
      aria-label="Evidence Workbench views"
      className="evidence-workbench-mobile-nav"
    >
      <ul className="evidence-workbench-mobile-nav__list">
        {workbenchRouteLinks.map((link) => (
          <li key={link.href}>
            <a
              aria-current={activeView === link.view ? "page" : undefined}
              aria-label={`Open ${link.label.toLowerCase()} view: ${link.description}`}
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

function ClaimsReviewSection({
  data,
  selectedClaimId
}: Readonly<{
  data: EvidenceWorkbenchViewModel;
  selectedClaimId: string;
}>) {
  return (
    <QhdsContentSection
      className="evidence-workbench-panel evidence-workbench-claims-section"
      heading="Claims requiring review"
      headingId="claims-title"
      lead="Selected claim states and evidence posture."
      leadDensity="compact"
    >
      <ul
        aria-label="Claims requiring review"
        className="qld__card-list evidence-workbench-claim-stack"
        id="selected-claim"
      >
        {data.reviewClaims.map((claim) => (
          <li key={claim.id}>
            <AivisEvidenceClaimCard
              claimId={claim.id}
              id={`claim-${claim.id}`}
              selected={claim.id === selectedClaimId}
              selectedLabel="Selected claim"
              status={claim.status}
              statusTone={statusTone(claim.status)}
              text={claim.text}
              title={claim.title}
            />
          </li>
        ))}
      </ul>
    </QhdsContentSection>
  );
}

function WorkbenchRouteCards() {
  const supportingRoutes = workbenchRouteLinks.filter((link) => link.view !== "decision");

  return (
    <QhdsContentSection
      className="evidence-workbench-panel evidence-workbench-routes-section"
      heading="Supporting workspaces"
      headingId="supporting-workspaces-title"
      lead="Focused views for source evidence, process trace and local audit state."
      leadDensity="compact"
    >
      <ul className="qld__card-list evidence-workbench-route-list">
        {supportingRoutes.map((link) => (
          <li key={link.href}>
            <QhdsCard
              actionMode="single"
              className="evidence-workbench-route-card"
              density="compact"
              heading={link.label}
              headingHref={link.href}
              headingLevel={3}
              variant="workbench"
            >
              <p>{link.description}</p>
            </QhdsCard>
          </li>
        ))}
      </ul>
    </QhdsContentSection>
  );
}

function ScenarioContextSection({
  data
}: Readonly<{ data: EvidenceWorkbenchViewModel }>) {
  return (
    <QhdsContentSection
      className="evidence-workbench-panel evidence-workbench-context-section"
      heading={data.context.title}
      headingId="scenario-title"
      headingLevel={3}
      lead="Local review case"
      leadDensity="compact"
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
  );
}

function AuditSummary({
  decisionState
}: Readonly<{ decisionState: ReviewDecisionState }>) {
  const review = decisionState.review;

  return (
    <QhdsCard
      actionMode="none"
      className="evidence-workbench-audit-summary"
      density="compact"
      heading="Audit summary"
      headingId="audit-summary"
      headingLevel={2}
      tabIndex={0}
      variant="workbench"
    >
      <p className="evidence-workbench-review-note">
        Copy state is {review.copyState}. Approval remains blocked by{" "}
        {review.blockedByWarningIds.join(", ")} with {review.activeWarningCount}{" "}
        active fixture warnings. Audit {decisionState.audit.id} last action is{" "}
        {decisionState.audit.lastReviewActionId ?? "none"}.
      </p>
    </QhdsCard>
  );
}

function summaryMap(data: EvidenceWorkbenchViewModel): Map<string, string> {
  return new Map(data.summary.map((item) => [item.label, item.value]));
}

function statusTone(status: string): AivisEvidenceTone {
  const isWarning = /missing|stale|weak|partial/i.test(status);

  return isWarning ? "warning" : "success";
}
