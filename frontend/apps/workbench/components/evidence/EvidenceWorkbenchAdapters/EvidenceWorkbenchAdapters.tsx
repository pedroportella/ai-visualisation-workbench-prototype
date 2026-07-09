import type { HTMLAttributes, ReactNode } from "react";

import {
  QhdsButton,
  QhdsCard,
  QhdsSummaryList,
  type QhdsSummaryListItem
} from "@aivis/ui-library";

export type AivisEvidenceTone = "neutral" | "success" | "warning";

export interface AivisEvidenceStatusProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  tone?: AivisEvidenceTone;
}

export function AivisEvidenceStatus({
  children,
  className,
  tone = "neutral",
  ...props
}: AivisEvidenceStatusProps) {
  return (
    <span
      className={["qld__tag", "aivis-evidence-status", `aivis-evidence-status--${tone}`, className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </span>
  );
}

export interface AivisEvidencePanelHeaderProps {
  label: ReactNode;
  status?: ReactNode;
  statusTone?: AivisEvidenceTone;
}

export function AivisEvidencePanelHeader({
  label,
  status,
  statusTone = "neutral"
}: AivisEvidencePanelHeaderProps) {
  return (
    <div className="aivis-evidence-panel-header">
      <p className="aivis-evidence-panel-header__label">{label}</p>
      {status ? <AivisEvidenceStatus tone={statusTone}>{status}</AivisEvidenceStatus> : null}
    </div>
  );
}

export interface AivisEvidenceMetadataProps {
  ariaLabel?: string;
  className?: string;
  items: QhdsSummaryListItem[];
}

export function AivisEvidenceMetadata({
  ariaLabel,
  className,
  items
}: AivisEvidenceMetadataProps) {
  return (
    <QhdsSummaryList
      ariaLabel={ariaLabel}
      className={["aivis-evidence-metadata", className].filter(Boolean).join(" ")}
      items={items}
    />
  );
}

export interface AivisEvidenceCalloutProps {
  children: ReactNode;
  className?: string;
  heading: ReactNode;
  headingLevel?: 3 | 4;
  tone?: AivisEvidenceTone;
}

export function AivisEvidenceCallout({
  children,
  className,
  heading,
  headingLevel = 3,
  tone = "neutral"
}: AivisEvidenceCalloutProps) {
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

export interface AivisEvidenceAnchor {
  description: ReactNode;
  id: string;
  label: ReactNode;
  meta?: ReactNode;
}

export interface AivisEvidenceContextAnchorsProps {
  anchors: AivisEvidenceAnchor[];
  anchorSummary: ReactNode;
  ariaLabel?: string;
  dateLabel: ReactNode;
  summary: ReactNode;
}

export function AivisEvidenceContextAnchors({
  anchors,
  anchorSummary,
  ariaLabel = "Context anchors",
  dateLabel,
  summary
}: AivisEvidenceContextAnchorsProps) {
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
              {anchor.meta ? <AivisEvidenceStatus tone="neutral">{anchor.meta}</AivisEvidenceStatus> : null}
              <small>{anchor.description}</small>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export interface AivisEvidenceClaimCardProps extends Omit<HTMLAttributes<HTMLElement>, "children" | "title"> {
  claimId: ReactNode;
  selected?: boolean;
  selectedLabel?: ReactNode;
  status: ReactNode;
  statusTone?: AivisEvidenceTone;
  text: ReactNode;
  title: ReactNode;
}

export function AivisEvidenceClaimCard({
  claimId,
  className,
  selected = false,
  selectedLabel,
  status,
  statusTone = "neutral",
  text,
  title,
  ...props
}: AivisEvidenceClaimCardProps) {
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
        {selected && selectedLabel ? <AivisEvidenceStatus tone="neutral">{selectedLabel}</AivisEvidenceStatus> : null}
      </div>
      <p>{text}</p>
      <AivisEvidenceStatus tone={statusTone}>{status}</AivisEvidenceStatus>
    </QhdsCard>
  );
}

export interface AivisEvidenceSourceCardProps extends Omit<HTMLAttributes<HTMLElement>, "children" | "title"> {
  children: ReactNode;
  metadataItems: QhdsSummaryListItem[];
  preview: ReactNode;
  selected?: boolean;
  selectedLabel?: ReactNode;
  sourceId: ReactNode;
  status: ReactNode;
  statusTone?: AivisEvidenceTone;
  title: ReactNode;
}

export function AivisEvidenceSourceCard({
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
}: AivisEvidenceSourceCardProps) {
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
          <AivisEvidenceStatus tone={statusTone}>{status}</AivisEvidenceStatus>
          {selected && selectedLabel ? <AivisEvidenceStatus tone="neutral">{selectedLabel}</AivisEvidenceStatus> : null}
        </div>
      </div>
      <AivisEvidenceMetadata
        ariaLabel={typeof sourceId === "string" ? `${sourceId} source metadata` : undefined}
        items={metadataItems}
      />
      <p>{preview}</p>
      {children}
    </QhdsCard>
  );
}

export interface AivisEvidencePathItem {
  heading: ReactNode;
  summary: ReactNode;
}

export interface AivisEvidencePathListProps {
  ariaLabel?: string;
  items: AivisEvidencePathItem[];
}

export function AivisEvidencePathList({
  ariaLabel = "Evidence path",
  items
}: AivisEvidencePathListProps) {
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

export interface AivisEvidenceWarning {
  id: ReactNode;
  impact?: ReactNode;
  message: ReactNode;
  severity: ReactNode;
}

export interface AivisEvidenceWarningListProps {
  ariaLabel?: string;
  warnings: AivisEvidenceWarning[];
}

export function AivisEvidenceWarningList({
  ariaLabel = "Active warnings",
  warnings
}: AivisEvidenceWarningListProps) {
  return (
    <ul aria-label={ariaLabel} className="aivis-evidence-warning-list">
      {warnings.map((warning, index) => (
        <li key={index}>
          <div className="aivis-evidence-warning-list__item">
            <div className="aivis-evidence-warning-list__header">
              <strong>{warning.id}</strong>
              <AivisEvidenceStatus tone="warning">{warning.severity}</AivisEvidenceStatus>
            </div>
            <p>{warning.message}</p>
            {warning.impact ? <small>{warning.impact}</small> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

export interface AivisEvidenceTokenLink {
  ariaLabel?: string;
  description?: ReactNode;
  href: string;
  id: string;
  label: ReactNode;
}

export interface AivisEvidenceTokenListProps {
  ariaLabel: string;
  emptyMessage?: ReactNode;
  items: AivisEvidenceTokenLink[];
}

export function AivisEvidenceTokenList({
  ariaLabel,
  emptyMessage,
  items
}: AivisEvidenceTokenListProps) {
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

export interface AivisEvidenceFilterLink extends AivisEvidenceTokenLink {
  count: ReactNode;
}

export interface AivisEvidenceFilterNavProps {
  ariaLabel: string;
  filters: AivisEvidenceFilterLink[];
}

export function AivisEvidenceFilterNav({
  ariaLabel,
  filters
}: AivisEvidenceFilterNavProps) {
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

export interface AivisEvidenceAnchorChipListProps {
  anchors: AivisEvidenceAnchor[];
  ariaLabel: string;
  emptyMessage?: ReactNode;
}

export function AivisEvidenceAnchorChipList({
  anchors,
  ariaLabel,
  emptyMessage
}: AivisEvidenceAnchorChipListProps) {
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

export interface AivisEvidenceWarningGroupProps {
  label: ReactNode;
  warnings: AivisEvidenceWarning[];
}

export function AivisEvidenceWarningGroup({
  label,
  warnings
}: AivisEvidenceWarningGroupProps) {
  if (warnings.length === 0) {
    return null;
  }

  return (
    <section aria-label={typeof label === "string" ? label : undefined} className="aivis-evidence-warning-group">
      <p className="aivis-evidence-warning-group__heading">{label}</p>
      <AivisEvidenceWarningList warnings={warnings} />
    </section>
  );
}
