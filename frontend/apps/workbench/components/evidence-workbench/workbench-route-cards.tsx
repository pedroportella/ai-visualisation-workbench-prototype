import type { ReactElement } from "react";

import { QhdsCard, QhdsContentSection } from "@aivis/ui-library";

import { workbenchRouteLinks } from "./evidence-workbench-routes";

export function WorkbenchRouteCards(): ReactElement {
  const supportingRoutes = workbenchRouteLinks.filter((link) => link.view !== "review");

  return (
    <QhdsContentSection
      className="evidence-workbench-panel evidence-workbench-routes-section"
      heading="Supporting workspaces"
      headingId="supporting-workspaces-title"
      lead="Focused views for source evidence, process trace and local audit state."
      leadDensity="compact"
      withBodyClass={false}
    >
      <ul className="qld__card-list evidence-workbench-route-list">
        {supportingRoutes.map((link) => (
          <li key={link.href}>
            <QhdsCard
              actionMode="single"
              className="evidence-workbench-route-card"
              density="compact"
              heading={link.label}
              headingHref={link.href}
              headingLevel={3}
              variant="workbench"
            >
              <p>{link.description}</p>
            </QhdsCard>
          </li>
        ))}
      </ul>
    </QhdsContentSection>
  );
}
