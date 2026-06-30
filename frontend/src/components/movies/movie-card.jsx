import { Link, useNavigate } from 'react-router-dom'
import { Clock, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const ageRatingColors = {
  P: 'bg-green-600',
  C13: 'bg-yellow-600',
  C16: 'bg-orange-600',
  C18: 'bg-red-700',
}

export function MovieCard({ movie }) {
  const navigate = useNavigate()

  return (
    <div className="group relative overflow-hidden rounded-xl bg-card transition-all duration-300 hover:shadow-2xl hover:shadow-black/40 hover:-translate-y-0.5">

      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden bg-muted">
        <img
          src={movie.poster || 'https://placehold.co/300x450/1a1a2e/ffffff?text=No+Poster'}
          alt={movie.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Clickable overlay */}
        <Link
          to={`/movies/${movie.id}`}
          className="absolute inset-0 z-10"
          aria-label={`Xem chi tiết ${movie.title}`}
        />

        {/* Permanent bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 to-transparent z-10" />

        {/* Hover action gradient */}
        <div className="absolute inset-0 bg-black/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-10" />

        {/* Age Rating badge */}
        <Badge
          className={`absolute top-2 left-2 z-20 border-0 text-white text-[10px] font-bold px-1.5 ${ageRatingColors[movie.ageRating] || 'bg-zinc-700'}`}
        >
          {movie.ageRating}
        </Badge>

        {/* Coming soon badge */}
        {movie.status === 'coming_soon' && (
          <Badge className="absolute top-2 right-2 z-20 border-0 bg-primary text-white text-[10px] font-bold">
            Sắp chiếu
          </Badge>
        )}

        {/* Rating on poster bottom */}
        {movie.rating > 0 && (
          <div className="absolute bottom-2 left-3 z-20 flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-semibold text-white">{Number(movie.rating).toFixed(1)}</span>
          </div>
        )}

        {/* Hover CTA button */}
        <div className="absolute inset-x-0 bottom-0 z-20 translate-y-full p-3 transition-transform duration-300 group-hover:translate-y-0">
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-9 text-sm"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/movies/${movie.id}`)
            }}
          >
            {movie.status === 'now_showing' ? 'Đặt vé' : 'Xem chi tiết'}
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        <Link to={`/movies/${movie.id}`} className="block">
          <h3 className="text-sm font-semibold leading-snug line-clamp-2 min-h-[2.4rem] hover:text-primary transition-colors">
            {movie.title}
          </h3>
        </Link>

        <div className="flex flex-wrap gap-1">
          {(movie.genres || []).slice(0, 2).map((genre) => (
            <Badge key={genre} variant="secondary" className="text-[10px] font-normal px-1.5 py-0 h-4 bg-secondary/60">
              {genre}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-0.5">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {movie.duration} phút
          </span>
        </div>
      </div>
    </div>
  )
}
