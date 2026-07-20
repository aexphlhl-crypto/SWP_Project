'use client';

import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import resaleApi from '@/api/resaleApi';
import bookingApi from '@/api/bookingApi';
import { useData } from '@/contexts/data-context';
import { useAuth } from '@/contexts/auth-context';
import { useClientPagination } from '@/hooks/use-client-pagination';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClientPagination } from '@/components/ui/client-pagination';

import { 
  Calendar, 
  MapPin, 
  Armchair, 
  Search, 
  Tag, 
  RefreshCw, 
  Ticket, 
  Plus,
  MessageCircle,
  X,
  Copy,
  Facebook,
  CheckCircle,
  ShieldCheck,
  AlertTriangle,
  Building2,
  SlidersHorizontal
} from 'lucide-react';

// Programmatically generate 20 realistic dummy listings for developer testing
const MOCK_TICKET_LISTINGS = Array.from({ length: 20 }, (_, i) => {
  const index = i + 1;
  const movieNum = (index % 10) + 1; // Dummy Movie 1 to 10
  const cinemaNum = (index % 5) + 1; // CineBook Cinema 1 to 5
  const originalPrice = index % 2 === 0 ? 120000 : 240000;
  // Asking price is lower than original (showing discount)
  const askingPrice = originalPrice === 240000 ? 180000 - (index * 2000) : 90000 - (index * 1000);
  
  const sellerNames = [
    "Daan V.", "Sophie M.", "Lucas B.", "Emma R.", "Mark T.", 
    "Nora K.", "Trung T.", "Minh A.", "Hoàng N.", "Bảo C."
  ];
  const seatsList = [
    "F7, F8", "E11", "G14, G15", "H3", "J1, J2", 
    "F9", "D5, D6", "A1, A2", "C12", "E8, E9"
  ];
  
  return {
    id: `mock-${index}`,
    bookingId: `BK20020${index}`,
    movieTitle: `Dummy Movie ${movieNum}`,
    moviePoster: "", 
    cinemaName: `CineBook Cinema ${cinemaNum}`,
    roomName: `Phòng 0${(index % 3) + 1} - IMAX`,
    showDate: `2026-06-${28 + (index % 3)}`,
    showTime: `${18 + (index % 4)}:30`,
    seatNumber: seatsList[index % seatsList.length],
    ticketType: originalPrice === 240000 ? "VIP" : "Standard",
    originalPrice,
    resalePrice: askingPrice,
    includesFnb: index % 3 === 0,
    sellerName: sellerNames[index % sellerNames.length],
    sellerPhone: `0912 345 6${index.toString().padStart(2, '0')}`,
    facebookUrl: `https://facebook.com/seller.profile.${index}`,
    note: index % 2 === 0 
      ? `Nhượng lại cặp vé đẹp xem tối nay do gia đình bận việc đột xuất.` 
      : `Mình mua nhầm lịch chiếu nên pass lại lỗ cho bạn nào quan tâm.`,
    status: "active",
    createdAt: new Date(Date.now() - index * 3600000).toISOString()
  };
});

export default function ResaleTicketPage() {
  const { user, isAuthenticated } = useAuth();
  const { movies, cinemas } = useData();

  const [resaleListings, setResaleListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch active listings
  const fetchListings = () => {
    setLoading(true);
    resaleApi.getActiveListings()
      .then(res => {
        if (res.success) {
          setResaleListings(res.data.content);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchListings();
  }, []);

  // Combined real + mock listings
  const activeListings = useMemo(() => {
    const realListings = (resaleListings || []).filter(l => l.status?.toLowerCase() === 'active');
    return [...realListings, ...MOCK_TICKET_LISTINGS];
  }, [resaleListings]);

  const uniqueMovies = useMemo(() => {
    return [...new Set(activeListings.map(l => l.movieTitle))];
  }, [activeListings]);

  const uniqueCinemas = useMemo(() => {
    return [...new Set(activeListings.map(l => l.cinemaName))];
  }, [activeListings]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMovie, setFilterMovie] = useState('all');
  const [filterCinema, setFilterCinema] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Modals state
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedListingForContact, setSelectedListingForContact] = useState(null);

  // List ticket form state
  const [userBookings, setUserBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [askingPrice, setAskingPrice] = useState('');
  const [phone, setPhone] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [note, setNote] = useState('');
  const [submittingListing, setSubmittingListing] = useState(false);

  // Fetch user bookings when opening list modal
  const openListModal = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để đăng bán vé.');
      return;
    }
    setIsListModalOpen(true);
    setLoadingBookings(true);
    setSelectedBooking(null);
    setAskingPrice('');
    setPhone('');
    setFacebookUrl('');
    setNote('');

    try {
      const [bookingsRes, listingsRes] = await Promise.all([
        bookingApi.getMyBookings(),
        resaleApi.getMyListings(user.userId || user.id, { page: 0, size: 100 })
      ]);

      if (bookingsRes.success) {
        const now = new Date();
        const activeListingsMap = {};
        if (listingsRes.success && listingsRes.data?.content) {
          listingsRes.data.content.forEach(l => {
            if (l.status?.toLowerCase() !== 'deleted' && l.status?.toLowerCase() !== 'cancelled') {
              activeListingsMap[l.bookingId] = true;
            }
          });
        }

        // Filter valid bookings: Confirmed and showtime is in the future
        const validBookings = bookingsRes.data.filter(b => {
          const isConfirmed = b.status?.toLowerCase() === 'confirmed' || b.status?.toLowerCase() === 'upcoming';
          if (!isConfirmed) return false;

          // Check if already listed
          if (activeListingsMap[b.id] || activeListingsMap['BK' + b.id]) return false;

          if (b.showDate && b.showTime) {
            const [year, month, day] = b.showDate.split('-');
            const [hours, minutes] = b.showTime.split(':');
            const showDateTime = new Date(year, parseInt(month, 10) - 1, day, hours, minutes, 0);
            return showDateTime > now;
          }
          return true;
        });

        setUserBookings(validBookings);
      }
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách vé của bạn.');
    } finally {
      setLoadingBookings(false);
    }
  };

  const handlePublishListing = async (e) => {
    e.preventDefault();
    if (!selectedBooking) {
      toast.error('Vui lòng chọn vé cần bán.');
      return;
    }
    const priceNum = Number(askingPrice);
    if (!askingPrice || isNaN(priceNum) || priceNum <= 0) {
      toast.error('Vui lòng nhập giá bán hợp lệ.');
      return;
    }
    if (priceNum > selectedBooking.totalAfterTax) {
      toast.error(`Giá bán lại không được vượt quá giá gốc vé (${selectedBooking.totalAfterTax.toLocaleString('vi-VN')}₫).`);
      return;
    }

    setSubmittingListing(true);
    try {
      const payload = {
        bookingId: Number(String(selectedBooking.id).replace('BK', '')),
        sellerId: user.userId || user.id,
        askingPrice: priceNum,
        note: note,
        phone: phone || user.phone || '',
        facebookUrl: facebookUrl,
        seats: selectedBooking.seatNumber,
        includesFnb: selectedBooking.fnbItems && selectedBooking.fnbItems.length > 0
      };

      const res = await resaleApi.createListing(payload);
      if (res.success) {
        toast.success('Đăng bán vé thành công! Vé của bạn đang được hiển thị trên chợ.');
        setIsListModalOpen(false);
        fetchListings(); // reload listings
      } else {
        toast.error(res.error?.message || 'Không thể đăng bán vé.');
      }
    } catch (err) {
      toast.error(err.response?.data?.error?.message || err.message || 'Có lỗi xảy ra.');
    } finally {
      setSubmittingListing(false);
    }
  };

  const openContactModal = (listing) => {
    setSelectedListingForContact(listing);
    setIsContactModalOpen(true);
  };

  const handleCopyPhone = () => {
    if (selectedListingForContact?.sellerPhone) {
      navigator.clipboard.writeText(selectedListingForContact.sellerPhone);
      toast.success('Đã sao chép số điện thoại.');
    }
  };

  // Filter listings
  const filtered = useMemo(() => {
    let result = [...activeListings];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(l => 
        l.movieTitle?.toLowerCase().includes(q) || 
        l.cinemaName?.toLowerCase().includes(q) || 
        l.sellerName?.toLowerCase().includes(q)
      );
    }
    if (filterMovie !== 'all') result = result.filter(l => l.movieTitle === filterMovie);
    if (filterCinema !== 'all') result = result.filter(l => l.cinemaName === filterCinema);
    
    result.sort((a, b) => {
      if (sortBy === 'price_asc') return a.resalePrice - b.resalePrice;
      if (sortBy === 'price_desc') return b.resalePrice - a.resalePrice;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return result;
  }, [searchQuery, filterMovie, filterCinema, sortBy, activeListings]);

  const { currentDataOnPage, currentPage, totalPages, handlePageChange, startIndex, endIndex, totalItems } = useClientPagination(filtered);

  const clearFilters = () => {
    setSearchQuery('');
    setFilterMovie('all');
    setFilterCinema('all');
    setSortBy('newest');
  };
  const hasFilters = searchQuery || filterMovie !== 'all' || filterCinema !== 'all';

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 mesh-glow relative">
      {/* Background patterns */}
      <div className="absolute inset-0 dot-pattern opacity-[0.35] dark:opacity-[0.12] pointer-events-none" />
      
      {/* ─── Hero Header & Stats Block ─── */}
      <div className="relative overflow-hidden bg-card/45 backdrop-blur-md border-b border-border/60 py-16 mb-10">
        {/* Glowing visual effect */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[380px] h-[380px] bg-primary/10 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-[200px] h-[200px] bg-amber-500/5 rounded-full blur-[60px] pointer-events-none" />
        
        <div className="relative container max-w-[1400px] mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-foreground tracking-tight">Ticket Exchange</h1>
              <p className="text-sm text-muted-foreground max-w-xl">
                Nền tảng trao đổi vé xem phim an toàn giữa các khán giả. Mua lại hoặc nhượng vé trống với giá cả thỏa thuận.
              </p>
              
              {/* Badges */}
              <div className="flex flex-wrap gap-4 pt-3 text-xs font-semibold text-muted-foreground">
                <span className="flex items-center gap-1.5"><Ticket className="w-3.5 h-3.5 text-primary" /> {totalItems} vé đang giao dịch</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-green-500" /> 98% Người bán uy tín</span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-primary" /> Chuyển vé tự động</span>
              </div>
            </div>
            
            {/* List for sale CTA */}
            <Button 
              onClick={openListModal} 
              className="bg-primary hover:bg-primary/95 text-primary-foreground font-black h-11 px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 shrink-0 self-start md:self-auto"
            >
              <Plus className="w-4 h-4" /> Đăng bán vé của bạn
            </Button>
          </div>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <main className="container max-w-[1400px] mx-auto px-4 space-y-6">
        
        {/* Filters Panel */}
        <Card className="bg-card border-border shadow-xl rounded-2xl overflow-hidden">
          <CardContent className="p-5 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Tìm tên phim, rạp chiếu, người bán..." 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                className="pl-10 bg-muted border-input h-11 rounded-xl text-sm focus:border-primary/60" 
              />
            </div>
            
            <div className="flex flex-wrap gap-3 items-center">
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground shrink-0" />
              
              <Select value={filterMovie} onValueChange={setFilterMovie}>
                <SelectTrigger className="w-full sm:w-[200px] h-10 bg-muted border-input rounded-xl text-xs">
                  <SelectValue placeholder="Chọn phim" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">Tất cả phim</SelectItem>
                  {uniqueMovies.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={filterCinema} onValueChange={setFilterCinema}>
                <SelectTrigger className="w-full sm:w-[200px] h-10 bg-muted border-input rounded-xl text-xs">
                  <SelectValue placeholder="Chọn rạp" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">Tất cả rạp</SelectItem>
                  {uniqueCinemas.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[180px] h-10 bg-muted border-input rounded-xl text-xs">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="newest">Mới nhất</SelectItem>
                  <SelectItem value="price_asc">Giá rẻ nhất</SelectItem>
                  <SelectItem value="price_desc">Giá cao nhất</SelectItem>
                </SelectContent>
              </Select>

              {hasFilters && (
                <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground hover:text-foreground h-10 rounded-xl gap-2 text-xs">
                  <RefreshCw className="w-3.5 h-3.5" /> Xóa bộ lọc
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Resale listings grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-zinc-500 font-semibold uppercase tracking-wider">Đang tải danh sách vé...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border rounded-2xl shadow-xl">
            <Ticket className="w-16 h-16 text-muted-foreground/60 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground">Không tìm thấy vé phù hợp</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">Vui lòng thử tìm kiếm với từ khóa khác hoặc xóa bớt bộ lọc hiện có.</p>
            {hasFilters && <Button variant="link" onClick={clearFilters} className="text-primary font-bold mt-4">Xóa bộ lọc</Button>}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Grid of Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentDataOnPage.map(listing => {
                // Find matching movie still from DataContext to get beautiful still backdrop
                const matchedMovie = movies.find(m => m.title?.toLowerCase() === listing.movieTitle?.toLowerCase());
                const coverImage = matchedMovie?.backdrop || listing.moviePoster || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80";
                
                // Calculate saving percentage
                const originalPrice = listing.originalPrice || 0;
                const resalePrice = listing.resalePrice || 0;
                const discountPercent = originalPrice > 0 
                  ? Math.round(((originalPrice - resalePrice) / originalPrice) * 100)
                  : 0;

                return (
                  <Card key={listing.id} className="bg-card/70 backdrop-blur-sm border-border rounded-2xl overflow-hidden hover:border-primary/40 transition-all duration-300 flex flex-col group hover:shadow-[0_20px_40px_-15px_rgba(255,184,0,0.08)] hover:-translate-y-1">
                    {/* Widescreen image with overlay badges */}
                    <div className="relative aspect-video w-full overflow-hidden bg-muted shrink-0 border-b border-border/40">
                      <img 
                        src={coverImage} 
                        alt={listing.movieTitle} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      />
                      {/* Dark overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                      
                      {/* Save discount badge */}
                      {discountPercent > 0 && (
                        <div className="absolute bottom-3 right-3 bg-gradient-to-r from-primary to-amber-500 text-primary-foreground text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-md">
                          Save {discountPercent}%
                        </div>
                      )}
                    </div>

                    {/* Card Body */}
                    <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      {/* Details and pricing */}
                      <div className="space-y-3.5">
                        {/* Title */}
                        <div>
                          <h3 className="font-extrabold text-foreground text-base leading-tight truncate group-hover:text-primary transition-colors">{listing.movieTitle}</h3>
                          <p className="text-[10px] text-muted-foreground/60 font-mono mt-0.5 uppercase tracking-wider">Mã vé: #{String(listing.id).toUpperCase()}</p>
                        </div>

                        {/* Event Details */}
                        <div className="space-y-1.5 text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="truncate">{listing.cinemaName} • {listing.roomName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span>{listing.showDate} - {listing.showTime}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Armchair className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span>Ghế: <strong className="text-foreground">{listing.seatNumber}</strong></span>
                          </div>
                          {listing.includesFnb && (
                            <div className="flex items-center gap-2 text-primary font-bold">
                              <span>🍿</span>
                              <span>Đã kèm Bắp & Nước</span>
                            </div>
                          )}
                        </div>

                        {/* Pricing */}
                        <div className="flex items-baseline gap-2 pt-1">
                          <span className="text-lg font-black text-primary">
                            {resalePrice.toLocaleString('vi-VN')}₫
                          </span>
                          {originalPrice > 0 && (
                            <span className="text-xs text-muted-foreground/60 line-through">
                              {originalPrice.toLocaleString('vi-VN')}₫
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Seller Profile & CTA */}
                      <div className="space-y-4 pt-3 border-t border-border/50">
                        <div className="flex items-center justify-between">
                          {/* Seller block */}
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary capitalize">
                              {listing.sellerName?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-foreground flex items-center gap-1 leading-none">
                                {listing.sellerName}
                                <span className="text-[9px] text-green-500 bg-green-500/10 px-1 py-0.5 rounded font-bold uppercase scale-90">✓ Verified</span>
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">⭐ 4.8 Rating</p>
                            </div>
                          </div>
                        </div>

                        {/* Contact Seller Button */}
                        <Button 
                          onClick={() => openContactModal(listing)}
                          className="w-full bg-gradient-to-r from-primary/10 to-amber-500/10 hover:from-primary/20 hover:to-amber-500/20 border border-primary/30 text-primary font-bold h-10 rounded-xl flex items-center justify-center gap-1.5 transition-all text-xs shadow-sm active:scale-[0.98]"
                        >
                          <MessageCircle className="w-4 h-4" /> Liên hệ người bán
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            {filtered.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-card border border-border rounded-2xl shadow-xl gap-4">
                <div className="text-xs text-muted-foreground font-medium">
                  Hiển thị {startIndex + 1}-{endIndex} trên tổng số {totalItems} vé
                </div>
                <ClientPagination 
                  currentPage={currentPage} 
                  totalPages={totalPages} 
                  onPageChange={handlePageChange} 
                />
              </div>
            )}
          </div>
        )}

      </main>

      {/* ─── Modal 1: List a Ticket for Sale ─── */}
      {isListModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200 my-8">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h2 className="text-lg font-black text-foreground uppercase tracking-wider">Đăng bán vé resale</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setIsListModalOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {loadingBookings ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Đang kiểm tra vé hợp lệ...</p>
              </div>
            ) : (
              <form onSubmit={handlePublishListing} className="space-y-4">
                {userBookings.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-border rounded-xl space-y-2">
                    <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
                    <p className="text-sm font-bold text-foreground">Bạn không có vé nào có thể đăng bán</p>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">Vé có thể bán lại phải là vé đã thanh toán thành công (Confirmed) và có suất chiếu bắt đầu sau ít nhất 2 giờ nữa.</p>
                  </div>
                ) : (
                  <>
                    {/* Booking Code Selection */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Chọn vé để bán lại *</label>
                      <Select 
                        onValueChange={(val) => {
                          const bk = userBookings.find(b => String(b.id) === val);
                          setSelectedBooking(bk);
                        }}
                      >
                        <SelectTrigger className="w-full bg-muted border-input h-11 rounded-xl text-sm focus:border-primary/60">
                          <SelectValue placeholder="Chọn mã hóa đơn của bạn" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          {userBookings.map(bk => (
                            <SelectItem key={bk.id} value={String(bk.id)}>
                              #{bk.id} - {bk.movieTitle} (Ghế {bk.seatNumber})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Pre-filled Showtime details */}
                    {selectedBooking && (
                      <div className="bg-muted border border-border rounded-xl p-3.5 space-y-1.5 text-xs text-muted-foreground">
                        <p className="font-bold text-foreground">Chi tiết vé đăng bán:</p>
                        <p><span className="text-muted-foreground/60">Phim:</span> {selectedBooking.movieTitle}</p>
                        <p><span className="text-muted-foreground/60">Suất chiếu:</span> {selectedBooking.showDate} ({selectedBooking.showTime})</p>
                        <p><span className="text-muted-foreground/60">Rạp & phòng:</span> {selectedBooking.cinemaName} • {selectedBooking.roomName}</p>
                        <p><span className="text-muted-foreground/60">Ghế ngồi:</span> {selectedBooking.seatNumber}</p>
                        <p><span className="text-muted-foreground/60">Giá gốc:</span> <strong className="text-foreground">{selectedBooking.totalAfterTax?.toLocaleString('vi-VN')}₫</strong></p>
                      </div>
                    )}

                    {/* Resale Price */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Giá muốn bán lại (VNĐ) *</label>
                      <div className="relative">
                        <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                        <Input 
                          type="number"
                          placeholder="Ví dụ: 80000"
                          value={askingPrice}
                          onChange={(e) => setAskingPrice(e.target.value)}
                          className="pl-10 bg-muted border-input h-11 rounded-xl text-sm focus:border-primary/60"
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground/60 italic mt-1">Lưu ý: Giá bán không được vượt quá giá gốc của vé nhằm chống đầu cơ vé.</p>
                    </div>

                    {/* Contact Phone */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Số điện thoại liên hệ *</label>
                      <Input 
                        placeholder="Nhập số điện thoại để người mua liên hệ"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="bg-muted border-input h-11 rounded-xl text-sm focus:border-primary/60"
                      />
                    </div>

                    {/* Facebook Profile URL */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Facebook cá nhân (URL) *</label>
                      <div className="relative">
                        <Facebook className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                        <Input 
                          placeholder="Link Facebook để người mua nhắn tin nhanh"
                          value={facebookUrl}
                          onChange={(e) => setFacebookUrl(e.target.value)}
                          className="pl-10 bg-muted border-input h-11 rounded-xl text-sm focus:border-primary/60"
                        />
                      </div>
                    </div>

                    {/* Note */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Lời nhắn gửi người mua (Lý do nhượng vé...)</label>
                      <textarea 
                        placeholder="Ví dụ: Mình bận việc đột xuất không đi xem được nên nhượng lại rẻ cho bạn nào cần..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full bg-muted border border-input p-3 rounded-xl text-sm focus:border-primary/60 min-h-[80px]"
                      />
                    </div>

                    {/* CTA Action buttons */}
                    <div className="flex justify-end gap-3 pt-3">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => setIsListModalOpen(false)}
                        className="rounded-xl h-11"
                      >
                        Hủy
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={submittingListing}
                        className="bg-primary hover:bg-primary/95 text-primary-foreground font-black px-6 h-11 rounded-xl shadow-lg shadow-primary/25 disabled:opacity-40"
                      >
                        {submittingListing ? 'Đang đăng bán...' : 'Đăng bán vé ngay'}
                      </Button>
                    </div>
                  </>
                )}
              </form>
            )}
          </div>
        </div>
      )}

      {/* ─── Modal 2: Contact Seller ─── */}
      {isContactModalOpen && selectedListingForContact && (
        <div className="fixed inset-0 z-50 bg-black/40 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h2 className="text-base font-black text-foreground uppercase tracking-wider">Thông tin liên hệ</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setIsContactModalOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Seller profile block */}
            <div className="flex items-center gap-3 p-4 bg-muted border border-border rounded-2xl">
              <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center text-sm font-black text-primary capitalize shrink-0">
                {selectedListingForContact.sellerName?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground text-sm flex items-center gap-1">
                  {selectedListingForContact.sellerName}
                  <span className="text-[9px] text-green-500 bg-green-500/10 px-1 py-0.5 rounded font-bold uppercase">Uy tín</span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Thành viên verified • ⭐ 4.8 rating</p>
              </div>
            </div>

            {/* Contact numbers */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">Số điện thoại liên hệ</label>
                <div className="flex items-center justify-between p-3 bg-muted border border-border rounded-xl">
                  <span className="text-sm font-mono text-foreground font-bold">
                    {selectedListingForContact.sellerPhone || 'Không có số điện thoại'}
                  </span>
                  {selectedListingForContact.sellerPhone && (
                    <Button 
                      onClick={handleCopyPhone}
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {selectedListingForContact.facebookUrl && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">Facebook cá nhân</label>
                  <Button 
                    asChild
                    className="w-full bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold h-11 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/10"
                  >
                    <a 
                      href={selectedListingForContact.facebookUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Facebook className="w-4 h-4 fill-white" /> Nhắn tin qua Facebook
                    </a>
                  </Button>
                </div>
              )}
            </div>

            {/* Warning block */}
            <div className="flex gap-2.5 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-[11px] text-muted-foreground/60 leading-relaxed">
              <span className="text-sm shrink-0">⚠️</span>
              <p>
                <strong>Khuyến cáo bảo mật:</strong> Để đảm bảo an toàn tuyệt đối, chỉ thực hiện chuyển khoản sau khi đã xác nhận mã vé trực tiếp và nhận thông tin chuyển nhượng hợp lệ trên website.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
