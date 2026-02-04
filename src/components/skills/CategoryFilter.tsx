import type { SkillCategory } from '@/types';
import { CATEGORIES } from '@/data/categories';
import { cn } from '@/utils/cn';

interface CategoryFilterProps {
  selected: SkillCategory[];
  onChange: (selected: SkillCategory[]) => void;
}

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  const isAllSelected = selected.length === 0;

  const toggleCategory = (categoryId: SkillCategory) => {
    if (selected.includes(categoryId)) {
      onChange(selected.filter((id) => id !== categoryId));
    } else {
      onChange([...selected, categoryId]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange([])}
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
          isAllSelected
            ? 'bg-slate-900 text-white'
            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
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
              'inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              isSelected
                ? `${category.bgColor} ${category.textColor}`
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
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
