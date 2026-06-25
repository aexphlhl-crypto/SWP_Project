import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, ArrowRight, Star, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useData } from '@/contexts/data-context'
import { MovieCard } from '@/components/movies/movie-card'

export default function HomePage() {
  const { movies } = useData()
  const { isAuthenticated } = useAuth()

  const nowShowing = movies.filter(m => m.status === 'now_showing')
  const comingSoon = movies.filter(m => m.status === 'coming_soon')
  const featured = nowShowing[0] || movies[0]

  return (
    <div className="min-h-screen">

      {/* ── Hero ── */}
      <section className="relative min-h-[100dvh] flex items-center overflow-hidden">

        {/* Poster backdrop */}
        {featured?.poster ? (
          <div className="absolute inset-0">
            <img
              src={featured.poster}
              alt=""
              aria-hidden="true"
              className="absolute right-0 top-0 h-full w-full lg:w-3/5 object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background from-35% via-background/85 lg:via-background/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-background/40" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/20" />
        )}

        <div className="relative z-10 container mx-auto px-4 max-w-[1400px] pt-24 pb-16">
          <div className="max-w-lg">

            {/* Genres */}
            {featured?.genres?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {featured.genres.slice(0, 3).map(g => (
                  <Badge key={g} variant="secondary" className="bg-white/10 text-foreground border-0 text-xs font-medium">
                    {g}
                  </Badge>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-4">
              {featured?.title || 'Trải nghiệm điện ảnh đỉnh cao'}
            </h1>

            {/* Meta */}
            <div className="flex items-center gap-3 mb-5 text-sm text-muted-foreground">
              {featured?.ageRating && (
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-white/10 text-foreground">
                  {featured.ageRating}
                </span>
              )}
              {featured?.duration && <span>{featured.duration} phút</span>}
              {featured?.rating > 0 && (
                <span className="flex items-center gap-1 text-yellow-400">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="font-medium">{Number(featured.rating).toFixed(1)}</span>
                </span>
              )}
            </div>

            {/* Synopsis */}
            {featured?.synopsis && (
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-8 max-w-md">
                {featured.synopsis}
              </p>
            )}

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-semibold h-12 px-7" asChild>
                <Link to={featured ? `/movies/${featured.id}` : '/movies'}>
                  <Play className="w-4 h-4 mr-2 fill-current" />
                  Đặt vé ngay
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/15 bg-white/5 hover:bg-white/10 text-foreground font-medium h-12 px-7"
                asChild
              >
                <Link to="/movies">Xem tất cả phim</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </section>


      {/* ── Phim Đang Chiếu - Horizontal scroll ── */}
      {nowShowing.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-[1400px]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Phim Đang Chiếu</h2>
              <Link
                to="/movies?status=now_showing"
                className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Xem tất cả
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide snap-x snap-mandatory -mx-4 px-4">
              {nowShowing.slice(0, 10).map(movie => (
                <div key={movie.id} className="snap-start shrink-0 w-[175px] sm:w-[195px]">
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}


      {/* ── Phim Sắp Chiếu - Grid ── */}
      {comingSoon.length > 0 && (
        <section className="py-12 border-t border-border/40">
          <div className="container mx-auto px-4 max-w-[1400px]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Phim Sắp Chiếu</h2>
                <p className="text-sm text-muted-foreground mt-1">Những bom tấn sắp ra mắt</p>
              </div>
              <Link
                to="/movies?status=coming_soon"
                className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Xem tất cả
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {comingSoon.slice(0, 5).map(movie => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </div>
        </section>
      )}


      {/* ── CTA Banner (Guest only) ── */}
      {!isAuthenticated && (
        <section className="py-14 border-t border-border/40">
          <div className="container mx-auto px-4 max-w-[1400px]">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border border-primary/20 px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              <div className="relative text-center sm:text-left">
                <h3 className="text-xl font-bold mb-2">Tham gia CineBook ngay hôm nay</h3>
                <p className="text-sm text-muted-foreground">Tạo tài khoản miễn phí, nhận ưu đãi độc quyền cho thành viên.</p>
              </div>
              <div className="relative flex gap-3 shrink-0">
                <Button asChild variant="outline" className="border-white/15 bg-white/5 hover:bg-white/10">
                  <Link to="/login">Đăng nhập</Link>
                </Button>
                <Button asChild className="bg-primary hover:bg-primary/90 text-white font-semibold">
                  <Link to="/register">
                    Đăng ký miễn phí
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

    </div>
  )
}
