import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react';
import newsApi from '@/api/newsApi';

export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    newsApi.getAllArticles({ page: 0, size: 20 }).then(res => {
      if (res.success) {
        setNews(res.data?.content || []);
      }
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-10">Đang tải...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Tin tức & Bài viết</h1>
      {news.length === 0 ? (
        <p className="text-muted-foreground">Chưa có bài viết nào.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.filter(n => n.status === 'Published').map(article => (
            <Link to={`/news/${article.id}`} key={article.id} className="block group">
              <div className="flex flex-col h-full overflow-hidden rounded-xl border bg-card text-card-foreground shadow hover:shadow-lg transition-all">
                <div className="aspect-video relative w-full overflow-hidden">
                  <img 
                    src={article.thumbnailUrl || 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=800&q=80'} 
                    alt={article.title} 
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="text-xs text-muted-foreground mb-2">
                    {new Date(article.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                  <h3 className="font-semibold leading-tight mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 mt-auto">
                    {article.summary}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
