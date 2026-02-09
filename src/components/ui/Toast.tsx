import { useEffect } from 'react';
import { cn } from '@/utils/cn';

export interface ToastData {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastProps extends ToastData {
  onDismiss: (id: string) => void;
}

const typeStyles: Record<ToastData['type'], string> = {
  success: 'bg-emerald-50 border border-emerald-200/60 text-emerald-800 shadow-lg shadow-emerald-500/10',
  error: 'bg-red-50 border border-red-200/60 text-red-800 shadow-lg shadow-red-500/10',
  info: 'bg-blue-50 border border-blue-200/60 text-blue-800 shadow-lg shadow-blue-500/10',
};

const iconPaths: Record<ToastData['type'], string> = {
  success:
    'M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z',
  error:
    'M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z',
  info: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z',
};

export function Toast({ id, message, type, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, 3000);

    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  return (
    <div
      className={cn(
        'rounded-xl px-4 py-3.5 flex items-center gap-3 animate-slide-up',
        typeStyles[type]
      )}
      role="alert"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5 shrink-0"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path fillRule="evenodd" d={iconPaths[type]} clipRule="evenodd" />
      </svg>
      <p className="text-sm font-medium flex-1">{message}</p>
      <button
        onClick={() => onDismiss(id)}
        className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Dismiss notification"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
}
