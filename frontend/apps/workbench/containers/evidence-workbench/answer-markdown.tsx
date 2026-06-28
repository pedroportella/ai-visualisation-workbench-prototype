import type { ReactElement, ReactNode } from "react";

import type { EvidenceWorkbenchCitation } from "../../services/evidence-workbench/types";

interface AnswerMarkdownProps {
  citations: EvidenceWorkbenchCitation[];
  markdown: string;
  selectedClaimId: string;
}

type MarkdownBlock =
  | { kind: "blockquote"; text: string }
  | { kind: "heading"; depth: 1 | 2; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "paragraph"; text: string }
  | { headers: string[]; kind: "table"; rows: string[][] };

const INLINE_TOKEN_PATTERN = /(\*\*[^*]+\*\*|`[^`]+`|\[CIT-\d{3}-[A-Z]\])/g;
const CITATION_MARKER_PATTERN = /^\[CIT-\d{3}-[A-Z]\]$/;

export function AnswerMarkdown({
  citations,
  markdown,
  selectedClaimId
}: Readonly<AnswerMarkdownProps>): ReactElement {
  const citationsById = new Map(citations.map((citation) => [citation.id, citation]));
  const blocks = parseMarkdown(markdown);

  return (
    <div className="evidence-workbench-answer-markdown">
      {blocks.map((block, index) =>
        renderBlock(block, {
          citationsById,
          keyPrefix: `answer-markdown-${index}`,
          selectedClaimId
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
        <blockquote key={context.keyPrefix}>
          <p>{renderInlineContent(block.text, context)}</p>
        </blockquote>
      );
    case "list":
      return (
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
      return (
        <div
          aria-label="Answer evidence summary table"
          className="evidence-workbench-markdown-table-wrap"
          key={context.keyPrefix}
          role="region"
          tabIndex={0}
        >
          <table>
            <thead>
              <tr>
                {block.headers.map((header, index) => (
                  <th key={`${context.keyPrefix}-header-${index}`} scope="col">
                    {renderInlineContent(header, {
                      ...context,
                      keyPrefix: `${context.keyPrefix}-header-${index}`
                    })}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={`${context.keyPrefix}-row-${rowIndex}`}>
                  {row.map((cell, cellIndex) => (
                    <td key={`${context.keyPrefix}-cell-${rowIndex}-${cellIndex}`}>
                      {renderInlineContent(cell, {
                        ...context,
                        keyPrefix: `${context.keyPrefix}-cell-${rowIndex}-${cellIndex}`
                      })}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "paragraph":
      return (
        <p key={context.keyPrefix}>
          {renderInlineContent(block.text, context)}
        </p>
      );
  }
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
}

function renderInlineContent(text: string, context: RenderInlineContext): ReactNode[] {
  const nodes: ReactNode[] = [];
  const tokenPattern = new RegExp(INLINE_TOKEN_PATTERN);
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
    } else if (tokenPattern.test(token)) {
      nodes.push(token);
    }

    cursor = matchIndex + token.length;
    tokenIndex += 1;
  }

  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }

  return nodes;
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
      href={`#source-${citation.sourceId}`}
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
        kind: "list"
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
    trimmedLine.startsWith(">") ||
    trimmedLine.startsWith("- ") ||
    isTableStart(lines, index)
  );
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
