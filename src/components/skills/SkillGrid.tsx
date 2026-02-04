import type { SkillListing, User } from '@/types';
import { SkillCard } from './SkillCard';
import { EmptyState } from '@/components/ui/EmptyState';

interface SkillGridProps {
  listings: SkillListing[];
  users: User[];
}

export function SkillGrid({ listings, users }: SkillGridProps) {
  if (listings.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        }
        title="No skills found"
        description="Try adjusting your search or filters"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {listings.map((listing) => {
        const user = users.find((u) => u.id === listing.userId);
        if (!user) return null;
        return <SkillCard key={listing.id} listing={listing} user={user} />;
      })}
    </div>
  );
}
