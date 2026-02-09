import React from 'react';
import { cn } from '@/utils/cn';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, rows = 4, ...props }, ref) => {
    const textareaId = id || label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        <label
          htmlFor={textareaId}
          className="block text-sm font-semibold text-slate-700 mb-1.5"
        >
          {label}
        </label>
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={cn(
            'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm transition-all duration-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none hover:border-slate-300 placeholder:text-slate-400',
            error && 'border-red-500',
            className
          )}
          {...props}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
