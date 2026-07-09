import type { HTMLAttributes, ReactNode } from "react";

import {
  QhdsButton,
  QhdsCard,
  QhdsSummaryList,
  type QhdsSummaryListItem
} from "@aivis/ui-library";

export type EvidenceWorkbenchTone = "neutral" | "success" | "warning";

export interface EvidenceWorkbenchStatusProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  tone?: EvidenceWorkbenchTone;
}

export function EvidenceWorkbenchStatus({
  children,
  className,
  tone = "neutral",
  ...props
}: EvidenceWorkbenchStatusProps) {
  return (
    <span
      className={["qld__tag", "aivis-evidence-status", `aivis-evidence-status--${tone}`, className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </span>
  );
}

export interface EvidenceWorkbenchPanelHeaderProps {
  label: ReactNode;
  status?: ReactNode;
  statusTone?: EvidenceWorkbenchTone;
}

export function EvidenceWorkbenchPanelHeader({
  label,
  status,
  statusTone = "neutral"
}: EvidenceWorkbenchPanelHeaderProps) {
  return (
    <div className="aivis-evidence-panel-header">
      <p className="aivis-evidence-panel-header__label">{label}</p>
      {status ? <EvidenceWorkbenchStatus tone={statusTone}>{status}</EvidenceWorkbenchStatus> : null}
    </div>
  );
}

export interface EvidenceWorkbenchMetadataProps {
  ariaLabel?: string;
  className?: string;
  items: QhdsSummaryListItem[];
}

export function EvidenceWorkbenchMetadata({
  ariaLabel,
  className,
  items
}: EvidenceWorkbenchMetadataProps) {
  return (
    <QhdsSummaryList
      ariaLabel={ariaLabel}
      className={["aivis-evidence-metadata", className].filter(Boolean).join(" ")}
      items={items}
    />
  );
}

export interface EvidenceWorkbenchCalloutProps {
  children: ReactNode;
  className?: string;
  heading: ReactNode;
  headingLevel?: 3 | 4;
  tone?: EvidenceWorkbenchTone;
}

export function EvidenceWorkbenchCallout({
  children,
  className,
  heading,
  headingLevel = 3,
  tone = "neutral"
}: EvidenceWorkbenchCalloutProps) {
  const calloutClassName = [
    "qld__callout",
    "aivis-evidence-callout",
    `aivis-evidence-callout--${tone}`,
    className
  ]
    .filter(Boolean)
    .join(" ");
  const headingClassName = "qld__callout__heading aivis-evidence-callout__heading";
  const HeadingTag = headingLevel === 4 ? "h4" : "h3";

  return (
    <div className={calloutClassName}>
      <HeadingTag className={headingClassName}>{heading}</HeadingTag>
      <div className="aivis-evidence-callout__content">{children}</div>
    </div>
  );
}

export interface EvidenceWorkbenchAnchor {
  description: ReactNode;
  id: string;
  label: ReactNode;
  meta?: ReactNode;
}

export interface EvidenceWorkbenchContextAnchorsProps {
  anchors: EvidenceWorkbenchAnchor[];
  anchorSummary: ReactNode;
  ariaLabel?: string;
  dateLabel: ReactNode;
  summary: ReactNode;
}

export function EvidenceWorkbenchContextAnchors({
  anchors,
  anchorSummary,
  ariaLabel = "Context anchors",
  dateLabel,
  summary
}: EvidenceWorkbenchContextAnchorsProps) {
  return (
    <div className="aivis-place-context">
      <div className="aivis-place-context__summary">
        <p>{summary}</p>
        <p className="aivis-place-context__date">{dateLabel}</p>
      </div>
      <section aria-label="Public context anchors" className="aivis-place-context__anchors">
        <h3>Public context anchors</h3>
        <p>{anchorSummary}</p>
        <ul aria-label={ariaLabel} className="aivis-evidence-anchor-list">
          {anchors.map((anchor) => (
            <li key={anchor.id}>
              <strong>{anchor.label}</strong>
              {anchor.meta ? <EvidenceWorkbenchStatus tone="neutral">{anchor.meta}</EvidenceWorkbenchStatus> : null}
              <small>{anchor.description}</small>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export interface EvidenceWorkbenchClaimCardProps extends Omit<HTMLAttributes<HTMLElement>, "children" | "title"> {
  claimId: ReactNode;
  selected?: boolean;
  selectedLabel?: ReactNode;
  status: ReactNode;
  statusTone?: EvidenceWorkbenchTone;
  text: ReactNode;
  title: ReactNode;
}

export function EvidenceWorkbenchClaimCard({
  claimId,
  className,
  selected = false,
  selectedLabel,
  status,
  statusTone = "neutral",
  text,
  title,
  ...props
}: EvidenceWorkbenchClaimCardProps) {
  return (
    <QhdsCard
      {...props}
      actionMode="none"
      aria-current={selected ? "true" : props["aria-current"]}
      className={[
        "aivis-evidence-card",
        "aivis-evidence-claim-card",
        selected ? "aivis-evidence-card--selected" : "",
        statusTone === "warning" ? "aivis-evidence-card--warning" : "",
        className
      ]
        .filter(Boolean)
        .join(" ")}
      data-selected-claim={selected ? "true" : undefined}
      density="compact"
      heading={title}
      headingLevel={3}
      variant="workbench"
    >
      <div className="aivis-evidence-card__meta">
        <span className="aivis-evidence-card__id">{claimId}</span>
        {selected && selectedLabel ? <EvidenceWorkbenchStatus tone="neutral">{selectedLabel}</EvidenceWorkbenchStatus> : null}
      </div>
      <p>{text}</p>
      <EvidenceWorkbenchStatus tone={statusTone}>{status}</EvidenceWorkbenchStatus>
    </QhdsCard>
  );
}

export interface EvidenceWorkbenchSourceCardProps extends Omit<HTMLAttributes<HTMLElement>, "children" | "title"> {
  children: ReactNode;
  metadataItems: QhdsSummaryListItem[];
  preview: ReactNode;
  selected?: boolean;
  selectedLabel?: ReactNode;
  sourceId: ReactNode;
  status: ReactNode;
  statusTone?: EvidenceWorkbenchTone;
  title: ReactNode;
}

export function EvidenceWorkbenchSourceCard({
  children,
  className,
  metadataItems,
  preview,
  selected = false,
  selectedLabel,
  sourceId,
  status,
  statusTone = "neutral",
  title,
  ...props
}: EvidenceWorkbenchSourceCardProps) {
  return (
    <QhdsCard
      {...props}
      actionMode="none"
      aria-current={selected ? "true" : props["aria-current"]}
      className={[
        "aivis-evidence-card",
        "aivis-evidence-source-card",
        selected ? "aivis-evidence-card--selected" : "",
        statusTone === "warning" ? "aivis-evidence-card--warning" : "",
        className
      ]
        .filter(Boolean)
        .join(" ")}
      density="compact"
      heading={title}
      headingLevel={3}
      variant="workbench"
    >
      <div className="aivis-evidence-source-card__header">
        <span className="aivis-evidence-card__id">{sourceId}</span>
        <div className="aivis-evidence-source-card__badges">
          <EvidenceWorkbenchStatus tone={statusTone}>{status}</EvidenceWorkbenchStatus>
          {selected && selectedLabel ? <EvidenceWorkbenchStatus tone="neutral">{selectedLabel}</EvidenceWorkbenchStatus> : null}
        </div>
      </div>
      <EvidenceWorkbenchMetadata
        ariaLabel={typeof sourceId === "string" ? `${sourceId} source metadata` : undefined}
        items={metadataItems}
      />
      <p>{preview}</p>
      {children}
    </QhdsCard>
  );
}

export interface EvidenceWorkbenchPathItem {
  heading: ReactNode;
  summary: ReactNode;
}

export interface EvidenceWorkbenchPathListProps {
  ariaLabel?: string;
  items: EvidenceWorkbenchPathItem[];
}

export function EvidenceWorkbenchPathList({
  ariaLabel = "Evidence path",
  items
}: EvidenceWorkbenchPathListProps) {
  return (
    <ol aria-label={ariaLabel} className="aivis-evidence-path-list">
      {items.map((item, index) => (
        <li key={index}>
          <QhdsCard
            actionMode="none"
            className="aivis-evidence-card aivis-evidence-path-list__card"
            density="compact"
            heading={item.heading}
            headingLevel={3}
            variant="workbench"
          >
            <span>{item.summary}</span>
          </QhdsCard>
        </li>
      ))}
    </ol>
  );
}

export interface EvidenceWorkbenchWarning {
  id: ReactNode;
  impact?: ReactNode;
  message: ReactNode;
  severity: ReactNode;
}

export interface EvidenceWorkbenchWarningListProps {
  ariaLabel?: string;
  warnings: EvidenceWorkbenchWarning[];
}

export function EvidenceWorkbenchWarningList({
  ariaLabel = "Active warnings",
  warnings
}: EvidenceWorkbenchWarningListProps) {
  return (
    <ul aria-label={ariaLabel} className="aivis-evidence-warning-list">
      {warnings.map((warning, index) => (
        <li key={index}>
          <div className="aivis-evidence-warning-list__item">
            <div className="aivis-evidence-warning-list__header">
              <strong>{warning.id}</strong>
              <EvidenceWorkbenchStatus tone="warning">{warning.severity}</EvidenceWorkbenchStatus>
            </div>
            <p>{warning.message}</p>
            {warning.impact ? <small>{warning.impact}</small> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

export interface EvidenceWorkbenchTokenLink {
  ariaLabel?: string;
  description?: ReactNode;
  href: string;
  id: string;
  label: ReactNode;
}

export interface EvidenceWorkbenchTokenListProps {
  ariaLabel: string;
  emptyMessage?: ReactNode;
  items: EvidenceWorkbenchTokenLink[];
}

export function EvidenceWorkbenchTokenList({
  ariaLabel,
  emptyMessage,
  items
}: EvidenceWorkbenchTokenListProps) {
  if (items.length === 0) {
    return emptyMessage ? <p className="aivis-evidence-note">{emptyMessage}</p> : null;
  }

  return (
    <ul aria-label={ariaLabel} className="aivis-evidence-token-list qld__link-list">
      {items.map((item) => (
        <li key={item.id}>
          <QhdsButton
            aria-label={item.ariaLabel}
            className="aivis-evidence-token-list__link"
            href={item.href}
            variant="secondary"
          >
            <strong>{item.label}</strong>
            {item.description ? <span>{item.description}</span> : null}
          </QhdsButton>
        </li>
      ))}
    </ul>
  );
}

export interface EvidenceWorkbenchFilterLink extends EvidenceWorkbenchTokenLink {
  count: ReactNode;
}

export interface EvidenceWorkbenchFilterNavProps {
  ariaLabel: string;
  filters: EvidenceWorkbenchFilterLink[];
}

export function EvidenceWorkbenchFilterNav({
  ariaLabel,
  filters
}: EvidenceWorkbenchFilterNavProps) {
  return (
    <nav aria-label={ariaLabel} className="aivis-evidence-filter-nav">
      <ul className="qld__link-list aivis-evidence-filter-nav__list">
        {filters.map((filter) => (
          <li key={filter.id}>
            <a
              aria-label={filter.ariaLabel}
              className="aivis-evidence-filter-nav__link"
              href={filter.href}
            >
              <span>{filter.label}</span>
              <strong>{filter.count}</strong>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export interface EvidenceWorkbenchAnchorChipListProps {
  anchors: EvidenceWorkbenchAnchor[];
  ariaLabel: string;
  emptyMessage?: ReactNode;
}

export function EvidenceWorkbenchAnchorChipList({
  anchors,
  ariaLabel,
  emptyMessage
}: EvidenceWorkbenchAnchorChipListProps) {
  if (anchors.length === 0) {
    return emptyMessage ? <p className="aivis-evidence-note">{emptyMessage}</p> : null;
  }

  return (
    <ul aria-label={ariaLabel} className="aivis-evidence-anchor-chip-list">
      {anchors.map((anchor) => (
        <li key={anchor.id}>
          <span>{anchor.label}</span>
          {anchor.meta ? <small>{anchor.meta}</small> : null}
        </li>
      ))}
    </ul>
  );
}

export interface EvidenceWorkbenchWarningGroupProps {
  label: ReactNode;
  warnings: EvidenceWorkbenchWarning[];
}

export function EvidenceWorkbenchWarningGroup({
  label,
  warnings
}: EvidenceWorkbenchWarningGroupProps) {
  if (warnings.length === 0) {
    return null;
  }

  return (
    <section aria-label={typeof label === "string" ? label : undefined} className="aivis-evidence-warning-group">
      <p className="aivis-evidence-warning-group__heading">{label}</p>
      <EvidenceWorkbenchWarningList warnings={warnings} />
    </section>
  );
}
