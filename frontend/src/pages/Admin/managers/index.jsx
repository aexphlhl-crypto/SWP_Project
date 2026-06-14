import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Shield, Plus, Search, Trash2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import adminUserApi from '@/api/adminUserApi';
import cinemaApi from '@/api/cinemaApi';
import { useClientPagination } from '@/hooks/use-client-pagination';
import { ClientPagination } from '@/components/ui/client-pagination';

export default function AdminManagersPage() {
  const [managers, setManagers] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', password: '', cinemaId: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchManagers = async () => {
    try {
      setLoading(true);
      const res = await adminUserApi.getAllUsers({ role: 'ScheduleManager', page: 0, size: 100 });
      setManagers(res.data?.content || res.data?.content || []);
    } catch (error) {
      toast.error('Không thể tải danh sách quản trị viên');
    } finally {
      setLoading(false);
    }
  };

  const fetchCinemas = async () => {
    try {
      const res = await cinemaApi.getCinemas({ page: 0, size: 100 });
      setCinemas(res.data?.content || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchManagers();
    fetchCinemas();
  }, []);

  const handleCreateManager = async () => {
    if (!formData.fullName || !formData.email || !formData.password || !formData.cinemaId || formData.cinemaId === 'none') {
      return toast.error('Vui lòng điền đầy đủ thông tin bắt buộc (Họ tên, Email, Mật khẩu và Rạp chiếu)');
    }
    try {
      setIsSubmitting(true);
      const payload = { 
        ...formData,
        cinemaId: Number(formData.cinemaId)
      };
      await adminUserApi.createManager(payload);
      toast.success('Thêm Manager thành công');
      setIsDialogOpen(false);
      setFormData({ fullName: '', email: '', phone: '', password: '', cinemaId: '' });
      fetchManagers();
    } catch (error) {
      toast.error(error.error?.message || error.message || 'Có lỗi xảy ra khi thêm Manager');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tài khoản Manager này?')) return;
    try {
      await adminUserApi.deleteManager(id);
      toast.success('Đã xóa Manager');
      fetchManagers();
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xóa');
    }
  };

  const filtered = managers.filter(m => 
    (m.fullName || '').toLowerCase().includes(search.toLowerCase()) || 
    (m.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const { currentDataOnPage, currentPage, totalPages, handlePageChange, startIndex, endIndex, totalItems } = useClientPagination(filtered, 10);

  return (
    <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Quản trị viên</h1>
            <p className="text-muted-foreground mt-1">Quản lý tài khoản cấp Manager</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Thêm Manager
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thêm tài khoản Manager</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Họ và tên *</Label>
                  <Input value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="Nguyễn Văn A" />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="manager@cinebook.com" />
                </div>
                <div className="space-y-2">
                  <Label>Mật khẩu *</Label>
                  <Input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label>Số điện thoại</Label>
                  <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="0901234567" />
                </div>
                <div className="space-y-2">
                  <Label>Cơ sở / Rạp chiếu *</Label>
                  <Select value={formData.cinemaId} onValueChange={(val) => setFormData({...formData, cinemaId: val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="-- Chọn cơ sở / rạp chiếu --" />
                    </SelectTrigger>
                    <SelectContent>
                      {cinemas.map(c => (
                        <SelectItem key={c.cinemaId} value={c.cinemaId.toString()}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
                <Button onClick={handleCreateManager} disabled={isSubmitting}>
                  {isSubmitting ? 'Đang lưu...' : 'Thêm tài khoản'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Tìm kiếm manager..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <span className="text-sm text-muted-foreground ml-auto">{filtered.length} tài khoản</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Cơ sở quản lý</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-4">Đang tải...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-4">Không tìm thấy manager nào</TableCell></TableRow>
                ) : currentDataOnPage.map(manager => (
                  <TableRow key={manager.userId}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" />
                        {manager.fullName}
                      </div>
                    </TableCell>
                    <TableCell>{manager.email}</TableCell>
                    <TableCell>
                      {manager.cinemaName ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                          <MapPin className="w-3 h-3" />
                          {manager.cinemaName}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs italic">Toàn hệ thống</span>
                      )}
                    </TableCell>
                    <TableCell>{manager.phone || '-'}</TableCell>
                    <TableCell>{manager.createdAt ? new Date(manager.createdAt).toLocaleDateString('vi-VN') : '-'}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(manager.userId)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!loading && filtered.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-border">
                <div className="text-sm text-muted-foreground mb-4 sm:mb-0">
                  Hiển thị {startIndex + 1}-{endIndex} trên tổng số {totalItems} tài khoản
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
    </div>
  );
}
