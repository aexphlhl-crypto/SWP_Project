"use client";


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Users, Plus, Pencil, Trash2, Loader2, Search, Upload } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import actorApi from '@/api/actorApi';
import uploadApi from '@/api/uploadApi';
import { useClientPagination } from '@/hooks/use-client-pagination';
import { ClientPagination } from '@/components/ui/client-pagination';
import { useData } from '@/contexts/data-context';

export default function AdminActorsPage() {
  const { refreshActors } = useData();
  const [actors, setActors] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  // Modals state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingActor, setEditingActor] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({ name: '', avatarUrl: '' });

  const fetchActors = async () => {
    setIsLoading(true);
    try {
      const res = await actorApi.getAll();
      if (res.success && res.data) {
        setActors(res.data);
      }
    } catch (error) {
      toast.error(error.message || 'Lỗi khi tải danh sách diễn viên');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActors();
  }, []);

  const filtered = actors.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));
  const { currentDataOnPage, currentPage, totalPages, handlePageChange, startIndex, endIndex, totalItems } = useClientPagination(filtered);

  const openAdd = () => {
    setEditingActor(null);
    setFormData({ name: '', avatarUrl: '' });
    setIsDialogOpen(true);
  };

  const openEdit = (actor) => {
    setEditingActor(actor);
    setFormData({ name: actor.name, avatarUrl: actor.avatarUrl || '' });
    setIsDialogOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const res = await uploadApi.uploadFile(file);
      if (res.success && res.data) {
        setFormData(prev => ({ ...prev, avatarUrl: res.data }));
        toast.success("Tải ảnh diễn viên lên thành công!");
      }
    } catch (error) {
      toast.error("Lỗi khi tải ảnh lên");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập tên diễn viên");
      return;
    }

    setIsSaving(true);
    try {
      if (editingActor) {
        const res = await actorApi.update(editingActor.actorId, formData);
        if (res.success) {
          toast.success("Cập nhật diễn viên thành công!");
          fetchActors();
          refreshActors(); // Refresh global data context
          setIsDialogOpen(false);
        }
      } else {
        const res = await actorApi.create(formData);
        if (res.success) {
          toast.success("Thêm diễn viên mới thành công!");
          fetchActors();
          refreshActors(); // Refresh global data context
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
    try {
      const res = await actorApi.delete(deletingId);
      if (res.success) {
        toast.success("Xóa diễn viên thành công!");
        fetchActors();
        refreshActors();
        setIsDeleteDialogOpen(false);
      }
    } catch (error) {
      toast.error(error.message || "Không thể xóa diễn viên này");
    }
  };

  return (
    <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight text-white">Quản lý Diễn viên</h1>
          </div>
          <Button onClick={openAdd} className="bg-primary hover:bg-primary/90 text-black font-semibold">
            <Plus className="mr-2 h-4 w-4" /> Thêm diễn viên
          </Button>
        </div>

        <Card className="bg-[#18181b] border-zinc-800">
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-xl text-white">Danh sách diễn viên</CardTitle>
              <div className="relative w-full max-w-sm sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
                <Input
                  placeholder="Tìm kiếm diễn viên..."
                  className="pl-8 bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500 focus-visible:ring-primary"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center text-zinc-500">
                <p>Không tìm thấy diễn viên nào.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-md border border-zinc-800">
                  <Table>
                    <TableHeader className="bg-zinc-900">
                      <TableRow className="border-b border-zinc-800 hover:bg-zinc-900/50">
                        <TableHead className="w-[100px] text-zinc-400">Hình ảnh</TableHead>
                        <TableHead className="text-zinc-400">Tên diễn viên</TableHead>
                        <TableHead className="w-[100px] text-right text-zinc-400">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentDataOnPage.map((actor) => (
                        <TableRow key={actor.actorId} className="border-b border-zinc-800/80 hover:bg-zinc-900/30">
                          <TableCell>
                            <img
                              src={actor.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(actor.name)}&background=random&color=fff&size=128&bold=true`}
                              alt={actor.name}
                              className="h-10 w-10 rounded-full object-cover border border-zinc-700"
                            />
                          </TableCell>
                          <TableCell className="font-semibold text-white">{actor.name}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-zinc-800 text-zinc-400">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-[#18181b] border-zinc-800 text-white">
                                <DropdownMenuItem onClick={() => openEdit(actor)} className="hover:bg-zinc-800 cursor-pointer">
                                  <Pencil className="mr-2 h-4 w-4 text-yellow-500" /> Sửa
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => confirmDelete(actor.actorId)} className="hover:bg-zinc-800 cursor-pointer text-red-500 focus:text-red-500">
                                  <Trash2 className="mr-2 h-4 w-4" /> Xóa
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {totalPages > 1 && (
                  <div className="flex justify-end pt-2">
                    <ClientPagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog Add/Edit */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-[#18181b] border-zinc-800 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">
                {editingActor ? 'Chỉnh sửa diễn viên' : 'Thêm diễn viên mới'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-zinc-300">Tên diễn viên</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nhập tên diễn viên..."
                  className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatarUrl" className="text-zinc-300">Ảnh chân dung diễn viên</Label>
                <div className="flex gap-2">
                  <Input
                    id="avatarUrl"
                    value={formData.avatarUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, avatarUrl: e.target.value }))}
                    placeholder="URL ảnh hoặc tải ảnh lên..."
                    className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-primary"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="border-zinc-800 bg-zinc-900 text-white hover:bg-zinc-800"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  </Button>
                </div>
                {formData.avatarUrl && (
                  <div className="mt-2 flex justify-center">
                    <img
                      src={formData.avatarUrl}
                      alt="Xem trước ảnh diễn viên"
                      className="h-24 w-24 rounded-full object-cover border border-zinc-700"
                    />
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                Hủy
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="bg-primary hover:bg-primary/90 text-black font-semibold">
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Lưu lại
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Delete */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="bg-[#18181b] border-zinc-800 text-white max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-white">Xác nhận xóa</DialogTitle>
            </DialogHeader>
            <div className="py-2 text-zinc-300">
              Bạn có chắc chắn muốn xóa diễn viên này? Hành động này không thể hoàn tác.
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                Hủy
              </Button>
              <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white font-semibold">
                Đồng ý xóa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
}
