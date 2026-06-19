import { MovieGrid } from '@/components/movies/movie-grid'
import { useData } from '@/contexts/data-context'

export default function NowShowingPage() {
  const { movies, genres, cinemas, showtimes } = useData();
  const filteredMovies = movies.filter(m => m.status === 'now_showing')
  return (
    <div className="container py-8">
      <MovieGrid
        movies={filteredMovies}
        genres={genres}
        cinemas={cinemas}
        showtimes={showtimes}
        title="Phim đang chiếu"
        subtitle="Những bộ phim hấp dẫn đang được công chiếu tại rạp"
      />
    </div>
  )
}
