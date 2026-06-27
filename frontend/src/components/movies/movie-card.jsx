import { Link, useNavigate } from 'react-router-dom'
import { Clock, Calendar } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StarRating } from './star-rating'

export function MovieCard({ movie }) {
  const navigate = useNavigate()
  const ageRatingColors = {
    P: 'bg-green-600',
    C13: 'bg-yellow-600',
    C16: 'bg-orange-600',
    C18: 'bg-red-600',
  }

  return (
    <Card className="group overflow-hidden border-0 bg-card/50 p-0 transition-all duration-300 hover:bg-card hover:shadow-xl hover:shadow-primary/10">
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={movie.poster || 'https://placehold.co/300x450/png'}
          alt={movie.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        <Link
          to={`/movies/${movie.id}`}
          className="absolute inset-0 z-10"
          aria-label={movie.title}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <Badge
          className={`absolute top-2 left-2 z-20 border-0 text-white ${ageRatingColors[movie.ageRating] || 'bg-gray-600'}`}
        >
          {movie.ageRating}
        </Badge>

        {movie.status === 'coming_soon' && (
          <Badge className="absolute top-2 right-2 z-20 border-0 bg-primary text-primary-foreground">
            Sắp chiếu
          </Badge>
        )}

        <div className="absolute inset-x-0 bottom-0 z-20 translate-y-full p-4 transition-transform duration-300 group-hover:translate-y-0">
          <Button
            className="w-full bg-primary hover:bg-primary/90"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/movies/${movie.id}`)
            }}
          >
            {movie.status === 'now_showing' ? 'Đặt vé' : 'Xem chi tiết'}
          </Button>
        </div>
      </div>

      <div className="space-y-2 p-4">
        <Link to={`/movies/${movie.id}`}>
          <h3 className="line-clamp-2 min-h-[2.5rem] font-semibold leading-tight transition-colors hover:text-primary">
            {movie.title}
          </h3>
        </Link>

        <div className="flex flex-wrap gap-1">
          {(movie.genres || []).slice(0, 2).map((genre) => (
            <Badge key={genre} variant="secondary" className="text-xs font-normal">
              {genre}
            </Badge>
          ))}
        </div>

        <StarRating rating={movie.rating} size="sm" />

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="size-3" />
            {movie.duration} phút
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="size-3" />
            {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}
          </span>
        </div>
      </div>
    </Card>
  )
}
