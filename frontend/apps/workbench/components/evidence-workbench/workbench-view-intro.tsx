import type { ReactElement } from "react";

import type { EvidenceWorkbenchViewModel } from "../../services/evidence-workbench/types";
import type { EvidenceWorkbenchView } from "./evidence-workbench-routes";

interface WorkbenchViewIntroProps {
  activeView: EvidenceWorkbenchView;
  data: EvidenceWorkbenchViewModel;
  review: EvidenceWorkbenchViewModel["review"];
}

export function WorkbenchViewIntro({
  activeView,
  data,
  review
}: Readonly<WorkbenchViewIntroProps>): ReactElement {
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
