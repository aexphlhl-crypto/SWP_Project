"use client";

import { Clock, AlertTriangle, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { START_HOUR, TIME_SLOT_HEIGHT } from '@/types/schedule';
import { cn } from '@/lib/utils';
export function ScheduleBlock({
  showtime,
  conflicts = [],
  onDelete,
  onClick
}) {
  const hasConflict = conflicts.length > 0;

  // Calculate position and height
  const [startHour, startMin] = showtime.startTime.split(':').map(Number);
  const [endHour, endMin] = showtime.endTime.split(':').map(Number);
  const startMinutes = (startHour - START_HOUR) * 60 + startMin;
  const endMinutes = (endHour - START_HOUR) * 60 + endMin;
  const duration = endMinutes - startMinutes;
  const top = startMinutes / 60 * TIME_SLOT_HEIGHT;
  const height = Math.max(duration / 60 * TIME_SLOT_HEIGHT, 40); // Minimum 40px height

  // Get movie poster color (simple hash-based color)
  const colors = ['from-blue-600/90 to-blue-800/90 border-blue-500/50', 'from-purple-600/90 to-purple-800/90 border-purple-500/50', 'from-emerald-600/90 to-emerald-800/90 border-emerald-500/50', 'from-amber-600/90 to-amber-800/90 border-amber-500/50', 'from-rose-600/90 to-rose-800/90 border-rose-500/50', 'from-cyan-600/90 to-cyan-800/90 border-cyan-500/50', 'from-indigo-600/90 to-indigo-800/90 border-indigo-500/50', 'from-teal-600/90 to-teal-800/90 border-teal-500/50'];
  const colorIndex = showtime.movieId.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIndex];
  return <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("absolute left-1 right-1 rounded-md border bg-gradient-to-b shadow-lg cursor-pointer", "transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:z-20", "flex flex-col overflow-hidden group", hasConflict ? "from-red-600/90 to-red-800/90 border-red-500 ring-2 ring-red-500/50 animate-pulse" : bgColor)} style={{
          top: `${top}px`,
          height: `${height}px`,
          minHeight: '40px'
        }} onClick={() => onClick?.(showtime)}>
            {/* Conflict Warning Badge */}
            {hasConflict && <div className="absolute -top-1 -right-1 z-10">
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white">
                  <AlertTriangle className="w-3 h-3" />
                </div>
              </div>}
            
            {/* Delete Button */}
            <Button variant="ghost" size="icon" className="absolute top-0.5 right-0.5 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 hover:bg-red-500 z-10" onClick={e => {
            e.stopPropagation();
            onDelete?.(showtime.id);
          }}>
              <X className="w-3 h-3" />
            </Button>
            
            {/* Content */}
            <div className="flex-1 p-1.5 overflow-hidden">
              <p className="text-xs font-semibold text-white truncate leading-tight">
                {showtime.movie?.title || 'Phim'}
              </p>
              {height > 50 && <div className="flex items-center gap-1 mt-0.5 text-[10px] text-white/80">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{showtime.startTime} - {showtime.endTime}</span>
                </div>}
              {height > 70 && <Badge variant="secondary" className="mt-1 h-4 text-[9px] px-1 bg-black/30 text-white border-0">
                  {(showtime.price / 1000).toFixed(0)}K
                </Badge>}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className={cn("max-w-xs p-3 bg-popover border-border", hasConflict && "border-red-500")}>
          <div className="space-y-2">
            <div>
              <p className="font-semibold">{showtime.movie?.title}</p>
              <p className="text-sm text-muted-foreground">
                {showtime.startTime} - {showtime.endTime} ({showtime.movie?.duration} phút)
              </p>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Giá vé:</span>
              <span className="font-medium">{showtime.price.toLocaleString('vi-VN')}đ</span>
            </div>
            
            {hasConflict && <div className="pt-2 border-t border-red-500/30">
                <p className="text-xs font-medium text-red-400 flex items-center gap-1 mb-1">
                  <AlertTriangle className="w-3 h-3" />
                  Xung đột lịch chiếu:
                </p>
                {conflicts.map((conflict, idx) => <p key={idx} className="text-xs text-red-300/80 pl-4">
                    {conflict.message}
                  </p>)}
              </div>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>;
}