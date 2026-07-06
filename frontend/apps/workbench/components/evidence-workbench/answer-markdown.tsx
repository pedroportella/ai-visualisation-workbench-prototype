import type { ReactElement, ReactNode } from "react";

import {
  QhdsTable,
  type QhdsTableColumn,
  type QhdsTableRow
} from "@aivis/ui-library";

import type { EvidenceWorkbenchCitation } from "../../services/evidence-workbench/types";

interface AnswerMarkdownProps {
  citations: EvidenceWorkbenchCitation[];
  markdown: string;
  selectedClaimId: string;
  sourceInventoryPath?: string;
}

type MarkdownBlock =
  | { kind: "blockquote"; text: string }
  | { code: string; kind: "code"; language: string }
  | { diagram: GeneratedDiagram; kind: "diagram" }
  | { kind: "heading"; depth: 1 | 2; text: string }
  | { kind: "list"; items: string[]; ordered: boolean }
  | { kind: "paragraph"; text: string }
  | { headers: string[]; kind: "table"; rows: string[][] };

interface GeneratedDiagram {
  nodes: GeneratedDiagramNode[];
  summary: string;
  title: string;
}

interface GeneratedDiagramNode {
  description: string;
  label: string;
  tone: GeneratedDiagramTone;
}

type GeneratedDiagramTone = "context" | "evidence" | "neutral" | "review" | "warning";

const INLINE_TOKEN_PATTERN = /(\[[^\]\n]{1,120}\]\([^) \n]{1,300}\)|\*\*[^*\n]+\*\*|`[^`\n]+`|\[CIT-\d{3}-[A-Z]\])/g;
const CITATION_MARKER_PATTERN = /^\[CIT-\d{3}-[A-Z]\]$/;
const FENCE_START_PATTERN = /^```([A-Za-z0-9_-]+)?\s*$/;
const FENCE_END_PATTERN = /^```\s*$/;
const GENERATED_DIAGRAM_LANGUAGE = "aivis-diagram";
const GENERATED_DIAGRAM_TONES = new Set<GeneratedDiagramTone>([
  "context",
  "evidence",
  "neutral",
  "review",
  "warning"
]);

export function AnswerMarkdown({
  citations,
  markdown,
  selectedClaimId,
  sourceInventoryPath = ""
}: Readonly<AnswerMarkdownProps>): ReactElement {
  const citationsById = new Map(citations.map((citation) => [citation.id, citation]));
  const blocks = parseMarkdown(markdown);

  return (
    <div className="evidence-workbench-answer-markdown">
      {blocks.map((block, index) =>
        renderBlock(block, {
          citationsById,
          keyPrefix: `answer-markdown-${index}`,
          selectedClaimId,
          sourceInventoryPath
        })
      )}
    </div>
  );
}

function renderBlock(
  block: MarkdownBlock,
  context: RenderInlineContext
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
  context: RenderInlineContext
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
  context: RenderInlineContext
): ReactElement {
  const headingId = `${context.keyPrefix}-diagram-title`;
  const summaryId = `${context.keyPrefix}-diagram-summary`;

  return (
    <figure
      aria-describedby={summaryId}
      aria-labelledby={headingId}
      className="evidence-workbench-generated-diagram"
      key={context.keyPrefix}
      role="group"
    >
      <figcaption id={headingId}>{block.diagram.title}</figcaption>
      <p className="evidence-workbench-generated-diagram__summary" id={summaryId}>
        {block.diagram.summary}
      </p>
      <ol className="evidence-workbench-generated-diagram__steps">
        {block.diagram.nodes.map((node, index) => (
          <li
            className="evidence-workbench-generated-diagram__step"
            data-diagram-tone={node.tone}
            key={`${context.keyPrefix}-diagram-node-${index}`}
          >
            <span className="evidence-workbench-generated-diagram__step-count">
              Step {index + 1}
            </span>
            <strong>{node.label}</strong>
            <span>{node.description}</span>
          </li>
        ))}
      </ol>
      <details className="evidence-workbench-disclosure evidence-workbench-generated-diagram__fallback">
        <summary className="evidence-workbench-disclosure__summary">
          <span className="evidence-workbench-disclosure__summary-text">
            Diagram text fallback
          </span>
          <span className="evidence-workbench-disclosure__toggle">
            <span className="evidence-workbench-disclosure__toggle-closed">
              Show details
            </span>
            <span className="evidence-workbench-disclosure__toggle-open">
              Hide details
            </span>
          </span>
        </summary>
        <div className="evidence-workbench-disclosure__content evidence-workbench-generated-diagram__fallback-content">
          <ol>
            {block.diagram.nodes.map((node, index) => (
              <li key={`${context.keyPrefix}-diagram-fallback-${index}`}>
                {node.label}: {node.description}
              </li>
            ))}
          </ol>
        </div>
      </details>
    </figure>
  );
}

function renderTable(
  block: Extract<MarkdownBlock, { kind: "table" }>,
  context: RenderInlineContext
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
  context: RenderInlineContext
): ReactElement {
  if (block.depth === 1) {
    return <h3 key={context.keyPrefix}>{renderInlineContent(block.text, context)}</h3>;
  }

  return <h4 key={context.keyPrefix}>{renderInlineContent(block.text, context)}</h4>;
}

interface RenderInlineContext {
  citationsById: Map<string, EvidenceWorkbenchCitation>;
  keyPrefix: string;
  selectedClaimId: string;
  sourceInventoryPath: string;
}

function renderInlineContent(text: string, context: RenderInlineContext): ReactNode[] {
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
  context: RenderInlineContext
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

function parseMarkdown(markdown: string): MarkdownBlock[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: MarkdownBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const trimmedLine = lines[index]?.trim() ?? "";

    if (!trimmedLine) {
      index += 1;
      continue;
    }

    const heading = /^(#{1,2})\s+(.+)$/.exec(trimmedLine);
    const fence = FENCE_START_PATTERN.exec(trimmedLine);

    if (fence) {
      const codeFence = parseCodeFence(lines, index, fence[1] ?? "");
      blocks.push(codeFence.block);
      index = codeFence.nextIndex;
      continue;
    }

    if (heading) {
      blocks.push({
        depth: heading[1] === "#" ? 1 : 2,
        kind: "heading",
        text: heading[2]
      });
      index += 1;
      continue;
    }

    if (trimmedLine.startsWith(">")) {
      const quoteLines: string[] = [];

      while (index < lines.length) {
        const nextLine = lines[index]?.trim() ?? "";

        if (!nextLine.startsWith(">")) {
          break;
        }

        quoteLines.push(nextLine.replace(/^>\s?/, ""));
        index += 1;
      }

      blocks.push({
        kind: "blockquote",
        text: joinMarkdownLines(quoteLines)
      });
      continue;
    }

    if (trimmedLine.startsWith("- ")) {
      const listItems: string[] = [];

      while (index < lines.length) {
        const itemLine = lines[index]?.trim() ?? "";

        if (!itemLine || !itemLine.startsWith("- ")) {
          break;
        }

        const itemLines = [itemLine.slice(2)];
        index += 1;

        while (index < lines.length) {
          const continuation = lines[index]?.trim() ?? "";

          if (!continuation || isBlockStart(lines, index)) {
            break;
          }

          itemLines.push(continuation);
          index += 1;
        }

        listItems.push(joinMarkdownLines(itemLines));
      }

      blocks.push({
        items: listItems,
        kind: "list",
        ordered: false
      });
      continue;
    }

    if (isOrderedListStart(trimmedLine)) {
      const listItems: string[] = [];

      while (index < lines.length) {
        const itemLine = lines[index]?.trim() ?? "";

        if (!itemLine || !isOrderedListStart(itemLine)) {
          break;
        }

        const itemLines = [itemLine.replace(/^\d+\.\s+/, "")];
        index += 1;

        while (index < lines.length) {
          const continuation = lines[index]?.trim() ?? "";

          if (!continuation || isBlockStart(lines, index)) {
            break;
          }

          itemLines.push(continuation);
          index += 1;
        }

        listItems.push(joinMarkdownLines(itemLines));
      }

      blocks.push({
        items: listItems,
        kind: "list",
        ordered: true
      });
      continue;
    }

    if (isTableStart(lines, index)) {
      const table = parseTable(lines, index);
      blocks.push(table.block);
      index = table.nextIndex;
      continue;
    }

    const paragraphLines: string[] = [];

    while (index < lines.length) {
      const nextLine = lines[index]?.trim() ?? "";

      if (!nextLine || isBlockStart(lines, index)) {
        break;
      }

      paragraphLines.push(nextLine);
      index += 1;
    }

    blocks.push({
      kind: "paragraph",
      text: joinMarkdownLines(paragraphLines)
    });
  }

  return blocks;
}

function isBlockStart(lines: string[], index: number): boolean {
  const trimmedLine = lines[index]?.trim() ?? "";

  return (
    /^(#{1,2})\s+/.test(trimmedLine) ||
    FENCE_START_PATTERN.test(trimmedLine) ||
    trimmedLine.startsWith(">") ||
    trimmedLine.startsWith("- ") ||
    isOrderedListStart(trimmedLine) ||
    isTableStart(lines, index)
  );
}

function isOrderedListStart(line: string): boolean {
  return /^\d+\.\s+/.test(line);
}

function parseCodeFence(
  lines: string[],
  startIndex: number,
  language: string
): { block: MarkdownBlock; nextIndex: number } {
  const codeLines: string[] = [];
  let index = startIndex + 1;

  while (index < lines.length) {
    const line = lines[index] ?? "";

    if (FENCE_END_PATTERN.test(line.trim())) {
      index += 1;
      break;
    }

    codeLines.push(line);
    index += 1;
  }

  const normalizedLanguage = language.trim().toLowerCase();
  const code = codeLines.join("\n").replace(/\n+$/, "");

  if (normalizedLanguage === GENERATED_DIAGRAM_LANGUAGE) {
    return {
      block: {
        diagram: parseGeneratedDiagram(code),
        kind: "diagram"
      },
      nextIndex: index
    };
  }

  return {
    block: {
      code,
      kind: "code",
      language: normalizedLanguage
    },
    nextIndex: index
  };
}

function parseGeneratedDiagram(code: string): GeneratedDiagram {
  const lines = code.split("\n").map((line) => line.trim()).filter(Boolean);
  const nodes: GeneratedDiagramNode[] = [];
  let title = "Generated evidence diagram";
  let summary = "Static diagram generated from the markdown fixture.";

  for (const line of lines) {
    if (line.toLowerCase().startsWith("title:")) {
      title = line.slice(line.indexOf(":") + 1).trim() || title;
      continue;
    }

    if (line.toLowerCase().startsWith("summary:")) {
      summary = line.slice(line.indexOf(":") + 1).trim() || summary;
      continue;
    }

    if (line.startsWith("- ")) {
      const [label, description = "", tone = "neutral"] = line
        .slice(2)
        .split("|")
        .map((part) => part.trim());

      if (label) {
        nodes.push({
          description,
          label,
          tone: generatedDiagramTone(tone)
        });
      }
    }
  }

  if (nodes.length === 0) {
    nodes.push({
      description: lines.join(" "),
      label: "Generated diagram content",
      tone: "neutral"
    });
  }

  return {
    nodes,
    summary,
    title
  };
}

function generatedDiagramTone(value: string): GeneratedDiagramTone {
  return GENERATED_DIAGRAM_TONES.has(value as GeneratedDiagramTone)
    ? (value as GeneratedDiagramTone)
    : "neutral";
}

function isTableStart(lines: string[], index: number): boolean {
  const currentLine = lines[index]?.trim() ?? "";
  const nextLine = lines[index + 1]?.trim() ?? "";

  return currentLine.startsWith("|") && isTableSeparator(nextLine);
}

function isTableSeparator(line: string): boolean {
  return /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line);
}

function parseTable(
  lines: string[],
  startIndex: number
): { block: Extract<MarkdownBlock, { kind: "table" }>; nextIndex: number } {
  const headers = parseTableRow(lines[startIndex] ?? "");
  const rows: string[][] = [];
  let index = startIndex + 2;

  while (index < lines.length) {
    const line = lines[index]?.trim() ?? "";

    if (!line.startsWith("|") || isTableSeparator(line)) {
      break;
    }

    rows.push(parseTableRow(line));
    index += 1;
  }

  return {
    block: {
      headers,
      kind: "table",
      rows
    },
    nextIndex: index
  };
}

function parseTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function joinMarkdownLines(lines: string[]): string {
  return lines.filter(Boolean).join(" ");
}
