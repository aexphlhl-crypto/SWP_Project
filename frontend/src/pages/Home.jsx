import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useData } from '@/contexts/data-context'
import { MovieCard } from '@/components/movies/movie-card'
import newsApi from '@/api/newsApi'
import { 
  Play, 
  ArrowRight, 
  Star, 
  ChevronRight, 
  MapPin, 
  Calendar as CalendarIcon, 
  Film 
} from 'lucide-react'

const dummyMovies = [
  {
    id: "m-1",
    title: "Minions: Sự Trỗi Dậy Của Gru",
    poster: "https://images.unsplash.com/photo-1608889175123-8ec330b86f84?w=500&auto=format&fit=crop&q=80",
    ageRating: "P",
    duration: 88,
    rating: 4.8,
    genres: ["Hoạt hình", "Hài hước", "Gia đình"],
    status: "now_showing",
    synopsis: "Hành trình trở thành siêu ác nhân vĩ đại nhất thế giới của cậu bé Gru 12 tuổi cùng sự trợ giúp đắc lực của các sinh vật màu vàng siêu quậy."
  },
  {
    id: "m-2",
    title: "Spider-Man: Không Còn Đường Về",
    poster: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=500&auto=format&fit=crop&q=80",
    ageRating: "C13",
    duration: 148,
    rating: 4.9,
    genres: ["Hành động", "Phiêu lưu", "Sci-Fi"],
    status: "now_showing",
    synopsis: "Lần đầu tiên trong lịch sử điện ảnh của Người Nhện, danh tính người hùng hàng xóm thân thiện bị vạch trần, buộc anh phải tìm đến Doctor Strange để giải quyết rắc rối."
  },
  {
    id: "m-3",
    title: "Người Dơi: Kỵ Sĩ Bóng Đêm",
    poster: "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=500&auto=format&fit=crop&q=80",
    ageRating: "C16",
    duration: 152,
    rating: 4.9,
    genres: ["Hành động", "Tội phạm", "Tâm lý"],
    status: "now_showing",
    synopsis: "Khi mối đe dọa được gọi là Joker phá hoại và gây ra hỗn loạn cho người dân Gotham, Người Nhện phải chấp nhận một trong những bài kiểm tra tâm lý lớn nhất để chống lại sự bất công."
  },
  {
    id: "m-4",
    title: "Inside Out 2: Những Mảnh Ghép Cảm Xúc 2",
    poster: "https://images.unsplash.com/photo-1593085512500-5d55148d6f0d?w=500&auto=format&fit=crop&q=80",
    ageRating: "P",
    duration: 96,
    rating: 4.7,
    genres: ["Hoạt hình", "Hài hước", "Tâm lý"],
    status: "now_showing",
    synopsis: "Quay trở lại tâm trí của cô bé Riley lúc này đã là một thiếu niên, trung tâm điều khiển cảm xúc đột ngột trải qua một đợt cải tạo để nhường chỗ cho những Cảm xúc Mới!"
  },
  {
    id: "m-5",
    title: "Avatar: Dòng Chảy Của Nước",
    poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80",
    ageRating: "C13",
    duration: 192,
    rating: 4.8,
    genres: ["Hành động", "Phiêu lưu", "Sci-Fi"],
    status: "now_showing",
    synopsis: "Jake Sully sống cùng gia đình mới thành lập trên hành tinh Pandora. Khi một mối đe dọa quen thuộc quay trở lại để hoàn thành những gì họ đã bắt đầu, Jake phải hợp tác với Neytiri và quân đội của bộ tộc Na'vi để bảo vệ hành tinh của họ."
  },
  {
    id: "m-6",
    title: "Dune: Hành Tinh Cát - Phần 2",
    poster: "https://images.unsplash.com/photo-1547483238-f400e65ccd56?w=500&auto=format&fit=crop&q=80",
    ageRating: "C13",
    duration: 166,
    rating: 4.9,
    genres: ["Sci-Fi", "Phiêu lưu", "Hành động"],
    status: "coming_soon",
    synopsis: "Paul Atreides gia nhập cùng Chani và người Fremen khi đi trên con đường trả thù những kẻ âm mưu tiêu diệt gia đình mình."
  },
  {
    id: "m-7",
    title: "Evil Dead Rise: Quỷ Dữ Thức Tỉnh",
    poster: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=500&auto=format&fit=crop&q=80",
    ageRating: "C18",
    duration: 97,
    rating: 4.5,
    genres: ["Kinh dị", "Bí ẩn"],
    status: "coming_soon",
    synopsis: "Một câu chuyện rùng rợn về hai chị em bị ghẻ lạnh có cuộc hội ngộ bị cắt ngắn bởi sự trỗi dậy của những con quỷ sở hữu xác thịt."
  }
];

const dummyNews = [
  {
    id: "n-1",
    title: "Trải nghiệm giải vô địch bóng đá thế giới World Cup trên màn ảnh rộng cùng CineBook!",
    summary: "Đồng hành cùng đội tuyển yêu thích của bạn với bầu không khí bùng nổ, âm thanh sống động và màn hình IMAX siêu khổng lồ độc quyền tại tất cả các chi nhánh CineBook.",
    thumbnailUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString(),
    status: "Published"
  },
  {
    id: "n-2",
    title: "Vé xem siêu phẩm hoạt hình Minions & Quái Thú đã chính thức được mở bán!",
    summary: "Nhanh tay đặt ngay vé sớm để nhận được những phần quà đặc biệt từ Minions bao gồm ly nước cốc thiết kế độc quyền và cơ hội bốc thăm trúng thưởng chuyến du lịch.",
    thumbnailUrl: "https://images.unsplash.com/photo-1608889175123-8ec330b86f84?w=800&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString(),
    status: "Published"
  },
  {
    id: "n-3",
    title: "Đặt vé phim Hành Trình Của Moana 2 sớm nhận quà độc quyền!",
    summary: "Cơ hội duy nhất dành riêng cho thành viên CineBook nhận bộ sticker đại dương phát sáng đặc biệt khi đặt vé xem trước Moana 2 bắt đầu từ hôm nay.",
    thumbnailUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString(),
    status: "Published"
  }
];

const dummyCinemas = [
  { id: "c-1", name: "CineBook Nguyễn Du" },
  { id: "c-2", name: "CineBook Thảo Điền" },
  { id: "c-3", name: "CineBook Hồ Gươm Plaza" },
  { id: "c-4", name: "CineBook Đà Nẵng Center" }
];

export default function HomePage() {
  const { movies, cinemas } = useData()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Fallbacks to dummy if context data is empty
  const activeMovies = movies.length > 0 ? movies : dummyMovies
  const activeCinemas = cinemas.length > 0 ? cinemas : dummyCinemas

  // Quick booking state
  const [selectedMovie, setSelectedMovie] = useState('')
  const [selectedCinema, setSelectedCinema] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [latestNews, setLatestNews] = useState([])
  const [newsLoading, setNewsLoading] = useState(true)

  const nowShowing = activeMovies.filter(m => m.status === 'now_showing')
  const comingSoon = activeMovies.filter(m => m.status === 'coming_soon')
  const featured = nowShowing[0] || activeMovies[0]
  const displayNews = latestNews.length > 0 ? latestNews : dummyNews

  // Fetch latest 3 news articles on mount
  useEffect(() => {
    newsApi.getAllArticles({ page: 0, size: 20 })
      .then(res => {
        if (res.success && res.data?.content) {
          const published = res.data.content
            .filter(n => n.status === 'Published')
            .slice(0, 3)
          setLatestNews(published)
        }
      })
      .catch(err => console.error('Failed to fetch news:', err))
      .finally(() => setNewsLoading(false))
  }, [])

  // Create date list for the next 7 days
  const getNext7Days = () => {
    const days = []
    for (let i = 0; i < 7; i++) {
      const d = new Date()
      d.setDate(d.getDate() + i)
      const dateString = d.toISOString().split('T')[0]
      const label = i === 0 
        ? 'Hôm nay' 
        : i === 1 
          ? 'Ngày mai' 
          : d.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' })
      days.push({ value: dateString, label })
    }
    return days
  }
  const dateOptions = getNext7Days()

  // Pre-fill selected date with today
  useEffect(() => {
    if (dateOptions.length > 0 && !selectedDate) {
      setSelectedDate(dateOptions[0].value)
    }
  }, [dateOptions, selectedDate])

  const handleQuickBookSubmit = (e) => {
    e.preventDefault()
    if (!selectedMovie) return

    let url = `/booking?id=${selectedMovie}`
    if (selectedCinema) url += `&cinema=${selectedCinema}`
    if (selectedDate) url += `&date=${selectedDate}`
    navigate(url)
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-12">

      {/* ── Hero Banner Section ── */}
      <section className="relative min-h-[85dvh] flex items-center overflow-hidden">
        {/* Backdrop cover with fading gradient */}
        {featured?.poster ? (
          <div className="absolute inset-0">
            <img
              src={featured.poster}
              alt=""
              aria-hidden="true"
              className="absolute right-0 top-0 h-full w-full lg:w-3/5 object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background from-30% via-background/85 lg:via-background/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-background/30" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/20" />
        )}

        <div className="relative z-10 container mx-auto px-4 max-w-[1400px] pt-28 pb-20">
          <div className="max-w-xl">
            {/* Genres */}
            {featured?.genres?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {featured.genres.slice(0, 3).map(g => (
                  <Badge key={g} variant="secondary" className="bg-secondary text-secondary-foreground border-0 text-xs font-semibold px-2.5 py-0.5">
                    {g}
                  </Badge>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-4 text-foreground">
              {featured?.title || 'Trải nghiệm điện ảnh đỉnh cao'}
            </h1>

            {/* Movie metadata */}
            <div className="flex items-center gap-3 mb-6 text-sm text-muted-foreground">
              {featured?.ageRating && (
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-secondary text-secondary-foreground border border-border">
                  {featured.ageRating}
                </span>
              )}
              {featured?.duration && <span className="font-medium">{featured.duration} phút</span>}
              {featured?.rating > 0 && (
                <span className="flex items-center gap-1 text-primary">
                  <Star className="w-4 h-4 fill-current text-primary" />
                  <span className="font-bold text-foreground">{Number(featured.rating).toFixed(1)}</span>
                </span>
              )}
            </div>

            {/* Movie Synopsis */}
            {featured?.synopsis && (
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-8 max-w-lg">
                {featured.synopsis}
              </p>
            )}

            {/* Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-12 px-8 rounded-xl shadow-lg shadow-primary/25" asChild>
                <Link to={featured ? `/movies/${featured.id}` : '/movies'}>
                  <Play className="w-4 h-4 mr-2 fill-current" />
                  Đặt vé ngay
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-border bg-secondary hover:bg-secondary/80 text-foreground font-semibold h-12 px-7 rounded-xl"
                asChild
              >
                <Link to="/movies">Xem tất cả phim</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Shadow cover for bottom edge */}
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </section>


      {/* ── Cinema & Date Quick Filter (Lọc rạp & suất chiếu nhanh) ── */}
      <section className="relative z-20 px-4 container mx-auto max-w-[1400px]">
        <form 
          onSubmit={handleQuickBookSubmit}
          className="bg-card/85 backdrop-blur-lg border border-border shadow-2xl rounded-2xl p-4 md:p-6 -mt-12 lg:-mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end"
        >
          {/* Select Movie */}
          <div className="space-y-2">
            <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-primary" />
              Chọn Phim
            </label>
            <div className="relative">
              <select
                required
                value={selectedMovie}
                onChange={(e) => setSelectedMovie(e.target.value)}
                className="w-full bg-muted border border-input hover:border-border focus:border-primary text-foreground rounded-xl px-3 py-2.5 h-11 text-sm focus:outline-none cursor-pointer appearance-none animate-none"
              >
                <option value="" className="bg-popover text-muted-foreground">-- Hãy chọn phim --</option>
                {nowShowing.map(m => (
                  <option key={m.id} value={m.id} className="bg-popover text-foreground">{m.title}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400">
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>
            </div>
          </div>

          {/* Select Cinema */}
          <div className="space-y-2">
            <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              Chọn Rạp Chiếu
            </label>
            <div className="relative">
              <select
                value={selectedCinema}
                onChange={(e) => setSelectedCinema(e.target.value)}
                className="w-full bg-muted border border-input hover:border-border focus:border-primary text-foreground rounded-xl px-3 py-2.5 h-11 text-sm focus:outline-none cursor-pointer appearance-none animate-none"
              >
                <option value="" className="bg-popover text-muted-foreground">Tất cả rạp</option>
                {activeCinemas.map(c => (
                  <option key={c.id} value={c.id} className="bg-popover text-foreground">{c.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400">
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>
            </div>
          </div>

          {/* Select Date */}
          <div className="space-y-2">
            <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-primary" />
              Chọn Ngày Chiếu
            </label>
            <div className="relative">
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-muted border border-input hover:border-border focus:border-primary text-foreground rounded-xl px-3 py-2.5 h-11 text-sm focus:outline-none cursor-pointer appearance-none animate-none"
              >
                {dateOptions.map(opt => (
                  <option key={opt.value} value={opt.value} className="bg-popover text-foreground">
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400">
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>
            </div>
          </div>

          {/* Quick Book Button */}
          <Button 
            type="submit" 
            disabled={!selectedMovie}
            className="w-full bg-primary hover:bg-primary/95 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed text-primary-foreground font-bold h-11 rounded-xl shadow-lg shadow-primary/10 transition-colors"
          >
            Mua Vé Nhanh
          </Button>
        </form>
      </section>


      {/* ── Phim Đang Chiếu (Now Showing) ── */}
      {nowShowing.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-[1400px]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Phim Đang Chiếu</h2>
                <p className="text-sm text-muted-foreground mt-1">Cập nhật suất chiếu mới nhất trong ngày</p>
              </div>
              <Link
                to="/movies?status=now_showing"
                className="flex items-center gap-1 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
              >
                Xem tất cả
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory -mx-4 px-4 scroll-smooth">
              {nowShowing.slice(0, 10).map(movie => (
                <div key={movie.id} className="snap-start shrink-0 w-[190px] sm:w-[210px] md:w-[230px]">
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}


      {/* ── Tin tức mới nhất (Latest News Grid - Pathé style) ── */}
      {displayNews.length > 0 && (
        <section className="py-16 border-t border-border bg-background">
          <div className="container mx-auto px-4 max-w-[1400px]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Tin Tức Điện Ảnh</h2>
                <p className="text-sm text-muted-foreground mt-1">Cập nhật sự kiện, khuyến mãi và hậu trường nóng hổi</p>
              </div>
              <Link
                to="/news"
                className="flex items-center gap-1 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
              >
                Xem tất cả tin tức
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: 1st Large Featured News */}
              {displayNews[0] && (
                <div className="lg:col-span-2">
                  <Link to={`/news/${displayNews[0].id}`} className="group block h-full">
                    <div className="relative h-full min-h-[360px] lg:min-h-[420px] rounded-2xl overflow-hidden border border-border bg-card hover:border-primary/20 transition-all flex flex-col justify-end p-6 md:p-8">
                      {/* Thumbnail background overlay */}
                      <div className="absolute inset-0 bg-muted">
                        <img
                          src={displayNews[0].thumbnailUrl || 'https://picsum.photos/seed/cinebook-news-1/800/450'}
                          alt={displayNews[0].title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/45 to-transparent" />
                      </div>
                      
                      {/* Featured text content */}
                      <div className="relative z-10 space-y-3">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold tracking-wider uppercase bg-primary text-primary-foreground">
                          Tin nổi bật
                        </span>
                        <h3 className="text-xl md:text-2xl font-extrabold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                          {displayNews[0].title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 max-w-2xl leading-relaxed">
                          {displayNews[0].summary}
                        </p>
                        <div className="text-xs text-muted-foreground pt-1">
                          {new Date(displayNews[0].createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              )}

              {/* Right Column: 2 Stacked smaller news */}
              <div className="flex flex-col gap-6">
                {displayNews.slice(1, 3).map((article, idx) => (
                  <Link key={article.id} to={`/news/${article.id}`} className="group block flex-1">
                    <div className="h-full rounded-2xl overflow-hidden border border-border bg-card hover:border-primary/20 transition-all flex flex-col sm:flex-row">
                      <div className="sm:w-2/5 relative aspect-video sm:aspect-auto overflow-hidden min-h-[140px] bg-muted">
                        <img
                          src={article.thumbnailUrl || `https://picsum.photos/seed/cinebook-news-${idx + 2}/800/450`}
                          alt={article.title}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                      <div className="sm:w-3/5 p-5 flex flex-col justify-between">
                        <div className="space-y-2">
                          <h4 className="text-sm font-extrabold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                            {article.title}
                          </h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {article.summary}
                          </p>
                        </div>
                        <div className="text-[10px] text-muted-foreground pt-2">
                          {new Date(article.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}


      {/* ── Phim Sắp Chiếu (Coming Soon Grid) ── */}
      {comingSoon.length > 0 && (
        <section className="py-16 border-t border-border bg-background">
          <div className="container mx-auto px-4 max-w-[1400px]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Phim Sắp Chiếu</h2>
                <p className="text-sm text-muted-foreground mt-1">Những bom tấn được đón chờ nhiều nhất</p>
              </div>
              <Link
                to="/movies?status=coming_soon"
                className="flex items-center gap-1 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
              >
                Xem tất cả
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {comingSoon.slice(0, 5).map(movie => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </div>
        </section>
      )}


      {/* ── CTA Banner (Cho khách đăng ký thành viên) ── */}
      {!isAuthenticated && (
        <section className="py-16 border-t border-border bg-background/50">
          <div className="container mx-auto px-4 max-w-[1400px]">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              <div className="relative text-center md:text-left space-y-1">
                <h3 className="text-xl md:text-2xl font-extrabold text-foreground">Tham gia CineBook ngay hôm nay</h3>
                <p className="text-sm text-muted-foreground">Tạo tài khoản miễn phí, tích lũy điểm thưởng và nhận mã ưu đãi độc quyền.</p>
              </div>
              <div className="relative flex gap-3.5 shrink-0">
                <Button asChild variant="outline" className="border-border bg-secondary hover:bg-secondary/80 font-semibold rounded-xl">
                  <Link to="/login">Đăng nhập</Link>
                </Button>
                <Button asChild className="bg-primary hover:bg-primary/95 text-primary-foreground font-extrabold rounded-xl shadow-lg shadow-primary/15">
                  <Link to="/register">
                    Đăng ký ngay
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
