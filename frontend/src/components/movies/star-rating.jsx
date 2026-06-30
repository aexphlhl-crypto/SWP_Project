import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = true,
  className,
}) {
  const numericRating = Number(rating ?? 0)
  const sizeClasses = {
    sm: 'size-3',
    md: 'size-4',
    lg: 'size-5',
  }

  const textClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center">
        {Array.from({ length: maxRating }).map((_, index) => {
          const filled = index < Math.floor(numericRating)
          const halfFilled = !filled && index < numericRating

          return (
            <Star
              key={index}
              className={cn(
                sizeClasses[size],
                filled
                  ? 'fill-accent text-accent'
                  : halfFilled
                    ? 'fill-accent/50 text-accent'
                    : 'fill-muted text-muted-foreground/30'
              )}
            />
          )
        })}
      </div>
      {showValue && (
        <span className={cn('font-medium text-accent', textClasses[size])}>
          {numericRating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
