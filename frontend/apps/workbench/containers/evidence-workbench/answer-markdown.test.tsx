import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { EvidenceWorkbenchCitation } from "../../services/evidence-workbench/types";
import { AnswerMarkdown } from "./answer-markdown";

const fixtureCitations: EvidenceWorkbenchCitation[] = [
  {
    claimId: "CLAIM-001",
    excerptId: "SRC-001-EXCERPT-001",
    id: "CIT-001-A",
    marker: "[CIT-001-A]",
    relationship: "Supports",
    sourceId: "SRC-001",
    sourceLabel: "Synthetic lift works brief excerpt",
    status: "Supported",
    warningIds: []
  },
  {
    claimId: "CLAIM-002",
    excerptId: "SRC-002-EXCERPT-001",
    id: "CIT-002-A",
    marker: "[CIT-002-A]",
    relationship: "Supports With Warning",
    sourceId: "SRC-002",
    sourceLabel: "Stale temporary boarding map excerpt",
    status: "Stale",
    warningIds: ["WARN-001"]
  },
  {
    claimId: "CLAIM-003",
    excerptId: "SRC-003-EXCERPT-001",
    id: "CIT-003-A",
    marker: "[CIT-003-A]",
    relationship: "Partial Support",
    sourceId: "SRC-003",
    sourceLabel: "Accessible vehicle allocation guidance excerpt",
    status: "Conditional",
    warningIds: ["WARN-002"]
  },
  {
    claimId: "CLAIM-003",
    excerptId: "SRC-006-EXCERPT-MISSING",
    id: "CIT-003-B",
    marker: "[CIT-003-B]",
    relationship: "Missing Evidence",
    sourceId: "SRC-006",
    sourceLabel: "Missing dispatch confirmation placeholder",
    status: "Not available",
    warningIds: ["WARN-003"]
  }
];

const fixtureMarkdown = `# South Brisbane lift outage and PA Hospital accessible shuttle advice

**Review status:** Needs review. Do not approve as written.

For a customer using a mobility aid travelling from South Bank toward Princess
Alexandra Hospital, keep the answer in review. [CIT-001-A]

> Review blockers: \`WARN-001\` stale temporary boarding map and \`WARN-003\`
> missing day-of-service dispatch confirmation.

## What staff can say now

- Explain that the fixture points to a temporary boarding point on Grey Street.
  [CIT-002-A]
- Keep shuttle accessibility wording conditional. [CIT-003-A] [CIT-003-B]

## Evidence summary

| Claim | Current answer posture | Evidence state |
| --- | --- | --- |
| \`CLAIM-001\` | Lift unavailable during the fixture travel window | Supported [CIT-001-A] |
| \`CLAIM-003\` | Step-free shuttle guarantee | Missing dispatch confirmation [CIT-003-B] |`;

describe("AnswerMarkdown", () => {
  it("renders the fixture markdown structures needed by the answer panel", () => {
    const html = renderToStaticMarkup(
      <AnswerMarkdown
        citations={fixtureCitations}
        markdown={fixtureMarkdown}
        selectedClaimId="CLAIM-003"
      />
    );

    expect(html).toContain("<h3");
    expect(html).toContain("<h4");
    expect(html).toContain("<strong>Review status:</strong>");
    expect(html).toContain("<blockquote>");
    expect(html).toContain("<ul>");
    expect(html).toContain("<table>");
    expect(html).toContain("<code>WARN-001</code>");
    expect(html).toContain("<code>CLAIM-003</code>");
  });

  it("turns known citation markers into keyboard-focusable source links", () => {
    const html = renderToStaticMarkup(
      <AnswerMarkdown
        citations={fixtureCitations}
        markdown={fixtureMarkdown}
        selectedClaimId="CLAIM-003"
      />
    );

    expect(html).toContain('href="#source-SRC-003"');
    expect(html).toContain('href="#source-SRC-006"');
    expect(html).toContain('aria-label="Citation CIT-003-A for CLAIM-003.');
    expect(html).toContain('aria-current="true"');
    expect(html).toContain("evidence-workbench-citation-warning");
    expect(html).toContain("[CIT-003-A]");
  });

  it("renders unsafe HTML as escaped text instead of executable markup", () => {
    const html = renderToStaticMarkup(
      <AnswerMarkdown
        citations={fixtureCitations}
        markdown={`# Unsafe example

<script>alert("unsafe")</script>

<img src="x" onerror="alert('unsafe')">

- Keep this citation visible. [CIT-001-A]`}
        selectedClaimId="CLAIM-001"
      />
    );

    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;script&gt;alert(&quot;unsafe&quot;)&lt;/script&gt;");
    expect(html).toContain("&lt;img src=&quot;x&quot;");
    expect(html).toContain('href="#source-SRC-001"');
  });
});
