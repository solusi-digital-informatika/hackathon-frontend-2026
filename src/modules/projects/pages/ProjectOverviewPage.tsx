import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsApi } from '../api/projects-api';
import type { Project } from '../types/project.types';
import { ApiClientError } from '../../../core/network/api-client';
import { Button } from '../../../core/ui/Button/Button';
import { IdBadge } from '../../../core/ui/Badge/IdBadge';
import { StatusBadge } from '../../../core/ui/Badge/StatusBadge';
import { LoadingIndicator } from '../../../core/ui/Loading/LoadingIndicator';
import { ErrorBanner } from '../../../core/ui/Banner/ErrorBanner';
import { ShotBoard } from '../../shots/components/ShotBoard';

export const ProjectOverviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<{
    status: number;
    message: string;
    isNotFound: boolean;
  } | null>(null);

  const fetchProject = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    try {
      const data = await projectsApi.getProject(id);
      setProject(data);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError({
          status: err.status,
          message:
            err.status === 404
              ? 'Project not found or inaccessible'
              : err.message,
          isNotFound: err.status === 404,
        });
      } else {
        setError({
          status: 500,
          message: 'An unexpected error occurred while loading project workspace.',
          isNotFound: false,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleBackToProjects = () => {
    navigate('/projects');
  };

  return (
    <div className="project-overview-page" data-testid="project-overview-container">
      {project && (
        <div className="project-overview-nav">
          <Button variant="secondary" size="sm" onClick={handleBackToProjects}>
            &larr; Back to Projects
          </Button>
        </div>
      )}

      {loading && (
        <LoadingIndicator message="Loading project workspace..." />
      )}

      {!loading && error && (
        <div className="project-error-state">
          {error.isNotFound ? (
            <div className="empty-state" role="alert">
              <h2 className="empty-state-title">Project not found or inaccessible</h2>
              <p className="empty-state-description">
                The requested project does not exist or you do not have permission to access it.
              </p>
              <div className="empty-state-action">
                <Button variant="primary" onClick={handleBackToProjects}>
                  Back to Projects
                </Button>
              </div>
            </div>
          ) : (
            <ErrorBanner
              title="Error Loading Project"
              message={error.message}
              onRetry={fetchProject}
            />
          )}
        </div>
      )}

      {!loading && !error && project && (
        <>
          <header className="project-overview-header">
            <h1 className="page-title">{project.name}</h1>
            <div className="project-overview-meta">
              <IdBadge id={project.id} />
              <span className="overview-status-container">
                <StatusBadge status={project.status} />
              </span>
            </div>
            {project.description && (
              <p className="project-overview-description">{project.description}</p>
            )}
          </header>

          <main className="workspace-grid">
            <section className="workspace-section" aria-labelledby="brief-heading">
              <h2 id="brief-heading" className="workspace-section-title">
                Active Brief
              </h2>
              <div className="workspace-placeholder">
                No brief yet
              </div>
            </section>

            <section className="workspace-section workspace-shots-section" aria-labelledby="shots-heading">
              <h2 id="shots-heading" className="workspace-section-title">
                Shot Board
              </h2>
              <ShotBoard projectId={project.id} />
            </section>
          </main>
        </>
      )}
    </div>
  );
};
