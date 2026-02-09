import { cn } from '@/utils/cn'

interface StarDisplayProps {
  rating: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
}

const sizeStyles: Record<NonNullable<StarDisplayProps['size']>, string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
}

const STAR_PATH =
  'M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z'

export function StarDisplay({ rating, size = 'md', showValue = false }: StarDisplayProps) {
  const fullStars = Math.floor(rating)
  const fractional = rating - fullStars

  return (
    <div className="inline-flex items-center gap-0.5" role="img" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => {
        if (i < fullStars) {
          // Full star
          return (
            <svg
              key={i}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className={cn(sizeStyles[size], 'text-accent-400')}
              aria-hidden="true"
            >
              <path fillRule="evenodd" d={STAR_PATH} clipRule="evenodd" />
            </svg>
          )
        }

        if (i === fullStars && fractional > 0) {
          // Fractional star with width clipping
          return (
            <div key={i} className={cn(sizeStyles[size], 'relative')}>
              {/* Empty star background */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className={cn(sizeStyles[size], 'text-slate-200 absolute inset-0')}
                aria-hidden="true"
              >
                <path fillRule="evenodd" d={STAR_PATH} clipRule="evenodd" />
              </svg>
              {/* Filled portion clipped by width */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fractional * 100}%` }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={cn(sizeStyles[size], 'text-accent-400')}
                  aria-hidden="true"
                >
                  <path fillRule="evenodd" d={STAR_PATH} clipRule="evenodd" />
                </svg>
              </div>
            </div>
          )
        }

        // Empty star
        return (
          <svg
            key={i}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={cn(sizeStyles[size], 'text-slate-200')}
            aria-hidden="true"
          >
            <path fillRule="evenodd" d={STAR_PATH} clipRule="evenodd" />
          </svg>
        )
      })}
      {showValue && (
        <span className="ml-1 text-sm font-medium text-slate-700">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
