import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsApi } from '../api/projects-api';
import type { Project } from '../types/project.types';
import { ApiClientError } from '../../../core/network/api-client';
import { Button } from '../../../core/ui/Button/Button';
import { LoadingIndicator } from '../../../core/ui/Loading/LoadingIndicator';
import { ErrorBanner } from '../../../core/ui/Banner/ErrorBanner';
import { EmptyState } from '../../../core/ui/EmptyState/EmptyState';
import { ProjectTable } from '../components/ProjectTable';

export const ProjectsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [offset, setOffset] = useState<number>(0);
  const limit = 20;

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<{ message: string; isServerError: boolean } | null>(null);

  const fetchProjects = useCallback(async (currentOffset: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await projectsApi.getProjects({ limit, offset: currentOffset });
      setProjects(response.items);
      setTotal(response.total);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError({
          message: err.message,
          isServerError: err.status >= 500 || err.isNetworkError,
        });
      } else {
        setError({
          message: 'An unexpected error occurred while loading projects.',
          isServerError: true,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchProjects(offset);
  }, [fetchProjects, offset]);

  const handlePageChange = (newOffset: number) => {
    setOffset(newOffset);
  };

  const handleCreateClick = () => {
    navigate('/projects/new');
  };

  const handleOpenProject = (id: string) => {
    navigate(`/projects/${id}`);
  };

  return (
    <div className="projects-list-page">
      <div className="page-header">
        <div>
          <p className="projects-eyebrow">WORKSPACE / PROJECTS</p>
          <h1 className="page-title">Projects<span className="projects-title-dot" aria-hidden="true">.</span></h1>
          <p className="projects-subtitle">A place for every brief, idea, and work in progress.</p>
        </div>
        <div className="page-actions">
          <Button variant="primary" onClick={handleCreateClick}>
            <span aria-hidden="true" className="projects-add-icon">+</span> Create Project
          </Button>
        </div>
      </div>

      <div className="projects-collection-header">
        <div className="projects-collection-label"><span aria-hidden="true" className="projects-collection-icon">&#9636;</span> All projects
          {!loading && !error && <span className="projects-count">{total}</span>}
        </div>
        <span className="projects-sort-note">Newest first</span>
      </div>

      {loading && <LoadingIndicator message="Loading projects..." />}

      {!loading && error && (
        <ErrorBanner
          title={error.isServerError ? 'Server Error' : 'Error'}
          message={error.message}
          onRetry={() => fetchProjects(offset)}
        />
      )}

      {!loading && !error && projects.length === 0 && (
        <EmptyState
          title="No projects found. Create a project to start."
          action={
            <Button variant="primary" onClick={handleCreateClick}>
              Create Project
            </Button>
          }
        />
      )}

      {!loading && !error && projects.length > 0 && (
        <ProjectTable
          projects={projects}
          total={total}
          limit={limit}
          offset={offset}
          onPageChange={handlePageChange}
          onOpenProject={handleOpenProject}
        />
      )}
    </div>
  );
};
