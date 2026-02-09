import type { Review, User } from '@/types'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { StarDisplay } from './StarDisplay'
import { VerifiedBadge } from '@/components/profile/VerifiedBadge'
import { getCategoryInfo } from '@/data/categories'
import { formatRelativeTime } from '@/utils/formatRelativeTime'

interface ReviewCardProps {
  review: Review
  reviewer: User
}

export function ReviewCard({ review, reviewer }: ReviewCardProps) {
  const fullName = `${reviewer.firstName} ${reviewer.lastName}`
  const categoryInfo = getCategoryInfo(review.skillCategory)

  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0 relative">
        <div className="rounded-full p-0.5 bg-gradient-to-br from-[#43c1a6] to-[#6366f1]">
          <div className="rounded-full p-0.5 bg-white">
            <Avatar src={reviewer.avatarUrl} name={fullName} size="sm" />
          </div>
        </div>
        {reviewer.isVerifiedNeighbour && (
          <span className="absolute -bottom-0.5 -right-0.5">
            <VerifiedBadge />
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-bold text-slate-900">{fullName}</p>
          <span className="text-xs text-slate-500 shrink-0">
            {formatRelativeTime(review.createdAt)}
          </span>
        </div>
        <div className="mt-1.5">
          <StarDisplay rating={review.rating} size="sm" />
        </div>
        <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">{review.comment}</p>
        <div className="mt-3">
          <Badge className={`${categoryInfo.bgColor} ${categoryInfo.textColor}`}>
            {categoryInfo.emoji} {categoryInfo.label}
          </Badge>
        </div>
      </div>
    </div>
  )
}
