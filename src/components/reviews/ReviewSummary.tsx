import type { Review } from '@/types'
import { StarDisplay } from './StarDisplay'
import { getRatingColor } from '@/utils/ratingColors'

interface ReviewSummaryProps {
  reviews: Review[]
}

export function ReviewSummary({ reviews }: ReviewSummaryProps) {
  const totalReviews = reviews.length

  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0

  // Count reviews per star level
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }))

  return (
    <div className="flex flex-col sm:flex-row gap-6">
      {/* Average rating */}
      <div className="flex flex-col items-center justify-center gap-1 sm:min-w-[100px]">
        <span className="text-4xl font-extrabold text-slate-900 font-display">
          {totalReviews > 0 ? averageRating.toFixed(1) : '0.0'}
        </span>
        <StarDisplay rating={averageRating} size="md" />
        <span className="text-sm text-slate-500">
          {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
        </span>
      </div>

      {/* Distribution bars */}
      <div className="flex-1 space-y-2">
        {distribution.map(({ star, count }) => {
          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
          const barColor = getRatingColor(star)
          return (
            <div key={star} className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-500 w-6 text-right">{star}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill={barColor}
                className="w-4 h-4 shrink-0"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%`, backgroundColor: barColor }}
                />
              </div>
              <span className="text-sm text-slate-500 w-6 text-right">{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
