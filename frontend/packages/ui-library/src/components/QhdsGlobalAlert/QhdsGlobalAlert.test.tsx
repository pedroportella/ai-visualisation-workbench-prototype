import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { QhdsGlobalAlert } from "./QhdsGlobalAlert";

const styles = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "QhdsGlobalAlert.scss"), "utf8");

describe("QhdsGlobalAlert", () => {
  it("renders QHDS global alert markup for general information", () => {
    const html = renderToStaticMarkup(
      <QhdsGlobalAlert
        action={{ href: "/evidence-workbench/review", label: "Start review" }}
        dismissible
        level="general"
        title="Backend fixture unavailable."
        verticalNav
      >
        Review can continue against the bundled fallback fixture state.
      </QhdsGlobalAlert>
    );

    expect(html).toContain("qld__global_alert_include");
    expect(html).toContain("qld__global-alert_include");
    expect(html).toContain("qhds-global-alert-include");
    expect(html).toContain("qhds-global-alert-include--vertical-nav");
    expect(html).toContain('role="region"');
    expect(html).toContain('aria-label="Information"');
    expect(html).toContain("qld__global-alert qld__global-alert--general");
    expect(html).toContain("qhds-global-alert--general");
    expect(html).toContain("qld__global-alert__main");
    expect(html).toContain("qld__global-alert__icon");
    expect(html).toContain("qld__global-alert__content");
    expect(html).toContain("qld__global-alert__message");
    expect(html).toContain("qld__global-alert__action");
    expect(html).toContain("qld__global-alert__close");
    expect(html).toContain("Backend fixture unavailable.");
    expect(html).toContain("Review can continue against the bundled fallback fixture state.");
    expect(html).toContain('href="/evidence-workbench/review"');
    expect(html).toContain("alert-information");
    expect(html).toContain("arrow-right");
    expect(html).toContain("Close alert");
    expect(html).toContain("close");
  });

  it("maps levels to QHDS alert classes and icon labels", () => {
    const critical = renderToStaticMarkup(
      <QhdsGlobalAlert level="critical" title="Service interruption" />
    );
    const general = renderToStaticMarkup(
      <QhdsGlobalAlert level="general" title="Information update" />
    );

    expect(critical).toContain('aria-label="Alert"');
    expect(critical).toContain("qld__global-alert--critical");
    expect(critical).toContain("alert-danger");
    expect(general).toContain('aria-label="Information"');
    expect(general).toContain("qld__global-alert--general");
    expect(general).toContain("alert-information");
  });

  it("keeps global alert colours on token variables", () => {
    expect(styles).toContain("background-color: var(--QLD-color-status__caution)");
    expect(styles).toContain("background-color: var(--QLD-color-status__error)");
    expect(styles).toContain("background-color: var(--QLD-color-status__info--lighter)");
    expect(styles).toContain("color: var(--QLD-color-light__text)");
    expect(styles).toContain("color: var(--QLD-color-light__link--on-action)");
    expect(styles).toContain(".qld__global_alert_include");
    expect(styles).not.toMatch(/#[0-9a-fA-F]{3,8}|rgb\(|rgba\(/);
  });

  it("matches the QHDS strip sizing hooks for icons and spacing", () => {
    expect(styles).toContain("font-size: var(--qhds-font-size-xs)");
    expect(styles).toContain("line-height: var(--qhds-line-height-base)");
    expect(styles).toContain("display: flow-root");
    expect(styles).toContain(".qhds-global-alert__icon .qld__icon");
    expect(styles).toContain("height: var(--qhds-space-6)");
    expect(styles).toContain("width: var(--qhds-space-6)");
    expect(styles).toContain(".qhds-global-alert__action .qld__icon");
    expect(styles).toContain("height: var(--qhds-space-4)");
    expect(styles).toContain("width: var(--qhds-space-4)");
    expect(styles).toContain("background-color: color-mix(in srgb, currentColor 10%, transparent)");
    expect(styles).toContain("border: 0");
  });
});
