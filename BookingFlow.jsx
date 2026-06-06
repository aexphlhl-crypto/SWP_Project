'use client';

import { Suspense, useState, useEffect } from 'react';
import { useNavigate, Navigate, useSearchParams } from 'react-router-dom';

import { SeatSelection } from '@/components/booking/seat-selection';
import { useData } from '@/contexts/data-context'
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { ArrowLeft, AlertTriangle, Loader2, ShoppingCart, Plus, Minus, X, SkipForward } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import fnbApi from '@/api/fnbApi';
import { useAuth } from '@/contexts/auth-context';
const TYPE_LABELS = {
  drink: '🥤 Đồ uống',
  popcorn: '🍿 Bỏng ngô',
  combo: '🎁 Combo'
};
function BookingContent() {
  const router = useNavigate();
  const [searchParams] = useSearchParams();
  const { movies, cinemas, concessions, settings } = useData();
  const {
    toast
  } = useToast();
  const {
    isAuthenticated
  } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }
  const cinemaId = searchParams.get('cinema') || '1';
  const room = searchParams.get('room') || 'Phòng 1';
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const time = searchParams.get('time') || '19:30';
  const showtimeId = searchParams.get('showtimeId');
  const movie = movies.find(m => m.id === searchParams.get('id')) || movies[0];
  const cinema = cinemas.find(c => c.id === cinemaId) || cinemas[0];
  const [concessionOpen, setConcessionOpen] = useState(false);
  const [pendingSeats, setPendingSeats] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [realConcessions, setRealConcessions] = useState([]);
  
  useEffect(() => {
    fnbApi.getAllProducts({ size: 100 })
      .then(res => {
        if (res.success && res.data?.content) {
          setRealConcessions(res.data.content);
        }
      })
      .catch(err => console.error("Failed to load concessions", err));
  }, []);

  const activeItems = realConcessions.length > 0 
    ? realConcessions.filter(i => i.status === 'Available')
    : concessions.filter(i => i.status === 'active');
  const tabs = ['drink', 'popcorn', 'combo'];
  const [activeTab, setActiveTab] = useState('drink');
  
  // Calculate dynamic pricing based on time/day
  const isWeekend = new Date(date).getDay() === 0 || new Date(date).getDay() === 6;
  const isEvening = parseInt(time.split(':')[0]) >= 18;
  let surchargeMultiplier = 1;
  if (isWeekend) surchargeMultiplier += (settings?.weekendSurcharge ?? 20) / 100;
  if (isEvening) surchargeMultiplier += (settings?.eveningSurcharge ?? 10) / 100;
  
  const dynamicPricing = {
    standard: 75000 * surchargeMultiplier,
    vip: 100000 * surchargeMultiplier,
    couple: 180000 * surchargeMultiplier
  };

  const getQty = itemId => orderItems.find(o => o.item.id === itemId)?.quantity ?? 0;
  const changeQty = (item, delta) => {
    setOrderItems(prev => {
      const existing = prev.find(o => o.item.id === item.id);
      if (!existing) {
        if (delta > 0) return [...prev, {
          item,
          quantity: 1
        }];
        return prev;
      }
      const newQty = existing.quantity + delta;
      if (newQty <= 0) return prev.filter(o => o.item.id !== item.id);
      return prev.map(o => o.item.id === item.id ? {
        ...o,
        quantity: newQty
      } : o);
    });
  };
  const concessionTotal = orderItems.reduce((acc, o) => acc + o.item.price * o.quantity, 0);
  const currentSeatTotal = pendingSeats.reduce((acc, s) => acc + s.price, 0);
  const currentSubtotal = currentSeatTotal + concessionTotal;
  const currentVatAmount = currentSubtotal * ((settings?.vatPercent ?? 8) / 100);
  const currentTotal = currentSubtotal + currentVatAmount;

  const handleConfirm = selectedSeats => {
    toast({
      title: 'Đã chọn ghế!',
      description: `${selectedSeats.length} ghế: ${selectedSeats.map(s => s.id).join(', ')}`
    });
    setPendingSeats(selectedSeats);
    setConcessionOpen(true);
  };
  const proceedToPayment = withConcession => {
    const seatTotal = pendingSeats.reduce((acc, s) => acc + s.price, 0);
    const subtotal = seatTotal + (withConcession ? concessionTotal : 0);
    const vatAmount = subtotal * ((settings?.vatPercent ?? 8) / 100);
    const total = subtotal + vatAmount;
    
    const queryParams = new URLSearchParams({
      seats: pendingSeats.map(s => s.id).join(','),
      showtimeId: showtimeId || '',
      movie: movie.id,
      cinema: cinemaId,
      room,
      date,
      time,
      total: total.toString()
    });
    if (withConcession && orderItems.length > 0) {
      queryParams.set('concessions', JSON.stringify(orderItems.map(o => ({
        id: o.item.id,
        name: o.item.name,
        price: o.item.price,
        qty: o.quantity
      }))));
    }
    router(`/payment?${queryParams.toString()}`);
  };
  if (!movie) {
    return <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <AlertTriangle className="size-16 mx-auto text-amber-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Không tìm thấy phim</h1>
          <p className="text-muted-foreground mb-6">
            Phim bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
          <Button asChild>
            <Link to="/movies">Quay lại danh sách phim</Link>
          </Button>
        </div>
      </div>;
  }
  return <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router(-1)}>
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Chọn ghế</h1>
          <p className="text-muted-foreground">
            {movie.title} - {time},{' '}
            {new Date(date).toLocaleDateString('vi-VN')}
          </p>
        </div>
      </div>

      {/* Seat Selection */}
      <SeatSelection showtimeId={showtimeId} movieId={movie.id} movieTitle={movie.title} moviePoster={movie.poster} cinemaName={cinema.name} roomName={room} showDate={date} showTime={time} pricing={dynamicPricing} onConfirm={handleConfirm} onCancel={() => router(-1)} />

      {/* Concession Sheet (UC-43) */}
      <Sheet open={concessionOpen} onOpenChange={setConcessionOpen}>
        <SheetContent side="bottom" className="h-[90vh] flex flex-col bg-card border-t border-border p-0">
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
            <SheetTitle className="flex items-center gap-2 text-xl">
              <ShoppingCart className="w-5 h-5 text-primary" />
              Thêm đồ ăn & thức uống
            </SheetTitle>
            <p className="text-sm text-muted-foreground">
              Chọn thêm để hoàn thiện trải nghiệm xem phim của bạn
            </p>
          </SheetHeader>

          {/* Tabs */}
          <div className="flex gap-2 px-6 pt-4 shrink-0">
            {tabs.map(tab => <button key={tab} onClick={() => setActiveTab(tab)} className={cn('px-4 py-1.5 rounded-full text-sm font-medium transition-colors', activeTab === tab ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground')}>
                {TYPE_LABELS[tab]}
              </button>)}
          </div>

          {/* Items grid */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {activeItems.filter(i => {
                const typeMap = { drink: 'Drink', popcorn: 'Snack', combo: 'Combo' };
                return i.type === typeMap[activeTab] || i.type === activeTab;
              }).map(item => {
              const qty = getQty(item.id);
              return <div key={item.id} className={cn('flex items-center gap-2 p-2 rounded-xl border transition-colors', qty > 0 ? 'border-primary bg-primary/5' : 'border-border bg-secondary/30')}>
                      <img src={item.imageUrl || item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs leading-tight">{item.name}</p>
                        {item.description && <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                            {item.description}
                          </p>}
                        <p className="text-xs font-bold text-primary mt-1">
                          {item.price.toLocaleString('vi-VN')}₫
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {qty > 0 ? <>
                            <button onClick={() => changeQty(item, -1)} className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center hover:bg-border transition-colors">
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-4 text-center text-[10px] font-bold">{qty}</span>
                            <button onClick={() => changeQty(item, 1)} className="w-6 h-6 rounded-full bg-primary flex items-center justify-center hover:bg-primary/80 transition-colors text-primary-foreground">
                              <Plus className="w-3 h-3" />
                            </button>
                          </> : <button onClick={() => changeQty(item, 1)} className="w-6 h-6 rounded-full bg-primary flex items-center justify-center hover:bg-primary/80 transition-colors text-primary-foreground">
                            <Plus className="w-3 h-3" />
                          </button>}
                      </div>
                    </div>;
            })}
            </div>
          </div>

          {/* Order summary + actions */}
          <SheetFooter className="flex-col gap-3 px-6 py-5 border-t border-border shrink-0">
            <div className="w-full space-y-2">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Chi tiết thanh toán
                </p>
                {orderItems.length > 0 && <div className="space-y-1.5">
                  {orderItems.map(o => <div key={o.item.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <button onClick={() => setOrderItems(prev => prev.filter(x => x.item.id !== o.item.id))} className="text-muted-foreground hover:text-destructive transition-colors shrink-0">
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <span className="truncate">{o.item.name}</span>
                        <Badge variant="secondary" className="text-xs shrink-0">×{o.quantity}</Badge>
                      </div>
                      <span className="font-medium shrink-0 ml-2">
                        {(o.item.price * o.quantity).toLocaleString('vi-VN')}₫
                      </span>
                    </div>)}
                  <Separator className="bg-border my-2" />
                </div>}
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Tiền vé ({pendingSeats.length} ghế)</span>
                    <span>{currentSeatTotal.toLocaleString('vi-VN')}₫</span>
                  </div>
                  {orderItems.length > 0 && <div className="flex justify-between text-sm font-medium">
                    <span>Tiền bắp nước</span>
                    <span>{concessionTotal.toLocaleString('vi-VN')}₫</span>
                  </div>}
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Thuế VAT ({settings?.vatPercent ?? 8}%)</span>
                    <span>{currentVatAmount.toLocaleString('vi-VN')}₫</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2">
                    <span>Tổng thanh toán</span>
                    <span className="text-primary">{currentTotal.toLocaleString('vi-VN')}₫</span>
                  </div>
                </div>
              </div>

            <div className="flex gap-3 w-full mt-2">
              <Button variant="outline" className="flex-1 gap-2" onClick={() => proceedToPayment(false)}>
                <SkipForward className="w-4 h-4" />
                Bỏ qua (Chỉ mua vé)
              </Button>
              <Button className="flex-1 gap-2" onClick={() => proceedToPayment(true)}>
                <ShoppingCart className="w-4 h-4" />
                {orderItems.length > 0 ? `Thanh toán tất cả` : 'Thanh toán'}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>;
}
export default function BookingPage(_props) {
  return (
      <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>}>
        <BookingContent />
      </Suspense>
    );
}
