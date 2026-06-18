"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import bookingApi from '@/api/bookingApi';
import resaleApi from '@/api/resaleApi';
import { useData } from '@/contexts/data-context'
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Ticket, Calendar, Clock, MapPin, Armchair, Download, Search, QrCode, RefreshCw, Star, MessageSquare, ShoppingCart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import reviewApi from '@/api/reviewApi';
import { toast } from 'sonner';
import { useNavigate, Navigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { useRef } from 'react';
import { ReviewModal } from '@/components/reviews/ReviewModal';
import { useClientPagination } from '@/hooks/use-client-pagination';
import { ClientPagination } from '@/components/ui/client-pagination';

const STATUS = {
  upcoming: {
    label: 'Sắp chiếu',
    className: 'bg-blue-500/20 text-blue-400'
  },
  used: {
    label: 'Đã sử dụng',
    className: 'bg-secondary text-muted-foreground'
  },
  cancelled: {
    label: 'Đã hủy',
    className: 'bg-red-500/20 text-red-500'
  }
};

export const formatSeatType = (type) => {
  if (!type) return 'Ghế Thường';
  if (type.toLowerCase() === 'vip') return 'Ghế VIP';
  if (type.toLowerCase() === 'couple') return 'Ghế Đôi';
  if (type.toLowerCase() === 'sweetbox') return 'Sweetbox';
  return 'Ghế Thường';
};

export const renderSeatsByType = (tickets) => {
  if (!tickets || tickets.length === 0) return null;
  const groups = {};
  tickets.forEach(t => {
    const type = formatSeatType(t.seatType);
    if (!groups[type]) groups[type] = [];
    groups[type].push(t.seatLabel);
  });
  return Object.entries(groups).map(([type, seats]) => `${type}: ${seats.join(', ')}`).join(' | ');
};

const mapStatus = (ticket) => {
  if (!ticket) return 'upcoming';
  const backendStatus = ticket.status;
  if (backendStatus === 'Cancelled' || backendStatus === 'Failed' || backendStatus === 'Refunded' || backendStatus === 'cancelled') return 'cancelled';
  
  if (ticket.checkedIn || backendStatus === 'Completed' || backendStatus === 'checkedin') return 'used';
  
  // Also check if show time has passed
  if (ticket.showDate && ticket.showTime) {
    const [year, month, day] = ticket.showDate.split('-');
    const [hours, minutes] = ticket.showTime.split(':');
    const showDateTime = new Date(year, parseInt(month, 10) - 1, day, parseInt(hours, 10), parseInt(minutes, 10), 0);
    // Let's add ~2 hours to showtime to consider it 'finished'
    const endDateTime = new Date(showDateTime.getTime() + 2 * 60 * 60 * 1000);
    if (new Date() > endDateTime) {
      return 'used';
    }
  }

  return 'upcoming';
};

const TABS = [{
  id: 'all',
  label: 'Tất cả'
}, {
  id: 'upcoming',
  label: 'Sắp chiếu'
}, {
  id: 'used',
  label: 'Đã dùng'
}, {
  id: 'cancelled',
  label: 'Đã hủy'
}];

export default function MyTicketsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useNavigate();
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [myTickets, setMyTickets] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review state
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  
  // QR & PDF state
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [currentTicketIdx, setCurrentTicketIdx] = useState(0);
  const ticketRef = useRef(null);
  
  useEffect(() => {
    if (isAuthenticated && user?.userId) {
      Promise.all([
        bookingApi.getMyBookings(),
        resaleApi.getMyListings(user.userId, { page: 0, size: 100 })
      ])
        .then(([bookingsRes, listingsRes]) => {
          if (bookingsRes.success) {
            setMyTickets(bookingsRes.data);
          }
          if (listingsRes.success && listingsRes.data?.content) {
            setMyListings(listingsRes.data.content);
          }
        })
        .catch(err => console.error('Failed to fetch data:', err))
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated, user?.userId]);
  
  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }
  
  const filtered = myTickets.filter(t => {
    const status = mapStatus(t);
    const matchTab = tab === 'all' || status === tab;
    const matchSearch = String(t.id).toLowerCase().includes(search.toLowerCase()) || (t.movieTitle ?? '').toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const { currentDataOnPage, currentPage, totalPages, handlePageChange, startIndex, endIndex, totalItems } = useClientPagination(filtered);

  const downloadPDF = async (ticket) => {
    setSelectedTicket(ticket);
    setTimeout(async () => {
      if (ticketRef.current) {
        try {
          const dataUrl = await toPng(ticketRef.current, { cacheBust: true, pixelRatio: 2 });
          const pdf = new jsPDF('p', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          // original width is 600px as set in tailwind class w-[600px]
          const pdfHeight = (ticketRef.current.offsetHeight * pdfWidth) / ticketRef.current.offsetWidth;
          pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
          pdf.save(`Ve_CineBook_${ticket.id}.pdf`);
        } catch (err) {
          console.error("Error generating PDF", err);
          toast.error("Không thể tạo Hóa đơn PDF");
        }
      }
    }, 100);
  };

  const openReviewModal = (ticket) => {
    setSelectedTicket(ticket);
    setIsReviewOpen(true);
  };
  
  return (
      <div className="container mx-auto px-4 py-10 max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Vé của tôi</h1>
            <p className="text-muted-foreground mt-1">Lịch sử đặt vé và vé sắp tới</p>
          </div>
          <Button asChild>
            <Link to="/movies">
              <Ticket className="w-4 h-4 mr-2" />
              Đặt vé mới
            </Link>
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap">
          {TABS.map(t => <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${tab === t.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
              {t.label}
              {t.id !== 'all' && <span className="ml-1.5 opacity-70">
                  {myTickets.filter(x => mapStatus(x) === t.id).length}
                </span>}
            </button>)}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Tìm theo mã vé hoặc tên phim..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Ticket list */}
        {loading ? <div className="text-center py-16">
            <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-primary" />
            <p className="text-muted-foreground">Đang tải dữ liệu...</p>
          </div> : filtered.length === 0 ? <div className="text-center py-16 text-muted-foreground">
            <Ticket className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Không có vé nào.</p>
          </div> : <div className="space-y-4">
            {currentDataOnPage.map(ticket => {
          const statusKey = mapStatus(ticket);
          const status = STATUS[statusKey];
          const displayDate = ticket.showDate ? new Date(ticket.showDate).toLocaleDateString('vi-VN', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }) : 'Unknown Date';
          
          return <Card key={ticket.id} className="bg-card border-border overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex">
                      {/* Poster */}
                      <div className="w-20 shrink-0 bg-muted flex items-center justify-center">
                        <Ticket className="w-8 h-8 text-muted-foreground/30" />
                      </div>

                      {/* Details */}
                      <div className="flex-1 p-4 space-y-3 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-bold leading-tight">{ticket.movieTitle}</h3>
                            <p className="text-xs text-muted-foreground font-mono mt-0.5">{ticket.id}</p>
                          </div>
                          <Badge className={status?.className}>{status?.label}</Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {displayDate}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {ticket.showTime}
                          </div>
                          <div className="flex items-center gap-2">
                            <Armchair className="w-4 h-4 shrink-0" />
                            <span className="line-clamp-2">
                              {renderSeatsByType(ticket.tickets)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 col-span-2 truncate">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="truncate">{ticket.cinemaName} • {ticket.roomName}</span>
                          </div>
                        </div>

                        <Separator className="bg-border" />

                        {ticket.fnbItems && ticket.fnbItems.length > 0 && (
                          <div className="space-y-1 mb-3">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                              <ShoppingCart className="w-3.5 h-3.5" /> Bắp nước
                            </p>
                            {ticket.fnbItems.map(fnb => (
                              <div key={fnb.productId} className="flex justify-between text-xs text-muted-foreground pl-4">
                                <span>{fnb.name} ×{fnb.quantity}</span>
                                <span>{(fnb.price * fnb.quantity).toLocaleString('vi-VN')}₫</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="font-bold text-primary">
                            {ticket.totalAmount?.toLocaleString('vi-VN')}₫
                          </span>
                          <div className="flex gap-2 flex-wrap justify-end">
                            {statusKey === 'upcoming' && <>
                                <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => { setSelectedTicket(ticket); setCurrentTicketIdx(0); setIsQrOpen(true); }}>
                                  <QrCode className="w-3 h-3" /> Xem vé
                                </Button>
                                {/* UC-45: Only show resell if not checked-in and showtime not started */}
                                {!ticket.checkedIn && (() => {
                                  // Hide resell button if showtime has passed
                                  let hasStarted = false;
                                  if (ticket.showDate && ticket.showTime) {
                                    const [year, month, day] = ticket.showDate.split('-');
                                    const [hours, minutes] = ticket.showTime.split(':');
                                    const showDateTime = new Date(year, parseInt(month, 10) - 1, day, hours, minutes, 0);
                                    if (new Date() >= showDateTime) {
                                      hasStarted = true;
                                    }
                                  }
                                  
                                  if (hasStarted) return null;

                                  const ticketIdNum = parseInt(String(ticket.id).replace('BK', ''), 10);
                                  const activeListingsForTicket = myListings.filter(l => 
                                    parseInt(String(l.bookingId).replace('BK', ''), 10) === ticketIdNum && 
                                    l.status?.toLowerCase() !== 'deleted' && 
                                    l.status?.toLowerCase() !== 'cancelled'
                                  );

                                  if (activeListingsForTicket.length > 0) {
                                    // Check if EVERYTHING is listed
                                    const totalSeats = ticket.seatNumber ? ticket.seatNumber.split(',').map(s => s.trim()) : [];
                                    const hasFnb = ticket.fnbItems && ticket.fnbItems.length > 0;
                                    
                                    let listedSeats = [];
                                    let fnbListed = false;
                                    
                                    activeListingsForTicket.forEach(l => {
                                      if (l.seatNumber) {
                                        listedSeats.push(...l.seatNumber.split(',').map(s => s.trim()));
                                      }
                                      if (l.includesFnb) {
                                        fnbListed = true;
                                      }
                                    });
                                    
                                    const allSeatsListed = totalSeats.every(s => listedSeats.includes(s));
                                    const allFnbListed = hasFnb ? fnbListed : true;
                                    
                                    if (allSeatsListed && allFnbListed) {
                                      return (
                                        <Button size="sm" variant="outline" className="h-7 gap-1 text-xs border-muted text-muted-foreground bg-muted/50 cursor-not-allowed" disabled title="Vé này đã được đăng bán toàn bộ">
                                          <RefreshCw className="w-3 h-3" /> Đã đăng bán hết
                                        </Button>
                                      );
                                    }
                                  }
                                  return (
                                    <Button size="sm" variant="outline" className="h-7 gap-1 text-xs border-amber-500/50 text-amber-400 hover:bg-amber-500/10" asChild>
                                      <Link to={`/my-resale/create?bookingId=${ticket.id}`}>
                                        <RefreshCw className="w-3 h-3" /> {activeListingsForTicket.length > 0 ? "Bán phần còn lại" : "Đăng bán lại"}
                                      </Link>
                                    </Button>
                                  );
                                })()}
                              </>}
                            
                            {statusKey === 'used' && (
                              <Button size="sm" variant="outline" className="h-7 gap-1 text-xs border-blue-500/50 text-blue-500 hover:bg-blue-500/10" onClick={() => openReviewModal(ticket)}>
                                <MessageSquare className="w-3 h-3" /> Đánh giá
                              </Button>
                            )}
                            
                            {statusKey !== 'cancelled' && (
                              <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={() => downloadPDF(ticket)}>
                                <Download className="w-3 h-3" /> PDF
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>;
        })}
          </div>}
          
        {!loading && filtered.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 p-4 bg-card border border-border rounded-lg">
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

        <ReviewModal 
          isOpen={isReviewOpen} 
          onClose={() => setIsReviewOpen(false)} 
          booking={selectedTicket}
          onReviewSuccess={() => {
            // Optional: Handle state update if needed, like marking ticket as reviewed
          }}
        />

        {/* QR Code Dialog */}
        <Dialog open={isQrOpen} onOpenChange={setIsQrOpen}>
          <DialogContent className="sm:max-w-[350px]">
            <DialogHeader>
              <DialogTitle className="text-center">Vé điện tử</DialogTitle>
            </DialogHeader>
            {selectedTicket && (() => {
              const tickets = selectedTicket.tickets || [{
                ticketCode: selectedTicket.id,
                qrCodeValue: selectedTicket.id,
                seatLabel: selectedTicket.seatNumber
              }];
              const currentTicket = tickets[currentTicketIdx] || tickets[0];
              
              return (
              <div className="flex flex-col items-center gap-4 py-2">
                <div className="p-4 bg-white rounded-xl shadow-sm border">
                  <QRCodeSVG value={currentTicket.qrCodeValue} size={200} level="M" />
                </div>
                
                {tickets.length > 1 && (
                  <div className="flex items-center gap-4 my-1">
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" 
                      onClick={() => setCurrentTicketIdx(prev => Math.max(0, prev - 1))}
                      disabled={currentTicketIdx === 0}>
                      {'<'}
                    </Button>
                    <span className="text-sm font-medium">
                      Vé {currentTicketIdx + 1} / {tickets.length}
                    </span>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0"
                      onClick={() => setCurrentTicketIdx(prev => Math.min(tickets.length - 1, prev + 1))}
                      disabled={currentTicketIdx === tickets.length - 1}>
                      {'>'}
                    </Button>
                  </div>
                )}

                <div className="text-center space-y-1 w-full">
                  <h3 className="font-bold text-xl">{selectedTicket.movieTitle}</h3>
                  <p className="text-sm text-muted-foreground font-mono">{currentTicket.ticketCode}</p>
                  <Separator className="my-2" />
                  <div className="grid grid-cols-2 text-sm gap-2 text-left bg-muted/30 p-3 rounded-lg">
                    <div>
                      <span className="text-muted-foreground text-xs block">Rạp</span>
                      <span className="font-medium">{selectedTicket.cinemaName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs block">Phòng</span>
                      <span className="font-medium">{selectedTicket.roomName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs block">Thời gian</span>
                      <span className="font-medium">{selectedTicket.showTime}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs block">Ghế</span>
                      <span className="font-medium text-primary text-lg">{currentTicket.seatLabel}</span>
                    </div>
                  </div>
                  {currentTicketIdx === 0 && selectedTicket.fnbItems && selectedTicket.fnbItems.length > 0 && (
                    <div className="text-sm text-left bg-primary/5 border border-primary/20 p-3 rounded-lg mt-3">
                      <p className="text-xs font-medium text-primary uppercase mb-2 flex items-center gap-1">
                        <ShoppingCart className="w-3.5 h-3.5" /> Bắp nước kèm theo (Cho cả đơn)
                      </p>
                      {selectedTicket.fnbItems.map(fnb => (
                        <div key={fnb.productId} className="flex justify-between text-sm mb-1">
                          <span>{fnb.name} <span className="text-muted-foreground text-xs ml-1">×{fnb.quantity}</span></span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              );
            })()}
          </DialogContent>
        </Dialog>

        {/* Hidden Invoice for PDF Generation */}
        {selectedTicket && (() => {
          const tickets = selectedTicket.tickets || [{
            ticketCode: selectedTicket.id,
            qrCodeValue: selectedTicket.id,
            seatLabel: selectedTicket.seatNumber
          }];
          return (
          <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
            <div ref={ticketRef} className="w-[600px] bg-white text-black p-8" style={{ fontFamily: 'sans-serif' }}>
              <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-6">
                <div>
                  <h1 className="text-4xl font-black uppercase tracking-tighter">CINEBOOK</h1>
                  <p className="text-sm mt-1 text-gray-500">Hóa đơn điện tử</p>
                </div>
                <div className="text-right">
                  <QRCodeSVG value={selectedTicket.id} size={64} />
                  <p className="text-xs font-mono mt-2">{selectedTicket.id}</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{selectedTicket.movieTitle}</h2>
                  <p className="text-gray-600">{selectedTicket.cinemaName} • {selectedTicket.roomName}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <span className="text-gray-500 text-sm block">Suất chiếu</span>
                    <span className="font-semibold text-lg">{selectedTicket.showTime}</span>
                    <span className="text-gray-600 ml-2">{selectedTicket.showDate ? new Date(selectedTicket.showDate).toLocaleDateString('vi-VN') : ''}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm block">Các vé (Ghế)</span>
                    <span className="font-semibold text-lg">{selectedTicket.seatNumber}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {tickets.map(t => (
                    <div key={t.ticketCode} className="border border-gray-200 p-3 rounded flex items-center justify-between">
                      <div>
                        <p className="font-bold">Ghế {t.seatLabel}</p>
                        <p className="text-xs text-gray-500 font-mono">{t.ticketCode}</p>
                      </div>
                      <QRCodeSVG value={t.qrCodeValue} size={40} />
                    </div>
                  ))}
                </div>

                {selectedTicket.fnbItems && selectedTicket.fnbItems.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <span className="text-gray-500 text-sm block mb-2">Đồ ăn & Thức uống</span>
                    {selectedTicket.fnbItems.map(fnb => (
                      <div key={fnb.productId} className="flex justify-between items-center mb-1">
                        <span className="text-sm">{fnb.name} ×{fnb.quantity}</span>
                        <span className="text-sm">{(fnb.price * fnb.quantity).toLocaleString('vi-VN')} VNĐ</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Tổng tiền vé</span>
                    <span className="font-medium">{selectedTicket.totalAmount?.toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">VAT (10%)</span>
                    <span className="font-medium">Đã bao gồm</span>
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t-2 border-dashed border-gray-300">
                    <span className="font-bold text-xl">Thành tiền</span>
                    <span className="font-bold text-2xl">{selectedTicket.totalAmount?.toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-12 text-center text-sm text-gray-400 border-t border-gray-100 pt-4">
                <p>Cảm ơn bạn đã lựa chọn CineBook!</p>
                <p className="mt-1">Vui lòng xuất trình mã QR tương ứng từng ghế tại rạp để nhận vé cứng.</p>
              </div>
            </div>
          </div>
          );
        })()}
      </div>
  );
}
