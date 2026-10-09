import React, { useState } from 'react';
import type { Shot } from '../types/shot.types';
import { Button } from '../../../core/ui/Button/Button';

export interface DeleteShotModalProps {
  isOpen: boolean;
  shot: Shot | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const DeleteShotModal: React.FC<DeleteShotModalProps> = ({
  isOpen,
  shot,
  onClose,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !shot) {
    return null;
  }

  const handleConfirm = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch {
      setError('Failed to delete shot. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) {
          onClose();
        }
      }}
    >
      <div
        className="modal-dialog modal-dialog-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-shot-title"
      >
        <header className="modal-header">
          <h2 id="delete-shot-title" className="modal-title">
            Delete Shot {shot.id}?
          </h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            disabled={isDeleting}
            aria-label="Close dialog"
          >
            &times;
          </button>
        </header>

        <div className="modal-body">
          {error && (
            <div className="modal-error-banner" role="alert">
              {error}
            </div>
          )}
          <p className="delete-modal-text">
            Are you sure you want to delete <strong>#{shot.sequence_order}: {shot.title}</strong>?
          </p>
          <p className="delete-modal-subtext">
            This action will remove the shot from the storyboard sequence. Remaining shots will be re-sequenced.
          </p>
        </div>

        <footer className="modal-footer">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            className="btn-danger"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Shot'}
          </Button>
        </footer>
      </div>
    </div>
  );
};
