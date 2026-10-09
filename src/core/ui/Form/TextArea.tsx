import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
  labelAction?: React.ReactNode;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  helperText,
  labelAction,
  id,
  required,
  className = '',
  ...props
}) => {
  const inputId = id || `field-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  return (
    <div className={`form-field ${error ? 'has-error' : ''} ${className}`}>
      <div className={labelAction ? 'form-label-with-action' : undefined}>
      <label htmlFor={inputId} className="form-label">
        {label}
        {required && <span className="form-required" aria-hidden="true">*</span>}
      </label>
      {labelAction}
      </div>
      <textarea
        id={inputId}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={
          [error ? errorId : null, helperText ? helperId : null]
            .filter(Boolean)
            .join(' ') || undefined
        }
        className="form-textarea"
        {...props}
      />
      {error && (
        <span id={errorId} className="form-error-msg" role="alert">
          {error}
        </span>
      )}
      {!error && helperText && (
        <span id={helperId} className="form-helper-text">
          {helperText}
        </span>
      )}
    </div>
  );
};
