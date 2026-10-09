import React from 'react';
import type { ShotStatus } from '../types/shot.types';

export interface ShotStatusBadgeProps {
  status: ShotStatus;
  shotId?: string;
  size?: 'sm' | 'md';
}

interface StatusConfig {
  icon: string;
  label: string;
  renderedText: string;
}

const statusConfigs: Record<ShotStatus, StatusConfig> = {
  draft: {
    icon: '○',
    label: 'Draft',
    renderedText: '[○ Draft]',
  },
  in_progress: {
    icon: '⏳',
    label: 'In Progress',
    renderedText: '[⏳ In Progress]',
  },
  in_review: {
    icon: '👁️',
    label: 'In Review',
    renderedText: '[👁️ In Review]',
  },
  approved: {
    icon: '✓',
    label: 'Approved',
    renderedText: '[✓ Approved]',
  },
};

export const ShotStatusBadge: React.FC<ShotStatusBadgeProps> = ({
  status,
  shotId,
  size = 'md',
}) => {
  const config = statusConfigs[status] || {
    icon: '○',
    label: status,
    renderedText: `[○ ${status}]`,
  };

  return (
    <span
      className={`shot-status-badge shot-status-badge-${status} shot-status-badge-${size}`}
      role="status"
      aria-label={`Status: ${config.label}`}
      data-testid={shotId ? `shot-status-badge-${shotId}` : undefined}
    >
      <span aria-hidden="true" className="shot-status-text">
        {config.renderedText}
      </span>
      <span className="sr-only">{config.label}</span>
    </span>
  );
};
