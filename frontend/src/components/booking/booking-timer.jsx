'use client';

import { Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCountdown, useBookingTimer } from '@/hooks/use-countdown';
export function BookingTimer({
  initialMinutes = 15,
  onExpire,
  isStarted = true,
  expiresAt = null
}) {
  const countdownResult = useCountdown({
    initialMinutes,
    onExpire,
    isStarted
  });
  
  const bookingTimerResult = useBookingTimer(expiresAt, onExpire);
  
  const activeResult = expiresAt ? bookingTimerResult : countdownResult;
  
  const {
    formattedTime,
    isWarning,
    isCritical,
    isExpired
  } = activeResult;
  if (isExpired) {
    return <div className="flex items-center gap-2 px-4 py-2 bg-destructive/20 border border-destructive rounded-lg">
        <AlertCircle className="size-5 text-destructive" />
        <div>
          <p className="text-sm font-medium text-destructive">Hết thời gian giữ ghế</p>
          <p className="text-xs text-muted-foreground">Vui lòng chọn lại ghế</p>
        </div>
      </div>;
  }
  return <div className={cn('flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors', isCritical && 'bg-destructive/20 border-destructive animate-pulse', isWarning && !isCritical && 'bg-amber-500/20 border-amber-500', !isWarning && !isCritical && 'bg-card border-border')}>
      <div className={cn('flex items-center justify-center size-10 rounded-full', isCritical && 'bg-destructive/30', isWarning && !isCritical && 'bg-amber-500/30', !isWarning && !isCritical && 'bg-primary/20')}>
        <Clock className={cn('size-5', isCritical && 'text-destructive', isWarning && !isCritical && 'text-amber-500', !isWarning && !isCritical && 'text-primary')} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Thời gian giữ ghế</p>
        <p className={cn('text-2xl font-bold font-mono tracking-wider', isCritical && 'text-destructive', isWarning && !isCritical && 'text-amber-500', !isWarning && !isCritical && 'text-foreground')}>
          {formattedTime}
        </p>
      </div>
    </div>;
}