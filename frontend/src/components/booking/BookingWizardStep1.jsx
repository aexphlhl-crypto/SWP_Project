import { useState, useEffect, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { format, addDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Clock, MapPin, Loader2 } from 'lucide-react';
import showtimeApi from '@/api/showtimeApi';

export function BookingWizardStep1({ movies, cinemas, initialMovieId, initialDate, onNext }) {
  const [selectedMovieId, setSelectedMovieId] = useState(initialMovieId || '');
  const [selectedCinemaId, setSelectedCinemaId] = useState('all');
  const [selectedDate, setSelectedDate] = useState(initialDate || format(new Date(), 'yyyy-MM-dd'));
  
  const [showtimes, setShowtimes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Generate 7 days
  const dates = useMemo(() => {
    const result = [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(new Date(), i);
      result.push({
        value: format(date, 'yyyy-MM-dd'),
        label: i === 0 ? 'Hôm nay' : i === 1 ? 'Ngày mai' : format(date, 'EEEE', { locale: vi }),
        date: format(date, 'dd/MM')
      });
    }
    return result;
  }, []);

  useEffect(() => {
    if (selectedMovieId) {
      setIsLoading(true);
      // Fetch showtimes for the selected movie
      showtimeApi.getAllShowtimes({ size: 1000 })
        .then(res => {
          if (res.success && res.data?.content) {
            const allShowtimes = res.data.content;
            // Filter by movie
            const movieShowtimes = allShowtimes
              .filter(s => s.movieId.toString() === selectedMovieId.toString())
              .map(s => {
                const [datePart, timePart] = s.startTime.split('T');
                return {
                  ...s,
                  id: s.showtimeId,
                  date: datePart,
                  startTime: timePart.substring(0, 5) // "HH:mm"
                };
              });
            setShowtimes(movieShowtimes);
          }
        })
        .catch(err => console.error("Failed to load showtimes", err))
        .finally(() => setIsLoading(false));
    } else {
      setShowtimes([]);
    }
  }, [selectedMovieId]);

  const filteredShowtimes = useMemo(() => {
    return showtimes.filter(s => {
      const matchDate = s.date === selectedDate;
      const matchCinema = selectedCinemaId === 'all' || s.cinemaId.toString() === selectedCinemaId.toString();
      return matchDate && matchCinema;
    });
  }, [showtimes, selectedDate, selectedCinemaId]);

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

  const handleSelectShowtime = (showtime) => {
    onNext({
      movieId: showtime.movieId,
      cinemaId: showtime.cinemaId,
      roomName: showtime.roomName,
      date: showtime.date,
      time: showtime.startTime,
      showtimeId: showtime.id
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Chọn Phim</label>
          <Select value={selectedMovieId} onValueChange={setSelectedMovieId}>
            <SelectTrigger>
              <SelectValue placeholder="-- Chọn Phim --" />
            </SelectTrigger>
            <SelectContent>
              {movies.map(m => (
                <SelectItem key={m.id} value={m.id.toString()}>{m.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Chọn Rạp</label>
          <Select value={selectedCinemaId} onValueChange={setSelectedCinemaId}>
            <SelectTrigger>
              <SelectValue placeholder="Tất cả rạp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả rạp</SelectItem>
              {cinemas.map(c => (
                <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Dates */}
      {selectedMovieId && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Chọn Ngày Chiếu</label>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-2 pb-2">
              {dates.map(date => (
                <Button 
                  key={date.value} 
                  variant={selectedDate === date.value ? 'default' : 'outline'} 
                  className={`flex-shrink-0 flex-col h-auto py-2 px-4 ${selectedDate === date.value ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}`} 
                  onClick={() => setSelectedDate(date.value)}
                >
                  <span className="text-xs font-normal capitalize">{date.label}</span>
                  <span className="text-sm font-semibold">{date.date}</span>
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}

      {/* Showtimes */}
      {selectedMovieId && (
        <div className="space-y-4">
          <label className="text-sm font-medium">Suất Chiếu</label>
          
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : Object.keys(groupedByCinema).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(groupedByCinema).map(([cId, cinemaShowtimes]) => {
                const cinema = cinemas.find(c => c.id.toString() === cId.toString()) || { name: 'Unknown Cinema' };
                const groupedByRoom = {};
                cinemaShowtimes.forEach(s => {
                  if (!groupedByRoom[s.roomName]) groupedByRoom[s.roomName] = [];
                  groupedByRoom[s.roomName].push(s);
                });
                
                return (
                  <Card key={cId} className="overflow-hidden border-border/50 p-0">
                    <div className="border-b border-border/50 bg-secondary/30 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <h4 className="font-semibold text-sm">{cinema.name}</h4>
                      </div>
                    </div>
                    <div className="p-4 space-y-4">
                      {Object.entries(groupedByRoom).map(([roomName, roomShowtimes]) => (
                        <div key={roomName} className="space-y-2">
                          <span className="text-xs font-medium text-muted-foreground px-2 py-1 bg-secondary rounded-md">{roomName}</span>
                          <div className="flex flex-wrap gap-2">
                            {roomShowtimes.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(showtime => {
                              const isLowSeats = showtime.availableSeats < 20;
                              
                              const now = new Date();
                              const [hours, minutes] = showtime.startTime.split(':');
                              const [year, month, day] = showtime.date.split('-');
                              const showtimeDate = new Date(year, month - 1, day, hours, minutes);
                              const isExpired = showtimeDate < now;
                              
                              const isDisabled = showtime.availableSeats === 0 || isExpired;

                              return (
                                <Button 
                                  key={showtime.id} 
                                  variant="outline" 
                                  size="sm" 
                                  disabled={isDisabled}
                                  className={`group relative flex-col h-auto py-1.5 px-3 hover:border-primary hover:bg-primary/10 ${isLowSeats && !isDisabled ? 'border-orange-500/50' : ''}`}
                                  onClick={() => handleSelectShowtime(showtime)}
                                >
                                  <span className={`text-sm font-bold ${isExpired ? 'line-through text-muted-foreground' : ''}`}>{showtime.startTime}</span>
                                  <span className="text-[10px] text-muted-foreground mt-0.5">
                                    {isExpired ? <span className="text-muted-foreground">Đã chiếu</span> : showtime.availableSeats === 0 ? <span className="text-destructive">Hết chỗ</span> : `${showtime.availableSeats} chỗ trống`}
                                  </span>
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="flex flex-col items-center justify-center p-8 text-center bg-secondary/20">
              <Clock className="mb-3 w-10 h-10 text-muted-foreground/50" />
              <p className="font-medium text-sm">Không có suất chiếu nào</p>
              <p className="text-xs text-muted-foreground mt-1">Vui lòng chọn ngày hoặc rạp khác</p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
