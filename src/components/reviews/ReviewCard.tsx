import type { Review, User } from '@/types'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { StarDisplay } from './StarDisplay'
import { getCategoryInfo } from '@/data/categories'
import { formatRelativeTime } from '@/utils/formatRelativeTime'

interface ReviewCardProps {
  review: Review
  reviewer: User
  /** When true, wraps content in a Card container. Default false. */
  standalone?: boolean
}

export function ReviewCard({ review, reviewer, standalone = false }: ReviewCardProps) {
  const fullName = `${reviewer.firstName} ${reviewer.lastName}`
  const categoryInfo = getCategoryInfo(review.skillCategory)

  const content = (
    <div className="flex items-start gap-3">
      <div className="shrink-0 rounded-full p-0.5 bg-gradient-to-br from-[#2DD4BF] to-[#3B82F6]">
        <div className="rounded-full p-0.5 bg-white">
          <Avatar src={reviewer.avatarUrl} name={fullName} size="sm" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-bold text-slate-900">{fullName}</p>
          <span className="text-xs text-slate-400 shrink-0">
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

  if (standalone) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-5">
        {content}
      </div>
    )
  }

  return content
}
