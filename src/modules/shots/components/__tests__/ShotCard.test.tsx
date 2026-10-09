import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShotCard } from '../ShotCard';
import type { Shot } from '../../types/shot.types';

describe('ShotCard', () => {
  const sampleShot: Shot = {
    id: 'shot_01',
    project_id: 'prj_01',
    sequence_order: 1,
    title: 'Establishing Aerial Alleyway',
    description: 'Wide crane shot of cyberpunk city canyon',
    status: 'draft',
    created_at: '2026-10-09T10:00:00Z',
    updated_at: '2026-10-09T10:00:00Z',
  };

  it('renders shot card with sequence badge, stable ID, title, description, and dual-coded status', () => {
    render(
      <ShotCard
        shot={sampleShot}
        isFirst={true}
        isLast={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onMoveUp={vi.fn()}
        onMoveDown={vi.fn()}
      />
    );

    // Card container
    expect(screen.getByTestId('shot-card-shot_01')).toBeInTheDocument();

    // Sequence badge
    const seqBadge = screen.getByTestId('shot-seq-shot_01');
    expect(seqBadge).toHaveTextContent('#01');

    // Stable ID
    const idChip = screen.getByTestId('shot-id-shot_01');
    expect(idChip).toHaveTextContent('shot_01');

    // Title and description
    expect(
      screen.getByRole('heading', { level: 3, name: 'Establishing Aerial Alleyway' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Wide crane shot of cyberpunk city canyon')
    ).toBeInTheDocument();

    // Dual-coded status badge
    expect(screen.getByTestId('shot-status-badge-shot_01')).toBeInTheDocument();
    expect(screen.getByText('[○ Draft]')).toBeInTheDocument();

    // Thumbnail container placeholder
    expect(screen.getByTestId('shot-thumbnail-shot_01')).toBeInTheDocument();
    expect(screen.getByText('No Asset Selected')).toBeInTheDocument();
  });

  it('handles reorder button disabled states for first and last shots', () => {
    const { rerender } = render(
      <ShotCard
        shot={sampleShot}
        isFirst={true}
        isLast={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onMoveUp={vi.fn()}
        onMoveDown={vi.fn()}
      />
    );

    const moveUpBtn = screen.getByTestId('btn-move-up-shot_01');
    const moveDownBtn = screen.getByTestId('btn-move-down-shot_01');

    expect(moveUpBtn).toBeDisabled();
    expect(moveDownBtn).toBeEnabled();

    // When shot is last
    rerender(
      <ShotCard
        shot={sampleShot}
        isFirst={false}
        isLast={true}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onMoveUp={vi.fn()}
        onMoveDown={vi.fn()}
      />
    );

    expect(moveUpBtn).toBeEnabled();
    expect(moveDownBtn).toBeDisabled();
  });

  it('triggers onEdit, onDelete, onMoveUp, and onMoveDown callbacks', async () => {
    const handleEdit = vi.fn();
    const handleDelete = vi.fn();
    const handleMoveUp = vi.fn();
    const handleMoveDown = vi.fn();
    const user = userEvent.setup();

    render(
      <ShotCard
        shot={sampleShot}
        isFirst={false}
        isLast={false}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
      />
    );

    await user.click(screen.getByTestId('btn-move-up-shot_01'));
    expect(handleMoveUp).toHaveBeenCalledWith(sampleShot);

    await user.click(screen.getByTestId('btn-move-down-shot_01'));
    expect(handleMoveDown).toHaveBeenCalledWith(sampleShot);

    await user.click(screen.getByRole('button', { name: /Edit shot Establishing Aerial Alleyway/i }));
    expect(handleEdit).toHaveBeenCalledWith(sampleShot);

    await user.click(screen.getByRole('button', { name: /Delete shot Establishing Aerial Alleyway/i }));
    expect(handleDelete).toHaveBeenCalledWith(sampleShot);
  });
});
