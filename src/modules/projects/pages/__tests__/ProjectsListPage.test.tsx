import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProjectsListPage } from '../ProjectsListPage';
import { projectsApi } from '../../api/projects-api';
import { ApiClientError } from '../../../../core/network/api-client';

vi.mock('../../api/projects-api', () => ({
  projectsApi: {
    getProjects: vi.fn(),
  },
}));

describe('ProjectsListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', async () => {
    vi.mocked(projectsApi.getProjects).mockReturnValue(new Promise(() => {}));

    render(
      <MemoryRouter>
        <ProjectsListPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('status', { name: /Loading projects.../i })).toBeInTheDocument();
  });

  it('renders empty state when no projects exist', async () => {
    vi.mocked(projectsApi.getProjects).mockResolvedValue({
      items: [],
      total: 0,
      limit: 20,
      offset: 0,
    });

    render(
      <MemoryRouter>
        <ProjectsListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText('No projects found. Create a project to start.')
      ).toBeInTheDocument();
    });

    expect(screen.getAllByRole('button', { name: /Create Project/i })[0]).toBeInTheDocument();
  });

  it('renders success state with populated projects table and badges', async () => {
    vi.mocked(projectsApi.getProjects).mockResolvedValue({
      items: [
        {
          id: 'prj_01',
          name: 'Demo film',
          description: 'Six-shot direction-change demo',
          status: 'draft',
          created_at: '2026-10-09T09:00:00Z',
          updated_at: '2026-10-09T09:00:00Z',
        },
      ],
      total: 1,
      limit: 20,
      offset: 0,
    });

    render(
      <MemoryRouter>
        <ProjectsListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Demo film')).toBeInTheDocument();
    });

    expect(screen.getByText('ID: prj_01')).toBeInTheDocument();
    expect(screen.getByText('Six-shot direction-change demo')).toBeInTheDocument();
    expect(screen.getByText('[● Draft]')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Open Project Demo film/i })).toBeInTheDocument();
    expect(screen.getByText(/Showing 1–1 of 1/i)).toBeInTheDocument();
  });

  it('renders error state with retry button on network/server failure', async () => {
    const error = new ApiClientError({
      status: 500,
      code: 'server_error',
      message: 'An unexpected server error occurred.',
    });
    vi.mocked(projectsApi.getProjects).mockRejectedValueOnce(error);

    render(
      <MemoryRouter>
        <ProjectsListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('An unexpected server error occurred.')).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole('button', { name: /Retry/i });
    expect(retryBtn).toBeInTheDocument();

    // Mock successful retry
    vi.mocked(projectsApi.getProjects).mockResolvedValueOnce({
      items: [],
      total: 0,
      limit: 20,
      offset: 0,
    });

    const user = userEvent.setup();
    await user.click(retryBtn);

    await waitFor(() => {
      expect(
        screen.getByText('No projects found. Create a project to start.')
      ).toBeInTheDocument();
    });
  });

  it('navigates to /projects/new when Create Project button is clicked', async () => {
    vi.mocked(projectsApi.getProjects).mockResolvedValue({
      items: [],
      total: 0,
      limit: 20,
      offset: 0,
    });

    render(
      <MemoryRouter initialEntries={['/projects']}>
        <Routes>
          <Route path="/projects" element={<ProjectsListPage />} />
          <Route path="/projects/new" element={<div>Create Project Page Mock</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText('No projects found. Create a project to start.')
      ).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const createBtn = screen.getAllByRole('button', { name: /Create Project/i })[0];
    await user.click(createBtn);

    expect(screen.getByText('Create Project Page Mock')).toBeInTheDocument();
  });

  it('navigates to /projects/:id when Open Project button is clicked', async () => {
    vi.mocked(projectsApi.getProjects).mockResolvedValue({
      items: [
        {
          id: 'prj_01',
          name: 'Demo film',
          description: 'Six-shot direction-change demo',
          status: 'draft',
          created_at: '2026-10-09T09:00:00Z',
          updated_at: '2026-10-09T09:00:00Z',
        },
      ],
      total: 1,
      limit: 20,
      offset: 0,
    });

    render(
      <MemoryRouter initialEntries={['/projects']}>
        <Routes>
          <Route path="/projects" element={<ProjectsListPage />} />
          <Route path="/projects/:id" element={<div>Project Overview prj_01</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Demo film')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const openBtn = screen.getByRole('button', { name: /Open Project Demo film/i });
    await user.click(openBtn);

    expect(screen.getByText('Project Overview prj_01')).toBeInTheDocument();
  });
});
