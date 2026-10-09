import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShotBoard } from '../ShotBoard';
import { shotsApi } from '../../api/shots-api';
import type { Shot } from '../../types/shot.types';
import { ApiClientError } from '../../../../core/network/api-client';

vi.mock('../../api/shots-api', () => ({
  shotsApi: {
    getShots: vi.fn(),
    getShot: vi.fn(),
    createShot: vi.fn(),
    updateShot: vi.fn(),
    deleteShot: vi.fn(),
  },
}));

describe('ShotBoard', () => {
  const mockShots: Shot[] = [
    {
      id: 'shot_01',
      project_id: 'prj_01',
      sequence_order: 1,
      title: 'Establishing Aerial Alleyway',
      description: 'Wide crane shot of cyberpunk city canyon',
      status: 'draft',
      created_at: '2026-10-09T10:00:00Z',
      updated_at: '2026-10-09T10:00:00Z',
    },
    {
      id: 'shot_02',
      project_id: 'prj_01',
      sequence_order: 2,
      title: 'Aria Medium Portrait',
      description: 'Medium portrait of Aria pausing under doorway canopy',
      status: 'in_progress',
      created_at: '2026-10-09T10:01:00Z',
      updated_at: '2026-10-09T10:01:00Z',
    },
    {
      id: 'shot_03',
      project_id: 'prj_01',
      sequence_order: 3,
      title: 'Holographic Data Core HUD Overlay',
      description: 'Diegetic vector graphic user interface HUD',
      status: 'approved',
      created_at: '2026-10-09T10:02:00Z',
      updated_at: '2026-10-09T10:02:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    vi.mocked(shotsApi.getShots).mockReturnValue(new Promise(() => {}));

    render(<ShotBoard projectId="prj_01" />);

    expect(
      screen.getByRole('status', { name: /Loading shots.../i })
    ).toBeInTheDocument();
  });

  it('renders empty state when no shots exist (D-003, AC5)', async () => {
    vi.mocked(shotsApi.getShots).mockResolvedValueOnce({
      items: [],
      total: 0,
    });

    render(<ShotBoard projectId="prj_01" />);

    await waitFor(() => {
      expect(
        screen.getByText('No shots yet. Add a shot to start planning.')
      ).toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { level: 3, name: 'No shots yet' })).toBeInTheDocument();
    expect(screen.getByTestId('shot-board-empty')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: '+ Add Shot' })[0]).toBeInTheDocument();
  });

  it('renders error state and handles retry action', async () => {
    const error = new ApiClientError({
      status: 500,
      code: 'server_error',
      message: 'Failed to connect to shot service',
    });
    vi.mocked(shotsApi.getShots).mockRejectedValueOnce(error);

    render(<ShotBoard projectId="prj_01" />);

    await waitFor(() => {
      expect(
        screen.getByText('Failed to connect to shot service')
      ).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole('button', { name: /Retry/i });
    expect(retryBtn).toBeInTheDocument();

    vi.mocked(shotsApi.getShots).mockResolvedValueOnce({
      items: mockShots,
      total: 3,
    });

    const user = userEvent.setup();
    await user.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByTestId('shot-card-shot_01')).toBeInTheDocument();
    });
  });

  it('renders shot cards grid with sequence badges, stable IDs, and dual-coded statuses', async () => {
    vi.mocked(shotsApi.getShots).mockResolvedValueOnce({
      items: mockShots,
      total: 3,
    });

    render(<ShotBoard projectId="prj_01" />);

    await waitFor(() => {
      expect(screen.getByTestId('shot-card-shot_01')).toBeInTheDocument();
    });

    // Shot 1
    expect(screen.getByTestId('shot-seq-shot_01')).toHaveTextContent('#01');
    expect(screen.getByTestId('shot-id-shot_01')).toHaveTextContent('shot_01');
    expect(screen.getByText('Establishing Aerial Alleyway')).toBeInTheDocument();
    expect(screen.getByText('[○ Draft]')).toBeInTheDocument();

    // Shot 2
    expect(screen.getByTestId('shot-seq-shot_02')).toHaveTextContent('#02');
    expect(screen.getByTestId('shot-id-shot_02')).toHaveTextContent('shot_02');
    expect(screen.getByText('Aria Medium Portrait')).toBeInTheDocument();
    expect(screen.getByText('[⏳ In Progress]')).toBeInTheDocument();

    // Shot 3
    expect(screen.getByTestId('shot-seq-shot_03')).toHaveTextContent('#03');
    expect(screen.getByTestId('shot-id-shot_03')).toHaveTextContent('shot_03');
    expect(screen.getByText('Holographic Data Core HUD Overlay')).toBeInTheDocument();
    expect(screen.getByText('[✓ Approved]')).toBeInTheDocument();
  });

  it('switches between Storyboard Cards view and List View', async () => {
    vi.mocked(shotsApi.getShots).mockResolvedValueOnce({
      items: mockShots,
      total: 3,
    });

    const user = userEvent.setup();
    render(<ShotBoard projectId="prj_01" />);

    await waitFor(() => {
      expect(screen.getByTestId('shot-card-shot_01')).toBeInTheDocument();
    });

    const listViewBtn = screen.getByTestId('btn-view-list');
    await user.click(listViewBtn);

    // Now in table view
    expect(screen.getByRole('table', { name: 'Shots table' })).toBeInTheDocument();
    expect(screen.getByTestId('shot-row-shot_01')).toBeInTheDocument();
    expect(screen.getByTestId('shot-row-shot_02')).toBeInTheDocument();
    expect(screen.getByTestId('shot-row-shot_03')).toBeInTheDocument();

    // Switch back to cards
    const cardsViewBtn = screen.getByTestId('btn-view-cards');
    await user.click(cardsViewBtn);

    expect(screen.getByTestId('shot-card-shot_01')).toBeInTheDocument();
  });

  it('filters shots by status and searches by keyword', async () => {
    vi.mocked(shotsApi.getShots).mockResolvedValueOnce({
      items: mockShots,
      total: 3,
    });

    const user = userEvent.setup();
    render(<ShotBoard projectId="prj_01" />);

    await waitFor(() => {
      expect(screen.getByTestId('shot-card-shot_01')).toBeInTheDocument();
    });

    // Filter by 'in_progress'
    const statusSelect = screen.getByLabelText(/Filter shots by status/i);
    await user.selectOptions(statusSelect, 'in_progress');

    expect(screen.queryByTestId('shot-card-shot_01')).not.toBeInTheDocument();
    expect(screen.getByTestId('shot-card-shot_02')).toBeInTheDocument();
    expect(screen.queryByTestId('shot-card-shot_03')).not.toBeInTheDocument();

    // Reset status filter and search by query
    await user.selectOptions(statusSelect, 'all');
    const searchInput = screen.getByLabelText(/Search shots by title or ID/i);
    await user.type(searchInput, 'HUD');

    expect(screen.queryByTestId('shot-card-shot_01')).not.toBeInTheDocument();
    expect(screen.queryByTestId('shot-card-shot_02')).not.toBeInTheDocument();
    expect(screen.getByTestId('shot-card-shot_03')).toBeInTheDocument();
  });

  it('opens Add Shot modal, creates shot, and refreshes the board', async () => {
    vi.mocked(shotsApi.getShots).mockResolvedValueOnce({
      items: [],
      total: 0,
    });

    const user = userEvent.setup();
    render(<ShotBoard projectId="prj_01" />);

    await waitFor(() => {
      expect(screen.getByText('No shots yet. Add a shot to start planning.')).toBeInTheDocument();
    });

    // Open add modal
    const addBtn = screen.getAllByRole('button', { name: '+ Add Shot' })[0];
    await user.click(addBtn);

    expect(screen.getByRole('heading', { name: 'Add New Shot' })).toBeInTheDocument();

    const createdShot: Shot = {
      id: 'shot_01',
      project_id: 'prj_01',
      sequence_order: 1,
      title: 'Establishing Aerial Alleyway',
      description: 'Wide crane shot',
      status: 'draft',
      created_at: '2026-10-09T10:00:00Z',
      updated_at: '2026-10-09T10:00:00Z',
    };

    vi.mocked(shotsApi.createShot).mockResolvedValueOnce(createdShot);
    vi.mocked(shotsApi.getShots).mockResolvedValueOnce({
      items: [createdShot],
      total: 1,
    });

    await user.type(screen.getByLabelText(/Shot Title/i), 'Establishing Aerial Alleyway');
    await user.type(screen.getByLabelText(/Description/i), 'Wide crane shot');
    await user.click(screen.getByRole('button', { name: 'Create Shot' }));

    await waitFor(() => {
      expect(shotsApi.createShot).toHaveBeenCalledWith('prj_01', {
        title: 'Establishing Aerial Alleyway',
        description: 'Wide crane shot',
        sequence_order: 1,
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId('shot-card-shot_01')).toBeInTheDocument();
    });
  });

  it('edits a shot, submits update, and refreshes the board', async () => {
    vi.mocked(shotsApi.getShots).mockResolvedValueOnce({
      items: mockShots,
      total: 3,
    });

    const user = userEvent.setup();
    render(<ShotBoard projectId="prj_01" />);

    await waitFor(() => {
      expect(screen.getByTestId('shot-card-shot_01')).toBeInTheDocument();
    });

    // Click edit on shot 1
    const editBtn = screen.getByRole('button', {
      name: 'Edit shot Establishing Aerial Alleyway',
    });
    await user.click(editBtn);

    expect(screen.getByRole('heading', { name: 'Edit Shot: shot_01' })).toBeInTheDocument();

    const updatedShot: Shot = {
      ...mockShots[0],
      title: 'Establishing Aerial Alleyway (Approved)',
      status: 'approved',
    };

    vi.mocked(shotsApi.updateShot).mockResolvedValueOnce(updatedShot);
    vi.mocked(shotsApi.getShots).mockResolvedValueOnce({
      items: [updatedShot, mockShots[1], mockShots[2]],
      total: 3,
    });

    const titleInput = screen.getByLabelText(/Shot Title/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'Establishing Aerial Alleyway (Approved)');
    await user.selectOptions(screen.getByLabelText(/Production Status/i), 'approved');

    await user.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => {
      expect(shotsApi.updateShot).toHaveBeenCalledWith('prj_01', 'shot_01', {
        title: 'Establishing Aerial Alleyway (Approved)',
        description: 'Wide crane shot of cyberpunk city canyon',
        status: 'approved',
        sequence_order: 1,
      });
    });

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 3, name: 'Establishing Aerial Alleyway (Approved)' })
      ).toBeInTheDocument();
    });
  });

  it('deletes a shot through confirmation modal and removes from board', async () => {
    vi.mocked(shotsApi.getShots).mockResolvedValueOnce({
      items: [mockShots[0]],
      total: 1,
    });

    const user = userEvent.setup();
    render(<ShotBoard projectId="prj_01" />);

    await waitFor(() => {
      expect(screen.getByTestId('shot-card-shot_01')).toBeInTheDocument();
    });

    const deleteBtn = screen.getByRole('button', {
      name: 'Delete shot Establishing Aerial Alleyway',
    });
    await user.click(deleteBtn);

    expect(screen.getByRole('heading', { name: 'Delete Shot shot_01?' })).toBeInTheDocument();

    vi.mocked(shotsApi.deleteShot).mockResolvedValueOnce(undefined);
    vi.mocked(shotsApi.getShots).mockResolvedValueOnce({
      items: [],
      total: 0,
    });

    const confirmDeleteBtn = screen.getByRole('button', { name: 'Delete Shot' });
    await user.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(shotsApi.deleteShot).toHaveBeenCalledWith('prj_01', 'shot_01');
    });

    await waitFor(() => {
      expect(screen.getByText('No shots yet. Add a shot to start planning.')).toBeInTheDocument();
    });
  });

  it('reorders shots when clicking Move Up and Move Down', async () => {
    vi.mocked(shotsApi.getShots).mockResolvedValueOnce({
      items: mockShots,
      total: 3,
    });

    const user = userEvent.setup();
    render(<ShotBoard projectId="prj_01" />);

    await waitFor(() => {
      expect(screen.getByTestId('shot-card-shot_02')).toBeInTheDocument();
    });

    // Move shot 2 up (swapping with shot 1)
    vi.mocked(shotsApi.updateShot).mockResolvedValue({} as Shot);
    vi.mocked(shotsApi.getShots).mockResolvedValueOnce({
      items: [
        { ...mockShots[1], sequence_order: 1 },
        { ...mockShots[0], sequence_order: 2 },
        mockShots[2],
      ],
      total: 3,
    });

    const moveUpBtn = screen.getByTestId('btn-move-up-shot_02');
    await user.click(moveUpBtn);

    await waitFor(() => {
      expect(shotsApi.updateShot).toHaveBeenCalledWith('prj_01', 'shot_02', {
        sequence_order: 1,
      });
      expect(shotsApi.updateShot).toHaveBeenCalledWith('prj_01', 'shot_01', {
        sequence_order: 2,
      });
    });
  });

  it('renders all 6 canonical demo scenario shots with correct sequence and statuses (test-scenario.md)', async () => {
    const demoShots: Shot[] = [
      {
        id: 'shot_01',
        project_id: 'proj_cyberpulse_demo',
        sequence_order: 1,
        title: 'Establishing Aerial Alleyway',
        description: 'Extreme wide crane shot looking down into a narrow canyon',
        status: 'approved',
        created_at: '2026-10-09T10:00:00Z',
        updated_at: '2026-10-09T10:00:00Z',
      },
      {
        id: 'shot_02',
        project_id: 'proj_cyberpulse_demo',
        sequence_order: 2,
        title: 'Aria Medium Portrait',
        description: 'Medium portrait of Aria pausing under doorway canopy',
        status: 'approved',
        created_at: '2026-10-09T10:01:00Z',
        updated_at: '2026-10-09T10:01:00Z',
      },
      {
        id: 'shot_03',
        project_id: 'proj_cyberpulse_demo',
        sequence_order: 3,
        title: 'Holographic Data Core HUD Overlay',
        description: 'Diegetic vector graphic user interface HUD',
        status: 'approved',
        created_at: '2026-10-09T10:02:00Z',
        updated_at: '2026-10-09T10:02:00Z',
      },
      {
        id: 'shot_04',
        project_id: 'proj_cyberpulse_demo',
        sequence_order: 4,
        title: 'Aria Rooftop Sprint',
        description: 'Dynamic tracking profile shot of Aria sprinting across an elevated duct',
        status: 'approved',
        created_at: '2026-10-09T10:03:00Z',
        updated_at: '2026-10-09T10:03:00Z',
      },
      {
        id: 'shot_05',
        project_id: 'proj_cyberpulse_demo',
        sequence_order: 5,
        title: 'Raindrop Splash Macro Cutaway',
        description: 'High-speed macro slow-motion cutaway of a heavy raindrop',
        status: 'approved',
        created_at: '2026-10-09T10:04:00Z',
        updated_at: '2026-10-09T10:04:00Z',
      },
      {
        id: 'shot_06',
        project_id: 'proj_cyberpulse_demo',
        sequence_order: 6,
        title: 'Mystery Figure in Alleyway Doorway',
        description: 'Ominous shadowed silhouette of an unidentified figure',
        status: 'draft',
        created_at: '2026-10-09T10:05:00Z',
        updated_at: '2026-10-09T10:05:00Z',
      },
    ];

    vi.mocked(shotsApi.getShots).mockResolvedValueOnce({
      items: demoShots,
      total: 6,
    });

    render(<ShotBoard projectId="proj_cyberpulse_demo" />);

    await waitFor(() => {
      expect(screen.getByTestId('shot-card-shot_01')).toBeInTheDocument();
    });

    for (const s of demoShots) {
      expect(screen.getByTestId(`shot-card-${s.id}`)).toBeInTheDocument();
      expect(screen.getByTestId(`shot-seq-${s.id}`)).toHaveTextContent(
        `#${String(s.sequence_order).padStart(2, '0')}`
      );
      expect(screen.getByText(s.title)).toBeInTheDocument();
    }

    expect(screen.getAllByText('[✓ Approved]')).toHaveLength(5);
    expect(screen.getByText('[○ Draft]')).toBeInTheDocument();
  });
});
