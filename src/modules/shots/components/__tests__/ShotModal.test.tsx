import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShotModal } from '../ShotModal';
import type { Shot } from '../../types/shot.types';
import { ApiClientError } from '../../../../core/network/api-client';

describe('ShotModal', () => {
  const existingShot: Shot = {
    id: 'shot_01',
    project_id: 'prj_01',
    sequence_order: 1,
    title: 'Establishing Aerial Alleyway',
    description: 'Wide crane shot of cyberpunk city canyon',
    status: 'draft',
    created_at: '2026-10-09T10:00:00Z',
    updated_at: '2026-10-09T10:00:00Z',
  };

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <ShotModal
        isOpen={false}
        mode="create"
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders create modal with empty fields and validates required title', async () => {
    const handleSubmit = vi.fn();
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <ShotModal
        isOpen={true}
        mode="create"
        nextSequenceOrder={2}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    );

    expect(screen.getByRole('heading', { name: 'Add New Shot' })).toBeInTheDocument();
    expect(screen.getByTestId('shot-modal')).toBeInTheDocument();

    const titleInput = screen.getByLabelText(/Shot Title/i);
    expect(titleInput).toHaveValue('');

    // Try submitting without title
    const submitBtn = screen.getByRole('button', { name: 'Create Shot' });
    await user.click(submitBtn);

    expect(screen.getByText('Shot title is required.')).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();

    // Enter title and submit
    await user.type(titleInput, 'Aria Medium Portrait');
    await user.type(
      screen.getByLabelText(/Description/i),
      'Medium portrait of Aria pausing under doorway canopy'
    );
    await user.click(submitBtn);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        title: 'Aria Medium Portrait',
        description: 'Medium portrait of Aria pausing under doorway canopy',
        sequence_order: 2,
      });
      expect(handleClose).toHaveBeenCalled();
    });
  });

  it('renders edit modal pre-filled with shot data and allows updating status', async () => {
    const handleSubmit = vi.fn();
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <ShotModal
        isOpen={true}
        mode="edit"
        shot={existingShot}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    );

    expect(
      screen.getByRole('heading', { name: 'Edit Shot: shot_01' })
    ).toBeInTheDocument();

    const titleInput = screen.getByLabelText(/Shot Title/i);
    expect(titleInput).toHaveValue('Establishing Aerial Alleyway');

    const descInput = screen.getByLabelText(/Description/i);
    expect(descInput).toHaveValue('Wide crane shot of cyberpunk city canyon');

    const statusSelect = screen.getByLabelText(/Production Status/i);
    expect(statusSelect).toHaveValue('draft');

    // Change title and status
    await user.clear(titleInput);
    await user.type(titleInput, 'Establishing Aerial Alleyway (Revised)');
    await user.selectOptions(statusSelect, 'in_progress');

    await user.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        title: 'Establishing Aerial Alleyway (Revised)',
        description: 'Wide crane shot of cyberpunk city canyon',
        status: 'in_progress',
        sequence_order: 1,
      });
      expect(handleClose).toHaveBeenCalled();
    });
  });

  it('displays API field validation error when backend rejects input', async () => {
    const apiError = new ApiClientError({
      status: 400,
      code: 'validation_error',
      message: 'Invalid payload',
      fields: [{ field: 'title', message: 'Title already exists in sequence' }],
    });
    const handleSubmit = vi.fn().mockRejectedValueOnce(apiError);
    const user = userEvent.setup();

    render(
      <ShotModal
        isOpen={true}
        mode="create"
        onClose={vi.fn()}
        onSubmit={handleSubmit}
      />
    );

    await user.type(screen.getByLabelText(/Shot Title/i), 'Duplicate Shot');
    await user.click(screen.getByRole('button', { name: 'Create Shot' }));

    await waitFor(() => {
      expect(
        screen.getByText('Title already exists in sequence')
      ).toBeInTheDocument();
    });
  });
});
