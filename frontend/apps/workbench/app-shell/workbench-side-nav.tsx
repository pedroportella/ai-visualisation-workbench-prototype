"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { QhdsIcon, QhdsSideNav } from "@aivis/ui-library";

interface WorkbenchRouteItem {
  href: string;
  icon?: ReactNode;
  items?: WorkbenchRouteItem[];
  label: string;
}

const routeItems = [
  {
    href: "/evidence-workbench",
    icon: <QhdsIcon size="md" symbol="document" />,
    label: "Overview"
  },
  {
    href: "/evidence-workbench/review",
    icon: <QhdsIcon size="md" symbol="document" />,
    label: "Review answer",
    items: [
      {
        href: "/evidence-workbench/sources",
        label: "Source blockers"
      },
      {
        href: "/evidence-workbench/process",
        label: "Evidence map"
      }
    ]
  },
  {
    href: "/evidence-workbench/audit",
    icon: <QhdsIcon size="md" symbol="clock" />,
    label: "Audit state"
  }
] satisfies WorkbenchRouteItem[];

function routeMatches(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function findActiveHref(items: WorkbenchRouteItem[], pathname: string): string | undefined {
  for (const item of items) {
    const activeChildHref = item.items ? findActiveHref(item.items, pathname) : undefined;

    if (activeChildHref) {
      return activeChildHref;
    }

    if (item.href !== "/evidence-workbench" && routeMatches(pathname, item.href)) {
      return item.href;
    }
  }

  return undefined;
}

export function WorkbenchSideNav() {
  const pathname = usePathname() ?? "/evidence-workbench";
  const activeHref = findActiveHref(routeItems, pathname) ?? "/evidence-workbench";

  return (
    <QhdsSideNav
      activeHref={activeHref}
      ariaLabel="Evidence Workbench navigation"
      items={routeItems}
    />
  );
}
