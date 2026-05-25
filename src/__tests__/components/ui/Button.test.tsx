import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '@/components/ui/Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Simpan</Button>);
    expect(screen.getByRole('button', { name: 'Simpan' })).toBeInTheDocument();
  });

  it('shows loading spinner and "Memuat..." when loading=true', () => {
    render(<Button loading>Simpan</Button>);
    expect(screen.getByText('Memuat...')).toBeInTheDocument();
    expect(screen.queryByText('Simpan')).not.toBeInTheDocument();
  });

  it('is disabled when loading=true', () => {
    render(<Button loading>OK</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled when disabled prop is passed', () => {
    render(<Button disabled>OK</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('calls onClick when clicked', () => {
    const handler = jest.fn();
    render(<Button onClick={handler}>Klik</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const handler = jest.fn();
    render(<Button disabled onClick={handler}>Klik</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handler).not.toHaveBeenCalled();
  });

  it('applies fullWidth class when fullWidth=true', () => {
    render(<Button fullWidth>Submit</Button>);
    expect(screen.getByRole('button')).toHaveClass('w-full');
  });

  it('renders with danger variant styling', () => {
    render(<Button variant="danger">Hapus</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-red-500');
  });
});
