import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tag, Copy, Clock, Ticket, Gift, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import promoApi from '@/api/promoApi';
import { toast } from 'sonner';
import { useClientPagination } from '@/hooks/use-client-pagination';
import { ClientPagination } from '@/components/ui/client-pagination';

const TAG_CONFIG = {
  hot: {
    label: 'Hot',
    className: 'bg-red-500/20 text-red-500'
  },
  new: {
    label: 'Mới',
    className: 'bg-green-500/20 text-green-500'
  },
  edu: {
    label: 'Sinh viên',
    className: 'bg-blue-500/20 text-blue-400'
  },
  gift: {
    label: 'Quà tặng',
    className: 'bg-pink-500/20 text-pink-400'
  },
  special: {
    label: 'Đặc biệt',
    className: 'bg-yellow-500/20 text-yellow-500'
  },
  expired: {
    label: 'Hết hạn',
    className: 'bg-secondary text-muted-foreground'
  }
};

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    promoApi.getAllPromos({ page: 0, size: 100 })
      .then(res => {
        if (res.success) {
          setPromotions(res.data.content);
        }
      })
      .catch(err => {
        console.error(err);
        toast.error('Lỗi tải danh sách khuyến mãi');
      })
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const active = promotions.filter(p => p.status === 'Active' && new Date(p.validUntil) >= now);
  const expired = promotions.filter(p => p.status !== 'Active' || new Date(p.validUntil) < now);
  const { currentDataOnPage, currentPage, totalPages, handlePageChange, startIndex, endIndex, totalItems } = useClientPagination(active);
  
  return (
    <div className="container mx-auto px-4 py-10 space-y-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Khuyến mãi & Ưu đãi</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Tiết kiệm hơn với các mã giảm giá và chương trình ưu đãi hấp dẫn từ CineBook
          </p>
        </div>

        {/* Active promotions */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-primary" /> Đang áp dụng
          </h2>
          
          {active.length > 0 ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                {currentDataOnPage.map(promo => {
                const tag = TAG_CONFIG['hot'];
              const Icon = Ticket;
              return <Card key={promo.id} className="bg-card border-border hover:border-primary/40 transition-colors overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                    <CardHeader className="pb-2 pl-6">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-base leading-tight">Mã ưu đãi {promo.code}</CardTitle>
                            <Badge className={`mt-1 text-xs ${tag.className}`}>{tag.label}</Badge>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-2xl font-bold text-primary">Giảm {promo.discountValue}{promo.discountType === 'Percentage' ? '%' : '₫'}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pl-6 space-y-3">
                      <p className="text-sm text-muted-foreground">Áp dụng cho đơn hàng đáp ứng điều kiện tối thiểu.</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>Đơn tối thiểu: <strong className="text-foreground">{promo.minOrderValue ? promo.minOrderValue.toLocaleString('vi-VN') : 0}₫</strong></span>
                        <span>Giảm tối đa: <strong className="text-foreground">{promo.maxDiscountVnd ? promo.maxDiscountVnd.toLocaleString('vi-VN') + '₫' : 'Không giới hạn'}</strong></span>
                        <span>Hết hạn: <strong className="text-foreground">{promo.validUntil ? new Date(promo.validUntil).toLocaleDateString('vi-VN') : 'Không giới hạn'}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-center font-mono font-bold text-sm bg-secondary rounded-lg px-3 py-2 tracking-widest">
                          {promo.code}
                        </code>
                        <Button size="sm" variant="outline" className="gap-1.5 shrink-0" onClick={() => {
                          navigator.clipboard.writeText(promo.code);
                          toast.success('Đã sao chép mã!');
                        }}>
                          <Copy className="w-3.5 h-3.5" />
                          Sao chép
                        </Button>
                      </div>
                    </CardContent>
                  </Card>;
              })}
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-card border border-border rounded-xl">
                <div className="text-sm text-muted-foreground mb-4 sm:mb-0">
                  Hiển thị {startIndex + 1}-{endIndex} trên tổng số {totalItems} khuyến mãi
                </div>
                <ClientPagination 
                  currentPage={currentPage} 
                  totalPages={totalPages} 
                  onPageChange={handlePageChange} 
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground border border-dashed rounded-xl border-border">
              Hiện tại không có chương trình khuyến mãi nào.
            </div>
          )}
        </div>

        {/* Expired */}
        {expired.length > 0 && <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-muted-foreground">
              <Clock className="w-5 h-5" /> Đã hết hạn
            </h2>
            <div className="grid gap-4 md:grid-cols-2 opacity-60">
              {expired.map(promo => {
            const Icon = Clock;
            return <Card key={promo.id} className="bg-card border-border">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <CardTitle className="text-base leading-tight line-through">
                            Mã ưu đãi {promo.code}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground mt-0.5">Hết hạn: {promo.validUntil ? new Date(promo.validUntil).toLocaleDateString('vi-VN') : '—'}</p>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>;
          })}
            </div>
          </div>}
      </div>
    );
}
