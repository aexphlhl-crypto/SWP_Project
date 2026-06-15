"use client";

import { Suspense } from 'react';
import { useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

import { useData } from '@/contexts/data-context'
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Download, Ticket, Home, Calendar, Clock, MapPin, Armchair, Loader2, ShoppingCart } from 'lucide-react';
const METHOD_LABELS = {
  card: 'Thẻ tín dụng',
  bank: 'Chuyển khoản ngân hàng',
  momo: 'Ví MoMo',
  zalopay: 'ZaloPay'
};
import { useAuth } from '@/contexts/auth-context';
function SuccessContent() {
  const [params] = useSearchParams();
  const router = useNavigate();
  const {
    isAuthenticated
  } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }
  const bookingId = params.get('bookingId') ?? `BK${Date.now().toString().slice(-6)}`;
  const movieId = params.get('movie') ?? '1';
  const seats = params.get('seats')?.split(',') ?? [];
  const room = params.get('room') ?? 'Phòng 1';
  const date = params.get('date') ?? '';
  const time = params.get('time') ?? '';
  const total = Number(params.get('total') ?? 0);
  const method = params.get('method') ?? 'card';

  // Parse concessions (UC-44)

  const concessionsParam = params.get('concessions');
  const concessions = concessionsParam ? (() => {
    try {
      return JSON.parse(concessionsParam);
    } catch {
      return [];
    }
  })() : [];
  const movie = movies.find(m => m.id === movieId) ?? movies[0];
  const displayDate = date ? new Date(date).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }) : 'Hôm nay';
  return <div className="container mx-auto px-4 py-12 max-w-lg">
      {/* Success icon */}
      <div className="flex flex-col items-center text-center mb-8 gap-3">
        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Đặt vé thành công!</h1>
          <p className="text-muted-foreground mt-1">
            Vé của bạn đã được xác nhận và gửi qua email
          </p>
        </div>
      </div>

      {/* Ticket card */}
      <Card className="bg-card border-border overflow-hidden">
        {/* Ticket top */}
        <div className="bg-primary/10 border-b border-dashed border-border px-6 py-5">
          <div className="flex items-start gap-4">
            <img src={movie.poster} alt={movie.title} className="w-16 rounded-lg object-cover aspect-[2/3] shrink-0" />
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-lg leading-tight">{movie.title}</h2>
              <p className="text-xs text-muted-foreground mt-1">{movie.ageRating} • {movie.duration} phút</p>
              <Badge className="mt-2 bg-green-500/20 text-green-500 text-xs">Đã xác nhận</Badge>
            </div>
          </div>
        </div>

        {/* Ticket perforation */}
        <div className="relative h-0 flex items-center">
          <div className="absolute -left-4 w-8 h-8 rounded-full bg-background border border-border" />
          <div className="w-full border-t border-dashed border-border" />
          <div className="absolute -right-4 w-8 h-8 rounded-full bg-background border border-border" />
        </div>

        {/* Ticket details */}
        <CardContent className="pt-6 pb-5 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[{
            icon: Calendar,
            label: 'Ngày chiếu',
            value: displayDate
          }, {
            icon: Clock,
            label: 'Suất chiếu',
            value: time
          }, {
            icon: MapPin,
            label: 'Phòng',
            value: room
          }, {
            icon: Armchair,
            label: 'Ghế',
            value: seats.join(', ')
          }].map(({
            icon: Icon,
            label,
            value
          }) => <div key={label}>
                <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-xs">{label}</span>
                </div>
                <p className="font-semibold">{value}</p>
              </div>)}
          </div>

          <Separator className="bg-border" />

          {/* Concession items (UC-44) */}
          {concessions.length > 0 && <>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Đồ ăn & Thức uống
                </p>
                {concessions.map(c => <div key={c.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{c.name} ×{c.qty}</span>
                    <span className="font-medium">{(c.price * c.qty).toLocaleString('vi-VN')}₫</span>
                  </div>)}
                <p className="text-xs text-muted-foreground italic">
                  Xuất trình QR này tại quầy concession để nhận đồ ăn
                </p>
              </div>
              <Separator className="bg-border" />
            </>}

          {/* QR placeholder */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-32 h-32 bg-secondary rounded-xl grid grid-cols-6 gap-0.5 p-2">
              {Array.from({
              length: 36
            }, (_, i) => <div key={i} className={`rounded-sm ${[0, 1, 5, 6, 7, 11, 30, 31, 35, 12, 18, 24, 13, 19, 25].includes(i) ? 'bg-foreground' : 'bg-transparent'}`} />)}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Xuất trình mã QR tại quầy để nhận vé
            </p>
          </div>

          <Separator className="bg-border" />

          {/* Payment summary */}
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Mã đặt vé</span>
              <span className="font-mono font-bold text-foreground">{bookingId}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Phương thức</span>
              <span className="text-foreground">{METHOD_LABELS[method] ?? method}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-1">
              <span>Tổng thanh toán</span>
              <span className="text-primary">{total.toLocaleString('vi-VN')}₫</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col gap-3 mt-6">
        <Button className="w-full gap-2" variant="outline">
          <Download className="w-4 h-4" />
          Tải vé PDF
        </Button>
        <Button className="w-full gap-2" asChild variant="secondary">
          <Link to="/my-tickets">
            <Ticket className="w-4 h-4" />
            Xem vé của tôi
          </Link>
        </Button>
        <Button className="w-full gap-2" asChild>
          <Link to="/">
            <Home className="w-4 h-4" />
            Về trang chủ
          </Link>
        </Button>
      </div>
    </div>;
}
export default function BookingSuccessPage() {
  const { movies } = useData();
  return 
      <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
        <SuccessContent />
      </Suspense>
    ;
}

