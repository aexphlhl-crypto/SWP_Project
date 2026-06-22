"use client";

import { useData } from '@/contexts/data-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Armchair, Settings, Save, Loader2, RefreshCw } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import roomApi from '@/api/roomApi';
import cinemaApi from '@/api/cinemaApi';

const SEAT_COLORS = {
  Hidden: 'opacity-0',
  Normal: 'bg-secondary/60 hover:bg-primary/30 border-border',
  VIP: 'bg-yellow-500/20 border-yellow-500/40 hover:bg-yellow-500/40',
  Couple: 'bg-pink-500/20 border-pink-500/40 hover:bg-pink-500/40',
};

export default function AdminSeatsPage() {
  const [searchParams] = useSearchParams();
  const [realCinemas, setRealCinemas] = useState([]);
  const [realRooms, setRealRooms] = useState([]);
  const [selectedCinema, setSelectedCinema] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  
  const [seats, setSeats] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [gridConfig, setGridConfig] = useState({ rows: 10, cols: 12 });

  const recalculateSeatLabels = (seatsArray) => {
    const grouped = {};
    seatsArray.forEach(s => {
      if (!grouped[s.rowLabel]) grouped[s.rowLabel] = [];
      grouped[s.rowLabel].push(s);
    });

    Object.values(grouped).forEach(rowSeats => {
      rowSeats.sort((a, b) => a.colNumber - b.colNumber);
      let logicalNum = 1;
      for (let i = 0; i < rowSeats.length; i++) {
        const seat = rowSeats[i];
        
        if (i > 0 && rowSeats[i - 1].seatType === 'Couple' && seat.seatType === 'Hidden') {
          seat.seatLabel = `${seat.rowLabel}-Absorbed-${seat.colNumber}`;
          continue;
        }

        if (seat.seatType !== 'Hidden') {
          seat.seatLabel = `${seat.rowLabel}${logicalNum}`;
          logicalNum++;
        } else {
          seat.seatLabel = `${seat.rowLabel}-Aisle-${seat.colNumber}`;
        }
      }
    });

    return [...seatsArray];
  };

  useEffect(() => {
    const fetchBaseData = async () => {
      try {
        const [cinemaRes, roomRes] = await Promise.all([
          cinemaApi.getCinemas({ size: 100 }),
          roomApi.getRooms({ size: 500 }) 
        ]);
        if (cinemaRes.success && cinemaRes.data && cinemaRes.data.content) {
          setRealCinemas(cinemaRes.data.content);
        }
        if (roomRes.success && roomRes.data && roomRes.data.content) {
          setRealRooms(roomRes.data.content);
        }
        
        // Auto-select if query params are present
        const cinemaIdParam = searchParams.get('cinemaId');
        const roomIdParam = searchParams.get('roomId');
        if (cinemaIdParam) setSelectedCinema(cinemaIdParam);
        if (roomIdParam) setSelectedRoom(roomIdParam);
      } catch (e) {
        console.error(e);
      }
    };
    fetchBaseData();
  }, [searchParams]);

  useEffect(() => {
    if (selectedRoom) {
      fetchSeats(selectedRoom);
    } else {
      setSeats([]);
    }
  }, [selectedRoom]);

  const fetchSeats = async (roomId) => {
    setIsLoading(true);
    try {
      const res = await roomApi.getRoomSeats(roomId);
      if (res.success) {
        setSeats(recalculateSeatLabels(res.data || []));
      }
    } catch (error) {
      toast.error('Không thể tải sơ đồ ghế: ' + (error.error?.message || error.message || 'Lỗi không xác định'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateGrid = () => {
    const newSeats = [];
    for (let r = 0; r < gridConfig.rows; r++) {
      const rowLabel = String.fromCharCode(65 + r); // A, B, C...
      for (let c = 1; c <= gridConfig.cols; c++) {
        newSeats.push({
          rowLabel: rowLabel,
          colNumber: c,
          seatLabel: `${rowLabel}${c}`,
          seatType: 'Normal'
        });
      }
    }
    setSeats(recalculateSeatLabels(newSeats));
    setIsEditMode(true);
  };

  const handleSeatClick = (index) => {
    if (!isEditMode) return;
    const newSeats = [...seats];
    const currentType = newSeats[index].seatType;
    // Rotate: Normal -> VIP -> Couple -> Hidden -> Normal
    let nextType = 'Normal';
    if (currentType === 'Normal') nextType = 'VIP';
    else if (currentType === 'VIP') nextType = 'Couple';
    else if (currentType === 'Couple') nextType = 'Hidden';
    
    if (nextType === 'Couple') {
      const nextSeat = newSeats[index + 1];
      if (nextSeat && nextSeat.rowLabel === newSeats[index].rowLabel) {
        if (nextSeat.seatType === 'Couple' || nextSeat.seatType === 'VIP') {
          toast.error(`Không thể tạo ghế Đôi! Vị trí bên cạnh đang là ghế ${nextSeat.seatType === 'VIP' ? 'VIP' : 'Đôi'}. Hãy chuyển nó về ghế Thường hoặc Ẩn trước.`);
          return;
        }
        nextSeat.seatType = 'Hidden';
      }
    } else if (currentType === 'Couple' && nextType === 'Hidden') {
      // Khi từ ghế đôi trở thành lối đi, nếu ghế bên cạnh đang ẩn, ta có thể tự động hiện nó lại thành Normal
      const nextSeat = newSeats[index + 1];
      if (nextSeat && nextSeat.rowLabel === newSeats[index].rowLabel && nextSeat.seatType === 'Hidden') {
        nextSeat.seatType = 'Normal';
      }
    }
    
    newSeats[index].seatType = nextType;
    setSeats(recalculateSeatLabels(newSeats));
  };

  const handleSave = async () => {
    if (!selectedRoom) {
      toast.error("Vui lòng chọn phòng chiếu");
      return;
    }
    const payload = seats.filter(s => s.seatType !== 'Hidden').map(s => ({
      rowLabel: s.rowLabel,
      colNumber: s.colNumber,
      seatLabel: s.seatLabel,
      seatType: s.seatType
    }));

    setIsSaving(true);
    try {
      const res = await roomApi.configureSeats(selectedRoom, payload);
      if (res.success) {
        toast.success("Đã lưu sơ đồ ghế thành công!");
        setIsEditMode(false);
        setSeats(recalculateSeatLabels(res.data));
      }
    } catch (error) {
      toast.error('Lỗi khi lưu sơ đồ: ' + (error.error?.message || error.message || 'Lỗi không xác định'));
    } finally {
      setIsSaving(false);
    }
  };

  // Group seats by row
  const layoutRows = useMemo(() => {
    const grouped = {};
    seats.forEach(s => {
      if (!grouped[s.rowLabel]) grouped[s.rowLabel] = [];
      grouped[s.rowLabel].push(s);
    });
    // Sort by colNumber
    Object.values(grouped).forEach(rowSeats => {
      rowSeats.sort((a, b) => a.colNumber - b.colNumber);
    });
    return grouped;
  }, [seats]);

  const visibleSeats = seats.filter(s => s.seatType !== 'Hidden');
  const totalSeats = visibleSeats.length;
  const vipCount = visibleSeats.filter(s => s.seatType === 'VIP').length;
  const coupleCount = visibleSeats.filter(s => s.seatType === 'Couple').length;
  const normalCount = visibleSeats.filter(s => s.seatType === 'Normal').length;

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cấu hình Ghế ngồi</h1>
            <p className="text-muted-foreground mt-1">Vẽ sơ đồ và quản lý loại ghế trong phòng chiếu</p>
          </div>
          <div className="flex gap-2">
            {!isEditMode ? (
              <Button className="gap-2" onClick={() => setIsEditMode(true)}>
                <Settings className="w-4 h-4" />
                Chỉnh sửa sơ đồ
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => { setIsEditMode(false); fetchSeats(selectedRoom); }}>Hủy</Button>
                <Button className="gap-2" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Lưu thay đổi
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          {[{
            label: 'Tổng ghế', value: totalSeats
          }, {
            label: 'Ghế thường', value: normalCount
          }, {
            label: 'Ghế VIP', value: vipCount
          }, {
            label: 'Ghế đôi', value: coupleCount
          }].map(s => <Card key={s.label} className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                <Armchair className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{s.value}</div>
              </CardContent>
            </Card>)}
        </div>

        {/* Room selector */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Rạp:</span>
                <Select value={selectedCinema} onValueChange={(v) => { setSelectedCinema(v); setSelectedRoom(''); }}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="-- Chọn rạp --" />
                  </SelectTrigger>
                  <SelectContent>
                    {realCinemas.map(c => (
                      <SelectItem key={c.cinemaId} value={String(c.cinemaId)}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Phòng:</span>
                <Select value={selectedRoom} onValueChange={setSelectedRoom} disabled={!selectedCinema}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="-- Chọn phòng --" />
                  </SelectTrigger>
                  <SelectContent>
                    {realRooms.filter(r => String(r.cinemaId) === selectedCinema).map(r => (
                      <SelectItem key={r.roomId} value={String(r.roomId)}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isEditMode && (
                <div className="flex items-center gap-2 ml-auto p-2 bg-secondary/30 rounded-md border">
                  <span className="text-sm font-medium mr-2">Sinh sơ đồ mới:</span>
                  <Input type="number" placeholder="Số Hàng" className="w-20" value={gridConfig.rows} onChange={e => setGridConfig({...gridConfig, rows: parseInt(e.target.value) || 10})} />
                  <span>x</span>
                  <Input type="number" placeholder="Số Cột" className="w-20" value={gridConfig.cols} onChange={e => setGridConfig({...gridConfig, cols: parseInt(e.target.value) || 12})} />
                  <Button variant="secondary" size="sm" onClick={handleGenerateGrid}>
                    <RefreshCw className="w-4 h-4 mr-1" /> Sinh
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : seats.length === 0 ? (
              <div className="text-center p-12 text-muted-foreground">
                <Armchair className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Chưa có sơ đồ ghế cho phòng chiếu này.</p>
                {isEditMode && <p className="text-sm mt-1">Vui lòng sử dụng công cụ "Sinh sơ đồ mới" ở góc trên bên phải.</p>}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6 overflow-x-auto pb-2">
                <div className="w-4/5 max-w-2xl h-2 bg-primary/60 rounded-full" />
                <p className="text-xs text-muted-foreground -mt-4">MÀN HÌNH</p>

                {/* Seat grid */}
                <div className="space-y-2">
                  {Object.keys(layoutRows).sort().map(rowLabel => (
                    <div key={rowLabel} className="flex items-center gap-1.5 justify-center">
                      <span className="w-5 text-xs text-muted-foreground text-center">{rowLabel}</span>
                      <div className="flex gap-1.5">
                        {layoutRows[rowLabel].map((seat, indexInRow, rowArray) => {
                          if (indexInRow > 0 && rowArray[indexInRow - 1].seatType === 'Couple') {
                            return null;
                          }
                          const originalIndex = seats.findIndex(s => s.rowLabel === seat.rowLabel && s.colNumber === seat.colNumber);
                          return (
                            <div key={`${seat.rowLabel}${seat.colNumber}`} className="flex gap-1.5">
                              <div 
                                onClick={() => handleSeatClick(originalIndex)}
                                className={cn(
                                  'h-8 rounded-t-sm text-[10px] flex items-center justify-center border transition-colors select-none relative overflow-hidden', 
                                  seat.seatType === 'Couple' ? 'w-[70px]' : 'w-8',
                                  !isEditMode && seat.seatType === 'Hidden' ? 'pointer-events-none' : '',
                                  SEAT_COLORS[seat.seatType] || SEAT_COLORS.Normal,
                                  isEditMode && seat.seatType !== 'Hidden' ? 'cursor-pointer hover:ring-2 hover:ring-primary ring-offset-1' : '',
                                  isEditMode && seat.seatType === 'Hidden' ? 'opacity-30 cursor-pointer border-dashed bg-transparent' : ''
                                )} 
                                title={`${seat.seatLabel} — ${seat.seatType}`}
                              >
                                {seat.seatType === 'Couple' && (
                                  <div className="absolute inset-y-0 left-1/2 w-px border-r border-pink-500/40 border-dashed" />
                                )}
                                <span className="z-10">{seat.seatType !== 'Hidden' ? seat.seatLabel.replace(/^[A-Z]+/, '') : (isEditMode ? '+' : '')}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <span className="w-5 text-xs text-muted-foreground text-center">{rowLabel}</span>
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center flex-wrap gap-6 text-xs text-muted-foreground mt-6 pt-4 border-t w-full">
                  {[{
                    color: 'bg-secondary/60 border border-border',
                    label: 'Thường'
                  }, {
                    color: 'bg-yellow-500/20 border border-yellow-500/40',
                    label: 'VIP'
                  }, {
                    color: 'bg-pink-500/20 border border-pink-500/40',
                    label: 'Ghế đôi'
                  }].map(l => <div key={l.label} className="flex items-center gap-1.5">
                      <div className={cn('w-4 h-4 rounded-t-sm', l.color)} />
                      {l.label}
                    </div>)}
                    
                  {isEditMode && (
                    <div className="flex items-center gap-1.5 border-l pl-6 ml-2">
                      <span className="font-medium text-foreground">Mẹo:</span> 
                      Click vào ghế để đổi loại (Thường → VIP → Đôi → Ẩn lối đi)
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  );
}
