import { act } from "react";

import type { ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";

import type { QhdsHeaderNavItem } from "./QhdsHeader.types";

let root: Root | undefined;
let container: HTMLDivElement | undefined;

export const mobileMainNavItems: QhdsHeaderNavItem[] = [
  { href: "/evidence-workbench", label: "Overview" },
  {
    href: "/evidence-workbench/review",
    label: "Review answer",
    items: [
      { href: "/evidence-workbench/sources", label: "Source evidence" },
      { href: "/evidence-workbench/process", label: "Evidence map" }
    ]
  },
  { href: "/evidence-workbench/audit", label: "Audit state" }
];

export function appendHiddenRegions() {
  const main = document.createElement("main");
  const footer = document.createElement("footer");

  main.className = "main";
  footer.className = "qld__footer";
  document.body.append(main, footer);

  return { footer, main };
}

export function cleanupInteractiveRender() {
  act(() => {
    root?.unmount();
  });
  container?.remove();
  document.body.classList.remove("qld__main-nav__scroll--locked");
  root = undefined;
  container = undefined;
}

export async function flushEffects() {
  await act(async () => {
    for (let tick = 0; tick < 4; tick += 1) {
      await new Promise((resolve) => {
        window.setTimeout(resolve, 0);
      });
    }
  });
}

export function renderInteractive(element: ReactNode) {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);

  act(() => {
    root?.render(element);
  });

  return container;
}
