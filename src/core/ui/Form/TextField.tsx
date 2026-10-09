import React from 'react';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  error,
  helperText,
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
      <label htmlFor={inputId} className="form-label">
        {label}
        {required && <span className="form-required" aria-hidden="true">*</span>}
      </label>
      <input
        id={inputId}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={
          [error ? errorId : null, helperText ? helperId : null]
            .filter(Boolean)
            .join(' ') || undefined
        }
        className="form-input"
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
