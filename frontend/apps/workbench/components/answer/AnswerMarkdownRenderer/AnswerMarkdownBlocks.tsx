import type { ReactElement, ReactNode } from "react";

import {
  QhdsTable,
  type QhdsTableColumn,
  type QhdsTableRow
} from "@aivis/ui-library";

import type { EvidenceWorkbenchCitation } from "@aivis/services";
import { AnswerGeneratedDiagram } from "./AnswerGeneratedDiagram";
import type { MarkdownBlock } from "./answerMarkdownParser";

interface AnswerMarkdownRenderContext {
  citationsById: Map<string, EvidenceWorkbenchCitation>;
  keyPrefix: string;
  selectedClaimId: string;
  sourceInventoryPath: string;
}

const INLINE_TOKEN_PATTERN = /(\[[^\]\n]{1,120}\]\([^) \n]{1,300}\)|\*\*[^*\n]+\*\*|`[^`\n]+`|\[CIT-\d{3}-[A-Z]\])/g;
const CITATION_MARKER_PATTERN = /^\[CIT-\d{3}-[A-Z]\]$/;

export function renderAnswerMarkdownBlock(
  block: MarkdownBlock,
  context: AnswerMarkdownRenderContext
): ReactElement {
  switch (block.kind) {
    case "heading":
      return renderHeading(block, context);
    case "blockquote":
      return (
        <blockquote
          className="evidence-workbench-answer-markdown__blockquote"
          key={context.keyPrefix}
        >
          <p>{renderInlineContent(block.text, context)}</p>
        </blockquote>
      );
    case "code":
      return renderCodeBlock(block, context);
    case "diagram":
      return renderGeneratedDiagram(block, context);
    case "list":
      return block.ordered ? (
        <ol key={context.keyPrefix}>
          {block.items.map((item, index) => (
            <li key={`${context.keyPrefix}-item-${index}`}>
              {renderInlineContent(item, {
                ...context,
                keyPrefix: `${context.keyPrefix}-item-${index}`
              })}
            </li>
          ))}
        </ol>
      ) : (
        <ul key={context.keyPrefix}>
          {block.items.map((item, index) => (
            <li key={`${context.keyPrefix}-item-${index}`}>
              {renderInlineContent(item, {
                ...context,
                keyPrefix: `${context.keyPrefix}-item-${index}`
              })}
            </li>
          ))}
        </ul>
      );
    case "table":
      return renderTable(block, context);
    case "paragraph":
      return (
        <p key={context.keyPrefix}>
          {renderInlineContent(block.text, context)}
        </p>
      );
  }
}

function renderCodeBlock(
  block: Extract<MarkdownBlock, { kind: "code" }>,
  context: AnswerMarkdownRenderContext
): ReactElement {
  const languageLabel = block.language ? `${block.language} code block` : "Code block";

  return (
    <pre
      aria-label={languageLabel}
      className="evidence-workbench-code-block"
      key={context.keyPrefix}
    >
      <code data-language={block.language || undefined}>{block.code}</code>
    </pre>
  );
}

function renderGeneratedDiagram(
  block: Extract<MarkdownBlock, { kind: "diagram" }>,
  context: AnswerMarkdownRenderContext
): ReactElement {
  const headingId = `${context.keyPrefix}-diagram-title`;
  const summaryId = `${context.keyPrefix}-diagram-summary`;

  return (
    <AnswerGeneratedDiagram
      diagram={block.diagram}
      headingId={headingId}
      idPrefix={context.keyPrefix}
      key={context.keyPrefix}
      summaryId={summaryId}
    />
  );
}

function renderTable(
  block: Extract<MarkdownBlock, { kind: "table" }>,
  context: AnswerMarkdownRenderContext
): ReactElement {
  const columns: QhdsTableColumn[] = block.headers.map((header, index) => ({
    dataLabel: header,
    header: renderInlineContent(header, {
      ...context,
      keyPrefix: `${context.keyPrefix}-header-${index}`
    }),
    key: `column-${index}`
  }));
  const rows: QhdsTableRow[] = block.rows.map((row, rowIndex) => {
    const cells: QhdsTableRow = { id: `${context.keyPrefix}-row-${rowIndex}` };

    row.forEach((cell, cellIndex) => {
      cells[`column-${cellIndex}`] = renderInlineContent(cell, {
        ...context,
        keyPrefix: `${context.keyPrefix}-cell-${rowIndex}-${cellIndex}`
      });
    });

    return cells;
  });

  return (
    <QhdsTable
      caption="Answer evidence summary"
      captionDescription="Source-linked evidence states from the draft answer."
      columns={columns}
      key={context.keyPrefix}
      rows={rows}
      striped
    />
  );
}

function renderHeading(
  block: Extract<MarkdownBlock, { kind: "heading" }>,
  context: AnswerMarkdownRenderContext
): ReactElement {
  if (block.depth === 1) {
    return <h3 key={context.keyPrefix}>{renderInlineContent(block.text, context)}</h3>;
  }

  return <h4 key={context.keyPrefix}>{renderInlineContent(block.text, context)}</h4>;
}

function renderInlineContent(
  text: string,
  context: AnswerMarkdownRenderContext
): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let tokenIndex = 0;

  for (const match of text.matchAll(INLINE_TOKEN_PATTERN)) {
    const matchIndex = match.index ?? 0;

    if (matchIndex > cursor) {
      nodes.push(text.slice(cursor, matchIndex));
    }

    const token = match[0];
    const key = `${context.keyPrefix}-inline-${tokenIndex}`;

    if (token.startsWith("**") && token.endsWith("**")) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("`") && token.endsWith("`")) {
      nodes.push(<code key={key}>{token.slice(1, -1)}</code>);
    } else if (CITATION_MARKER_PATTERN.test(token)) {
      nodes.push(renderCitationMarker(token, key, context));
    } else {
      nodes.push(renderMarkdownLink(token, key));
    }

    cursor = matchIndex + token.length;
    tokenIndex += 1;
  }

  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }

  return nodes;
}

function renderMarkdownLink(token: string, key: string): ReactNode {
  const link = /^\[([^\]\n]{1,120})\]\(([^) \n]{1,300})\)$/.exec(token);

  if (!link) {
    return token;
  }

  const label = link[1];
  const href = safeMarkdownHref(link[2]);

  if (!href) {
    return `${label} (${link[2]})`;
  }

  return (
    <a
      href={href}
      key={key}
      rel={isExternalHttpHref(href) ? "noreferrer" : undefined}
    >
      {label}
    </a>
  );
}

function safeMarkdownHref(rawHref: string): string | null {
  const href = rawHref.trim();

  if (/^#[A-Za-z][A-Za-z0-9_.:-]*$/.test(href)) {
    return href;
  }

  if (/^\/[A-Za-z0-9/_#?=&%.-]*$/.test(href)) {
    return href;
  }

  try {
    const parsedHref = new URL(href);

    return parsedHref.protocol === "https:" || parsedHref.protocol === "http:"
      ? href
      : null;
  } catch {
    return null;
  }
}

function isExternalHttpHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

function renderCitationMarker(
  marker: string,
  key: string,
  context: AnswerMarkdownRenderContext
): ReactNode {
  const citationId = marker.slice(1, -1);
  const citation = context.citationsById.get(citationId);

  if (!citation) {
    return marker;
  }

  const isSelectedClaim = citation.claimId === context.selectedClaimId;

  return (
    <a
      aria-current={isSelectedClaim ? "true" : undefined}
      aria-label={citationAriaLabel(citation)}
      className={citationClassName(citation, isSelectedClaim)}
      href={`${context.sourceInventoryPath}#source-${citation.sourceId}`}
      key={key}
    >
      {citation.marker}
    </a>
  );
}

function citationClassName(
  citation: EvidenceWorkbenchCitation,
  isSelectedClaim: boolean
): string {
  return [
    "qld__tag",
    "evidence-workbench-citation",
    citation.warningIds.length > 0 ? "evidence-workbench-citation-warning" : "",
    isSelectedClaim ? "evidence-workbench-citation-selected" : ""
  ]
    .filter(Boolean)
    .join(" ");
}

function citationAriaLabel(citation: EvidenceWorkbenchCitation): string {
  const warningText =
    citation.warningIds.length > 0
      ? ` Warnings ${citation.warningIds.join(", ")}.`
      : "";

  return (
    `Citation ${citation.id} for ${citation.claimId}. ` +
    `Source ${citation.sourceId}, ${citation.sourceLabel}. ` +
    `Status ${citation.status}.${warningText}`
  );
}
