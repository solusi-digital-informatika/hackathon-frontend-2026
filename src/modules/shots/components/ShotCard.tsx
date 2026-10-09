import React from 'react';
import type { Shot } from '../types/shot.types';
import { ShotStatusBadge } from './ShotStatusBadge';
import { Button } from '../../../core/ui/Button/Button';

export interface ShotCardProps {
  shot: Shot;
  isFirst: boolean;
  isLast: boolean;
  onEdit: (shot: Shot) => void;
  onDelete: (shot: Shot) => void;
  onMoveUp: (shot: Shot) => void;
  onMoveDown: (shot: Shot) => void;
}

export const ShotCard: React.FC<ShotCardProps> = ({
  shot,
  isFirst,
  isLast,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}) => {
  const formattedSeq = `#${String(shot.sequence_order).padStart(2, '0')}`;

  return (
    <article
      className="shot-card"
      data-testid={`shot-card-${shot.id}`}
      aria-labelledby={`shot-title-${shot.id}`}
    >
      <header className="shot-card-header">
        <div className="shot-card-header-left">
          <span
            className="shot-sequence-badge"
            data-testid={`shot-seq-${shot.id}`}
            aria-label={`Sequence ${shot.sequence_order}`}
          >
            {formattedSeq}
          </span>
          <span
            className="shot-id-chip"
            data-testid={`shot-id-${shot.id}`}
            aria-label={`Shot ID ${shot.id}`}
          >
            {shot.id}
          </span>
        </div>
        <div className="shot-card-header-right">
          <ShotStatusBadge status={shot.status} shotId={shot.id} size="sm" />
        </div>
      </header>

      <div
        className="shot-thumbnail-container"
        data-testid={`shot-thumbnail-${shot.id}`}
        aria-label="Shot thumbnail preview"
      >
        <div className="shot-thumbnail-placeholder">
          <svg
            className="shot-thumbnail-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
          <span className="shot-thumbnail-text">No Asset Selected</span>
        </div>
      </div>

      <div className="shot-card-body">
        <h3 id={`shot-title-${shot.id}`} className="shot-card-title">
          {shot.title}
        </h3>
        {shot.description ? (
          <p className="shot-card-description">{shot.description}</p>
        ) : (
          <p className="shot-card-description shot-card-description-empty">
            No description provided.
          </p>
        )}
      </div>

      <footer className="shot-card-footer">
        <div className="shot-reorder-actions">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onMoveUp(shot)}
            disabled={isFirst}
            data-testid={`btn-move-up-${shot.id}`}
            aria-label={`Move shot ${shot.title} up`}
          >
            &uarr; Up
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onMoveDown(shot)}
            disabled={isLast}
            data-testid={`btn-move-down-${shot.id}`}
            aria-label={`Move shot ${shot.title} down`}
          >
            &darr; Down
          </Button>
        </div>

        <div className="shot-card-item-actions">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEdit(shot)}
            aria-label={`Edit shot ${shot.title}`}
          >
            Edit
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="btn-danger-text"
            onClick={() => onDelete(shot)}
            aria-label={`Delete shot ${shot.title}`}
          >
            Delete
          </Button>
        </div>
      </footer>
    </article>
  );
};
