import { beforeEach, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShotRevisionPanel } from '../ShotRevisionPanel';
import { shotsApi } from '../../api/shots-api';
import type { Shot, ShotRevisionHistory } from '../../types/shot.types';

vi.mock('../../api/shots-api', () => ({ shotsApi: { getImages: vi.fn(), getRevisions: vi.fn(), generateImage: vi.fn() } }));
const shot = { id: 'shot_1', project_id: 'prj_1', title: 'Opening', status: 'approved' } as Shot;
const approved: ShotRevisionHistory = { active_revision_id: 'rev_1', items: [{ id: 'rev_1', shot_id: shot.id, version_number: 1, parent_id: null, title: 'Opening', description: 'Warm room', details: {}, change_note: 'Original', status: 'approved', created_at: '2026-10-10T00:00:00Z', reviewed_at: '2026-10-10T01:00:00Z', review_note: '', can_generate_image: true }] };

beforeEach(() => { vi.clearAllMocks(); vi.mocked(shotsApi.getImages).mockResolvedValue({ items: [] }); });

it('generates the current approved revision through the backend', async () => {
  vi.mocked(shotsApi.getRevisions).mockResolvedValue(approved);
  vi.mocked(shotsApi.generateImage).mockResolvedValue({ shot_id: shot.id, revision_id: 'rev_1', version_number: 1, job_id: 'img_1', status: 'queued', url: null, error_code: null });
  render(<ShotRevisionPanel shot={shot} onApplied={vi.fn()} />);
  await userEvent.click(await screen.findByRole('button', { name: 'Generate Image' }));
  expect(shotsApi.generateImage).toHaveBeenCalledWith('prj_1', 'shot_1', 'rev_1');
  expect(await screen.findByText(/Permintaan diterima/)).toBeInTheDocument();
});

it('does not offer generation for an unapproved version', async () => {
  vi.mocked(shotsApi.getRevisions).mockResolvedValue({ ...approved, items: [{ ...approved.items[0], status: 'baseline', can_generate_image: false, reviewed_at: null }] });
  render(<ShotRevisionPanel shot={{ ...shot, status: 'draft' }} onApplied={vi.fn()} />);
  await screen.findByRole('button', { name: 'Approve & Merge' });
  expect(screen.queryByRole('button', { name: 'Generate Image' })).not.toBeInTheDocument();
  expect(shotsApi.generateImage).not.toHaveBeenCalled();
});
