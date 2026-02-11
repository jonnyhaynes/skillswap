import { useEffect, useRef, useCallback } from 'react';
import { cn } from '@/utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const stableOnClose = useCallback(() => {
    onCloseRef.current();
  }, []);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        stableOnClose();
      }
    }

    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';

      // Focus the dialog when opened
      requestAnimationFrame(() => {
        dialogRef.current?.focus();
      });
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';

      // Restore focus when modal closes
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, stableOnClose]);

  if (!isOpen) return null;

  const titleId = `modal-title-${title.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      aria-labelledby={titleId}
    >
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={stableOnClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={cn(
          'relative z-10 w-full mx-4 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-[0_24px_48px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.05] animate-scale-in focus:outline-none',
          sizeStyles[size]
        )}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h2 id={titleId} className="text-lg font-bold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto max-h-[calc(100vh-12rem)]">{children}</div>
      </div>
    </div>
  );
}
