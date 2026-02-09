import React from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className="w-full">
        <label
          htmlFor={inputId}
          className="block text-sm font-semibold text-slate-700 mb-1.5"
        >
          {label}
          {props.required && <span className="text-red-600 ml-0.5" aria-hidden="true">*</span>}
        </label>
        <input
          ref={ref}
          id={inputId}
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

Input.displayName = 'Input';
