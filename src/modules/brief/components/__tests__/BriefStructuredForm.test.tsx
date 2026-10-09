import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BriefStructuredForm } from '../BriefStructuredForm';
import { briefApi } from '../../api/brief-api';
import type { ProjectBrief, SourceDocument } from '../../types/brief.types';

vi.mock('../../api/brief-api', () => ({
  briefApi: {
    updateBrief: vi.fn(),
  },
}));

describe('BriefStructuredForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockSourceDocument: SourceDocument = {
    id: 'doc_01',
    project_id: 'prj_01',
    source_name: 'CyberPulse Creative Brief v1',
    content: 'Raw brief content text here...',
    created_at: '2026-10-09T10:00:00Z',
  };

  const mockBrief: ProjectBrief = {
    id: 'brief_01',
    project_id: 'prj_01',
    source_document_id: 'doc_01',
    objective: 'Courier transporting encrypted data core',
    visual_style: 'Realistic Cinematic Cyberpunk',
    lighting_mood: 'Moody cool blue lighting, wet asphalt reflections',
    characters: [
      { name: 'Aria', details: 'athletic build, dark undercut, cybernetic eye' },
    ],
    key_props: [
      { name: 'Data Core', details: 'hexagonal encrypted slate' },
    ],
    constraints: ['No confidential footage', 'Cool blue color palette'],
    unresolved_questions: ['Is rain present in all shots?'],
    review_status: 'pending_review',
  };

  it('renders initial structured extraction values and pending review status', () => {
    render(
      <BriefStructuredForm
        projectId="prj_01"
        initialBrief={mockBrief}
        sourceDocument={mockSourceDocument}
        onUpdateSuccess={vi.fn()}
      />
    );

    expect(screen.getByText('[○ Pending Review]')).toBeInTheDocument();
    expect(screen.getByText('ID: brief_01')).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Creative Objective & Narrative Core/i)
    ).toHaveValue('Courier transporting encrypted data core');
    expect(screen.getByLabelText(/Visual Style/i)).toHaveValue(
      'Realistic Cinematic Cyberpunk'
    );
    expect(screen.getByLabelText(/Lighting & Atmosphere/i)).toHaveValue(
      'Moody cool blue lighting, wet asphalt reflections'
    );

    // Entity editors
    expect(screen.getByTestId('char-name-input-0')).toHaveValue('Aria');
    expect(screen.getByTestId('prop-name-input-0')).toHaveValue('Data Core');
    expect(screen.getByTestId('constraints-editor-input-0')).toHaveValue(
      'No confidential footage'
    );
    expect(screen.getByTestId('questions-editor-input-0')).toHaveValue(
      'Is rain present in all shots?'
    );

    // Source doc panel
    expect(screen.getByText('CyberPulse Creative Brief v1')).toBeInTheDocument();
  });

  it('allows editing fields, adding/removing items, and saves draft with pending_review status', async () => {
    const user = userEvent.setup();
    const handleUpdateSuccess = vi.fn();

    const updatedBriefResult: ProjectBrief = {
      ...mockBrief,
      visual_style: 'Neo-Tokyo Cyberpunk Stylized',
      lighting_mood: 'Neon pink and deep purple reflections',
      constraints: ['No confidential footage', 'Cool blue color palette', 'Max 60 FPS'],
      review_status: 'pending_review',
    };

    vi.mocked(briefApi.updateBrief).mockResolvedValueOnce(updatedBriefResult);

    render(
      <BriefStructuredForm
        projectId="prj_01"
        initialBrief={mockBrief}
        sourceDocument={mockSourceDocument}
        onUpdateSuccess={handleUpdateSuccess}
      />
    );

    // Edit Visual Style
    const styleInput = screen.getByLabelText(/Visual Style/i);
    await user.clear(styleInput);
    await user.type(styleInput, 'Neo-Tokyo Cyberpunk Stylized');

    // Edit Lighting Mood
    const lightingInput = screen.getByLabelText(/Lighting & Atmosphere/i);
    await user.clear(lightingInput);
    await user.type(lightingInput, 'Neon pink and deep purple reflections');

    // Add constraint
    const addConstraintBtn = screen.getByTestId('constraints-editor-add-btn');
    await user.click(addConstraintBtn);
    const newConstraintInput = screen.getByTestId('constraints-editor-input-2');
    await user.type(newConstraintInput, 'Max 60 FPS');

    // Click Save Draft
    const saveDraftBtn = screen.getByTestId('save-draft-btn');
    await user.click(saveDraftBtn);

    await waitFor(() => {
      expect(briefApi.updateBrief).toHaveBeenCalledWith('prj_01', {
        objective: 'Courier transporting encrypted data core',
        visual_style: 'Neo-Tokyo Cyberpunk Stylized',
        lighting_mood: 'Neon pink and deep purple reflections',
        characters: [
          { name: 'Aria', details: 'athletic build, dark undercut, cybernetic eye' },
        ],
        key_props: [
          { name: 'Data Core', details: 'hexagonal encrypted slate' },
        ],
        constraints: ['No confidential footage', 'Cool blue color palette', 'Max 60 FPS'],
        unresolved_questions: ['Is rain present in all shots?'],
        review_status: 'pending_review',
      });
      expect(handleUpdateSuccess).toHaveBeenCalledWith(updatedBriefResult);
    });

    expect(screen.getByTestId('brief-success-banner')).toHaveTextContent(
      'Draft saved successfully.'
    );
  });

  it('triggers approval action and updates status to approved', async () => {
    const user = userEvent.setup();
    const handleUpdateSuccess = vi.fn();

    const approvedBrief: ProjectBrief = {
      ...mockBrief,
      review_status: 'approved',
    };

    vi.mocked(briefApi.updateBrief).mockResolvedValueOnce(approvedBrief);

    render(
      <BriefStructuredForm
        projectId="prj_01"
        initialBrief={mockBrief}
        sourceDocument={mockSourceDocument}
        onUpdateSuccess={handleUpdateSuccess}
      />
    );

    expect(screen.getByText('[○ Pending Review]')).toBeInTheDocument();

    const approveBtn = screen.getByTestId('approve-brief-btn');
    await user.click(approveBtn);

    await waitFor(() => {
      expect(briefApi.updateBrief).toHaveBeenCalledWith('prj_01', {
        objective: 'Courier transporting encrypted data core',
        visual_style: 'Realistic Cinematic Cyberpunk',
        lighting_mood: 'Moody cool blue lighting, wet asphalt reflections',
        characters: [
          { name: 'Aria', details: 'athletic build, dark undercut, cybernetic eye' },
        ],
        key_props: [
          { name: 'Data Core', details: 'hexagonal encrypted slate' },
        ],
        constraints: ['No confidential footage', 'Cool blue color palette'],
        unresolved_questions: ['Is rain present in all shots?'],
        review_status: 'approved',
      });
      expect(handleUpdateSuccess).toHaveBeenCalledWith(approvedBrief);
    });

    // Dual-coded badge updates to Approved
    expect(screen.getByText('[● Approved]')).toBeInTheDocument();
    expect(screen.getByTestId('brief-success-banner')).toHaveTextContent(
      'Structured creative brief approved successfully!'
    );
  });

  it('handles and displays error banner when update fails', async () => {
    const user = userEvent.setup();
    vi.mocked(briefApi.updateBrief).mockRejectedValueOnce(
      new Error('Failed to update brief on server.')
    );

    render(
      <BriefStructuredForm
        projectId="prj_01"
        initialBrief={mockBrief}
        sourceDocument={mockSourceDocument}
        onUpdateSuccess={vi.fn()}
      />
    );

    const approveBtn = screen.getByTestId('approve-brief-btn');
    await user.click(approveBtn);

    await waitFor(() => {
      expect(screen.getByText('Failed to update brief on server.')).toBeInTheDocument();
    });
  });

  it('collapses and expands raw source document panel', async () => {
    const user = userEvent.setup();

    render(
      <BriefStructuredForm
        projectId="prj_01"
        initialBrief={mockBrief}
        sourceDocument={mockSourceDocument}
        onUpdateSuccess={vi.fn()}
      />
    );

    expect(screen.queryByTestId('source-doc-content')).not.toBeInTheDocument();

    const toggleBtn = screen.getByTestId('toggle-source-doc-btn');
    expect(toggleBtn).toHaveTextContent('Show Raw Brief');
    await user.click(toggleBtn);

    expect(screen.getByTestId('source-doc-content')).toBeInTheDocument();
    expect(screen.getByText('Raw brief content text here...')).toBeInTheDocument();
    expect(toggleBtn).toHaveTextContent('Hide Raw Brief');

    await user.click(toggleBtn);
    expect(screen.queryByTestId('source-doc-content')).not.toBeInTheDocument();
  });
});
