import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BriefIngestionForm } from '../BriefIngestionForm';
import { briefApi } from '../../api/brief-api';
import type { ProjectBrief, SourceDocument } from '../../types/brief.types';

vi.mock('../../api/brief-api', () => ({
  briefApi: {
    generateBrief: vi.fn(),
    ingestBrief: vi.fn(),
    extractBrief: vi.fn(),
  },
}));

describe('BriefIngestionForm', () => {
  it('preserves input when AI rejects unrelated content and allows correction', async () => {
    vi.mocked(briefApi.generateBrief).mockRejectedValueOnce(new Error('This recipe is not a creative brief.'));
    render(<BriefIngestionForm projectId="prj_reject" onIngestSuccess={vi.fn()} />);
    await userEvent.type(screen.getByLabelText(/Raw Brief Content/), 'Rebus telur lalu sajikan.');
    await userEvent.click(screen.getByRole('button', { name: /Generate Brief/ }));
    expect(await screen.findByText('This recipe is not a creative brief.')).toBeInTheDocument();
    expect(screen.getByLabelText(/Raw Brief Content/)).toHaveValue('Rebus telur lalu sajikan.');
    expect(screen.getByRole('button', { name: /Generate Brief/ })).toBeEnabled();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders default source name and content textarea', () => {
    render(
      <BriefIngestionForm
        projectId="prj_01"
        onIngestSuccess={vi.fn()}
      />
    );

    expect(screen.getByRole('heading', { level: 2, name: /Ingest Creative Brief/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Source Document Name/i)).toHaveValue('Creative Brief v1');
    expect(screen.getByLabelText(/Raw Brief Content/i)).toHaveValue('');
    expect(screen.getByRole('button', { name: /Generate Brief/i })).toBeInTheDocument();
  });

  it('validates required fields before submitting', async () => {
    const user = userEvent.setup();
    const handleSuccess = vi.fn();

    render(
      <BriefIngestionForm
        projectId="prj_01"
        onIngestSuccess={handleSuccess}
      />
    );

    // Clear source name and submit
    const sourceNameInput = screen.getByLabelText(/Source Document Name/i);
    await user.clear(sourceNameInput);

    const submitBtn = screen.getByRole('button', { name: /Generate Brief/i });
    await user.click(submitBtn);

    expect(screen.getByText('Source name is required.')).toBeInTheDocument();
    expect(screen.getByText('Brief content cannot be empty.')).toBeInTheDocument();
    expect(briefApi.ingestBrief).not.toHaveBeenCalled();
    expect(briefApi.extractBrief).not.toHaveBeenCalled();
    expect(handleSuccess).not.toHaveBeenCalled();
  });

  it('submits ingestion then extraction and calls onIngestSuccess', async () => {
    const user = userEvent.setup();
    const handleSuccess = vi.fn();

    const mockDoc: SourceDocument = {
      id: 'doc_01',
      project_id: 'prj_01',
      source_name: 'CyberPulse Creative Brief v1',
      content: 'Cyberpunk courier story featuring Aria.',
      created_at: '2026-10-09T10:00:00Z',
    };

    const mockBrief: ProjectBrief = {
      id: 'brief_01',
      project_id: 'prj_01',
      objective: 'Courier transporting encrypted data core',
      visual_style: 'Realistic Cinematic Cyberpunk',
      lighting_mood: 'Moody cool blue lighting',
      characters: [{ name: 'Aria', details: 'athletic build' }],
      key_props: [{ name: 'Data Core', details: 'hexagonal slate' }],
      constraints: ['No confidential footage'],
      unresolved_questions: ['Is rain present in all shots?'],
      review_status: 'pending_review',
    };

    vi.mocked(briefApi.generateBrief).mockResolvedValueOnce({ source_document: mockDoc, brief: mockBrief });

    render(
      <BriefIngestionForm
        projectId="prj_01"
        onIngestSuccess={handleSuccess}
      />
    );

    const sourceNameInput = screen.getByLabelText(/Source Document Name/i);
    await user.clear(sourceNameInput);
    await user.type(sourceNameInput, 'CyberPulse Creative Brief v1');

    const contentInput = screen.getByLabelText(/Raw Brief Content/i);
    await user.type(contentInput, 'Cyberpunk courier story featuring Aria.');

    const submitBtn = screen.getByRole('button', { name: /Generate Brief/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(briefApi.generateBrief).toHaveBeenCalledWith('prj_01', {
        source_name: 'CyberPulse Creative Brief v1',
        content: 'Cyberpunk courier story featuring Aria.',
      });
      expect(briefApi.ingestBrief).not.toHaveBeenCalled();
      expect(handleSuccess).toHaveBeenCalledWith(mockDoc, mockBrief);
    });
  });

  it('displays error banner if ingestion fails', async () => {
    const user = userEvent.setup();
    vi.mocked(briefApi.generateBrief).mockRejectedValueOnce(new Error('Ingestion service failed.'));

    render(
      <BriefIngestionForm
        projectId="prj_01"
        onIngestSuccess={vi.fn()}
      />
    );

    const contentInput = screen.getByLabelText(/Raw Brief Content/i);
    await user.type(contentInput, 'Some brief text');

    const submitBtn = screen.getByRole('button', { name: /Generate Brief/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Ingestion service failed.')).toBeInTheDocument();
    });
  });
});
