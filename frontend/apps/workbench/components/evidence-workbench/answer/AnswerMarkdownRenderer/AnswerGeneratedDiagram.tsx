import type { ReactElement } from "react";

import type { GeneratedDiagram } from "./answerMarkdownParser";

interface AnswerGeneratedDiagramProps {
  diagram: GeneratedDiagram;
  headingId: string;
  idPrefix: string;
  summaryId: string;
}

export function AnswerGeneratedDiagram({
  diagram,
  headingId,
  idPrefix,
  summaryId
}: Readonly<AnswerGeneratedDiagramProps>): ReactElement {
  return (
    <figure
      aria-describedby={summaryId}
      aria-labelledby={headingId}
      className="evidence-workbench-generated-diagram"
      role="group"
    >
      <figcaption id={headingId}>{diagram.title}</figcaption>
      <p className="evidence-workbench-generated-diagram__summary" id={summaryId}>
        {diagram.summary}
      </p>
      <ol className="evidence-workbench-generated-diagram__steps">
        {diagram.nodes.map((node, index) => (
          <li
            className="evidence-workbench-generated-diagram__step"
            data-diagram-tone={node.tone}
            key={`${idPrefix}-diagram-node-${index}`}
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
            {diagram.nodes.map((node, index) => (
              <li key={`${idPrefix}-diagram-fallback-${index}`}>
                {node.label}: {node.description}
              </li>
            ))}
          </ol>
        </div>
      </details>
    </figure>
  );
}
