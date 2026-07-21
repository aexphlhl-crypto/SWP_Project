import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import newsApi from '@/api/newsApi'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function NewsDetail() {
  const { id } = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    newsApi.getArticleById(id).then(res => {
      if (res.success) {
        setArticle(res.data)
      }
    }).finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div className="text-center py-20 text-muted-foreground">Đang tải...</div>
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Không tìm thấy bài viết</h1>
        <Button asChild>
          <Link to="/news">Về trang tin tức</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" asChild className="mb-6 -ml-4 text-muted-foreground hover:text-foreground">
        <Link to="/news"><ArrowLeft className="w-4 h-4 mr-2" /> Quay lại</Link>
      </Button>

      <article>
        <h1 className="text-4xl font-bold mb-4 leading-tight">{article.title}</h1>
        <div className="text-muted-foreground mb-8">
          Đăng ngày: {new Date(article.createdAt).toLocaleDateString('vi-VN')}
        </div>
        
        <div className="w-full aspect-video rounded-xl overflow-hidden mb-12 shadow-sm">
          <img 
            src={article.thumbnailUrl || 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=800&q=80'} 
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div 
          className="prose prose-lg max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </article>
    </div>
  )
}
