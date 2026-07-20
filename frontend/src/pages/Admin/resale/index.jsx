'use client';

import { useState, useMemo, useEffect } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, Search, EyeOff, Eye, SlidersHorizontal, Calendar, User, Phone, Film, MapPin, Armchair, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import resaleApi from '@/api/resaleApi';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { toast } from 'sonner';
import { useClientPagination } from '@/hooks/use-client-pagination';
import { ClientPagination } from '@/components/ui/client-pagination';

// ── Constants ────────────────────────────────────────────────────────────────

const TICKET_TYPE_LABELS = {
  standard: 'Thường',
  vip: 'VIP',
  couple: 'Couple'
};
const STATUS_STYLES = {
  active: 'bg-green-500/20 text-green-400 border-green-500/30',
  hidden: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  expired: 'bg-secondary text-muted-foreground border-border',
  deleted: 'bg-red-500/20 text-red-400 border-red-500/30',
  sold: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
};
const STATUS_LABELS = {
  active: 'Active',
  hidden: 'Hidden',
  expired: 'Expired',
  deleted: 'Deleted',
  sold: 'Sold'
};

// ── Component ────────────────────────────────────────────────────────────────

export default function AdminResalePage() {
  const { user } = useAuth();
  const { movies, cinemas } = useData();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = async () => {
    try {
      const res = await resaleApi.getAllListings({ page: 0, size: 500 });
      if (res.success) {
        setListings(res.data.content);
      }
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi tải danh sách vé bán lại');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const uniqueMovies = useMemo(() => {
    const listFromListings = (listings || []).map(l => l.movieTitle).filter(Boolean);
    const listFromMovies = (movies || []).map(m => m.title).filter(Boolean);
    return [...new Set([...listFromListings, ...listFromMovies])];
  }, [listings, movies]);

  const uniqueCinemas = useMemo(() => {
    const listFromListings = (listings || []).map(l => l.cinemaName).filter(Boolean);
    const listFromCinemas = (cinemas || []).map(c => c.name).filter(Boolean);
    return [...new Set([...listFromListings, ...listFromCinemas])];
  }, [listings, cinemas]);

  const [search, setSearch] = useState('');
  const [filterMovie, setFilterMovie] = useState('all');
  const [filterCinema, setFilterCinema] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Hide dialog state
  const [hideDialogOpen, setHideDialogOpen] = useState(false);
  const [targetListing, setTargetListing] = useState(null);
  const [hideReason, setHideReason] = useState('');
  const [reasonError, setReasonError] = useState('');

  // Detail / view dialog
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailListing, setDetailListing] = useState(null);

  // Filtered results
  const filtered = useMemo(() => {
    let result = [...listings];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(l => l.movieTitle.toLowerCase().includes(q) || l.cinemaName.toLowerCase().includes(q) || l.sellerName.toLowerCase().includes(q) || l.id.toLowerCase().includes(q));
    }
    if (filterMovie !== 'all') result = result.filter(l => l.movieTitle === filterMovie);
    if (filterCinema !== 'all') result = result.filter(l => l.cinemaName === filterCinema);
    if (filterStatus !== 'all') result = result.filter(l => l.status === filterStatus);
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [listings, search, filterMovie, filterCinema, filterStatus]);

  const { currentDataOnPage, currentPage, totalPages, handlePageChange, startIndex, endIndex, totalItems } = useClientPagination(filtered);

  // KPI counts
  const counts = useMemo(() => ({
    total: listings.length,
    active: listings.filter(l => l.status === 'active').length,
    hidden: listings.filter(l => l.status === 'hidden').length,
    expired: listings.filter(l => l.status === 'expired').length,
    sold: listings.filter(l => l.status === 'sold').length,
    deleted: listings.filter(l => l.status === 'deleted').length
  }), [listings]);

  // Actions
  const openHideDialog = listing => {
    setTargetListing(listing);
    setHideReason('');
    setReasonError('');
    setHideDialogOpen(true);
  };
  const handleHide = async () => {
    if (!hideReason.trim()) {
      setReasonError('Vui lòng nhập lý do ẩn bài.');
      return;
    }
    try {
      await resaleApi.updateStatus(targetListing.id.replace('RSL', ''), {
        status: 'Hidden',
        hiddenReason: hideReason.trim(),
        hiddenByAdminId: user?.id || 1
      });
      toast.success('Đã ẩn bài đăng');
      fetchListings();
    } catch (error) {
      toast.error('Lỗi khi ẩn bài đăng');
    }
    setHideDialogOpen(false);
  };
  const handleUnhide = async id => {
    try {
      await resaleApi.updateStatus(id.replace('RSL', ''), {
        status: 'Active'
      });
      toast.success('Đã khôi phục bài đăng');
      fetchListings();
    } catch (error) {
      toast.error('Lỗi khi khôi phục bài đăng');
    }
  };
  const openDetail = listing => {
    setDetailListing(listing);
    setDetailOpen(true);
  };
  const clearFilters = () => {
    setSearch('');
    setFilterMovie('all');
    setFilterCinema('all');
    setFilterStatus('all');
  };
  const hasFilters = search || filterMovie !== 'all' || filterCinema !== 'all' || filterStatus !== 'all';
  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <RefreshCw className="w-6 h-6 text-primary" />
              Quản lý Resale Listings
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Xem và ẩn các bài đăng vé bán lại từ khách hàng (UC-49 / BR-22)
            </p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[{
          label: 'Tổng',
          value: counts.total,
          color: 'text-foreground'
        }, {
          label: 'Active',
          value: counts.active,
          color: 'text-green-400'
        }, {
          label: 'Hidden',
          value: counts.hidden,
          color: 'text-orange-400'
        }, {
          label: 'Expired',
          value: counts.expired,
          color: 'text-muted-foreground'
        }, {
          label: 'Sold',
          value: counts.sold,
          color: 'text-blue-400'
        }, {
          label: 'Deleted',
          value: counts.deleted,
          color: 'text-red-400'
        }].map(kpi => <Card key={kpi.label} className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <p className={cn('text-2xl font-bold', kpi.color)}>{kpi.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{kpi.label}</p>
              </CardContent>
            </Card>)}
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input id="admin-resale-search" placeholder="Tìm ID, phim, rạp, tên người bán..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground shrink-0" />
            <Select value={filterMovie} onValueChange={setFilterMovie}>
              <SelectTrigger className="h-8 w-auto min-w-[150px] text-xs">
                <SelectValue placeholder="Phim" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả phim</SelectItem>
                {uniqueMovies.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterCinema} onValueChange={setFilterCinema}>
              <SelectTrigger className="h-8 w-auto min-w-[150px] text-xs">
                <SelectValue placeholder="Rạp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả rạp</SelectItem>
                {uniqueCinemas.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={v => setFilterStatus(v)}>
              <SelectTrigger className="h-8 w-auto min-w-[130px] text-xs">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="deleted">Deleted</SelectItem>
              </SelectContent>
            </Select>
            {hasFilters && <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs gap-1 text-muted-foreground">
                <RefreshCw className="w-3 h-3" />
                Xóa lọc
              </Button>}
            <span className="text-xs text-muted-foreground ml-auto">
              {filtered.length} / {listings.length} listings
            </span>
          </div>
        </div>

        {/* Table */}
        <Card className="bg-card border-border">
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-xs">ID</TableHead>
                  <TableHead className="text-xs">Phim</TableHead>
                  <TableHead className="text-xs">Rạp</TableHead>
                  <TableHead className="text-xs">Người bán</TableHead>
                  <TableHead className="text-xs">Ghế</TableHead>
                  <TableHead className="text-xs">Giá bán</TableHead>
                  <TableHead className="text-xs">Ngày đăng</TableHead>
                  <TableHead className="text-xs">Trạng thái</TableHead>
                  <TableHead className="text-xs text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                      <RefreshCw className="w-10 h-10 mx-auto mb-2 opacity-20" />
                      Không có kết quả phù hợp
                    </TableCell>
                  </TableRow> : currentDataOnPage.map(listing => <TableRow key={listing.id} className="border-border">
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        #{listing.id.toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 min-w-0">
                          <img src={listing.moviePoster} alt={listing.movieTitle} className="w-8 h-10 rounded object-cover shrink-0" />
                          <p className="text-xs font-medium line-clamp-2 max-w-[150px]">
                            {listing.movieTitle}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[120px]">
                        <span className="line-clamp-1">{listing.cinemaName}</span>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <p className="font-medium">{listing.sellerName}</p>
                          <p className="text-muted-foreground font-mono">{listing.sellerPhone}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div>
                          <p>Ghế bán {listing.seatNumber}</p>
                          <p className="text-muted-foreground">{TICKET_TYPE_LABELS[listing.ticketType]}</p>
                          {listing.includesFnb && (
                            <p className="text-xs text-primary font-medium flex items-center gap-1 mt-0.5">
                              <RefreshCw className="w-3 h-3" /> Kèm bắp nước
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        <p className="font-bold text-primary">{listing.resalePrice.toLocaleString('vi-VN')}₫</p>
                        <p className="text-muted-foreground line-through">{listing.originalPrice.toLocaleString('vi-VN')}₫</p>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {listing.createdAt ? new Date(listing.createdAt).toLocaleDateString('vi-VN') : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn('text-xs border', STATUS_STYLES[listing.status])}>
                          {STATUS_LABELS[listing.status]}
                        </Badge>
                        {listing.status === 'hidden' && listing.hiddenReason && <p className="text-xs text-orange-400/80 mt-1 max-w-[120px] line-clamp-1" title={listing.hiddenReason}>
                            {listing.hiddenReason}
                          </p>}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1.5 justify-end">
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openDetail(listing)} title="Xem chi tiết">
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          {/* BR-22: Admin can hide active listings */}
                          {listing.status === 'active' && <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-orange-400 hover:text-orange-300 hover:bg-orange-500/10" onClick={() => openHideDialog(listing)} title="Ẩn bài đăng">
                              <EyeOff className="w-3.5 h-3.5" />
                            </Button>}
                          {/* Unhide: restore to active */}
                          {listing.status === 'hidden' && <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-green-400 hover:text-green-300 hover:bg-green-500/10" onClick={() => handleUnhide(listing.id)} title="Khôi phục bài đăng">
                              <Eye className="w-3.5 h-3.5" />
                            </Button>}
                        </div>
                      </TableCell>
                    </TableRow>)}
              </TableBody>
            </Table>
            {!loading && filtered.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-border">
                <div className="text-sm text-muted-foreground mb-4 sm:mb-0">
                  Hiển thị {startIndex + 1}-{endIndex} trên tổng số {totalItems} vé bán lại
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

      {/* Hide Dialog */}
      <Dialog open={hideDialogOpen} onOpenChange={setHideDialogOpen}>
        <DialogContent className="sm:max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-400">
              <EyeOff className="w-5 h-5" />
              Ẩn bài đăng
            </DialogTitle>
          </DialogHeader>
          {targetListing && <div className="space-y-4 py-2">
              <div className="rounded-lg bg-secondary/50 p-3 text-sm space-y-1">
                <p className="font-semibold">{targetListing.movieTitle}</p>
                <p className="text-muted-foreground text-xs">
                  {targetListing.cinemaName} • Ghế {targetListing.seatNumber}
                </p>
                <p className="text-muted-foreground text-xs">
                  Người bán: {targetListing.sellerName} ({targetListing.sellerPhone})
                </p>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-400">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>Bài đăng sẽ bị ẩn khỏi danh sách công khai (BR-23). Customer vẫn thấy trong My Resale (BR-24) nhưng không thể tự khôi phục (BR-25).</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hide-reason">Lý do ẩn bài *</Label>
                <Input id="hide-reason" placeholder="VD: Giá bán vượt 150% giá gốc..." value={hideReason} onChange={e => {
              setHideReason(e.target.value);
              setReasonError('');
            }} />
                {reasonError && <p className="text-xs text-destructive">{reasonError}</p>}
              </div>
            </div>}
          <Separator className="bg-border" />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setHideDialogOpen(false)}>Hủy</Button>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={handleHide}>
              <EyeOff className="w-4 h-4 mr-1.5" />
              Xác nhận ẩn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle>Chi tiết Resale Listing</DialogTitle>
          </DialogHeader>
          {detailListing && <div className="space-y-4 py-2 text-sm">
              <div className="flex items-start gap-3">
                <img src={detailListing.moviePoster} alt={detailListing.movieTitle} className="w-16 rounded-lg object-cover aspect-[2/3] shrink-0" />
                <div className="space-y-1 flex-1">
                  <p className="font-bold leading-tight">{detailListing.movieTitle}</p>
                  <Badge className={cn('text-xs border', STATUS_STYLES[detailListing.status])}>
                    {STATUS_LABELS[detailListing.status]}
                  </Badge>
                  <p className="text-xs text-muted-foreground font-mono">#{detailListing.id.toUpperCase()}</p>
                </div>
              </div>
              <Separator className="bg-border" />
              {[{
            icon: MapPin,
            label: 'Rạp',
            value: detailListing.cinemaName
          }, {
            icon: Calendar,
            label: 'Ngày chiếu',
            value: detailListing?.showDate ? `${new Date(detailListing.showDate).toLocaleDateString('vi-VN')} ${detailListing.showTime}` : '—'
          }, {
            icon: Armchair,
            label: 'Ghế bán',
            value: `${detailListing.seatNumber} (${TICKET_TYPE_LABELS[detailListing.ticketType]})`
          }, {
            icon: RefreshCw,
            label: 'Bắp nước',
            value: detailListing.includesFnb ? 'Có kèm bắp nước' : 'Không'
          }, {
            icon: User,
            label: 'Người bán',
            value: detailListing.sellerName
          }, {
            icon: Phone,
            label: 'SĐT',
            value: detailListing.sellerPhone
          }, {
            icon: Film,
            label: 'Giá',
            value: `${detailListing.resalePrice.toLocaleString('vi-VN')}₫ (gốc: ${detailListing.originalPrice.toLocaleString('vi-VN')}₫)`
          }].map(({
            icon: Icon,
            label,
            value
          }) => <div key={label} className="flex items-start gap-2">
                  <Icon className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <span className="text-muted-foreground text-xs">{label}: </span>
                    <span className="font-medium">{value}</span>
                  </div>
                </div>)}
              {detailListing.note && <div className="rounded-lg bg-secondary/40 p-3 text-xs text-muted-foreground italic">
                  "{detailListing.note}"
                </div>}
              {detailListing.status === 'hidden' && <div className="rounded-lg bg-orange-500/10 border border-orange-500/30 p-3 space-y-1 text-xs">
                  <p className="text-orange-400 font-semibold flex items-center gap-1">
                    <EyeOff className="w-3.5 h-3.5" />
                    Bị ẩn bởi Admin
                  </p>
                  <p className="text-muted-foreground">Lý do: {detailListing.hiddenReason}</p>
                  <p className="text-muted-foreground">
                    Thời gian: {detailListing.hiddenAt ? new Date(detailListing.hiddenAt).toLocaleString('vi-VN') : '—'}
                  </p>
                </div>}
            </div>}
          <Separator className="bg-border" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>Đóng</Button>
            {detailListing?.status === 'active' && <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => {
            setDetailOpen(false);
            openHideDialog(detailListing);
          }}>
                <EyeOff className="w-4 h-4 mr-1.5" />
                Ẩn bài
              </Button>}
            {detailListing?.status === 'hidden' && <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => {
            handleUnhide(detailListing.id);
            setDetailOpen(false);
          }}>
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Khôi phục
              </Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </>
  );
}
