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
import bookingApi from '@/api/bookingApi';
import showtimeApi from '@/api/showtimeApi';
import { useAuth } from '@/contexts/auth-context';
const TYPE_LABELS = {
  drink: '🥤 Đồ uống',
  popcorn: '🍿 Bỏng ngô',
  combo: '🎁 Combo'
};
import { BookingWizardStep1 } from '@/components/booking/BookingWizardStep1';

function BookingContent() {
  const router = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { movies, cinemas, concessions, settings } = useData();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  // Derived states from URL
  const showtimeId = searchParams.get('showtimeId');
  const movieIdParam = searchParams.get('id') || searchParams.get('movieId'); // Can be id or in path
  const cinemaId = searchParams.get('cinema') || '1';
  const room = searchParams.get('room') || '';
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const time = searchParams.get('time') || '';

  const [step, setStep] = useState(showtimeId ? 2 : 1);
  const [movie, setMovie] = useState(movies.find(m => m.id.toString() === movieIdParam?.toString()) || null);

  const cinema = cinemas.find(c => c.id.toString() === cinemaId.toString()) || cinemas[0];
  const [concessionOpen, setConcessionOpen] = useState(false);
  const [pendingSeats, setPendingSeats] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [realConcessions, setRealConcessions] = useState([]);
  const [isLoadingConcessions, setIsLoadingConcessions] = useState(true);
  
  useEffect(() => {
    setIsLoadingConcessions(true);
    fnbApi.getAllProducts({ size: 100 })
      .then(res => {
        if (res.success && res.data?.content) {
          setRealConcessions(res.data.content);
        } else if (Array.isArray(res.data)) {
          // Handle case where backend returns array directly
          setRealConcessions(res.data);
        }
      })
      .catch(err => {
        console.error("Failed to load concessions:", err);
      })
      .finally(() => setIsLoadingConcessions(false));
  }, []);

  const activeItems = realConcessions.filter(i => (i.status || '').toLowerCase() === 'active');
  const tabs = ['drink', 'popcorn', 'combo'];
  const [activeTab, setActiveTab] = useState('drink');
  
  const isWeekend = new Date(date).getDay() === 0 || new Date(date).getDay() === 6;
  const isEvening = time ? parseInt(time.split(':')[0]) >= 18 : false;
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
        if (delta > 0) return [...prev, { item, quantity: 1 }];
        return prev;
      }
      const newQty = existing.quantity + delta;
      if (newQty <= 0) return prev.filter(o => o.item.id !== item.id);
      if (newQty > 10) {
        toast({
          title: 'Giới hạn số lượng',
          description: 'Bạn chỉ có thể chọn tối đa 10 phần cho mỗi món.',
          variant: 'destructive'
        });
        return prev;
      }
      return prev.map(o => o.item.id === item.id ? { ...o, quantity: newQty } : o);
    });
  };

  const concessionTotal = orderItems.reduce((acc, o) => acc + o.item.price * o.quantity, 0);
  const currentSeatTotal = pendingSeats.reduce((acc, s) => acc + s.price, 0);
  const currentSubtotal = currentSeatTotal + concessionTotal;
  // Tax is no longer calculated here, deferred to Payment page
  const currentTotal = currentSubtotal;

  const handleNextFromStep1 = (selection) => {
    const selectedMovie = movies.find(m => m.id.toString() === selection.movieId.toString());
    setMovie(selectedMovie);
    setSearchParams({
      id: selection.movieId,
      cinema: selection.cinemaId,
      room: selection.roomName,
      date: selection.date,
      time: selection.time,
      showtimeId: selection.showtimeId
    });
    setStep(2);
  };

  const handleConfirmSeats = selectedSeats => {
    setPendingSeats(selectedSeats);
    setConcessionOpen(true);
  };

  const proceedToPayment = withConcession => {
    const seatTotal = pendingSeats.reduce((acc, s) => acc + s.price, 0);
    const subtotal = seatTotal + (withConcession ? concessionTotal : 0);
    // Tax is deferred to Payment page
    
    const queryParams = new URLSearchParams({
      seats: pendingSeats.map(s => s.id).join(','),
      showtimeId: showtimeId || '',
      movie: movie?.id || '',
      cinema: cinemaId,
      room,
      date,
      time,
      total: subtotal.toString(),
      seatTotal: seatTotal.toString(),
      vatPercent: (settings?.vatPercent ?? 10).toString()
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

  const handleCancelTransaction = async () => {
    try {
      const pendingBookingId = sessionStorage.getItem('pendingBookingId');
      if (pendingBookingId) {
        await bookingApi.cancelBooking(pendingBookingId);
        sessionStorage.removeItem('pendingBookingId');
      } else if (showtimeId) {
        // Just release seats
        await showtimeApi.releaseAllHolds(showtimeId);
      }
      
      toast({
        title: 'Đã hủy giao dịch',
        description: 'Các ghế bạn chọn đã được nhả.',
      });
      
      setPendingSeats([]);
      setOrderItems([]);
      setConcessionOpen(false);
      setStep(1);
    } catch (err) {
      toast({
        title: 'Lỗi',
        description: 'Không thể hủy giao dịch, vui lòng thử lại sau.',
        variant: 'destructive'
      });
    }
  };

  const renderStepper = () => (
    <div className="flex items-center justify-center mb-8 px-4">
      <div className="flex items-center w-full max-w-3xl">
        <div className="flex flex-col items-center flex-1">
          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors", step >= 1 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground")}>1</div>
          <span className={cn("text-xs mt-2 font-medium", step >= 1 ? "text-primary" : "text-muted-foreground")}>Chọn suất chiếu</span>
        </div>
        <div className={cn("h-1 flex-1 transition-colors", step >= 2 ? "bg-primary" : "bg-secondary")} />
        <div className="flex flex-col items-center flex-1">
          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors", step >= 2 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground")}>2</div>
          <span className={cn("text-xs mt-2 font-medium", step >= 2 ? "text-primary" : "text-muted-foreground")}>Chọn ghế ngồi</span>
        </div>
        <div className={cn("h-1 flex-1 transition-colors", concessionOpen ? "bg-primary" : "bg-secondary")} />
        <div className="flex flex-col items-center flex-1">
          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors", concessionOpen ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground")}>3</div>
          <span className={cn("text-xs mt-2 font-medium", concessionOpen ? "text-primary" : "text-muted-foreground")}>Thanh toán</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => step === 2 ? setStep(1) : router(-1)}>
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Đặt vé xem phim</h1>
            {step === 2 && movie && (
              <p className="text-muted-foreground">
                {movie.title} - {time}, {new Date(date).toLocaleDateString('vi-VN')}
              </p>
            )}
          </div>
        </div>
      </div>

      {renderStepper()}

      {step === 1 && (
        <BookingWizardStep1 
          movies={movies} 
          cinemas={cinemas} 
          initialMovieId={movieIdParam} 
          initialDate={date}
          onNext={handleNextFromStep1} 
        />
      )}

      {step === 2 && movie && (
        <SeatSelection 
          showtimeId={showtimeId} 
          movieId={movie.id} 
          movieTitle={movie.title} 
          moviePoster={movie.poster} 
          cinemaName={cinema?.name} 
          roomName={room} 
          showDate={date} 
          showTime={time} 
          pricing={dynamicPricing} 
          onConfirm={handleConfirmSeats} 
          onCancel={handleCancelTransaction} 
          maxSeats={8} 
        />
      )}

      {/* Concession Sheet */}
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
            {tabs.map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)} 
                className={cn('px-4 py-1.5 rounded-full text-sm font-medium transition-colors', activeTab === tab ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground')}
              >
                {TYPE_LABELS[tab]}
              </button>
            ))}
          </div>

          {/* Items grid */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {isLoadingConcessions ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (() => {
              const filtered = activeItems.filter(i => {
                const itemType = (i.category || i.type || '').toLowerCase();
                return itemType === activeTab;
              });
              if (filtered.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <ShoppingCart className="w-10 h-10 mb-3 opacity-30" />
                    <p className="text-sm">Không có sản phẩm nào</p>
                  </div>
                );
              }
              return (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {filtered.map(item => {
                    const qty = getQty(item.id);
                    return (
                      <div key={item.id} className={cn('flex items-center gap-2 p-2 rounded-xl border transition-colors', qty > 0 ? 'border-primary bg-primary/5' : 'border-border bg-secondary/30')}>
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                            <ShoppingCart className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs leading-tight">{item.name}</p>
                          {item.description && <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{item.description}</p>}
                          <p className="text-xs font-bold text-primary mt-1">{Number(item.price).toLocaleString('vi-VN')}₫</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {qty > 0 ? (
                            <>
                              <button onClick={() => changeQty(item, -1)} className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center hover:bg-border transition-colors"><Minus className="w-3 h-3" /></button>
                              <span className="w-4 text-center text-[10px] font-bold">{qty}</span>
                              <button onClick={() => changeQty(item, 1)} className="w-6 h-6 rounded-full bg-primary flex items-center justify-center hover:bg-primary/80 transition-colors text-primary-foreground"><Plus className="w-3 h-3" /></button>
                            </>
                          ) : (
                            <button onClick={() => changeQty(item, 1)} className="w-6 h-6 rounded-full bg-primary flex items-center justify-center hover:bg-primary/80 transition-colors text-primary-foreground"><Plus className="w-3 h-3" /></button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* Order summary */}
          <SheetFooter className="flex-col gap-3 px-6 py-5 border-t border-border shrink-0">
            <div className="w-full space-y-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Chi tiết thanh toán</p>
              {orderItems.length > 0 && (
                <div className="space-y-1.5">
                  {orderItems.map(o => (
                    <div key={o.item.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <button onClick={() => setOrderItems(prev => prev.filter(x => x.item.id !== o.item.id))} className="text-muted-foreground hover:text-destructive transition-colors shrink-0"><X className="w-3.5 h-3.5" /></button>
                        <span className="truncate">{o.item.name}</span>
                        <Badge variant="secondary" className="text-xs shrink-0">×{o.quantity}</Badge>
                      </div>
                      <span className="font-medium shrink-0 ml-2">{(o.item.price * o.quantity).toLocaleString('vi-VN')}₫</span>
                    </div>
                  ))}
                  <Separator className="bg-border my-2" />
                </div>
              )}
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm font-medium"><span>Tiền vé ({pendingSeats.length} ghế)</span><span>{currentSeatTotal.toLocaleString('vi-VN')}₫</span></div>
                {orderItems.length > 0 && <div className="flex justify-between text-sm font-medium"><span>Tiền bắp nước</span><span>{concessionTotal.toLocaleString('vi-VN')}₫</span></div>}
                <div className="flex justify-between font-bold text-lg pt-2"><span>Tạm tính</span><span className="text-primary">{currentTotal.toLocaleString('vi-VN')}₫</span></div>
              </div>
            </div>

            <div className="flex gap-3 w-full mt-2">
              <Button variant="outline" className="flex-1 gap-2" onClick={() => proceedToPayment(false)}><SkipForward className="w-4 h-4" /> Bỏ qua (Chỉ mua vé)</Button>
              <Button className="flex-1 gap-2" onClick={() => proceedToPayment(true)}><ShoppingCart className="w-4 h-4" /> {orderItems.length > 0 ? `Thanh toán tất cả` : 'Thanh toán'}</Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
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
