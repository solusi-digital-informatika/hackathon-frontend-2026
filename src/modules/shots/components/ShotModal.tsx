import React, { useState, useEffect } from 'react';
import type { Shot, ShotStatus, CreateShotPayload, UpdateShotPayload } from '../types/shot.types';
import { Button } from '../../../core/ui/Button/Button';
import { ApiClientError } from '../../../core/network/api-client';
import { ShotRevisionPanel } from './ShotRevisionPanel';

export interface ShotModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  shot?: Shot | null;
  nextSequenceOrder?: number;
  onClose: () => void;
  onSubmit: (payload: CreateShotPayload | UpdateShotPayload) => Promise<void>;
  onRevisionApplied?: () => void;
  isHidden?: boolean;
  onToggleHidden?: () => void;
}

export const ShotModal: React.FC<ShotModalProps> = ({
  isOpen,
  mode,
  shot,
  nextSequenceOrder,
  onClose,
  onSubmit,
  onRevisionApplied,
  isHidden = false,
  onToggleHidden,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ShotStatus>('draft');
  const [sequenceOrder, setSequenceOrder] = useState<number | undefined>(undefined);

  const [titleError, setTitleError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && shot) {
        setTitle(shot.title);
        setDescription(shot.description || '');
        setStatus(shot.status);
        setSequenceOrder(shot.sequence_order);
      } else {
        setTitle('');
        setDescription('');
        setStatus('draft');
        setSequenceOrder(nextSequenceOrder);
      }
      setTitleError(null);
      setServerError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, mode, shot, nextSequenceOrder]);

  if (!isOpen) {
    return null;
  }

  if (mode === 'edit' && shot && onRevisionApplied) {
    return <div className="modal-backdrop" onKeyDown={e => { if (e.key === 'Escape') onClose(); }}>
      <div className="modal-dialog shot-revision-modal" role="dialog" aria-modal="true" aria-label={`Revision history for ${shot.title}`}>
        <header className="modal-header"><h2 className="modal-title">{shot.title}</h2><Button type="button" variant="secondary" onClick={onClose}>Close</Button></header>
        <div className="modal-body"><ShotRevisionPanel shot={shot} onApplied={onRevisionApplied} /></div>
        {onToggleHidden && <footer className="modal-footer"><Button type="button" variant="secondary" onClick={onToggleHidden}>{isHidden ? 'Show shot' : 'Hide shot'}</Button></footer>}
      </div>
    </div>;
  }

  const validate = (): boolean => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setTitleError('Shot title is required.');
      return false;
    }
    if (trimmedTitle.length > 100) {
      setTitleError('Shot title cannot exceed 100 characters.');
      return false;
    }
    if (description.length > 1000) {
      setServerError('Description cannot exceed 1000 characters.');
      return false;
    }
    setTitleError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setServerError(null);

    try {
      if (mode === 'create') {
        const payload: CreateShotPayload = {
          title: title.trim(),
          description: description.trim() ? description.trim() : null,
          sequence_order: sequenceOrder,
        };
        await onSubmit(payload);
      } else {
        const payload: UpdateShotPayload = {
          title: title.trim(),
          description: description.trim() ? description.trim() : null,
          status,
          sequence_order: sequenceOrder,
        };
        await onSubmit(payload);
      }
      onClose();
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.fields && err.fields.length > 0) {
          const titleField = err.fields.find((f) => f.field === 'title');
          if (titleField) {
            setTitleError(titleField.message);
          } else {
            setServerError(err.message || 'Validation failed.');
          }
        } else {
          setServerError(err.message);
        }
      } else {
        setServerError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div
        className="modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shot-modal-title"
        data-testid="shot-modal"
      >
        <header className="modal-header">
          <h2 id="shot-modal-title" className="modal-title">
            {mode === 'create' ? 'Add New Shot' : `Edit Shot: ${shot?.id || ''}`}
          </h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close dialog"
          >
            &times;
          </button>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            {shot?.generation_details && <details className="shot-generation-details" open>
              <summary>Generated storyboard details</summary>
              <p className="form-helper-text">Original AI draft for this shot. No image has been generated.</p>
              <dl>{Object.entries(shot.generation_details).filter(([key]) => !['title', 'description'].includes(key)).map(([key, value]) => <div key={key}><dt>{key.replaceAll('_', ' ')}</dt><dd>{value}</dd></div>)}</dl>
            </details>}
            {serverError && (
              <div className="modal-error-banner" role="alert">
                {serverError}
              </div>
            )}

            <div className={`form-field ${titleError ? 'has-error' : ''}`}>
              <label htmlFor="shot-title-input" className="form-label">
                Shot Title <span className="form-required">*</span>
              </label>
              <input
                id="shot-title-input"
                name="title"
                type="text"
                className="form-input"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (titleError) setTitleError(null);
                }}
                placeholder="e.g. Opening Neon Street Wide"
                maxLength={100}
                disabled={isSubmitting}
                autoFocus
              />
              {titleError && (
                <span className="form-error-msg" role="alert">
                  {titleError}
                </span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="shot-description-input" className="form-label">
                Description
              </label>
              <textarea
                id="shot-description-input"
                name="description"
                className="form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief scene narrative or visual constraints (optional)"
                maxLength={1000}
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            {mode === 'edit' && (
              <div className="form-field">
                <label htmlFor="shot-status-select" className="form-label">
                  Production Status
                </label>
                <select
                  id="shot-status-select"
                  name="status"
                  className="form-input"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ShotStatus)}
                  disabled={isSubmitting}
                >
                  <option value="draft">Draft</option>
                  <option value="in_progress">In Progress</option>
                  <option value="in_review">In Review</option>
                  <option value="approved">Approved</option>
                </select>
              </div>
            )}

            <div className="form-field">
              <label htmlFor="shot-sequence-input" className="form-label">
                Sequence Order
              </label>
              <input
                id="shot-sequence-input"
                name="sequence_order"
                type="number"
                min={1}
                className="form-input"
                value={sequenceOrder !== undefined ? sequenceOrder : ''}
                onChange={(e) => {
                  const val = e.target.value ? parseInt(e.target.value, 10) : undefined;
                  setSequenceOrder(val);
                }}
                placeholder="Auto-assigned if left blank"
                disabled={isSubmitting}
              />
              <span className="form-helper-text">
                Determines the shot position in narrative sequence.
              </span>
            </div>
          </div>

          <footer className="modal-footer">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Saving...'
                : mode === 'create'
                  ? 'Create Shot'
                  : 'Save Changes'}
            </Button>
          </footer>
        </form>
      </div>
    </div>
  );
};
