import type { ReactElement } from "react";

import {
  AivisEvidenceClaimCard,
  QhdsContentSection
} from "@aivis/ui-library";

import type { EvidenceWorkbenchViewModel } from "../../services/evidence-workbench/types";
import { statusTone } from "./evidence-workbench-formatters";

interface ClaimsReviewSectionProps {
  data: EvidenceWorkbenchViewModel;
  selectedClaimId: string;
}

export function ClaimsReviewSection({
  data,
  selectedClaimId
}: Readonly<ClaimsReviewSectionProps>): ReactElement {
  return (
    <QhdsContentSection
      className="evidence-workbench-panel evidence-workbench-claims-section"
      heading="Claims requiring review"
      headingId="claims-title"
      lead="Selected claim states and evidence posture."
      leadDensity="compact"
      withBodyClass={false}
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
