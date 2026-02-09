import { cn } from '@/utils/cn';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-slate-50 text-slate-600 ring-1 ring-slate-200/60',
  success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60',
  warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/60',
  error: 'bg-red-50 text-red-700 ring-1 ring-red-200/60',
  info: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200/60',
};

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
