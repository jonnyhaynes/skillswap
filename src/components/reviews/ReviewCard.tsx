import type { Review, User } from '@/types'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { StarDisplay } from './StarDisplay'
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
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <Avatar src={reviewer.avatarUrl} name={fullName} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-slate-900">{fullName}</p>
            <span className="text-xs text-slate-400 shrink-0">
              {formatRelativeTime(review.createdAt)}
            </span>
          </div>
          <div className="mt-1">
            <StarDisplay rating={review.rating} size="sm" />
          </div>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">{review.comment}</p>
          <div className="mt-3">
            <Badge className={`${categoryInfo.bgColor} ${categoryInfo.textColor}`}>
              {categoryInfo.emoji} {categoryInfo.label}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  )
}
