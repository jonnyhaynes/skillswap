import { useState, useCallback } from 'react'
import { cn } from '@/utils/cn'
import { getRatingColor } from '@/utils/ratingColors'

interface StarRatingProps {
  value: number
  onChange: (v: number) => void
  size?: 'sm' | 'md' | 'lg'
}

const sizeStyles: Record<NonNullable<StarRatingProps['size']>, string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
}

const STAR_PATH =
  'M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z'

export function StarRating({ value, onChange, size = 'md' }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0)

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, starIndex: number) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault()
        const next = Math.min(starIndex + 1, 5)
        onChange(next)
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault()
        const prev = Math.max(starIndex - 1, 1)
        onChange(prev)
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onChange(starIndex)
      }
    },
    [onChange]
  )

  const activeValue = hoverValue || value
  const activeColor = activeValue > 0 ? getRatingColor(activeValue) : undefined

  return (
    <div
      className="inline-flex items-center gap-0.5"
      role="radiogroup"
      aria-label="Rating"
      onMouseLeave={() => setHoverValue(0)}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const starValue = i + 1
        const isActive = starValue <= activeValue

        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={value === starValue}
            aria-label={`${starValue} star${starValue !== 1 ? 's' : ''}`}
            tabIndex={value === starValue || (value === 0 && starValue === 1) ? 0 : -1}
            className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-sm"
            onClick={() => onChange(starValue)}
            onMouseEnter={() => setHoverValue(starValue)}
            onKeyDown={(e) => handleKeyDown(e, starValue)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill={isActive ? activeColor : 'currentColor'}
              className={cn(
                sizeStyles[size],
                'transition-colors',
                !isActive && 'text-slate-200'
              )}
              aria-hidden="true"
            >
              <path fillRule="evenodd" d={STAR_PATH} clipRule="evenodd" />
            </svg>
          </button>
        )
      })}
    </div>
  )
}
