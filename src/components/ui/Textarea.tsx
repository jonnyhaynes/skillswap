import React from 'react';
import { cn } from '@/utils/cn';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, rows = 4, ...props }, ref) => {
    const textareaId = id || label.toLowerCase().replace(/\s+/g, '-');
    const errorId = error ? `${textareaId}-error` : undefined;

    return (
      <div className="w-full">
        <label
          htmlFor={textareaId}
          className="block text-sm font-semibold text-slate-700 mb-1.5"
        >
          {label}
          {props.required && <span className="text-red-600 ml-0.5" aria-hidden="true">*</span>}
        </label>
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={cn(
            'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm transition-all duration-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none hover:border-slate-300 placeholder:text-slate-400',
            error && 'border-red-600',
            className
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={errorId}
          {...props}
        />
        {error && (
          <p id={errorId} className="text-red-600 text-sm mt-1" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
