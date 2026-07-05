import type { ReactNode } from "react";
import {
  QhdsFooter,
  QhdsLayout
} from "@aivis/ui-library";
import { WorkbenchHeader } from "./workbench-header";
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
      header={<WorkbenchHeader />}
      mainId="aivis-main"
      mainLabel="Evidence Workbench"
      sideNav={<WorkbenchSideNav />}
    >
      {children}
    </QhdsLayout>
  );
}
