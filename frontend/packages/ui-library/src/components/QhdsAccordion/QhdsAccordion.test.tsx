import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";

import { QhdsAccordion } from "./QhdsAccordion";

const styles = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "QhdsAccordion.scss"), "utf8");

let root: Root | undefined;
let container: HTMLDivElement | undefined;

function renderAccordion() {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);

  act(() => {
    root?.render(
      <QhdsAccordion
        items={[
          { content: <p>Eligibility content</p>, id: "eligibility", title: "Eligibility" },
          { content: <p>Documents content</p>, id: "documents", title: "Documents" }
        ]}
      />
    );
  });

  return container;
}

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container?.remove();
  root = undefined;
  container = undefined;
});

describe("QhdsAccordion", () => {
  it("toggles panels with ARIA state", () => {
    const element = renderAccordion();
    const eligibilityButton = element.querySelector<HTMLButtonElement>("#eligibility-accordion-button");
    const eligibilityPanel = element.querySelector<HTMLElement>("#eligibility-accordion-panel");

    expect(element.querySelector(".qld__accordion-group")).not.toBeNull();
    expect(element.querySelector(".qld__accordion")).not.toBeNull();
    expect(element.querySelector(".qhds-accordion__icon")).toBeNull();
    expect(eligibilityButton?.className).toContain("qld__accordion__title");
    expect(eligibilityButton?.querySelector(".qhds-accordion__toggle-closed")?.textContent).toBe(
      "Show details"
    );
    expect(eligibilityButton?.querySelector(".qhds-accordion__toggle-open")?.textContent).toBe(
      "Hide details"
    );
    expect(eligibilityPanel?.className).toContain("qld__accordion__body");
    expect(eligibilityButton?.getAttribute("aria-expanded")).toBe("false");
    expect(eligibilityPanel?.hidden).toBe(true);

    act(() => {
      eligibilityButton?.click();
    });

    expect(eligibilityButton?.getAttribute("aria-expanded")).toBe("true");
    expect(eligibilityPanel?.hidden).toBe(false);
  });

  it("moves focus with accordion keyboard shortcuts", () => {
    const element = renderAccordion();
    const eligibilityButton = element.querySelector<HTMLButtonElement>("#eligibility-accordion-button");
    const documentsButton = element.querySelector<HTMLButtonElement>("#documents-accordion-button");

    eligibilityButton?.focus();
    act(() => {
      eligibilityButton?.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "ArrowDown" }));
    });

    expect(document.activeElement).toBe(documentsButton);
  });

  it("centres the toggle chevron inside the toggle control", () => {
    expect(styles).toContain(".qhds-accordion__toggle::after");
    expect(styles).toContain("align-self: center;");
    expect(styles).toContain("flex: 0 0 auto;");
    expect(styles).toContain("position: relative;");
    expect(styles).toContain("top: -0.0625rem;");
    expect(styles).toContain("transform-origin: center;");
    expect(styles).toContain("top: 0.0625rem;");
  });
});
