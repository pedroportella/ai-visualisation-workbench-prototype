export default function EvidenceWorkbenchLoading() {
  return (
    <main
      aria-labelledby="evidence-workbench-loading-title"
      className="evidence-workbench"
      id="aivis-main"
      tabIndex={-1}
    >
      <header className="evidence-workbench-header">
        <div className="evidence-workbench-header-copy">
          <p className="evidence-workbench-eyebrow">Evidence Workbench</p>
          <h1 id="evidence-workbench-loading-title">AI Visualisation Workbench</h1>
          <p>Loading local fixture evidence for review.</p>
        </div>
        <dl className="evidence-workbench-summary" aria-label="Workbench status">
          <div className="evidence-workbench-summary-item">
            <dt>Data source</dt>
            <dd>Loading fixture</dd>
          </div>
        </dl>
      </header>
    </main>
  );
}
