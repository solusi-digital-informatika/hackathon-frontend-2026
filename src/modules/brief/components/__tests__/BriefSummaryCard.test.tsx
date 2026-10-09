import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { BriefSummaryCard } from '../BriefSummaryCard';
import type { ProjectBrief } from '../../types/brief.types';

const mockBrief: ProjectBrief = {
  id: 'brief_01',
  project_id: 'prj_01',
  objective: 'Courier transporting encrypted data core across neon city',
  visual_style: 'Realistic Cinematic Cyberpunk',
  lighting_mood: 'Moody cool blue lighting, wet asphalt',
  characters: [
    { name: 'Aria', details: 'athletic build, dark undercut, cybernetic eye' },
  ],
  key_props: [{ name: 'Data Core', details: 'hexagonal encrypted slate' }],
  constraints: ['No confidential footage', 'Cool blue color palette'],
  unresolved_questions: ['Is rain present in all shots?'],
  review_status: 'pending_review',
};

describe('BriefSummaryCard', () => {
  it('renders brief fields, status badge, and meta pills', () => {
    render(
      <MemoryRouter>
        <BriefSummaryCard brief={mockBrief} projectId="prj_01" />
      </MemoryRouter>
    );

    expect(screen.getByText('Structured Creative Brief')).toBeInTheDocument();
    expect(screen.getByText('[○ Pending Review]')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Courier transporting encrypted data core across neon city'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText('Realistic Cinematic Cyberpunk')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Moody cool blue lighting, wet asphalt')
    ).toBeInTheDocument();

    expect(screen.getByText('1 Character')).toBeInTheDocument();
    expect(screen.getByText('1 Key Prop')).toBeInTheDocument();
    expect(screen.getByText('2 Constraints')).toBeInTheDocument();
    expect(screen.getByText('1 Question')).toBeInTheDocument();
  });

  it('triggers onOpenWorkspace callback when button is clicked', async () => {
    const handleOpen = vi.fn();
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <BriefSummaryCard
          brief={mockBrief}
          projectId="prj_01"
          onOpenWorkspace={handleOpen}
        />
      </MemoryRouter>
    );

    const openBtn = screen.getByRole('button', {
      name: /Open Brief Workspace/i,
    });
    await user.click(openBtn);

    expect(handleOpen).toHaveBeenCalledTimes(1);
  });
});
