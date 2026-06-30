import type { ReactNode } from "react";
import { QhdsGlobalAlert } from "@aivis/ui-library";

import { WorkbenchAppShell } from "../../app-shell/workbench-app-shell";
import { getEvidenceWorkbenchData } from "../../services/evidence-workbench/backend-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function EvidenceWorkbenchLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const data = await getEvidenceWorkbenchData();
  const globalAlert = data.fetchState.message ? (
    <QhdsGlobalAlert
      action={{ href: "/evidence-workbench/review", label: "Start review" }}
      dismissible
      level="general"
      title={data.fetchState.message}
      verticalNav
    >
      Review can continue against the bundled fallback fixture state.
    </QhdsGlobalAlert>
  ) : null;

  return <WorkbenchAppShell globalAlert={globalAlert}>{children}</WorkbenchAppShell>;
}
