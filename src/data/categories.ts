import type { SkillCategory } from '../types';

export interface CategoryInfo {
  id: SkillCategory;
  label: string;
  emoji: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  barColor: string;
}

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'arts-crafts',
    label: 'Arts & Crafts',
    emoji: '\u{1F3A8}',
    bgColor: 'bg-pink-100',
    textColor: 'text-pink-700',
    borderColor: 'border-pink-200',
    barColor: 'bg-pink-400',
  },
  {
    id: 'business',
    label: 'Business',
    emoji: '\u{1F4BC}',
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-200',
    barColor: 'bg-slate-400',
  },
  {
    id: 'cooking',
    label: 'Cooking',
    emoji: '\u{1F373}',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
    barColor: 'bg-orange-400',
  },
  {
    id: 'diy-repairs',
    label: 'DIY & Repairs',
    emoji: '\u{1F527}',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    barColor: 'bg-amber-400',
  },
  {
    id: 'fitness',
    label: 'Fitness',
    emoji: '\u{1F4AA}',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    barColor: 'bg-red-400',
  },
  {
    id: 'gardening',
    label: 'Gardening',
    emoji: '\u{1F331}',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    barColor: 'bg-emerald-400',
  },
  {
    id: 'languages',
    label: 'Languages',
    emoji: '\u{1F30D}',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
    barColor: 'bg-green-400',
  },
  {
    id: 'music',
    label: 'Music',
    emoji: '\u{1F3B5}',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    barColor: 'bg-purple-400',
  },
  {
    id: 'photography',
    label: 'Photography',
    emoji: '\u{1F4F7}',
    bgColor: 'bg-violet-100',
    textColor: 'text-violet-700',
    borderColor: 'border-violet-200',
    barColor: 'bg-violet-400',
  },
  {
    id: 'technology',
    label: 'Technology',
    emoji: '\u{1F4BB}',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    barColor: 'bg-blue-400',
  },
  {
    id: 'tutoring',
    label: 'Tutoring',
    emoji: '\u{1F4DA}',
    bgColor: 'bg-cyan-100',
    textColor: 'text-cyan-700',
    borderColor: 'border-cyan-200',
    barColor: 'bg-cyan-400',
  },
  {
    id: 'other',
    label: 'Other',
    emoji: '\u{2728}',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-200',
    barColor: 'bg-gray-400',
  },
];

export function getCategoryInfo(id: SkillCategory): CategoryInfo {
  const category = CATEGORIES.find((c) => c.id === id);
  if (!category) {
    return CATEGORIES[CATEGORIES.length - 1];
  }
  return category;
}
