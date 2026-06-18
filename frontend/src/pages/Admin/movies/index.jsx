"use client";

import { AdminLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Film, Plus, Search, MoreHorizontal, Pencil, Trash2, Loader2 } from 'lucide-react';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import movieApi from '@/api/movieApi';
import uploadApi from '@/api/uploadApi';
import genreApi from '@/api/genreApi';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { useClientPagination } from '@/hooks/use-client-pagination';
import { ClientPagination } from '@/components/ui/client-pagination';

export default function AdminMoviesPage() {
  const { user } = useAuth();
  const { refreshMovies } = useData();
  const role = user?.role || 'admin';
  const [movies, setMovies] = useState([]);
  const [allGenres, setAllGenres] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  // States for Modals
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '', originalTitle: '', synopsis: '', director: '', castList: '', releaseDate: new Date().toISOString().split('T')[0], language: 'Vietnamese', trailerUrl: '', poster: '', duration: '', status: 'now_showing', ageRating: 'PG-13', rating: 0, genreIds: []
  });

  const fetchMovies = async () => {
    setIsLoading(true);
    try {
      const res = await movieApi.getMovies();
      if (res.success && res.data) {
        // Map backend API data to UI format
        const mappedMovies = res.data.content.map(m => ({
          ...m,
          id: m.movieId,
          poster: m.posterUrl,
          duration: m.durationMin,
          status: m.status === 'NowShowing' ? 'now_showing' : 
                  m.status === 'ComingSoon' ? 'coming_soon' : 'hidden',
          rating: Number(m.avgRating ?? 0)
        }));
        setMovies(mappedMovies);
      }
    } catch (error) {
      toast.error(error.message || 'Lỗi khi tải danh sách phim');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGenres = async () => {
    try {
      const res = await genreApi.getAll();
      if (res.success && res.data) {
        setAllGenres(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchMovies();
    fetchGenres();
  }, []);

  const filtered = movies.filter(m => m.title.toLowerCase().includes(search.toLowerCase()) || (m.originalTitle ?? '').toLowerCase().includes(search.toLowerCase()));

  const { currentDataOnPage, currentPage, totalPages, handlePageChange, startIndex, endIndex, totalItems } = useClientPagination(filtered, 10);

  const openAdd = () => {
    setEditingMovie(null);
    setFormData({ title: '', originalTitle: '', synopsis: '', director: '', castList: '', releaseDate: new Date().toISOString().split('T')[0], language: 'Vietnamese', trailerUrl: '', poster: '', duration: '', status: 'now_showing', ageRating: 'PG-13', rating: 0, genreIds: [] });
    setIsDialogOpen(true);
  };

  const openEdit = (movie) => {
    setEditingMovie(movie);
    setFormData({ 
      title: movie.title || '', 
      originalTitle: movie.originalTitle || '', 
      synopsis: movie.synopsis || '',
      director: movie.director || '',
      castList: movie.castList || '',
      releaseDate: movie.releaseDate || new Date().toISOString().split('T')[0],
      language: movie.language || 'Vietnamese',
      trailerUrl: movie.trailerUrl || '',
      poster: movie.posterUrl || movie.poster || '', 
      duration: movie.durationMin || movie.duration || '', 
      status: movie.status === 'NowShowing' || movie.status === 'now_showing' ? 'now_showing' : 
              movie.status === 'ComingSoon' || movie.status === 'coming_soon' ? 'coming_soon' : 'hidden', 
      ageRating: movie.ageRating || 'PG-13', 
      rating: Number(movie.avgRating ?? movie.rating ?? 0),
      genreIds: movie.genres ? movie.genres.map(g => g.genreId) : []
    });
    setIsDialogOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const res = await uploadApi.uploadFile(file);
      if (res.success && res.data) {
        setFormData(prev => ({ ...prev, poster: res.data }));
        toast.success("Tải ảnh lên thành công!");
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
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tên phim');
      return;
    }
    if (!formData.poster?.trim()) {
      toast.error('Vui lòng nhập hoặc tải lên poster');
      return;
    }
    if (!formData.duration || Number(formData.duration) <= 0) {
      toast.error('Vui lòng nhập thời lượng phim hợp lệ');
      return;
    }
    if (!formData.genreIds || formData.genreIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất một thể loại');
      return;
    }

    setIsSaving(true);
    const payload = {
      title: formData.title,
      synopsis: formData.synopsis || "Đang cập nhật",
      director: formData.director || "Đang cập nhật",
      castList: formData.castList || "Đang cập nhật",
      releaseDate: formData.releaseDate || new Date().toISOString().split('T')[0],
      durationMin: parseInt(formData.duration) || 120,
      language: formData.language || "Vietnamese",
      trailerUrl: formData.trailerUrl || "",
      posterUrl: formData.poster || "",
      status: formData.status === 'now_showing' ? 'NowShowing' : 
              formData.status === 'coming_soon' ? 'ComingSoon' : 'Hidden',
      ageRating: formData.ageRating || 'PG-13',
      genreIds: formData.genreIds
    };

    try {
      if (editingMovie) {
        const res = await movieApi.updateMovie(editingMovie.id, payload);
        if (res.success) {
          toast.success("Cập nhật phim thành công!");
          await fetchMovies();
          await refreshMovies();
        }
      } else {
        const res = await movieApi.createMovie(payload);
        if (res.success) {
          toast.success("Thêm phim mới thành công!");
          await fetchMovies();
          await refreshMovies();
        }
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast.error(error.message || "Đã có lỗi xảy ra khi lưu phim");
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
        const res = await movieApi.deleteMovie(deletingId);
        if (res.success) {
           toast.success("Xóa phim thành công!");
           await fetchMovies();
           await refreshMovies();
        }
      } catch (error) {
        toast.error(error.message || "Không thể xóa phim này");
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
            <h1 className="text-3xl font-bold tracking-tight">Quản lý Phim</h1>
            <p className="text-muted-foreground mt-1">Quản lý danh sách phim đang chiếu và sắp chiếu</p>
          </div>
          {role !== 'manager' && (
            <Button className="gap-2" onClick={openAdd}>
              <Plus className="w-4 h-4" />
              Thêm phim mới
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          {[{
            label: 'Tổng số phim',
            value: movies.length,
            icon: Film
          }, {
            label: 'Đang chiếu',
            value: movies.filter(m => m.status === 'now_showing' || m.status === 'NowShowing').length,
            icon: Film
          }, {
            label: 'Sắp chiếu',
            value: movies.filter(m => m.status === 'coming_soon' || m.status === 'ComingSoon').length,
            icon: Film
          }].map(s => <Card key={s.label} className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                <s.icon className="w-4 h-4 text-muted-foreground" />
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
                <Input placeholder="Tìm kiếm phim..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
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
                  <TableHead className="w-16">Poster</TableHead>
                  <TableHead>Tên phim</TableHead>
                  <TableHead>Thể loại</TableHead>
                  <TableHead>Thời lượng</TableHead>
                  <TableHead>Đánh giá</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  {role !== 'manager' && <TableHead className="w-12" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentDataOnPage.map(movie => <TableRow key={movie.id} className="border-border">
                    <TableCell>
                      <div className="relative w-10 h-14 rounded overflow-hidden bg-secondary">
                        <img src={movie.poster || 'https://placehold.co/150x225/png'} alt={movie.title} className="w-full h-full object-cover" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{movie.title}</p>
                        {movie.originalTitle && <p className="text-xs text-muted-foreground">{movie.originalTitle}</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {(movie.genres || []).slice(0, 2).map(g => <Badge key={g.genreId} variant="secondary" className="text-xs">
                            {g.name}
                          </Badge>)}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{movie.duration} phút</TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-yellow-500">★ {movie.rating}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        movie.status === 'now_showing' ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30' : 
                        movie.status === 'coming_soon' ? 'bg-blue-500/20 text-blue-500 hover:bg-blue-500/30' : 
                        'bg-gray-500/20 text-gray-500 hover:bg-gray-500/30'
                      }>
                        {movie.status === 'now_showing' ? 'Đang chiếu' : movie.status === 'coming_soon' ? 'Sắp chiếu' : 'Đã ẩn'}
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
                            <DropdownMenuItem className="gap-2" onClick={() => openEdit(movie)}>
                              <Pencil className="w-4 h-4" /> Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={() => confirmDelete(movie.id)}>
                              <Trash2 className="w-4 h-4" /> Xóa phim
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>)}
              </TableBody>
            </Table>
            )}
            {!isLoading && filtered.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-border">
                <div className="text-sm text-muted-foreground mb-4 sm:mb-0">
                  Hiển thị {startIndex + 1}-{endIndex} trên tổng số {totalItems} phim
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
              <DialogTitle>{editingMovie ? 'Chỉnh sửa phim' : 'Thêm phim mới'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Tên phim</Label>
                <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Tên gốc (Tiếng Anh)</Label>
                <Input value={formData.originalTitle} onChange={e => setFormData({ ...formData, originalTitle: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Nội dung (Synopsis)</Label>
                <Textarea value={formData.synopsis} onChange={e => setFormData({ ...formData, synopsis: e.target.value })} rows={3} />
              </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Đạo diễn</Label>
                    <Input value={formData.director} onChange={e => setFormData({ ...formData, director: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Diễn viên</Label>
                    <Input value={formData.castList} onChange={e => setFormData({ ...formData, castList: e.target.value })} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Thể loại</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal h-auto min-h-10 break-all whitespace-normal">
                        {formData.genreIds.length > 0 
                          ? formData.genreIds.map(id => allGenres.find(g => g.genreId === id)?.name).filter(Boolean).join(', ')
                          : "Chọn thể loại..."}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[375px] max-h-[300px] overflow-y-auto" align="start">
                      {allGenres.map(genre => (
                        <DropdownMenuCheckboxItem
                          key={genre.genreId}
                          checked={formData.genreIds.includes(genre.genreId)}
                          onCheckedChange={(checked) => {
                            setFormData(prev => {
                              if (checked) {
                                return { ...prev, genreIds: [...prev.genreIds, genre.genreId] };
                              } else {
                                return { ...prev, genreIds: prev.genreIds.filter(id => id !== genre.genreId) };
                              }
                            });
                          }}
                          onSelect={(e) => e.preventDefault()}
                        >
                          {genre.name}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Ngày khởi chiếu</Label>
                  <Input type="date" value={formData.releaseDate} onChange={e => setFormData({ ...formData, releaseDate: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Ngôn ngữ</Label>
                  <Select value={formData.language} onValueChange={v => setFormData({ ...formData, language: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vietnamese">Tiếng Việt</SelectItem>
                      <SelectItem value="English">Tiếng Anh</SelectItem>
                      <SelectItem value="Korean">Tiếng Hàn</SelectItem>
                      <SelectItem value="Japanese">Tiếng Nhật</SelectItem>
                      <SelectItem value="Other">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Độ tuổi</Label>
                  <Select value={formData.ageRating} onValueChange={v => setFormData({ ...formData, ageRating: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="G">G (Mọi lứa tuổi)</SelectItem>
                      <SelectItem value="PG">PG</SelectItem>
                      <SelectItem value="PG-13">PG-13 (Từ 13 tuổi)</SelectItem>
                      <SelectItem value="R">R (Từ 16 tuổi)</SelectItem>
                      <SelectItem value="NC-17">NC-17 (Từ 18 tuổi)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Trailer URL</Label>
                  <Input value={formData.trailerUrl} onChange={e => setFormData({ ...formData, trailerUrl: e.target.value })} placeholder="https://youtube.com/..." />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Poster</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    placeholder="URL ảnh hoặc Tải lên..." 
                    value={formData.poster} 
                    onChange={e => setFormData({ ...formData, poster: e.target.value })} 
                    className="flex-1"
                  />
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                  />
                  <Button 
                    variant="outline" 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Tải lên"}
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Thời lượng (phút)</Label>
                  <Input type="number" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Trạng thái</Label>
                  <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="now_showing">Đang chiếu</SelectItem>
                      <SelectItem value="coming_soon">Sắp chiếu</SelectItem>
                      <SelectItem value="hidden">Đã ẩn (Xóa)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
              <DialogTitle>Xóa bộ phim này?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground py-4">
              Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa bộ phim này khỏi hệ thống không?
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
