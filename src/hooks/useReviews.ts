import { useContext } from 'react'
import { ReviewsContext, type ReviewsContextType } from '@/context/ReviewsContext'

export function useReviews(): ReviewsContextType {
  const context = useContext(ReviewsContext)
  if (!context) {
    throw new Error('useReviews must be used within a ReviewsProvider')
  }
  return context
}
