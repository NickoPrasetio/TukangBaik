import { clsx } from 'clsx';

interface BadgeProps {
  label: string;
  variant?: 'blue' | 'pink' | 'green' | 'amber' | 'purple';
  size?: 'sm' | 'md';
}

const colors = {
  blue: 'bg-blue-100 text-blue-700',
  pink: 'bg-pink-100 text-pink-700',
  green: 'bg-green-100 text-green-700',
  amber: 'bg-amber-100 text-amber-700',
  purple: 'bg-purple-100 text-purple-700',
};

const VARIANT_CYCLE: Array<BadgeProps['variant']> = ['blue', 'pink', 'green', 'amber', 'purple'];

export function getVariantByIndex(index: number): BadgeProps['variant'] {
  return VARIANT_CYCLE[index % VARIANT_CYCLE.length];
}

export default function Badge({ label, variant = 'blue', size = 'sm' }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-block rounded-full font-medium',
        colors[variant],
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      )}
    >
      {label}
    </span>
  );
}
