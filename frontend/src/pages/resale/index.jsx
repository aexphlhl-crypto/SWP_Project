'use client';

import { useState, useMemo, useEffect } from 'react';

import resaleApi from '@/api/resaleApi';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, MapPin, Armchair, Search, Tag, RefreshCw, ChevronRight, SlidersHorizontal, Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useClientPagination } from '@/hooks/use-client-pagination';
import { ClientPagination } from '@/components/ui/client-pagination';
import { formatSeatType } from '@/pages/MyTickets';

export default function ResaleTicketPage() {
  const [resaleListings, setResaleListings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    resaleApi.getActiveListings().then(res => {
      if (res.success) {
        setResaleListings(res.data.content);
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const activeListings = (resaleListings || []).filter(l => l.status?.toLowerCase() === 'active');
  const uniqueMovies = [...new Set(activeListings.map(l => l.movieTitle))];
  const uniqueCinemas = [...new Set(activeListings.map(l => l.cinemaName))];
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMovie, setFilterMovie] = useState('all');
  const [filterCinema, setFilterCinema] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  
  const filtered = useMemo(() => {
    let result = [...activeListings];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(l => l.movieTitle?.toLowerCase().includes(q) || l.cinemaName?.toLowerCase().includes(q) || l.sellerName?.toLowerCase().includes(q));
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

  if (loading) {
    return <div className="text-center py-20 text-muted-foreground">Đang tải...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Chợ vé Resale</h1>
        <p className="text-muted-foreground mt-1">
          Mua lại vé từ người khác với giá thỏa thuận
        </p>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Tìm tên phim, rạp, người bán..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground shrink-0" />
            <Select value={filterMovie} onValueChange={setFilterMovie}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Chọn phim" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả phim</SelectItem>
                {uniqueMovies.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterCinema} onValueChange={setFilterCinema}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Chọn rạp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả rạp</SelectItem>
                {uniqueCinemas.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mới nhất</SelectItem>
                <SelectItem value="price_asc">Giá tăng dần</SelectItem>
                <SelectItem value="price_desc">Giá giảm dần</SelectItem>
              </SelectContent>
            </Select>
            {hasFilters && <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground gap-2">
                <RefreshCw className="w-4 h-4" /> Xóa lọc
              </Button>}
          </div>
        </CardContent>
      </Card>

      {/* Listing List */}
      <div className="space-y-4">
        {filtered.length === 0 ? <div className="text-center py-16 bg-card border border-border rounded-xl">
            <Ticket className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">Không tìm thấy vé phù hợp</p>
            {hasFilters && <Button variant="link" onClick={clearFilters}>Xóa bộ lọc</Button>}
          </div> : currentDataOnPage.map(listing => <Card key={listing.id} className="bg-card border-border overflow-hidden hover:border-primary/50 transition-colors">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  {/* Info */}
                  <div className="flex-1 p-5 space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-bold text-lg leading-tight">{listing.movieTitle}</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">#{String(listing.id).toUpperCase()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xl text-primary">{listing.resalePrice?.toLocaleString('vi-VN')}₫</p>
                        <p className="text-xs text-muted-foreground line-through">Gốc: {listing.originalPrice?.toLocaleString('vi-VN')}₫</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> {listing.showDate} {listing.showTime}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 shrink-0" /> <span className="truncate">{listing.cinemaName} • {listing.roomName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Armchair className="w-4 h-4" /> Ghế {listing.seatNumber}
                      </div>
                      <div className="flex items-center gap-2">
                        <Ticket className="w-4 h-4" /> {listing.ticketType ? listing.ticketType.split(',').map(t => formatSeatType(t.trim())).join(', ') : 'Ghế Thường'}
                      </div>
                      {listing.includesFnb && (
                        <div className="flex items-center gap-2 text-primary font-medium">
                          <RefreshCw className="w-4 h-4" /> Kèm bắp nước
                        </div>
                      )}
                    </div>

                    <Separator className="bg-border" />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{listing.sellerName}</p>
                      </div>
                      <Button asChild>
                        <Link to={`/resale/${listing.id}`} className="gap-2">
                          Xem chi tiết <ChevronRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>

                    {listing.note && <p className="text-xs text-muted-foreground italic flex items-start gap-1">
                        <Tag className="w-3 h-3 shrink-0 mt-0.5" />
                        {listing.note}
                      </p>}
                  </div>
                </div>
              </CardContent>
            </Card>)}
            
        {filtered.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-card border border-border rounded-xl">
            <div className="text-sm text-muted-foreground mb-4 sm:mb-0">
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
    </div>
  );
}
