import React, { useState } from 'react';
import { briefApi } from '../api/brief-api';
import type { ProjectBrief, SourceDocument } from '../types/brief.types';
import { Button } from '../../../core/ui/Button/Button';
import { TextField } from '../../../core/ui/Form/TextField';
import { TextArea } from '../../../core/ui/Form/TextArea';
import { ErrorBanner } from '../../../core/ui/Banner/ErrorBanner';
import { DocumentImportButton } from '../../../core/ui/DocumentImport/DocumentImportButton';
import { VersionBadge } from '../../../core/ui/VersionBadge/VersionBadge';

interface BriefIngestionFormProps {
  projectId: string;
  onIngestSuccess: (sourceDocument: SourceDocument, brief: ProjectBrief) => void;
  onCancel?: () => void;
  nextVersion?: number;
}

export const BriefIngestionForm: React.FC<BriefIngestionFormProps> = ({
  projectId,
  onIngestSuccess,
  onCancel,
  nextVersion = 1,
}) => {
  const [sourceName, setSourceName] = useState<string>(`Creative Brief v${nextVersion}`);
  const [importing, setImporting] = useState(false);
  const [content, setContent] = useState<string>('');
  const [sourceNameError, setSourceNameError] = useState<string | undefined>();
  const [contentError, setContentError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submittingStep, setSubmittingStep] = useState<string>('');
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (importing || submitting) return;
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
        <div className="brief-ingestion-title-row"><h2 className="brief-section-title">Ingest Creative Brief</h2><VersionBadge version={nextVersion} /></div>
        <p className="brief-section-subtitle">
          Paste or import the raw creative brief or production notes. The system will extract structured
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

        <div className="brief-content-input">
        <TextArea
          id="brief-content"
          name="content"
          label="Raw Brief Content"
          labelAction={<DocumentImportButton disabled={submitting} onBusyChange={setImporting} onImport={document => {
            setSourceName(document.name);
            setContent(document.content);
            setContentError(undefined);
            setSourceNameError(undefined);
          }} />}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={12}
          disabled={submitting || importing}
          error={contentError}
          placeholder="Paste full raw creative brief text or markdown here..."
          helperText="Include scene descriptions, visual mood, character traits, props, and any key production constraints."
        />
        </div>
        <p className="brief-import-note">MD or DOCX, up to 10 MB. Import replaces the text above; review it before submitting.</p>

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
            disabled={submitting || importing}
            data-testid="ingest-extract-btn"
          >
            {submitting ? submittingStep || 'Processing...' : 'Ingest & Extract Brief'}
          </Button>
        </div>
      </form>
    </div>
  );
};
