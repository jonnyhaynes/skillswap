import { Link } from 'react-router';
import type { SkillListing, User } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { getCategoryInfo } from '@/data/categories';
import { formatRelativeTime } from '@/utils/formatRelativeTime';

interface SkillCardProps {
  listing: SkillListing;
  user: User;
}

export function SkillCard({ listing, user }: SkillCardProps) {
  const category = getCategoryInfo(listing.category);

  return (
    <Link to={`/skills/${listing.id}`} className="block group">
      <Card hover className="h-full flex flex-col overflow-hidden group-hover:ring-primary-200/60 transition-all duration-300">
        {/* Category colour bar */}
        <div className={`h-1 ${category.barColor}`} />

        <div className="p-6 flex flex-col flex-1">
          {/* Top row: category + badge */}
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-semibold uppercase tracking-wide ${category.textColor}`}>
              {category.emoji} {category.label}
            </span>
            <Badge variant={listing.listingType === 'offered' ? 'success' : 'warning'}>
              {listing.listingType === 'offered' ? 'Offering' : 'Seeking'}
            </Badge>
          </div>

          <h3 className="text-lg font-bold text-slate-900 font-display mb-2 group-hover:text-primary-700 transition-colors leading-snug">
            {listing.title}
          </h3>

          <p className="text-sm text-slate-500 line-clamp-2 mb-5 flex-1 leading-relaxed">
            {listing.description}
          </p>

          <div className="flex items-center gap-2.5 text-sm text-slate-500 pt-4 border-t border-slate-50">
            <div className="shrink-0 rounded-full p-0.5 bg-gradient-to-br from-[#43c1a6] to-[#6366f1]">
              <div className="rounded-full p-0.5 bg-white">
                <Avatar
                  src={user.avatarUrl}
                  name={`${user.firstName} ${user.lastName}`}
                  size="sm"
                />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-medium text-slate-600">
                {user.firstName} {user.lastName.charAt(0)}.
              </span>
              <span className="text-slate-300 mx-1" aria-hidden="true">&middot;</span>
              <span className="text-slate-500">{user.neighbourhood}</span>
            </div>
            <span className="text-xs text-slate-500 shrink-0">
              <time dateTime={listing.createdAt}>{formatRelativeTime(listing.createdAt)}</time>
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
