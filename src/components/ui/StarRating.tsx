'use client';

import { Star } from 'lucide-react';
import { clsx } from 'clsx';

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRate?: (rating: number) => void;
  showValue?: boolean;
}

export default function StarRating({
  rating,
  max = 5,
  size = 'md',
  interactive = false,
  onRate,
  showValue = false,
}: StarRatingProps) {
  const sizes = { sm: 14, md: 18, lg: 24 };
  const starSize = sizes[size];

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }, (_, i) => {
        const filled = i + 1 <= Math.round(rating);
        return (
          <button
            key={i}
            type={interactive ? 'button' : undefined}
            onClick={() => interactive && onRate?.(i + 1)}
            disabled={!interactive}
            className={clsx(
              'transition-transform duration-100',
              interactive && 'cursor-pointer hover:scale-110 active:scale-95',
              !interactive && 'cursor-default'
            )}
            aria-label={`${i + 1} bintang`}
          >
            <Star
              size={starSize}
              className={clsx(
                'transition-colors',
                filled ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'
              )}
            />
          </button>
        );
      })}
      {showValue && (
        <span className="ml-1 text-sm font-semibold text-gray-700">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
