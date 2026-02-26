import { cn } from '@/utils/cn';

interface AvatarProps {
  src: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeStyles: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
};

const textSizeStyles: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-lg',
  xl: 'text-2xl',
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

/** Only allow https:// URLs to prevent javascript: and data: URI injection. */
function getSafeAvatarUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (!url.startsWith('https://')) return undefined;
  return url;
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const safeSrc = getSafeAvatarUrl(src);
  if (safeSrc) {
    return (
      <img
        src={safeSrc}
        alt={name}
        className={cn(
          'rounded-full object-cover',
          sizeStyles[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full bg-primary-100 text-primary-700 font-medium flex items-center justify-center',
        sizeStyles[size],
        textSizeStyles[size],
        className
      )}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  );
}
