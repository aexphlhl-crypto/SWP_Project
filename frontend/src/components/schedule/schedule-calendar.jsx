"use client";

import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { ScheduleBlock } from './schedule-block';
import { START_HOUR, END_HOUR, TIME_SLOT_HEIGHT } from '@/types/schedule';
import { getRoomTypeLabel, getRoomTypeColor, checkConflicts } from '@/lib/schedule-utils';
import { cn } from '@/lib/utils';
export function ScheduleCalendar({
  rooms,
  showtimes,
  selectedDate,
  weekDays,
  onSelectDate,
  onDeleteShowtime,
  onShowtimeClick
}) {
  // Generate time slots (every hour)
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  }, []);

  // Get showtimes for selected date
  const dateShowtimes = useMemo(() => {
    return showtimes.filter(st => st.date === selectedDate);
  }, [showtimes, selectedDate]);

  // Calculate conflicts for all showtimes
  const showtimeConflicts = useMemo(() => {
    const conflicts = {};
    dateShowtimes.forEach(st => {
      const stConflicts = checkConflicts(st, dateShowtimes, st.id);
      if (stConflicts.length > 0) {
        conflicts[st.id] = stConflicts;
      }
    });
    return conflicts;
  }, [dateShowtimes]);

  // Count conflicts per day
  const conflictCountByDate = useMemo(() => {
    const counts = {};
    weekDays.forEach(day => {
      const dayShowtimes = showtimes.filter(st => st.date === day.date);
      let conflictCount = 0;
      dayShowtimes.forEach(st => {
        const conflicts = checkConflicts(st, dayShowtimes, st.id);
        if (conflicts.length > 0) conflictCount++;
      });
      counts[day.date] = conflictCount;
    });
    return counts;
  }, [showtimes, weekDays]);

  // Get showtimes for a specific room
  const getShowtimesForRoom = roomId => {
    return dateShowtimes.filter(st => st.roomId === roomId);
  };
  const totalHours = END_HOUR - START_HOUR;
  const gridHeight = totalHours * TIME_SLOT_HEIGHT;
  return <div className="flex flex-col h-full">
      {/* Week Day Selector */}
      <div className="flex-shrink-0 border-b border-border bg-card/50">
        <ScrollArea className="w-full">
          <div className="flex gap-2 p-3">
            {weekDays.map(day => <button key={day.date} onClick={() => onSelectDate(day.date)} className={cn("flex flex-col items-center px-4 py-2 rounded-lg border transition-all min-w-[80px]", "hover:border-primary/50 hover:bg-primary/5", selectedDate === day.date ? "bg-primary/10 border-primary text-primary" : "border-border bg-card", day.isToday && selectedDate !== day.date && "border-amber-500/50")}>
                <span className="text-xs text-muted-foreground capitalize">
                  {day.dayName.slice(0, 2)}
                </span>
                <span className="text-lg font-bold">{day.dayNumber}</span>
                {day.isToday && <Badge variant="secondary" className="text-[10px] h-4 px-1 mt-0.5">
                    Hôm nay
                  </Badge>}
                {conflictCountByDate[day.date] > 0 && <Badge variant="destructive" className="text-[10px] h-4 px-1 mt-0.5">
                    {conflictCountByDate[day.date]} xung đột
                  </Badge>}
              </button>)}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
      
      {/* Calendar Grid */}
      <ScrollArea className="flex-1">
        <div className="flex min-w-max">
          {/* Time Column */}
          <div className="flex-shrink-0 w-16 border-r border-border bg-card/30 sticky left-0 z-10">
            <div className="h-12 border-b border-border" /> {/* Header spacer */}
            <div className="relative" style={{
            height: gridHeight
          }}>
              {timeSlots.map((time, index) => <div key={time} className="absolute left-0 right-0 flex items-start justify-end pr-2 text-xs text-muted-foreground" style={{
              top: index * TIME_SLOT_HEIGHT
            }}>
                  {time}
                </div>)}
            </div>
          </div>
          
          {/* Room Columns */}
          {rooms.map(room => <div key={room.id} className="flex-shrink-0 w-48 border-r border-border last:border-r-0">
              {/* Room Header */}
              <div className="sticky top-0 z-10 h-12 flex items-center justify-center gap-2 border-b border-border bg-card/80 backdrop-blur px-2">
                <span className="font-medium text-sm truncate">{room.name}</span>
                <Badge variant="outline" className={cn("text-[10px] h-5 px-1.5", getRoomTypeColor(room.type))}>
                  {getRoomTypeLabel(room.type)}
                </Badge>
              </div>
              
              {/* Time Grid */}
              <div className="relative" style={{
            height: gridHeight
          }}>
                {/* Hour lines */}
                {timeSlots.map((_, index) => <div key={index} className="absolute left-0 right-0 border-t border-border/50" style={{
              top: index * TIME_SLOT_HEIGHT
            }} />)}
                
                {/* Half-hour lines */}
                {timeSlots.slice(0, -1).map((_, index) => <div key={`half-${index}`} className="absolute left-0 right-0 border-t border-border/20" style={{
              top: index * TIME_SLOT_HEIGHT + TIME_SLOT_HEIGHT / 2
            }} />)}
                
                {/* Showtime Blocks */}
                {getShowtimesForRoom(room.id).map(showtime => <ScheduleBlock key={showtime.id} showtime={showtime} conflicts={showtimeConflicts[showtime.id]} onDelete={onDeleteShowtime} onClick={onShowtimeClick} />)}
              </div>
            </div>)}
        </div>
      </ScrollArea>
    </div>;
}