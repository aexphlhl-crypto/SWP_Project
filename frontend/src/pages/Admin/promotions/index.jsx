"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tag, Plus, Search, MoreHorizontal, Pencil, Trash2, Copy } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import promoApi from '../../../api/promoApi';
import dayjs from 'dayjs';
import { useAuth } from '@/contexts/auth-context';
import { useClientPagination } from '@/hooks/use-client-pagination';
import { ClientPagination } from '@/components/ui/client-pagination';

const STATUS_CONFIG = {
  Active: {
    label: 'Đang hoạt động',
    className: 'bg-green-500/20 text-green-500'
  },
  Inactive: {
    label: 'Không hoạt động',
    className: 'bg-gray-500/20 text-gray-500'
  },
  Expired: {
    label: 'Đã hết hạn',
    className: 'bg-red-500/20 text-red-500'
  }
};

export default function AdminPromotionsPage() {
  const { user } = useAuth();
  const role = user?.role || 'admin';
  const [search, setSearch] = useState('');
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'Percentage',
    discountValue: '',
    minOrderValue: '0',
    usageLimit: '',
    validFrom: dayjs().format('YYYY-MM-DD'),
    validUntil: dayjs().add(30, 'day').format('YYYY-MM-DD'),
    status: 'Active'
  });

  const fetchPromos = async () => {
    try {
      setLoading(true);
      const res = await promoApi.getAllPromos({ page: 0, size: 100 });
      setPromos(res.data?.content || []);
    } catch (error) {
      console.error("Failed to fetch promos", error);
      toast.error('Không thể tải danh sách khuyến mãi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa khuyến mãi này?')) return;
    try {
      await promoApi.deletePromo(id);
      toast.success('Xóa khuyến mãi thành công');
      fetchPromos();
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xóa');
    }
  };

  const openAdd = () => {
    setEditingPromo(null);
    setFormData({
      code: '',
      description: '',
      discountType: 'Percentage',
      discountValue: '',
      minOrderValue: '0',
      usageLimit: '',
      validFrom: dayjs().format('YYYY-MM-DD'),
      validUntil: dayjs().add(30, 'day').format('YYYY-MM-DD'),
      status: 'Active'
    });
    setIsDialogOpen(true);
  };

  const openEdit = (promo) => {
    setEditingPromo(promo);
    setFormData({
      code: promo.code,
      description: promo.description || '',
      discountType: promo.discountType || 'Percentage',
      discountValue: promo.discountValue?.toString() || '',
      minOrderValue: promo.minOrderValue?.toString() || '0',
      usageLimit: promo.usageLimit?.toString() || '',
      validFrom: dayjs(promo.validFrom).format('YYYY-MM-DD'),
      validUntil: dayjs(promo.validUntil).format('YYYY-MM-DD'),
      status: promo.status || 'Active'
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.code || !formData.discountValue || !formData.validFrom || !formData.validUntil) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc");
      return;
    }

    const payload = {
      ...formData,
      discountValue: Number(formData.discountValue),
      minOrderValue: Number(formData.minOrderValue),
      usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
      validFrom: formData.validFrom.includes('T') ? formData.validFrom : `${formData.validFrom}T00:00:00`,
      validUntil: formData.validUntil.includes('T') ? formData.validUntil : `${formData.validUntil}T23:59:59`,
    };

    try {
      if (editingPromo) {
        await promoApi.updatePromo(editingPromo.id, payload);
        toast.success("Cập nhật khuyến mãi thành công");
      } else {
        await promoApi.createPromo(payload);
        toast.success("Thêm khuyến mãi thành công");
      }
      setIsDialogOpen(false);
      fetchPromos();
    } catch (error) {
      toast.error(error.error?.message || error.message || "Lỗi khi lưu khuyến mãi");
    }
  };

  const getDerivedStatus = (promo) => {
    const now = new Date();
    if (promo.status === 'Active' && new Date(promo.validUntil) < now) {
      return 'Expired';
    }
    if (promo.status === 'Active' && promo.usageLimit && promo.usedCount >= promo.usageLimit) {
      return 'Expired';
    }
    return promo.status;
  };

  const currentPromos = promos.map(p => ({ ...p, derivedStatus: getDerivedStatus(p) }));

  const filtered = currentPromos.filter(promo => {
    return promo.code?.toLowerCase().includes(search.toLowerCase());
  });

  const activeCount = currentPromos.filter(p => p.derivedStatus === 'Active').length;
  const expiredCount = currentPromos.filter(p => p.derivedStatus === 'Expired' || p.derivedStatus === 'Inactive').length;

  const { currentDataOnPage, currentPage, totalPages, handlePageChange, startIndex, endIndex, totalItems } = useClientPagination(filtered);

  return (
    <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Khuyến mãi</h1>
            <p className="text-muted-foreground mt-1">Quản lý mã giảm giá và chương trình ưu đãi</p>
          </div>
          {role !== 'manager' && (
            <Button className="gap-2" onClick={openAdd}>
              <Plus className="w-4 h-4" />
              Tạo khuyến mãi
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          {[{
          label: 'Tổng mã',
          value: promos.length
        }, {
          label: 'Đang hoạt động',
          value: activeCount
        }, {
          label: 'Tổng lượt dùng',
          value: promos.reduce((a, p) => a + (p.usedCount || 0), 0)
        }, {
          label: 'Đã hết hạn',
          value: expiredCount
        }].map(s => <Card key={s.label} className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                <Tag className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{s.value}</div>
              </CardContent>
            </Card>)}
        </div>

        {/* Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Tìm mã khuyến mãi..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <span className="text-sm text-muted-foreground ml-auto">{filtered.length} khuyến mãi</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Mã</TableHead>
                  <TableHead>Giảm giá</TableHead>
                  <TableHead>Đơn tối thiểu</TableHead>
                  <TableHead>Lượt dùng</TableHead>
                  <TableHead>Thời hạn</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  {role !== 'manager' && <TableHead className="w-12" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">Đang tải...</TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">Không có dữ liệu</TableCell>
                  </TableRow>
                ) : currentDataOnPage.map(promo => <TableRow key={promo.id} className="border-border">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono font-bold bg-secondary px-2 py-0.5 rounded">
                          {promo.code}
                        </code>
                        <button className="text-muted-foreground hover:text-foreground" title="Sao chép mã"
                                onClick={() => { navigator.clipboard.writeText(promo.code); toast.success('Đã sao chép'); }}>
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-primary font-semibold">
                        {promo.discountType === 'Percentage' ? `-${promo.discountValue}%` : `-${promo.discountValue.toLocaleString('vi-VN')}₫`}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      {promo.minOrderValue > 0 ? `${promo.minOrderValue.toLocaleString('vi-VN')}₫` : 'Không giới hạn'}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="font-medium">{promo.usedCount || 0}</span>
                        <span className="text-muted-foreground">/{promo.usageLimit || '∞'}</span>
                      </div>
                      <div className="w-24 h-1.5 bg-secondary rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{
                      width: promo.usageLimit ? `${Math.min((promo.usedCount || 0) / promo.usageLimit * 100, 100)}%` : '0%'
                    }} />
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {dayjs(promo.validFrom).format('DD/MM/YYYY')} → {dayjs(promo.validUntil).format('DD/MM/YYYY')}
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_CONFIG[promo.derivedStatus]?.className || 'bg-gray-500/20 text-gray-500'}>
                        {STATUS_CONFIG[promo.derivedStatus]?.label || promo.derivedStatus}
                      </Badge>
                    </TableCell>
                    {role !== 'manager' && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-8 h-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2" onClick={() => openEdit(promo)}>
                              <Pencil className="w-4 h-4" /> Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={() => handleDelete(promo.id)}>
                              <Trash2 className="w-4 h-4" /> Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>)}
              </TableBody>
            </Table>
            {!loading && filtered.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-border">
                <div className="text-sm text-muted-foreground mb-4 sm:mb-0">
                  Hiển thị {startIndex + 1}-{endIndex} trên tổng số {totalItems} khuyến mãi
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

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingPromo ? 'Chỉnh sửa Khuyến mãi' : 'Tạo Khuyến mãi mới'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="code">Mã khuyến mãi <span className="text-destructive">*</span></Label>
                <Input id="code" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} placeholder="VD: SUMMER2026" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="discountType">Loại giảm giá</Label>
                  <Select value={formData.discountType} onValueChange={v => setFormData({ ...formData, discountType: v })}>
                    <SelectTrigger id="discountType"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Percentage">Theo phần trăm (%)</SelectItem>
                      <SelectItem value="Fixed">Số tiền cố định (VNĐ)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="discountValue">Mức giảm <span className="text-destructive">*</span></Label>
                  <Input id="discountValue" type="number" value={formData.discountValue} onChange={e => setFormData({ ...formData, discountValue: e.target.value })} placeholder={formData.discountType === 'Percentage' ? "VD: 20" : "VD: 50000"} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="minOrderValue">Đơn tối thiểu (VNĐ)</Label>
                  <Input id="minOrderValue" type="number" value={formData.minOrderValue} onChange={e => setFormData({ ...formData, minOrderValue: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="usageLimit">Giới hạn số lần dùng</Label>
                  <Input id="usageLimit" type="number" value={formData.usageLimit} onChange={e => setFormData({ ...formData, usageLimit: e.target.value })} placeholder="Để trống nếu không giới hạn" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="validFrom">Từ ngày <span className="text-destructive">*</span></Label>
                  <Input id="validFrom" type="date" value={formData.validFrom} onChange={e => setFormData({ ...formData, validFrom: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="validUntil">Đến ngày <span className="text-destructive">*</span></Label>
                  <Input id="validUntil" type="date" value={formData.validUntil} onChange={e => setFormData({ ...formData, validUntil: e.target.value })} />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Mô tả chương trình</Label>
                <Input id="description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v })}>
                  <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Đang hoạt động</SelectItem>
                    <SelectItem value="Inactive">Không hoạt động</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
              <Button onClick={handleSave}>{editingPromo ? 'Lưu thay đổi' : 'Tạo mới'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
}
