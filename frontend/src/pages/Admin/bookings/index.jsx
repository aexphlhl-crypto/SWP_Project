"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Ticket, Search, MoreHorizontal, Eye, Ban, CheckCircle, Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import bookingApi from '../../../api/bookingApi';
import dayjs from 'dayjs';
import { useClientPagination } from '@/hooks/use-client-pagination';
import { ClientPagination } from '@/components/ui/client-pagination';

const STATUS_CONFIG = {
  Confirmed: {
    label: 'Hoàn thành',
    className: 'bg-green-500/20 text-green-500'
  },
  Pending: {
    label: 'Chờ xử lý',
    className: 'bg-yellow-500/20 text-yellow-500'
  },
  Cancelled: {
    label: 'Đã hủy',
    className: 'bg-red-500/20 text-red-500'
  },
  Expired: {
    label: 'Hết hạn',
    className: 'bg-gray-500/20 text-gray-500'
  },
  CheckedIn: {
    label: 'Đã vào rạp',
    className: 'bg-blue-500/20 text-blue-500'
  },
  Failed: {
    label: 'Thất bại',
    className: 'bg-red-500/20 text-red-500'
  }
};

export default function AdminBookingsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingApi.getAllBookingsAdmin({ page: 0, size: 100, sort: 'createdAt,desc' });
      setBookings(res.data?.content || []);
    } catch (error) {
      console.error("Failed to fetch bookings", error);
      toast.error('Không thể tải danh sách đơn đặt vé');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    if (!confirm(`Bạn có chắc chắn muốn chuyển đơn này sang trạng thái ${STATUS_CONFIG[status]?.label}?`)) return;
    try {
      await bookingApi.updateBookingStatusAdmin(id.replace('BK', ''), status);
      toast.success('Cập nhật trạng thái thành công');
      fetchBookings();
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật');
    }
  };

  const filtered = bookings.filter(b => {
    const matchSearch = (b.id || '').toLowerCase().includes(search.toLowerCase()) || 
                        (b.customer || '').toLowerCase().includes(search.toLowerCase()) || 
                        (b.movie || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const { currentDataOnPage, currentPage, totalPages, handlePageChange, startIndex, endIndex, totalItems } = useClientPagination(filtered);

  const totalRevenue = bookings.filter(b => b.status === 'Confirmed').reduce((a, b) => a + (b.amount || 0), 0);

  return (
    <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Quản lý Đặt vé</h1>
            <p className="text-muted-foreground mt-1">Theo dõi và quản lý tất cả đơn đặt vé</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Xuất báo cáo
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          {[{
          label: 'Tổng đơn',
          value: bookings.length
        }, {
          label: 'Hoàn thành',
          value: bookings.filter(b => b.status === 'Confirmed').length
        }, {
          label: 'Chờ xử lý',
          value: bookings.filter(b => b.status === 'Pending').length
        }, {
          label: 'Doanh thu',
          value: `${(totalRevenue / 1000000).toFixed(1)}M ₫`
        }].map(s => <Card key={s.label} className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                <Ticket className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{s.value}</div>
              </CardContent>
            </Card>)}
        </div>

        {/* Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Tìm mã vé, khách hàng, phim..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="Confirmed">Hoàn thành</SelectItem>
                  <SelectItem value="Pending">Chờ xử lý</SelectItem>
                  <SelectItem value="Cancelled">Đã hủy</SelectItem>
                  <SelectItem value="Expired">Hết hạn</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground ml-auto">{filtered.length} đơn</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Mã vé</TableHead>
                  <TableHead>Phim</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Rạp / Giờ chiếu</TableHead>
                  <TableHead>Ghế</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Ngày đặt</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-4">Đang tải...</TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-4">Không có dữ liệu</TableCell>
                  </TableRow>
                ) : currentDataOnPage.map(booking => <TableRow key={booking.id} className="border-border">
                    <TableCell className="font-mono text-sm font-medium">{booking.id}</TableCell>
                    <TableCell className="text-sm max-w-[150px] truncate">{booking.movie}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{booking.customer}</p>
                        <p className="text-xs text-muted-foreground">{booking.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{booking.cinema}</p>
                        <p className="text-xs text-muted-foreground">
                          {booking.room} • {booking.showtime}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{booking.seats}</TableCell>
                    <TableCell className="text-sm font-medium">
                      {(booking.amount || 0).toLocaleString('vi-VN')}₫
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{dayjs(booking.date).format('DD/MM/YYYY')}</TableCell>
                    <TableCell>
                      <Badge className={STATUS_CONFIG[booking.status]?.className || 'bg-gray-500'}>
                        {STATUS_CONFIG[booking.status]?.label || booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="w-8 h-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2">
                            <Eye className="w-4 h-4" /> Xem chi tiết
                          </DropdownMenuItem>
                          {booking.status === 'Pending' && (
                            <>
                              <DropdownMenuItem className="gap-2 text-green-500 focus:text-green-600" onClick={() => handleUpdateStatus(booking.id, 'Confirmed')}>
                                <CheckCircle className="w-4 h-4" /> Xác nhận
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={() => handleUpdateStatus(booking.id, 'Cancelled')}>
                                <Ban className="w-4 h-4" /> Hủy đơn
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>)}
              </TableBody>
            </Table>
            {!loading && filtered.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-border">
                <div className="text-sm text-muted-foreground mb-4 sm:mb-0">
                  Hiển thị {startIndex + 1}-{endIndex} trên tổng số {totalItems} đơn
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
    );
}
