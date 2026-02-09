import type { SwapStatus } from '@/types';
import { cn } from '@/utils/cn';

interface SwapStatusBadgeProps {
  status: SwapStatus;
}

const statusConfig: Record<SwapStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-600' },
  accepted: { label: 'Accepted', className: 'bg-blue-50 text-blue-600' },
  declined: { label: 'Declined', className: 'bg-red-50 text-red-600' },
  in_progress: { label: 'In Progress', className: 'bg-indigo-50 text-indigo-600' },
  completed: { label: 'Completed', className: 'bg-teal-50 text-teal-700' },
  cancelled: { label: 'Cancelled', className: 'bg-slate-50 text-slate-500' },
};

export function SwapStatusBadge({ status }: SwapStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
