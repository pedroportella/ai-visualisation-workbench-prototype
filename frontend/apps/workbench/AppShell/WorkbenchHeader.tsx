"use client";

import { usePathname } from "next/navigation";
import { QhdsHeader } from "@aivis/ui-library";

import { findActiveWorkbenchHref, workbenchMobileMainNavItems } from "./WorkbenchNavigation";

export function WorkbenchHeader() {
  const pathname = usePathname() ?? "/evidence-workbench";
  const activeHref = findActiveWorkbenchHref(pathname);

  return (
    <QhdsHeader
      accountHref="#review-title"
      accountName="Fixture reviewer"
      brandHref="/evidence-workbench"
      logoutHref="/evidence-workbench"
      logoutLabel="Exit"
      mobileMainNavActiveHref={activeHref}
      mobileMainNavAriaLabel="Evidence Workbench navigation"
      mobileMainNavItems={workbenchMobileMainNavItems}
      serviceDescription="Evidence Workbench"
      serviceName="AI Visualisation Workbench"
      showMobileMainNav
    />
  );
}
