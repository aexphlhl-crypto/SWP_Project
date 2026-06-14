"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tags, Plus, Pencil, Trash2, Loader2, Search } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import genreApi from '@/api/genreApi';
import { useClientPagination } from '@/hooks/use-client-pagination';
import { ClientPagination } from '@/components/ui/client-pagination';

export default function AdminGenresPage() {
  const [genres, setGenres] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Modals state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGenre, setEditingGenre] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({ name: '' });

  const fetchGenres = async () => {
    setIsLoading(true);
    try {
      const res = await genreApi.getAll();
      if (res.success && res.data) {
        setGenres(res.data);
      }
    } catch (error) {
      toast.error(error.message || 'Lỗi khi tải danh sách thể loại');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  const filtered = genres.filter(g => g.name.toLowerCase().includes(search.toLowerCase()));
  const { currentDataOnPage, currentPage, totalPages, handlePageChange, startIndex, endIndex, totalItems } = useClientPagination(filtered, 10);

  const openAdd = () => {
    setEditingGenre(null);
    setFormData({ name: '' });
    setIsDialogOpen(true);
  };

  const openEdit = (genre) => {
    setEditingGenre(genre);
    setFormData({ name: genre.name });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập tên thể loại");
      return;
    }

    setIsSaving(true);
    try {
      if (editingGenre) {
        const res = await genreApi.update(editingGenre.genreId, formData);
        if (res.success) {
          toast.success("Cập nhật thể loại thành công!");
          fetchGenres();
          setIsDialogOpen(false);
        }
      } else {
        const res = await genreApi.create(formData);
        if (res.success) {
          toast.success("Thêm thể loại mới thành công!");
          fetchGenres();
          setIsDialogOpen(false);
        }
      }
    } catch (error) {
      toast.error(error.message || "Đã có lỗi xảy ra khi lưu");
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
        const res = await genreApi.delete(deletingId);
        if (res.success) {
           toast.success("Xóa thể loại thành công!");
           fetchGenres();
        }
      } catch (error) {
        toast.error(error.message || "Không thể xóa thể loại này (có thể do đang được gắn cho một bộ phim)");
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
            <h1 className="text-3xl font-bold tracking-tight">Quản lý Thể loại Phim</h1>
            <p className="text-muted-foreground mt-1">Quản lý danh sách các thể loại phim trong hệ thống</p>
          </div>
          <Button className="gap-2" onClick={openAdd}>
            <Plus className="w-4 h-4" />
            Thêm thể loại
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tổng số thể loại</CardTitle>
              <Tags className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{genres.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Tìm kiếm thể loại..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
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
                  <TableHead className="w-20 text-center">ID</TableHead>
                  <TableHead>Tên thể loại</TableHead>
                  <TableHead className="w-24 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentDataOnPage.map(genre => (
                  <TableRow key={genre.genreId} className="border-border">
                    <TableCell className="text-center font-medium">#{genre.genreId}</TableCell>
                    <TableCell>{genre.name}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="w-8 h-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2" onClick={() => openEdit(genre)}>
                            <Pencil className="w-4 h-4" /> Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={() => confirmDelete(genre.genreId)}>
                            <Trash2 className="w-4 h-4" /> Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      Không tìm thấy thể loại nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            )}
            
            {!isLoading && filtered.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-border">
                <div className="text-sm text-muted-foreground mb-4 sm:mb-0">
                  Hiển thị {startIndex + 1}-{endIndex} trên tổng số {totalItems} thể loại
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

        {/* Add/Edit Modal */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingGenre ? 'Chỉnh sửa thể loại' : 'Thêm thể loại mới'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Tên thể loại</Label>
                <Input 
                  value={formData.name} 
                  onChange={e => setFormData({ name: e.target.value })} 
                  placeholder="Vd: Hành động, Viễn tưởng..."
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>Hủy</Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Lưu
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirm Modal */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Xóa thể loại này?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground py-4">
              Hành động này không thể hoàn tác. Nếu thể loại này đang được gán cho bất kỳ phim nào, việc xóa có thể gây lỗi. Bạn có chắc chắn muốn xóa không?
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
