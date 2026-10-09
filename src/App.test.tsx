import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { projectsApi } from './modules/projects/api/projects-api';

vi.mock('./modules/projects/api/projects-api', () => ({
  projectsApi: {
    getProjects: vi.fn(),
    getProject: vi.fn(),
    createProject: vi.fn(),
  },
}));

describe('App Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects from / to /projects and renders projects list', async () => {
    vi.mocked(projectsApi.getProjects).mockResolvedValueOnce({
      items: [],
      total: 0,
      limit: 20,
      offset: 0,
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Projects' })).toBeInTheDocument();
    });
  });

  it('navigates through Create Project form and reaches Project Overview (AC1, AC2, AC4)', async () => {
    vi.mocked(projectsApi.getProjects).mockResolvedValueOnce({
      items: [],
      total: 0,
      limit: 20,
      offset: 0,
    });

    vi.mocked(projectsApi.createProject).mockResolvedValueOnce({
      id: 'prj_01',
      name: 'Demo film',
      description: 'Six-shot direction-change demo',
      status: 'draft',
      created_at: '2026-10-09T09:00:00Z',
      updated_at: '2026-10-09T09:00:00Z',
    });

    vi.mocked(projectsApi.getProject).mockResolvedValueOnce({
      id: 'prj_01',
      name: 'Demo film',
      description: 'Six-shot direction-change demo',
      status: 'draft',
      created_at: '2026-10-09T09:00:00Z',
      updated_at: '2026-10-09T09:00:00Z',
    });

    render(
      <MemoryRouter initialEntries={['/projects']}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Projects' })).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const createBtn = screen.getAllByRole('button', { name: /Create Project/i })[0];
    await user.click(createBtn);

    // Now on /projects/new
    expect(screen.getByRole('heading', { level: 1, name: 'Create Project' })).toBeInTheDocument();

    await user.type(screen.getByLabelText(/Project Name/i), 'Demo film');
    await user.type(screen.getByLabelText(/Description/i), 'Six-shot direction-change demo');
    await user.click(screen.getByRole('button', { name: /Create & Open Project/i }));

    // Navigates to /projects/prj_01
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Demo film' })).toBeInTheDocument();
    });

    expect(screen.getByText('ID: prj_01')).toBeInTheDocument();
    expect(screen.getByText('[● Draft]')).toBeInTheDocument();
    expect(screen.getByText('No brief yet')).toBeInTheDocument();
    expect(screen.getByText('No shots yet')).toBeInTheDocument();
  });
});
