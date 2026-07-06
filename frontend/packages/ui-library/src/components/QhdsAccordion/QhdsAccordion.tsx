"use client";

import { useMemo, useState, type KeyboardEvent, type ReactNode } from "react";

import "./QhdsAccordion.scss";

export interface QhdsAccordionItem {
  content: ReactNode;
  defaultOpen?: boolean;
  id: string;
  title: ReactNode;
}

export interface QhdsAccordionProps {
  allowMultipleOpen?: boolean;
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  items: QhdsAccordionItem[];
}

type QhdsAccordionHeadingTag = "h2" | "h3" | "h4" | "h5" | "h6";

export function QhdsAccordion({ allowMultipleOpen = true, headingLevel = 2, items }: QhdsAccordionProps) {
  const initialOpenIds = useMemo(() => items.filter((item) => item.defaultOpen).map((item) => item.id), [items]);
  const [openIds, setOpenIds] = useState<string[]>(initialOpenIds);
  const Heading = `h${headingLevel}` as QhdsAccordionHeadingTag;

  function toggleItem(itemId: string) {
    setOpenIds((currentOpenIds) => {
      const isOpen = currentOpenIds.includes(itemId);

      if (isOpen) {
        return currentOpenIds.filter((openId) => openId !== itemId);
      }

      return allowMultipleOpen ? [...currentOpenIds, itemId] : [itemId];
    });
  }

  function focusButton(itemId: string) {
    document.getElementById(`${itemId}-accordion-button`)?.focus();
  }

  function handleButtonKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const previousIndex = index === 0 ? items.length - 1 : index - 1;
    const nextIndex = index === items.length - 1 ? 0 : index + 1;

    if (event.key === "ArrowUp") {
      event.preventDefault();
      focusButton(items[previousIndex].id);
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusButton(items[nextIndex].id);
    }

    if (event.key === "Home") {
      event.preventDefault();
      focusButton(items[0].id);
    }

    if (event.key === "End") {
      event.preventDefault();
      focusButton(items[items.length - 1].id);
    }
  }

  return (
    <div className="qld__accordion-group js qhds-accordion">
      {items.map((item, index) => {
        const isOpen = openIds.includes(item.id);
        const buttonId = `${item.id}-accordion-button`;
        const panelId = `${item.id}-accordion-panel`;
        const stateClassName = isOpen ? "qld__accordion--open" : "qld__accordion--closed";

        return (
          <section className={`qld__accordion ${stateClassName} qhds-accordion__item`} key={item.id}>
            <Heading className="qhds-accordion__heading">
              <button
                aria-controls={panelId}
                aria-expanded={isOpen}
                className={`qld__accordion__title js-qld__accordion ${stateClassName} qhds-accordion__button`}
                id={buttonId}
                onClick={() => toggleItem(item.id)}
                onKeyDown={(event) => handleButtonKeyDown(event, index)}
                type="button"
              >
                <span className="qhds-accordion__title">{item.title}</span>
                <span className="qhds-accordion__toggle">
                  <span className="qhds-accordion__toggle-closed">Show details</span>
                  <span className="qhds-accordion__toggle-open">Hide details</span>
                </span>
              </button>
            </Heading>
            <div
              aria-labelledby={buttonId}
              className={`qld__accordion__body ${stateClassName} qhds-accordion__panel`}
              hidden={!isOpen}
              id={panelId}
              role="region"
            >
              <div className="qld__accordion__body-wrapper qhds-accordion__body-wrapper">{item.content}</div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
