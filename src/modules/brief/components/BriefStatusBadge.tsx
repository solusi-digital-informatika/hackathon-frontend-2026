import React from 'react';
import type { BriefReviewStatus } from '../types/brief.types';

interface BriefStatusBadgeProps {
  status: BriefReviewStatus;
  className?: string;
}

export const BriefStatusBadge: React.FC<BriefStatusBadgeProps> = ({ status, className = '' }) => {
  const isApproved = status === 'approved';
  const label = isApproved ? 'Approved' : 'Pending Review';
  const symbol = isApproved ? '●' : '○';

  return (
    <span
      className={`badge-status badge-status-${isApproved ? 'approved' : 'pending'} ${className}`.trim()}
      role="status"
      aria-label={`Extraction status: ${label}`}
      data-testid="brief-status-badge"
    >
      <span aria-hidden="true" className="badge-status-icon">
        [{symbol} {label}]
      </span>
      <span className="sr-only">{label}</span>
    </span>
  );
};
