import { MovieGrid } from '@/components/movies/movie-grid'
import { useData } from '@/contexts/data-context'

export default function ComingSoonPage() {
  const { movies, genres, cinemas, showtimes } = useData();
  const filteredMovies = movies.filter(m => m.status === 'coming_soon')
  return (
    <div className="container py-8">
      <MovieGrid
        movies={filteredMovies}
        genres={genres}
        cinemas={cinemas}
        showtimes={showtimes}
        title="Phim sắp chiếu"
        subtitle="Đừng bỏ lỡ những siêu phẩm sắp đổ bộ rạp chiếu phim"
        hideStatusFilter={true}
      />
    </div>
  )
}
