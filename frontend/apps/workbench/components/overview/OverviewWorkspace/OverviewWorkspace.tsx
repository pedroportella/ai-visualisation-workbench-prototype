import type { ReactElement } from "react";

import {
  AivisEvidenceStatus,
  AivisEvidenceWarningList,
  QhdsButton,
  QhdsCard,
  QhdsContentSection,
  QhdsSummaryList
} from "@aivis/ui-library";

import type { EvidenceWorkbenchViewModel } from "../../../services/evidence-workbench/types";
import type { ReviewDecisionState } from "../../state/reviewDecisionState";
import { formatStateLabel, statusTone } from "../../viewFormatters";
import {
  AUDIT_ROUTE,
  PROCESS_ROUTE,
  REVIEW_ROUTE,
  SOURCE_INVENTORY_ROUTE
} from "../../routeModel";

interface OverviewWorkspaceProps {
  data: EvidenceWorkbenchViewModel;
  decisionState: ReviewDecisionState;
  summary: ReadonlyMap<string, string>;
}

export function OverviewWorkspace({
  data,
  decisionState,
  summary
}: Readonly<OverviewWorkspaceProps>): ReactElement {
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
        withBodyClass={false}
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
        withBodyClass={false}
      >
        <div
          aria-label="Evidence Workbench task launcher"
          className="evidence-workbench-task-launcher"
        >
          <QhdsButton href={REVIEW_ROUTE}>Start review</QhdsButton>
          <QhdsButton href={SOURCE_INVENTORY_ROUTE} variant="secondary">
            Review source evidence
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
