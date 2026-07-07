import type { ReactElement, ReactNode } from "react";

import { QhdsAccordion } from "@aivis/ui-library";

import type { EvidenceWorkbenchViewModel } from "../../../../services/evidence-workbench/types";
import {
  REVIEW_ROUTE,
  SOURCE_INVENTORY_ROUTE
} from "../../routeModel";
import { SourcesBlockerTarget, type SourceBlockerIssue } from "../SourcesBlockerTarget";
import { SourcesInventory, SourcesRecordAccordion } from "../SourcesInventory";
import { SourcesScenarioContext } from "../SourcesScenarioContext";

interface SourcesWorkspaceProps {
  data: EvidenceWorkbenchViewModel;
  onSelectIssue: (issueId: string) => void;
  selectedClaimId: string;
  selectedIssue: SourceBlockerIssue | null;
  sourceBlockerIssues: SourceBlockerIssue[];
}

export function SourcesWorkspace({
  data,
  onSelectIssue,
  selectedClaimId,
  selectedIssue,
  sourceBlockerIssues
}: Readonly<SourcesWorkspaceProps>): ReactElement {
  return (
    <div className="evidence-workbench-sources-accordion">
      <QhdsAccordion
        headingLevel={2}
        items={[
          {
            content: (
              <SourcesAccordionPanel lead="Source records, citation relationships and blocker state for the current review.">
                <SourcesInventory
                  filters={data.sourceFilters}
                  selectedClaimId={selectedClaimId}
                  sources={data.sourceItems}
                />
              </SourcesAccordionPanel>
            ),
            defaultOpen: true,
            id: "sources-title",
            title: "Source inventory"
          },
          {
            content: (
              <SourcesAccordionPanel lead="Choose a blocker to inspect, then continue to the review route to record the local action.">
                <SourcesBlockerTarget
                  actionMode="inspect"
                  issues={sourceBlockerIssues}
                  onSelectIssue={onSelectIssue}
                  reviewActionPath={REVIEW_ROUTE}
                  selectedIssueId={selectedIssue?.id ?? null}
                  selectedSummaryPosition="before-selector"
                  showIssueTable={false}
                  sourceInventoryPath={SOURCE_INVENTORY_ROUTE}
                />
              </SourcesAccordionPanel>
            ),
            id: "source-action-target",
            title: "Blocker action target"
          },
          {
            content: (
              <SourcesAccordionPanel lead="Open a source record when you need preview, citation, context and warning detail.">
                <SourcesRecordAccordion sources={data.sourceItems} />
              </SourcesAccordionPanel>
            ),
            id: "source-record-details",
            title: "Source record details"
          },
          {
            content: (
              <SourcesAccordionPanel lead="Non-evidence case background for understanding the local review task.">
                <SourcesScenarioContext data={data} />
              </SourcesAccordionPanel>
            ),
            id: "scenario",
            title: "Scenario context"
          }
        ]}
      />
    </div>
  );
}

function SourcesAccordionPanel({
  children,
  lead
}: Readonly<{
  children: ReactNode;
  lead: string;
}>): ReactElement {
  return (
    <div className="evidence-workbench-sources-accordion__panel">
      <p className="qhds-content-section__lead qhds-content-section__lead--compact">
        {lead}
      </p>
      {children}
    </div>
  );
}
