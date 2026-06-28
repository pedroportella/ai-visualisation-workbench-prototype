import type { ReactNode } from "react";

import { joinClassNames } from "../fieldIds";

import "./QhdsFormField.scss";

export interface QhdsFormFieldProps {
  children: ReactNode;
  disabled?: boolean;
  error?: ReactNode;
  errorId?: string;
  hint?: ReactNode;
  hintId?: string;
  id: string;
  label: ReactNode;
  optional?: boolean;
  required?: boolean;
}

export function QhdsFormField({
  children,
  disabled = false,
  error,
  errorId,
  hint,
  hintId,
  id,
  label,
  optional = false,
  required = false
}: QhdsFormFieldProps) {
  return (
    <div className={joinClassNames("qld__form-group", "qhds-form-field", disabled && "qhds-form-field--disabled", error ? "qhds-form-field--invalid" : undefined)}>
      <label className="qld__label qhds-form-field__label" htmlFor={id}>
        {label}
        {required ? <span className="qhds-form-field__requirement">required</span> : null}
        {!required && optional ? <span className="qld__label--optional qhds-form-field__requirement">optional</span> : null}
      </label>
      {hint ? (
        <p className="qld__hint-text qhds-form-field__hint" id={hintId}>
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p className="qld__input--error qhds-form-field__error" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
