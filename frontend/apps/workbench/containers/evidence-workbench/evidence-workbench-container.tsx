import {
  AivisEvidenceCallout,
  AivisEvidenceClaimCard,
  AivisEvidenceContextAnchors,
  AivisEvidencePanelHeader,
  AivisEvidencePathList,
  AivisEvidenceWarningList,
  type AivisEvidenceTone,
  QhdsCol,
  QhdsContentSection,
  QhdsPageAlert,
  QhdsRow
} from "@aivis/ui-library";

import type { EvidenceWorkbenchViewModel } from "../../services/evidence-workbench/types";
import { AnswerMarkdown } from "./answer-markdown";
import {
  SelectedSourceInspector,
  selectedSourceWarnings
} from "./selected-source-inspector";
import { SourceTracePanel } from "./source-trace-panel";
import { WorkbenchCaseBar } from "./workbench-case-bar";

export default function EvidenceWorkbenchContainer({
  data
}: Readonly<{ data: EvidenceWorkbenchViewModel }>) {
  const summary = summaryMap(data);
  const selectedClaim = data.reviewClaims.find(
    (claim) => claim.id === data.review.selectedClaimId
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
        blockerCount={data.review.blockedByWarningIds.length}
        caseTitle={data.context.title}
        dataSource={summary.get("Data source") ?? data.fetchState.source}
        fixtureMode={summary.get("Fixture mode") ?? "Synthetic fixture"}
        generatedAt={data.answer.generatedAt}
        runtimeMode={summary.get("Runtime") ?? "Local fixture"}
        status={data.review.status}
      />

      {data.fetchState.message ? (
        <QhdsPageAlert heading={data.fetchState.message} tone="warning">
          <p>Review can continue against the fallback fixture state.</p>
        </QhdsPageAlert>
      ) : null}

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
              selectedClaimId={data.review.selectedClaimId}
            />
            {selectedClaimTopWarning ? (
              <AivisEvidenceCallout
                className="evidence-workbench-selected-claim-warning"
                heading={`${data.review.selectedClaimId} selected blocker`}
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

        <QhdsCol lg={5} xl={5}>
          <QhdsContentSection
            className="evidence-workbench-panel evidence-workbench-source-inspector-section"
            heading="Source inspector"
            headingId="source-inspector-title"
            lead="Focused source evidence for the selected claim."
          >
            <SelectedSourceInspector
              selectedClaim={selectedClaim}
              selectedClaimId={data.review.selectedClaimId}
              sources={data.sourceItems}
            />
          </QhdsContentSection>
        </QhdsCol>

      </QhdsRow>

      <QhdsRow className="evidence-workbench-grid evidence-workbench-lower-workspace">
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
              selectedClaimId={data.review.selectedClaimId}
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

function summaryMap(data: EvidenceWorkbenchViewModel): Map<string, string> {
  return new Map(data.summary.map((item) => [item.label, item.value]));
}

function statusTone(status: string): AivisEvidenceTone {
  const isWarning = /missing|stale|weak|partial/i.test(status);

  return isWarning ? "warning" : "success";
}
