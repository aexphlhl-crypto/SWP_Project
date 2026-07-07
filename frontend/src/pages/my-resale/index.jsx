'use client';

import { useState, useEffect } from 'react';

import { useAuth } from '@/contexts/auth-context';
import resaleApi from '@/api/resaleApi';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Calendar, Clock, MapPin, Armchair, Pencil, Trash2, RefreshCw, Plus, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNavigate, Navigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useClientPagination } from '@/hooks/use-client-pagination';
import { ClientPagination } from '@/components/ui/client-pagination';
import { formatSeatType } from '@/pages/MyTickets';
const TICKET_TYPE_LABELS = {
  standard: 'Thường',
  vip: 'VIP',
  couple: 'Couple'
};
const STATUS_STYLES = {
  active: 'bg-green-500/20 text-green-400',
  hidden: 'bg-orange-500/20 text-orange-400',
  expired: 'bg-secondary text-muted-foreground',
  deleted: 'bg-red-500/20 text-red-400',
  sold: 'bg-blue-500/20 text-blue-400'
};
const STATUS_LABELS = {
  active: 'Đang hiển thị',
  hidden: 'Bị Admin ẩn',
  expired: 'Hết hạn',
  deleted: 'Đã xóa',
  sold: 'Đã bán'
};
export default function MyResaleListingsPage() {
  const {
    user,
    isAuthenticated
  } = useAuth();
  const router = useNavigate();
  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = async () => {
    try {
      const res = await resaleApi.getMyListings(user.id, { page: 0, size: 100 });
      if (res.success) {
        setListings(res.data.content.filter(l => l.status?.toLowerCase() !== 'deleted'));
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

  const { currentDataOnPage, currentPage, totalPages, handlePageChange, startIndex, endIndex, totalItems } = useClientPagination(listings);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [editNote, setEditNote] = useState('');
  const [priceError, setPriceError] = useState('');
  const openEdit = listing => {
    setSelectedListing(listing);
    setEditPrice(listing.resalePrice.toString());
    setEditNote(listing.note ?? '');
    setPriceError('');
    setEditDialogOpen(true);
  };
  const openDelete = listing => {
    setSelectedListing(listing);
    setDeleteDialogOpen(true);
  };
  const handleSaveEdit = async () => {
    try {
      const priceNum = parseInt(editPrice, 10);
      if (isNaN(priceNum) || priceNum <= 0) {
        setPriceError('Giá bán phải hợp lệ');
        return;
      }
      
      const payload = {
        askingPrice: priceNum,
        note: editNote
      };
      
      const res = await resaleApi.updateListing(selectedListing.id.replace('RSL', ''), payload);
      if (res.success) {
        toast.success('Cập nhật bài đăng thành công');
        setEditDialogOpen(false);
        fetchListings();
      }
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra khi cập nhật bài đăng');
    }
  };
  const handleDelete = async () => {
    try {
      const res = await resaleApi.deleteListing(selectedListing.id.replace('RSL', ''));
      if (res.success) {
        toast.success('Đã gỡ bài đăng');
        fetchListings();
      } else {
        toast.error(res.error?.message || 'Lỗi khi gỡ bài đăng');
      }
    } catch (error) {
      toast.error('Lỗi khi gỡ bài đăng');
    }
    setDeleteDialogOpen(false);
  };

  if (loading) {
    return <div className="text-center py-20">Đang tải...</div>;
  }

  return (
    <>
      <div className="container mx-auto px-4 py-10 max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <RefreshCw className="w-7 h-7 text-primary" />
              Vé bán lại của tôi
            </h1>
            <p className="text-muted-foreground mt-1">
              Quản lý các bài đăng vé bán lại của bạn
            </p>
          </div>
          <Button asChild className="gap-2 shrink-0">
            <Link to="/my-tickets">
              <Plus className="w-4 h-4" />
              Đăng bán vé mới
            </Link>
          </Button>
        </div>

        {listings.length === 0 ? <div className="text-center py-20 text-muted-foreground">
            <RefreshCw className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Bạn chưa có bài đăng nào.</p>
            <p className="text-sm mt-1 mb-4">Vào "Vé của tôi" để đăng bán vé sắp chiếu.</p>
            <Button asChild variant="outline">
              <Link to="/my-tickets">Xem vé của tôi</Link>
            </Button>
          </div> : <div className="space-y-4">
            {currentDataOnPage.map(listing => {
          const displayDate = listing.showDate ? new Date(listing.showDate).toLocaleDateString('vi-VN', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }) : '—';
          const listingStatus = listing.status?.toLowerCase() || 'active';
          const isExpired = listingStatus === 'expired';
          const isAdminHidden = listingStatus === 'hidden';
          const isSold = listingStatus === 'sold';
          return <Card key={listing.id} className="bg-card border-border overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex">
                      {/* Poster */}
                      <div className="w-20 shrink-0">
                        <img src={listing.moviePoster} alt={listing.movieTitle} className="w-full h-full object-cover" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 p-4 space-y-3 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-bold leading-tight line-clamp-1">
                              {listing.movieTitle}
                            </h3>
                            <p className="text-xs font-mono text-muted-foreground mt-0.5">
                              #{listing.id.toUpperCase()} • {listing.ticketType ? listing.ticketType.split(',').map(t => formatSeatType(t.trim())).join(', ') : 'Ghế Thường'}
                            </p>
                          </div>
                          <Badge className={cn('shrink-0', STATUS_STYLES[listingStatus])}>
                            {STATUS_LABELS[listingStatus] || listingStatus}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {displayDate}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {listing.showTime}
                          </div>
                          <div className="flex items-center gap-1 col-span-2 truncate">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="truncate">{listing.cinemaName} • {listing.roomName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Armchair className="w-3 h-3" />
                            Ghế bán {listing.seatNumber}
                          </div>
                          {listing.includesFnb && (
                            <div className="flex items-center gap-1 text-primary">
                              <RefreshCw className="w-3 h-3" />
                              Kèm bắp nước
                            </div>
                          )}
                        </div>

                        <Separator className="bg-border" />

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground line-through">
                              Gốc: {listing.originalPrice.toLocaleString('vi-VN')}₫
                            </p>
                            <p className="font-bold text-primary">
                              {listing.resalePrice.toLocaleString('vi-VN')}₫
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {/* BR-25: Disable edit for admin-hidden. BR: disable for expired/sold too */}
                            <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => openEdit(listing)} disabled={isExpired || isAdminHidden || isSold} title={isAdminHidden ? 'Bài bị Admin ẩn, không thể sửa' : isExpired ? 'Listing đã hết hạn' : isSold ? 'Đã bán thành công' : 'Chỉnh sửa'}>
                              <Pencil className="w-3 h-3" />
                              Sửa
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs text-destructive hover:text-destructive" onClick={() => openDelete(listing)}>
                              <Trash2 className="w-3 h-3" />
                              Gỡ
                            </Button>
                          </div>
                        </div>

                        {listingStatus === 'hidden' && listing.hiddenReason && <div className="flex items-start gap-1.5 p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                            <AlertTriangle className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-orange-400">
                              Bị ẩn: {listing.hiddenReason}
                            </p>
                          </div>}

                        {listing.note && <p className="text-xs text-muted-foreground italic line-clamp-1">
                            "{listing.note}"
                          </p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>;
        })}
          </div>}

        {!loading && listings.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 p-4 bg-card border border-border rounded-lg">
            <div className="text-sm text-muted-foreground mb-4 sm:mb-0">
              Hiển thị {startIndex + 1}-{endIndex} trên tổng số {totalItems} bài đăng
            </div>
            <ClientPagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={handlePageChange} 
            />
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa bài đăng</DialogTitle>
          </DialogHeader>
          {selectedListing && <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="edit-price">Giá bán lại (VNĐ) *</Label>
                <Input id="edit-price" type="number" min={1000} step={1000} value={editPrice} onChange={e => {
              setEditPrice(e.target.value);
              setPriceError('');
            }} />
                {priceError && <p className="text-xs text-destructive">{priceError}</p>}
                <p className="text-xs text-muted-foreground">
                  Giá gốc: {selectedListing.originalPrice.toLocaleString('vi-VN')}₫
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-note">Ghi chú</Label>
                <Input id="edit-note" placeholder="Thêm ghi chú cho người mua..." value={editNote} onChange={e => setEditNote(e.target.value)} />
              </div>
              <div className="rounded-lg bg-secondary/50 p-3 space-y-1 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">Tên & SĐT từ hồ sơ của bạn:</p>
                <p>{user?.name} • {user?.phone ?? 'Chưa cập nhật'}</p>
                <p className="italic">Không thể thay đổi thông tin liên hệ riêng cho bài đăng (BR-20).</p>
              </div>
            </div>}
          <Separator className="bg-border" />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleSaveEdit}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle>Xác nhận gỡ bài đăng</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Bài đăng sẽ bị xóa khỏi danh sách vé bán lại. QR vé của bạn vẫn còn hiệu lực (BR-14).
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
            <Button variant="destructive" onClick={handleDelete}>Gỡ bài đăng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </>
  );
}
