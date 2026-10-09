import React, { useState } from 'react';
import { briefApi } from '../api/brief-api';
import type { ProjectBrief, SourceDocument } from '../types/brief.types';
import { Button } from '../../../core/ui/Button/Button';
import { TextField } from '../../../core/ui/Form/TextField';
import { TextArea } from '../../../core/ui/Form/TextArea';
import { ErrorBanner } from '../../../core/ui/Banner/ErrorBanner';

interface BriefIngestionFormProps {
  projectId: string;
  onIngestSuccess: (sourceDocument: SourceDocument, brief: ProjectBrief) => void;
  onCancel?: () => void;
}

export const BriefIngestionForm: React.FC<BriefIngestionFormProps> = ({
  projectId,
  onIngestSuccess,
  onCancel,
}) => {
  const [sourceName, setSourceName] = useState<string>('Creative Brief v1');
  const [content, setContent] = useState<string>('');
  const [sourceNameError, setSourceNameError] = useState<string | undefined>();
  const [contentError, setContentError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submittingStep, setSubmittingStep] = useState<string>('');
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    let hasError = false;
    const trimmedName = sourceName.trim();
    const trimmedContent = content.trim();

    if (!trimmedName) {
      setSourceNameError('Source name is required.');
      hasError = true;
    } else {
      setSourceNameError(undefined);
    }

    if (!trimmedContent) {
      setContentError('Brief content cannot be empty.');
      hasError = true;
    } else {
      setContentError(undefined);
    }

    if (hasError) return;

    setSubmitting(true);
    setSubmittingStep('Ingesting source brief document...');

    try {
      // Step 1: Ingest raw source brief
      const sourceDoc = await briefApi.ingestBrief(projectId, {
        source_name: trimmedName,
        content: trimmedContent,
      });

      // Step 2: Trigger AI extraction of structured brief
      setSubmittingStep('Extracting structured creative requirements...');
      const extractedBrief = await briefApi.extractBrief(projectId);

      onIngestSuccess(sourceDoc, extractedBrief);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to ingest and extract brief.';
      setGeneralError(msg);
    } finally {
      setSubmitting(false);
      setSubmittingStep('');
    }
  };

  return (
    <div className="brief-ingestion-card" data-testid="brief-ingestion-form">
      <div className="brief-ingestion-header">
        <h2 className="brief-section-title">Ingest Creative Brief</h2>
        <p className="brief-section-subtitle">
          Paste the raw creative brief or production notes. The system will extract structured
          style, characters, props, lighting, and constraints for human review.
        </p>
      </div>

      {generalError && (
        <ErrorBanner
          title="Ingestion Error"
          message={generalError}
          onRetry={() => setGeneralError(null)}
        />
      )}

      <form onSubmit={handleSubmit} noValidate>
        <TextField
          id="brief-source-name"
          name="source_name"
          label="Source Document Name"
          value={sourceName}
          onChange={(e) => setSourceName(e.target.value)}
          required
          disabled={submitting}
          error={sourceNameError}
          helperText="E.g. Creative Brief v1, CyberPulse Director Notes, Agency Deck"
        />

        <TextArea
          id="brief-content"
          name="content"
          label="Raw Brief Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={12}
          disabled={submitting}
          error={contentError}
          placeholder="Paste full raw creative brief text or markdown here..."
          helperText="Include scene descriptions, visual mood, character traits, props, and any key production constraints."
        />

        <div className="brief-form-actions">
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            disabled={submitting}
            data-testid="ingest-extract-btn"
          >
            {submitting ? submittingStep || 'Processing...' : 'Ingest & Extract Brief'}
          </Button>
        </div>
      </form>
    </div>
  );
};
