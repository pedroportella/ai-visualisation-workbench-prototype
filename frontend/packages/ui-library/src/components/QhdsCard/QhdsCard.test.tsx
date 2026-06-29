import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { QhdsButton } from "../QhdsButton";
import { QhdsCard } from "./QhdsCard";

describe("QhdsCard", () => {
  it("renders heading, content and optional action without implying action-card semantics", () => {
    const html = renderToStaticMarkup(
      <QhdsCard action={<QhdsButton href="/start">Start</QhdsButton>} heading="Apply online">
        <p>Prepare your details.</p>
      </QhdsCard>
    );

    expect(html).toContain("<article");
    expect(html).toContain("qld__card");
    expect(html).toContain("qld__card__title");
    expect(html).toContain("qld__card__footer");
    expect(html).toContain("Apply online");
    expect(html).toContain("Prepare your details.");
    expect(html).toContain('href="/start"');
    expect(html).not.toContain("qld__card__multi-action");
    expect(html).not.toContain("qld__card__action");
  });

  it("renders explicit single-action cards with one heading link", () => {
    const html = renderToStaticMarkup(
      <QhdsCard actionMode="single" heading="Source inventory" headingHref="/sources">
        <p>Review the source set.</p>
      </QhdsCard>
    );

    expect(html).toContain("qld__card__action");
    expect(html).toContain('<a class="qhds-card__heading-link" href="/sources">Source inventory</a>');
    expect(html).not.toContain("qld__card__multi-action");
  });

  it("renders explicit multi-action and compact workbench variants", () => {
    const html = renderToStaticMarkup(
      <QhdsCard
        action={<><QhdsButton href="/source-a">Source A</QhdsButton><QhdsButton href="/source-b">Source B</QhdsButton></>}
        actionMode="multi"
        density="compact"
        heading="Linked sources"
        variant="workbench"
      >
        <p>Choose a linked source.</p>
      </QhdsCard>
    );

    expect(html).toContain("qld__card__multi-action");
    expect(html).toContain("qhds-card--variant-workbench");
    expect(html).toContain("qhds-card--density-compact");
    expect(html).not.toContain("qld__card__action");
  });

  it("passes through card attributes and heading level for composed panels", () => {
    const html = renderToStaticMarkup(
      <QhdsCard
        aria-current="true"
        data-panel-state="selected"
        heading="Evidence source"
        headingId="source-heading"
        headingLevel={3}
        id="source-card"
      >
        <p>Source summary.</p>
      </QhdsCard>
    );

    expect(html).toContain('<article class="qld__card qhds-card qhds-card--variant-default qhds-card--density-default" aria-current="true" data-panel-state="selected" id="source-card">');
    expect(html).toContain('<h3 class="qld__card__title qhds-card__heading" id="source-heading">Evidence source</h3>');
  });
});
