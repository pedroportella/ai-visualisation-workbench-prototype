import { act } from "react";
import { readFileSync } from "node:fs";
import type { ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { QhdsButton } from "./QhdsButton";

let root: Root | undefined;
let container: HTMLDivElement | undefined;

function renderInteractive(element: ReactNode) {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);

  act(() => {
    root?.render(element);
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

describe("QhdsButton", () => {
  it("renders anchor and button variants", () => {
    const html = renderToStaticMarkup(
      <>
        <QhdsButton href="/start" rel="noreferrer" target="_blank">
          Start
        </QhdsButton>
        <QhdsButton variant="secondary">Cancel</QhdsButton>
        <QhdsButton href="/more" variant="tertiary">
          More
        </QhdsButton>
      </>
    );

    expect(html).toContain('href="/start"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noreferrer"');
    expect(html).toContain("qld__btn");
    expect(html).not.toContain("qld__btn--primary");
    expect(html).toContain("qld__btn--secondary");
    expect(html).toContain("qhds-button--primary");
    expect(html).toContain("qhds-button--secondary");
    expect(html).toContain("qhds-button--tertiary");
    expect(html).toContain('type="button"');
  });

  it("keeps link-button colours scoped to the active QHDS surface", () => {
    const stylesheet = readFileSync("src/components/QhdsButton/QhdsButton.scss", "utf8");

    expect(stylesheet).toMatch(
      /@media \(prefers-color-scheme: dark\) \{[\s\S]*?\.qhds-button \{[\s\S]*?--qhds-button-secondary-color: var\(--QLD-color-dark__link\);/
    );
    expect(stylesheet).toMatch(
      /\.qld__body--light \.qhds-button,[\s\S]*?\.qld__body--alt \.qhds-button \{[\s\S]*?--qhds-button-secondary-color: var\(--QLD-color-light__link\);/
    );
    expect(stylesheet).toMatch(
      /\.qld__body--dark \.qhds-button,[\s\S]*?\.qld__footer--dark-alt \.qhds-button \{[\s\S]*?--qhds-button-secondary-color: var\(--QLD-color-dark__link\);/
    );
    expect(stylesheet).toMatch(
      /\.qhds-button--secondary,\na\.qhds-button--secondary:visited \{[\s\S]*?color: var\(--qhds-button-secondary-color\);/
    );
    expect(stylesheet).toMatch(
      /\.qhds-button--tertiary,\na\.qhds-button--tertiary:visited \{[\s\S]*?color: var\(--qhds-button-tertiary-color\);/
    );
  });

  it("preserves explicit button types", () => {
    const html = renderToStaticMarkup(<QhdsButton type="submit">Submit application</QhdsButton>);

    expect(html).toContain('type="submit"');
  });

  it("renders QHDS leading and trailing icon hooks", () => {
    const html = renderToStaticMarkup(
      <>
        <QhdsButton leadingIcon={<svg focusable="false" />}>Leading icon</QhdsButton>
        <QhdsButton trailingIcon={<svg focusable="false" />} variant="secondary">
          Trailing icon
        </QhdsButton>
      </>
    );

    expect(html).toContain("qld__btn--icon-lead");
    expect(html).toContain("qld__btn--icon-trail");
    expect(html).toContain("qhds-button--icon-lead");
    expect(html).toContain("qhds-button--icon-trail");
    expect(html).toContain('class="qld__icon qld__icon--sm qhds-button__icon"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("Leading icon");
    expect(html).toContain("Trailing icon");
  });

  it("renders disabled native buttons and disabled anchor-style buttons safely", () => {
    const buttonHtml = renderToStaticMarkup(<QhdsButton disabled>Disabled button</QhdsButton>);
    const anchorHtml = renderToStaticMarkup(
      <QhdsButton disabled href="/disabled">
        Disabled link
      </QhdsButton>
    );

    expect(buttonHtml).toContain("disabled");
    expect(buttonHtml).toContain('type="button"');
    expect(anchorHtml).not.toContain('href="/disabled"');
    expect(anchorHtml).toContain('aria-disabled="true"');
    expect(anchorHtml).toContain('tabindex="-1"');
    expect(anchorHtml).toContain("qhds-button--disabled");
    expect(readFileSync("src/components/QhdsButton/QhdsButton.scss", "utf8")).toContain(
      '.qhds-button[aria-disabled="true"]'
    );
  });

  it("suppresses disabled anchor clicks", () => {
    const onClick = vi.fn();
    const onNavigate = vi.fn();
    const element = renderInteractive(
      <QhdsButton disabled href="/blocked" onClick={onClick} onNavigate={onNavigate}>
        Blocked
      </QhdsButton>
    );
    const anchor = element.querySelector("a");
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });

    act(() => {
      anchor?.dispatchEvent(event);
    });

    expect(event.defaultPrevented).toBe(true);
    expect(onClick).not.toHaveBeenCalled();
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("supports route-style navigation callbacks without router imports", () => {
    const onClick = vi.fn();
    const onNavigate = vi.fn();
    const element = renderInteractive(
      <QhdsButton onClick={onClick} onNavigate={onNavigate} route="/service">
        Open service
      </QhdsButton>
    );
    const anchor = element.querySelector("a");
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });

    act(() => {
      anchor?.dispatchEvent(event);
    });

    expect(anchor?.getAttribute("href")).toBe("/service");
    expect(event.defaultPrevented).toBe(true);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onNavigate).toHaveBeenCalledWith("/service");
  });
});
