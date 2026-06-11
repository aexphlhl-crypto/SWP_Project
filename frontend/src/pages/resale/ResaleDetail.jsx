'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import resaleApi from '@/api/resaleApi';
import { useData } from '@/contexts/data-context'
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, MapPin, Armchair, Phone, User, Tag, ArrowLeft, AlertTriangle, RefreshCw, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navigate } from 'react-router-dom'; const notFound = () => <Navigate to='/404' />;
import { cn } from '@/lib/utils';
const TICKET_TYPE_LABELS = {
  standard: 'Thường',
  vip: 'VIP',
  couple: 'Couple'
};
const TICKET_TYPE_COLORS = {
  standard: 'bg-secondary text-foreground',
  vip: 'bg-amber-500/20 text-amber-400',
  couple: 'bg-pink-500/20 text-pink-400'
};
export default function ResaleDetailPage({
  params
}) {
  const {
    id
  } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    resaleApi.getActiveListings({ page: 0, size: 500 }).then(res => {
      if (res.success) {
        const found = res.data.content.find(l => l.id === id);
        setListing(found);
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="text-center py-20 text-muted-foreground">Đang tải chi tiết...</div>;
  }

  // BR-23: HIDDEN listings are not visible to Guest/Customer on public pages
  if (!listing || listing.status !== 'active') {
    return <Navigate to='/404' />;
  }
  const displayDate = listing.showDate ? new Date(listing.showDate).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }) : '—';
  const createdDate = listing.createdAt ? new Date(listing.createdAt).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : '—';
  return (
      <div className="container mx-auto px-4 py-10 max-w-2xl space-y-6">
        {/* Back */}
        <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2">
          <Link to="/resale">
            <ArrowLeft className="w-4 h-4" />
            Quay lại danh sách
          </Link>
        </Button>

        {/* Header */}
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-bold">Chi tiết vé bán lại</h1>
        </div>

        {/* Disclaimer (BR-13) */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-amber-400">Lưu ý quan trọng</p>
            <p className="text-muted-foreground mt-0.5">
              CineBook chỉ hỗ trợ đăng thông tin vé bán lại. Mọi giao dịch trao đổi
              là thỏa thuận trực tiếp giữa hai bên. CineBook không chịu trách nhiệm
              về tính xác thực của vé hoặc tranh chấp giao dịch.
            </p>
          </div>
        </div>

        {/* Ticket card */}
        <Card className="bg-card border-border overflow-hidden">
          {/* Movie header */}
          <div className="bg-primary/10 border-b border-dashed border-border p-6">
            <div className="flex items-start gap-4">
              <img src={listing.moviePoster} alt={listing.movieTitle} className="w-20 rounded-xl object-cover aspect-[2/3] shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <h2 className="font-bold text-xl leading-tight">{listing.movieTitle}</h2>
                <div className="flex gap-2 flex-wrap">
                  <Badge className={cn(TICKET_TYPE_COLORS[listing.ticketType])}>
                    {TICKET_TYPE_LABELS[listing.ticketType]}
                  </Badge>
                  <Badge className="bg-green-500/20 text-green-400">ACTIVE</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Đăng ngày {createdDate}
                </p>
              </div>
            </div>
          </div>

          {/* Perforation */}
          <div className="relative h-0 flex items-center">
            <div className="absolute -left-4 w-8 h-8 rounded-full bg-background border border-border" />
            <div className="w-full border-t border-dashed border-border" />
            <div className="absolute -right-4 w-8 h-8 rounded-full bg-background border border-border" />
          </div>

          <CardContent className="pt-6 pb-5 space-y-5">
            {/* Showtime details */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">
                Thông tin buổi chiếu
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[{
                icon: Calendar,
                label: 'Ngày chiếu',
                value: displayDate
              }, {
                icon: Clock,
                label: 'Giờ chiếu',
                value: listing.showTime
              }, {
                icon: MapPin,
                label: 'Rạp',
                value: listing.cinemaName
              }, {
                icon: Info,
                label: 'Phòng chiếu',
                value: listing.roomName
              }, {
                icon: Armchair,
                label: 'Ghế bán',
                value: listing.seatNumber
              }, {
                icon: RefreshCw,
                label: 'Bắp nước',
                value: listing.includesFnb ? 'Có kèm bắp nước' : 'Không'
              }, {
                icon: Tag,
                label: 'Loại ghế',
                value: TICKET_TYPE_LABELS[listing.ticketType]
              }].map(({
                icon: Icon,
                label,
                value
              }) => <div key={label} className={cn(label === 'Rạp' && 'col-span-2')}>
                    <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
                      <Icon className="w-3.5 h-3.5" />
                      <span className="text-xs">{label}</span>
                    </div>
                    <p className="font-semibold">{value}</p>
                  </div>)}
              </div>
            </div>

            <Separator className="bg-border" />

            {/* Price */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">
                Thông tin giá
              </p>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Giá gốc:</span>
                    <span className="line-through">
                      {listing.originalPrice.toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Giá bán lại:</span>
                    <span className="text-2xl font-bold text-primary">
                      {listing.resalePrice.toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                  {listing.resalePrice < listing.originalPrice && <Badge className="bg-green-500/20 text-green-400 text-xs">
                      Tiết kiệm{' '}
                      {(listing.originalPrice - listing.resalePrice).toLocaleString('vi-VN')}₫
                    </Badge>}
                </div>
              </div>
            </div>

            {/* Note */}
            {listing.note && <>
                <Separator className="bg-border" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">
                    Ghi chú từ người bán
                  </p>
                  <p className="text-sm text-muted-foreground italic">"{listing.note}"</p>
                </div>
              </>}

            <Separator className="bg-border" />

            {/* Seller info (BR-19) */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">
                Thông tin người bán
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{listing.sellerName}</p>
                    <p className="text-xs text-muted-foreground">Người bán</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pl-1">
                  <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                  <a to={`tel:${listing.sellerPhone}`} className="font-mono font-medium text-primary hover:underline">
                    {listing.sellerPhone}
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button asChild className="w-full gap-2" size="lg">
            <a to={`tel:${listing.sellerPhone}`}>
              <Phone className="w-4 h-4" />
              Liên hệ người bán: {listing.sellerPhone}
            </a>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/resale">Xem vé khác</Link>
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Hãy gặp mặt trực tiếp và kiểm tra vé kỹ trước khi thanh toán.
            CineBook không xử lý giao dịch và không chịu trách nhiệm tranh chấp.
          </p>
        </div>
      </div>
  );
}
