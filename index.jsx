"use client";

import { AdminLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { MapPin, Plus, Search, MoreHorizontal, Pencil, Trash2, Eye, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import cinemaApi from '@/api/cinemaApi';

export default function AdminCinemasPage() {
  const [cinemas, setCinemas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');

  // Modal States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCinema, setEditingCinema] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '', city: '', address: '', locationMapUrl: ''
  });

  const fetchCinemas = async () => {
    setIsLoading(true);
    try {
      const res = await cinemaApi.getCinemas();
      if (res.success && res.data && res.data.content) {
        // Backend returns cinemaId, name, city, address, locationMapUrl, totalRooms
        const mappedCinemas = res.data.content.map(c => ({
          ...c,
          id: c.cinemaId, // map for UI
        }));
        setCinemas(mappedCinemas);
      }
    } catch (error) {
      toast.error(error.message || 'Lỗi khi tải danh sách rạp');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCinemas();
  }, []);

  const cities = [...new Set(cinemas.map(c => c.city))];

  const filtered = cinemas.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.address.toLowerCase().includes(search.toLowerCase());
    const matchCity = selectedCity === 'all' || c.city === selectedCity;
    return matchSearch && matchCity;
  });

  const openAdd = () => {
    setEditingCinema(null);
    setFormData({ name: '', city: '', address: '', locationMapUrl: '' });
    setIsDialogOpen(true);
  };

  const openEdit = (cinema) => {
    setEditingCinema(cinema);
    setFormData({ 
      name: cinema.name || '', 
      city: cinema.city || '', 
      address: cinema.address || '', 
      locationMapUrl: cinema.locationMapUrl || '' 
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const payload = {
      name: formData.name,
      city: formData.city,
      address: formData.address,
      latitude: formData.latitude || 0,
      longitude: formData.longitude || 0,
      phone: formData.phone || "",
      operatingHours: formData.operatingHours || "",
      status: formData.status || "Active"
    };

    try {
      if (editingCinema) {
        const res = await cinemaApi.updateCinema(editingCinema.id, payload);
        if (res.success) {
          toast.success("Cập nhật rạp thành công!");
          fetchCinemas();
        }
      } else {
        const res = await cinemaApi.createCinema(payload);
        if (res.success) {
          toast.success("Thêm rạp mới thành công!");
          fetchCinemas();
        }
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast.error(error.message || "Đã có lỗi xảy ra");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = (id) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (deletingId) {
      setIsSaving(true);
      try {
        const res = await cinemaApi.deleteCinema(deletingId);
        if (res.success) {
           toast.success("Xóa rạp thành công!");
           fetchCinemas();
        }
      } catch (error) {
        toast.error(error.message || "Không thể xóa rạp này");
      } finally {
        setIsDeleteDialogOpen(false);
        setDeletingId(null);
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Quản lý Rạp chiếu</h1>
            <p className="text-muted-foreground mt-1">Danh sách chi nhánh rạp trên toàn quốc</p>
          </div>
          <Button className="gap-2" onClick={openAdd}>
            <Plus className="w-4 h-4" />
            Thêm rạp mới
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          {[{
          label: 'Tổng số rạp',
          value: cinemas.length
        }, {
          label: 'Số tỉnh/thành',
          value: cities.length
        }, {
          label: 'Tổng phòng chiếu',
          value: cinemas.reduce((a, b) => a + (b.totalRooms || 0), 0)
        }].map(s => <Card key={s.label} className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                <MapPin className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{s.value}</div>
              </CardContent>
            </Card>)}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Tìm kiếm rạp..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2">
            {['all', ...cities].map(city => <Button key={city} variant={selectedCity === city ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCity(city)}>
                {city === 'all' ? 'Tất cả' : city}
              </Button>)}
          </div>
        </div>

        {/* Loading / Cinema Cards */}
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map(cinema => <Card key={cinema.id} className="bg-card border-border hover:border-primary/50 transition-colors">
                <CardHeader className="flex flex-row items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 shrink-0 mt-0.5">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold leading-tight">{cinema.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{cinema.address}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="w-8 h-8 shrink-0">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2">
                        <Eye className="w-4 h-4" /> Xem chi tiết
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2" onClick={() => openEdit(cinema)}>
                        <Pencil className="w-4 h-4" /> Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={() => confirmDelete(cinema.id)}>
                        <Trash2 className="w-4 h-4" /> Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{cinema.city}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {cinema.totalRooms || 0} phòng chiếu
                    </span>
                  </div>
                </CardContent>
              </Card>)}
          </div>
        )}

        {/* Add/Edit Modal */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingCinema ? 'Chỉnh sửa rạp' : 'Thêm rạp mới'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Tên rạp</Label>
                <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Tỉnh/Thành phố</Label>
                <Input value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Địa chỉ chi tiết</Label>
                <Input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Bản đồ (Google Maps URL)</Label>
                <Input value={formData.locationMapUrl} onChange={e => setFormData({ ...formData, locationMapUrl: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>Hủy</Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Lưu thông tin
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirm Modal */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Xóa rạp này?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground py-4">
              Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa rạp này khỏi hệ thống không?
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isSaving}>Hủy</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Xóa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    );
}
