import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import StarRating from '@/components/ui/StarRating';

describe('StarRating', () => {
  it('renders 5 stars by default', () => {
    render(<StarRating rating={3} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(5);
  });

  it('renders correct aria-labels for each star', () => {
    render(<StarRating rating={3} />);
    expect(screen.getByLabelText('1 bintang')).toBeInTheDocument();
    expect(screen.getByLabelText('5 bintang')).toBeInTheDocument();
  });

  it('shows numeric value when showValue=true', () => {
    render(<StarRating rating={4.5} showValue />);
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });

  it('does not show value by default', () => {
    render(<StarRating rating={3} />);
    expect(screen.queryByText('3.0')).not.toBeInTheDocument();
  });

  it('calls onRate with correct value when interactive star clicked', () => {
    const onRate = jest.fn();
    render(<StarRating rating={0} interactive onRate={onRate} />);
    fireEvent.click(screen.getByLabelText('3 bintang'));
    expect(onRate).toHaveBeenCalledWith(3);
  });

  it('does not call onRate when not interactive', () => {
    const onRate = jest.fn();
    render(<StarRating rating={3} onRate={onRate} />);
    fireEvent.click(screen.getByLabelText('3 bintang'));
    expect(onRate).not.toHaveBeenCalled();
  });

  it('respects custom max stars', () => {
    render(<StarRating rating={3} max={10} />);
    expect(screen.getAllByRole('button')).toHaveLength(10);
  });
});
