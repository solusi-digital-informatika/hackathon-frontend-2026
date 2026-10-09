import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { projectsApi } from '../../projects/api/projects-api';
import type { Project } from '../../projects/types/project.types';
import { briefApi } from '../api/brief-api';
import type { ProjectBrief, SourceDocument } from '../types/brief.types';
import { ApiClientError } from '../../../core/network/api-client';
import { Button } from '../../../core/ui/Button/Button';
import { IdBadge } from '../../../core/ui/Badge/IdBadge';
import { LoadingIndicator } from '../../../core/ui/Loading/LoadingIndicator';
import { ErrorBanner } from '../../../core/ui/Banner/ErrorBanner';
import { BriefIngestionForm } from '../components/BriefIngestionForm';
import { BriefStructuredForm } from '../components/BriefStructuredForm';

export const BriefWorkspacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [brief, setBrief] = useState<ProjectBrief | null>(null);
  const [sourceDocument, setSourceDocument] = useState<SourceDocument | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<{
    status: number;
    message: string;
    isNotFound: boolean;
  } | null>(null);

  // Force mode: 'ingest' or 'review' or null (auto-detect based on brief presence)
  const [modeOverride, setModeOverride] = useState<'ingest' | 'review' | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch project to ensure it exists
      const projectData = await projectsApi.getProject(id);
      setProject(projectData);

      // 2. Fetch active brief
      try {
        const briefData = await briefApi.getActiveBrief(id);
        setBrief(briefData.brief);
        setSourceDocument(briefData.sourceDocument);
      } catch (briefErr) {
        if (briefErr instanceof ApiClientError && briefErr.status === 404) {
          setBrief(null);
          setSourceDocument(null);
        } else {
          throw briefErr;
        }
      }
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError({
          status: err.status,
          message:
            err.status === 404
              ? 'Project not found or inaccessible.'
              : err.message,
          isNotFound: err.status === 404,
        });
      } else {
        setError({
          status: 500,
          message: 'An unexpected error occurred while loading the brief workspace.',
          isNotFound: false,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBackToOverview = () => {
    if (id) {
      navigate(`/projects/${encodeURIComponent(id)}`);
    } else {
      navigate('/projects');
    }
  };

  const handleIngestSuccess = (
    newDoc: SourceDocument,
    extractedBrief: ProjectBrief
  ) => {
    setSourceDocument(newDoc);
    setBrief(extractedBrief);
    setModeOverride('review');
  };

  const handleUpdateSuccess = (updatedBrief: ProjectBrief) => {
    setBrief(updatedBrief);
  };

  const currentMode = modeOverride ?? (brief ? 'review' : 'ingest');

  return (
    <div className="brief-workspace-page" data-testid="brief-workspace-container">
      {/* Top Navigation */}
      <div className="brief-workspace-nav">
        <Button variant="secondary" size="sm" onClick={handleBackToOverview}>
          &larr; Back to Project Overview
        </Button>
      </div>

      {loading && (
        <LoadingIndicator message="Loading brief workspace..." />
      )}

      {!loading && error && (
        <div className="brief-error-state">
          {error.isNotFound ? (
            <div className="empty-state" role="alert">
              <h2 className="empty-state-title">Project not found or inaccessible</h2>
              <p className="empty-state-description">
                The requested project does not exist or you do not have permission to access it.
              </p>
              <div className="empty-state-action">
                <Button variant="primary" onClick={() => navigate('/projects')}>
                  Back to Projects
                </Button>
              </div>
            </div>
          ) : (
            <ErrorBanner
              title="Error Loading Brief Workspace"
              message={error.message}
              onRetry={fetchData}
            />
          )}
        </div>
      )}

      {!loading && !error && project && (
        <>
          <header className="brief-workspace-header">
            <div className="brief-workspace-header-main">
              <h1 className="page-title">Brief Workspace</h1>
              <div className="brief-workspace-meta">
                <span className="brief-project-name">{project.name}</span>
                <IdBadge id={project.id} />
                <span className="brief-mode-indicator">
                  Mode: {currentMode === 'ingest' ? 'Ingestion' : 'Review & Calibration'}
                </span>
              </div>
            </div>
          </header>

          <main className="brief-workspace-body">
            {currentMode === 'ingest' ? (
              <BriefIngestionForm
                projectId={project.id}
                onIngestSuccess={handleIngestSuccess}
                onCancel={brief ? () => setModeOverride('review') : undefined}
              />
            ) : (
              brief && (
                <BriefStructuredForm
                  projectId={project.id}
                  initialBrief={brief}
                  sourceDocument={sourceDocument}
                  onUpdateSuccess={handleUpdateSuccess}
                  onReingest={() => setModeOverride('ingest')}
                />
              )
            )}
          </main>
        </>
      )}
    </div>
  );
};
