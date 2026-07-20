import { Link } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
import { Calendar } from 'lucide-react'
import newsApi from '@/api/newsApi'
import { useClientPagination } from '@/hooks/use-client-pagination'
import { ClientPagination } from '@/components/ui/client-pagination'

const FALLBACK_IMG = 'https://picsum.photos/seed/cinebook-news/800/450'

function ArticleCard({ article, featured = false }) {
  if (featured) {
    return (
      <Link to={`/news/${article.id}`} className="group block">
        <div className="grid md:grid-cols-2 gap-0 overflow-hidden rounded-xl border border-border/60 bg-card hover:border-primary/30 transition-colors">
          <div className="relative overflow-hidden aspect-video md:aspect-auto md:min-h-[280px]">
            <img
              src={article.thumbnailUrl || FALLBACK_IMG}
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-card/20" />
          </div>
          <div className="p-8 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(article.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })}
            </div>
            <h2 className="text-xl font-bold leading-snug mb-3 group-hover:text-primary transition-colors line-clamp-3">
              {article.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
              {article.summary}
            </p>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link to={`/news/${article.id}`} className="group block">
      <div className="flex flex-col h-full overflow-hidden rounded-xl border border-border/60 bg-card hover:border-primary/30 transition-colors">
        <div className="aspect-video relative overflow-hidden">
          <img
            src={article.thumbnailUrl || FALLBACK_IMG}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2.5">
            <Calendar className="w-3 h-3" />
            {new Date(article.createdAt).toLocaleDateString('vi-VN')}
          </div>
          <h3 className="text-sm font-semibold leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-3 mt-auto leading-relaxed">
            {article.summary}
          </p>
        </div>
      </div>
    </Link>
  )
}

export default function NewsPage() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    newsApi.getAllArticles({ page: 0, size: 50 }).then(res => {
      if (res.success) setNews(res.data?.content || [])
    }).finally(() => setLoading(false))
  }, [])

  const publishedNews = useMemo(() => news.filter(n => n.status === 'Published'), [news])

  const featuredArticle = publishedNews[0]
  const restArticles = publishedNews.slice(1)

  const { currentDataOnPage, currentPage, totalPages, handlePageChange, startIndex, endIndex, totalItems } =
    useClientPagination(restArticles, 6)

  if (loading) {
    return (
      <div className="container mx-auto px-4 max-w-[1400px] py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border/60 bg-card overflow-hidden animate-pulse">
              <div className="aspect-video bg-secondary/60" />
              <div className="p-5 space-y-3">
                <div className="h-3 bg-secondary/60 rounded w-1/3" />
                <div className="h-4 bg-secondary/60 rounded" />
                <div className="h-4 bg-secondary/60 rounded w-4/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 max-w-[1400px] py-10">
      <h1 className="text-3xl font-bold mb-8">Tin tức &amp; Bài viết</h1>

      {publishedNews.length === 0 ? (
        <p className="text-muted-foreground py-16 text-center">Chưa có bài viết nào.</p>
      ) : (
        <div className="space-y-10">
          {/* Featured */}
          {featuredArticle && <ArticleCard article={featuredArticle} featured />}

          {/* Grid */}
          {currentDataOnPage.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentDataOnPage.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <p className="text-sm text-muted-foreground">
                Hiển thị {startIndex + 1}-{endIndex} / {totalItems} bài viết
              </p>
              <ClientPagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
