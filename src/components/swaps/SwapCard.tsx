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
    <Link to={`/swaps/${swap.id}`} className="block group">
      <Card hover className="p-5 group-hover:ring-primary-200/60 transition-all duration-300">
        <div className="flex items-center gap-4">
          <div className="shrink-0 rounded-full p-0.5 bg-gradient-to-br from-[#43c1a6] to-[#6366f1]">
            <div className="rounded-full p-0.5 bg-white">
              <Avatar
                src={otherUser.avatarUrl}
                name={`${otherUser.firstName} ${otherUser.lastName}`}
                size="md"
              />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="text-sm font-bold text-slate-900 truncate">
                {otherUser.firstName} {otherUser.lastName}
              </h3>
              <SwapStatusBadge status={swap.status} />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {offeredListing && (
                <SkillBadge category={offeredListing.category} size="sm" />
              )}
              <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#43c1a6] to-[#6366f1] flex items-center justify-center shrink-0">
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
              </div>
              {requestedListing && (
                <SkillBadge category={requestedListing.category} size="sm" />
              )}
            </div>
          </div>

          <span className="text-xs text-slate-500 shrink-0">
            {formatRelativeTime(swap.proposedAt)}
          </span>
        </div>
      </Card>
    </Link>
  );
}
