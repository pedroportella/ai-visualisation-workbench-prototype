import type { ReactNode } from "react";
import {
  QhdsFooter,
  QhdsHeader,
  QhdsLayout
} from "@aivis/ui-library";
import { WorkbenchSideNav } from "./workbench-side-nav";

export function WorkbenchAppShell({
  children,
  globalAlert
}: Readonly<{
  children: ReactNode;
  globalAlert?: ReactNode;
}>) {
  return (
    <QhdsLayout
      className="aivis-app-shell"
      contentLabelledBy="evidence-workbench-title"
      footer={
        <QhdsFooter>
          <p>Evidence Workbench uses synthetic fixture evidence and local review state only.</p>
        </QhdsFooter>
      }
      globalAlert={globalAlert}
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
