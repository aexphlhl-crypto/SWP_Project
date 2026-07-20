'use client';

import { cn } from '@/lib/utils';
import { Heart, X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const seatTypeLabels = {
  standard: 'Ghế Thường',
  vip: 'Ghế VIP',
  couple: 'Ghế Đôi'
};

const statusLabels = {
  available: 'Trống',
  booked: 'Đã đặt',
  selected: 'Đang chọn',
  held: 'Đang giữ'
};

export function SeatButton({
  seat,
  isSelected,
  onSelect,
  disabled
}) {
  const isAvailable = seat.status === 'available';
  const isBooked = seat.status === 'booked';
  const isHeld = seat.status === 'held';
  const canSelect = isAvailable && !disabled;

  const handleClick = () => {
    if (canSelect || isSelected) {
      onSelect(seat);
    }
  };

  const formatPrice = price => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={handleClick}
            disabled={isBooked || isHeld}
            className={cn(
              'relative flex items-center justify-center rounded-lg transition-all duration-200 outline-none focus:ring-1 focus:ring-primary',
              seat.type === 'couple' ? 'w-18 h-8' : 'w-8 h-8',
              // Selected state (overrides normal/VIP/couple)
              isSelected && 'bg-primary border border-primary text-black font-extrabold shadow-lg shadow-primary/20 hover:scale-105 scale-105 cursor-pointer',
              
              // Standard available
              isAvailable && !isSelected && seat.type === 'standard' && 'bg-secondary border border-border hover:bg-muted text-foreground cursor-pointer',
              
              // VIP available
              isAvailable && !isSelected && seat.type === 'vip' && 'bg-transparent border border-primary/60 text-primary hover:bg-primary/10 hover:border-primary hover:scale-105 cursor-pointer',
              
              // Couple available
              isAvailable && !isSelected && seat.type === 'couple' && 'bg-red-500/10 dark:bg-red-950/20 border border-red-500/40 dark:border-red-800/60 text-red-500 hover:bg-red-500/20 dark:hover:bg-red-950/40 hover:border-red-500 hover:scale-105 cursor-pointer',
              
              // Booked / Sold
              isBooked && 'bg-muted border border-border text-muted-foreground cursor-not-allowed opacity-40',
              
              // Held
              isHeld && 'bg-red-500/15 dark:bg-red-950/40 border border-red-500/45 dark:border-red-700/60 text-red-500 cursor-not-allowed opacity-60',
              
              // Disabled state
              disabled && !isSelected && 'opacity-40 cursor-not-allowed hover:scale-100'
            )}
          >
            <span className="text-[10px] font-bold">
              {isBooked ? (
                <X className="size-3 text-zinc-600 font-extrabold" />
              ) : seat.type === 'couple' ? (
                <span className="flex items-center justify-center gap-1 px-1">
                  <Heart className="size-3 fill-red-500 text-red-500 shrink-0" />
                  <span className="text-[9px] leading-none">{seat.label || seat.number}</span>
                </span>
              ) : (
                seat.label || seat.number
              )}
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <div className="space-y-1">
            <p className="font-semibold">{seat.label || seat.number} - {seatTypeLabels[seat.type]}</p>
            <p className="text-muted-foreground">{statusLabels[seat.status]}</p>
            {isAvailable && <p className="text-primary">{formatPrice(seat.price)}</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}