"use client";

import { useState, Suspense, useEffect } from 'react';
import { useNavigate, Navigate, useSearchParams } from 'react-router-dom';

import { useData } from '@/contexts/data-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, Building2, Smartphone, Loader2, Lock, Tag, ShoppingCart, Landmark, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import bookingApi from '@/api/bookingApi';
import promoApi from '@/api/promoApi';
import paymentApi from '@/api/paymentApi';
import { toast } from 'sonner';

// VNPay logo inline SVG
const VNPayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#0066CC"/>
    <text x="50%" y="58%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">VN</text>
  </svg>
);

const PAYMENT_METHODS = [{
  id: 'vnpay',
  label: 'VNPay',
  icon: VNPayIcon,
  desc: 'Thẻ ATM, Visa, MasterCard, QR Code'
}];

function PaymentContent() {
  const router = useNavigate();
  const [params] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { movies, cinemas } = useData();

  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }
  const subtotal = Number(params.get('total') ?? 0); // This is now PRE-TAX subtotal
  const seatTotal = Number(params.get('seatTotal') ?? 0);
  const vatPercent = Number(params.get('vatPercent') ?? 10);
  const seats = params.get('seats')?.split(',') || [];
  const seatIdsParam = params.get('seatIds')?.split(',') || [];
  const showtimeId = params.get('showtimeId') ?? '1';
  const movieId = params.get('movie') ?? '1';
  const cinemaId = params.get('cinema') ?? '1';
  const cinema = cinemas.find(c => c.id === cinemaId)?.name ?? 'Rạp CineBook';
  const room = params.get('room') ?? 'Phòng 1';
  const date = params.get('date') ?? '';
  const time = params.get('time') ?? '';
  
  // Parse concessions
  const concessionsParam = params.get('concessions');
  const concessions = concessionsParam ? (() => {
    try {
      return JSON.parse(concessionsParam);
    } catch {
      return [];
    }
  })() : [];
  const concessionTotal = concessions.reduce((acc, c) => acc + c.price * c.qty, 0);
  const movie = movies.find(m => m.id === movieId) ?? movies[0];
  const [method, setMethod] = useState('vnpay');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoData, setPromoData] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [processing, setProcessing] = useState(false);
  const { user } = useAuth();
  
  const [calcResults, setCalcResults] = useState(null);
  const [isLoadingCalc, setIsLoadingCalc] = useState(false);

  const fetchCalculation = async (appliedCode) => {
    setIsLoadingCalc(true);
    setPromoError('');
    try {
      const payload = {
        customerId: user?.userId || user?.id,
        showtimeId: Number(showtimeId),
        seatIds: seatIdsParam.map(s => Number(s)),
        fnbItems: concessions.map(c => ({
          productId: Number(c.id),
          quantity: Number(c.qty)
        })),
        promoCode: appliedCode || null
      };
      const res = await bookingApi.calculateBooking(payload);
      if (res.success && res.data) {
        setCalcResults(res.data);
        if (appliedCode) {
          setPromoApplied(true);
          setPromoData({
            discountType: res.data.promoDiscountType,
            discountValue: res.data.promoDiscountValue
          });
          toast.success(`Đã áp dụng mã ${appliedCode}.`);
        } else {
          setPromoApplied(false);
          setPromoData(null);
        }
      }
    } catch (err) {
      setPromoError(err.error?.message || err.message || 'Mã không hợp lệ hoặc không đủ điều kiện.');
      setPromoApplied(false);
      setPromoData(null);
      if (appliedCode) {
        // Recalculate without promo code
        fetchCalculation(null);
      }
    } finally {
      setIsLoadingCalc(false);
    }
  };

  useEffect(() => {
    if (user && showtimeId && seats.length > 0) {
      fetchCalculation(null);
    }
  }, [user, showtimeId, params.get('seats'), concessionsParam]);

  const discount = calcResults ? calcResults.discountAmount : 0;
  const calculatedVatAmount = calcResults ? calcResults.vatAmount : Math.round(subtotal * (vatPercent / 100));
  const finalTotal = calcResults ? calcResults.totalAmount : (subtotal + calculatedVatAmount);
  
  const displaySeatTotal = calcResults ? calcResults.ticketTotal : (subtotal - concessionTotal);
  const displayConcessionTotal = calcResults ? calcResults.fnbTotal : concessionTotal;
  const displayVatPercent = calcResults ? Math.round(calcResults.vatRate * 100) : vatPercent;

  const handleApplyPromo = () => {
    if (!promoCode) return;
    fetchCalculation(promoCode);
  };

  const handlePayment = async () => {
    setProcessing(true);
    try {
      // Step 1: Tạo booking trước
      const payload = {
        customerId: user?.userId || user?.id,
        showtimeId: Number(showtimeId),
        seatIds: seatIdsParam.map(s => Number(s)),
        fnbItems: concessions.map(c => ({
          productId: Number(c.id),
          quantity: Number(c.qty)
        }))
      };
      
      if (promoApplied && promoCode) {
        payload.promoCode = promoCode;
      }
      
      const res = await bookingApi.createBooking(payload);
      
      if (!res.success) {
        toast.error(res.error?.message || 'Không thể tạo đặt vé');
        return;
      }

      const bookingId = res.data.id || res.data.bookingId;
      sessionStorage.setItem('pendingBookingId', bookingId);

      // Step 2: Nếu chọn VNPay, lấy URL và redirect
      if (method === 'vnpay') {
        const payRes = await paymentApi.createVNPayUrl(bookingId);
        if (payRes.success && payRes.data) {
          // Redirect sang cổng VNPay Sandbox
          window.location.href = payRes.data;
          return;
        } else {
          toast.error(payRes.error?.message || 'Lỗi kết nối cổng thanh toán');
          return;
        }
      }

      // Step 3: Các phương thức khác (demo - chuyển thẳng tới success)
      const successParams = new URLSearchParams({
        bookingId,
        movie: movieId,
        seats: seats.join(','),
        room,
        date,
        time,
        total: finalTotal.toString(),
        method
      });
      if (concessions.length > 0) {
        successParams.set('concessions', JSON.stringify(concessions));
      }
      router(`/booking/success?${successParams.toString()}`);

    } catch (err) {
      toast.error(err.error?.message || err.message || 'Có lỗi xảy ra');
    } finally {
      setProcessing(false);
    }
  };

  const displayDate = date ? new Date(date).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }) : '';

  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      {/* ── Top Header Navigation & Stepper ── */}
      <header className="border-b border-border bg-card/85 backdrop-blur-md sticky top-0 z-50">
        <div className="container max-w-[1400px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-foreground"
              onClick={() => router(-1)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <span className="font-extrabold text-foreground text-lg tracking-tight">Thanh Toán</span>
          </div>

          {/* Stepper progress indicator */}
          <div className="hidden md:flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-border text-muted-foreground/60">1</span>
              <span className="font-bold text-muted-foreground/60">Chọn Vé</span>
            </div>
            <div className="h-[1px] w-8 bg-border" />
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-border text-muted-foreground/60">2</span>
              <span className="font-bold text-muted-foreground/60">Bắp Nước</span>
            </div>
            <div className="h-[1px] w-8 bg-primary" />
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border bg-primary text-primary-foreground border-primary">3</span>
              <span className="font-bold text-primary">Thanh Toán</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground/80">
            <span>VI | EN</span>
          </div>
        </div>
      </header>

      {/* ── Main content area ── */}
      <main className="container max-w-[1400px] mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column (2/3 width): Order Details & Payment Method */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Header info */}
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">Thanh Toán Đơn Hàng</h1>
              <p className="text-xs text-muted-foreground mt-1">Vui lòng kiểm tra lại thông tin đơn hàng và tiến hành thanh toán an toàn.</p>
            </div>

            {/* Order Summary Card */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Thông tin vé</h3>
                <span className="text-[10px] text-muted-foreground/80 font-semibold bg-muted rounded px-2 py-0.5">CineBook</span>
              </div>

              <div className="flex gap-4 items-start">
                <img 
                  src={movie?.poster} 
                  alt={movie?.title} 
                  className="w-16 rounded-xl object-cover aspect-[2/3] border border-border shadow-md shrink-0" 
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="font-bold text-foreground text-base leading-tight truncate">{movie?.title}</h4>
                  <p className="text-xs text-muted-foreground flex items-center gap-2"><Building2 className="w-3.5 h-3.5 text-primary" /> {cinema}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-2"><CreditCard className="w-3.5 h-3.5 text-primary" /> {room}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-primary" /> {displayDate} - {time}</p>
                  
                  {/* Selected Seats Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-2">
                    <span className="text-[10px] text-muted-foreground/60 font-semibold uppercase tracking-wider">Ghế:</span>
                    {seats.map(s => (
                      <Badge key={s} className="bg-primary hover:bg-primary text-primary-foreground font-bold text-[10px] rounded px-2 py-0.5">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Concessions details */}
              {concessions.length > 0 && (
                <div className="border-t border-border pt-4 space-y-3">
                  <h4 className="text-xs text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <ShoppingCart className="w-3.5 h-3.5 text-primary" />
                    Bắp nước đã chọn
                  </h4>
                  <div className="space-y-2">
                    {concessions.map(c => (
                      <div key={c.id} className="flex justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-500">🍿</span>
                          <span>{c.name}</span>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-muted border border-border text-muted-foreground">x{c.qty}</Badge>
                        </div>
                        <span className="font-bold text-foreground">{new Intl.NumberFormat('vi-VN').format(c.price * c.qty)}₫</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Discount / Promo Code Card */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider border-b border-border pb-3">Khuyến mãi / Ưu đãi</h3>
              
              <div className="space-y-3">
                {promoApplied ? (
                  <div className="flex items-center justify-between rounded-xl bg-green-500/5 border border-green-500/25 px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-500 font-mono font-bold">{promoCode}</span>
                    </div>
                    <button 
                      type="button"
                      className="text-xs text-muted-foreground hover:text-foreground underline font-medium" 
                      onClick={() => {
                        setPromoApplied(false);
                        setPromoCode('');
                        setPromoData(null);
                        fetchCalculation(null);
                      }}
                    >
                      Xóa mã
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                      <Input 
                        placeholder="Nhập mã khuyến mãi (ví dụ: CINE50)" 
                        value={promoCode} 
                        onChange={e => {
                          setPromoCode(e.target.value.toUpperCase());
                          setPromoError('');
                        }} 
                        className="pl-10 h-10 text-sm bg-muted border-input rounded-xl focus:border-primary/60" 
                      />
                    </div>
                    <Button onClick={handleApplyPromo} className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 px-5 rounded-xl">
                      Áp dụng
                    </Button>
                  </div>
                )}
                {promoApplied && (
                  <p className="text-[11px] text-green-500 font-medium flex items-center gap-1">
                    ✓ Đã áp dụng mã giảm giá thành công.
                  </p>
                )}
                {promoError && <p className="text-xs text-red-500 font-medium">{promoError}</p>}
              </div>
            </div>

            {/* Payment Method Card (VNPay only) */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider border-b border-border pb-3">Phương thức thanh toán</h3>
              
              <div className="space-y-4">
                <div className="w-full flex items-center justify-between p-4 rounded-xl border border-primary/25 bg-primary/5 transition-all text-left relative">
                  <div className="flex items-center gap-3.5">
                    <VNPayIcon />
                    <div>
                      <p className="text-xs font-bold text-foreground flex items-center gap-2">
                        Thanh toán qua VNPay
                        <span className="text-[9px] bg-green-500/20 text-green-500 px-1.5 py-0.5 rounded font-bold uppercase">Khuyên dùng</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Thẻ ATM nội địa, thẻ Visa/MasterCard hoặc quét mã QR Code để thanh toán ngay lập tức.</p>
                    </div>
                  </div>
                  {/* Pre-selected gold dot */}
                  <div className="w-4 h-4 rounded-full border-2 border-primary bg-primary flex items-center justify-center shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-background" />
                  </div>
                </div>

                {/* Informative notice block */}
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/20 text-xs text-muted-foreground">
                  <div className="mt-0.5 w-4 h-4 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 font-bold">i</div>
                  <div className="space-y-1">
                    <p className="font-bold text-blue-500">Môi trường thử nghiệm (Sandbox):</p>
                    <p className="text-muted-foreground/80 leading-relaxed text-[11px]">Trang thanh toán thử nghiệm của VNPay sẽ tự động mở ra. Bạn có thể sử dụng thông tin thẻ ATM NCB test để kiểm tra:</p>
                    <p className="text-primary font-mono text-[11px] mt-1 bg-muted p-2 rounded border border-border leading-relaxed">
                      Số thẻ: 9704198526191432119 <br/>
                      Tên chủ thẻ: NGUYEN VAN A <br/>
                      Ngày phát hành: 07/15 <br/>
                      Mã OTP: 123456
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (1/3 width): Total Breakdown & Pay CTA */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-5 sticky top-24">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider border-b border-border pb-3">Chi tiết thanh toán</h3>
              
              {/* Cost detailed item list */}
              <div className="space-y-3.5 text-xs text-muted-foreground relative">
                {isLoadingCalc && (
                  <div className="absolute inset-0 bg-card/80 flex items-center justify-center z-10 rounded">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground/60">Tiền vé ({seats.length} ghế)</span>
                  <span className="font-bold text-foreground">{new Intl.NumberFormat('vi-VN').format(displaySeatTotal)}₫</span>
                </div>
                {displayConcessionTotal > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground/60">Tiền bắp nước</span>
                    <span className="font-bold text-foreground">{new Intl.NumberFormat('vi-VN').format(displayConcessionTotal)}₫</span>
                  </div>
                )}
                {promoApplied && (
                  <div className="flex justify-between text-green-500 font-semibold">
                    <span>Giảm giá ({promoData?.discountType === 'Percentage' ? `${promoData.discountValue}%` : 'Trực tiếp'})</span>
                    <span>-{new Intl.NumberFormat('vi-VN').format(discount)}₫</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground/60">Thuế VAT ({displayVatPercent}%)</span>
                  <span className="font-bold text-foreground">{new Intl.NumberFormat('vi-VN').format(calculatedVatAmount)}₫</span>
                </div>

                {/* Divider */}
                <div className="border-t border-border pt-4 flex justify-between items-center text-base font-extrabold text-foreground">
                  <span>Tổng cộng:</span>
                  <span className="text-xl text-primary font-black">
                    {new Intl.NumberFormat('vi-VN').format(finalTotal)}₫
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Button
                  onClick={handlePayment}
                  disabled={processing}
                  className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-black h-12 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang xử lý giao dịch...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Thanh toán ngay
                    </>
                  )}
                </Button>
                
                <p className="text-[10px] text-center text-muted-foreground/60 font-medium flex items-center justify-center gap-1.5 pt-3">
                  <span>🛡️</span> Giao dịch được mã hóa và bảo mật bởi VNPay SSL
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default function PaymentPage() {
  return (
      <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
        <PaymentContent />
      </Suspense>
    );
}
