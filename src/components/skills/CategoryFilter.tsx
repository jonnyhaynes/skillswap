import type { SkillCategory } from '@/types';
import { CATEGORIES } from '@/data/categories';
import { cn } from '@/utils/cn';

interface CategoryFilterProps {
  selected: SkillCategory[];
  onChange: (selected: SkillCategory[]) => void;
  layout?: 'horizontal' | 'vertical';
}

export function CategoryFilter({ selected, onChange, layout = 'horizontal' }: CategoryFilterProps) {
  const isAllSelected = selected.length === 0;
  const isVertical = layout === 'vertical';

  const toggleCategory = (categoryId: SkillCategory) => {
    if (selected.includes(categoryId)) {
      onChange(selected.filter((id) => id !== categoryId));
    } else {
      onChange([...selected, categoryId]);
    }
  };

  return (
    <div className={cn(
      isVertical ? 'flex flex-col gap-1' : 'flex flex-wrap gap-2'
    )}>
      <button
        onClick={() => onChange([])}
        className={cn(
          'inline-flex items-center gap-1.5 font-medium transition-colors text-sm',
          isVertical
            ? 'w-full justify-start rounded-lg px-3 py-2'
            : 'rounded-xl px-4 py-2',
          isAllSelected
            ? 'bg-slate-900 text-white'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        )}
      >
        All
      </button>
      {CATEGORIES.map((category) => {
        const isSelected = selected.includes(category.id);
        return (
          <button
            key={category.id}
            onClick={() => toggleCategory(category.id)}
            className={cn(
              'inline-flex items-center gap-1.5 font-medium transition-colors text-sm',
              isVertical
                ? 'w-full justify-start rounded-lg px-3 py-2'
                : 'rounded-xl px-4 py-2',
              isSelected
                ? `${category.bgColor} ${category.textColor}`
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            <span>{category.emoji}</span>
            <span>{category.label}</span>
          </button>
        );
      })}
    </div>
  );
}
