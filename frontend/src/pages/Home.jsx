"use client"


import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { Play, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useData } from '@/contexts/data-context'
import { MovieCard } from '@/components/movies/movie-card'

export default function HomePage() {
  const { movies } = useData();
  const { user, isAuthenticated } = useAuth()

  return (
    
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-secondary/50 to-background py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <Badge variant="outline" className="mb-4 border-primary text-primary">
                Chào mừng đến CineBook
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6 text-balance">
                Trải nghiệm{' '}
                <span className="text-primary">điện ảnh</span>{' '}
                đỉnh cao
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-2xl">
                Đặt vé xem phim nhanh chóng, tiện lợi với hệ thống rạp chiếu phim hiện đại. 
                Khám phá những bộ phim bom tấn và nhận ngay ưu đãi hấp dẫn.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                  <Link to="/movies">
                    <Play className="w-5 h-5 mr-2" />
                    Đặt vé ngay
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/movies">
                    Xem lịch chiếu
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>


        {/* Featured Movies - Now Showing */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold mb-1">Phim Đang Chiếu</h2>
                <p className="text-muted-foreground">Những bộ phim hot nhất tại rạp</p>
              </div>
              <Button variant="outline" className="hidden sm:inline-flex" asChild>
                <Link to="/movies?status=now_showing">
                  Xem tất cả
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {movies.filter(m => m.status === 'now_showing').slice(0, 5).map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </div>
        </section>

        {/* Coming Soon Movies */}
        <section className="py-12 bg-card/30 border-y border-border/50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold mb-1">Phim Sắp Chiếu</h2>
                <p className="text-muted-foreground">Đừng bỏ lỡ những bom tấn sắp ra mắt</p>
              </div>
              <Button variant="outline" className="hidden sm:inline-flex" asChild>
                <Link to="/movies?status=coming_soon">
                  Xem tất cả
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {movies.filter(m => m.status === 'coming_soon').slice(0, 5).map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </div>
        </section>
      </div>
    
  )
}
