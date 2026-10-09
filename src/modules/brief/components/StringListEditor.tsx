import React from 'react';
import { Button } from '../../../core/ui/Button/Button';

interface StringListEditorProps {
  title: string;
  subtitle?: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  addLabel?: string;
  emptyLabel?: string;
  isAlert?: boolean;
  disabled?: boolean;
  testId?: string;
}

export const StringListEditor: React.FC<StringListEditorProps> = ({
  title,
  subtitle,
  items,
  onChange,
  placeholder = 'Add new item...',
  addLabel = '+ Add Item',
  emptyLabel = 'No items defined yet.',
  isAlert = false,
  disabled = false,
  testId = 'string-list-editor',
}) => {
  const handleUpdate = (index: number, value: string) => {
    const updated = items.map((item, i) => (i === index ? value : item));
    onChange(updated);
  };

  const handleAdd = () => {
    onChange([...items, '']);
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div
      className={`string-list-editor ${isAlert ? 'string-list-alert-box' : ''}`}
      data-testid={testId}
    >
      <div className="string-list-header">
        <div>
          <h4 className="string-list-title">
            {isAlert && <span className="string-list-alert-icon" aria-hidden="true">⚠️ </span>}
            {title}
          </h4>
          {subtitle && <p className="string-list-subtitle">{subtitle}</p>}
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleAdd}
          disabled={disabled}
          data-testid={`${testId}-add-btn`}
        >
          {addLabel}
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="string-list-empty">{emptyLabel}</div>
      ) : (
        <div className="string-list-items">
          {items.map((item, idx) => (
            <div key={idx} className="string-list-row" data-testid={`${testId}-row-${idx}`}>
              <span className="string-list-index">#{idx + 1}</span>
              <input
                type="text"
                className="form-input string-list-input"
                value={item}
                onChange={(e) => handleUpdate(idx, e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                data-testid={`${testId}-input-${idx}`}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleRemove(idx)}
                disabled={disabled}
                aria-label={`Remove item #${idx + 1}`}
                data-testid={`${testId}-remove-btn-${idx}`}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
