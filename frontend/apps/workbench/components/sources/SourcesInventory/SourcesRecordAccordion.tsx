"use client";

import { useEffect, type ReactElement } from "react";

import { QhdsAccordion } from "@aivis/ui-library";

import type {
  EvidenceWorkbenchSource,
  EvidenceWorkbenchSourceWarning
} from "@aivis/services";
import {
  AivisEvidenceAnchorChipList,
  AivisEvidenceStatus,
  AivisEvidenceTokenList
} from "../../evidence/AivisEvidence";
import {
  hasApprovalBlocker,
  sourceAccordionItemId,
  sourceInventoryOrder,
  sourcePriority,
  sourceWarnings,
  warningSeverityLabel
} from "./sourcesInventoryModel";

export function SourcesRecordAccordion({
  sources
}: Readonly<{ sources: EvidenceWorkbenchSource[] }>): ReactElement {
  const orderedSources = sourceInventoryOrder(sources);

  return (
    <div className="evidence-workbench-source-records">
      <SourceInventoryHashFocusBridge />
      <QhdsAccordion
        headingLevel={3}
        items={orderedSources.map((source, index) => {
          const warnings = sourceWarnings(source);

          return {
            content: (
              <div
                className="evidence-workbench-source-inventory__detail-panel"
                data-source-expanded-default="false"
                data-source-filter-state={source.trustState}
                data-source-priority={sourcePriority(source)}
                data-source-row-order={index + 1}
              >
                <div className="evidence-workbench-source-evidence-row">
                  <section aria-label={`${source.id} evidence preview`}>
                    <h3>Evidence preview</h3>
                    <p>
                      Source title: <strong>{source.title}</strong>
                    </p>
                    <p>{source.preview}</p>
                    <p>
                      Source type: <strong>{source.sourceType}</strong>
                    </p>
                  </section>

                  <section aria-label={`${source.id} citation relationships`}>
                    <h3>Citation relationship</h3>
                    <AivisEvidenceTokenList
                      ariaLabel={`${source.id} citation relationships`}
                      emptyMessage="Present in the inventory, not cited by this answer."
                      items={source.citations.map((citation) => ({
                        description: citation.relationship,
                        href: `#claim-${citation.claimId}`,
                        id: citation.id,
                        label: citation.marker
                      }))}
                    />
                  </section>

                  <section aria-label={`${source.id} context anchors`}>
                    <h3>Context anchors</h3>
                    <AivisEvidenceAnchorChipList
                      anchors={source.contextAnchors.map((anchor) => ({
                        description: anchor.supportingText,
                        id: anchor.id,
                        label: anchor.label,
                        meta: "Context only"
                      }))}
                      ariaLabel={`${source.id} context anchors`}
                      emptyMessage="No public context anchor attached."
                    />
                  </section>
                </div>

                <SourceWarningSummary source={source} warnings={warnings} />

                <p className="evidence-workbench-source-inventory__owner">
                  Synthetic owner queue: <code>{source.reviewOwnerQueue}</code>
                </p>
              </div>
            ),
            id: sourceAccordionItemId(source.id),
            title: <SourceRecordAccordionTitle source={source} />
          };
        })}
      />
    </div>
  );
}

function SourceInventoryHashFocusBridge(): null {
  useEffect(() => {
    const focusHashTarget = (hash = window.location.hash) => {
      let targetId = "";

      try {
        targetId = decodeURIComponent(hash.slice(1));
      } catch {
        return;
      }

      if (targetId === "source-inventory-table") {
        focusElementById(targetId);
        return;
      }

      const sourceButtonId = sourceAccordionButtonIdFromHashTarget(targetId);

      if (!sourceButtonId) {
        return;
      }

      const sourceButton = document.getElementById(sourceButtonId);

      if (!(sourceButton instanceof HTMLButtonElement)) {
        return;
      }

      openContainingAccordionPanels(sourceButton);

      if (sourceButton.getAttribute("aria-expanded") !== "true") {
        sourceButton.click();
      }

      focusElement(sourceButton);
    };

    const handleHashChange = () => focusHashTarget();
    const handleSourceAnchorClick = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest("a[href*='#source-'], a[href='#source-inventory-table']");

      if (!(anchor instanceof HTMLAnchorElement) || !anchor.hash) {
        return;
      }

      if (anchor.origin === window.location.origin && anchor.pathname !== window.location.pathname) {
        return;
      }

      window.requestAnimationFrame(() => {
        focusHashTarget(anchor.hash);
      });
    };

    focusHashTarget();
    window.addEventListener("hashchange", handleHashChange);
    document.addEventListener("click", handleSourceAnchorClick);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      document.removeEventListener("click", handleSourceAnchorClick);
    };
  }, []);

  return null;
}

function SourceRecordAccordionTitle({
  source
}: Readonly<{ source: EvidenceWorkbenchSource }>): ReactElement {
  return (
    <span className="evidence-workbench-source-inventory__summary">
      <span className="evidence-workbench-source-inventory__source">
        <span className="evidence-workbench-source-inventory__cell-label">
          Record details
        </span>
        <strong>{source.id}</strong>
        <span>{source.title}</span>
      </span>

      <span className="evidence-workbench-source-inventory__detail-status">
        {source.isSelectedClaimSource ? (
          <AivisEvidenceStatus tone="neutral">Selected claim source</AivisEvidenceStatus>
        ) : null}
        {hasApprovalBlocker(source) ? (
          <AivisEvidenceStatus tone="warning">Approval blocker</AivisEvidenceStatus>
        ) : null}
      </span>
    </span>
  );
}

function focusElementById(targetId: string): void {
  const target = document.getElementById(targetId);

  if (target instanceof HTMLElement) {
    openContainingAccordionPanels(target);
    focusElement(target);
  }
}

function openContainingAccordionPanels(target: HTMLElement): void {
  const hiddenPanels: HTMLElement[] = [];
  let current: HTMLElement | null = target.parentElement;

  while (current) {
    if (
      current.classList.contains("qhds-accordion__panel") &&
      current.hidden
    ) {
      hiddenPanels.push(current);
    }

    current = current.parentElement;
  }

  hiddenPanels.reverse().forEach((panel) => {
    const controllingButtonId = panel.getAttribute("aria-labelledby");
    const controllingButton = controllingButtonId
      ? document.getElementById(controllingButtonId)
      : null;

    if (
      controllingButton instanceof HTMLButtonElement &&
      controllingButton.getAttribute("aria-expanded") !== "true"
    ) {
      controllingButton.click();
    }
  });
}

function focusElement(target: HTMLElement): void {
  window.requestAnimationFrame(() => {
    target.scrollIntoView({ block: "start" });
    target.focus({ preventScroll: true });
  });
}

function sourceAccordionButtonIdFromHashTarget(targetId: string): string | null {
  if (!targetId.startsWith("source-")) {
    return null;
  }

  if (targetId.endsWith("-accordion-button")) {
    return targetId;
  }

  if (targetId.endsWith("-accordion-panel")) {
    return targetId.replace(/-accordion-panel$/, "-accordion-button");
  }

  return `${targetId}-accordion-button`;
}

function SourceWarningSummary({
  source,
  warnings
}: Readonly<{
  source: EvidenceWorkbenchSource;
  warnings: EvidenceWorkbenchSourceWarning[];
}>): ReactElement {
  if (warnings.length === 0) {
    return (
      <p className="evidence-workbench-source-inventory__warning-empty">
        No direct source or citation relationship warning is attached to {source.id}.
      </p>
    );
  }

  return (
    <section
      aria-label={`${source.id} warning summary`}
      className="evidence-workbench-source-inventory__warning-summary"
    >
      <h3>Warning summary</h3>
      <ul>
        {warnings.map((warning) => (
          <li key={warning.id}>
            <div className="evidence-workbench-source-inventory__warning-row-header">
              <strong>{warning.id}</strong>
              <AivisEvidenceStatus tone="warning">{warningSeverityLabel(warning)}</AivisEvidenceStatus>
            </div>
            <dl className="evidence-workbench-source-inventory__warning-row">
              <div>
                <dt>Message</dt>
                <dd>{warning.message}</dd>
              </div>
              <div>
                <dt>Evidence impact</dt>
                <dd>{warning.evidenceImpact}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </section>
  );
}
