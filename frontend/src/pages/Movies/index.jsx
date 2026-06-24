import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MovieGrid } from '@/components/movies/movie-grid'
import { useData } from '@/contexts/data-context'

export default function MoviesPage() {
  const { movies, genres, cinemas, showtimes } = useData();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const requestedStatus = searchParams.get('status');
  const status = ['now_showing', 'coming_soon'].includes(requestedStatus)
    ? requestedStatus
    : 'all';

  const filteredMovies = useMemo(() => {
    if (!query) return movies;
    const lowerQuery = query.toLowerCase();
    return movies.filter(movie => {
      // Search in title, director, cast if they exist
      const titleMatch = movie.title?.toLowerCase().includes(lowerQuery);
      const originalTitleMatch = movie.originalTitle?.toLowerCase().includes(lowerQuery);
      const directorMatch = movie.director?.toLowerCase().includes(lowerQuery);
      
      let castMatch = false;
      if (Array.isArray(movie.cast)) {
        castMatch = movie.cast.some(c => c.name?.toLowerCase().includes(lowerQuery));
      } else if (typeof movie.cast === 'string') {
        castMatch = movie.cast.toLowerCase().includes(lowerQuery);
      }

      return titleMatch || originalTitleMatch || directorMatch || castMatch;
    });
  }, [movies, query]);

  return (
    <div className="container py-8">
      <MovieGrid
        movies={filteredMovies}
        genres={genres}
        cinemas={cinemas}
        showtimes={showtimes}
        initialStatus={status}
        title={query ? `Kết quả tìm kiếm cho "${query}"` : "Danh sách phim"}
        subtitle={query ? "" : "Khám phá những bộ phim hay nhất đang chiếu và sắp ra mắt"}
      />
    </div>
  )
}
