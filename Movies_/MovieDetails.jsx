import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
  ArrowLeft,
  Calendar,
  Clock,
  Play,
  Star,
  User,
  Film,
  Ticket,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { StarRating } from '@/components/movies/star-rating'
import { ShowtimeList } from '@/components/movies/showtime-list'
import { useData } from '@/contexts/data-context'
import { useEffect } from 'react'
import reviewApi from '@/api/reviewApi'
import { MessageSquare } from 'lucide-react'

export default function MovieDetailPage() {
  const { movies, showtimes } = useData();
  const { id } = useParams()
  const movie = movies.find((m) => String(m.id) === String(id) || String(m.movieId) === String(id))
  const [trailerOpen, setTrailerOpen] = useState(false)
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (movie && (movie.id || movie.movieId)) {
      const fetchReviews = async () => {
        try {
          const res = await reviewApi.getMovieReviews(movie.movieId || movie.id);
          if (res.success) {
            setReviews(res.data || []);
          }
        } catch (error) {
          console.error('Failed to fetch reviews', error);
        }
      };
      fetchReviews();
    }
  }, [movie]);

  const movieShowtimes = useMemo(() => {
    if (!movie || movie.status !== 'now_showing') return [];
    return showtimes.filter(s => s.movieId === id);
  }, [id, movie, showtimes]);

  if (!movie) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center py-16">
        <Film className="mb-4 size-16 text-muted-foreground/50" />
        <h1 className="text-2xl font-bold">Không tìm thấy phim</h1>
        <p className="mt-2 text-muted-foreground">
          Phim bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
        </p>
        <Button asChild className="mt-6">
          <Link to="/movies">
            <ArrowLeft className="mr-2 size-4" />
            Quay lại danh sách phim
          </Link>
        </Button>
      </div>
    )
  }

  const ageRatingColors = {
    P: 'bg-green-600',
    C13: 'bg-yellow-600',
    C16: 'bg-orange-600',
    C18: 'bg-red-600',
  }

  const ageRatingDescriptions = {
    P: 'Phù hợp mọi lứa tuổi',
    C13: 'Cấm khán giả dưới 13 tuổi',
    C16: 'Cấm khán giả dưới 16 tuổi',
    C18: 'Cấm khán giả dưới 18 tuổi',
  }

  return (
    <>
      {/* Hero Section with Backdrop */}
      <div className="relative">
        {movie.backdrop && (
          <div className="absolute inset-0 h-[500px]">
            <img
              src={movie.backdrop}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
          </div>
        )}

        <div className="container relative pt-8">
          {/* Back Button */}
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link to="/movies">
              <ArrowLeft className="mr-2 size-4" />
              Quay lại
            </Link>
          </Button>

          {/* Movie Info Section */}
          <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
            {/* Poster */}
            <div className="relative mx-auto w-full max-w-[300px] lg:mx-0">
              <div className="relative aspect-[2/3] overflow-hidden rounded-lg shadow-2xl">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Trailer Button */}
              {movie.trailer && (
                <Dialog open={trailerOpen} onOpenChange={setTrailerOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="lg"
                      className="absolute inset-0 m-auto size-16 rounded-full bg-primary/90 hover:bg-primary"
                    >
                      <Play className="size-8 fill-current" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl border-0 bg-black p-0">
                    <DialogTitle className="sr-only">Trailer: {movie.title}</DialogTitle>
                    <div className="aspect-video">
                      <iframe
                        src={`https://www.youtube.com/embed/${movie.trailer}?autoplay=1`}
                        title={`Trailer: ${movie.title}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="size-full"
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Info */}
            <div className="space-y-6">
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge
                    className={`border-0 text-white ${ageRatingColors[movie.ageRating] || 'bg-gray-600'}`}
                  >
                    {movie.ageRating}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {ageRatingDescriptions[movie.ageRating]}
                  </span>
                </div>

                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                  {movie.title}
                </h1>
                {movie.originalTitle && (
                  <p className="mt-1 text-lg text-muted-foreground">
                    {movie.originalTitle}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <StarRating rating={movie.rating} size="lg" />
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="size-4" />
                  <span>{movie.duration} phút</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="size-4" />
                  <span>
                    {format(new Date(movie.releaseDate), 'dd/MM/yyyy', { locale: vi })}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {movie.genres.map((genre) => (
                  <Badge key={genre} variant="secondary">
                    {genre}
                  </Badge>
                ))}
              </div>

              <div>
                <h3 className="mb-2 font-semibold">Nội dung phim</h3>
                <p className="leading-relaxed text-muted-foreground">
                  {movie.description}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <User className="size-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Đạo diễn:</span>
                <span className="font-medium">{movie.director}</span>
              </div>

              {movie.status === 'now_showing' && (
                <Button size="lg" className="bg-primary hover:bg-primary/90" asChild>
                  <a href="#showtimes">
                    <Ticket className="mr-2 size-5" />
                    Đặt vé ngay
                  </a>
                </Button>
              )}

              {movie.status === 'coming_soon' && (
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="border-primary text-primary">
                    Sắp ra mắt
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Khởi chiếu:{' '}
                    {format(new Date(movie.releaseDate), "dd 'tháng' MM, yyyy", {
                      locale: vi,
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="container py-12">
        <Tabs defaultValue={movie.status === 'now_showing' ? 'showtimes' : 'cast'}>
          <TabsList className="mb-6">
            {movie.status === 'now_showing' && (
              <TabsTrigger value="showtimes" id="showtimes">
                <Ticket className="mr-2 size-4" />
                Lịch chiếu
              </TabsTrigger>
            )}
            <TabsTrigger value="cast">
              <User className="mr-2 size-4" />
              Diễn viên
            </TabsTrigger>
            <TabsTrigger value="reviews">
              <MessageSquare className="mr-2 size-4" />
              Đánh giá ({reviews.length})
            </TabsTrigger>
            {movie.trailer && (
              <TabsTrigger value="trailer">
                <Play className="mr-2 size-4" />
                Trailer
              </TabsTrigger>
            )}
          </TabsList>

          {movie.status === 'now_showing' && (
            <TabsContent value="showtimes" className="mt-0">
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <ShowtimeList
                    movieId={movie.id}
                    showtimes={movieShowtimes}
                    onSelectShowtime={(showtime) => {
                      console.log('Selected showtime:', showtime)
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="cast" className="mt-0">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {movie.cast.map((actor) => (
                <Card
                  key={actor.id}
                  className="overflow-hidden border-border/50 p-0 transition-colors hover:bg-card"
                >
                  <div className="flex flex-col items-center p-4 text-center">
                    <Avatar className="mb-3 size-20">
                      <AvatarImage src={actor.avatar} alt={actor.name} />
                      <AvatarFallback className="bg-secondary text-lg">
                        {actor.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <h4 className="font-semibold leading-tight">{actor.name}</h4>
                    <p className="mt-1 text-xs text-muted-foreground">{actor.role}</p>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-0">
            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {reviews.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      Chưa có đánh giá nào cho phim này.
                    </div>
                  ) : (
                    reviews.map((review) => (
                      <div key={review.id} className="flex gap-4 border-b border-border/50 pb-6 last:border-0 last:pb-0">
                        <Avatar className="size-10">
                          <AvatarFallback className="bg-primary/20 text-primary">
                            {review.customerName ? review.customerName.charAt(0).toUpperCase() : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{review.customerName}</h4>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(review.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mb-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`size-3 ${i < review.rating ? 'fill-accent text-accent' : 'fill-muted text-muted'}`}
                              />
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {movie.trailer && (
            <TabsContent value="trailer" className="mt-0">
              <Card className="overflow-hidden border-border/50 p-0">
                <div className="aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${movie.trailer}`}
                    title={`Trailer: ${movie.title}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="size-full"
                  />
                </div>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Related Movies Section */}
      <div className="border-t border-border/50 bg-card/30 py-12">
        <div className="container">
          <h2 className="mb-6 text-2xl font-bold">Phim tương tự</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {movies
              .filter(
                (m) =>
                  m.id !== movie.id &&
                  m.genres.some((g) => movie.genres.includes(g))
              )
              .slice(0, 6)
              .map((relatedMovie) => (
                <Link
                  key={relatedMovie.id}
                  to={`/movies/${relatedMovie.id}`}
                  className="group"
                >
                  <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
                    <img
                      src={relatedMovie.poster}
                      alt={relatedMovie.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <h4 className="mt-2 line-clamp-2 text-sm font-medium transition-colors group-hover:text-primary">
                    {relatedMovie.title}
                  </h4>
                  <div className="mt-1 flex items-center gap-1">
                    <Star className="size-3 fill-accent text-accent" />
                    <span className="text-xs text-muted-foreground">
                      {relatedMovie.rating.toFixed(1)}
                    </span>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </>
  )
}
