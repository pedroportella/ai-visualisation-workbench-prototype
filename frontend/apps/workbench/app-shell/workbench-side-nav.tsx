"use client";

import { usePathname } from "next/navigation";
import { QhdsIcon, QhdsSideNav } from "@aivis/ui-library";

const routeItems = [
  {
    href: "/evidence-workbench",
    icon: <QhdsIcon size="md" symbol="document" />,
    label: "Overview"
  },
  {
    href: "/evidence-workbench/review",
    icon: <QhdsIcon size="md" symbol="document" />,
    label: "Review answer"
  },
  {
    href: "/evidence-workbench/sources",
    icon: <QhdsIcon size="md" symbol="document" />,
    label: "Source blockers"
  },
  {
    href: "/evidence-workbench/process",
    icon: <QhdsIcon size="md" symbol="location" />,
    label: "Evidence map"
  },
  {
    href: "/evidence-workbench/audit",
    icon: <QhdsIcon size="md" symbol="clock" />,
    label: "Audit state"
  }
];

export function WorkbenchSideNav() {
  const pathname = usePathname() ?? "/evidence-workbench";
  const activeHref =
    routeItems.find((item) => item.href !== "/evidence-workbench" && pathname.startsWith(item.href))
      ?.href ?? "/evidence-workbench";

  return (
    <QhdsSideNav
      activeHref={activeHref}
      ariaLabel="Evidence Workbench navigation"
      heading="Evidence Workbench"
      items={routeItems}
    />
  );
}
