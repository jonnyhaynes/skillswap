import type { SwapProposal } from '@/types';
import { formatDate } from '@/utils/formatDate';
import { cn } from '@/utils/cn';

interface SwapTimelineProps {
  swap: SwapProposal;
}

interface TimelineStep {
  label: string;
  date: string | null;
  detail?: string;
  reached: boolean;
}

export function SwapTimeline({ swap }: SwapTimelineProps) {
  const steps: TimelineStep[] = [
    {
      label: 'Proposed',
      date: swap.proposedAt,
      reached: true,
    },
  ];

  if (swap.respondedAt) {
    steps.push({
      label: 'Responded',
      date: swap.respondedAt,
      detail: swap.status === 'declined' ? 'Declined' : 'Accepted',
      reached: true,
    });
  } else if (swap.status === 'pending') {
    steps.push({
      label: 'Awaiting Response',
      date: null,
      reached: false,
    });
  }

  if (
    swap.status === 'in_progress' ||
    swap.status === 'completed'
  ) {
    steps.push({
      label: 'In Progress',
      date: null,
      reached: true,
    });
  } else if (swap.status === 'accepted') {
    steps.push({
      label: 'In Progress',
      date: null,
      reached: false,
    });
  }

  if (swap.completedAt) {
    steps.push({
      label: 'Completed',
      date: swap.completedAt,
      reached: true,
    });
  } else if (
    swap.status === 'accepted' ||
    swap.status === 'in_progress'
  ) {
    steps.push({
      label: 'Completed',
      date: null,
      reached: false,
    });
  }

  if (swap.status === 'cancelled') {
    steps.push({
      label: 'Cancelled',
      date: null,
      detail: 'Swap was cancelled',
      reached: true,
    });
  }

  return (
    <div className="space-y-0">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;

        return (
          <div key={step.label} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-3 h-3 rounded-full shrink-0',
                  step.reached
                    ? 'bg-gradient-to-br from-[#2DD4BF] to-[#3B82F6] border-0'
                    : 'bg-white border-2 border-slate-200'
                )}
              />
              {!isLast && (
                <div
                  className={cn(
                    'w-0.5 flex-1 min-h-6',
                    step.reached ? 'bg-gradient-to-b from-[#2DD4BF] to-[#3B82F6]' : 'bg-slate-200'
                  )}
                />
              )}
            </div>

            <div className={cn('pb-4', isLast && 'pb-0')}>
              <p
                className={cn(
                  'text-sm font-medium -mt-0.5',
                  step.reached ? 'text-slate-900' : 'text-slate-400'
                )}
              >
                {step.label}
              </p>
              {step.detail && (
                <p className="text-xs text-slate-500 mt-0.5">{step.detail}</p>
              )}
              {step.date && (
                <p className="text-xs text-slate-400 mt-0.5">
                  {formatDate(step.date)}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
