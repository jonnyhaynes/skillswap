import type { Review } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { EmptyState } from '@/components/ui/EmptyState'
import { ReviewCard } from './ReviewCard'

interface ReviewListProps {
  reviews: Review[]
}

export function ReviewList({ reviews }: ReviewListProps) {
  const { getUserById } = useAuth()

  if (reviews.length === 0) {
    return (
      <EmptyState
        title="No reviews yet"
        description="This user hasn't received any reviews yet."
      />
    )
  }

  return (
    <div className="divide-y divide-slate-100">
      {reviews.map((review) => {
        const reviewer = getUserById(review.reviewerId)
        if (!reviewer) return null
        return (
          <div key={review.id} className="py-5 first:pt-0 last:pb-0">
            <ReviewCard review={review} reviewer={reviewer} />
          </div>
        )
      })}
    </div>
  )
}
