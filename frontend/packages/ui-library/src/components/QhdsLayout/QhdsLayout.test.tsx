import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { QhdsHeader } from "../QhdsHeader";
import { QhdsLayout } from "./QhdsLayout";

const styles = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "QhdsLayout.scss"), "utf8");

describe("QhdsLayout", () => {
  it("renders the app chrome with a skip link and stable main region", () => {
    const html = renderToStaticMarkup(
      <QhdsLayout footer={<footer>Footer</footer>} header={<header>Header</header>}>
        <h1>Body</h1>
      </QhdsLayout>
    );

    expect(html).toContain("qld__grid");
    expect(html).toContain("qhds-layout");
    expect(html).toContain("qhds-layout--app");
    expect(html).toContain('aria-label="skip links"');
    expect(html).toContain('href="#content"');
    expect(html).toContain('<main class="main qhds-layout__main" tabindex="-1">');
    expect(html).toContain('<section class="qld__body qhds-layout__body">');
    expect(html).toContain('class="container-fluid qhds-layout__container"');
    expect(html).toContain('class="col-xs-12 col-lg-12 col-xl-12 qhds-layout__content qhds-layout__content--full" id="content"');
    expect(html).toContain('id="content" tabindex="-1"');
    expect(html).toContain("Header");
    expect(html).toContain("Body");
    expect(html).toContain("Footer");
    expect(html).not.toContain("// global alert here");
  });

  it("places a global alert strip between the header and main content", () => {
    const html = renderToStaticMarkup(
      <QhdsLayout
        globalAlert={<div className="qld__global_alert_include">Global alert</div>}
        header={<header>Header</header>}
      >
        <h1>Body</h1>
      </QhdsLayout>
    );
    const headerIndex = html.indexOf("<header>Header</header>");
    const alertIndex = html.indexOf("qld__global_alert_include");
    const mainIndex = html.indexOf('<main class="main qhds-layout__main"');

    expect(alertIndex).toBeGreaterThan(headerIndex);
    expect(mainIndex).toBeGreaterThan(alertIndex);
    expect(html).toContain("Global alert");
  });

  it("renders optional left navigation as a QHDS vertical-nav shell", () => {
    const html = renderToStaticMarkup(
      <QhdsLayout sideNav={<nav aria-label="Account sections">Navigation</nav>}>
        <h1>Body</h1>
      </QhdsLayout>
    );

    expect(html).toContain("vertical-nav");
    expect(html).toContain("qhds-layout--has-left-nav");
    expect(html).toContain('href="#section-navigation"');
    expect(html).toContain("qhds-layout__skip-link--section-nav");
    expect(html).toContain('class="qhds-layout__left-nav" id="section-navigation"');
    expect(html).toContain('class="qld__body--left-nav qhds-layout__left-nav-content"');
    expect(html).toContain('class="col-xs-12 col-lg-12 col-xl-12 qhds-layout__content qhds-layout__content--full" id="content"');
    expect(html).toContain('<nav aria-label="Account sections">Navigation</nav>');
    expect(html).not.toContain("qhds-layout__sidebar");
  });

  it("hides section navigation in focus mode", () => {
    const html = renderToStaticMarkup(
      <QhdsLayout focusMode sideNav={<nav>Navigation</nav>}>
        <h1>Focused workflow</h1>
      </QhdsLayout>
    );

    expect(html).toContain("qhds-layout--focus");
    expect(html).toContain("qhds-layout__content--task");
    expect(html).not.toContain("vertical-nav");
    expect(html).not.toContain("qhds-layout__left-nav");
  });

  it("supports contained body-width content while preserving the stable content target", () => {
    const html = renderToStaticMarkup(
      <QhdsLayout contentLabelledBy="page-title" contentWidth="body" width="contained">
        <h1 id="page-title">Readable page</h1>
      </QhdsLayout>
    );

    expect(html).toContain("qhds-layout--contained");
    expect(html).toContain("qhds-layout__content--body");
    expect(html).toContain('aria-labelledby="page-title"');
    expect(html).toContain('id="content"');
    expect(styles).toContain(".qhds-layout--app .qhds-layout__container");
    expect(styles).toContain("max-width: none");
    expect(styles).toContain("padding-left: 2rem");
    expect(styles).toContain(".qhds-layout--contained .qhds-layout__container");
    expect(styles).toContain("max-width: var(--qld-grid-container-max-width)");
    expect(styles).toContain(".qhds-layout__content--task");
    expect(styles).toContain("max-width: 76rem");
    expect(styles).toContain(".qhds-layout--has-left-nav .qhds-layout__main");
    expect(styles).toContain(".qhds-layout__left-nav");
    expect(styles).toContain("background-color: var(--qhds-color-left-nav-background)");
    expect(styles).toContain("border-right: var(--QLD-border-width-default) solid var(--qhds-color-left-nav-border)");
    expect(styles).toContain(".qhds-layout__left-nav > .qld__left-nav.qhds-side-nav");
    expect(styles).toContain("background-color: transparent");
    expect(styles).toContain("border-right: 0");
    expect(styles).toContain(".qhds-layout--app.qhds-layout--has-left-nav .qld__body--left-nav .qhds-layout__container");
    expect(styles).toContain("padding-left: clamp(3rem, 5vw, 8rem)");
    expect(styles).toContain("padding-right: var(--qhds-space-10)");
    expect(styles).toContain(".qhds-layout__skip-link--section-nav");
    expect(styles).toContain("display: none");
    expect(styles).toContain(".qhds-layout__content:focus");
    expect(styles).toContain("outline: 3px solid var(--qhds-color-focus)");
  });

  it("keeps skip-link ownership in the layout when composed with QhdsHeader", () => {
    const html = renderToStaticMarkup(
      <QhdsLayout header={<QhdsHeader />}>
        <h1>Body</h1>
      </QhdsLayout>
    );

    expect((html.match(/class="qld__skip-link qhds-layout__skip-links"/g) ?? []).length).toBe(1);
    expect((html.match(/role="banner"/g) ?? []).length).toBe(1);
  });
});
