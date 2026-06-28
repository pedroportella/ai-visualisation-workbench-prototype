import {
  QhdsContentSection,
  QhdsPageAlert,
  QhdsPageHeader,
  QhdsSummaryList
} from "@aivis/ui-library";

import type { EvidenceWorkbenchViewModel } from "../../services/evidence-workbench/types";
import { AnswerMarkdown } from "./answer-markdown";
import { SourceTracePanel } from "./source-trace-panel";

export default function EvidenceWorkbenchContainer({
  data
}: Readonly<{ data: EvidenceWorkbenchViewModel }>) {
  return (
    <section
      aria-labelledby="evidence-workbench-title"
      className="evidence-workbench"
    >
      <QhdsPageHeader
        aside={
          <QhdsSummaryList
            ariaLabel="Workbench status"
            items={data.summary.map((item) => ({
              description: item.value,
              term: item.label
            }))}
          />
        }
        contextLabel="Evidence Workbench"
        heading="AI Visualisation Workbench"
        headingId="evidence-workbench-title"
        lead="Review a synthetic transport-service guidance answer, its source trace and the blockers that keep it in review."
      />

      <QhdsPageAlert heading="Synthetic fixture review data" tone="info">
        <p>
          This workbench separates public context anchors from synthetic evidence sources so the draft answer can stay in review until source blockers are resolved.
        </p>
      </QhdsPageAlert>

      {data.fetchState.message ? (
        <QhdsPageAlert heading={data.fetchState.message} tone="warning">
          <p>Review can continue against the fallback fixture state.</p>
        </QhdsPageAlert>
      ) : null}

      <QhdsContentSection
        className="evidence-workbench-context-section"
        heading={data.context.title}
        headingId="scenario-title"
        lead="Local review case"
      >
        <div className="evidence-workbench-context">
          <div className="evidence-workbench-case-summary">
            <p>{data.context.question}</p>
            <p className="evidence-workbench-context-date">
              Planned fixture travel date: {data.context.plannedTravelDate}
            </p>
          </div>
          <div className="evidence-workbench-anchor-panel">
            <h3>Public context anchors</h3>
            <p>Place labels only; they are not treated as evidence sources.</p>
            <ul className="evidence-workbench-anchor-list" aria-label="Context anchors">
              {data.context.anchors.map((anchor) => (
                <li key={anchor.id}>
                  <strong>{anchor.label}</strong>
                  <span>Context only</span>
                  <small>{anchor.supportingText}</small>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </QhdsContentSection>

      <div className="evidence-workbench-grid">
        <QhdsContentSection
          className="evidence-workbench-panel"
          heading="Draft answer"
          headingId="answer-title"
          lead={data.answer.summary}
        >
          <div className="evidence-workbench-panel-heading">
            <p className="evidence-workbench-eyebrow">Draft answer</p>
            <span className="evidence-workbench-status evidence-workbench-status-warning">
              {data.answer.status}
            </span>
          </div>
          <p className="evidence-workbench-answer-meta">
            Fixture timestamp: {data.answer.generatedAt}
          </p>
          <AnswerMarkdown
            citations={data.citations}
            markdown={data.answer.markdown}
            selectedClaimId={data.review.selectedClaimId}
          />
          <div
            className="evidence-workbench-claim-stack"
            id="selected-claim"
            aria-label="Claims requiring review"
          >
            {data.reviewClaims.map((claim) => (
              <article
                aria-current={claim.id === data.review.selectedClaimId ? "true" : undefined}
                className={claimClassName(claim.id === data.review.selectedClaimId)}
                data-selected-claim={claim.id === data.review.selectedClaimId ? "true" : undefined}
                id={`claim-${claim.id}`}
                key={claim.id}
              >
                <div className="evidence-workbench-claim-heading">
                  <span>{claim.id}</span>
                  <strong>{claim.title}</strong>
                  {claim.id === data.review.selectedClaimId ? (
                    <span className="evidence-workbench-status">Selected claim</span>
                  ) : null}
                </div>
                <p>{claim.text}</p>
                <span className={statusClassName(claim.status)}>{claim.status}</span>
              </article>
            ))}
          </div>
        </QhdsContentSection>

        <QhdsContentSection
          className="evidence-workbench-panel"
          heading="Evidence sources"
          headingId="sources-title"
          lead="Source inventory, citation relationships and blocker state."
        >
          <div className="evidence-workbench-panel-heading">
            <p className="evidence-workbench-eyebrow">Source trace</p>
            <span className="evidence-workbench-status">Synthetic fixture</span>
          </div>
          <SourceTracePanel
            filters={data.sourceFilters}
            selectedClaimId={data.review.selectedClaimId}
            sources={data.sourceItems}
          />
        </QhdsContentSection>

        <QhdsContentSection
          className="evidence-workbench-panel evidence-workbench-panel-wide"
          heading="Evidence path"
          headingId="review-title"
          lead={data.graph.accessibleSummary}
        >
          <div className="evidence-workbench-panel-heading">
            <p className="evidence-workbench-eyebrow">Review lane</p>
            <span className="evidence-workbench-status">Local fixture</span>
          </div>
          <ol className="evidence-workbench-review-path">
            {data.graph.fallbackSteps.map((step) => (
              <li key={step.heading}>
                <strong>{step.heading}</strong>
                <span>{step.summary}</span>
              </li>
            ))}
          </ol>
          <p className="evidence-workbench-review-note">
            Copy state is {data.review.copyState}. Approval remains blocked by{" "}
            {data.review.blockedByWarningIds.join(", ")} with{" "}
            {data.review.activeWarningCount} active fixture warnings.
          </p>
          <ul className="evidence-workbench-warning-list" aria-label="Active fixture warnings">
            {data.warnings.map((warning) => (
              <li key={warning.id}>
                <strong>{warning.id}</strong>
                <span>{warning.severity}</span>
                <p>{warning.message}</p>
              </li>
            ))}
          </ul>
        </QhdsContentSection>
      </div>
    </section>
  );
}

function claimClassName(isSelected: boolean): string {
  return ["evidence-workbench-claim", isSelected ? "evidence-workbench-claim-selected" : ""]
    .filter(Boolean)
    .join(" ");
}

function statusClassName(status: string): string {
  const isWarning = /missing|stale|weak|partial/i.test(status);
  return [
    "evidence-workbench-status",
    isWarning ? "evidence-workbench-status-warning" : ""
  ]
    .filter(Boolean)
    .join(" ");
}
