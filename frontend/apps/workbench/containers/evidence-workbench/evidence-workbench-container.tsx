import {
  AivisEvidenceClaimCard,
  AivisEvidenceContextAnchors,
  AivisEvidencePanelHeader,
  AivisEvidencePathList,
  AivisEvidenceWarningList,
  type AivisEvidenceTone,
  QhdsCol,
  QhdsContentSection,
  QhdsPageAlert,
  QhdsPageHeader,
  QhdsRow,
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
        heading="Evidence Workbench"
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

      <QhdsRow className="evidence-workbench-grid">
        <QhdsCol lg={12} xl={6}>
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
              selectedClaimId={data.review.selectedClaimId}
            />
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
                  selected={claim.id === data.review.selectedClaimId}
                  selectedLabel="Selected claim"
                  status={claim.status}
                  statusTone={statusTone(claim.status)}
                  text={claim.text}
                  title={claim.title}
                />
              ))}
            </div>
          </QhdsContentSection>
        </QhdsCol>

        <QhdsCol lg={12} xl={6}>
          <QhdsContentSection
            className="evidence-workbench-panel"
            heading="Evidence sources"
            headingId="sources-title"
            lead="Source inventory, citation relationships and blocker state."
          >
            <AivisEvidencePanelHeader
              label="Source trace"
              status="Synthetic fixture"
            />
            <SourceTracePanel
              filters={data.sourceFilters}
              selectedClaimId={data.review.selectedClaimId}
              sources={data.sourceItems}
            />
          </QhdsContentSection>
        </QhdsCol>

        <QhdsCol xs={12}>
          <QhdsContentSection
            className="evidence-workbench-panel"
            heading="Evidence path"
            headingId="review-title"
            lead={data.graph.accessibleSummary}
          >
            <AivisEvidencePanelHeader
              label="Review lane"
              status="Local fixture"
            />
            <AivisEvidencePathList
              items={data.graph.fallbackSteps.map((step) => ({
                heading: step.heading,
                summary: step.summary
              }))}
            />
            <p className="evidence-workbench-review-note">
              Copy state is {data.review.copyState}. Approval remains blocked by{" "}
              {data.review.blockedByWarningIds.join(", ")} with{" "}
              {data.review.activeWarningCount} active fixture warnings.
            </p>
            <AivisEvidenceWarningList
              ariaLabel="Active fixture warnings"
              warnings={data.warnings.map((warning) => ({
                id: warning.id,
                message: warning.message,
                severity: warning.severity
              }))}
            />
          </QhdsContentSection>
        </QhdsCol>
      </QhdsRow>
    </section>
  );
}

function statusTone(status: string): AivisEvidenceTone {
  const isWarning = /missing|stale|weak|partial/i.test(status);

  return isWarning ? "warning" : "success";
}
