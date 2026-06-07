import { MovieGrid } from '@/components/movies/movie-grid'
import { useData } from '@/contexts/data-context'
import { genres } from '@/lib/mock-data'

export default function NowShowingPage() {
  const { movies, cinemas } = useData();
  const filteredMovies = movies.filter(m => m.status === 'now_showing')
  return (
    <div className="container py-8">
      <MovieGrid
        movies={filteredMovies}
        genres={genres}
        cinemas={cinemas}
        title="Phim đang chiếu"
        subtitle="Những bộ phim hấp dẫn đang được công chiếu tại rạp"
      />
    </div>
  )
}
