import { type ReactNode } from 'react';

interface InfoTooltipProps {
  children: ReactNode;
  label?: string;
}

export function InfoTooltip({ children, label = 'More information' }: InfoTooltipProps) {
  return (
    <span className="relative inline-flex group/tooltip">
      <span
        tabIndex={0}
        role="button"
        aria-label={label}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-200 text-slate-500 text-[10px] font-bold cursor-help hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-1 select-none"
      >
        ?
      </span>
      <span
        role="tooltip"
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-xl bg-slate-800 px-3 py-2.5 text-xs text-white shadow-lg opacity-0 pointer-events-none group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100 transition-opacity duration-150 z-50"
      >
        {children}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" aria-hidden="true" />
      </span>
    </span>
  );
}
