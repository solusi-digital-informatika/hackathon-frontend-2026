import { expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ShotImageUserManual } from '../ShotImageUserManual';
import { shotsApi } from '../../api/shots-api';

vi.mock('../../api/shots-api', () => ({ shotsApi: { getImageConfig: vi.fn() } }));

it('shows missing Gemini setup and user-owned account limitations', async () => {
  vi.mocked(shotsApi.getImageConfig).mockResolvedValue({ provider: 'Gemini API', mode: 'gemini', model: 'gemini-3.1-flash-image', configured: false, missing_key: 'GEMINI_API_KEY' });
  render(<ShotImageUserManual projectId="prj_1" />);
  expect(await screen.findByText('User Manual — Setup gambar belum lengkap')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Google AI Studio' })).toHaveAttribute('href', 'https://aistudio.google.com/apikey');
  expect(screen.getByText(/Pembuatan API key, pengaktifan billing/)).toBeInTheDocument();
  expect(shotsApi.getImageConfig).toHaveBeenCalledWith('prj_1');
});
