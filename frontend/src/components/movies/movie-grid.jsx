"use client";

import { useEffect, useMemo, useState } from 'react';
import { Film } from 'lucide-react';
import { MovieCard } from './movie-card';
import { MovieFilters } from './movie-filters';
import { useClientPagination } from '@/hooks/use-client-pagination';
import { ClientPagination } from '@/components/ui/client-pagination';
export function MovieGrid({
  movies,
  genres,
  cinemas,
  showtimes = [],
  initialStatus = 'all',
  title = 'Danh sách phim',
  subtitle
}) {
  const [status, setStatus] = useState(initialStatus);
  const [genre, setGenre] = useState('all');
  const [cinema, setCinema] = useState('all');

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  const filteredMovies = useMemo(() => {
    return movies.filter(movie => {
      if (status !== 'all' && movie.status !== status) return false;
      if (genre !== 'all' && !movie.genres?.includes(genre)) return false;
      if (cinema !== 'all') {
        const hasShowtimeAtCinema = showtimes.some(showtime =>
          String(showtime.movieId) === String(movie.id) && String(showtime.cinemaId) === String(cinema)
        );
        if (!hasShowtimeAtCinema) return false;
      }
      return true;
    });
  }, [movies, showtimes, status, genre, cinema]);

  const { currentDataOnPage, currentPage, totalPages, handlePageChange, startIndex, endIndex, totalItems } = useClientPagination(filteredMovies, 12);

  const handleClearFilters = () => {
    setStatus('all');
    setGenre('all');
    setCinema('all');
  };
  return <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="text-sm text-muted-foreground">
          Hiển thị <span className="font-semibold text-foreground">{filteredMovies.length > 0 ? startIndex + 1 : 0}-{endIndex}</span> trên tổng số <span className="font-semibold text-foreground">{totalItems}</span> phim
        </div>
      </div>

      <MovieFilters status={status} genre={genre} cinema={cinema} genres={genres} cinemas={cinemas} onStatusChange={setStatus} onGenreChange={setGenre} onCinemaChange={setCinema} onClearFilters={handleClearFilters} />

      {filteredMovies.length > 0 ? <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {currentDataOnPage.map(movie => <MovieCard key={movie.id} movie={movie} />)}
          </div>
          
          <div className="flex justify-center pt-2">
            <ClientPagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={handlePageChange} 
            />
          </div>
        </div> : <div className="flex flex-col items-center justify-center py-16 text-center">
          <Film className="mb-4 size-16 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold">Không tìm thấy phim</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Thử thay đổi bộ lọc để xem thêm phim khác
          </p>
        </div>}
    </section>;
}
