import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center py-16 text-center relative">
      {/* Decorative background ring */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-slate-50 opacity-60" aria-hidden="true" />

      {icon && (
        <div className="relative w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-bold text-slate-900 font-display mt-4">{title}</h3>
      <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">{description}</p>
      {action && (
        <div className="mt-6">
          <Button variant="primary" onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}
