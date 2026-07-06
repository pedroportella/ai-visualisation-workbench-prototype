import type { ReactElement } from "react";

import {
  AivisEvidencePanelHeader,
  QhdsContentSection
} from "@aivis/ui-library";

import type { EvidenceWorkbenchViewModel } from "../../services/evidence-workbench/types";
import {
  REVIEW_ROUTE,
  SOURCE_INVENTORY_ROUTE
} from "./evidence-workbench-routes";
import { ScenarioContextSection } from "./scenario-context-section";
import type { SourceBlockerIssue } from "./source-blocker-review";
import { SourceBlockerReview } from "./source-blocker-review";
import { SourceTracePanel } from "./source-trace-panel";

interface WorkbenchSourcesWorkspaceProps {
  data: EvidenceWorkbenchViewModel;
  onSelectIssue: (issueId: string) => void;
  selectedClaimId: string;
  selectedIssue: SourceBlockerIssue | null;
  sourceBlockerIssues: SourceBlockerIssue[];
}

export function WorkbenchSourcesWorkspace({
  data,
  onSelectIssue,
  selectedClaimId,
  selectedIssue,
  sourceBlockerIssues
}: Readonly<WorkbenchSourcesWorkspaceProps>): ReactElement {
  return (
    <>
      <QhdsContentSection
        className="evidence-workbench-panel"
        heading="Source inventory"
        headingId="sources-title"
        lead="Source records, citation relationships and blocker state for the current review."
        leadDensity="compact"
        withBodyClass={false}
      >
        <AivisEvidencePanelHeader
          label="Source trace"
          status="Synthetic fixture"
        />
        <SourceTracePanel
          filters={data.sourceFilters}
          selectedClaimId={selectedClaimId}
          sources={data.sourceItems}
        />
      </QhdsContentSection>

      <QhdsContentSection
        className="evidence-workbench-panel evidence-workbench-source-review-section"
        heading="Blocker action target"
        headingId="source-action-target-title"
        lead="Choose a blocker to inspect, then continue to the review route to record the local action."
        leadDensity="compact"
        withBodyClass={false}
      >
        <SourceBlockerReview
          actionMode="inspect"
          issues={sourceBlockerIssues}
          onSelectIssue={onSelectIssue}
          reviewActionPath={REVIEW_ROUTE}
          selectedIssueId={selectedIssue?.id ?? null}
          selectedSummaryPosition="before-selector"
          showIssueTable={false}
          sourceInventoryPath={SOURCE_INVENTORY_ROUTE}
        />
      </QhdsContentSection>

      <ScenarioContextSection data={data} />
    </>
  );
}
