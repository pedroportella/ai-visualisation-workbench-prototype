import type { ReactNode } from "react";
import {
  QhdsFooter,
  QhdsHeader,
  QhdsIcon,
  QhdsLayout,
  QhdsSideNav
} from "@aivis/ui-library";

function WorkbenchSideNav() {
  return (
    <QhdsSideNav
      activeHref="/evidence-workbench"
      ariaLabel="Evidence Workbench navigation"
      heading="Evidence Workbench"
      headingHref="/evidence-workbench"
      headingIcon={<QhdsIcon size="md" symbol="home" />}
      items={[
        {
          href: "#answer-title",
          icon: <QhdsIcon size="md" symbol="document" />,
          label: "Draft answer"
        },
        {
          href: "#source-inspector-title",
          icon: <QhdsIcon size="md" symbol="document" />,
          label: "Source inspector"
        },
        {
          href: "#review-decision-title",
          icon: <QhdsIcon size="md" symbol="clock" />,
          label: "Review actions"
        },
        {
          href: "#process-map-title",
          icon: <QhdsIcon size="md" symbol="location" />,
          label: "Process map"
        },
        {
          href: "#sources-title",
          icon: <QhdsIcon size="md" symbol="document" />,
          label: "Source inventory"
        },
        {
          href: "#audit-summary",
          icon: <QhdsIcon size="md" symbol="clock" />,
          label: "Audit summary"
        },
        {
          href: "#scenario-title",
          icon: <QhdsIcon size="md" symbol="location" />,
          label: "Scenario context"
        }
      ]}
    />
  );
}

export function WorkbenchAppShell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <QhdsLayout
      className="aivis-app-shell"
      contentLabelledBy="evidence-workbench-title"
      footer={
        <QhdsFooter>
          <p>Evidence Workbench uses synthetic fixture evidence and local review state only.</p>
        </QhdsFooter>
      }
      header={
        <QhdsHeader
          accountHref="#review-title"
          accountName="Fixture reviewer"
          brandHref="/evidence-workbench"
          logoutHref="/evidence-workbench"
          logoutLabel="Exit"
          serviceDescription="Evidence Workbench"
          serviceName="AI Visualisation Workbench"
        />
      }
      mainId="aivis-main"
      mainLabel="Evidence Workbench"
      sideNav={<WorkbenchSideNav />}
    >
      {children}
    </QhdsLayout>
  );
}
