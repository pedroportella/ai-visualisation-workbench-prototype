import type { ReactNode } from "react";
import {
  QhdsFooter,
  QhdsLayout
} from "@aivis/ui-library";
import type { EvidenceWorkbenchViewModel } from "@aivis/services";
import { EvidenceWorkbenchQueryProvider } from "../components/evidence/EvidenceWorkbenchQueryProvider";
import { WorkbenchHeader } from "./WorkbenchHeader";
import { WorkbenchSideNav } from "./WorkbenchSideNav";

export function WorkbenchAppShell({
  children,
  globalAlert,
  initialData
}: Readonly<{
  children: ReactNode;
  globalAlert?: ReactNode;
  initialData: EvidenceWorkbenchViewModel;
}>) {
  return (
    <EvidenceWorkbenchQueryProvider initialData={initialData}>
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
    </EvidenceWorkbenchQueryProvider>
  );
}
