import React, { useState } from 'react';
import type { SourceDocument } from '../types/brief.types';
import { Button } from '../../../core/ui/Button/Button';

interface SourceDocumentPanelProps {
  sourceDocument: SourceDocument | null;
  onReingest?: () => void;
}

export const SourceDocumentPanel: React.FC<SourceDocumentPanelProps> = ({
  sourceDocument,
  onReingest,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  if (!sourceDocument) {
    return null;
  }

  return (
    <div className="source-doc-panel" data-testid="source-doc-panel">
      <div className="source-doc-header">
        <div className="source-doc-title-group">
          <span className="source-doc-badge">Source Document</span>
          <h3 className="source-doc-title">{sourceDocument.source_name}</h3>
          {sourceDocument.created_at && (
            <span className="source-doc-date">
              {new Date(sourceDocument.created_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          )}
        </div>
        <div className="source-doc-actions">
          {onReingest && (
            <Button variant="secondary" size="sm" onClick={onReingest}>
              Ingest New Version
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            data-testid="toggle-source-doc-btn"
          >
            {isOpen ? 'Hide Raw Brief' : 'Show Raw Brief'}
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="source-doc-content" data-testid="source-doc-content">
          <pre className="source-doc-raw">{sourceDocument.content}</pre>
        </div>
      )}
    </div>
  );
};
