import type { SkillCategory } from '@/types';
import { getCategoryInfo } from '@/data/categories';
import { cn } from '@/utils/cn';

interface SkillBadgeProps {
  category: SkillCategory;
  size?: 'sm' | 'md';
}

export function SkillBadge({ category, size = 'sm' }: SkillBadgeProps) {
  const info = getCategoryInfo(category);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        info.bgColor,
        info.textColor,
        size === 'sm' && 'px-2.5 py-0.5 text-xs',
        size === 'md' && 'px-3 py-1 text-sm'
      )}
    >
      <span>{info.emoji}</span>
      <span>{info.label}</span>
    </span>
  );
}
