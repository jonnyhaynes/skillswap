import { useState } from 'react'
import type { SkillCategory } from '@/types'
import { Button } from '@/components/ui/Button'
import { StarRating } from './StarRating'

interface ReviewFormProps {
  swapId: string
  revieweeId: string
  skillCategory: SkillCategory
  onSubmit: (data: { rating: number; comment: string }) => void | Promise<void>
  onCancel: () => void
}

export function ReviewForm({
  onSubmit,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ rating?: string; comment?: string }>({})

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const newErrors: { rating?: string; comment?: string } = {}

    if (rating === 0) {
      newErrors.rating = 'Please select a rating'
    }

    if (!comment.trim()) {
      newErrors.comment = 'Please write a comment'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({ rating, comment: comment.trim() })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Rating
        </label>
        <StarRating value={rating} onChange={setRating} size="lg" />
        {errors.rating && (
          <p className="mt-1 text-sm text-red-500">{errors.rating}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="review-comment"
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          Comment
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => {
            setComment(e.target.value)
            if (errors.comment) setErrors((prev) => ({ ...prev, comment: undefined }))
          }}
          placeholder="Share your experience..."
          rows={4}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400 transition-colors resize-none"
        />
        {errors.comment && (
          <p className="mt-1 text-sm text-red-500">{errors.comment}</p>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Review'}
        </Button>
      </div>
    </form>
  )
}
