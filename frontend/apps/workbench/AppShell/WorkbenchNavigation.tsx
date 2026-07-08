import { QhdsIcon, type QhdsHeaderNavItem, type QhdsSideNavItem } from "@aivis/ui-library";

interface WorkbenchRouteItem {
  href: string;
  icon?: QhdsSideNavItem["icon"];
  items?: WorkbenchRouteItem[];
  label: string;
}

export const workbenchRouteItems = [
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
        label: "Source evidence"
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

export const workbenchMobileMainNavItems = workbenchRouteItems satisfies QhdsHeaderNavItem[];
export const workbenchSideNavItems = workbenchRouteItems satisfies QhdsSideNavItem[];

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

export function findActiveWorkbenchHref(pathname: string): string {
  return findActiveHref(workbenchRouteItems, pathname) ?? "/evidence-workbench";
}
