'use client';


import { Calendar, Clock, MapPin, Armchair, Ticket, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { BookingTimer } from './booking-timer';
export function BookingSummary({
  movieTitle,
  moviePoster,
  cinemaName,
  roomName,
  showDate,
  showTime,
  selectedSeats,
  onConfirm,
  onCancel,
  onTimerExpire,
  isConfirming = false
}) {
  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  const seatsByType = {
    standard: selectedSeats.filter(s => s.type === 'standard'),
    vip: selectedSeats.filter(s => s.type === 'vip'),
    couple: selectedSeats.filter(s => s.type === 'couple')
  };
  const formatPrice = price => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };
  const formatDate = dateStr => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  return <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Timer */}
      <div className="p-4 border-b border-border">
        <BookingTimer 
          initialMinutes={15} 
          onExpire={onTimerExpire} 
          isStarted={selectedSeats.length > 0}
        />
      </div>

      {/* Movie Info */}
      <div className="p-4">
        <div className="flex gap-4">
          <div className="relative w-20 h-28 rounded-lg overflow-hidden flex-shrink-0">
            <img src={moviePoster} alt={movieTitle} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg leading-tight line-clamp-2">{movieTitle}</h3>
            <div className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-primary flex-shrink-0" />
                <span className="truncate">{cinemaName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Ticket className="size-4 text-primary flex-shrink-0" />
                <span>{roomName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-primary flex-shrink-0" />
                <span>{formatDate(showDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-primary flex-shrink-0" />
                <span className="font-medium text-foreground">{showTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Selected Seats */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Armchair className="size-5 text-primary" />
          <h4 className="font-semibold">Ghế đã chọn</h4>
          <Badge variant="secondary" className="ml-auto">
            {selectedSeats.length} / 8 ghế
          </Badge>
        </div>

        {selectedSeats.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">
            Chưa chọn ghế nào
          </p> : <div className="space-y-3">
            {/* Standard seats */}
            {seatsByType.standard.length > 0 && <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-sm bg-emerald-600" />
                  <span>Ghế Thường</span>
                  <span className="text-muted-foreground">
                    ({seatsByType.standard.map(s => s.id).join(', ')})
                  </span>
                </div>
                <span>{formatPrice(seatsByType.standard.reduce((sum, s) => sum + s.price, 0))}</span>
              </div>}

            {/* VIP seats */}
            {seatsByType.vip.length > 0 && <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-sm bg-purple-600" />
                  <span>Ghế VIP</span>
                  <span className="text-muted-foreground">
                    ({seatsByType.vip.map(s => s.id).join(', ')})
                  </span>
                </div>
                <span>{formatPrice(seatsByType.vip.reduce((sum, s) => sum + s.price, 0))}</span>
              </div>}

            {/* Couple seats */}
            {seatsByType.couple.length > 0 && <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-sm bg-pink-600" />
                  <span>Ghế Đôi</span>
                  <span className="text-muted-foreground">
                    ({seatsByType.couple.map(s => s.id).join(', ')})
                  </span>
                </div>
                <span>{formatPrice(seatsByType.couple.reduce((sum, s) => sum + s.price, 0))}</span>
              </div>}
          </div>}
      </div>

      <Separator />

      {/* Total */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-muted-foreground">Tổng tiền</span>
          <span className="text-2xl font-bold text-primary">{formatPrice(totalPrice)}</span>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel}>
            Hủy
          </Button>
          <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={onConfirm} disabled={selectedSeats.length === 0 || isConfirming}>
            <CreditCard className="size-4 mr-2" />
            {isConfirming ? 'Đang xử lý...' : 'Tiếp tục'}
          </Button>
        </div>
      </div>
    </div>;
}
