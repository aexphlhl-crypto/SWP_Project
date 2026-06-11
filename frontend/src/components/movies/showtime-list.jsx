"use client";

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
export function ShowtimeList({
  movieId,
  showtimes,
  onSelectShowtime
}) {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const dates = useMemo(() => {
    const result = [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(new Date(), i);
      result.push({
        value: format(date, 'yyyy-MM-dd'),
        label: i === 0 ? 'Hôm nay' : i === 1 ? 'Ngày mai' : format(date, 'EEEE', {
          locale: vi
        }),
        date: format(date, 'dd/MM')
      });
    }
    return result;
  }, []);
  const filteredShowtimes = useMemo(() => {
    return showtimes.filter(s => s.date === selectedDate);
  }, [showtimes, selectedDate]);
  const groupedByCinema = useMemo(() => {
    const groups = {};
    filteredShowtimes.forEach(showtime => {
      if (!groups[showtime.cinemaId]) {
        groups[showtime.cinemaId] = [];
      }
      groups[showtime.cinemaId].push(showtime);
    });
    return groups;
  }, [filteredShowtimes]);
  return <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-lg font-semibold">Chọn ngày chiếu</h3>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-1.5 pb-2">
            {dates.map(date => <Button key={date.value} variant={selectedDate === date.value ? 'default' : 'outline'} className={`flex-shrink-0 flex-col h-auto py-1.5 px-3 ${selectedDate === date.value ? 'bg-primary hover:bg-primary/90' : ''}`} onClick={() => setSelectedDate(date.value)}>
                <span className="text-[10px] font-normal capitalize">{date.label}</span>
                <span className="text-xs font-semibold">{date.date}</span>
              </Button>)}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Suất chiếu</h3>
        
        {Object.keys(groupedByCinema).length > 0 ? <div className="space-y-4">
            {Object.entries(groupedByCinema).map(([cinemaId, cinemaShowtimes]) => {
          const cinema = cinemaShowtimes[0];
          const groupedByRoom = {};
          cinemaShowtimes.forEach(s => {
            if (!groupedByRoom[s.roomName]) {
              groupedByRoom[s.roomName] = [];
            }
            groupedByRoom[s.roomName].push(s);
          });
          return <Card key={cinemaId} className="overflow-hidden border-border/50 p-0">
                  <div className="border-b border-border/50 bg-secondary/30 px-4 py-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 size-4 text-primary" />
                      <div>
                        <h4 className="font-semibold">{cinema.cinemaName}</h4>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 p-4">
                    {Object.entries(groupedByRoom).map(([roomName, roomShowtimes]) => <div key={roomName}>
                        <div className="mb-2 flex items-center gap-2">
                          <Badge variant="outline" className="font-normal">
                            {roomName}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {roomShowtimes.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(showtime => {
                    const isPast = false;
                    const isLowSeats = showtime.availableSeats < 20;
                    return <Button key={showtime.id} variant="outline" size="sm" disabled={isPast || showtime.availableSeats === 0} className={`group relative flex-col h-auto py-1.5 px-2 hover:border-primary hover:bg-primary/10 ${isLowSeats ? 'border-orange-500/50' : ''}`} onClick={() => {
                      onSelectShowtime?.(showtime);
                      navigate(`/booking/${movieId}?id=${movieId}&cinema=${showtime.cinemaId}&room=${encodeURIComponent(showtime.roomName)}&date=${selectedDate}&time=${showtime.startTime}&showtimeId=${showtime.id}`);
                    }}>
                                  <span className="text-sm font-semibold leading-none">{showtime.startTime}</span>
                                  <span className="text-[10px] text-muted-foreground mt-0.5">
                                    {showtime.availableSeats === 0 ? <span className="text-destructive">Hết chỗ</span> : `${showtime.availableSeats} chỗ`}
                                  </span>
                                  <span className="text-[10px] text-accent mt-0.5">
                                    {new Intl.NumberFormat('vi-VN').format(showtime.price)}đ
                                  </span>
                                </Button>;
                  })}
                        </div>
                      </div>)}
                  </div>
                </Card>;
        })}
          </div> : <Card className="flex flex-col items-center justify-center p-8 text-center">
            <Clock className="mb-3 size-12 text-muted-foreground/50" />
            <h4 className="font-semibold">Chưa có suất chiếu</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Không có suất chiếu nào vào ngày này. Vui lòng chọn ngày khác.
            </p>
          </Card>}
      </div>
    </div>;
}
