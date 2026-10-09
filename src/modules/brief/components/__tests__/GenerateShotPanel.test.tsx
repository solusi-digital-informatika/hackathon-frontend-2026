import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { GenerateShotPanel } from '../GenerateShotPanel';
import { briefApi } from '../../api/brief-api';
import type { ProjectBrief } from '../../types/brief.types';
vi.mock('../../api/brief-api', () => ({ briefApi: { generateShots: vi.fn() } }));
const brief = { id: 'brief_1', creative_sections: {}, generated_shot_ids: [] } as unknown as ProjectBrief;
describe('Explicit storyboard generation', () => {
  it('waits for a click and requests seven text shots by default', async () => {
    vi.mocked(briefApi.generateShots).mockResolvedValue({ ...brief, generated_shot_ids: ['shot_1'] });
    const onGenerated = vi.fn();
    render(<GenerateShotPanel projectId="prj_1" brief={brief} onGenerated={onGenerated} />);
    expect(briefApi.generateShots).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Generate Shot' }));
    expect(briefApi.generateShots).toHaveBeenCalledWith('prj_1', 'brief_1', 7);
    expect(onGenerated).toHaveBeenCalled();
  });
  it('does not offer another generation once this brief has shots', () => {
    render(<GenerateShotPanel projectId="prj_1" brief={{ ...brief, generated_shot_ids: ['shot_1'] }} onGenerated={vi.fn()} />);
    expect(screen.queryByRole('button', { name: 'Generate Shot' })).not.toBeInTheDocument();
    expect(screen.getByText(/No images have been generated/)).toBeInTheDocument();
  });
});
