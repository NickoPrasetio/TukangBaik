import { renderHook } from '@testing-library/react';
import { useDebounce } from '@/hooks/useDebounce';

jest.useFakeTimers();

describe('useDebounce', () => {
  it('does not call callback immediately', () => {
    const cb = jest.fn();
    renderHook(() => useDebounce('hello', 300, cb));
    expect(cb).not.toHaveBeenCalled();
  });

  it('calls callback after delay has passed', () => {
    const cb = jest.fn();
    renderHook(() => useDebounce('hello', 300, cb));
    jest.advanceTimersByTime(300);
    expect(cb).toHaveBeenCalledWith('hello');
  });

  it('cancels previous timer when value changes quickly', () => {
    const cb = jest.fn();
    const { rerender } = renderHook(
      ({ value }: { value: string }) => useDebounce(value, 300, cb),
      { initialProps: { value: 'a' } },
    );
    jest.advanceTimersByTime(100);
    rerender({ value: 'ab' });
    jest.advanceTimersByTime(100);
    rerender({ value: 'abc' });
    jest.advanceTimersByTime(300);
    // Only called once with the final value
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledWith('abc');
  });

  it('cleans up timer on unmount', () => {
    const cb = jest.fn();
    const { unmount } = renderHook(() => useDebounce('hello', 300, cb));
    unmount();
    jest.advanceTimersByTime(300);
    expect(cb).not.toHaveBeenCalled();
  });
});
