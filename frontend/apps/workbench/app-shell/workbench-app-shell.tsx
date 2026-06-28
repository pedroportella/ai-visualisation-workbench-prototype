import Link from "next/link";
import type { ReactNode } from "react";

const navigationItems = [
  {
    description: "Review answer, sources and blockers",
    href: "/evidence-workbench",
    label: "Evidence Workbench"
  }
];

export function WorkbenchAppShell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="aivis-app-shell">
      <a className="aivis-app-shell-skip-link" href="#aivis-main">
        Skip to Evidence Workbench
      </a>

      <header className="aivis-app-shell-header">
        <Link
          aria-label="AI Visualisation Workbench home"
          className="aivis-app-shell-brand"
          href="/evidence-workbench"
        >
          <span aria-hidden="true" className="aivis-app-shell-brand-mark">
            AI
          </span>
          <span className="aivis-app-shell-brand-copy">
            <strong>AI Visualisation Workbench</strong>
            <span>Evidence review prototype</span>
          </span>
        </Link>
        <span className="aivis-app-shell-mode">Local fixture</span>
      </header>

      <div className="aivis-app-shell-body">
        <aside className="aivis-app-shell-sidebar">
          <nav aria-label="Workbench sections" className="aivis-app-shell-nav">
            <p className="aivis-app-shell-nav-heading">Review</p>
            <ul>
              {navigationItems.map((item) => (
                <li key={item.href}>
                  <Link
                    aria-current="page"
                    className="aivis-app-shell-nav-link"
                    href={item.href}
                  >
                    <strong>{item.label}</strong>
                    <span>{item.description}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <p className="aivis-app-shell-note">
            Synthetic fixture evidence and local review state only.
          </p>
        </aside>

        <div className="aivis-app-shell-content">{children}</div>
      </div>
    </div>
  );
}
