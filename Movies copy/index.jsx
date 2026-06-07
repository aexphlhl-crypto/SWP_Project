import { useState } from 'react'
import { MovieGrid } from '@/components/movies/movie-grid'
import { useData } from '@/contexts/data-context'
import { genres } from '@/lib/mock-data'

export default function MoviesPage() {
  const { movies, cinemas } = useData();
  return (
    <div className="container py-8">
      <MovieGrid
        movies={movies}
        genres={genres}
        cinemas={cinemas}
        title="Danh sách phim"
        subtitle="Khám phá những bộ phim hay nhất đang chiếu và sắp ra mắt"
      />
    </div>
  )
}
