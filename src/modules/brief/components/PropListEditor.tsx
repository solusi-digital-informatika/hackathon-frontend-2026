import React from 'react';
import type { PropSpec } from '../types/brief.types';
import { Button } from '../../../core/ui/Button/Button';

interface PropListEditorProps {
  props: PropSpec[];
  onChange: (props: PropSpec[]) => void;
  disabled?: boolean;
}

export const PropListEditor: React.FC<PropListEditorProps> = ({
  props,
  onChange,
  disabled = false,
}) => {
  const handleUpdate = (index: number, field: keyof PropSpec, value: string) => {
    const updated = props.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange(updated);
  };

  const handleAdd = () => {
    onChange([...props, { name: '', details: '' }]);
  };

  const handleRemove = (index: number) => {
    onChange(props.filter((_, i) => i !== index));
  };

  return (
    <div className="entity-list-editor" data-testid="prop-list-editor">
      <div className="entity-list-header">
        <div>
          <h4 className="entity-list-title">Key Props & Objects</h4>
          <p className="entity-list-subtitle">
            Critical artifacts, items, equipment, and continuity-sensitive objects.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleAdd}
          disabled={disabled}
          data-testid="add-prop-btn"
        >
          + Add Key Prop
        </Button>
      </div>

      {props.length === 0 ? (
        <div className="entity-list-empty">No key props defined yet. Click "+ Add Key Prop" to add one.</div>
      ) : (
        <div className="entity-cards-grid">
          {props.map((prop, idx) => (
            <div
              key={idx}
              className="entity-card"
              data-testid={`prop-card-${idx}`}
            >
              <div className="entity-card-header">
                <span className="entity-card-tag">Prop #{idx + 1}</span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleRemove(idx)}
                  disabled={disabled}
                  aria-label={`Remove prop ${prop.name || idx + 1}`}
                >
                  Remove
                </Button>
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor={`prop-name-${idx}`}>
                  Name
                </label>
                <input
                  id={`prop-name-${idx}`}
                  type="text"
                  className="form-input"
                  value={prop.name}
                  onChange={(e) => handleUpdate(idx, 'name', e.target.value)}
                  placeholder="e.g. Data Core"
                  disabled={disabled}
                  data-testid={`prop-name-input-${idx}`}
                />
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor={`prop-details-${idx}`}>
                  Details & Key Features
                </label>
                <textarea
                  id={`prop-details-${idx}`}
                  className="form-textarea form-textarea-sm"
                  rows={2}
                  value={prop.details}
                  onChange={(e) => handleUpdate(idx, 'details', e.target.value)}
                  placeholder="e.g. hexagonal encrypted slate with amber indicator"
                  disabled={disabled}
                  data-testid={`prop-details-input-${idx}`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
