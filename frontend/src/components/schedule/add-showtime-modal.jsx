"use client";

import { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Film, AlertTriangle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useData } from '@/contexts/data-context';
import { calculateEndTime, checkConflicts } from '@/lib/schedule-utils';
import { cn } from '@/lib/utils';
export function AddShowtimeModal({
  open,
  onOpenChange,
  rooms,
  existingShowtimes,
  selectedDate,
  onAdd
}) {
  const { movies } = useData();
  const [selectedMovieId, setSelectedMovieId] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [price, setPrice] = useState('75000');

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setSelectedMovieId('');
      setSelectedRoomId('');
      setStartTime('09:00');
      setPrice('75000');
    }
  }, [open]);

  // Get selected movie
  const selectedMovie = useMemo(() => {
    return movies.find(m => m.id === selectedMovieId);
  }, [selectedMovieId]);

  // Get selected room
  const selectedRoom = useMemo(() => {
    return rooms.find(r => r.id === selectedRoomId);
  }, [selectedRoomId]);

  // Calculate end time
  const endTime = useMemo(() => {
    if (!selectedMovie) return '';
    return calculateEndTime(startTime, selectedMovie.duration);
  }, [startTime, selectedMovie]);

  // Check for conflicts
  const conflicts = useMemo(() => {
    if (!selectedMovie || !selectedRoomId || !startTime || !endTime) {
      return [];
    }
    const newShowtime = {
      movieId: selectedMovieId,
      movie: selectedMovie,
      roomId: selectedRoomId,
      roomName: selectedRoom?.name || '',
      date: selectedDate,
      startTime,
      endTime,
      price: parseInt(price) || 0
    };
    return checkConflicts(newShowtime, existingShowtimes);
  }, [selectedMovie, selectedRoomId, startTime, endTime, selectedDate, existingShowtimes, price, selectedMovieId, selectedRoom]);

  // Generate time options (every 15 minutes)
  const timeOptions = useMemo(() => {
    const options = [];
    for (let hour = 8; hour < 24; hour++) {
      for (let min = 0; min < 60; min += 15) {
        options.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
      }
    }
    return options;
  }, []);

  // Available movies (only now_showing)
  const availableMovies = useMemo(() => {
    return movies.filter(m => m.status === 'now_showing');
  }, []);

  // Handle submit
  const handleSubmit = () => {
    if (!selectedMovie || !selectedRoomId || !startTime || !endTime) {
      return;
    }
    onAdd({
      movieId: selectedMovieId,
      movie: selectedMovie,
      roomId: selectedRoomId,
      roomName: selectedRoom?.name || '',
      date: selectedDate,
      startTime,
      endTime,
      price: parseInt(price) || 75000,
      status: 'scheduled'
    });
    onOpenChange(false);
  };
  const isValid = selectedMovieId && selectedRoomId && startTime && endTime && price;
  const hasConflicts = conflicts.length > 0;
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Film className="w-5 h-5 text-primary" />
            Thêm Ca Chiếu Mới
          </DialogTitle>
          <DialogDescription>
            Thêm ca chiếu cho ngày {format(new Date(selectedDate), 'dd/MM/yyyy', {
            locale: vi
          })}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Movie Selection */}
          <div className="space-y-2">
            <Label htmlFor="movie">Chọn phim</Label>
            <Select value={selectedMovieId} onValueChange={setSelectedMovieId}>
              <SelectTrigger id="movie" className="bg-background border-border">
                <SelectValue placeholder="Chọn phim..." />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border max-h-[300px]">
                <ScrollArea className="h-[250px]">
                  {availableMovies.map(movie => <SelectItem key={movie.id} value={movie.id}>
                      <div className="flex items-center gap-2">
                        <img src={movie.poster} alt={movie.title} className="w-8 h-12 object-cover rounded" />
                        <div className="flex flex-col">
                          <span className="font-medium truncate max-w-[280px]">{movie.title}</span>
                          <span className="text-xs text-muted-foreground">{movie.duration} phút</span>
                        </div>
                      </div>
                    </SelectItem>)}
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>
          
          {/* Room Selection */}
          <div className="space-y-2">
            <Label htmlFor="room">Chọn phòng chiếu</Label>
            <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
              <SelectTrigger id="room" className="bg-background border-border">
                <SelectValue placeholder="Chọn phòng..." />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {rooms.map(room => <SelectItem key={room.id} value={room.id}>
                    <div className="flex items-center gap-2">
                      <span>{room.name}</span>
                      <span className="text-xs text-muted-foreground">({room.capacity} ghế)</span>
                    </div>
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          
          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-time">Giờ bắt đầu</Label>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger id="start-time" className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border max-h-[200px]">
                  {timeOptions.map(time => <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Giờ kết thúc</Label>
              <div className="flex items-center h-10 px-3 rounded-md border border-border bg-muted/50 text-muted-foreground">
                {endTime || '--:--'}
                {selectedMovie && <span className="ml-2 text-xs">({selectedMovie.duration} phút)</span>}
              </div>
            </div>
          </div>
          
          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">Giá vé (VNĐ)</Label>
            <Input id="price" type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="75000" min={0} step={5000} className="bg-background border-border" />
          </div>
          
          {/* Conflict Warnings */}
          {hasConflicts && <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Xung đột lịch chiếu</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
                  {conflicts.map((conflict, index) => <li key={index}>{conflict.message}</li>)}
                </ul>
              </AlertDescription>
            </Alert>}
          
          {/* Preview */}
          {isValid && !hasConflicts && <Alert className="border-emerald-500/50 bg-emerald-500/10">
              <Check className="h-4 w-4 text-emerald-500" />
              <AlertTitle className="text-emerald-500">Sẵn sàng thêm ca chiếu</AlertTitle>
              <AlertDescription className="text-emerald-300/80">
                {selectedMovie?.title} - {selectedRoom?.name} ({startTime} - {endTime})
              </AlertDescription>
            </Alert>}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid} className={cn(hasConflicts && "bg-amber-600 hover:bg-amber-700")}>
            {hasConflicts ? 'Vẫn thêm (có xung đột)' : 'Thêm ca chiếu'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
}