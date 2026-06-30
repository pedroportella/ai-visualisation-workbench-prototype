"use client";

import { useMemo, useReducer } from "react";
import {
  AivisEvidenceCallout,
  AivisEvidenceClaimCard,
  AivisEvidenceContextAnchors,
  AivisEvidencePanelHeader,
  AivisEvidenceStatus,
  AivisEvidenceWarningList,
  type AivisEvidenceTone,
  QhdsButton,
  QhdsCard,
  QhdsCol,
  QhdsContentSection,
  QhdsRow,
  QhdsSummaryList
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

export type EvidenceWorkbenchView = "overview" | "review" | "sources" | "process" | "audit";

const OVERVIEW_ROUTE = "/evidence-workbench";
const REVIEW_ROUTE = "/evidence-workbench/review";
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
    description: "Welcome, case state and task launcher",
    href: OVERVIEW_ROUTE,
    label: "Overview",
    view: "overview"
  },
  {
    description: "Draft answer, inspector and local actions",
    href: REVIEW_ROUTE,
    label: "Review",
    view: "review"
  },
  {
    description: "Blockers and citation relationships",
    href: SOURCE_INVENTORY_ROUTE,
    label: "Source blockers",
    view: "sources"
  },
  {
    description: "Graph and text fallback path",
    href: PROCESS_ROUTE,
    label: "Evidence map",
    view: "process"
  },
  {
    description: "Local audit state and warnings",
    href: AUDIT_ROUTE,
    label: "Audit state",
    view: "audit"
  }
];

export default function EvidenceWorkbenchContainer({
  activeView = "overview",
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
      <WorkbenchViewIntro activeView={activeView} data={data} review={review} />

      <WorkbenchMobileSectionNav activeView={activeView} />

      {activeView === "overview" ? (
        <WorkbenchOverview
          data={data}
          decisionState={decisionState}
          summary={summary}
        />
      ) : null}

      {activeView === "review" ? (
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

function WorkbenchViewIntro({
  activeView,
  data,
  review
}: Readonly<{
  activeView: EvidenceWorkbenchView;
  data: EvidenceWorkbenchViewModel;
  review: EvidenceWorkbenchViewModel["review"];
}>) {
  const intro = {
    audit: {
      description:
        "Check the current local action state, copy availability and fixture audit trail.",
      title: "Audit state"
    },
    overview: {
      description:
        "AIVIS is a simulated evidence workbench for reviewing source-backed AI guidance before it is used.",
      title: "Evidence Workbench"
    },
    process: {
      description:
        "Trace the synthetic question, source evidence, selected claim and review action path.",
      title: "Evidence map"
    },
    review: {
      description:
        "Inspect the draft answer, selected source issue and local review actions for the current synthetic case.",
      title: "Review answer"
    },
    sources: {
      description:
        "Review the source records, warning relationships and approval blockers for the current answer.",
      title: "Source blockers"
    }
  } satisfies Record<EvidenceWorkbenchView, { description: string; title: string }>;
  const routeIntro = intro[activeView];
  const blockerCount = review.blockedByWarningIds.length;

  return (
    <header className="evidence-workbench-page-intro">
      <p className="evidence-workbench-page-intro__label">{data.context.title}</p>
      <h1 className="evidence-workbench-page-intro__heading" id="evidence-workbench-title">
        {routeIntro.title}
      </h1>
      <p className="evidence-workbench-page-intro__description">{routeIntro.description}</p>
      <p className="evidence-workbench-page-intro__state">
        {review.status} with {blockerCount} approval{" "}
        {blockerCount === 1 ? "blocker" : "blockers"}.
      </p>
    </header>
  );
}

function WorkbenchOverview({
  data,
  decisionState,
  summary
}: Readonly<{
  data: EvidenceWorkbenchViewModel;
  decisionState: ReviewDecisionState;
  summary: ReadonlyMap<string, string>;
}>) {
  const review = decisionState.review;
  const selectedClaim = data.reviewClaims.find(
    (claim) => claim.id === review.selectedClaimId
  );
  const blockerWarnings = decisionState.warnings.filter((warning) =>
    review.blockedByWarningIds.includes(warning.id)
  );
  const availableActions = decisionState.actions.filter((action) =>
    review.availableActionIds.includes(action.id)
  );
  const fixtureMode = summary.get("Fixture mode") ?? "Synthetic fixture";
  const dataSource = summary.get("Data source") ?? data.fetchState.source;

  return (
    <>
      <QhdsContentSection
        className="evidence-workbench-panel evidence-workbench-overview-section"
        heading="Current review task"
        headingId="overview-title"
        lead="The current synthetic case shows the review state, source blockers and available local actions."
        leadDensity="compact"
      >
        <div className="evidence-workbench-overview">
          <QhdsCard
            actionMode="none"
            className="evidence-workbench-overview-card evidence-workbench-overview-card--case"
            density="compact"
            heading={data.context.title}
            headingLevel={3}
            variant="workbench"
          >
            <p>{data.context.question}</p>
            <div
              aria-label="Current review state"
              className="evidence-workbench-overview__status"
            >
              <AivisEvidenceStatus tone={statusTone(review.status)}>
                {review.status}
              </AivisEvidenceStatus>
              <AivisEvidenceStatus
                tone={review.blockedByWarningIds.length > 0 ? "warning" : "success"}
              >
                {review.blockedByWarningIds.length} approval blockers
              </AivisEvidenceStatus>
              <AivisEvidenceStatus tone={review.copyState === "enabled" ? "success" : "warning"}>
                Copy {formatStateLabel(review.copyState)}
              </AivisEvidenceStatus>
            </div>
            <QhdsSummaryList
              ariaLabel="Synthetic review case summary"
              className="evidence-workbench-overview__summary"
              items={[
                {
                  description: selectedClaim
                    ? `${selectedClaim.id}: ${selectedClaim.title}`
                    : review.selectedClaimId,
                  term: "Selected claim"
                },
                {
                  description: `${fixtureMode} / ${dataSource}`,
                  term: "Fixture source"
                },
                {
                  description: decisionState.feedback,
                  term: "Feedback"
                },
                {
                  description: decisionState.localStateLabel,
                  term: "State model"
                },
                {
                  description: data.audit.boundaryNoteForDocs ?? "Synthetic fixture evidence only.",
                  term: "Boundary"
                }
              ]}
            />
          </QhdsCard>

          <QhdsCard
            actionMode="none"
            className="evidence-workbench-overview-card"
            density="compact"
            heading="Available next actions"
            headingLevel={3}
            variant="workbench"
          >
            <p>
              Reviewers inspect the draft answer and linked source blockers, then
              record a local action before any approved answer can be copied.
            </p>
            <ul className="evidence-workbench-overview__action-list">
              {availableActions.map((action) => (
                <li key={action.id}>
                  <strong>{action.label}</strong>
                  <span>{action.description}</span>
                </li>
              ))}
            </ul>
          </QhdsCard>

          <QhdsCard
            actionMode="none"
            className="evidence-workbench-overview-card evidence-workbench-overview-card--blockers"
            density="compact"
            heading="Source blockers"
            headingLevel={3}
            variant="workbench"
          >
            {blockerWarnings.length > 0 ? (
              <AivisEvidenceWarningList
                ariaLabel="Approval blockers for this review case"
                warnings={blockerWarnings.map((warning) => ({
                  id: warning.id,
                  impact: warning.evidenceImpact,
                  message: warning.message,
                  severity: warning.severity
                }))}
              />
            ) : (
              <p>No approval blockers are active in the current local review state.</p>
            )}
          </QhdsCard>
        </div>
      </QhdsContentSection>

      <QhdsContentSection
        className="evidence-workbench-panel evidence-workbench-task-launcher-section"
        heading="Choose the next task"
        headingId="task-launcher-title"
        lead="Start with the full review workspace or jump to the source, map and audit views."
        leadDensity="compact"
      >
        <div
          aria-label="Evidence Workbench task launcher"
          className="evidence-workbench-task-launcher"
        >
          <QhdsButton href={REVIEW_ROUTE}>Start review</QhdsButton>
          <QhdsButton href={SOURCE_INVENTORY_ROUTE} variant="secondary">
            Review source blockers
          </QhdsButton>
          <QhdsButton href={PROCESS_ROUTE} variant="secondary">
            Open evidence map
          </QhdsButton>
          <QhdsButton href={AUDIT_ROUTE} variant="secondary">
            View audit state
          </QhdsButton>
        </div>
      </QhdsContentSection>
    </>
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
  const supportingRoutes = workbenchRouteLinks.filter((link) => link.view !== "review");

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
  const isWarning = /blocked|escalat|missing|needs|partial|review|stale|unsafe|update|weak/i.test(status);

  return isWarning ? "warning" : "success";
}

function formatStateLabel(value: string): string {
  return value
    .split("_")
    .filter(Boolean)
    .map((word) => `${word[0]?.toUpperCase() ?? ""}${word.slice(1)}`)
    .join(" ");
}
