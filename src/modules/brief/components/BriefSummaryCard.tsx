import React, { useEffect, useState } from 'react';
import { VersionBadge } from '../../../core/ui/VersionBadge/VersionBadge';
import { briefVersion } from '../utils/brief-versions';
import { useNavigate } from 'react-router-dom';
import type { ProjectBrief } from '../types/brief.types';
import { BriefStatusBadge } from './BriefStatusBadge';
import { Button } from '../../../core/ui/Button/Button';

interface BriefSummaryCardProps {
  brief: ProjectBrief;
  projectId: string;
  onOpenWorkspace?: () => void;
}

export const BriefSummaryCard: React.FC<BriefSummaryCardProps> = ({
  brief,
  projectId,
  onOpenWorkspace,
}) => {
  const navigate = useNavigate();
  const [version, setVersion] = useState<number | null>(null);
  useEffect(() => { setVersion(brief.version ?? briefVersion(projectId, brief.id)); }, [projectId, brief.id, brief.version]);

  const handleOpen = () => {
    if (onOpenWorkspace) {
      onOpenWorkspace();
    } else {
      navigate(`/projects/${encodeURIComponent(projectId)}/brief`);
    }
  };

  return (
    <div className="brief-summary-card" data-testid="brief-summary-card">
      <div className="brief-summary-card-header">
        <div className="brief-summary-title-group">
          <h3 className="brief-summary-title">Structured Creative Brief</h3>
          {version !== null && <VersionBadge version={version} />}
          <BriefStatusBadge status={brief.review_status} />
        </div>
        <Button variant="secondary" size="sm" onClick={handleOpen}>
          Open Brief Workspace
        </Button>
      </div>

      <div className="brief-summary-body">
        <div className="brief-summary-item">
          <span className="brief-summary-label">Objective:</span>
          <span className="brief-summary-value" data-testid="brief-summary-objective">
            {brief.objective || 'Not specified'}
          </span>
        </div>

        <div className="brief-summary-item">
          <span className="brief-summary-label">Visual Style:</span>
          <span className="brief-summary-value" data-testid="brief-summary-visual-style">
            {brief.visual_style || 'Not specified'}
          </span>
        </div>

        <div className="brief-summary-item">
          <span className="brief-summary-label">Lighting / Mood:</span>
          <span className="brief-summary-value" data-testid="brief-summary-lighting-mood">
            {brief.lighting_mood || 'Not specified'}
          </span>
        </div>

        <div className="brief-summary-meta">
          <span className="brief-pill">
            {brief.characters?.length || 0} Character{brief.characters?.length === 1 ? '' : 's'}
          </span>
          <span className="brief-pill">
            {brief.key_props?.length || 0} Key Prop{brief.key_props?.length === 1 ? '' : 's'}
          </span>
          <span className="brief-pill">
            {brief.constraints?.length || 0} Constraint{brief.constraints?.length === 1 ? '' : 's'}
          </span>
          {brief.unresolved_questions && brief.unresolved_questions.length > 0 && (
            <span className="brief-pill brief-pill-warning">
              {brief.unresolved_questions.length} Question{brief.unresolved_questions.length === 1 ? '' : 's'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
