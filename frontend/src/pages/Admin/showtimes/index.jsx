"use client";

import { AdminLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Plus, MoreHorizontal, Pencil, Trash2, Clock, List, AlertCircle, Eye, Loader2 } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';

import movieApi from '../../../api/movieApi';
import cinemaApi from '../../../api/cinemaApi';
import roomApi from '../../../api/roomApi';
import showtimeApi from '../../../api/showtimeApi';

const getLocalYYYYMMDD = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
};

const TODAY = getLocalYYYYMMDD();

export default function AdminShowtimesPage() {
  const { toast } = useToast();
  
  // Data states
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [showtimes, setShowtimes] = useState([]);

  // Filter states
  const [selectedMovie, setSelectedMovie] = useState('all');
  const [selectedCinema, setSelectedCinema] = useState('all');
  const [selectedDate, setSelectedDate] = useState(TODAY);

  // Modal states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    movieId: '', cinemaId: '', roomId: '', date: TODAY, startTime: '09:00', priceOverride: 90000
  });

  // Seat modal states
  const [selectedShowtimeForSeats, setSelectedShowtimeForSeats] = useState(null);
  const [showtimeSeats, setShowtimeSeats] = useState([]);
  const [isSeatsDialogOpen, setIsSeatsDialogOpen] = useState(false);
  const [isLoadingSeats, setIsLoadingSeats] = useState(false);

  const handleViewSeats = async (showtime) => {
    setSelectedShowtimeForSeats(showtime);
    setIsSeatsDialogOpen(true);
    setIsLoadingSeats(true);
    try {
      const res = await showtimeApi.getSeats(showtime.showtimeId);
      if (res.success) {
        setShowtimeSeats(res.data || []);
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Lỗi", description: "Không thể tải sơ đồ ghế của suất chiếu này", variant: "destructive" });
    } finally {
      setIsLoadingSeats(false);
    }
  };

  const formattedSeatsGrid = useMemo(() => {
    if (!Array.isArray(showtimeSeats) || showtimeSeats.length === 0) {
      return [];
    }
    const grouped = {};
    showtimeSeats.forEach(s => {
      if (s && s.rowLabel) {
        if (!grouped[s.rowLabel]) grouped[s.rowLabel] = [];
        grouped[s.rowLabel].push(s);
      }
    });

    return Object.keys(grouped).sort().map(rowLabel => {
      const rowSeats = grouped[rowLabel].sort((a, b) => (a.colNumber || 0) - (b.colNumber || 0));
      return {
        rowLabel,
        seats: rowSeats
      };
    });
  }, [showtimeSeats]);

  const fetchData = async () => {
    try {
      const [moviesRes, cinemasRes, roomsRes, showtimesRes] = await Promise.all([
        movieApi.getMovies({ page: 0, size: 100 }),
        cinemaApi.getCinemas({ page: 0, size: 100 }),
        roomApi.getRooms({ page: 0, size: 100 }),
        showtimeApi.getAllShowtimes({ page: 0, size: 100 })
      ]);
      setMovies(moviesRes.data?.content || []);
      setCinemas(cinemasRes.data?.content || []);
      setRooms(roomsRes.data?.content || []);
      
      const mappedShowtimes = (showtimesRes.data?.content || []).map(s => {
        const dateTime = s.startTime.split('T');
        const endDateTime = s.endTime.split('T');
        return {
          ...s,
          date: dateTime[0],
          timeString: dateTime[1].substring(0, 5),
          endTimeString: endDateTime[1].substring(0, 5),
          availableSeats: s.availableSeats !== undefined ? s.availableSeats : s.totalSeats,
        };
      });
      setShowtimes(mappedShowtimes);
    } catch (error) {
      console.error("Failed to fetch data", error);
      toast({ title: "Lỗi", description: "Không thể tải dữ liệu", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = showtimes.filter(s => {
    const matchMovie = selectedMovie === 'all' || s.movieId === Number(selectedMovie);
    const matchCinema = selectedCinema === 'all' || s.cinemaId === Number(selectedCinema);
    const matchDate = s.date === selectedDate;
    return matchMovie && matchCinema && matchDate;
  });

  const openAdd = () => {
    setFormData({ 
      movieId: movies[0]?.movieId?.toString() || '', 
      cinemaId: cinemas[0]?.cinemaId?.toString() || '', 
      roomId: '', 
      date: selectedDate, 
      startTime: '09:00', 
      priceOverride: 90000 
    });
    setErrorMsg('');
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    setErrorMsg('');
    try {
      if (!formData.movieId || !formData.cinemaId || !formData.roomId) {
        throw new Error("Vui lòng chọn đầy đủ Phim, Rạp và Phòng!");
      }

      const startTimeStr = `${formData.date}T${formData.startTime}:00`;
      
      const payload = {
        movieId: Number(formData.movieId),
        cinemaId: Number(formData.cinemaId),
        roomId: Number(formData.roomId),
        startTime: startTimeStr
      };

      await showtimeApi.createShowtime(payload);
      toast({ title: "Thành công", description: "Đã thêm suất chiếu mới" });
      setIsDialogOpen(false);
      setSelectedDate(formData.date); // Tự động chuyển bộ lọc về ngày vừa tạo
      fetchData(); // Reload
    } catch (error) {
      setErrorMsg(error.response?.data?.error?.message || error.message || "Đã có lỗi xảy ra");
    }
  };

  // Lọc phòng theo Rạp đã chọn trong Form
  const formRooms = rooms.filter(r => r.cinemaId === Number(formData.cinemaId));
  
  // Các phòng của Rạp đang được chọn ở bộ lọc (dành cho màn hình Timeline)
  const timelineRooms = selectedCinema !== 'all' ? rooms.filter(r => r.cinemaId === Number(selectedCinema)) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Lịch chiếu</h1>
          <p className="text-muted-foreground mt-1">Sắp xếp lịch chiếu, kiểm tra trùng lặp thời gian trống</p>
        </div>
        <Button className="gap-2" onClick={openAdd}>
          <Plus className="w-4 h-4" />
          Thêm suất chiếu
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            label: `Tổng suất chiếu ngày ${selectedDate}`,
            value: filtered.length
          }, {
            label: 'Tổng ghế trống',
            value: filtered.reduce((acc, s) => acc + s.availableSeats, 0).toLocaleString()
          }, {
            label: 'Công suất trung bình',
            value: filtered.length > 0 ? Math.round((1 - filtered.reduce((acc, s) => acc + s.availableSeats, 0) / filtered.reduce((acc, s) => acc + s.totalSeats, 0)) * 100) + '%' : '0%'
          }
        ].map(s => (
          <Card key={s.label} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content (Tabs) */}
      <Card className="bg-card border-border">
        <Tabs defaultValue="list">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Input 
                type="date" 
                value={selectedDate} 
                onChange={e => setSelectedDate(e.target.value)}
                className="w-40"
              />
              <Select value={selectedMovie} onValueChange={setSelectedMovie}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Chọn phim" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả phim</SelectItem>
                  {movies.map(m => (
                    <SelectItem key={m.movieId} value={m.movieId.toString()}>{m.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedCinema} onValueChange={setSelectedCinema}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Chọn rạp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả rạp</SelectItem>
                  {cinemas.map(c => <SelectItem key={c.cinemaId} value={c.cinemaId.toString()}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <TabsList>
              <TabsTrigger value="list" className="gap-2"><List className="w-4 h-4" /> Danh sách</TabsTrigger>
              <TabsTrigger value="calendar" className="gap-2"><Calendar className="w-4 h-4" /> Lịch phòng</TabsTrigger>
            </TabsList>
          </CardHeader>
          
          <CardContent className="p-0">
            <TabsContent value="list" className="m-0 border-t border-border">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead>Phim</TableHead>
                    <TableHead>Rạp</TableHead>
                    <TableHead>Phòng</TableHead>
                    <TableHead>Giờ chiếu</TableHead>
                    <TableHead>Ghế trống</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Không có suất chiếu nào
                      </TableCell>
                    </TableRow>
                  ) : filtered.map(s => {
                    const occupancy = Math.round((1 - s.availableSeats / s.totalSeats) * 100);
                    return (
                      <TableRow key={s.showtimeId} className="border-border">
                        <TableCell className="font-medium max-w-[200px] truncate">{s.movieTitle}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{s.cinemaName}</TableCell>
                        <TableCell className="text-sm font-semibold text-primary">{s.roomName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm font-medium">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            {s.timeString} – {s.endTimeString}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{s.availableSeats}/{s.totalSeats}</TableCell>
                        <TableCell>
                          <Badge className={occupancy >= 80 ? 'bg-red-500/20 text-red-500' : occupancy >= 50 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'}>
                            {s.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="gap-1 hover:text-primary"
                            onClick={() => handleViewSeats(s)}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Xem ghế
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="calendar" className="m-0 border-t border-border p-6 overflow-x-auto">
              <div className="min-w-[800px]">
                {selectedCinema === 'all' ? (
                  <div className="text-center py-10 text-muted-foreground flex flex-col items-center">
                    <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                    Vui lòng chọn 1 rạp chiếu cụ thể ở bộ lọc để xem Lịch phòng (Timeline)
                  </div>
                ) : timelineRooms.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    Rạp này chưa có phòng chiếu nào.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {timelineRooms.map(room => {
                      const roomShowtimes = filtered.filter(s => s.roomId === room.roomId).sort((a, b) => a.timeString.localeCompare(b.timeString));
                      return (
                        <div key={room.roomId} className="flex flex-col gap-2 p-4 bg-muted/20 rounded-lg border border-border">
                          <h3 className="font-bold text-primary">{room.name} (Sức chứa: {room.capacity})</h3>
                          <div className="flex gap-2 relative h-16 w-full rounded bg-secondary/30 items-center px-2 overflow-x-auto">
                            {roomShowtimes.length === 0 && <span className="text-xs text-muted-foreground absolute left-1/2 -translate-x-1/2">Trống toàn bộ</span>}
                            {roomShowtimes.map(s => {
                              const getMins = t => {
                                const [h, m] = t.split(':').map(Number);
                                return h * 60 + m;
                              };
                              const dayStart = 8 * 60; // 08:00
                              const dayEnd = 24 * 60;
                              const totalMins = dayEnd - dayStart;
                              
                              const start = Math.max(0, getMins(s.timeString) - dayStart);
                              const end = Math.min(totalMins, getMins(s.endTimeString) - dayStart);
                              const width = (end - start) / totalMins * 100;
                              const left = start / totalMins * 100;
                              
                              return (
                                <div 
                                  key={s.showtimeId} 
                                  className="absolute h-10 bg-primary/20 border border-primary/50 text-primary rounded-md flex flex-col justify-center px-2 shadow-sm text-xs cursor-pointer hover:bg-primary/30 transition-colors"
                                  style={{ left: `${left}%`, width: `${width}%` }}
                                >
                                  <span className="font-bold truncate">{s.movieTitle}</span>
                                  <span>{s.timeString} - {s.endTimeString}</span>
                                </div>
                              );
                            })}
                          </div>
                          {/* Time markers */}
                          <div className="flex justify-between text-[10px] text-muted-foreground px-2">
                            <span>08:00</span>
                            <span>12:00</span>
                            <span>16:00</span>
                            <span>20:00</span>
                            <span>24:00</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Add Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Thêm suất chiếu mới</DialogTitle>
          </DialogHeader>
          
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-md text-red-500 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>{errorMsg}</p>
            </div>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Phim</Label>
              <Select value={formData.movieId} onValueChange={v => setFormData({ ...formData, movieId: v })}>
                <SelectTrigger><SelectValue placeholder="Chọn phim" /></SelectTrigger>
                <SelectContent>
                  {movies.map(m => <SelectItem key={m.movieId} value={m.movieId.toString()}>{m.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Rạp chiếu</Label>
                <Select value={formData.cinemaId} onValueChange={v => setFormData({ ...formData, cinemaId: v, roomId: '' })}>
                  <SelectTrigger><SelectValue placeholder="Chọn rạp" /></SelectTrigger>
                  <SelectContent>
                    {cinemas.map(c => <SelectItem key={c.cinemaId} value={c.cinemaId.toString()}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Phòng chiếu</Label>
                <Select value={formData.roomId} onValueChange={v => setFormData({ ...formData, roomId: v })} disabled={!formData.cinemaId}>
                  <SelectTrigger><SelectValue placeholder={formData.cinemaId ? "Chọn phòng" : "Vui lòng chọn rạp trước"} /></SelectTrigger>
                  <SelectContent>
                    {formRooms.map(r => <SelectItem key={r.roomId} value={r.roomId.toString()}>{r.name} (Sức chứa: {r.capacity})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Ngày chiếu</Label>
                <Input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Giờ bắt đầu</Label>
                <Input type="time" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleSave}>Lưu thông tin</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Seats Dialog */}
      <Dialog open={isSeatsDialogOpen} onOpenChange={setIsSeatsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sơ đồ ghế - Suất chiếu {selectedShowtimeForSeats?.timeString}</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm space-y-1">
            <p><strong>Phim:</strong> {selectedShowtimeForSeats?.movieTitle}</p>
            <p><strong>Phòng:</strong> {selectedShowtimeForSeats?.roomName} ({selectedShowtimeForSeats?.cinemaName})</p>
          </div>

          {isLoadingSeats ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : showtimeSeats.length === 0 ? (
            <div className="text-center p-6 text-muted-foreground">Không có dữ liệu ghế.</div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-4/5 h-1.5 bg-primary/60 rounded-full" />
              <p className="text-[10px] text-muted-foreground -mt-3">MÀN HÌNH</p>

              {/* Grid */}
              <div className="space-y-1.5 mt-4 overflow-x-auto w-full max-w-full pb-2">
                {formattedSeatsGrid.map(row => (
                  <div key={row.rowLabel} className="flex items-center gap-1 justify-center min-w-max">
                    <span className="w-4 text-[10px] text-muted-foreground text-center">{row.rowLabel}</span>
                    <div className="flex gap-1">
                      {row.seats.map((seat, indexInRow) => {
                        if (indexInRow > 0 && row.seats[indexInRow - 1] && row.seats[indexInRow - 1].seatType === 'Couple' && seat.seatType === 'Hidden') {
                          return null;
                        }
                        
                        let seatBg = 'bg-secondary/40 border-border';
                        let textColor = 'text-foreground';
                        if (seat.status === 'Booked') {
                          seatBg = 'bg-red-500/80 border-red-600 text-white font-semibold';
                        } else if (seat.status === 'Held') {
                          seatBg = 'bg-orange-500/80 border-orange-600 text-white font-semibold';
                        } else {
                          if (seat.seatType === 'VIP') seatBg = 'bg-yellow-500/20 border-yellow-500/40 text-yellow-600';
                          else if (seat.seatType === 'Couple') seatBg = 'bg-pink-500/20 border-pink-500/40 text-pink-600';
                        }

                        if (seat.seatType === 'Hidden' && seat.status !== 'Booked' && seat.status !== 'Held') {
                          return <div key={seat.seatId} className="w-6 h-6 opacity-0 pointer-events-none" />;
                        }

                        return (
                          <div
                            key={seat.seatId}
                            className={cn(
                              "h-6 rounded-t-sm text-[9px] flex items-center justify-center border transition-colors select-none",
                              seat.seatType === 'Couple' ? 'w-14' : 'w-6',
                              seatBg,
                              textColor
                            )}
                            title={`${seat.seatLabel || ''} [${seat.seatType || ''}] - ${seat.status || ''}`}
                          >
                            {(seat.seatLabel || '').replace(/^[A-Z]+/, '')}
                          </div>
                        );
                      })}
                    </div>
                    <span className="w-4 text-[10px] text-muted-foreground text-center">{row.rowLabel}</span>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center flex-wrap gap-4 text-[11px] text-muted-foreground pt-4 border-t w-full mt-4">
                <div className="flex items-center gap-1"><div className="w-3.5 h-3.5 rounded-t-sm bg-secondary/40 border" /> Thường</div>
                <div className="flex items-center gap-1"><div className="w-3.5 h-3.5 rounded-t-sm bg-yellow-500/20 border border-yellow-500/40" /> VIP</div>
                <div className="flex items-center gap-1"><div className="w-3.5 h-3.5 rounded-t-sm bg-pink-500/20 border border-pink-500/40" /> Ghế đôi</div>
                <div className="flex items-center gap-1"><div className="w-3.5 h-3.5 rounded-t-sm bg-red-500/80 border border-red-600" /> Đã bán</div>
                <div className="flex items-center gap-1"><div className="w-3.5 h-3.5 rounded-t-sm bg-orange-500/80 border border-orange-600" /> Đang giữ (chờ thanh toán)</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsSeatsDialogOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
