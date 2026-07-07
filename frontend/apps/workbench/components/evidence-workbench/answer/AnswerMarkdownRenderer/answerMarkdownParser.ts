export type MarkdownBlock =
  | { kind: "blockquote"; text: string }
  | { code: string; kind: "code"; language: string }
  | { diagram: GeneratedDiagram; kind: "diagram" }
  | { kind: "heading"; depth: 1 | 2; text: string }
  | { kind: "list"; items: string[]; ordered: boolean }
  | { kind: "paragraph"; text: string }
  | { headers: string[]; kind: "table"; rows: string[][] };

export interface GeneratedDiagram {
  nodes: GeneratedDiagramNode[];
  summary: string;
  title: string;
}

export interface GeneratedDiagramNode {
  description: string;
  label: string;
  tone: GeneratedDiagramTone;
}

export type GeneratedDiagramTone =
  | "context"
  | "evidence"
  | "neutral"
  | "review"
  | "warning";

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

export function parseAnswerMarkdown(markdown: string): MarkdownBlock[] {
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
