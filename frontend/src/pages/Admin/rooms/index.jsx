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
import { LayoutGrid, Plus, MoreHorizontal, Eye, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import roomApi from '@/api/roomApi';
import cinemaApi from '@/api/cinemaApi';
import { useClientPagination } from '@/hooks/use-client-pagination';
import { ClientPagination } from '@/components/ui/client-pagination';

export default function AdminRoomsPage() {
  const navigate = useNavigate();
  const [cinemas, setCinemas] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCinema, setSelectedCinema] = useState('all');

  // Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    cinemaId: '', name: '', rows: '10', columns: '10'
  });


  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [cinemaRes, roomRes] = await Promise.all([
        cinemaApi.getCinemas(),
        roomApi.getRooms() // This gets pageable rooms, we might need a large size or use content
      ]);
      
      if (cinemaRes.success && cinemaRes.data && cinemaRes.data.content) {
        setCinemas(cinemaRes.data.content.map(c => ({ ...c, id: c.cinemaId })));
      }
      
      if (roomRes.success && roomRes.data) {
        // Handle Spring Boot Page<T> format
        const content = roomRes.data.content || [];
        setRooms(content.map(r => ({
          ...r,
          id: r.roomId,
          cinemaName: r.cinemaName || 'Không xác định',
          cinemaId: r.cinemaId
        })));
      }
    } catch (error) {
      toast.error(error.message || 'Lỗi khi tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = rooms.filter(r => selectedCinema === 'all' || r.cinemaId?.toString() === selectedCinema.toString());
  const { currentDataOnPage, currentPage, totalPages, handlePageChange, startIndex, endIndex, totalItems } = useClientPagination(filtered, 10);
  
  const activeCount = filtered.filter(r => r.status === 'Active' || r.status === 'active').length;

  const openAdd = () => {
    setFormData({ cinemaId: '', name: '', rows: '10', columns: '10' });
    setIsDialogOpen(true);
  };

  const handleToggleStatus = async (room) => {
    const newStatus = (room.status === 'Active' || room.status === 'active') ? 'UnderMaintenance' : 'Active';
    try {
      const res = await roomApi.updateRoomStatus(room.roomId || room.id, newStatus);
      if (res.success) {
        toast.success(`Đã cập nhật trạng thái phòng thành ${newStatus}`);
        fetchData();
      }
    } catch (error) {
      toast.error(error.message || "Đã có lỗi xảy ra");
    }
  };

  const handleSave = async () => {
    if (!formData.cinemaId) {
      toast.error("Vui lòng chọn rạp!");
      return;
    }
    
    setIsSaving(true);
      const payload = {
        cinemaId: parseInt(formData.cinemaId),
        name: formData.name,
        rows: parseInt(formData.rows) || 10,
        columns: parseInt(formData.columns) || 10,
        baseNormalPrice: 0
      };

    try {
      const res = await roomApi.createRoom(payload);
      if (res.success) {
        toast.success("Thêm phòng chiếu mới thành công!");
        setIsDialogOpen(false);
        fetchData();
      }
    } catch (error) {
      toast.error(error.message || "Đã có lỗi xảy ra");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Phòng chiếu</h1>
          <p className="text-muted-foreground mt-1">Cấu hình và giám sát các phòng chiếu</p>
        </div>
        <Button className="gap-2" onClick={openAdd}>
          <Plus className="w-4 h-4" />
          Thêm phòng chiếu
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[{
          label: 'Tổng phòng chiếu',
          value: filtered.length
        }, {
          label: 'Đang hoạt động',
          value: activeCount
        }, {
          label: 'Bảo trì',
          value: filtered.length - activeCount
        }, {
          label: 'Tổng ghế',
          value: filtered.reduce((a, r) => a + (r.capacity || 0), 0).toLocaleString()
        }].map(s => (
          <Card key={s.label} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <LayoutGrid className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Select value={selectedCinema} onValueChange={setSelectedCinema}>
              <SelectTrigger className="w-60">
                <SelectValue placeholder="Lọc theo rạp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả rạp</SelectItem>
                {cinemas.map(c => (
                  <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground ml-auto">{filtered.length} phòng</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Tên phòng</TableHead>
                <TableHead>Rạp</TableHead>
                <TableHead>Sức chứa</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-[100px] text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentDataOnPage.map(room => (
                <TableRow key={room.id} className="border-border">
                  <TableCell className="font-medium">{room.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                    {room.cinemaName}
                  </TableCell>
                  <TableCell className="text-sm">{room.capacity || 0} ghế</TableCell>
                  <TableCell>
                    <Badge className={room.status === 'Active' || room.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}>
                      {room.status === 'Active' || room.status === 'active' ? 'Hoạt động' : 'Bảo trì'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-8 h-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2" onClick={() => handleToggleStatus(room)}>
                          <Eye className="w-4 h-4" /> {(room.status === 'Active' || room.status === 'active') ? 'Bảo trì / Ẩn phòng' : 'Mở lại phòng'}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2" onClick={() => navigate(`/admin/seats?cinemaId=${room.cinemaId}&roomId=${room.id}`)}>
                          <LayoutGrid className="w-4 h-4" /> Xem sơ đồ ghế
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Không tìm thấy phòng chiếu nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            </Table>
          )}
          
          {!isLoading && filtered.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-border">
              <div className="text-sm text-muted-foreground mb-4 sm:mb-0">
                Hiển thị {startIndex + 1}-{endIndex} trên tổng số {totalItems} phòng chiếu
              </div>
              <ClientPagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={handlePageChange} 
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Thêm phòng chiếu mới</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Chọn Rạp chiếu</Label>
              <Select value={formData.cinemaId} onValueChange={v => setFormData({ ...formData, cinemaId: v })}>
                <SelectTrigger><SelectValue placeholder="-- Chọn rạp --" /></SelectTrigger>
                <SelectContent>
                  {cinemas.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Tên phòng</Label>
                  <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="VD: Phòng 1" />
                </div>
              </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Số hàng ghế (Rows)</Label>
                <Input type="number" value={formData.rows} onChange={e => setFormData({ ...formData, rows: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Số ghế mỗi hàng (Cols)</Label>
                <Input type="number" value={formData.columns} onChange={e => setFormData({ ...formData, columns: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>Hủy</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Lưu phòng chiếu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
