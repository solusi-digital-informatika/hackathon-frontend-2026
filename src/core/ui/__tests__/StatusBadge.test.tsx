import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../Badge/StatusBadge';

describe('StatusBadge', () => {
  it('renders Draft status with dual-coded icon and Title-case label', () => {
    render(<StatusBadge status="draft" />);
    const badge = screen.getByRole('status', { name: /Status: Draft/i });
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('[● Draft]');
  });

  it('renders Active status with dual-coded icon and Title-case label', () => {
    render(<StatusBadge status="active" />);
    const badge = screen.getByRole('status', { name: /Status: Active/i });
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('[● Active]');
  });

  it('renders Archived status with dual-coded icon and Title-case label', () => {
    render(<StatusBadge status="archived" />);
    const badge = screen.getByRole('status', { name: /Status: Archived/i });
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('[● Archived]');
  });
});
