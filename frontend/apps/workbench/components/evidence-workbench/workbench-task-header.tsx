import type { ReactElement } from "react";
import { AivisEvidenceStatus } from "@aivis/ui-library";

import type { EvidenceWorkbenchViewModel } from "../../services/evidence-workbench/types";
import type { EvidenceWorkbenchView } from "./evidence-workbench-routes";
import { formatStateLabel, statusTone } from "./evidence-workbench-formatters";

interface WorkbenchTaskHeaderProps {
  activeView: EvidenceWorkbenchView;
  review: EvidenceWorkbenchViewModel["review"];
}

export function WorkbenchTaskHeader({
  activeView,
  review
}: Readonly<WorkbenchTaskHeaderProps>): ReactElement {
  const titles = {
    audit: "Audit state",
    overview: "Evidence Workbench",
    process: "Evidence map",
    review: "Review answer",
    sources: "Source blockers"
  } satisfies Record<EvidenceWorkbenchView, string>;
  const blockerCount = review.blockedByWarningIds.length;

  return (
    <header className="workbench-task-header">
      <h1 className="workbench-task-header__heading" id="evidence-workbench-title">
        {titles[activeView]}
      </h1>
      <div
        aria-label="Review task state"
        className="workbench-task-header__status"
      >
        <AivisEvidenceStatus tone={statusTone(review.status)}>
          {review.status}
        </AivisEvidenceStatus>
        <AivisEvidenceStatus
          aria-label={`${blockerCount} approval ${blockerCount === 1 ? "blocker" : "blockers"}`}
          tone={blockerCount > 0 ? "warning" : "success"}
        >
          {blockerCount} {blockerCount === 1 ? "blocker" : "blockers"}
        </AivisEvidenceStatus>
        <AivisEvidenceStatus tone={review.copyState === "enabled" ? "success" : "warning"}>
          Copy {formatStateLabel(review.copyState)}
        </AivisEvidenceStatus>
      </div>
    </header>
  );
}
