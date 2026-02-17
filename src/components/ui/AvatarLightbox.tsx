import { useEffect, useRef, useCallback } from 'react';

interface AvatarLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  src: string | null;
  name: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

export function AvatarLightbox({ isOpen, onClose, src, name }: AvatarLightboxProps) {
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
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, stableOnClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      aria-label={`${name}'s avatar`}
    >
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={stableOnClose}
        aria-hidden="true"
      />
      <div className="relative z-10 animate-scale-in">
        <button
          onClick={stableOnClose}
          className="absolute -top-3 -right-3 z-20 w-8 h-8 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
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
        <div className="rounded-full p-1 bg-primary-500 shadow-2xl">
          <div className="rounded-full p-1 bg-white">
            {src ? (
              <img
                src={src}
                alt={name}
                className="w-64 h-64 rounded-full object-cover"
              />
            ) : (
              <div
                className="w-64 h-64 rounded-full bg-primary-100 text-primary-700 font-medium flex items-center justify-center text-6xl"
                aria-label={name}
              >
                {getInitials(name)}
              </div>
            )}
          </div>
        </div>
        <p className="text-center mt-4 text-white font-semibold text-lg drop-shadow-md">{name}</p>
      </div>
    </div>
  );
}
