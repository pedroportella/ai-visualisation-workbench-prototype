import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const themeScss = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "theme.scss"), "utf8");

describe("QHDS SCSS theme entrypoint", () => {
  it("applies QHDS typography, link and focus tokens globally", () => {
    expect(themeScss).toContain("@use \"../../../ui-tokens/src/styles\"");
    expect(themeScss).toContain("@use \"./qhds-grid\"");
    expect(themeScss).toContain("font-family: var(--ssq-font-family-base)");
    expect(themeScss).toContain("font-family: var(--ssq-font-family-heading)");
    expect(themeScss).toContain("font-weight: var(--ssq-font-weight-semibold)");
    expect(themeScss).toContain("font-size: var(--ssq-font-size-h1-mobile)");
    expect(themeScss).toContain("line-height: var(--ssq-line-height-h1-mobile)");
    expect(themeScss).toContain("font-size: var(--ssq-font-size-h1-desktop)");
    expect(themeScss).toContain("line-height: var(--ssq-line-height-h1-desktop)");
    expect(themeScss).toContain("font-size: var(--ssq-font-size-h2-mobile)");
    expect(themeScss).toContain("font-size: var(--ssq-font-size-h2-desktop)");
    expect(themeScss).toContain("font-size: var(--ssq-font-size-h3-mobile)");
    expect(themeScss).toContain("line-height: var(--ssq-line-height-h3)");
    expect(themeScss).toContain("font-size: var(--ssq-font-size-h6-mobile)");
    expect(themeScss).toContain("line-height: var(--ssq-line-height-h6)");
    expect(themeScss).toContain("letter-spacing: var(--ssq-letter-spacing-default)");
    expect(themeScss).toContain("color: var(--ssq-color-link)");
    expect(themeScss).toContain("text-decoration-thickness: var(--ssq-link-decoration-thickness)");
    expect(themeScss).toContain("text-decoration-thickness: var(--ssq-link-decoration-thickness-hover)");
    expect(themeScss).toContain("outline: 3px solid var(--ssq-color-focus)");
    expect(themeScss).toContain("outline-offset: 2px");
  });

  it("mirrors QHDS body, abstract and display rhythm", () => {
    expect(themeScss).toContain(".qld__body p");
    expect(themeScss).toContain("line-height: var(--ssq-line-height-paragraph)");
    expect(themeScss).toContain(".qld__body *:not([type=\"hidden\"]) + p");
    expect(themeScss).toContain("margin-top: var(--ssq-paragraph-spacing-body)");
    expect(themeScss).toContain(".qld__abstract");
    expect(themeScss).toContain("font-size: var(--ssq-font-size-lead-mobile)");
    expect(themeScss).toContain("font-size: var(--ssq-font-size-lead-desktop)");
    expect(themeScss).toContain(".qld__display-xxxl");
    expect(themeScss).toContain("font-size: 3rem");
  });

  it("exposes QHDS light, alternate and dark body surface hooks", () => {
    expect(themeScss).toContain(".qld__body--light");
    expect(themeScss).toContain(".qld__body--alt");
    expect(themeScss).toContain(".qld__body--dark");
    expect(themeScss).toContain(".qld__body--dark-alt");
    expect(themeScss).toContain(".qld__footer--dark-alt");
    expect(themeScss).toContain("--ssq-color-heading: var(--ssq-palette-bright-heading)");
    expect(themeScss).toContain("--ssq-color-background: var(--ssq-palette-alt-background)");
    expect(themeScss).toContain("--ssq-color-background: var(--ssq-palette-bold-background)");
    expect(themeScss).toContain("--ssq-color-background: var(--ssq-palette-strong-background)");
    expect(themeScss).toContain("--ssq-color-link-visited: var(--ssq-palette-bold-link-visited)");
    expect(themeScss).toContain("--ssq-color-link-visited: var(--ssq-palette-strong-link-visited)");
    expect(themeScss).toContain("--ssq-color-action: var(--ssq-palette-bright-action)");
    expect(themeScss).toContain("--ssq-color-error: var(--ssq-palette-feedback-error)");
    expect(themeScss).toContain("--ssq-color-error: var(--QLD-color-status__error--lightest)");
    expect(themeScss).toContain("--ssq-color-invalid-border: var(--ssq-palette-feedback-error)");
    expect(themeScss).toContain("--ssq-color-invalid-border: var(--QLD-color-status__error--lightest)");
  });
});
