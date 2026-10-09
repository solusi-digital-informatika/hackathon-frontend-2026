import React from 'react';
import type { ProjectStatus } from '../../../modules/projects/types/project.types';

interface StatusBadgeProps {
  status: ProjectStatus;
}

const statusLabels: Record<ProjectStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  archived: 'Archived',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const label = statusLabels[status] || status;

  return (
    <span
      className={`badge-status badge-status-${status}`}
      role="status"
      aria-label={`Status: ${label}`}
    >
      <span aria-hidden="true" className="badge-status-icon">[● {label}]</span>
      <span className="sr-only">{label}</span>
    </span>
  );
};
