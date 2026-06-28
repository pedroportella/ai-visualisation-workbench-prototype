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
          expanded: true,
          href: "#answer-title",
          icon: <QhdsIcon size="md" symbol="document" />,
          items: [
            { href: "#answer-title", label: "Draft answer" },
            { href: "#selected-claim", label: "Selected claim" }
          ],
          label: "Answer review"
        },
        {
          expanded: true,
          href: "#sources-title",
          icon: <QhdsIcon size="md" symbol="document" />,
          items: [
            { href: "#selected-claim-sources", label: "Selected claim sources" },
            { href: "#source-inventory", label: "Source inventory" }
          ],
          label: "Source trace"
        },
        {
          href: "#scenario-title",
          icon: <QhdsIcon size="md" symbol="location" />,
          label: "Scenario context"
        },
        {
          href: "#review-title",
          icon: <QhdsIcon size="md" symbol="clock" />,
          label: "Review lane"
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
