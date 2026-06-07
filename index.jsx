"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, Plus, MoreHorizontal, Pencil, Trash2, Clock, List, AlertCircle,
  ChevronLeft, ChevronRight, BarChart3, TrendingUp, ArrowUpRight
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

import movieApi from '../../../api/movieApi';
import cinemaApi from '../../../api/cinemaApi';
import roomApi from '../../../api/roomApi';
import showtimeApi from '../../../api/showtimeApi';

const TODAY = new Date().toISOString().split('T')[0];

export default function AdminShowtimesPage() {
  const { toast } = useToast();
  
  // Data states
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [activeTab, setActiveTab] = useState('list');

  // Filter states
  const [selectedMovie, setSelectedMovie] = useState('all');
  const [selectedCinema, setSelectedCinema] = useState('all');
  const [selectedDate, setSelectedDate] = useState(TODAY);

  // Month & Week View states
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
    return new Date(d.setDate(diff));
  });
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Modal states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    movieId: '', cinemaId: '', roomId: '', date: TODAY, startTime: '09:00', priceOverride: 90000
  });

  const fetchData = async () => {
    try {
      const [moviesRes, cinemasRes, roomsRes, showtimesRes] = await Promise.all([
        movieApi.getMovies({ page: 0, size: 100 }),
        cinemaApi.getCinemas({ page: 0, size: 100 }),
        roomApi.getRooms({ page: 0, size: 100 }),
        showtimeApi.getAllShowtimes({ page: 0, size: 500 }) // Load up to 500 showtimes for calendar view
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
          occupancyRate: s.occupancyRate !== undefined ? s.occupancyRate : 0.0,
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

  // Filtered showtimes for List & Daily Timeline view
  const filtered = showtimes.filter(s => {
    const matchMovie = selectedMovie === 'all' || s.movieId === Number(selectedMovie);
    const matchCinema = selectedCinema === 'all' || s.cinemaId === Number(selectedCinema);
    const matchDate = s.date === selectedDate;
    return matchMovie && matchCinema && matchDate;
  });

  // Dynamic automatic conflict check on client side
  const conflict = useMemo(() => {
    if (!formData.movieId || !formData.roomId || !formData.startTime || !formData.date) return null;
    
    const selectedMovieObj = movies.find(m => m.movieId === Number(formData.movieId));
    const duration = selectedMovieObj ? selectedMovieObj.durationMin : 120;
    
    const startNew = new Date(`${formData.date}T${formData.startTime}:00`);
    const endNew = new Date(startNew.getTime() + (duration + 15) * 60000); // end time + 15 min buffer
    
    for (const s of showtimes) {
      if (s.roomId !== Number(formData.roomId)) continue;
      if (s.status === 'Cancelled') continue;
      if (isEditing && s.showtimeId === Number(editingId)) continue;
      
      const movieOfS = movies.find(m => m.movieId === s.movieId);
      const durationExist = movieOfS ? movieOfS.durationMin : 120;
      
      const startExist = new Date(`${s.date}T${s.timeString}:00`);
      const endExist = new Date(startExist.getTime() + (durationExist + 15) * 60000);
      
      if (startNew < endExist && endNew > startExist) {
        return s;
      }
    }
    return null;
  }, [formData, showtimes, movies, isEditing, editingId]);

  const openAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({ 
      movieId: movies[0]?.movieId?.toString() || '', 
      cinemaId: cinemas[0]?.cinemaId?.toString() || '', 
      roomId: rooms.filter(r => r.cinemaId === (cinemas[0]?.cinemaId))[0]?.roomId?.toString() || '', 
      date: selectedDate, 
      startTime: '09:00', 
      priceOverride: 90000 
    });
    setErrorMsg('');
    setIsDialogOpen(true);
  };

  const openEdit = (s) => {
    setIsEditing(true);
    setEditingId(s.showtimeId);
    setFormData({
      movieId: s.movieId.toString(),
      cinemaId: s.cinemaId.toString(),
      roomId: s.roomId.toString(),
      date: s.date,
      startTime: s.timeString,
      priceOverride: s.priceOverride || 90000
    });
    setErrorMsg('');
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc chắn muốn hủy/xóa suất chiếu này?")) return;
    try {
      await showtimeApi.deleteShowtime(id);
      toast({ title: "Thành công", description: "Đã hủy suất chiếu thành công" });
      fetchData();
    } catch (error) {
      toast({ 
        title: "Lỗi", 
        description: error.response?.data?.error?.message || "Không thể xóa suất chiếu", 
        variant: "destructive" 
      });
    }
  };

  const handleSave = async () => {
    setErrorMsg('');
    if (conflict) {
      setErrorMsg(`Xung đột lịch chiếu: Trùng khung giờ với suất phim "${conflict.movieTitle}" (${conflict.timeString} - ${conflict.endTimeString}) ở phòng này.`);
      return;
    }
    try {
      if (!formData.movieId || !formData.cinemaId || !formData.roomId) {
        throw new Error("Vui lòng chọn đầy đủ Phim, Rạp và Phòng!");
      }

      const startTimeStr = `${formData.date}T${formData.startTime}:00`;
      
      const payload = {
        movieId: Number(formData.movieId),
        cinemaId: Number(formData.cinemaId),
        roomId: Number(formData.roomId),
        startTime: startTimeStr,
        priceOverride: Number(formData.priceOverride)
      };

      if (isEditing) {
        await showtimeApi.updateShowtime(editingId, payload);
        toast({ title: "Thành công", description: "Đã cập nhật suất chiếu" });
      } else {
        await showtimeApi.createShowtime(payload);
        toast({ title: "Thành công", description: "Đã thêm suất chiếu mới" });
      }
      setIsDialogOpen(false);
      fetchData(); // Reload
    } catch (error) {
      setErrorMsg(error.response?.data?.error?.message || error.message || "Đã có lỗi xảy ra");
    }
  };

  // Helper for generating week days
  const weekDays = useMemo(() => {
    const days = [];
    const temp = new Date(currentWeekStart);
    const vietnameseDayNames = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    for (let i = 0; i < 7; i++) {
      const dateStr = temp.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        dayNumber: temp.getDate(),
        dayName: vietnameseDayNames[temp.getDay()],
        fullDate: new Date(temp)
      });
      temp.setDate(temp.getDate() + 1);
    }
    return days;
  }, [currentWeekStart]);

  const changeWeek = (direction) => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + direction * 7);
    setCurrentWeekStart(next);
  };

  // Helper for generating month days
  const monthDays = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sun
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    // Shift Sunday (0) to index 6, Monday to index 0
    const adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    
    const days = [];
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(null);
    }
    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(year, month, d);
      days.push({
        dateStr: date.toISOString().split('T')[0],
        dayNumber: d,
        dateObj: date
      });
    }
    return days;
  }, [currentMonthDate]);

  const changeMonth = (direction) => {
    const next = new Date(currentMonthDate);
    next.setMonth(next.getMonth() + direction);
    setCurrentMonthDate(next);
  };

  // Occupancy rate calculation by Room
  const roomStats = useMemo(() => {
    const stats = {};
    const dayShowtimes = showtimes.filter(s => s.date === selectedDate && s.status !== 'Cancelled');
    
    rooms.forEach(r => {
      if (selectedCinema !== 'all' && r.cinemaId !== Number(selectedCinema)) return;
      stats[r.roomId] = {
        roomId: r.roomId,
        roomName: r.name,
        cinemaName: cinemas.find(c => c.cinemaId === r.cinemaId)?.name || 'Rạp khác',
        capacity: r.capacity,
        totalShowtimes: 0,
        totalBooked: 0,
        totalSeats: 0
      };
    });

    dayShowtimes.forEach(s => {
      if (stats[s.roomId]) {
        const booked = s.totalSeats - s.availableSeats;
        stats[s.roomId].totalShowtimes += 1;
        stats[s.roomId].totalBooked += booked;
        stats[s.roomId].totalSeats += s.totalSeats;
      }
    });

    return Object.values(stats).map(stat => {
      const occupancy = stat.totalSeats > 0 ? (stat.totalBooked / stat.totalSeats) * 100 : 0.0;
      return {
        ...stat,
        occupancyRate: Math.round(occupancy * 100) / 100
      };
    }).sort((a, b) => b.occupancyRate - a.occupancyRate);
  }, [showtimes, rooms, cinemas, selectedDate, selectedCinema]);

  // Occupancy rate calculation by Showtime
  const showtimeStats = useMemo(() => {
    return filtered
      .filter(s => s.status !== 'Cancelled')
      .map(s => {
        const booked = s.totalSeats - s.availableSeats;
        return {
          ...s,
          booked,
          occupancyRate: s.occupancyRate
        };
      })
      .sort((a, b) => b.occupancyRate - a.occupancyRate);
  }, [filtered]);

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
          <p className="text-muted-foreground mt-1">Sắp xếp lịch chiếu, thống kê lấp đầy, kiểm tra xung đột tự động</p>
        </div>
        <Button className="gap-2" onClick={openAdd}>
          <Plus className="w-4 h-4" />
          Thêm suất chiếu
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            label: `Tổng suất chiếu ngày ${selectedDate}`,
            value: filtered.length
          }, {
            label: 'Tổng ghế trống',
            value: filtered.reduce((acc, s) => acc + s.availableSeats, 0).toLocaleString()
          }, {
            label: 'Công suất lấp đầy TB',
            value: filtered.filter(s => s.status !== 'Cancelled').length > 0 
              ? Math.round((filtered.filter(s => s.status !== 'Cancelled').reduce((acc, s) => acc + (s.totalSeats - s.availableSeats), 0) / 
                filtered.filter(s => s.status !== 'Cancelled').reduce((acc, s) => acc + s.totalSeats, 0)) * 100) + '%' 
              : '0%'
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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader className="flex flex-row items-center justify-between pb-4 flex-wrap gap-4 border-b border-border">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Filters are useful for list/timeline/occupancy tabs */}
              {(activeTab === 'list' || activeTab === 'calendar' || activeTab === 'occupancy') && (
                <>
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
                </>
              )}
              {activeTab === 'week' && (
                <div className="flex items-center gap-2 border border-border rounded-md px-3 py-1 bg-muted/10">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => changeWeek(-1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-semibold">
                    Tuần: {weekDays[0].dayNumber}/{new Date(weekDays[0].fullDate).getMonth() + 1} - {weekDays[6].dayNumber}/{new Date(weekDays[6].fullDate).getMonth() + 1}
                  </span>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => changeWeek(1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {activeTab === 'month' && (
                <div className="flex items-center gap-2 border border-border rounded-md px-3 py-1 bg-muted/10">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => changeMonth(-1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-semibold capitalize">
                    Tháng {currentMonthDate.getMonth() + 1} năm {currentMonthDate.getFullYear()}
                  </span>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => changeMonth(1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {activeTab === 'year' && (
                <div className="flex items-center gap-2 border border-border rounded-md px-3 py-1 bg-muted/10">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentYear(currentYear - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-semibold">
                    Năm {currentYear}
                  </span>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentYear(currentYear + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            
            <TabsList className="bg-muted/30">
              <TabsTrigger value="list" className="gap-2"><List className="w-4 h-4" /> Danh sách</TabsTrigger>
              <TabsTrigger value="calendar" className="gap-2"><Calendar className="w-4 h-4" /> Lịch phòng</TabsTrigger>
              <TabsTrigger value="week" className="gap-2"><Calendar className="w-4 h-4" /> Tuần</TabsTrigger>
              <TabsTrigger value="month" className="gap-2"><Calendar className="w-4 h-4" /> Tháng</TabsTrigger>
              <TabsTrigger value="year" className="gap-2"><Calendar className="w-4 h-4" /> Năm</TabsTrigger>
              <TabsTrigger value="occupancy" className="gap-2"><TrendingUp className="w-4 h-4" /> Thống kê lấp đầy</TabsTrigger>
            </TabsList>
          </CardHeader>
          
          <CardContent className="p-0">
            {/* 1. LIST VIEW */}
            <TabsContent value="list" className="m-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead>Phim</TableHead>
                    <TableHead>Rạp</TableHead>
                    <TableHead>Phòng</TableHead>
                    <TableHead>Giờ chiếu</TableHead>
                    <TableHead>Ghế bán/Tổng số</TableHead>
                    <TableHead>Tỷ lệ lấp đầy</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Không có suất chiếu nào
                      </TableCell>
                    </TableRow>
                  ) : filtered.map(s => {
                    const booked = s.totalSeats - s.availableSeats;
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
                        <TableCell className="text-sm">{booked}/{s.totalSeats}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                              <div className="bg-primary h-full" style={{ width: `${s.occupancyRate}%` }} />
                            </div>
                            <span className="text-xs font-semibold">{s.occupancyRate}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={s.status === 'Cancelled' ? 'bg-muted text-muted-foreground border-border' : s.occupancyRate >= 85 ? 'bg-red-500/20 text-red-500 border-red-500/30' : s.occupancyRate >= 50 ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' : 'bg-green-500/20 text-green-500 border-green-500/30'}>
                            {s.status === 'Scheduled' ? 'Đã lên lịch' : s.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="w-8 h-8"><MoreHorizontal className="w-4 h-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => openEdit(s)}>
                                <Pencil className="w-4 h-4 text-muted-foreground" /> Chỉnh sửa
                              </DropdownMenuItem>
                              {s.status !== 'Cancelled' && (
                                <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => handleDelete(s.showtimeId)}>
                                  <Trash2 className="w-4 h-4" /> Hủy suất chiếu
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TabsContent>
            
            {/* 2. DAILY ROOM TIMELINE */}
            <TabsContent value="calendar" className="m-0 p-6 overflow-x-auto">
              <div className="min-w-[800px]">
                {selectedCinema === 'all' ? (
                  <div className="text-center py-10 text-muted-foreground flex flex-col items-center border border-dashed border-border rounded-lg bg-muted/5">
                    <AlertCircle className="w-8 h-8 mb-2 opacity-50 text-muted-foreground" />
                    Vui lòng chọn 1 rạp chiếu cụ thể ở bộ lọc để xem Lịch phòng (Timeline)
                  </div>
                ) : timelineRooms.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground border border-dashed border-border rounded-lg">
                    Rạp này chưa có phòng chiếu nào.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {timelineRooms.map(room => {
                      const roomShowtimes = filtered.filter(s => s.roomId === room.roomId).sort((a, b) => a.timeString.localeCompare(b.timeString));
                      return (
                        <div key={room.roomId} className="flex flex-col gap-2 p-4 bg-muted/10 rounded-lg border border-border">
                          <div className="flex justify-between items-center">
                            <h3 className="font-bold text-primary">{room.name} (Sức chứa: {room.capacity})</h3>
                          </div>
                          <div className="flex gap-2 relative h-16 w-full rounded bg-secondary/20 items-center px-2 overflow-x-auto border border-border/50">
                            {roomShowtimes.length === 0 && <span className="text-xs text-muted-foreground absolute left-1/2 -translate-x-1/2">Trống toàn bộ</span>}
                            {roomShowtimes.map(s => {
                              const getMins = t => {
                                const [h, m] = t.split(':').map(Number);
                                return h * 60 + m;
                              };
                              const dayStart = 8 * 60; // 08:00
                              const dayEnd = 24 * 60; // 24:00
                              const totalMins = dayEnd - dayStart;
                              
                              const start = Math.max(0, getMins(s.timeString) - dayStart);
                              const end = Math.min(totalMins, getMins(s.endTimeString) - dayStart);
                              const width = (end - start) / totalMins * 100;
                              const left = start / totalMins * 100;
                              
                              // Background based on occupancy
                              const bgClass = s.status === 'Cancelled' ? 'bg-muted/40 border-muted-foreground/30 text-muted-foreground line-through' : s.occupancyRate >= 80 ? 'bg-red-500/20 border-red-500/50 text-red-700' : s.occupancyRate >= 50 ? 'bg-yellow-500/20 border-yellow-500/50 text-amber-700' : 'bg-green-500/20 border-green-500/50 text-green-700';

                              return (
                                <div 
                                  key={s.showtimeId} 
                                  onClick={() => openEdit(s)}
                                  className={`absolute h-12 border rounded-md flex flex-col justify-center px-2 shadow-sm text-xs cursor-pointer hover:brightness-95 transition-all`}
                                  style={{ left: `${left}%`, width: `${width}%` }}
                                >
                                  <span className="font-bold truncate">{s.movieTitle}</span>
                                  <span className="text-[10px] opacity-80">{s.timeString} - {s.endTimeString} | {s.occupancyRate}%</span>
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

            {/* 3. WEEK VIEW */}
            <TabsContent value="week" className="m-0 p-6">
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {weekDays.map(day => {
                  const dayShowtimes = showtimes.filter(s => s.date === day.date);
                  return (
                    <div key={day.date} className={`flex flex-col rounded-lg border p-3 bg-muted/5 ${day.date === TODAY ? 'border-primary ring-1 ring-primary/30' : 'border-border'}`}>
                      <div className="text-center border-b border-border pb-2 mb-2">
                        <p className={`text-xs font-semibold ${day.date === TODAY ? 'text-primary' : 'text-muted-foreground'}`}>{day.dayName}</p>
                        <p className={`text-lg font-bold ${day.date === TODAY ? 'text-primary' : 'text-foreground'}`}>{day.dayNumber}</p>
                      </div>
                      
                      <div className="flex-1 space-y-2 overflow-y-auto max-h-[350px] pr-1">
                        {dayShowtimes.length === 0 ? (
                          <p className="text-[11px] text-muted-foreground text-center py-6">Không có suất</p>
                        ) : (
                          dayShowtimes.map(s => (
                            <div 
                              key={s.showtimeId} 
                              onClick={() => openEdit(s)}
                              className={`p-2 rounded border text-[11px] cursor-pointer hover:brightness-95 transition-all ${s.status === 'Cancelled' ? 'bg-muted/40 border-muted/50 text-muted-foreground line-through' : s.occupancyRate >= 80 ? 'bg-red-500/10 border-red-500/20 text-red-700' : s.occupancyRate >= 50 ? 'bg-yellow-500/10 border-yellow-500/20 text-amber-700' : 'bg-green-500/10 border-green-500/20 text-green-700'}`}
                            >
                              <p className="font-bold truncate">{s.movieTitle}</p>
                              <div className="flex justify-between text-[10px] mt-1 text-muted-foreground">
                                <span>{s.timeString} - {s.roomName}</span>
                                <span className="font-semibold">{s.occupancyRate}%</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            {/* 4. MONTH VIEW */}
            <TabsContent value="month" className="m-0 p-6">
              <div className="grid grid-cols-7 gap-1 border border-border rounded-lg overflow-hidden bg-muted/10">
                {['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'].map(name => (
                  <div key={name} className="bg-muted/30 p-2 text-center text-xs font-bold text-muted-foreground border-b border-border">
                    {name}
                  </div>
                ))}
                
                {monthDays.map((day, idx) => {
                  if (!day) {
                    return <div key={`empty-${idx}`} className="bg-card/30 min-h-[90px] border-b border-r border-border/50" />;
                  }
                  
                  const dayShowtimes = showtimes.filter(s => s.date === day.dateStr);
                  const activeShowtimes = dayShowtimes.filter(s => s.status !== 'Cancelled');
                  const avgOccupancy = activeShowtimes.length > 0
                    ? Math.round(activeShowtimes.reduce((acc, s) => acc + s.occupancyRate, 0) / activeShowtimes.length)
                    : 0;

                  return (
                    <div 
                      key={day.dateStr} 
                      onClick={() => {
                        setSelectedDate(day.dateStr);
                        setActiveTab('list');
                      }}
                      className={`min-h-[95px] bg-card p-2 border-b border-r border-border hover:bg-muted/20 transition-all cursor-pointer flex flex-col justify-between ${day.dateStr === TODAY ? 'bg-primary/5 ring-1 ring-primary/20 inset-0' : ''}`}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${day.dateStr === TODAY ? 'bg-primary text-primary-foreground' : 'text-foreground'}`}>
                          {day.dayNumber}
                        </span>
                        {dayShowtimes.length > 0 && (
                          <Badge variant="outline" className={`text-[9px] px-1 h-4 ${avgOccupancy >= 80 ? 'border-red-500/40 text-red-500' : avgOccupancy >= 50 ? 'border-yellow-500/40 text-yellow-600' : 'border-green-500/40 text-green-500'}`}>
                            {dayShowtimes.length} suất
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-0.5 mt-2 flex-1 flex flex-col justify-end">
                        {dayShowtimes.slice(0, 2).map(s => (
                          <div key={s.showtimeId} className="text-[10px] truncate max-w-full text-muted-foreground flex justify-between gap-1">
                            <span className="font-medium">{s.timeString}</span>
                            <span className="truncate flex-1 text-left">{s.movieTitle}</span>
                          </div>
                        ))}
                        {dayShowtimes.length > 2 && (
                          <div className="text-[9px] text-right font-medium text-muted-foreground">+ {dayShowtimes.length - 2} suất nữa</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            {/* 5. YEAR VIEW */}
            <TabsContent value="year" className="m-0 p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 12 }).map((_, index) => {
                  const monthName = `Tháng ${index + 1}`;
                  const monthDate = new Date(currentYear, index, 1);
                  const firstDay = monthDate.toISOString().split('T')[0];
                  const lastDay = new Date(currentYear, index + 1, 0).toISOString().split('T')[0];
                  
                  const monthShowtimes = showtimes.filter(s => s.date >= firstDay && s.date <= lastDay);
                  const activeShowtimes = monthShowtimes.filter(s => s.status !== 'Cancelled');
                  const avgOccupancy = activeShowtimes.length > 0
                    ? Math.round(activeShowtimes.reduce((acc, s) => acc + s.occupancyRate, 0) / activeShowtimes.length)
                    : 0;

                  return (
                    <Card 
                      key={index} 
                      className="cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all border-border"
                      onClick={() => {
                        const nextMonth = new Date(currentMonthDate);
                        nextMonth.setMonth(index);
                        nextMonth.setFullYear(currentYear);
                        setCurrentMonthDate(nextMonth);
                        setActiveTab('month');
                      }}
                    >
                      <CardHeader className="p-4 pb-2 border-b border-border/50">
                        <CardTitle className="text-sm font-bold text-primary">{monthName}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Suất chiếu:</span>
                          <span className="font-semibold text-foreground">{monthShowtimes.length}</span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Lấp đầy TB:</span>
                          <span className="font-semibold text-foreground">{avgOccupancy}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden mt-1">
                          <div className={`h-full ${avgOccupancy >= 80 ? 'bg-red-500' : avgOccupancy >= 50 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${avgOccupancy}%` }} />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* 6. OCCUPANCY STATISTICS */}
            <TabsContent value="occupancy" className="m-0 p-6 space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                {/* Stat 1: Room Occupancy */}
                <Card className="col-span-1 border-border">
                  <CardHeader>
                    <CardTitle className="text-md flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-primary" /> Hiệu suất theo Phòng
                    </CardTitle>
                    <CardDescription>Tỷ lệ lấp đầy ghế trung bình ngày {selectedDate}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {roomStats.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">Không có dữ liệu suất chiếu</p>
                    ) : roomStats.map(stat => (
                      <div key={stat.roomId} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-foreground">{stat.roomName} <span className="text-[10px] text-muted-foreground font-normal">({stat.cinemaName})</span></span>
                          <span className="text-primary">{stat.occupancyRate}%</span>
                        </div>
                        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                          <div className={`h-full ${stat.occupancyRate >= 80 ? 'bg-red-500' : stat.occupancyRate >= 50 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${stat.occupancyRate}%` }} />
                        </div>
                        <div className="flex justify-between text-[9px] text-muted-foreground">
                          <span>{stat.totalShowtimes} suất chiếu</span>
                          <span>Đã bán: {stat.totalBooked}/{stat.totalSeats} ghế</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Stat 2: Showtime Occupancy list */}
                <Card className="col-span-2 border-border">
                  <CardHeader>
                    <CardTitle className="text-md flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" /> Chi tiết từng Suất chiếu
                    </CardTitle>
                    <CardDescription>Xếp hạng lấp đầy ghế từ cao đến thấp ngày {selectedDate}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border">
                          <TableHead>Phim</TableHead>
                          <TableHead>Phòng</TableHead>
                          <TableHead>Khung giờ</TableHead>
                          <TableHead>Số ghế bán</TableHead>
                          <TableHead>Tỷ lệ lấp đầy</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {showtimeStats.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              Không có dữ liệu suất chiếu
                            </TableCell>
                          </TableRow>
                        ) : showtimeStats.map(s => (
                          <TableRow key={s.showtimeId} className="border-border">
                            <TableCell className="font-semibold text-xs truncate max-w-[150px]">{s.movieTitle}</TableCell>
                            <TableCell className="text-xs">{s.roomName}</TableCell>
                            <TableCell className="text-xs">{s.timeString} - {s.endTimeString}</TableCell>
                            <TableCell className="text-xs">{s.booked}/{s.totalSeats}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge className={s.occupancyRate >= 80 ? 'bg-red-500/20 text-red-500 border-red-500/20' : s.occupancyRate >= 50 ? 'bg-yellow-500/20 text-yellow-600 border-yellow-500/20' : 'bg-green-500/20 text-green-500 border-green-500/20'}>
                                  {s.occupancyRate}%
                                </Badge>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Add / Edit Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Chỉnh sửa suất chiếu" : "Thêm suất chiếu mới"}</DialogTitle>
          </DialogHeader>
          
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-md text-red-500 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>{errorMsg}</p>
            </div>
          )}

          {/* Client conflict warning alert */}
          {conflict && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/50 rounded-md text-amber-600 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">⚠️ Cảnh báo xung đột lịch chiếu:</p>
                <p>Khung giờ này đang trùng với phim **{conflict.movieTitle}** ({conflict.timeString} - {conflict.endTimeString}) tại **{conflict.roomName}**.</p>
              </div>
            </div>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Phim</Label>
              <Select value={formData.movieId} onValueChange={v => setFormData({ ...formData, movieId: v })}>
                <SelectTrigger><SelectValue placeholder="Chọn phim" /></SelectTrigger>
                <SelectContent>
                  {movies.map(m => <SelectItem key={m.movieId} value={m.movieId.toString()}>{m.title} ({m.durationMin} phút)</SelectItem>)}
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

            <div className="grid gap-2">
              <Label>Giá vé mặc định (để trống nếu dùng giá hệ thống)</Label>
              <Input type="number" placeholder="90000" value={formData.priceOverride || ''} onChange={e => setFormData({ ...formData, priceOverride: e.target.value ? Number(e.target.value) : '' })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleSave} disabled={!!conflict}>
              {isEditing ? "Lưu thay đổi" : "Thêm suất chiếu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
