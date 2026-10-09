import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProjectTable } from '../ProjectTable';
import type { Project } from '../../types/project.types';

describe('ProjectTable', () => {
  const sampleProjects: Project[] = [
    {
      id: 'prj_01',
      name: 'Project Alpha',
      description: 'Alpha description',
      status: 'active',
      created_at: '2026-10-09T09:00:00Z',
      updated_at: '2026-10-09T09:00:00Z',
    },
    {
      id: 'prj_02',
      name: 'Project Beta',
      description: null,
      status: 'archived',
      created_at: '2026-10-08T09:00:00Z',
      updated_at: '2026-10-08T09:00:00Z',
    },
  ];

  it('renders table headers and project rows correctly', () => {
    render(
      <ProjectTable
        projects={sampleProjects}
        total={2}
        limit={20}
        offset={0}
        onPageChange={vi.fn()}
        onOpenProject={vi.fn()}
      />
    );

    expect(screen.getByRole('columnheader', { name: 'Project Name' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Project ID' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Description' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Status' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Last Updated' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Actions' })).toBeInTheDocument();

    expect(screen.getByText('Project Alpha')).toBeInTheDocument();
    expect(screen.getByText('ID: prj_01')).toBeInTheDocument();
    expect(screen.getByText('[● Active]')).toBeInTheDocument();

    expect(screen.getByText('Project Beta')).toBeInTheDocument();
    expect(screen.getByText('ID: prj_02')).toBeInTheDocument();
    expect(screen.getByText('[● Archived]')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument(); // null description fallback
  });

  it('handles pagination navigation and button disabling', async () => {
    const handlePageChange = vi.fn();

    const { rerender } = render(
      <ProjectTable
        projects={sampleProjects}
        total={50}
        limit={20}
        offset={0}
        onPageChange={handlePageChange}
        onOpenProject={vi.fn()}
      />
    );

    const prevBtn = screen.getByRole('button', { name: /Previous page/i });
    const nextBtn = screen.getByRole('button', { name: /Next page/i });

    expect(prevBtn).toBeDisabled();
    expect(nextBtn).toBeEnabled();

    const user = userEvent.setup();
    await user.click(nextBtn);
    expect(handlePageChange).toHaveBeenCalledWith(20);

    // Re-render at offset 20
    rerender(
      <ProjectTable
        projects={sampleProjects}
        total={50}
        limit={20}
        offset={20}
        onPageChange={handlePageChange}
        onOpenProject={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /Previous page/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /Next page/i })).toBeEnabled();

    // Re-render at offset 40 (last page)
    rerender(
      <ProjectTable
        projects={sampleProjects}
        total={50}
        limit={20}
        offset={40}
        onPageChange={handlePageChange}
        onOpenProject={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /Previous page/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /Next page/i })).toBeDisabled();
  });
});
