import type { SkillCategory } from '@/types';
import { CATEGORIES } from '@/data/categories';
import { cn } from '@/utils/cn';

interface CategoryFilterProps {
  selected: SkillCategory[];
  onChange: (selected: SkillCategory[]) => void;
  layout?: 'horizontal' | 'vertical' | 'grid';
}

export function CategoryFilter({ selected, onChange, layout = 'horizontal' }: CategoryFilterProps) {
  const isAllSelected = selected.length === 0;
  const isVertical = layout === 'vertical';
  const isGrid = layout === 'grid';

  const toggleCategory = (categoryId: SkillCategory) => {
    if (selected.includes(categoryId)) {
      onChange(selected.filter((id) => id !== categoryId));
    } else {
      onChange([...selected, categoryId]);
    }
  };

  return (
    <div
      className={cn(
        isGrid
          ? 'grid grid-cols-2 sm:grid-cols-3 gap-1.5'
          : isVertical
            ? 'flex flex-col gap-1'
            : 'flex flex-wrap gap-2'
      )}
      role="group"
      aria-label="Filter by category"
    >
      <button
        onClick={() => onChange([])}
        aria-pressed={isAllSelected}
        className={cn(
          'inline-flex items-center gap-1.5 font-medium transition-colors text-sm',
          isGrid
            ? 'col-span-2 sm:col-span-3 justify-center rounded-lg p-2'
            : isVertical
              ? 'w-full justify-start rounded-lg p-2'
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
            aria-pressed={isSelected}
            className={cn(
              'inline-flex items-center gap-1.5 font-medium transition-colors text-sm',
              isGrid
                ? 'justify-start rounded-lg p-2'
                : isVertical
                  ? 'w-full justify-start rounded-lg p-2'
                  : 'rounded-xl p-2',
              isSelected
                ? `${category.bgColor} ${category.textColor}`
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            <span aria-hidden="true">{category.emoji}</span>
            <span>{category.label}</span>
          </button>
        );
      })}
    </div>
  );
}
