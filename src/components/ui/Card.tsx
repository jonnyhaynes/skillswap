import { cn } from '@/utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function Card({ children, className, onClick, hover = false }: CardProps) {
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      className={cn(
        'bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] ring-1 ring-black/[0.03] text-left w-full',
        hover && 'hover:shadow-[0_8px_30px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300 ease-out cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      {...(onClick ? { type: 'button' as const } : {})}
    >
      {children}
    </Component>
  );
}
