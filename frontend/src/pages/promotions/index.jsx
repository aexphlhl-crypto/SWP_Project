import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Copy, Clock, Ticket, Tag } from 'lucide-react'
import { useState, useEffect } from 'react'
import promoApi from '@/api/promoApi'
import { toast } from 'sonner'
import { useClientPagination } from '@/hooks/use-client-pagination'
import { ClientPagination } from '@/components/ui/client-pagination'

function PromoCard({ promo, expired = false }) {
  const isPercentage = promo.discountType === 'Percentage'
  const discountLabel = isPercentage
    ? `${promo.discountValue}%`
    : `${Number(promo.discountValue).toLocaleString('vi-VN')}₫`

  const handleCopy = () => {
    navigator.clipboard.writeText(promo.code)
    toast.success('Đã sao chép mã!')
  }

  return (
    <div className={`relative flex overflow-hidden rounded-xl border transition-colors ${
      expired
        ? 'border-border/40 bg-card/40 opacity-60'
        : 'border-border/60 bg-card hover:border-primary/40'
    }`}>
      {/* Left accent bar */}
      {!expired && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-xl" />}

      {/* Discount block */}
      <div className={`flex flex-col items-center justify-center px-5 py-4 shrink-0 border-r ${
        expired ? 'border-border/30 w-24' : 'border-border/40 w-28 bg-primary/5'
      }`}>
        <span className={`text-2xl font-black leading-none ${expired ? 'line-through text-muted-foreground' : 'text-primary'}`}>
          {discountLabel}
        </span>
        <span className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wide font-medium">
          {isPercentage ? 'Giảm' : 'Tiết kiệm'}
        </span>
      </div>

      {/* Content */}
      <div className={`flex-1 min-w-0 p-4 space-y-2.5 ${!expired ? 'pl-5' : 'pl-4'}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <code className="font-mono font-bold text-sm tracking-widest text-foreground">
                {promo.code}
              </code>
              {!expired && (
                <Badge className="text-[10px] px-1.5 py-0 bg-primary/15 text-primary border-0 font-medium">
                  Đang áp dụng
                </Badge>
              )}
            </div>
          </div>
          {!expired && (
            <Button
              size="sm"
              variant="ghost"
              className="shrink-0 h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              onClick={handleCopy}
            >
              <Copy className="w-3 h-3" />
              Sao chép
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {promo.minOrderValue > 0 && (
            <span>
              Đơn tối thiểu{' '}
              <strong className="text-foreground font-medium">
                {Number(promo.minOrderValue).toLocaleString('vi-VN')}₫
              </strong>
            </span>
          )}
          {promo.maxDiscountVnd > 0 && isPercentage && (
            <span>
              Giảm tối đa{' '}
              <strong className="text-foreground font-medium">
                {Number(promo.maxDiscountVnd).toLocaleString('vi-VN')}₫
              </strong>
            </span>
          )}
          {promo.validUntil && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Hết hạn {new Date(promo.validUntil).toLocaleDateString('vi-VN')}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    promoApi.getAllPromos({ page: 0, size: 100 })
      .then(res => {
        if (res.success) setPromotions(res.data.content)
      })
      .catch(() => toast.error('Lỗi tải danh sách khuyến mãi'))
      .finally(() => setLoading(false))
  }, [])

  const now = new Date()
  const active = promotions.filter(p => p.status === 'Active' && new Date(p.validUntil) >= now)
  const expired = promotions.filter(p => p.status !== 'Active' || new Date(p.validUntil) < now)

  const { currentDataOnPage, currentPage, totalPages, handlePageChange, startIndex, endIndex, totalItems } =
    useClientPagination(active, 8)

  if (loading) {
    return (
      <div className="container mx-auto px-4 max-w-[1400px] py-10">
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl border border-border/60 bg-card animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 max-w-[1400px] py-10 space-y-10">

      {/* Header */}
      <div className="space-y-1.5">
        <h1 className="text-3xl font-bold tracking-tight">Khuyến mãi &amp; Ưu đãi</h1>
        <p className="text-muted-foreground text-sm">
          Tiết kiệm hơn với các mã giảm giá từ CineBook
        </p>
      </div>

      {/* Active */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Ticket className="w-4 h-4 text-primary" />
          Đang áp dụng
          {active.length > 0 && (
            <Badge variant="secondary" className="font-normal text-xs">{active.length}</Badge>
          )}
        </h2>

        {currentDataOnPage.length > 0 ? (
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              {currentDataOnPage.map(promo => (
                <PromoCard key={promo.id} promo={promo} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <p className="text-sm text-muted-foreground">
                  Hiển thị {startIndex + 1}-{endIndex} / {totalItems} ưu đãi
                </p>
                <ClientPagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
              </div>
            )}
          </div>
        ) : (
          <div className="py-14 text-center border border-dashed border-border rounded-xl text-muted-foreground text-sm">
            Hiện không có chương trình khuyến mãi nào đang áp dụng.
          </div>
        )}
      </div>

      {/* Expired */}
      {expired.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            Đã hết hạn
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {expired.slice(0, 6).map(promo => (
              <PromoCard key={promo.id} promo={promo} expired />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
