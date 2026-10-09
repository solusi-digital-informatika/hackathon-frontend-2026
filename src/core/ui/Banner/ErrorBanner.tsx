import React from 'react';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  title?: string;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  message,
  onRetry,
  title = 'An error occurred',
}) => {
  return (
    <div className="error-banner" role="alert" aria-live="assertive">
      <div className="error-banner-content">
        <strong className="error-banner-title">{title}</strong>
        <p className="error-banner-message">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="btn btn-secondary btn-sm error-banner-retry"
          aria-label="Retry action"
        >
          Retry
        </button>
      )}
    </div>
  );
};
