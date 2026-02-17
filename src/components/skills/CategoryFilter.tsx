import { useState, useMemo } from 'react';
import type { SkillCategory } from '@/types';
import { CATEGORIES } from '@/data/categories';
import { cn } from '@/utils/cn';

interface CategoryFilterProps {
  selected: SkillCategory[];
  onChange: (selected: SkillCategory[]) => void;
  layout?: 'horizontal' | 'vertical' | 'list';
}

export function CategoryFilter({ selected, onChange, layout = 'horizontal' }: CategoryFilterProps) {
  const [search, setSearch] = useState('');
  const isAllSelected = selected.length === 0;
  const isVertical = layout === 'vertical';
  const isList = layout === 'list';

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return CATEGORIES;
    const q = search.toLowerCase();
    return CATEGORIES.filter((c) => c.label.toLowerCase().includes(q));
  }, [search]);

  const toggleCategory = (categoryId: SkillCategory) => {
    if (selected.includes(categoryId)) {
      onChange(selected.filter((id) => id !== categoryId));
    } else {
      onChange([...selected, categoryId]);
    }
  };

  if (isList) {
    return (
      <div role="group" aria-label="Filter by category">
        {/* Search input */}
        <div className="relative mb-2">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="w-full rounded-md border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-300"
          />
        </div>

        <p className="mb-2 text-xs text-slate-400">You can select multiple categories</p>

        {/* Scrollable single-column list */}
        <div className="max-h-[260px] overflow-y-auto -mx-0.5 px-0.5">
          {/* All option */}
          {!search.trim() && (
            <button
              onClick={() => onChange([])}
              aria-pressed={isAllSelected}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors',
                isAllSelected
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              )}
            >
              All Categories
            </button>
          )}

          {filteredCategories.map((category) => {
            const isSelected = selected.includes(category.id);
            return (
              <button
                key={category.id}
                onClick={() => toggleCategory(category.id)}
                aria-pressed={isSelected}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors',
                  isSelected
                    ? `${category.bgColor} ${category.textColor}`
                    : 'text-slate-600 hover:bg-slate-50'
                )}
              >
                <span aria-hidden="true" className="text-base leading-none">{category.emoji}</span>
                <span>{category.label}</span>
                {isSelected && (
                  <svg className="ml-auto h-4 w-4 shrink-0 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}

          {filteredCategories.length === 0 && (
            <p className="py-4 text-center text-sm text-slate-400">No categories match</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        isVertical
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
          isVertical
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
              isVertical
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
