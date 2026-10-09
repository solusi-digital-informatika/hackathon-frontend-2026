import React, { useState } from 'react';
import type {
  BriefReviewStatus,
  CharacterSpec,
  ProjectBrief,
  PropSpec,
  SourceDocument,
  UpdateBriefPayload,
} from '../types/brief.types';
import { briefApi } from '../api/brief-api';
import { BriefStatusBadge } from './BriefStatusBadge';
import { SourceDocumentPanel } from './SourceDocumentPanel';
import { CharacterListEditor } from './CharacterListEditor';
import { PropListEditor } from './PropListEditor';
import { StringListEditor } from './StringListEditor';
import { Button } from '../../../core/ui/Button/Button';
import { TextField } from '../../../core/ui/Form/TextField';
import { TextArea } from '../../../core/ui/Form/TextArea';
import { ErrorBanner } from '../../../core/ui/Banner/ErrorBanner';
import { creativeSectionLabels, type CreativeSections } from '../types/brief.types';
import { GenerateShotPanel } from './GenerateShotPanel';

interface BriefStructuredFormProps {
  projectId: string;
  initialBrief: ProjectBrief;
  sourceDocument: SourceDocument | null;
  onUpdateSuccess: (updatedBrief: ProjectBrief) => void;
  onReingest?: () => void;
}

export const BriefStructuredForm: React.FC<BriefStructuredFormProps> = ({
  projectId,
  initialBrief,
  sourceDocument,
  onUpdateSuccess,
  onReingest,
}) => {
  const [objective, setObjective] = useState<string>(initialBrief.objective || '');
  const [creativeSections, setCreativeSections] = useState<CreativeSections | null>(initialBrief.creative_sections || null);
  const [visualStyle, setVisualStyle] = useState<string>(initialBrief.visual_style || '');
  const [lightingMood, setLightingMood] = useState<string>(initialBrief.lighting_mood || '');
  const [characters, setCharacters] = useState<CharacterSpec[]>(initialBrief.characters || []);
  const [keyProps, setKeyProps] = useState<PropSpec[]>(initialBrief.key_props || []);
  const [constraints, setConstraints] = useState<string[]>(initialBrief.constraints || []);
  const [unresolvedQuestions, setUnresolvedQuestions] = useState<string[]>(
    initialBrief.unresolved_questions || []
  );
  const [currentStatus, setCurrentStatus] = useState<BriefReviewStatus>(
    initialBrief.review_status || 'pending_review'
  );

  const [savingAction, setSavingAction] = useState<'draft' | 'approve' | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSave = async (targetStatus: BriefReviewStatus) => {
    setSavingAction(targetStatus === 'approved' ? 'approve' : 'draft');
    setSuccessMessage(null);
    setErrorMessage(null);

    const payload: UpdateBriefPayload = {
      ...(creativeSections ? { creative_sections: creativeSections } : {}),
      objective: objective.trim(),
      visual_style: visualStyle.trim(),
      lighting_mood: lightingMood.trim(),
      characters: characters.filter((c) => c.name.trim() || c.details.trim()),
      key_props: keyProps.filter((p) => p.name.trim() || p.details.trim()),
      constraints: constraints.filter((item) => item.trim()),
      unresolved_questions: unresolvedQuestions.filter((item) => item.trim()),
      review_status: targetStatus,
    };

    try {
      const updated = await briefApi.updateBrief(projectId, payload);
      setCurrentStatus(updated.review_status);
      setSuccessMessage(
        targetStatus === 'approved'
          ? 'Structured creative brief approved successfully!'
          : 'Draft saved successfully.'
      );
      onUpdateSuccess(updated);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update structured brief.';
      setErrorMessage(msg);
    } finally {
      setSavingAction(null);
    }
  };

  const isBusy = savingAction !== null;

  return (
    <div className="brief-structured-view" data-testid="brief-structured-form">
      {/* Top Banner / Actions Bar */}
      <div className="brief-action-bar" data-testid="brief-action-bar">
        <div className="brief-action-bar-meta">
          <span className="brief-action-bar-label">Status:</span>
          <BriefStatusBadge status={currentStatus} />
          {initialBrief.id && (
            <span className="brief-id-label">ID: {initialBrief.id}</span>
          )}
        </div>

        <div className="brief-action-bar-buttons">
          <Button
            type="button"
            variant="secondary"
            onClick={() => handleSave('pending_review')}
            disabled={isBusy}
            data-testid="save-draft-btn"
          >
            {savingAction === 'draft' ? 'Saving Draft...' : 'Save Draft'}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => handleSave('approved')}
            disabled={isBusy}
            data-testid="approve-brief-btn"
          >
            {savingAction === 'approve'
              ? 'Approving...'
              : 'Approve Structured Brief'}
          </Button>
        </div>
      </div>

      {successMessage && (
        <div
          className="brief-success-banner"
          role="status"
          data-testid="brief-success-banner"
        >
          <span className="brief-success-icon" aria-hidden="true">✓ </span>
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <ErrorBanner
          title="Save Failed"
          message={errorMessage}
          onRetry={() => setErrorMessage(null)}
        />
      )}

      {/* 1. Source Document Panel (Collapsible) */}
      <SourceDocumentPanel
        sourceDocument={sourceDocument}
        onReingest={onReingest}
      />

      {/* 2. Structured Form Fields (Editable by Human) */}
      {creativeSections && <section className="creative-brief-editor">
        <div className="brief-form-card"><h2 className="brief-section-title">Creative Brief</h2><p className="brief-section-subtitle">AI draft. Review every section before approval. Belum ditentukan means the source did not provide that detail.</p></div>
        {Object.entries(creativeSectionLabels).map(([key, label]) => <div className="brief-form-card" key={key}>
          <TextArea id={`creative-${key}`} label={label} rows={key === 'timeline' ? 8 : 6} value={creativeSections[key as keyof CreativeSections]}
            onChange={e => setCreativeSections({ ...creativeSections, [key]: e.target.value })} disabled={isBusy} />
        </div>)}
      </section>}
      {initialBrief.creative_sections && <GenerateShotPanel projectId={projectId} brief={initialBrief} onGenerated={onUpdateSuccess} />}
      {!!initialBrief.storyboard?.length && <section className="brief-storyboard-preview">
        <h2 className="brief-section-title">Storyboard · {initialBrief.storyboard.length} shots</h2>
        <p className="brief-section-subtitle">Draft shots have been added to the Shot Board. Review and edit them in the project workspace.</p>
        <ol>{initialBrief.storyboard.map((shot, i) => <li key={i}><span>{String(i + 1).padStart(2, '0')}</span><div><h3>{shot.title}</h3><p>{shot.description}</p>{Object.entries(shot).filter(([key]) => !['title', 'description'].includes(key)).map(([key, value]) => <p key={key}><strong>{key.replaceAll('_', ' ')}:</strong> {value}</p>)}</div></li>)}</ol>
      </section>}
      <div className="brief-form-section">
        <h3 className="brief-section-title">Structured Direction</h3>
        <p className="brief-section-subtitle">
          Review and calibrate the extracted creative direction. Human edits will be preserved
          as the authoritative baseline for shot planning and change analysis.
        </p>

        <div className="brief-form-card">
          <TextArea
            id="brief-objective"
            name="objective"
            label="Creative Objective & Narrative Core"
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            disabled={isBusy}
            rows={3}
            placeholder="High-level narrative objective, protagonist mission, setting..."
            helperText="The overarching story and purpose driving the sequence."
          />

          <div className="brief-grid-two-col">
            <TextField
              id="brief-visual-style"
              name="visual_style"
              label="Visual Style"
              value={visualStyle}
              onChange={(e) => setVisualStyle(e.target.value)}
              disabled={isBusy}
              placeholder="e.g. Realistic Cinematic Cyberpunk, Stylized Anime"
              helperText="Art direction, rendering medium, texture, and lens attributes."
            />

            <TextField
              id="brief-lighting-mood"
              name="lighting_mood"
              label="Lighting & Atmosphere"
              value={lightingMood}
              onChange={(e) => setLightingMood(e.target.value)}
              disabled={isBusy}
              placeholder="e.g. Moody cool blue lighting, wet asphalt reflections"
              helperText="Color palette, time of day, key and rim lighting, environmental weather."
            />
          </div>
        </div>

        {/* Character List Editor */}
        <CharacterListEditor
          characters={characters}
          onChange={setCharacters}
          disabled={isBusy}
        />

        {/* Key Props Editor */}
        <PropListEditor
          props={keyProps}
          onChange={setKeyProps}
          disabled={isBusy}
        />

        {/* Constraints Editor */}
        <StringListEditor
          title="Production & Creative Constraints"
          subtitle="Strict rules, invariants, and guardrails that must be respected across all shots."
          items={constraints}
          onChange={setConstraints}
          placeholder="e.g. No confidential footage, Cool blue color palette"
          addLabel="+ Add Constraint"
          emptyLabel="No constraints defined yet. Click '+ Add Constraint' to add one."
          disabled={isBusy}
          testId="constraints-editor"
        />

        {/* Unresolved Questions & Ambiguities */}
        <StringListEditor
          title="Unresolved Questions & Ambiguities"
          subtitle="Ambiguous items or conflicting requirements flagged for creative or director clarification."
          items={unresolvedQuestions}
          onChange={setUnresolvedQuestions}
          placeholder="e.g. Is rain present in all shots?"
          addLabel="+ Add Question"
          emptyLabel="No unresolved questions or ambiguities detected."
          isAlert={true}
          disabled={isBusy}
          testId="questions-editor"
        />
      </div>
    </div>
  );
};
