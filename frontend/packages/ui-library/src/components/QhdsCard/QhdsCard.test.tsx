import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { QhdsButton } from "../QhdsButton";
import { QhdsCard } from "./QhdsCard";

describe("QhdsCard", () => {
  it("renders heading, content and optional action", () => {
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

    expect(html).toContain('<article class="qld__card qhds-card" aria-current="true" data-panel-state="selected" id="source-card">');
    expect(html).toContain('<h3 class="qld__card__title qhds-card__heading" id="source-heading">Evidence source</h3>');
  });
});
