import { Link } from 'react-router';
import type { SkillListing, User } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { SkillBadge } from './SkillBadge';
import { formatRelativeTime } from '@/utils/formatRelativeTime';

interface SkillCardProps {
  listing: SkillListing;
  user: User;
}

export function SkillCard({ listing, user }: SkillCardProps) {
  return (
    <Link to={`/skills/${listing.id}`} className="block">
      <Card hover className="p-5 h-full flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <SkillBadge category={listing.category} />
          <Badge variant={listing.listingType === 'offered' ? 'success' : 'warning'}>
            {listing.listingType === 'offered' ? 'Offering' : 'Seeking'}
          </Badge>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 mb-2">{listing.title}</h3>

        <p className="text-sm text-slate-600 line-clamp-2 mb-4 flex-1">
          {listing.description}
        </p>

        <div className="flex items-center gap-2 text-sm text-slate-500 pt-3 border-t border-slate-100">
          <Avatar
            src={user.avatarUrl}
            name={`${user.firstName} ${user.lastName}`}
            size="sm"
          />
          <span className="font-medium text-slate-700">
            {user.firstName} {user.lastName.charAt(0)}.
          </span>
          <span className="text-slate-300">|</span>
          <span>{user.neighbourhood}</span>
          <span className="ml-auto text-xs">{formatRelativeTime(listing.createdAt)}</span>
        </div>
      </Card>
    </Link>
  );
}
