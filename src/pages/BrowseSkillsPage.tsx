import { useState, useMemo } from 'react';
import type { SkillCategory, ListingType } from '@/types';
import { useSkills } from '@/hooks/useSkills';
import { useAuth } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/useDebounce';
import { filterSkills } from '@/utils/filterSkills';
import { sortSkills, type SortOption } from '@/utils/sortSkills';
import { SearchBar } from '@/components/skills/SearchBar';
import { CategoryFilter } from '@/components/skills/CategoryFilter';
import { SkillGrid } from '@/components/skills/SkillGrid';

export function BrowseSkillsPage() {
  const { listings } = useSkills();
  const { allUsers } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<SkillCategory[]>([]);
  const [listingType, setListingType] = useState<ListingType | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const debouncedQuery = useDebounce(searchQuery, 300);

  const filteredAndSorted = useMemo(() => {
    const filtered = filterSkills(listings, {
      query: debouncedQuery,
      categories: selectedCategories,
      listingType,
    });
    return sortSkills(filtered, sortBy);
  }, [listings, debouncedQuery, selectedCategories, listingType, sortBy]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Browse Skills</h1>
        <p className="text-slate-600 mt-1">Find skills in your neighbourhood</p>
      </div>

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search by skill, topic, or keyword..."
      />

      <CategoryFilter
        selected={selectedCategories}
        onChange={setSelectedCategories}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor="listing-type" className="text-sm font-medium text-slate-700">
            Type:
          </label>
          <select
            id="listing-type"
            value={listingType}
            onChange={(e) => setListingType(e.target.value as ListingType | 'all')}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
          >
            <option value="all">All</option>
            <option value="offered">Offered</option>
            <option value="wanted">Wanted</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="sort-by" className="text-sm font-medium text-slate-700">
            Sort:
          </label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="title-asc">A-Z</option>
            <option value="title-desc">Z-A</option>
          </select>
        </div>

        <span className="text-sm text-slate-500 sm:ml-auto">
          {filteredAndSorted.length} {filteredAndSorted.length === 1 ? 'result' : 'results'}
        </span>
      </div>

      <SkillGrid listings={filteredAndSorted} users={allUsers} />
    </div>
  );
}
