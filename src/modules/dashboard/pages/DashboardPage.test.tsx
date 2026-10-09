import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { DashboardPage } from './DashboardPage';
import { projectsApi } from '../../projects/api/projects-api';

vi.mock('../../projects/api/projects-api', () => ({ projectsApi: { getProjects: vi.fn() } }));
describe('Dashboard', () => {
  beforeEach(() => vi.clearAllMocks());
  it('shows the real workspace total and links a recent project to its workspace', async () => {
    vi.mocked(projectsApi.getProjects).mockResolvedValue({ total: 100, limit: 6, offset: 0, items: [{ id: 'prj_demo', name: 'Demo film', description: null, status: 'draft', created_at: '2026-10-09T09:00:00Z', updated_at: '2026-10-09T09:00:00Z' }] });
    render(<MemoryRouter><DashboardPage /></MemoryRouter>);
    expect(await screen.findByText('100')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Demo film/ })).toHaveAttribute('href', '/projects/prj_demo');
    expect(screen.getByRole('link', { name: 'Create Project' })).toHaveAttribute('href', '/projects/new');
  });
  it('recovers from a failed request and offers project creation for an empty workspace', async () => {
    vi.mocked(projectsApi.getProjects).mockRejectedValueOnce(new Error('Connection unavailable')).mockResolvedValueOnce({ items: [], total: 0, limit: 6, offset: 0 });
    render(<MemoryRouter><DashboardPage /></MemoryRouter>);
    expect(await screen.findByText('Connection unavailable')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Retry/ }));
    expect(await screen.findByText('Your workspace starts here.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Create a project' })).toHaveAttribute('href', '/projects/new');
  });
});
