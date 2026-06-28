const workbenchSummary = [
  {
    label: "Fixture mode",
    value: "Synthetic fixture"
  },
  {
    label: "Runtime",
    value: "Local fixture"
  },
  {
    label: "Review state",
    value: "Needs review"
  }
];

const contextAnchors = [
  "South Brisbane station",
  "QPAC Grey Street",
  "Princess Alexandra Hospital"
];

const reviewClaims = [
  {
    id: "Claim 1",
    title: "Access change summary",
    status: "Stale source",
    text: "Synthetic scenario says the station access note needs a freshness check before reuse."
  },
  {
    id: "Claim 2",
    title: "Temporary boarding point",
    status: "Weak support",
    text: "Draft guidance references Grey Street context, but the supporting fixture source is incomplete."
  },
  {
    id: "Claim 3",
    title: "Step-free transfer assurance",
    status: "Missing evidence",
    text: "Day-of-service confirmation is represented by a missing-source placeholder."
  }
];

const sourceItems = [
  {
    title: "Synthetic station access notice",
    meta: "Fixture timestamp: 2026-06-27 09:00 AEST",
    status: "Synthetic fixture"
  },
  {
    title: "Synthetic wayfinding map extract",
    meta: "Review note: source may be stale",
    status: "Stale source"
  },
  {
    title: "Dispatch confirmation placeholder",
    meta: "Evidence state: missing-source placeholder",
    status: "Missing evidence"
  }
];

const reviewPath = [
  "Context anchor",
  "Draft answer",
  "Citation check",
  "Needs review"
];

export default function EvidenceWorkbenchContainer() {
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
          {workbenchSummary.map((item) => (
            <div className="evidence-workbench-summary-item" key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <section className="evidence-workbench-context" aria-labelledby="scenario-title">
        <div>
          <p className="evidence-workbench-eyebrow">Local review case</p>
          <h2 id="scenario-title">Step-free transfer guidance needs evidence review</h2>
          <p>
            Brisbane place names make the local fixture legible as context
            anchors. Review the draft answer, source trace and blockers before
            reuse.
          </p>
        </div>
        <ul className="evidence-workbench-anchor-list" aria-label="Context anchors">
          {contextAnchors.map((anchor) => (
            <li key={anchor}>
              <span>Context anchor</span>
              {anchor}
            </li>
          ))}
        </ul>
      </section>

      <div className="evidence-workbench-grid">
        <section className="evidence-workbench-panel" aria-labelledby="answer-title">
          <div className="evidence-workbench-panel-heading">
            <p className="evidence-workbench-eyebrow">Draft answer</p>
            <span className="evidence-workbench-status evidence-workbench-status-warning">
              Needs review
            </span>
          </div>
          <h2 id="answer-title">Reviewer answer preview</h2>
          <p className="evidence-workbench-lead">
            The draft guidance can describe a temporary step-free transfer, but
            it should stay blocked until stale and missing fixture evidence is
            resolved.
          </p>
          <div className="evidence-workbench-claim-stack" aria-label="Claims requiring review">
            {reviewClaims.map((claim) => (
              <article className="evidence-workbench-claim" key={claim.id}>
                <div>
                  <span>{claim.id}</span>
                  <strong>{claim.title}</strong>
                </div>
                <p>{claim.text}</p>
                <span className="evidence-workbench-status">{claim.status}</span>
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
            {sourceItems.map((source) => (
              <li key={source.title}>
                <strong>{source.title}</strong>
                <span>{source.meta}</span>
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
            {reviewPath.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p className="evidence-workbench-review-note">
            Copy and approval actions remain unavailable while the fixture
            answer has stale, weak-support and missing-evidence states.
          </p>
        </section>
      </div>
    </main>
  );
}
