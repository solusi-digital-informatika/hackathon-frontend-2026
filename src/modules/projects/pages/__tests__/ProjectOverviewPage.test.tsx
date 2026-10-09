import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProjectOverviewPage } from '../ProjectOverviewPage';
import { projectsApi } from '../../api/projects-api';
import { shotsApi } from '../../../shots/api/shots-api';
import { ApiClientError } from '../../../../core/network/api-client';

vi.mock('../../api/projects-api', () => ({
  projectsApi: {
    getProject: vi.fn(),
  },
}));

vi.mock('../../../shots/api/shots-api', () => ({
  shotsApi: {
    getShots: vi.fn().mockResolvedValue({ items: [], total: 0 }),
    getShot: vi.fn(),
    createShot: vi.fn(),
    updateShot: vi.fn(),
    deleteShot: vi.fn(),
  },
}));

describe('ProjectOverviewPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    vi.mocked(projectsApi.getProject).mockReturnValue(new Promise(() => {}));

    render(
      <MemoryRouter initialEntries={['/projects/prj_01']}>
        <Routes>
          <Route path="/projects/:id" element={<ProjectOverviewPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      screen.getByRole('status', { name: /Loading project workspace.../i })
    ).toBeInTheDocument();
  });

  it('renders 404 not found state for unknown or inaccessible project (AC3)', async () => {
    const error = new ApiClientError({
      status: 404,
      code: 'not_found',
      message: 'Project not found or inaccessible',
    });
    vi.mocked(projectsApi.getProject).mockRejectedValueOnce(error);

    render(
      <MemoryRouter initialEntries={['/projects/unknown_prj']}>
        <Routes>
          <Route path="/projects/:id" element={<ProjectOverviewPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText('Project not found or inaccessible')
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole('button', { name: /Back to Projects/i })
    ).toBeInTheDocument();
  });

  it('renders 500 server error fallback with retry action', async () => {
    const error = new ApiClientError({
      status: 500,
      code: 'server_error',
      message: 'An unexpected server error occurred.',
    });
    vi.mocked(projectsApi.getProject).mockRejectedValueOnce(error);

    render(
      <MemoryRouter initialEntries={['/projects/prj_01']}>
        <Routes>
          <Route path="/projects/:id" element={<ProjectOverviewPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText('An unexpected server error occurred.')
      ).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole('button', { name: /Retry/i });
    expect(retryBtn).toBeInTheDocument();

    // Successful retry
    vi.mocked(projectsApi.getProject).mockResolvedValueOnce({
      id: 'prj_01',
      name: 'Demo film',
      description: 'Six-shot direction-change demo',
      status: 'draft',
      created_at: '2026-10-09T09:00:00Z',
      updated_at: '2026-10-09T09:00:00Z',
    });

    const user = userEvent.setup();
    await user.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Demo film' })).toBeInTheDocument();
    });
  });

  it('renders workspace overview with ID badge, status, and static brief/shot placeholders (AC2, AC4)', async () => {
    vi.mocked(projectsApi.getProject).mockResolvedValueOnce({
      id: 'prj_01',
      name: 'Demo film',
      description: 'Six-shot direction-change demo',
      status: 'draft',
      created_at: '2026-10-09T09:00:00Z',
      updated_at: '2026-10-09T09:00:00Z',
    });

    render(
      <MemoryRouter initialEntries={['/projects/prj_01']}>
        <Routes>
          <Route path="/projects/:id" element={<ProjectOverviewPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: 'Demo film' })
      ).toBeInTheDocument();
    });

    // Stable identifier badge (AC2)
    expect(screen.getByText('ID: prj_01')).toBeInTheDocument();

    // Dual-coded status badge
    expect(screen.getByText('[● Draft]')).toBeInTheDocument();

    // Description
    expect(
      screen.getByText('Six-shot direction-change demo')
    ).toBeInTheDocument();

    // Active brief static placeholder (AC4)
    expect(
      screen.getByRole('heading', { level: 2, name: /Active Brief/i })
    ).toBeInTheDocument();
    expect(screen.getByText('No brief yet')).toBeInTheDocument();

    // Shot board component replacing static placeholder (AC5)
    expect(
      screen.getByRole('heading', { level: 2, name: /Shot Board/i })
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('No shots yet')).toBeInTheDocument();
    });
  });

  it('navigates back to /projects when Back to Projects button is clicked', async () => {
    vi.mocked(projectsApi.getProject).mockResolvedValueOnce({
      id: 'prj_01',
      name: 'Demo film',
      status: 'draft',
      created_at: '2026-10-09T09:00:00Z',
      updated_at: '2026-10-09T09:00:00Z',
    });

    render(
      <MemoryRouter initialEntries={['/projects/prj_01']}>
        <Routes>
          <Route path="/projects/:id" element={<ProjectOverviewPage />} />
          <Route path="/projects" element={<div>Projects List Page Mock</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Demo film')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Back to Projects/i }));

    expect(screen.getByText('Projects List Page Mock')).toBeInTheDocument();
  });

  it('renders Shot Board with active shots replacing empty placeholder (AC5)', async () => {
    vi.mocked(projectsApi.getProject).mockResolvedValueOnce({
      id: 'prj_01',
      name: 'Demo film',
      description: 'Six-shot direction-change demo',
      status: 'draft',
      created_at: '2026-10-09T09:00:00Z',
      updated_at: '2026-10-09T09:00:00Z',
    });

    vi.mocked(shotsApi.getShots).mockResolvedValueOnce({
      items: [
        {
          id: 'shot_01',
          project_id: 'prj_01',
          sequence_order: 1,
          title: 'Establishing Aerial Alleyway',
          description: 'Wide crane shot',
          status: 'draft',
          created_at: '2026-10-09T10:00:00Z',
          updated_at: '2026-10-09T10:00:00Z',
        },
      ],
      total: 1,
    });

    render(
      <MemoryRouter initialEntries={['/projects/prj_01']}>
        <Routes>
          <Route path="/projects/:id" element={<ProjectOverviewPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Demo film' })).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByTestId('shot-card-shot_01')).toBeInTheDocument();
    });

    expect(screen.getByText('Establishing Aerial Alleyway')).toBeInTheDocument();
    expect(screen.getByText('#01')).toBeInTheDocument();
    expect(screen.getByText('[○ Draft]')).toBeInTheDocument();
  });
});
