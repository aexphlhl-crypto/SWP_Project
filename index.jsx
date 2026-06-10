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
      toast({ title: "Lß╗ùi", description: "Kh├┤ng thß╗â tß║úi s╞í ─æß╗ô ghß║┐ cß╗ºa suß║Ñt chiß║┐u n├áy", variant: "destructive" });
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
      toast({ title: "Lß╗ùi", description: "Kh├┤ng thß╗â tß║úi dß╗» liß╗çu", variant: "destructive" });
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
        throw new Error("Vui l├▓ng chß╗ìn ─æß║ºy ─æß╗º Phim, Rß║íp v├á Ph├▓ng!");
      }

      const startTimeStr = `${formData.date}T${formData.startTime}:00`;
      
      const payload = {
        movieId: Number(formData.movieId),
        cinemaId: Number(formData.cinemaId),
        roomId: Number(formData.roomId),
        startTime: startTimeStr
      };

      await showtimeApi.createShowtime(payload);
      toast({ title: "Th├ánh c├┤ng", description: "─É├ú th├¬m suß║Ñt chiß║┐u mß╗¢i" });
      setIsDialogOpen(false);
      setSelectedDate(formData.date); // Tß╗▒ ─æß╗Öng chuyß╗ân bß╗Ö lß╗ìc vß╗ü ng├áy vß╗½a tß║ío
      fetchData(); // Reload
    } catch (error) {
      setErrorMsg(error.response?.data?.error?.message || error.message || "─É├ú c├│ lß╗ùi xß║úy ra");
    }
  };

  // Lß╗ìc ph├▓ng theo Rß║íp ─æ├ú chß╗ìn trong Form
  const formRooms = rooms.filter(r => r.cinemaId === Number(formData.cinemaId));
  
  // C├íc ph├▓ng cß╗ºa Rß║íp ─æang ─æ╞░ß╗úc chß╗ìn ß╗ƒ bß╗Ö lß╗ìc (d├ánh cho m├án h├¼nh Timeline)
  const timelineRooms = selectedCinema !== 'all' ? rooms.filter(r => r.cinemaId === Number(selectedCinema)) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quß║ún l├╜ Lß╗ïch chiß║┐u</h1>
          <p className="text-muted-foreground mt-1">Sß║»p xß║┐p lß╗ïch chiß║┐u, kiß╗âm tra tr├╣ng lß║╖p thß╗¥i gian trß╗æng</p>
        </div>
        <Button className="gap-2" onClick={openAdd}>
          <Plus className="w-4 h-4" />
          Th├¬m suß║Ñt chiß║┐u
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            label: `Tß╗òng suß║Ñt chiß║┐u ng├áy ${selectedDate}`,
            value: filtered.length
          }, {
            label: 'Tß╗òng ghß║┐ trß╗æng',
            value: filtered.reduce((acc, s) => acc + s.availableSeats, 0).toLocaleString()
          }, {
            label: 'C├┤ng suß║Ñt trung b├¼nh',
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
                  <SelectValue placeholder="Chß╗ìn phim" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tß║Ñt cß║ú phim</SelectItem>
                  {movies.map(m => (
                    <SelectItem key={m.movieId} value={m.movieId.toString()}>{m.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedCinema} onValueChange={setSelectedCinema}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Chß╗ìn rß║íp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tß║Ñt cß║ú rß║íp</SelectItem>
                  {cinemas.map(c => <SelectItem key={c.cinemaId} value={c.cinemaId.toString()}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <TabsList>
              <TabsTrigger value="list" className="gap-2"><List className="w-4 h-4" /> Danh s├ích</TabsTrigger>
              <TabsTrigger value="calendar" className="gap-2"><Calendar className="w-4 h-4" /> Lß╗ïch ph├▓ng</TabsTrigger>
            </TabsList>
          </CardHeader>
          
          <CardContent className="p-0">
            <TabsContent value="list" className="m-0 border-t border-border">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead>Phim</TableHead>
                    <TableHead>Rß║íp</TableHead>
                    <TableHead>Ph├▓ng</TableHead>
                    <TableHead>Giß╗¥ chiß║┐u</TableHead>
                    <TableHead>Ghß║┐ trß╗æng</TableHead>
                    <TableHead>Trß║íng th├íi</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Kh├┤ng c├│ suß║Ñt chiß║┐u n├áo
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
                            {s.timeString} ΓÇô {s.endTimeString}
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
                            Xem ghß║┐
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
                    Vui l├▓ng chß╗ìn 1 rß║íp chiß║┐u cß╗Ñ thß╗â ß╗ƒ bß╗Ö lß╗ìc ─æß╗â xem Lß╗ïch ph├▓ng (Timeline)
                  </div>
                ) : timelineRooms.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    Rß║íp n├áy ch╞░a c├│ ph├▓ng chiß║┐u n├áo.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {timelineRooms.map(room => {
                      const roomShowtimes = filtered.filter(s => s.roomId === room.roomId).sort((a, b) => a.timeString.localeCompare(b.timeString));
                      return (
                        <div key={room.roomId} className="flex flex-col gap-2 p-4 bg-muted/20 rounded-lg border border-border">
                          <h3 className="font-bold text-primary">{room.name} (Sß╗⌐c chß╗⌐a: {room.capacity})</h3>
                          <div className="flex gap-2 relative h-16 w-full rounded bg-secondary/30 items-center px-2 overflow-x-auto">
                            {roomShowtimes.length === 0 && <span className="text-xs text-muted-foreground absolute left-1/2 -translate-x-1/2">Trß╗æng to├án bß╗Ö</span>}
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
            <DialogTitle>Th├¬m suß║Ñt chiß║┐u mß╗¢i</DialogTitle>
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
                <SelectTrigger><SelectValue placeholder="Chß╗ìn phim" /></SelectTrigger>
                <SelectContent>
                  {movies.map(m => <SelectItem key={m.movieId} value={m.movieId.toString()}>{m.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Rß║íp chiß║┐u</Label>
                <Select value={formData.cinemaId} onValueChange={v => setFormData({ ...formData, cinemaId: v, roomId: '' })}>
                  <SelectTrigger><SelectValue placeholder="Chß╗ìn rß║íp" /></SelectTrigger>
                  <SelectContent>
                    {cinemas.map(c => <SelectItem key={c.cinemaId} value={c.cinemaId.toString()}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Ph├▓ng chiß║┐u</Label>
                <Select value={formData.roomId} onValueChange={v => setFormData({ ...formData, roomId: v })} disabled={!formData.cinemaId}>
                  <SelectTrigger><SelectValue placeholder={formData.cinemaId ? "Chß╗ìn ph├▓ng" : "Vui l├▓ng chß╗ìn rß║íp tr╞░ß╗¢c"} /></SelectTrigger>
                  <SelectContent>
                    {formRooms.map(r => <SelectItem key={r.roomId} value={r.roomId.toString()}>{r.name} (Sß╗⌐c chß╗⌐a: {r.capacity})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Ng├áy chiß║┐u</Label>
                <Input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Giß╗¥ bß║»t ─æß║ºu</Label>
                <Input type="time" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Hß╗ºy</Button>
            <Button onClick={handleSave}>L╞░u th├┤ng tin</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Seats Dialog */}
      <Dialog open={isSeatsDialogOpen} onOpenChange={setIsSeatsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>S╞í ─æß╗ô ghß║┐ - Suß║Ñt chiß║┐u {selectedShowtimeForSeats?.timeString}</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm space-y-1">
            <p><strong>Phim:</strong> {selectedShowtimeForSeats?.movieTitle}</p>
            <p><strong>Ph├▓ng:</strong> {selectedShowtimeForSeats?.roomName} ({selectedShowtimeForSeats?.cinemaName})</p>
          </div>

          {isLoadingSeats ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : showtimeSeats.length === 0 ? (
            <div className="text-center p-6 text-muted-foreground">Kh├┤ng c├│ dß╗» liß╗çu ghß║┐.</div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-4/5 h-1.5 bg-primary/60 rounded-full" />
              <p className="text-[10px] text-muted-foreground -mt-3">M├ÇN H├îNH</p>

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
                <div className="flex items-center gap-1"><div className="w-3.5 h-3.5 rounded-t-sm bg-secondary/40 border" /> Th╞░ß╗¥ng</div>
                <div className="flex items-center gap-1"><div className="w-3.5 h-3.5 rounded-t-sm bg-yellow-500/20 border border-yellow-500/40" /> VIP</div>
                <div className="flex items-center gap-1"><div className="w-3.5 h-3.5 rounded-t-sm bg-pink-500/20 border border-pink-500/40" /> Ghß║┐ ─æ├┤i</div>
                <div className="flex items-center gap-1"><div className="w-3.5 h-3.5 rounded-t-sm bg-red-500/80 border border-red-600" /> ─É├ú b├ín</div>
                <div className="flex items-center gap-1"><div className="w-3.5 h-3.5 rounded-t-sm bg-orange-500/80 border border-orange-600" /> ─Éang giß╗» (chß╗¥ thanh to├ín)</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsSeatsDialogOpen(false)}>─É├│ng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
