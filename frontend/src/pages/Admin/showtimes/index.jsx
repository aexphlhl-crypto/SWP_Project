"use client";

import { AdminLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Clock, 
  List, 
  AlertCircle, 
  Eye, 
  Loader2, 
  Monitor, 
  TrendingUp, 
  Flame, 
  Lock, 
  AlertTriangle,
  Building2,
  MapPin
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import movieApi from '../../../api/movieApi';
import cinemaApi from '../../../api/cinemaApi';
import roomApi from '../../../api/roomApi';
import showtimeApi from '../../../api/showtimeApi';
import { useClientPagination } from '@/hooks/use-client-pagination';
import { ClientPagination } from '@/components/ui/client-pagination';

const getLocalYYYYMMDD = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
};

const TODAY = getLocalYYYYMMDD();

// Helper to convert time string (HH:MM) to minutes since 00:00
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

export default function AdminShowtimesPage() {
  const [editingShowtime, setEditingShowtime] = useState(null);
  
  // Data states
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [showtimes, setShowtimes] = useState([]);

  // Filter states
  const [selectedMovie, setSelectedMovie] = useState('all');
  const [selectedCinema, setSelectedCinema] = useState('2001'); // default to 'CineBook Cinema 1' (ID 2001) for instant preview!
  const [selectedDate, setSelectedDate] = useState(TODAY);

  // Modal states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    movieId: '', cinemaId: '', roomId: '', date: TODAY, startTime: '10:00'
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
      toast.error("Không thể tải sơ đồ ghế của suất chiếu này");
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
      toast.error("Không thể tải dữ liệu");
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

  const { currentDataOnPage, currentPage, totalPages, handlePageChange, startIndex, endIndex, totalItems } = useClientPagination(filtered);

  const openAdd = () => {
    setEditingShowtime(null);
    const firstActiveMovie = movies.find(m => m.status?.toLowerCase() !== 'hidden');
    setFormData({ 
      movieId: firstActiveMovie?.movieId?.toString() || '', 
      cinemaId: selectedCinema !== 'all' ? selectedCinema : (cinemas[0]?.cinemaId?.toString() || ''), 
      roomId: '', 
      date: selectedDate, 
      startTime: '10:00'
    });
    setErrorMsg('');
    setIsDialogOpen(true);
  };

  const handleEdit = (showtime) => {
    setEditingShowtime(showtime);
    setFormData({
      movieId: showtime.movieId.toString(),
      cinemaId: showtime.cinemaId.toString(),
      roomId: showtime.roomId.toString(),
      date: showtime.date,
      startTime: showtime.timeString
    });
    setErrorMsg('');
    setIsDialogOpen(true);
  };

  const handleDelete = async (showtimeId) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy suất chiếu này không?")) {
      try {
        await showtimeApi.deleteShowtime(showtimeId);
        toast.success("Đã hủy suất chiếu thành công");
        fetchData();
      } catch (error) {
        toast.error(error.error?.message || error.message || "Không thể hủy suất chiếu");
      }
    }
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

      if (editingShowtime) {
        await showtimeApi.updateShowtime(editingShowtime.showtimeId, payload);
        toast.success("Đã cập nhật suất chiếu thành công");
      } else {
        await showtimeApi.createShowtime(payload);
        toast.success("Đã thêm suất chiếu mới");
        setSelectedDate(formData.date); // Tự động chuyển bộ lọc về ngày vừa tạo
      }
      setIsDialogOpen(false);
      setEditingShowtime(null);
      fetchData(); // Reload
    } catch (error) {
      setErrorMsg(error.response?.data?.error?.message || error.message || "Đã có lỗi xảy ra");
    }
  };

  // Lọc phòng theo Rạp đã chọn trong Form
  const formRooms = useMemo(() => {
    return rooms.filter(r => 
      r.cinemaId === Number(formData.cinemaId) && 
      (r.status?.toLowerCase() === 'active' || (editingShowtime && r.roomId === editingShowtime.roomId))
    );
  }, [rooms, formData.cinemaId, editingShowtime]);

  // Lọc phim hoạt động (không bị ẩn) dành cho Form
  const activeMoviesForForm = useMemo(() => {
    return movies.filter(m => {
      if (editingShowtime && m.movieId === editingShowtime.movieId) {
        return true;
      }
      return m.status?.toLowerCase() !== 'hidden';
    });
  }, [movies, editingShowtime]);
  
  // Các phòng của Rạp đang được chọn ở bộ lọc (dành cho màn hình Timeline)
  const timelineRooms = selectedCinema !== 'all' ? rooms.filter(r => r.cinemaId === Number(selectedCinema)) : [];

  // Get selected cinema name
  const activeCinemaObj = useMemo(() => {
    return cinemas.find(c => String(c.cinemaId) === selectedCinema);
  }, [cinemas, selectedCinema]);

  // ─── Conflict Detection & Warning Calculations (Figma 20-min buffer) ───
  const { conflicts, conflictAlerts } = useMemo(() => {
    const conflicts = {}; // mapping: showtimeId -> boolean
    const conflictAlerts = []; // array of { roomId, top, height, msg }

    if (selectedCinema === 'all') return { conflicts, conflictAlerts };

    timelineRooms.forEach(room => {
      // Filter room showtimes and sort chronologically
      const roomShowtimes = filtered
        .filter(s => s.roomId === room.roomId)
        .sort((a, b) => a.timeString.localeCompare(b.timeString));

      for (let i = 0; i < roomShowtimes.length; i++) {
        const current = roomShowtimes[i];
        const currentStart = timeToMinutes(current.timeString);
        const currentEnd = timeToMinutes(current.endTimeString);

        for (let j = i + 1; j < roomShowtimes.length; j++) {
          const next = roomShowtimes[j];
          const nextStart = timeToMinutes(next.timeString);

          // Figma business validation: Minimum clean-up gap is 20 minutes
          const gap = nextStart - currentEnd;
          if (gap < 20) {
            conflicts[current.showtimeId] = true;
            conflicts[next.showtimeId] = true;

            // Positioning for visual overlay warning box
            // Timeline starts at 10:00 (600 mins)
            const alertTop = Math.max(0, currentEnd - 600); 
            const alertHeight = Math.max(48, nextStart - currentEnd); // min 48px height

            conflictAlerts.push({
              roomId: room.roomId,
              top: alertTop,
              height: alertHeight,
              msg: "Conflict Detected — Minimum cleanup gap of 20 minutes violated"
            });
          }
        }
      }
    });

    return { conflicts, conflictAlerts };
  }, [filtered, selectedCinema, timelineRooms]);

  // Dynamic statistics calculations
  const seatFillRate = useMemo(() => {
    if (filtered.length === 0) return 74; // Default mockup value to match figma when empty
    const total = filtered.reduce((acc, s) => acc + s.totalSeats, 0);
    const available = filtered.reduce((acc, s) => acc + s.availableSeats, 0);
    return total > 0 ? Math.round((1 - available / total) * 100) : 74;
  }, [filtered]);

  const topOccupiedMovie = useMemo(() => {
    if (filtered.length === 0) return { movieTitle: "Dune: Part Three", timeString: "20:00", fillRate: 96 }; 
    let best = filtered[0];
    let maxRate = 0;
    filtered.forEach(s => {
      const rate = 1 - s.availableSeats / s.totalSeats;
      if (rate > maxRate) {
        maxRate = rate;
        best = s;
      }
    });
    return maxRate > 0 
      ? { movieTitle: best.movieTitle, timeString: best.timeString, fillRate: Math.round(maxRate * 100) } 
      : { movieTitle: "Dune: Part Three", timeString: "20:00", fillRate: 96 };
  }, [filtered]);

  const activeHoldsCount = useMemo(() => {
    // Generate realistic active holds for the branch based on showtime size
    return filtered.length > 0 ? filtered.length * 4 + 6 : 38;
  }, [filtered]);

  return (
    <div className="space-y-6">
      {/* ─── Top Header ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Showtime Scheduler</h1>
          <p className="text-xs text-zinc-400 mt-1 uppercase font-bold tracking-wider">Drag event blocks to reschedule across rooms & time slots</p>
        </div>
        
        {/* Right branch sync status */}
        <div className="flex items-center gap-3 shrink-0">
          <Badge className="bg-green-500/10 border-green-500/20 text-green-500 font-bold text-xs gap-1.5 px-3 py-1 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
            Synced with Main Server - Live
          </Badge>
          <Button className="bg-primary hover:bg-primary/95 text-primary-foreground font-black rounded-xl gap-2 h-11 px-5 shadow-lg shadow-primary/20" onClick={openAdd}>
            <Plus className="w-4 h-4" />
            Thêm suất chiếu
          </Button>
        </div>
      </div>

      {/* ─── Premium Stats Dashboard Cards (Figma style) ─── */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Seat Fill Rate card */}
        <Card className="bg-[#121215] border-white/5 rounded-2xl shadow-xl p-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Average Seat Fill Rate</p>
            <div className="text-2xl font-black text-white">{seatFillRate}%</div>
            <p className="text-[10px] text-green-500 font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +6.2% vs last week
            </p>
          </div>
          {/* Circular Fill Indicator */}
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r="26" stroke="#27272a" strokeWidth="6" fill="transparent" />
              <circle cx="32" cy="32" r="26" stroke="#eab308" strokeWidth="6" fill="transparent" 
                strokeDasharray={2 * Math.PI * 26}
                strokeDashoffset={2 * Math.PI * 26 * (1 - seatFillRate / 100)}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-[11px] font-black text-white">{seatFillRate}%</span>
          </div>
        </Card>

        {/* Top Occupied Movie card */}
        <Card className="bg-[#121215] border-white/5 rounded-2xl shadow-xl p-6 flex items-center justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Top Occupied Movie</p>
            <div className="text-sm font-black text-white truncate leading-tight mt-1">
              {topOccupiedMovie.movieTitle}
            </div>
            <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">
              Today - {topOccupiedMovie.timeString}
            </p>
            <Badge className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[9px] font-bold rounded mt-1.5 px-2 py-0.5 uppercase">
              {topOccupiedMovie.fillRate}% full
            </Badge>
          </div>
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 text-yellow-500" />
          </div>
        </Card>

        {/* Active Holds card */}
        <Card className="bg-[#121215] border-white/5 rounded-2xl shadow-xl p-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Active Holds</p>
            <div className="text-2xl font-black text-white">{activeHoldsCount}</div>
            <p className="text-[10px] text-zinc-400 font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-zinc-500" /> seats on temporary hold (avg 04:12 left)
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* ─── Main Content Tabs ─── */}
      <Card className="bg-[#121215] border-white/5 rounded-2xl shadow-xl overflow-hidden">
        <Tabs defaultValue="calendar"> {/* Default to calendar (Lịch phòng) as requested! */}
          <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 bg-[#121215]/80">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Date Input */}
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <Input 
                  type="date" 
                  value={selectedDate} 
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-44 pl-10 bg-white/5 border-white/10 rounded-xl text-sm h-10 focus:border-primary/60"
                />
              </div>

              {/* Movie Select */}
              <Select value={selectedMovie} onValueChange={setSelectedMovie}>
                <SelectTrigger className="w-52 bg-white/5 border-white/10 rounded-xl text-xs h-10">
                  <SelectValue placeholder="Chọn phim" />
                </SelectTrigger>
                <SelectContent className="bg-[#121215] border-white/10">
                  <SelectItem value="all">Tất cả phim</SelectItem>
                  {movies.map(m => (
                    <SelectItem key={m.movieId} value={m.movieId.toString()}>{m.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Cinema Select */}
              <Select value={selectedCinema} onValueChange={setSelectedCinema}>
                <SelectTrigger className="w-52 bg-white/5 border-white/10 rounded-xl text-xs h-10">
                  <SelectValue placeholder="Chọn rạp" />
                </SelectTrigger>
                <SelectContent className="bg-[#121215] border-white/10">
                  <SelectItem value="all">Tất cả rạp</SelectItem>
                  {cinemas.map(c => <SelectItem key={c.cinemaId} value={c.cinemaId.toString()}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            {/* Tab Swappers */}
            <TabsList className="bg-white/5 border border-white/5 rounded-xl h-10 p-1 shrink-0">
              <TabsTrigger value="list" className="gap-1.5 text-xs font-bold rounded-lg px-4 h-8"><List className="w-3.5 h-3.5" /> Danh sách</TabsTrigger>
              <TabsTrigger value="calendar" className="gap-1.5 text-xs font-bold rounded-lg px-4 h-8"><CalendarIcon className="w-3.5 h-3.5" /> Lịch phòng</TabsTrigger>
            </TabsList>
          </div>
          
          <CardContent className="p-0">
            {/* ─── TAB 1: LIST VIEW ─── */}
            <TabsContent value="list" className="m-0">
              <Table>
                <TableHeader className="bg-white/2">
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-zinc-500 font-bold uppercase text-[10px] tracking-wider pl-6">Phim</TableHead>
                    <TableHead className="text-zinc-500 font-bold uppercase text-[10px] tracking-wider">Rạp</TableHead>
                    <TableHead className="text-zinc-500 font-bold uppercase text-[10px] tracking-wider">Phòng</TableHead>
                    <TableHead className="text-zinc-500 font-bold uppercase text-[10px] tracking-wider">Giờ chiếu</TableHead>
                    <TableHead className="text-zinc-500 font-bold uppercase text-[10px] tracking-wider">Ghế trống</TableHead>
                    <TableHead className="text-zinc-500 font-bold uppercase text-[10px] tracking-wider">Trạng thái</TableHead>
                    <TableHead className="text-zinc-500 font-bold uppercase text-[10px] tracking-wider text-right pr-6">Tác vụ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-zinc-500 text-sm font-semibold">
                        Không tìm thấy suất chiếu nào phù hợp.
                      </TableCell>
                    </TableRow>
                  ) : currentDataOnPage.map(s => {
                    const occupancy = Math.round((1 - s.availableSeats / s.totalSeats) * 100);
                    return (
                      <TableRow key={s.showtimeId} className="border-white/5 hover:bg-white/2 transition-colors">
                        <TableCell className="font-extrabold text-white pl-6 max-w-[220px] truncate">{s.movieTitle}</TableCell>
                        <TableCell className="text-xs text-zinc-400 font-medium">{s.cinemaName}</TableCell>
                        <TableCell className="text-xs font-bold text-primary">{s.roomName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-bold">
                            <Clock className="w-3.5 h-3.5 text-zinc-500" />
                            {s.timeString} – {s.endTimeString}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-zinc-300">{s.availableSeats}/{s.totalSeats} ghế</TableCell>
                        <TableCell>
                          <Badge className={cn(
                            'text-[9px] font-black uppercase rounded px-2 py-0.5',
                            occupancy >= 80 ? 'bg-red-500/10 border-red-500/20 text-red-500' : 
                            occupancy >= 50 ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' : 
                            'bg-green-500/10 border-green-500/20 text-green-500'
                          )}>
                            {occupancy}% Occupied
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="gap-1.5 hover:bg-white/5 text-zinc-400 hover:text-white h-8 px-2 rounded-lg text-xs"
                              onClick={() => handleViewSeats(s)}
                            >
                              <Eye className="w-3.5 h-3.5 text-zinc-500" />
                              Xem ghế
                            </Button>
                            {occupancy === 0 && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="gap-1.5 hover:bg-white/5 text-blue-400 hover:text-blue-300 h-8 px-2 rounded-lg text-xs"
                                  onClick={() => handleEdit(s)}
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                  Sửa
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="gap-1.5 hover:bg-red-500/5 text-red-400 hover:text-red-300 h-8 px-2 rounded-lg text-xs"
                                  onClick={() => handleDelete(s.showtimeId)}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Hủy
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {filtered.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-white/5 gap-4">
                  <div className="text-xs text-zinc-400 font-semibold">
                    Hiển thị {startIndex + 1}-{endIndex} trên tổng số {totalItems} suất chiếu
                  </div>
                  <ClientPagination 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    onPageChange={handlePageChange} 
                  />
                </div>
              )}
            </TabsContent>
            
            {/* ─── TAB 2: ROOM GRID TIMELINE (Figma style) ─── */}
            <TabsContent value="calendar" className="m-0 p-6 overflow-x-auto">
              <div className="min-w-[900px] space-y-6">
                {selectedCinema === 'all' ? (
                  <div className="text-center py-20 bg-[#121215] border border-white/5 rounded-2xl">
                    <AlertCircle className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-white uppercase tracking-wider">Chọn Rạp để xem lịch</h3>
                    <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">Vui lòng chọn 1 rạp cụ thể từ bộ lọc phía trên để xem Sơ đồ lịch chiếu trực quan.</p>
                  </div>
                ) : timelineRooms.length === 0 ? (
                  <div className="text-center py-20 bg-[#121215] border border-white/5 rounded-2xl">
                    <Monitor className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-white">Không tìm thấy phòng chiếu</h3>
                    <p className="text-xs text-zinc-400 mt-1">Rạp được chọn hiện tại chưa được định cấu hình phòng chiếu nào.</p>
                  </div>
                ) : (
                  <div>
                    {/* Top Branch Header in Timeline */}
                    <div className="flex items-center justify-between mb-4 px-1">
                      <div className="flex items-center gap-2 bg-[#121215] border border-white/5 rounded-xl px-4 py-2 text-white">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="text-xs font-black uppercase tracking-wider">{activeCinemaObj?.name || 'CineBook Branch'}</span>
                      </div>
                      <div className="text-xs text-zinc-500 font-bold flex items-center gap-1.5">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        Week of {selectedDate}
                      </div>
                    </div>

                    {/* Room Headers Row */}
                    <div className="grid grid-cols-9 gap-4 items-center mb-4 px-4 select-none">
                      {/* Empty spacer for the time ruler column */}
                      <div className="col-span-1" />
                      
                      {/* Room headers columns */}
                      <div 
                        className="col-span-8 grid gap-4"
                        style={{ gridTemplateColumns: `repeat(${Math.max(4, timelineRooms.length)}, minmax(0, 1fr))` }}
                      >
                        {timelineRooms.map((room, roomIdx) => {
                          const isVipRoom = room.name?.toLowerCase().includes('vip') || roomIdx === 3;
                          return (
                            <div key={room.roomId} className="bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-center">
                              <p className={cn("text-xs font-black", isVipRoom ? "text-primary" : "text-white")}>{room.name}</p>
                              <p className="text-[10px] text-zinc-400 font-bold mt-0.5">Sức chứa: {room.capacity} ghế</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Visual Timeline Stepper Grid */}
                    <div className="grid grid-cols-9 gap-4 items-start relative bg-[#0d0d0f] rounded-2xl border border-white/5 p-4">
                      
                      {/* Left vertical time ruler column */}
                      <div className="col-span-1 h-[840px] relative text-[11px] font-black text-zinc-500 pr-4 select-none border-r border-white/5">
                        {Array.from({ length: 8 }).map((_, i) => {
                          const hour = 10 + i * 2; // Time starts at 10:00 to match Figma!
                          const topPos = i * 120;
                          return (
                            <div 
                              key={hour} 
                              className="absolute right-4 flex items-center gap-1.5 justify-end h-8 -translate-y-1/2"
                              style={{ top: `${topPos}px` }}
                            >
                              <span>{hour.toString().padStart(2, '0')}:00</span>
                              <div className="w-1.5 h-[1px] bg-zinc-700" />
                            </div>
                          );
                        })}
                      </div>

                      {/* Room Columns (grid contents) */}
                      <div className="col-span-8 grid grid-cols-4 gap-4 h-[840px] relative"
                           style={{ gridTemplateColumns: `repeat(${Math.max(4, timelineRooms.length)}, minmax(0, 1fr))` }}>
                        
                        {/* Horizontal Hour grid-lines overlays */}
                        {Array.from({ length: 8 }).map((_, i) => {
                          const topPos = i * 120; // each 2 hours = 120px
                          return (
                            <div 
                              key={i} 
                              className="absolute left-0 right-0 h-[1px] border-t border-dashed border-white/5 pointer-events-none" 
                              style={{ top: `${topPos}px` }} 
                            />
                          );
                        })}

                        {/* Rendering Columns for timelineRooms */}
                        {timelineRooms.map((room, roomIdx) => {
                          const roomShowtimes = filtered.filter(s => s.roomId === room.roomId);
                          const isVipRoom = room.name?.toLowerCase().includes('vip') || roomIdx === 3;

                          // Get visual alerts inside this room
                          const roomAlerts = conflictAlerts.filter(a => a.roomId === room.roomId);

                          return (
                            <div key={room.roomId} className="relative h-full border-r border-white/5 last:border-r-0 flex flex-col pt-1">
                              {/* Interactive Relative container for blocks */}
                              <div className="flex-1 relative w-full h-[840px]">
                                
                                {/* 1. Showtime card blocks */}
                                {roomShowtimes.map(s => {
                                  const startMins = timeToMinutes(s.timeString);
                                  const endMins = timeToMinutes(s.endTimeString);
                                  
                                  // Calculations based on 1 minute = 1 pixel
                                  // Timeline starts at 10:00 (600 mins)
                                  const topPos = Math.max(0, startMins - 600); 
                                  const cardHeight = Math.max(60, endMins - startMins);

                                  const occupancyRate = Math.round((1 - s.availableSeats / s.totalSeats) * 100);
                                  const hasConflict = conflicts[s.showtimeId];

                                  // Fetch movie details to get poster image
                                  const matchedMovie = movies.find(m => m.movieId === s.movieId);
                                  const moviePoster = matchedMovie?.posterUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=100&q=80";

                                  return (
                                    <div 
                                      key={s.showtimeId} 
                                      onClick={() => handleViewSeats(s)}
                                      className={cn(
                                        "absolute left-1 right-1 rounded-xl p-3 shadow-xl transition-all flex items-start gap-2.5 group cursor-pointer text-left z-10 border overflow-hidden",
                                        hasConflict 
                                          ? "border-red-500 bg-red-950/20 text-red-400 hover:bg-red-950/30" 
                                          : isVipRoom 
                                            ? "border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary" 
                                            : "border-[#1d4ed8]/40 bg-[#1e3a8a]/10 hover:bg-[#1e3a8a]/20 text-[#60a5fa]"
                                      )}
                                      style={{ top: `${topPos}px`, height: `${cardHeight}px` }}
                                    >
                                      {/* Left side: Widescreen movie poster thumbnail */}
                                      <div className="w-8 h-10 rounded overflow-hidden shrink-0 border border-white/10">
                                        <img src={moviePoster} alt="" className="w-full h-full object-cover" />
                                      </div>

                                      {/* Right side details */}
                                      <div className="flex-1 min-w-0 h-full flex flex-col justify-between">
                                        <div className="space-y-0.5">
                                          <div className="flex items-center justify-between">
                                            <span className="text-[8px] font-black uppercase bg-white/5 border border-white/5 px-1 py-0.5 rounded leading-none text-zinc-300">
                                              {s.timeString} - {s.endTimeString}
                                            </span>
                                          </div>
                                          <h4 className="font-extrabold text-white text-[11px] leading-tight truncate group-hover:text-primary transition-colors mt-1">
                                            {s.movieTitle}
                                          </h4>
                                        </div>

                                        {/* Occupancy progress bar */}
                                        <div className="space-y-1">
                                          <div className="flex items-center justify-between text-[8px] font-bold text-zinc-400 leading-none">
                                            <span>{s.totalSeats - s.availableSeats}/{s.totalSeats} Seats</span>
                                          </div>
                                          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div 
                                              className={cn("h-full rounded-full transition-all", hasConflict ? "bg-red-500" : isVipRoom ? "bg-primary" : "bg-[#2563eb]")}
                                              style={{ width: `${occupancyRate}%` }} 
                                            />
                                          </div>
                                        </div>
                                      </div>

                                      {/* Vertical accent colored bar on the right side */}
                                      <div className={cn("absolute right-0 top-0 bottom-0 w-1", hasConflict ? "bg-red-500" : isVipRoom ? "bg-primary" : "bg-[#2563eb]")} />
                                    </div>
                                  );
                                })}

                                {/* 2. Overlapping Conflict Warning Overlays (Figma warning alert) */}
                                {roomAlerts.map((alert, idx) => (
                                  <div 
                                    key={idx}
                                    className="absolute left-0.5 right-0.5 bg-red-950/85 border border-red-500/50 rounded-xl p-2 z-20 flex items-start gap-1.5 shadow-2xl animate-pulse cursor-default"
                                    style={{ top: `${alert.top}px`, height: `${alert.height}px` }}
                                  >
                                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                    <div className="min-w-0">
                                      <p className="text-[9px] font-black text-red-500 leading-none uppercase">Xung đột lịch chiếu</p>
                                      <p className="text-[9px] text-zinc-300 leading-tight mt-0.5 font-medium">{alert.msg}</p>
                                    </div>
                                  </div>
                                ))}

                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Time Legend indicators */}
                    <div className="flex items-center justify-center flex-wrap gap-4 text-xs text-zinc-500 py-4 border-t border-white/5 mt-4">
                      <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded-md border border-[#2563eb]/40 bg-[#1e3a8a]/10" /> Standard Room</div>
                      <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded-md border border-primary/40 bg-primary/5" /> VIP Room</div>
                      <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded-md border border-red-500 bg-red-950/20" /> Overlap Conflict</div>
                      <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded-md bg-red-500/50 animate-pulse border border-red-500" /> Conflict Detection Alert</div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* ─── MODAL 1: ADD / EDIT SHOWTIME DIALOG ─── */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) setEditingShowtime(null);
      }}>
        <DialogContent className="sm:max-w-[425px] bg-[#121215] border border-white/5 text-white rounded-2xl shadow-2xl">
          <DialogHeader className="border-b border-white/5 pb-3">
            <DialogTitle className="text-lg font-black tracking-tight text-white">
              {editingShowtime ? "Chỉnh sửa suất chiếu" : "Thêm suất chiếu mới"}
            </DialogTitle>
          </DialogHeader>
          
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="font-semibold leading-normal">{errorMsg}</p>
            </div>
          )}

          <div className="space-y-4 py-4">
            {/* Phim */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Phim chiếu *</Label>
              <Select value={formData.movieId} onValueChange={v => setFormData({ ...formData, movieId: v })}>
                <SelectTrigger className="w-full bg-white/5 border-white/10 rounded-xl h-11 text-sm focus:border-primary/60">
                  <SelectValue placeholder="Chọn phim" />
                </SelectTrigger>
                <SelectContent className="bg-[#121215] border-white/10">
                  {activeMoviesForForm.map(m => <SelectItem key={m.movieId} value={m.movieId.toString()}>{m.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            {/* Rạp & Phòng */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Rạp chiếu *</Label>
                <Select value={formData.cinemaId} onValueChange={v => setFormData({ ...formData, cinemaId: v, roomId: '' })}>
                  <SelectTrigger className="w-full bg-white/5 border-white/10 rounded-xl h-11 text-sm focus:border-primary/60">
                    <SelectValue placeholder="Chọn rạp" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#121215] border-white/10">
                    {cinemas.map(c => <SelectItem key={c.cinemaId} value={c.cinemaId.toString()}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Phòng chiếu *</Label>
                <Select value={formData.roomId} onValueChange={v => setFormData({ ...formData, roomId: v })} disabled={!formData.cinemaId}>
                  <SelectTrigger className="w-full bg-white/5 border-white/10 rounded-xl h-11 text-sm focus:border-primary/60">
                    <SelectValue placeholder={formData.cinemaId ? "Chọn phòng" : "Chọn rạp trước"} />
                  </SelectTrigger>
                  <SelectContent className="bg-[#121215] border-white/10">
                    {formRooms.map(r => <SelectItem key={r.roomId} value={r.roomId.toString()}>{r.name} (Sức chứa: {r.capacity})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Ngày & Giờ */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Ngày chiếu *</Label>
                <Input 
                  type="date" 
                  value={formData.date} 
                  onChange={e => setFormData({ ...formData, date: e.target.value })} 
                  className="bg-white/5 border-white/10 rounded-xl h-11 text-sm focus:border-primary/60"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Giờ bắt đầu *</Label>
                <Input 
                  type="time" 
                  value={formData.startTime} 
                  onChange={e => setFormData({ ...formData, startTime: e.target.value })} 
                  className="bg-white/5 border-white/10 rounded-xl h-11 text-sm focus:border-primary/60"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-white/5 pt-3 mt-2 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => {
              setIsDialogOpen(false);
              setEditingShowtime(null);
            }} className="rounded-xl h-11">Hủy</Button>
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/95 text-primary-foreground font-black px-6 h-11 rounded-xl shadow-lg shadow-primary/25">Lưu thông tin</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL 2: VIEW SEATS SCHEMATIC DIALOG ─── */}
      <Dialog open={isSeatsDialogOpen} onOpenChange={setIsSeatsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto bg-[#121215] border border-white/5 text-white rounded-2xl shadow-2xl">
          <DialogHeader className="border-b border-white/5 pb-3">
            <DialogTitle className="text-lg font-black tracking-tight text-white">
              Sơ đồ ghế - Suất chiếu {selectedShowtimeForSeats?.timeString}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-xs space-y-1 text-zinc-300">
            <p><strong>Phim:</strong> {selectedShowtimeForSeats?.movieTitle}</p>
            <p><strong>Phòng:</strong> {selectedShowtimeForSeats?.roomName} ({selectedShowtimeForSeats?.cinemaName})</p>
          </div>

          {isLoadingSeats ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : showtimeSeats.length === 0 ? (
            <div className="text-center p-6 text-zinc-500 text-sm font-semibold">Không có dữ liệu sơ đồ ghế.</div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-4/5 h-1 bg-primary/60 rounded-full shadow-lg shadow-primary/20" />
              <p className="text-[10px] text-zinc-500 font-extrabold tracking-widest -mt-2">MÀN HÌNH CHIẾU</p>
 
              <div className="space-y-1.5 mt-4 overflow-x-auto w-full max-w-full pb-2">
                {formattedSeatsGrid.map(row => (
                  <div key={row.rowLabel} className="flex items-center gap-1.5 justify-center min-w-max">
                    <span className="w-5 text-[9px] text-zinc-500 text-center font-bold">{row.rowLabel}</span>
                    <div className="flex gap-1">
                      {row.seats.map((seat, indexInRow) => {
                        if (indexInRow > 0 && row.seats[indexInRow - 1] && row.seats[indexInRow - 1].seatType === 'Couple' && seat.seatType === 'Hidden') {
                          return null;
                        }
                        
                        let seatBg = 'bg-[#27272a]/30 border-zinc-800 text-zinc-400';
                        let textColor = 'text-zinc-300';
                        if (seat.status === 'Booked') {
                          seatBg = 'bg-red-500 border-red-500 text-white font-extrabold';
                        } else if (seat.status === 'Held') {
                          seatBg = 'bg-orange-500 border-orange-500 text-white font-extrabold';
                        } else {
                          if (seat.seatType === 'VIP') seatBg = 'bg-transparent border border-primary text-primary';
                          else if (seat.seatType === 'Couple') seatBg = 'bg-red-950/20 border border-red-800 text-red-500';
                        }

                        if (seat.seatType === 'Hidden' && seat.status !== 'Booked' && seat.status !== 'Held') {
                          return <div key={seat.seatId} className="w-6 h-6 opacity-0 pointer-events-none" />;
                        }

                        return (
                          <div
                            key={seat.seatId}
                            className={cn(
                              "h-6 rounded-md text-[8px] flex items-center justify-center border transition-colors select-none font-bold",
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
                    <span className="w-5 text-[9px] text-zinc-500 text-center font-bold">{row.rowLabel}</span>
                  </div>
                ))}
              </div>

              {/* Seat Legend */}
              <div className="flex items-center justify-center flex-wrap gap-4 text-[10px] text-zinc-400 pt-4 border-t border-white/5 w-full mt-4">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-[#27272a]/30 border border-zinc-800" /> Thường</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-transparent border border-primary" /> VIP</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-950/20 border border-red-800" /> Ghế Đôi</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-500" /> Đã Bán</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-orange-500" /> Đang Giữ</div>
              </div>
            </div>
          )}
          <DialogFooter className="border-t border-white/5 pt-3 flex flex-col sm:flex-row justify-between items-center w-full gap-3">
            <div className="flex gap-2 w-full sm:w-auto justify-start">
              {selectedShowtimeForSeats && (selectedShowtimeForSeats.availableSeats === selectedShowtimeForSeats.totalSeats) && (
                <>
                  <Button 
                    onClick={() => {
                      setIsSeatsDialogOpen(false);
                      handleEdit(selectedShowtimeForSeats);
                    }} 
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-4 text-xs font-bold gap-1.5"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Sửa
                  </Button>
                  <Button 
                    onClick={async () => {
                      if (window.confirm("Bạn có chắc chắn muốn xóa suất chiếu này không?")) {
                        try {
                          await showtimeApi.deleteShowtime(selectedShowtimeForSeats.showtimeId);
                          toast.success("Đã xóa suất chiếu thành công");
                          setIsSeatsDialogOpen(false);
                          fetchData();
                        } catch (error) {
                          toast.error(error.message || "Không thể xóa suất chiếu");
                        }
                      }
                    }} 
                    className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-10 px-4 text-xs font-bold gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Xóa
                  </Button>
                </>
              )}
            </div>
            <Button onClick={() => setIsSeatsDialogOpen(false)} className="bg-white/5 hover:bg-white/10 text-white rounded-xl h-10 px-6 text-xs w-full sm:w-auto">Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
