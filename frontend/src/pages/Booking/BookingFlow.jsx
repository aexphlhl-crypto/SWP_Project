'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate, useSearchParams } from 'react-router-dom';

import { SeatSelection } from '@/components/booking/seat-selection';
import { useData } from '@/contexts/data-context'
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { ArrowLeft, AlertTriangle, Loader2, ShoppingCart, Plus, Minus, X, SkipForward, Clock } from 'lucide-react';
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
  const isProceedingToPayment = useRef(false);

  useEffect(() => {
    return () => {
      // Component unmounting (user navigating away or closing tab)
      // Release holds unless we are intentionally proceeding to payment
      if (!isProceedingToPayment.current && showtimeId) {
        const token = localStorage.getItem('accessToken');
        if (token) {
          // Use fetch with keepalive so it runs even if tab is closing
          // We use the backend URL directly, assuming standard structure or fallback
          const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
          fetch(`${apiUrl}/showtimes/${showtimeId}/holds`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            keepalive: true
          }).catch(e => console.error("Failed to release holds on unmount", e));
        }
      }
    };
  }, [showtimeId]);
  
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
  const eveningTime = settings?.eveningSurchargeTime || '17:00';
  const isEvening = time ? time >= eveningTime : false;
  const dayMultiplier = isWeekend ? 1 + (settings?.weekendSurcharge ?? 20) / 100 : 1;
  const timeMultiplier = isEvening ? 1 + (settings?.eveningSurcharge ?? 10) / 100 : 1;

  const basePrice = settings?.basePrice ?? 75000;
  const seatVipMultiplier = settings?.seatVipMultiplier ?? 1.5;
  const seatCoupleMultiplier = settings?.seatCoupleMultiplier ?? 2.0;

  const dynamicPricing = {
    standard: basePrice * dayMultiplier * timeMultiplier,
    vip: basePrice * seatVipMultiplier * dayMultiplier * timeMultiplier,
    couple: basePrice * seatCoupleMultiplier * dayMultiplier * timeMultiplier
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
      seatIds: pendingSeats.map(s => s.seatId).join(','),
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
    isProceedingToPayment.current = true;
    router(`/payment?${queryParams.toString()}`);
  };

  const handleCancelTransaction = async () => {
    try {
      // Always release seat holds first
      if (showtimeId) {
        await showtimeApi.releaseAllHolds(showtimeId);
      }

      // Then cancel the pending booking if one exists
      const pendingBookingId = sessionStorage.getItem('pendingBookingId');
      if (pendingBookingId) {
        await bookingApi.cancelBooking(pendingBookingId);
        sessionStorage.removeItem('pendingBookingId');
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
      console.error('handleCancelTransaction error:', err);
      // Still reset UI even if API fails
      setPendingSeats([]);
      setOrderItems([]);
      setConcessionOpen(false);
      setStep(1);
      toast({
        title: 'Ghế đã được nhả',
        description: 'Đã hủy giao dịch.',
      });
    }
  };

  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    if (step === 2 && pendingSeats.length > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            toast({
              title: 'Hết thời gian giữ ghế',
              description: 'Phiên đặt vé đã hết hạn. Vui lòng chọn lại ghế.',
              variant: 'destructive'
            });
            handleCancelTransaction();
            return 600;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setTimeLeft(600);
    }
  }, [step, pendingSeats]);

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
    <div className="min-h-screen bg-background text-foreground pb-12">
      {/* ── Top Header Navigation & Stepper ── */}
      <header className="border-b border-border bg-card/85 backdrop-blur-md sticky top-0 z-50">
        <div className="container max-w-[1400px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-foreground"
              onClick={async () => {
                if (step === 2) {
                  if (showtimeId) {
                    try {
                      await showtimeApi.releaseAllHolds(showtimeId);
                    } catch (e) {
                      console.error('Failed to release holds on back', e);
                    }
                  }
                  setPendingSeats([]);
                  setOrderItems([]);
                  setStep(1);
                } else {
                  router(-1);
                }
              }}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <span className="font-extrabold text-foreground text-lg tracking-tight">Đặt Vé Trực Tuyến</span>
          </div>
 
          {/* Stepper progress indicator */}
          <div className="hidden md:flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-colors", step >= 1 ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground/60")}>1</span>
              <span className={cn("font-bold", step >= 1 ? "text-primary" : "text-muted-foreground/60")}>Chọn Vé</span>
            </div>
            <div className={cn("h-[1px] w-8 transition-colors", step >= 2 ? "bg-primary" : "bg-border")} />
            <div className="flex items-center gap-2">
              <span className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-colors", step >= 2 ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground/60")}>2</span>
              <span className={cn("font-bold", step >= 2 ? "text-primary" : "text-muted-foreground/60")}>Bắp Nước (Snacks)</span>
            </div>
            <div className={cn("h-[1px] w-8 transition-colors", concessionOpen ? "bg-primary" : "bg-border")} />
            <div className="flex items-center gap-2">
              <span className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-colors", concessionOpen ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground/60")}>3</span>
              <span className={cn("font-bold", concessionOpen ? "text-primary" : "text-muted-foreground/60")}>Thanh Toán</span>
            </div>
          </div>
 
          <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground/80">
            <span>VI | EN</span>
          </div>
        </div>
      </header>

      {/* Floating countdown timer */}
      {step === 2 && pendingSeats.length > 0 && (
        <div className="flex justify-center mt-6">
          <div className="flex items-center gap-2 border border-primary/20 bg-primary/5 text-primary rounded-full px-5 py-1.5 text-xs font-bold shadow-lg shadow-primary/5 animate-pulse">
            <Clock className="w-4 h-4" />
            Thời gian giữ ghế: {formatTime(timeLeft)}
          </div>
        </div>
      )}

      {/* ── Main content area ── */}
      <main className="container max-w-[1400px] mx-auto px-4 py-8">
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Column (2/3 width): Seat Selection Grid */}
            <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-2xl relative">
              <div className="mb-6">
                <h2 className="text-xl font-black text-foreground tracking-tight border-l-4 border-primary pl-3">Chọn ghế ngồi</h2>
                <p className="text-xs text-muted-foreground mt-1 uppercase font-bold tracking-wider">
                  {movie.title} • {cinema?.name} • {room} • {time}
                </p>
              </div>



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
                showSummary={false} /* Hide internal summary, handled by BookingFlow */
                selectedSeats={pendingSeats}
                setSelectedSeats={setPendingSeats}
              />
            </div>

            {/* Right Column (1/3 width): Concessions & Bill Summary side-by-side */}
            <div className="lg:col-span-1 space-y-8">
              
              {/* Concessions Widget (Snacks / Combo Selector) */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Dịch vụ Bắp & Nước</h3>
                  <span className="text-[10px] text-muted-foreground/80 font-semibold bg-muted rounded px-2 py-0.5">Snacks</span>
                </div>

                <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                  {isLoadingConcessions ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : activeItems.length === 0 ? (
                    <div className="text-center text-xs text-zinc-500 py-6">Không tìm thấy bắp nước</div>
                  ) : (
                    activeItems.slice(0, 5).map(item => {
                      const qty = getQty(item.id);
                      return (
                        <div key={item.id} className={cn("flex gap-3 items-center border rounded-xl p-3 transition-all", qty > 0 ? "border-primary/25 bg-primary/5" : "border-border bg-muted/40 hover:border-border/80")}>
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-muted shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">🍿</div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-foreground leading-tight truncate">{item.name}</h4>
                            <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{item.description}</p>
                            <p className="text-xs font-bold text-primary mt-1">{new Intl.NumberFormat('vi-VN').format(item.price)}₫</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => changeQty(item, -1)}
                              className="w-6 h-6 rounded-full bg-muted border border-input flex items-center justify-center text-foreground hover:bg-muted/80"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold text-foreground w-4 text-center">{qty}</span>
                            <button
                              type="button"
                              onClick={() => changeQty(item, 1)}
                              className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold hover:bg-primary/90"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Order Summary Widget */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider border-b border-border pb-3">Chi tiết hóa đơn</h3>
                
                {/* Seats Selected list */}
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-muted-foreground font-semibold">Ghế chọn:</span>
                  {pendingSeats.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {pendingSeats.map(s => (
                        <Badge key={s.id} className="bg-primary hover:bg-primary text-primary-foreground font-bold text-[10px] rounded px-2 py-0.5">
                          {s.label}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground/60 italic">Chưa chọn ghế</span>
                  )}
                </div>
 
                {/* Sub items cost break-down */}
                <div className="space-y-2.5 pt-2 border-t border-border text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Vé xem phim ({pendingSeats.length} ghế)</span>
                    <span className="font-bold text-foreground">{new Intl.NumberFormat('vi-VN').format(currentSeatTotal)}₫</span>
                  </div>
                  {orderItems.length > 0 && (
                    <div className="space-y-1.5 pl-2 border-l border-border">
                      {orderItems.map(o => (
                        <div key={o.item.id} className="flex justify-between text-[11px] text-muted-foreground/80">
                          <span>{o.item.name} (x{o.quantity})</span>
                          <span>{new Intl.NumberFormat('vi-VN').format(o.item.price * o.quantity)}₫</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {orderItems.length > 0 && (
                    <div className="flex justify-between text-[11px] pt-1">
                      <span className="text-muted-foreground">Tiền bắp nước:</span>
                      <span className="font-bold text-foreground">{new Intl.NumberFormat('vi-VN').format(concessionTotal)}₫</span>
                    </div>
                  )}
                </div>
 
                {/* Subtotal + Tax VAT 10% */}
                <div className="border-t border-border pt-3.5 space-y-2 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tạm tính (chưa thuế):</span>
                    <span>{new Intl.NumberFormat('vi-VN').format(currentSubtotal)}₫</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>VAT (10%):</span>
                    <span>{new Intl.NumberFormat('vi-VN').format(Math.round(currentSubtotal * 0.1))}₫</span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-foreground border-t border-border pt-3">
                    <span>Tổng cộng:</span>
                    <span className="text-xl text-primary font-black">
                      {new Intl.NumberFormat('vi-VN').format(currentSubtotal + Math.round(currentSubtotal * 0.1))}₫
                    </span>
                  </div>
                </div>
 
                {/* Confirm transaction CTA */}
                <div className="pt-2">
                  <Button
                    disabled={pendingSeats.length === 0}
                    onClick={() => proceedToPayment(true)}
                    className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-black h-12 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Tiến hành Thanh toán
                  </Button>
                  
                  <button
                    type="button"
                    onClick={handleCancelTransaction}
                    className="w-full text-center text-xs text-muted-foreground hover:text-foreground underline font-medium mt-3"
                  >
                    Hủy giao dịch & Nhả ghế
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
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
