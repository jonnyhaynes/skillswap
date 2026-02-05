import type { SwapStatus } from '@/types';
import { cn } from '@/utils/cn';

interface SwapStatusBadgeProps {
  status: SwapStatus;
}

const statusConfig: Record<SwapStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700' },
  accepted: { label: 'Accepted', className: 'bg-blue-100 text-blue-700' },
  declined: { label: 'Declined', className: 'bg-red-100 text-red-700' },
  in_progress: { label: 'In Progress', className: 'bg-indigo-100 text-indigo-700' },
  completed: { label: 'Completed', className: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelled', className: 'bg-slate-100 text-slate-700' },
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
