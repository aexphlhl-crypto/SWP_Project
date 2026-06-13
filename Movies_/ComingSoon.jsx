import { MovieGrid } from '@/components/movies/movie-grid'
import { useData } from '@/contexts/data-context'
import { genres } from '@/lib/mock-data'

export default function ComingSoonPage() {
  const { movies, cinemas } = useData();
  const filteredMovies = movies.filter(m => m.status === 'coming_soon')
  return (
    <div className="container py-8">
      <MovieGrid
        movies={filteredMovies}
        genres={genres}
        cinemas={cinemas}
        title="Phim sắp chiếu"
        subtitle="Đừng bỏ lỡ những siêu phẩm sắp đổ bộ rạp chiếu phim"
      />
    </div>
  )
}
