'use client';

import { cn } from '@/lib/utils';
import { Armchair, Sofa, Crown } from 'lucide-react';
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
  const getSeatIcon = () => {
    switch (seat.type) {
      case 'vip':
        return <Crown className="size-3" />;
      case 'couple':
        return <Sofa className="size-4" />;
      default:
        return <Armchair className="size-3" />;
    }
  };
  const formatPrice = price => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };
  return <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" onClick={handleClick} disabled={isBooked || isHeld} className={cn('relative flex items-center justify-center rounded-t-lg transition-all duration-200', 'border-2 border-b-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        // Size based on seat type
        seat.type === 'couple' ? 'w-14 h-9' : 'w-8 h-8',
        // Available - Green
        isAvailable && !isSelected && 'bg-emerald-600/80 border-emerald-500 hover:bg-emerald-500 hover:scale-105 cursor-pointer',
        // Selected - Yellow/Amber
        isSelected && 'bg-amber-500 border-amber-400 scale-105 shadow-lg shadow-amber-500/30 cursor-pointer',
        // Booked - Gray
        isBooked && 'bg-muted/50 border-muted-foreground/20 cursor-not-allowed opacity-50',
        // Held - Red
        isHeld && 'bg-red-600/50 border-red-500/50 cursor-not-allowed',
        // VIP styling
        seat.type === 'vip' && isAvailable && !isSelected && 'bg-purple-600/80 border-purple-500 hover:bg-purple-500', seat.type === 'vip' && isSelected && 'bg-amber-500 border-amber-400',
        // Couple styling
        seat.type === 'couple' && isAvailable && !isSelected && 'bg-pink-600/80 border-pink-500 hover:bg-pink-500', seat.type === 'couple' && isSelected && 'bg-amber-500 border-amber-400',
        // Disabled state
        disabled && !isSelected && 'opacity-50 cursor-not-allowed hover:scale-100')}>
            <span className={cn('text-[10px] font-medium', isBooked && 'text-muted-foreground', (isAvailable || isSelected || isHeld) && 'text-white')}>
              {seat.type === 'couple' ? <span className="flex items-center gap-1">
                  {getSeatIcon()}
                </span> : seat.number}
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <div className="space-y-1">
            <p className="font-semibold">{seat.id} - {seatTypeLabels[seat.type]}</p>
            <p className="text-muted-foreground">{statusLabels[seat.status]}</p>
            {isAvailable && <p className="text-emerald-400">{formatPrice(seat.price)}</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>;
}