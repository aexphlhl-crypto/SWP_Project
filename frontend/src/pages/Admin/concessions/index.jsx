"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, ShoppingCart, Search, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import fnbApi from '../../../api/fnbApi';
import { useClientPagination } from '@/hooks/use-client-pagination';
import { ClientPagination } from '@/components/ui/client-pagination';

const TYPE_LABELS = {
  Drink: 'Đồ uống',
  Popcorn: 'Bỏng ngô',
  Combo: 'Combo'
};

const TYPE_COLORS = {
  Drink: 'bg-blue-500/20 text-blue-400',
  Popcorn: 'bg-amber-500/20 text-amber-400',
  Combo: 'bg-purple-500/20 text-purple-400'
};

const EMPTY_FORM = {
  name: '',
  price: '',
  category: 'Drink',
  imageUrl: '',
  description: '',
  status: 'Active'
};

export default function AdminConcessionsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
    navigate('/admin', { replace: true });
    return null;
  }

  const [concessions, setConcessions] = useState([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchConcessions = async () => {
    try {
      const res = await fnbApi.getAllProducts({ page: 0, size: 100 });
      setConcessions(res.data?.content || []);
    } catch (error) {
      console.error("Failed to fetch F&B products:", error);
      toast({ title: "Lỗi", description: "Không thể tải danh sách bắp nước", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchConcessions();
  }, []);

  const filtered = concessions.filter(item => {
    const matchType = filterType === 'all' || item.category === filterType;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || (item.description ?? '').toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const { currentDataOnPage, currentPage, totalPages, handlePageChange, startIndex, endIndex, totalItems } = useClientPagination(filtered);

  const openAdd = () => {
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setErrorMsg('');
    setDialogOpen(true);
  };

  const openEdit = item => {
    setEditingItem(item);
    setForm({ 
      ...item, 
      price: item.price.toString() 
    });
    setFormErrors({});
    setErrorMsg('');
    setDialogOpen(true);
  };

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Tên không được để trống';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) {
      errors.price = 'Giá phải là số lớn hơn 0';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setErrorMsg('');
    
    const payload = {
      name: form.name,
      description: form.description,
      category: form.category,
      price: Number(form.price),
      imageUrl: form.imageUrl,
      status: form.status
    };

    try {
      if (editingItem) {
        await fnbApi.updateProduct(editingItem.id, payload);
        toast({ title: "Thành công", description: "Đã cập nhật sản phẩm" });
      } else {
        await fnbApi.createProduct(payload);
        toast({ title: "Thành công", description: "Đã thêm sản phẩm mới" });
      }
      setDialogOpen(false);
      fetchConcessions();
    } catch (error) {
      setErrorMsg(error.error?.message || error.message || "Lỗi khi lưu sản phẩm");
    }
  };

  const toggleStatus = async (id) => {
    const item = concessions.find(c => c.id === id);
    if (!item) return;
    
    const newStatus = item.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const payload = {
        name: item.name,
        description: item.description,
        category: item.category,
        price: item.price,
        imageUrl: item.imageUrl,
        status: newStatus
      };
      await fnbApi.updateProduct(id, payload);
      toast({ title: "Thành công", description: `Đã ${newStatus === 'Active' ? 'kích hoạt' : 'tạm dừng'} sản phẩm` });
      fetchConcessions();
    } catch (error) {
      toast({ title: "Lỗi", description: "Không thể đổi trạng thái", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await fnbApi.deleteProduct(deleteConfirmId);
      toast({ title: "Thành công", description: "Đã xóa sản phẩm" });
      setDeleteConfirmId(null);
      fetchConcessions();
    } catch (error) {
      toast({ title: "Lỗi", description: error.error?.message || error.message || "Không thể xóa sản phẩm", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bắp & Nước</h1>
          <p className="text-muted-foreground mt-1">Quản lý các mặt hàng đồ ăn thức uống tại rạp</p>
        </div>
        {user?.role !== 'manager' && (
          <Button onClick={openAdd} className="gap-2 shrink-0">
            <Plus className="w-4 h-4" />
            Thêm mặt hàng
          </Button>
        )}
      </div>

      {/* Stats/Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        {[{
          label: 'Tổng số món',
          value: concessions.length
        }, {
          label: 'Đồ uống',
          value: concessions.filter(i => i.category === 'Drink').length
        }, {
          label: 'Bỏng ngô',
          value: concessions.filter(i => i.category === 'Popcorn').length
        }, {
          label: 'Combo',
          value: concessions.filter(i => i.category === 'Combo').length
        }].map(stat => (
          <Card key={stat.label} className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table & Filters */}
      <Card className="bg-card border-border overflow-hidden">
        <div className="p-4 border-b border-border space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
              {['all', 'Drink', 'Popcorn', 'Combo'].map(t => (
                <button 
                  key={t} 
                  onClick={() => setFilterType(t)} 
                  className={cn('px-3 py-1.5 rounded-full text-sm font-medium transition-colors', filterType === t ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground')}
                >
                  {t === 'all' ? 'Tất cả' : TYPE_LABELS[t]}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-64 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Tìm tên món..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-16">Ảnh</TableHead>
                <TableHead>Tên mặt hàng</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Đơn giá</TableHead>
                <TableHead>Trạng thái</TableHead>
                {user?.role !== 'manager' && <TableHead className="w-24 text-right">Thao tác</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentDataOnPage.map(item => (
                <TableRow key={item.id} className={cn('border-border', item.status === 'Inactive' && 'opacity-60')}>
                  <TableCell>
                    <div className="w-10 h-10 rounded-md overflow-hidden bg-secondary">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{item.name}</p>
                    {item.description && <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('font-normal', TYPE_COLORS[item.category])}>
                      {TYPE_LABELS[item.category]}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{item.price.toLocaleString('vi-VN')}₫</TableCell>
                  <TableCell>
                    <button 
                      onClick={() => toggleStatus(item.id)} 
                      className={cn('flex items-center gap-1.5 text-sm font-medium transition-colors', item.status === 'Active' ? 'text-green-400 hover:text-green-300' : 'text-muted-foreground hover:text-foreground')} 
                      title={item.status === 'Active' ? 'Click để tạm dừng' : 'Click để kích hoạt'}
                    >
                      {item.status === 'Active' ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      {item.status === 'Active' ? 'Đang bán' : 'Tạm dừng'}
                    </button>
                  </TableCell>
                  {user?.role !== 'manager' && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)} title="Chỉnh sửa">
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteConfirmId(item.id)} title="Xóa">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Không tìm thấy mặt hàng nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {filtered.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-border bg-card">
            <div className="text-sm text-muted-foreground mb-4 sm:mb-0">
              Hiển thị {startIndex + 1}-{endIndex} trên tổng số {totalItems} mặt hàng
            </div>
            <ClientPagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={handlePageChange} 
            />
          </div>
        )}
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Chỉnh sửa mặt hàng' : 'Thêm mặt hàng mới'}</DialogTitle>
          </DialogHeader>
          
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-md text-red-500 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>{errorMsg}</p>
            </div>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Tên mặt hàng <span className="text-destructive">*</span></Label>
              <Input id="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={formErrors.name ? 'border-destructive' : ''} />
              {formErrors.name && <p className="text-xs text-destructive">{formErrors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Đơn giá (VNĐ) <span className="text-destructive">*</span></Label>
                <Input id="price" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className={formErrors.price ? 'border-destructive' : ''} />
                {formErrors.price && <p className="text-xs text-destructive">{formErrors.price}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Phân loại</Label>
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                  <SelectTrigger id="category"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Drink">Đồ uống</SelectItem>
                    <SelectItem value="Popcorn">Bỏng ngô</SelectItem>
                    <SelectItem value="Combo">Combo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="imageUrl">URL Hình ảnh</Label>
              <Input id="imageUrl" placeholder="https://..." value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả chi tiết</Label>
              <Input id="description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleSave}>{editingItem ? 'Lưu thay đổi' : 'Thêm mặt hàng'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={open => !open && setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Xóa mặt hàng này?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Hành động này không thể hoàn tác. Mặt hàng sẽ bị xóa vĩnh viễn khỏi menu hệ thống.
          </p>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Hủy</Button>
            <Button variant="destructive" onClick={handleDelete}>Xóa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
