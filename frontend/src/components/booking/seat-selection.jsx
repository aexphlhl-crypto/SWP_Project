'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';
import { SeatButton } from './seat-button';
import { SeatLegend } from './seat-legend';
import { BookingSummary } from './booking-summary';
import { getStaticSeatLayout } from '@/lib/seat-layout';
import { useToast } from '@/hooks/use-toast';
import { Monitor, Loader2 } from 'lucide-react';
import showtimeApi from '@/api/showtimeApi';
const DEFAULT_PRICING = {
  standard: 75000,
  vip: 100000,
  couple: 180000
};
const MAX_SEATS = 8;
export function SeatSelection({
  movieId,
  movieTitle,
  moviePoster,
  cinemaName,
  roomName,
  showDate,
  showTime,
  showtimeId,
  pricing = DEFAULT_PRICING,
  maxSeats = MAX_SEATS,
  onConfirm,
  onCancel
}) {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isLoadingSeats, setIsLoadingSeats] = useState(false);
  const [realSeats, setRealSeats] = useState(null);
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let interval;
    const loadSeats = () => {
      if (showtimeId) {
        showtimeApi.getSeats(showtimeId)
          .then(res => {
            if (res.success) {
              setRealSeats(res.data);
            }
          })
          .catch(err => console.error("Failed to load seats", err));
      }
    };

    setIsLoadingSeats(true);
    loadSeats();
    setIsLoadingSeats(false);

    interval = setInterval(loadSeats, 5000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showtimeId]);

  const initializedHeldSeats = useRef(false);

  // Khôi phục trạng thái ghế đang giữ từ backend khi load lại trang
  useEffect(() => {
    if (realSeats && user && !initializedHeldSeats.current) {
      const myHeldSeats = realSeats
        .filter(s => s.status === 'Held' && s.heldByUserId == user.userId)
        .map(s => ({
          id: s.seatId.toString(),
          seatId: s.seatId,
          label: s.seatLabel,
          type: s.seatType.toLowerCase(),
          status: 'selected',
          price: s.price
        }));
        
      if (myHeldSeats.length > 0) {
        setSelectedSeats(myHeldSeats);
      }
      initializedHeldSeats.current = true;
    }
  }, [realSeats, user]);

  // Generate seat layout
  const seatLayout = getStaticSeatLayout(pricing);

  // Map static layout to real seats if available
  const mappedLayout = useMemo(() => {
    if (!realSeats) return seatLayout;
    const newLayout = { ...seatLayout, rows: [] };
    
    // Group realSeats by rowLabel
    const grouped = {};
    realSeats.forEach(s => {
      if (!grouped[s.rowLabel]) grouped[s.rowLabel] = [];
      grouped[s.rowLabel].push({
        id: s.seatId.toString(),
        seatId: s.seatId, // Keep numerical ID for API calls
        label: s.seatLabel,
        type: s.seatType.toLowerCase(),
        status: s.status === 'Booked' ? 'booked' : (s.status === 'Held' ? (s.heldByUserId == user?.userId ? 'available' : 'held') : 'available'),
        price: s.price
      });
    });

    // Sort rows alphabetically
    Object.keys(grouped).sort().forEach(rowLabel => {
      // Sort seats by colNumber (which maps to seatLabel number implicitly or directly)
      const seats = grouped[rowLabel].sort((a, b) => parseInt(a.label.replace(rowLabel, '')) - parseInt(b.label.replace(rowLabel, '')));
      newLayout.rows.push({ row: rowLabel, seats });
    });
    
    return newLayout;
  }, [realSeats, seatLayout]);

  const handleSeatSelect = useCallback(async seat => {
    if (!isAuthenticated) {
      toast({
        title: 'Yêu cầu đăng nhập',
        description: 'Vui lòng đăng nhập để chọn ghế và đặt vé.',
        variant: 'destructive'
      });
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }

    const isSelected = selectedSeats.some(s => s.id === seat.id);
    
    if (isSelected) {
      // Deselect
      setSelectedSeats(prev => prev.filter(s => s.id !== seat.id));
      try {
        await showtimeApi.releaseSeat(showtimeId, seat.seatId);
      } catch (err) {
        console.error("Failed to release seat", err);
      }
    } else {
      // Check max seats limit
      if (selectedSeats.length >= maxSeats) {
        toast({
          title: 'Đã đạt giới hạn ghế',
          description: `Bạn chỉ có thể chọn tối đa ${maxSeats} ghế`,
          variant: 'destructive'
        });
        return;
      }

      // API Call to hold seat
      try {
        await showtimeApi.holdSeat(showtimeId, seat.seatId);
        setSelectedSeats(prev => [...prev, { ...seat, status: 'selected' }]);
      } catch (err) {
        toast({
          title: 'Không thể chọn ghế',
          description: err?.response?.data?.error?.message || 'Ghế này đã có người chọn.',
          variant: 'destructive'
        });
        
        // Refresh seats if collision happened
        showtimeApi.getSeats(showtimeId).then(res => {
          if (res.success) setRealSeats(res.data);
        });
      }
    }
  }, [maxSeats, toast, isAuthenticated, navigate, location.pathname, selectedSeats, showtimeId]);
  const handleConfirm = useCallback(() => {
    if (selectedSeats.length === 0) {
      toast({
        title: 'Chưa chọn ghế',
        description: 'Vui lòng chọn ít nhất một ghế để tiếp tục',
        variant: 'destructive'
      });
      return;
    }
    setIsConfirming(true);

    // Simulate API call
    setTimeout(() => {
      onConfirm?.(selectedSeats);
      setIsConfirming(false);
    }, 1000);
  }, [selectedSeats, onConfirm, toast]);
  const handleCancel = useCallback(() => {
    setSelectedSeats([]);
    onCancel?.();
  }, [onCancel]);
  const handleTimerExpire = useCallback(() => {
    toast({
      title: 'Hết thời gian giữ ghế',
      description: 'Phiên đặt vé đã hết hạn. Vui lòng chọn lại ghế.',
      variant: 'destructive'
    });
    setSelectedSeats([]);
  }, [toast]);
  return (
    <div className="grid lg:grid-cols-[1fr,380px] gap-6">
      {/* Seat Map */}
      <div className="space-y-6 relative">
        {isLoadingSeats && (
          <div className="absolute inset-0 z-10 bg-background/50 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
        {/* Screen */}
        <div className="relative">
          <div className="h-2 bg-gradient-to-b from-primary/80 to-primary/20 rounded-b-[100%] mx-auto w-[80%] max-w-md" />
          <div className="flex items-center justify-center gap-2 mt-2 text-muted-foreground">
            <Monitor className="size-4" />
            <span className="text-sm font-medium">MÀN HÌNH</span>
          </div>
          <div className="h-8 bg-gradient-to-b from-primary/10 to-transparent mx-auto w-[90%] max-w-lg -mt-1" />
        </div>

        {/* Seat Grid */}
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[500px] max-w-3xl mx-auto">
            <div className="space-y-2">
              {mappedLayout.rows.map(row => <div key={row.row} className="flex items-center gap-2">
                  {/* Row label */}
                  <div className="w-8 h-8 flex items-center justify-center text-sm font-bold text-muted-foreground">
                    {row.row}
                  </div>
                  
                  {/* Seats */}
                  <div className={cn('flex-1 flex justify-center', row.row === 'J' || row.row === 'K' ? 'gap-4' : 'gap-1.5')}>
                    {row.seats.map((seat, index) => {
                  // Add aisle gap for standard/vip rows
                  const showAisle = seat.type !== 'couple' && (index === 2 || index === 7);
                  return <div key={seat.id} className="flex items-center">
                          <SeatButton seat={seat} isSelected={selectedSeats.some(s => s.id === seat.id)} onSelect={handleSeatSelect} disabled={selectedSeats.length >= maxSeats && !selectedSeats.some(s => s.id === seat.id)} />
                          {showAisle && <div className="w-6" />}
                        </div>;
                })}
                  </div>
                  
                  {/* Row label (right) */}
                  <div className="w-8 h-8 flex items-center justify-center text-sm font-bold text-muted-foreground">
                    {row.row}
                  </div>
                </div>)}
            </div>
          </div>
        </div>

        {/* Legend */}
        <SeatLegend />
      </div>

      {/* Booking Summary - Sticky on desktop */}
      <div className="lg:sticky lg:top-4 lg:h-fit">
        <BookingSummary movieTitle={movieTitle} moviePoster={moviePoster} cinemaName={cinemaName} roomName={roomName} showDate={showDate} showTime={showTime} selectedSeats={selectedSeats} onConfirm={handleConfirm} onCancel={handleCancel} onTimerExpire={handleTimerExpire} isConfirming={isConfirming} />
      </div>
    </div>
  );
}