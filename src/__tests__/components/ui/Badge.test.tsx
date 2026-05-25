import React from 'react';
import { render, screen } from '@testing-library/react';
import Badge, { getVariantByIndex } from '@/components/ui/Badge';

describe('Badge', () => {
  it('renders label text', () => {
    render(<Badge label="Plumbing" />);
    expect(screen.getByText('Plumbing')).toBeInTheDocument();
  });

  it('applies blue variant by default', () => {
    const { container } = render(<Badge label="Test" />);
    expect(container.firstChild).toHaveClass('bg-blue-100', 'text-blue-700');
  });

  it('applies correct color for each variant', () => {
    const cases: Array<[string, string, string]> = [
      ['pink',   'bg-pink-100',   'text-pink-700'],
      ['green',  'bg-green-100',  'text-green-700'],
      ['amber',  'bg-amber-100',  'text-amber-700'],
      ['purple', 'bg-purple-100', 'text-purple-700'],
    ];
    cases.forEach(([variant, bg, text]) => {
      const { container } = render(<Badge label="X" variant={variant as 'pink'} />);
      expect(container.firstChild).toHaveClass(bg, text);
    });
  });

  it('uses sm size by default (text-xs)', () => {
    const { container } = render(<Badge label="X" />);
    expect(container.firstChild).toHaveClass('text-xs');
  });

  it('uses md size when specified (text-sm)', () => {
    const { container } = render(<Badge label="X" size="md" />);
    expect(container.firstChild).toHaveClass('text-sm');
  });
});

describe('getVariantByIndex', () => {
  it('cycles through variants', () => {
    expect(getVariantByIndex(0)).toBe('blue');
    expect(getVariantByIndex(1)).toBe('pink');
    expect(getVariantByIndex(4)).toBe('purple');
    // Wraps around
    expect(getVariantByIndex(5)).toBe('blue');
    expect(getVariantByIndex(7)).toBe('green');
  });
});
