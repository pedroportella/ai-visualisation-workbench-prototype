"use client";

import { usePathname } from "next/navigation";
import { QhdsSideNav } from "@aivis/ui-library";

import { findActiveWorkbenchHref, workbenchSideNavItems } from "./workbench-navigation";

export function WorkbenchSideNav() {
  const pathname = usePathname() ?? "/evidence-workbench";
  const activeHref = findActiveWorkbenchHref(pathname);

  return (
    <QhdsSideNav
      activeHref={activeHref}
      ariaLabel="Evidence Workbench navigation"
      items={workbenchSideNavItems}
    />
  );
}
