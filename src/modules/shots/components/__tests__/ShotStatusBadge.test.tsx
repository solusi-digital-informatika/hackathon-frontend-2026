import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ShotStatusBadge } from '../ShotStatusBadge';

describe('ShotStatusBadge', () => {
  it('renders Draft status with dual-coded circle icon, text label, and accessibility attributes', () => {
    render(<ShotStatusBadge status="draft" shotId="shot_01" />);

    const badge = screen.getByRole('status', { name: /Status: Draft/i });
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('[○ Draft]');
    expect(badge).toHaveAttribute('data-testid', 'shot-status-badge-shot_01');
    expect(badge).toHaveClass('shot-status-badge-draft');
  });

  it('renders In Progress status with dual-coded hourglass icon and text label', () => {
    render(<ShotStatusBadge status="in_progress" shotId="shot_02" />);

    const badge = screen.getByRole('status', { name: /Status: In Progress/i });
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('[⏳ In Progress]');
    expect(badge).toHaveAttribute('data-testid', 'shot-status-badge-shot_02');
    expect(badge).toHaveClass('shot-status-badge-in_progress');
  });

  it('renders In Review status with dual-coded eye icon and text label', () => {
    render(<ShotStatusBadge status="in_review" shotId="shot_03" />);

    const badge = screen.getByRole('status', { name: /Status: In Review/i });
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('[👁️ In Review]');
    expect(badge).toHaveAttribute('data-testid', 'shot-status-badge-shot_03');
    expect(badge).toHaveClass('shot-status-badge-in_review');
  });

  it('renders Approved status with dual-coded check icon and text label', () => {
    render(<ShotStatusBadge status="approved" shotId="shot_04" />);

    const badge = screen.getByRole('status', { name: /Status: Approved/i });
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('[✓ Approved]');
    expect(badge).toHaveAttribute('data-testid', 'shot-status-badge-shot_04');
    expect(badge).toHaveClass('shot-status-badge-approved');
  });
});
