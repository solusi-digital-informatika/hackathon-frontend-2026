import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { BriefWorkspacePage } from '../BriefWorkspacePage';
import { projectsApi } from '../../../projects/api/projects-api';
import { briefApi } from '../../api/brief-api';
import { ApiClientError } from '../../../../core/network/api-client';
import type { ProjectBrief, SourceDocument } from '../../types/brief.types';

vi.mock('../../../projects/api/projects-api', () => ({
  projectsApi: {
    getProject: vi.fn(),
  },
}));

vi.mock('../../api/brief-api', () => ({
  briefApi: {
    getActiveBrief: vi.fn(),
    ingestBrief: vi.fn(),
    extractBrief: vi.fn(),
    updateBrief: vi.fn(),
  },
}));

describe('BriefWorkspacePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockProject = {
    id: 'prj_01',
    name: 'CyberPulse Film',
    description: 'Cyberpunk short film',
    status: 'draft' as const,
    created_at: '2026-10-09T09:00:00Z',
    updated_at: '2026-10-09T09:00:00Z',
  };

  const mockSourceDocument: SourceDocument = {
    id: 'doc_01',
    project_id: 'prj_01',
    source_name: 'Creative Brief v1',
    content: 'Courier transporting encrypted data core.',
    created_at: '2026-10-09T10:00:00Z',
  };

  const mockBrief: ProjectBrief = {
    id: 'brief_01',
    project_id: 'prj_01',
    objective: 'Deliver the core',
    visual_style: 'Realistic Cinematic Cyberpunk',
    lighting_mood: 'Moody cool blue lighting',
    characters: [{ name: 'Aria', details: 'athletic build' }],
    key_props: [{ name: 'Data Core', details: 'hexagonal slate' }],
    constraints: ['No confidential footage'],
    unresolved_questions: [],
    review_status: 'pending_review',
  };

  it('renders loading indicator initially', () => {
    vi.mocked(projectsApi.getProject).mockReturnValue(new Promise(() => {}));

    render(
      <MemoryRouter initialEntries={['/projects/prj_01/brief']}>
        <Routes>
          <Route path="/projects/:id/brief" element={<BriefWorkspacePage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      screen.getByRole('status', { name: /Loading brief workspace.../i })
    ).toBeInTheDocument();
  });

  it('renders 404 empty state when project is not found', async () => {
    vi.mocked(projectsApi.getProject).mockRejectedValueOnce(
      new ApiClientError({
        status: 404,
        code: 'not_found',
        message: 'Project not found or inaccessible.',
      })
    );

    render(
      <MemoryRouter initialEntries={['/projects/prj_unknown/brief']}>
        <Routes>
          <Route path="/projects/:id/brief" element={<BriefWorkspacePage />} />
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

  it('renders Ingestion Mode when project exists but has no active brief', async () => {
    vi.mocked(projectsApi.getProject).mockResolvedValueOnce(mockProject);
    vi.mocked(briefApi.getActiveBrief).mockResolvedValueOnce({
      sourceDocument: null,
      brief: null,
    });

    render(
      <MemoryRouter initialEntries={['/projects/prj_01/brief']}>
        <Routes>
          <Route path="/projects/:id/brief" element={<BriefWorkspacePage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Brief Workspace' })).toBeInTheDocument();
    });

    expect(screen.getByText('CyberPulse Film')).toBeInTheDocument();
    expect(screen.getByText('Mode: Ingestion')).toBeInTheDocument();
    expect(screen.getByTestId('brief-ingestion-form')).toBeInTheDocument();
  });

  it('renders Review Mode when project has an active brief', async () => {
    vi.mocked(projectsApi.getProject).mockResolvedValueOnce(mockProject);
    vi.mocked(briefApi.getActiveBrief).mockResolvedValueOnce({
      sourceDocument: mockSourceDocument,
      brief: mockBrief,
    });

    render(
      <MemoryRouter initialEntries={['/projects/prj_01/brief']}>
        <Routes>
          <Route path="/projects/:id/brief" element={<BriefWorkspacePage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Mode: Review & Calibration')).toBeInTheDocument();
    });

    expect(screen.getByTestId('brief-structured-form')).toBeInTheDocument();
    expect(screen.getByText('[○ Pending Review]')).toBeInTheDocument();
  });

  it('transitions from Ingestion Mode to Review Mode upon successful ingest & extraction', async () => {
    const user = userEvent.setup();

    vi.mocked(projectsApi.getProject).mockResolvedValueOnce(mockProject);
    vi.mocked(briefApi.getActiveBrief).mockResolvedValueOnce({
      sourceDocument: null,
      brief: null,
    });

    vi.mocked(briefApi.ingestBrief).mockResolvedValueOnce(mockSourceDocument);
    vi.mocked(briefApi.extractBrief).mockResolvedValueOnce(mockBrief);

    render(
      <MemoryRouter initialEntries={['/projects/prj_01/brief']}>
        <Routes>
          <Route path="/projects/:id/brief" element={<BriefWorkspacePage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Mode: Ingestion')).toBeInTheDocument();
    });

    const contentInput = screen.getByLabelText(/Raw Brief Content/i);
    await user.type(contentInput, 'Courier transporting encrypted data core.');

    const submitBtn = screen.getByRole('button', { name: /Ingest & Extract Brief/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Mode: Review & Calibration')).toBeInTheDocument();
      expect(screen.getByTestId('brief-structured-form')).toBeInTheDocument();
    });
  });

  it('navigates back to project overview when Back button is clicked', async () => {
    const user = userEvent.setup();

    vi.mocked(projectsApi.getProject).mockResolvedValueOnce(mockProject);
    vi.mocked(briefApi.getActiveBrief).mockResolvedValueOnce({
      sourceDocument: null,
      brief: null,
    });

    render(
      <MemoryRouter initialEntries={['/projects/prj_01/brief']}>
        <Routes>
          <Route path="/projects/:id/brief" element={<BriefWorkspacePage />} />
          <Route path="/projects/:id" element={<div>Project Overview Page Mock</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Brief Workspace' })).toBeInTheDocument();
    });

    const backBtn = screen.getByRole('button', { name: /Back to Project Overview/i });
    await user.click(backBtn);

    expect(screen.getByText('Project Overview Page Mock')).toBeInTheDocument();
  });
});
