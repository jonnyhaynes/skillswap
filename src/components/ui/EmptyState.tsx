import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center py-12 text-center">
      {icon && (
        <div className="text-slate-300" style={{ fontSize: '48px', lineHeight: 1 }}>
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-900 mt-4">{title}</h3>
      <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">{description}</p>
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
