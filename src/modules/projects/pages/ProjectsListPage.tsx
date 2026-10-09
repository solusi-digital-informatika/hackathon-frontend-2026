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
        <h1 className="page-title">Projects</h1>
        <div className="page-actions">
          <Button variant="primary" onClick={handleCreateClick}>
            Create Project
          </Button>
        </div>
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
