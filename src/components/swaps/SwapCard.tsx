import { Link } from 'react-router';
import type { SwapProposal } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useSkills } from '@/hooks/useSkills';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { SkillBadge } from '@/components/skills/SkillBadge';
import { SwapStatusBadge } from './SwapStatusBadge';
import { formatRelativeTime } from '@/utils/formatRelativeTime';

interface SwapCardProps {
  swap: SwapProposal;
  currentUserId: string;
}

export function SwapCard({ swap, currentUserId }: SwapCardProps) {
  const { getUserById } = useAuth();
  const { getListingById } = useSkills();

  const otherUserId = swap.proposerId === currentUserId ? swap.recipientId : swap.proposerId;
  const otherUser = getUserById(otherUserId);

  const offeredListing = getListingById(swap.offeredSkillId);
  const requestedListing = getListingById(swap.requestedSkillId);

  if (!otherUser) return null;

  return (
    <Link to={`/swaps/${swap.id}`}>
      <Card hover className="p-4">
        <div className="flex items-center gap-4">
          <Avatar
            src={otherUser.avatarUrl}
            name={`${otherUser.firstName} ${otherUser.lastName}`}
            size="md"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-slate-900 truncate">
                {otherUser.firstName} {otherUser.lastName}
              </h3>
              <SwapStatusBadge status={swap.status} />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {offeredListing && (
                <SkillBadge category={offeredListing.category} size="sm" />
              )}
              <svg
                className="w-4 h-4 text-slate-400 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
              {requestedListing && (
                <SkillBadge category={requestedListing.category} size="sm" />
              )}
            </div>
          </div>

          <span className="text-xs text-slate-400 shrink-0">
            {formatRelativeTime(swap.proposedAt)}
          </span>
        </div>
      </Card>
    </Link>
  );
}
