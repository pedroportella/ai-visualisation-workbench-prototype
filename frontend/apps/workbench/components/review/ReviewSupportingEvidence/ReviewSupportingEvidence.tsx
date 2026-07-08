import type { ReactElement } from "react";

import { QhdsAccordion } from "@aivis/ui-library";

import type { EvidenceWorkbenchViewModel } from "../../../services/evidence-workbench/types";
import { SOURCE_INVENTORY_ROUTE } from "../../routeModel";
import { SourcesSelectedSourceInspector } from "../../sources/SourcesSelectedSourceInspector";
import { ReviewClaimsSupport } from "../ReviewClaimsSupport";

interface ReviewSupportingEvidenceProps {
  data: EvidenceWorkbenchViewModel;
  selectedClaimId: string;
}

export function ReviewSupportingEvidence({
  data,
  selectedClaimId
}: Readonly<ReviewSupportingEvidenceProps>): ReactElement {
  const selectedClaim = data.reviewClaims.find((claim) => claim.id === selectedClaimId);

  return (
    <div className="evidence-workbench-supporting-evidence">
      <QhdsAccordion
        headingLevel={3}
        items={[
          {
            content: (
              <section
                aria-labelledby="source-inspector-title"
                className="evidence-workbench-supporting-evidence__section"
              >
                <h3 id="source-inspector-title">Source inspector</h3>
                <p>Focused source evidence for the selected claim.</p>
                <SourcesSelectedSourceInspector
                  selectedClaim={selectedClaim}
                  selectedClaimId={selectedClaimId}
                  sourceInventoryPath={SOURCE_INVENTORY_ROUTE}
                  sources={data.sourceItems}
                />
              </section>
            ),
            id: "review-source-inspector",
            title: "Source inspector"
          },
          {
            content: (
              <ReviewClaimsSupport
                asPanel
                data={data}
                selectedClaimId={selectedClaimId}
              />
            ),
            id: "review-claims",
            title: "Claims requiring review"
          }
        ]}
      />
    </div>
  );
}
