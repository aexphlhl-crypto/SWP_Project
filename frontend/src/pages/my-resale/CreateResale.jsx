'use client';

import { Suspense, useState, useEffect } from 'react';
import { useNavigate, Navigate, useSearchParams } from 'react-router-dom';

import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context'
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Calendar, Clock, MapPin, Armchair, User, Phone, RefreshCw, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import bookingApi from '@/api/bookingApi';
import resaleApi from '@/api/resaleApi';
import { formatSeatType } from '@/pages/MyTickets';
import { toast } from 'sonner';
// Removed mockTickets
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
function CreateResaleContent() {
  const {
    user,
    isAuthenticated
  } = useAuth();
  const router = useNavigate();
  const [params] = useSearchParams();
  
  const [realBookings, setRealBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [activeResaleListings, setActiveResaleListings] = useState([]);

  const preselectedBookingId = params.get('bookingId');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [includesFnb, setIncludesFnb] = useState(false);
  
  const [resalePrice, setResalePrice] = useState('');
  const [note, setNote] = useState('');
  const [priceError, setPriceError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.userId) {
      Promise.all([
        bookingApi.getMyBookings(),
        resaleApi.getMyListings(user.userId, { page: 0, size: 100 })
      ]).then(([bookingsRes, listingsRes]) => {
        if (bookingsRes.success) {
          const now = new Date();
          
          const activeListings = listingsRes.success && listingsRes.data?.content 
            ? listingsRes.data.content.filter(l => l.status?.toLowerCase() !== 'deleted' && l.status?.toLowerCase() !== 'cancelled')
            : [];
          setActiveResaleListings(activeListings);

          const listedSeatsMap = {};
          const listedFnbMap = {};
          activeListings.forEach(l => {
            const bIdNum = parseInt(String(l.bookingId).replace('BK', ''), 10);
            if (!listedSeatsMap[bIdNum]) listedSeatsMap[bIdNum] = [];
            if (l.seatNumber) {
              listedSeatsMap[bIdNum].push(...l.seatNumber.split(',').map(s => s.trim()));
            }
            if (l.includesFnb) {
              listedFnbMap[bIdNum] = true;
            }
          });

          const validBookings = bookingsRes.data.filter(b => {
            const isConfirmed = b.status === 'confirmed' || b.status === 'upcoming';
            if (!isConfirmed) return false;
            
            const bIdNum = parseInt(String(b.id).replace('BK', ''), 10);
            const listedSeats = listedSeatsMap[bIdNum] || [];
            const hasFnb = b.fnbItems && b.fnbItems.length > 0;
            const fnbListed = listedFnbMap[bIdNum] || false;
            
            const totalSeats = b.seatNumber ? b.seatNumber.split(',').map(s => s.trim()) : [];
            const availableSeats = totalSeats.filter(s => !listedSeats.includes(s));
            
            // Filter out if no seats are available AND no fnb available
            if (availableSeats.length === 0 && (!hasFnb || fnbListed)) return false;
            
            if (b.showDate && b.showTime) {
                const [year, month, day] = b.showDate.split('-');
                const [hours, minutes] = b.showTime.split(':');
                const showDateTime = new Date(year, parseInt(month, 10) - 1, day, hours, minutes, 0);
                return showDateTime > now;
            }
            return true;
          });
          setRealBookings(validBookings);
          
          if (preselectedBookingId) {
              const preselected = validBookings.find(b => String(b.id) === String(preselectedBookingId));
            if (preselected) {
              setSelectedTicket(preselected);
              setSelectedSeats([]);
              setIncludesFnb(false);
            }
          }
        }
      }).catch(err => {
        toast.error("Không thể tải danh sách vé");
      }).finally(() => {
        setLoadingBookings(false);
      });
    }
  }, [isAuthenticated, user?.userId, preselectedBookingId]);
  
  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  // Filter to only eligible tickets
  const eligibleTickets = realBookings;
  
  const getListedItems = (ticket) => {
    if (!ticket) return { seats: [], fnb: false };
    const bIdNum = parseInt(String(ticket.id).replace('BK', ''), 10);
    const listedSeats = [];
    let fnbListed = false;
    
    activeResaleListings.forEach(l => {
      if (parseInt(String(l.bookingId).replace('BK', ''), 10) === bIdNum) {
        if (l.seatNumber) listedSeats.push(...l.seatNumber.split(',').map(s => s.trim()));
        if (l.includesFnb) fnbListed = true;
      }
    });
    
    return { seats: listedSeats, fnb: fnbListed };
  };
  const handleSubmit = async () => {
    if (!selectedTicket || (selectedSeats.length === 0 && !includesFnb)) return;
    const priceNum = Number(resalePrice);
    if (!resalePrice || isNaN(priceNum) || priceNum <= 0) {
      setPriceError('Giá phải lớn hơn 0.');
      return;
    }
    
    setSubmitting(true);
    try {
      const payload = {
        bookingId: parseInt(String(selectedTicket.id).replace('BK', ''), 10),
        sellerId: user.userId,
        seats: selectedSeats.join(', '),
        includesFnb: includesFnb,
        askingPrice: priceNum,
        note: note
      };
      const res = await resaleApi.createListing(payload);
      if (res.success) {
        setSubmitted(true);
        toast.success("Đăng bán vé thành công!");
      } else {
        setPriceError(res.error?.message || "Lỗi khi đăng bán vé");
      }
    } catch (err) {
      setPriceError(err.response?.data?.error?.message || "Lỗi khi đăng bán vé");
    } finally {
      setSubmitting(false);
    }
  };
  if (submitted) {
    return <div className="container mx-auto px-4 py-16 max-w-md text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Đăng thành công!</h2>
          <p className="text-muted-foreground mt-2">
            Bài đăng vé bán lại của bạn đã xuất hiện trong danh sách.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Button asChild>
            <Link to="/my-resale">
              <RefreshCw className="w-4 h-4 mr-2" />
              Quản lý bài đăng
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/resale">Xem tất cả vé bán lại</Link>
          </Button>
        </div>
      </div>;
  }
  return <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
      {/* Back */}
      <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2">
        <Link to="/my-tickets">
          <ArrowLeft className="w-4 h-4" />
          Vé của tôi
        </Link>
      </Button>

      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <RefreshCw className="w-6 h-6 text-primary" />
          Đăng bán vé lại
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Hệ thống chỉ hỗ trợ đăng thông tin. Giao dịch thực hiện trực tiếp với người mua.
        </p>
      </div>

      {/* Step 1: Select ticket */}
      <Card className="bg-card border-border">
        <CardContent className="p-5 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">1</span>
            Chọn vé muốn bán
          </h2>

          {loadingBookings ? <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div> : eligibleTickets.length === 0 ? <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Không có vé nào đủ điều kiện đăng bán.</p>
              <p className="text-xs mt-1">Vé phải còn sắp chiếu và chưa check-in.</p>
            </div> : <div className="space-y-3">
              {eligibleTickets.map(ticket => {
            const isSelected = String(selectedTicket?.id) === String(ticket.id);
            let displayDate = '';
            if (ticket.showDate) {
              const [y, m, d] = ticket.showDate.split('-');
              displayDate = new Date(y, parseInt(m, 10) - 1, d).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              });
            }
            return <button key={ticket.id} onClick={() => {
              setSelectedTicket(ticket);
              setSelectedSeats([]);
              setIncludesFnb(false);
              setPriceError('');
            }} className={cn('w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors', isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50')}>
                    <div className={cn('w-4 h-4 rounded-full border-2 shrink-0', isSelected ? 'border-primary bg-primary' : 'border-muted-foreground')} />
                    <div className="flex-1 min-w-0 text-sm">
                      <p className="font-semibold truncate">{ticket.movieTitle}</p>
                      <p className="text-muted-foreground text-xs mt-0.5">
                        {ticket.cinemaName} • {displayDate} {ticket.showTime}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Ghế: {ticket.seatNumber}
                      </p>
                    </div>
                  </button>;
          })}
            </div>}

          {/* Seat selection if multiple seats */}
          {selectedTicket && (
            <div className="space-y-4">
              {selectedTicket.seatNumber && (() => {
                const { seats: listedSeats } = getListedItems(selectedTicket);
                return (
                  <div className="space-y-2">
                    <Label>Chọn ghế muốn bán</Label>
                    <div className="flex gap-2 flex-wrap">
                      {selectedTicket.seatNumber.split(',').map(s => s.trim()).map(seat => {
                        const isListed = listedSeats.includes(seat);
                        const isSelected = selectedSeats.includes(seat);
                        const ticketObj = selectedTicket.tickets?.find(t => t.seatLabel === seat);
                        const typeText = formatSeatType(ticketObj?.seatType);
                        return <button key={seat} disabled={isListed} onClick={() => {
                          if (isSelected) {
                            setSelectedSeats(selectedSeats.filter(s => s !== seat));
                          } else {
                            setSelectedSeats([...selectedSeats, seat]);
                          }
                        }} className={cn('px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors', isListed ? 'border-muted bg-muted text-muted-foreground opacity-50 cursor-not-allowed' : isSelected ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50')}>
                            {typeText}: {seat} {isListed && '(Đã đăng)'}
                          </button>;
                      })}
                    </div>
                  </div>
                );
              })()}
              
              {selectedTicket.fnbItems && selectedTicket.fnbItems.length > 0 && (() => {
                const { fnb: fnbListed } = getListedItems(selectedTicket);
                return (
                  <div className="space-y-2">
                    <Label>Bắp nước đi kèm</Label>
                    <div className="flex gap-2">
                      <button disabled={fnbListed} onClick={() => setIncludesFnb(!includesFnb)} className={cn('px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors', fnbListed ? 'border-muted bg-muted text-muted-foreground opacity-50 cursor-not-allowed' : includesFnb ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50')}>
                        Bán kèm Bắp Nước ({selectedTicket.totalFnbAmount?.toLocaleString('vi-VN')}₫) {fnbListed && '(Đã đăng)'}
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Pricing */}
      {selectedTicket && <Card className="bg-card border-border">
          <CardContent className="p-5 space-y-4">
            <h2 className="font-semibold flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">2</span>
              Đặt giá bán
            </h2>

            <div className="space-y-1.5">
              <Label htmlFor="resale-price">Giá bán lại (VNĐ) *</Label>
              <Input id="resale-price" type="number" min={1000} step={1000} placeholder="VD: 90000" value={resalePrice} onChange={e => {
            setResalePrice(e.target.value);
            setPriceError('');
          }} />
              {priceError && <p className="text-xs text-destructive">{priceError}</p>}
              <p className="text-xs text-muted-foreground">
                Đơn hàng tổng: {selectedTicket.totalAmount?.toLocaleString('vi-VN')}₫
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="resale-note">Ghi chú (tuỳ chọn)</Label>
              <Input id="resale-note" placeholder="VD: Bận việc đột xuất, bán gấp. Vé chính hãng." value={note} onChange={e => setNote(e.target.value)} maxLength={200} />
              <p className="text-xs text-muted-foreground text-right">{note.length}/200</p>
            </div>
          </CardContent>
        </Card>}

      {/* Step 3: Seller info (read-only — BR-19, BR-20) */}
      {selectedTicket && <Card className="bg-card border-border">
          <CardContent className="p-5 space-y-4">
            <h2 className="font-semibold flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">3</span>
              Thông tin người bán
            </h2>

            <div className="rounded-lg bg-secondary/50 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Tên</p>
                  <p className="font-medium">{user?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Số điện thoại</p>
                  <p className="font-medium font-mono">{user?.phone ?? 'Chưa cập nhật trong hồ sơ'}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground italic">
                Thông tin này được lấy từ hồ sơ cá nhân và không thể thay đổi riêng cho bài đăng.
              </p>
            </div>
          </CardContent>
        </Card>}

      {/* Submit */}
      {selectedTicket && <>
          <Separator className="bg-border" />

          {/* Preview */}
          <div className="rounded-xl bg-secondary/30 p-4 space-y-2 text-sm">
            <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
              Xem trước bài đăng
            </p>
            {[{
          icon: MapPin,
          label: 'Rạp',
          value: selectedTicket.cinemaName
        }, {
          icon: Calendar,
          label: 'Ngày',
          value: selectedTicket.showDate ? (() => {
            const [y, m, d] = selectedTicket.showDate.split('-');
            return new Date(y, parseInt(m, 10) - 1, d).toLocaleDateString('vi-VN');
          })() : ''
        }, {
          icon: Clock,
          label: 'Giờ',
          value: selectedTicket.showTime
        }, {
          icon: Armchair,
          label: 'Ghế bán',
          value: selectedSeats.length > 0 ? selectedSeats.join(', ') : 'Không'
        }, {
          icon: RefreshCw,
          label: 'Bắp nước',
          value: includesFnb ? 'Có kèm' : 'Không'
        }, {
          icon: RefreshCw,
          label: 'Giá bán',
          value: resalePrice ? `${Number(resalePrice).toLocaleString('vi-VN')}₫` : '—'
        }].map(({
          icon: Icon,
          label,
          value
        }) => <div key={label} className="flex items-center gap-2">
                <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">{label}:</span>
                <span className="font-medium">{value}</span>
              </div>)}
          </div>

          <Button className="w-full gap-2" size="lg" onClick={handleSubmit} disabled={submitting || (selectedSeats.length === 0 && !includesFnb) || !resalePrice}>
            {submitting ? <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang đăng...
              </> : <>
                <RefreshCw className="w-4 h-4" />
                Đăng bán vé
              </>}
          </Button>
        </>}
    </div>;
}
export default function CreateResalePage() {
  return (
      <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
        <CreateResaleContent />
      </Suspense>
  );
}

