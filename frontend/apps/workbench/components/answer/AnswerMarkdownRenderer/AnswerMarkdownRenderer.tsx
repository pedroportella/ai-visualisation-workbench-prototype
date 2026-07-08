import type { ReactElement } from "react";

import type { EvidenceWorkbenchCitation } from "@aivis/services";
import { parseAnswerMarkdown } from "./answerMarkdownParser";
import { renderAnswerMarkdownBlock } from "./AnswerMarkdownBlocks";

interface AnswerMarkdownProps {
  citations: EvidenceWorkbenchCitation[];
  markdown: string;
  selectedClaimId: string;
  sourceInventoryPath?: string;
}

export function AnswerMarkdown({
  citations,
  markdown,
  selectedClaimId,
  sourceInventoryPath = ""
}: Readonly<AnswerMarkdownProps>): ReactElement {
  const citationsById = new Map(citations.map((citation) => [citation.id, citation]));
  const blocks = parseAnswerMarkdown(markdown);

  return (
    <div className="evidence-workbench-answer-markdown">
      {blocks.map((block, index) =>
        renderAnswerMarkdownBlock(block, {
          citationsById,
          keyPrefix: `answer-markdown-${index}`,
          selectedClaimId,
          sourceInventoryPath
        })
      )}
    </div>
  );
}
