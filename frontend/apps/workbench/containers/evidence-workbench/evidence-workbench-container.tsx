import type { EvidenceWorkbenchViewModel } from "../../services/evidence-workbench/types";

export default function EvidenceWorkbenchContainer({
  data
}: Readonly<{ data: EvidenceWorkbenchViewModel }>) {
  return (
    <main
      aria-labelledby="evidence-workbench-title"
      className="evidence-workbench"
      id="aivis-main"
      tabIndex={-1}
    >
      <header className="evidence-workbench-header">
        <div className="evidence-workbench-header-copy">
          <p className="evidence-workbench-eyebrow">Evidence Workbench</p>
          <h1 id="evidence-workbench-title">AI Visualisation Workbench</h1>
          <p>
            Review a synthetic transport-service guidance answer, its source
            trace and the blockers that keep it in review.
          </p>
        </div>
        <dl className="evidence-workbench-summary" aria-label="Workbench status">
          {data.summary.map((item) => (
            <div className="evidence-workbench-summary-item" key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      </header>

      {data.fetchState.message ? (
        <section className="evidence-workbench-fetch-state" role="status">
          <strong>{data.fetchState.message}</strong>
          <span>Review can continue against the fallback fixture state.</span>
        </section>
      ) : null}

      <section className="evidence-workbench-context" aria-labelledby="scenario-title">
        <div>
          <p className="evidence-workbench-eyebrow">Local review case</p>
          <h2 id="scenario-title">{data.context.title}</h2>
          <p>{data.context.question}</p>
          <p className="evidence-workbench-context-date">
            Planned fixture travel date: {data.context.plannedTravelDate}
          </p>
        </div>
        <ul className="evidence-workbench-anchor-list" aria-label="Context anchors">
          {data.context.anchors.map((anchor) => (
            <li key={anchor.id}>
              <span>Context anchor</span>
              <strong>{anchor.label}</strong>
              <small>{anchor.supportingText}</small>
            </li>
          ))}
        </ul>
      </section>

      <div className="evidence-workbench-grid">
        <section className="evidence-workbench-panel" aria-labelledby="answer-title">
          <div className="evidence-workbench-panel-heading">
            <p className="evidence-workbench-eyebrow">Draft answer</p>
            <span className="evidence-workbench-status evidence-workbench-status-warning">
              {data.answer.status}
            </span>
          </div>
          <h2 id="answer-title">{data.answer.title}</h2>
          <p className="evidence-workbench-lead">{data.answer.summary}</p>
          <p className="evidence-workbench-answer-meta">
            Fixture timestamp: {data.answer.generatedAt}
          </p>
          <div className="evidence-workbench-claim-stack" aria-label="Claims requiring review">
            {data.reviewClaims.map((claim) => (
              <article className="evidence-workbench-claim" key={claim.id}>
                <div>
                  <span>{claim.id}</span>
                  <strong>{claim.title}</strong>
                </div>
                <p>{claim.text}</p>
                <span className={statusClassName(claim.status)}>{claim.status}</span>
              </article>
            ))}
          </div>
        </section>

        <aside className="evidence-workbench-panel" aria-labelledby="sources-title">
          <div className="evidence-workbench-panel-heading">
            <p className="evidence-workbench-eyebrow">Source trace</p>
            <span className="evidence-workbench-status">Synthetic fixture</span>
          </div>
          <h2 id="sources-title">Evidence sources</h2>
          <ul className="evidence-workbench-source-list">
            {data.sourceItems.map((source) => (
              <li key={source.id}>
                <strong>{source.title}</strong>
                <span>{source.meta}</span>
                <p>{source.preview}</p>
                <em>{source.status}</em>
              </li>
            ))}
          </ul>
        </aside>

        <section className="evidence-workbench-panel" aria-labelledby="review-title">
          <div className="evidence-workbench-panel-heading">
            <p className="evidence-workbench-eyebrow">Review lane</p>
            <span className="evidence-workbench-status">Local fixture</span>
          </div>
          <h2 id="review-title">Evidence path</h2>
          <ol className="evidence-workbench-review-path">
            {data.graph.fallbackSteps.map((step) => (
              <li key={step.heading}>
                <strong>{step.heading}</strong>
                <span>{step.summary}</span>
              </li>
            ))}
          </ol>
          <p className="evidence-workbench-review-summary">{data.graph.accessibleSummary}</p>
          <p className="evidence-workbench-review-note">
            Copy state is {data.review.copyState}. Approval remains blocked by{" "}
            {data.review.blockedByWarningIds.join(", ")} with{" "}
            {data.review.activeWarningCount} active fixture warnings.
          </p>
          <ul className="evidence-workbench-warning-list" aria-label="Active fixture warnings">
            {data.warnings.map((warning) => (
              <li key={warning.id}>
                <strong>{warning.id}</strong>
                <span>{warning.severity}</span>
                <p>{warning.message}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}

function statusClassName(status: string): string {
  const isWarning = /missing|stale|weak|partial/i.test(status);
  return [
    "evidence-workbench-status",
    isWarning ? "evidence-workbench-status-warning" : ""
  ]
    .filter(Boolean)
    .join(" ");
}
