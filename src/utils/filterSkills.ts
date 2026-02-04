import type { SkillListing, SkillCategory, ListingType } from '@/types'

interface FilterOptions {
  query?: string;
  categories?: SkillCategory[];
  listingType?: ListingType | 'all';
  excludeUserId?: string;
}

export function filterSkills(
  listings: SkillListing[],
  options: FilterOptions
): SkillListing[] {
  let result = [...listings]

  if (options.excludeUserId) {
    result = result.filter((l) => l.userId !== options.excludeUserId)
  }

  if (options.listingType && options.listingType !== 'all') {
    result = result.filter((l) => l.listingType === options.listingType)
  }

  if (options.categories && options.categories.length > 0) {
    result = result.filter((l) => options.categories!.includes(l.category))
  }

  if (options.query && options.query.trim()) {
    const q = options.query.toLowerCase().trim()
    result = result.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.tags.some((t) => t.toLowerCase().includes(q))
    )
  }

  return result
}
