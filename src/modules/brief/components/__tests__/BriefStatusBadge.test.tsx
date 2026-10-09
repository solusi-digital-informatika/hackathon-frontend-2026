import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BriefStatusBadge } from '../BriefStatusBadge';

describe('BriefStatusBadge', () => {
  it('renders pending review status with dual-coded indicator [○ Pending Review]', () => {
    render(<BriefStatusBadge status="pending_review" />);

    const badge = screen.getByRole('status', {
      name: /Extraction status: Pending Review/i,
    });
    expect(badge).toBeInTheDocument();
    expect(screen.getByText('[○ Pending Review]')).toBeInTheDocument();
    expect(badge).toHaveClass('badge-status-pending');
  });

  it('renders approved status with dual-coded indicator [● Approved]', () => {
    render(<BriefStatusBadge status="approved" />);

    const badge = screen.getByRole('status', {
      name: /Extraction status: Approved/i,
    });
    expect(badge).toBeInTheDocument();
    expect(screen.getByText('[● Approved]')).toBeInTheDocument();
    expect(badge).toHaveClass('badge-status-approved');
  });
});
