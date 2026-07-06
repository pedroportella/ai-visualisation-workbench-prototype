import type { ReactElement } from "react";

import {
  AivisEvidenceClaimCard,
  QhdsContentSection
} from "@aivis/ui-library";

import type { EvidenceWorkbenchViewModel } from "../../services/evidence-workbench/types";
import { statusTone } from "./evidence-workbench-formatters";

interface ClaimsReviewSectionProps {
  asPanel?: boolean;
  data: EvidenceWorkbenchViewModel;
  selectedClaimId: string;
}

export function ClaimsReviewSection({
  asPanel = false,
  data,
  selectedClaimId
}: Readonly<ClaimsReviewSectionProps>): ReactElement {
  const claimList = (
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
  );

  if (asPanel) {
    return (
      <section
        aria-labelledby="claims-title"
        className="evidence-workbench-supporting-evidence__section"
      >
        <h3 id="claims-title">Claims requiring review</h3>
        <p>Selected claim states and evidence posture.</p>
        {claimList}
      </section>
    );
  }

  return (
    <QhdsContentSection
      className="evidence-workbench-panel evidence-workbench-claims-section"
      heading="Claims requiring review"
      headingId="claims-title"
      lead="Selected claim states and evidence posture."
      leadDensity="compact"
      withBodyClass={false}
    >
      {claimList}
    </QhdsContentSection>
  );
}
