import type { SkillListing } from '@/types'

export type SortOption = 'newest' | 'oldest' | 'title-asc' | 'title-desc'

export function sortSkills(
  listings: SkillListing[],
  sortBy: SortOption
): SkillListing[] {
  const sorted = [...listings]

  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    case 'title-asc':
      return sorted.sort((a, b) => a.title.localeCompare(b.title))
    case 'title-desc':
      return sorted.sort((a, b) => b.title.localeCompare(a.title))
    default:
      return sorted
  }
}
