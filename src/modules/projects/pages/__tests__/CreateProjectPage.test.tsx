import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { CreateProjectPage } from '../CreateProjectPage';
import { projectsApi } from '../../api/projects-api';
import { ApiClientError } from '../../../../core/network/api-client';

vi.mock('../../api/projects-api', () => ({
  projectsApi: {
    createProject: vi.fn(),
  },
}));

describe('CreateProjectPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders default empty form with required fields and without status dropdown', () => {
    render(
      <MemoryRouter>
        <CreateProjectPage />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/Project Name/i)).toHaveValue('');
    expect(screen.getByLabelText(/Description/i)).toHaveValue('');
    expect(screen.queryByLabelText(/Status/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create & Open Project/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
  });

  it('rejects empty or whitespace-only name via client-side validation', async () => {
    render(
      <MemoryRouter>
        <CreateProjectPage />
      </MemoryRouter>
    );

    const user = userEvent.setup();
    const nameInput = screen.getByLabelText(/Project Name/i);
    const submitBtn = screen.getByRole('button', { name: /Create & Open Project/i });

    // Try submitting empty
    await user.click(submitBtn);
    expect(
      screen.getByText(/Project Name is required and cannot be empty or whitespace only/i)
    ).toBeInTheDocument();
    expect(projectsApi.createProject).not.toHaveBeenCalled();

    // Try submitting whitespace only
    await user.type(nameInput, '   ');
    await user.click(submitBtn);
    expect(
      screen.getByText(/Project Name is required and cannot be empty or whitespace only/i)
    ).toBeInTheDocument();
    expect(projectsApi.createProject).not.toHaveBeenCalled();
  });

  it('rejects project name longer than 100 characters', async () => {
    render(
      <MemoryRouter>
        <CreateProjectPage />
      </MemoryRouter>
    );

    const user = userEvent.setup();
    const nameInput = screen.getByLabelText(/Project Name/i);
    const submitBtn = screen.getByRole('button', { name: /Create & Open Project/i });

    fireEvent.change(nameInput, { target: { value: 'a'.repeat(101) } });
    await user.click(submitBtn);

    expect(
      screen.getByText(/Project Name must be 100 characters or fewer/i)
    ).toBeInTheDocument();
    expect(projectsApi.createProject).not.toHaveBeenCalled();
  });

  it('rejects description longer than 500 characters', async () => {
    render(
      <MemoryRouter>
        <CreateProjectPage />
      </MemoryRouter>
    );

    const user = userEvent.setup();
    const nameInput = screen.getByLabelText(/Project Name/i);
    const descInput = screen.getByLabelText(/Description/i);
    const submitBtn = screen.getByRole('button', { name: /Create & Open Project/i });

    fireEvent.change(nameInput, { target: { value: 'Valid Name' } });
    fireEvent.change(descInput, { target: { value: 'b'.repeat(501) } });
    await user.click(submitBtn);

    expect(
      screen.getByText(/Description must be 500 characters or fewer/i)
    ).toBeInTheDocument();
    expect(projectsApi.createProject).not.toHaveBeenCalled();
  });

  it('handles loading state during project creation', async () => {
    vi.mocked(projectsApi.createProject).mockReturnValue(new Promise(() => {}));

    render(
      <MemoryRouter>
        <CreateProjectPage />
      </MemoryRouter>
    );

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/Project Name/i), 'New Film');
    await user.click(screen.getByRole('button', { name: /Create & Open Project/i }));

    expect(screen.getByRole('status', { name: /Creating project.../i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Project Name/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /Create & Open Project/i })).toBeDisabled();
  });

  it('displays inline field validation errors returned from server (400)', async () => {
    const error = new ApiClientError({
      status: 400,
      code: 'validation_error',
      message: 'Project input is invalid',
      fields: [{ field: 'name', message: 'Name already taken or invalid' }],
    });
    vi.mocked(projectsApi.createProject).mockRejectedValueOnce(error);

    render(
      <MemoryRouter>
        <CreateProjectPage />
      </MemoryRouter>
    );

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/Project Name/i), 'Duplicate Name');
    await user.click(screen.getByRole('button', { name: /Create & Open Project/i }));

    await waitFor(() => {
      expect(screen.getByText('Name already taken or invalid')).toBeInTheDocument();
    });
  });

  it('displays fallback error banner on 500 or network error', async () => {
    const error = new ApiClientError({
      status: 500,
      code: 'server_error',
      message: 'An unexpected server error occurred.',
    });
    vi.mocked(projectsApi.createProject).mockRejectedValueOnce(error);

    render(
      <MemoryRouter>
        <CreateProjectPage />
      </MemoryRouter>
    );

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/Project Name/i), 'Valid Project');
    await user.click(screen.getByRole('button', { name: /Create & Open Project/i }));

    await waitFor(() => {
      expect(screen.getByText('An unexpected server error occurred.')).toBeInTheDocument();
    });
  });

  it('successfully creates project and navigates to /projects/:id (AC1)', async () => {
    vi.mocked(projectsApi.createProject).mockResolvedValueOnce({
      id: 'prj_01',
      name: 'Demo film',
      description: 'Six-shot direction-change demo',
      status: 'draft',
      created_at: '2026-10-09T09:00:00Z',
      updated_at: '2026-10-09T09:00:00Z',
    });

    render(
      <MemoryRouter initialEntries={['/projects/new']}>
        <Routes>
          <Route path="/projects/new" element={<CreateProjectPage />} />
          <Route path="/projects/:id" element={<div>Project Workspace prj_01</div>} />
        </Routes>
      </MemoryRouter>
    );

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/Project Name/i), 'Demo film');
    await user.type(screen.getByLabelText(/Description/i), 'Six-shot direction-change demo');
    await user.click(screen.getByRole('button', { name: /Create & Open Project/i }));

    await waitFor(() => {
      expect(screen.getByText('Project Workspace prj_01')).toBeInTheDocument();
    });

    expect(projectsApi.createProject).toHaveBeenCalledWith({
      name: 'Demo film',
      description: 'Six-shot direction-change demo',
    });
  });

  it('navigates back to /projects when Cancel is clicked', async () => {
    render(
      <MemoryRouter initialEntries={['/projects/new']}>
        <Routes>
          <Route path="/projects/new" element={<CreateProjectPage />} />
          <Route path="/projects" element={<div>Projects List Page Mock</div>} />
        </Routes>
      </MemoryRouter>
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Cancel/i }));

    expect(screen.getByText('Projects List Page Mock')).toBeInTheDocument();
  });
});
