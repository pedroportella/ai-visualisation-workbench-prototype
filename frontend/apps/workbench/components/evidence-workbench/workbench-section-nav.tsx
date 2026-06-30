import type { ReactElement } from "react";

import {
  type EvidenceWorkbenchView,
  workbenchRouteLinks
} from "./evidence-workbench-routes";

export function WorkbenchMobileSectionNav({
  activeView
}: Readonly<{ activeView: EvidenceWorkbenchView }>): ReactElement {
  return (
    <nav
      aria-label="Evidence Workbench views"
      className="evidence-workbench-mobile-nav"
    >
      <ul className="evidence-workbench-mobile-nav__list">
        {workbenchRouteLinks.map((link) => (
          <li key={link.href}>
            <a
              aria-current={activeView === link.view ? "page" : undefined}
              aria-label={`Open ${link.label.toLowerCase()} view: ${link.description}`}
              className="evidence-workbench-mobile-nav__link"
              href={link.href}
            >
              <span>{link.label}</span>
              <small>{link.description}</small>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
