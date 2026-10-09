import React from 'react';
import type { Project } from '../types/project.types';
import { IdBadge } from '../../../core/ui/Badge/IdBadge';
import { StatusBadge } from '../../../core/ui/Badge/StatusBadge';
import { Button } from '../../../core/ui/Button/Button';

interface ProjectTableProps {
  projects: Project[];
  total: number;
  limit: number;
  offset: number;
  onPageChange: (newOffset: number) => void;
  onOpenProject: (id: string) => void;
}

export const ProjectTable: React.FC<ProjectTableProps> = ({
  projects,
  total,
  limit,
  offset,
  onPageChange,
  onOpenProject,
}) => {
  const startItem = total === 0 ? 0 : offset + 1;
  const endItem = Math.min(offset + limit, total);
  const canGoPrevious = offset > 0;
  const canGoNext = offset + limit < total;

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="projects-table-container">
      <div className="projects-table-scroll">
        <table className="projects-table" aria-label="Projects">
          <thead>
            <tr>
              <th scope="col">Project Name</th>
              <th scope="col">Project ID</th>
              <th scope="col">Description</th>
              <th scope="col">Status</th>
              <th scope="col">Last Updated</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id}>
                <td className="project-name-cell">
                  <div className="project-name-wrap">
                    <span className="project-monogram" aria-hidden="true">{project.name.slice(0, 1).toUpperCase()}</span>
                    <span>{project.name}</span>
                  </div>
                </td>
                <td>
                  <IdBadge id={project.id} />
                </td>
                <td className="project-description-cell" title={project.description || undefined}>
                  {project.description || '—'}
                </td>
                <td>
                  <StatusBadge status={project.status} />
                </td>
                <td className="project-date-cell">{formatDate(project.updated_at)}</td>
                <td>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenProject(project.id)}
                    aria-label={`Open Project ${project.name}`}
                  >
                    Open Project <span aria-hidden="true">&#8599;</span>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination-container" aria-label="Pagination">
        <div className="pagination-info">
          Showing {startItem}–{endItem} of {total}
        </div>
        <div className="pagination-controls">
          <span className="projects-page-number">Page {Math.floor(offset / limit) + 1} of {Math.max(1, Math.ceil(total / limit))}</span>
          <Button
            variant="secondary"
            size="sm"
            disabled={!canGoPrevious}
            onClick={() => onPageChange(Math.max(0, offset - limit))}
            aria-label="Previous page"
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={!canGoNext}
            onClick={() => onPageChange(offset + limit)}
            aria-label="Next page"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};
