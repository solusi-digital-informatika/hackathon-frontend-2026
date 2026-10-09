import React from 'react';
import type { CharacterSpec } from '../types/brief.types';
import { Button } from '../../../core/ui/Button/Button';

interface CharacterListEditorProps {
  characters: CharacterSpec[];
  onChange: (characters: CharacterSpec[]) => void;
  disabled?: boolean;
}

export const CharacterListEditor: React.FC<CharacterListEditorProps> = ({
  characters,
  onChange,
  disabled = false,
}) => {
  const handleUpdate = (index: number, field: keyof CharacterSpec, value: string) => {
    const updated = characters.map((char, i) =>
      i === index ? { ...char, [field]: value } : char
    );
    onChange(updated);
  };

  const handleAdd = () => {
    onChange([...characters, { name: '', details: '' }]);
  };

  const handleRemove = (index: number) => {
    onChange(characters.filter((_, i) => i !== index));
  };

  return (
    <div className="entity-list-editor" data-testid="character-list-editor">
      <div className="entity-list-header">
        <div>
          <h4 className="entity-list-title">Characters</h4>
          <p className="entity-list-subtitle">
            Main characters, identities, wardrobe, and invariant attributes.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleAdd}
          disabled={disabled}
          data-testid="add-character-btn"
        >
          + Add Character
        </Button>
      </div>

      {characters.length === 0 ? (
        <div className="entity-list-empty">No characters defined yet. Click "+ Add Character" to add one.</div>
      ) : (
        <div className="entity-cards-grid">
          {characters.map((char, idx) => (
            <div
              key={idx}
              className="entity-card"
              data-testid={`character-card-${idx}`}
            >
              <div className="entity-card-header">
                <span className="entity-card-tag">Character #{idx + 1}</span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleRemove(idx)}
                  disabled={disabled}
                  aria-label={`Remove character ${char.name || idx + 1}`}
                >
                  Remove
                </Button>
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor={`char-name-${idx}`}>
                  Name
                </label>
                <input
                  id={`char-name-${idx}`}
                  type="text"
                  className="form-input"
                  value={char.name}
                  onChange={(e) => handleUpdate(idx, 'name', e.target.value)}
                  placeholder="e.g. Aria"
                  disabled={disabled}
                  data-testid={`char-name-input-${idx}`}
                />
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor={`char-details-${idx}`}>
                  Details & Key Features
                </label>
                <textarea
                  id={`char-details-${idx}`}
                  className="form-textarea form-textarea-sm"
                  rows={2}
                  value={char.details}
                  onChange={(e) => handleUpdate(idx, 'details', e.target.value)}
                  placeholder="e.g. athletic build, dark undercut, cybernetic left eye"
                  disabled={disabled}
                  data-testid={`char-details-input-${idx}`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
