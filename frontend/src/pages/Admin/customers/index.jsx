"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Search, MoreHorizontal, Eye, Ban, Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import adminUserApi from '@/api/adminUserApi';

function getInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  return parts.slice(-2).map(n => n[0]).join('').toUpperCase();
}

function getTier(spent) {
  const amount = spent || 0;
  if (amount >= 4000000) return {
    label: 'VIP',
    className: 'bg-yellow-500/20 text-yellow-500'
  };
  if (amount >= 2000000) return {
    label: 'Gold',
    className: 'bg-orange-500/20 text-orange-400'
  };
  return {
    label: 'Member',
    className: 'bg-secondary text-muted-foreground'
  };
}

export default function AdminCustomersPage() {
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminUserApi.getAllUsers({ role: 'Customer', page: 0, size: 100 });
      setCustomers(res.data?.content || []);
    } catch (error) {
      console.error("Failed to fetch users", error);
      toast.error('Không thể tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const [lockDialogOpen, setLockDialogOpen] = useState(false);
  const [selectedUserToLock, setSelectedUserToLock] = useState(null);
  const [lockDuration, setLockDuration] = useState('0'); // 0 means permanent

  const handleToggleStatus = async (customer) => {
    if (customer.status === 'Active') {
      setSelectedUserToLock(customer);
      setLockDuration('0');
      setLockDialogOpen(true);
    } else {
      try {
        await adminUserApi.unlockUser(customer.userId);
        toast.success('Đã mở khóa tài khoản thành công');
        fetchUsers();
      } catch (error) {
        toast.error('Có lỗi xảy ra khi mở khóa');
      }
    }
  };

  const submitLockUser = async () => {
    if (!selectedUserToLock) return;
    try {
      await adminUserApi.lockUser(selectedUserToLock.userId, Number(lockDuration));
      toast.success('Đã khóa tài khoản thành công');
      setLockDialogOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error('Có lỗi xảy ra khi khóa tài khoản');
    }
  };

  const filtered = customers.filter(c => 
    (c.fullName || '').toLowerCase().includes(search.toLowerCase()) || 
    (c.email || '').toLowerCase().includes(search.toLowerCase()) || 
    (c.phone || '').includes(search)
  );

  const activeCount = customers.filter(c => c.status === 'Active').length;
  const vipCount = customers.filter(c => (c.totalSpent || 0) >= 4000000).length;
  const totalRevenue = customers.reduce((a, c) => a + (c.totalSpent || 0), 0);

  return (
    <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Khách hàng</h1>
            <p className="text-muted-foreground mt-1">Quản lý và theo dõi tài khoản khách hàng</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Xuất danh sách
          </Button>
          
          <Dialog open={lockDialogOpen} onOpenChange={setLockDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Khóa tài khoản</DialogTitle>
                <DialogDescription>
                  Bạn đang thao tác khóa tài khoản của <b>{selectedUserToLock?.fullName}</b>.
                  Vui lòng chọn thời gian khóa.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <Select value={lockDuration} onValueChange={setLockDuration}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn thời gian khóa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Khóa vĩnh viễn (đến khi mở lại)</SelectItem>
                    <SelectItem value="7">Khóa 7 ngày</SelectItem>
                    <SelectItem value="30">Khóa 30 ngày</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setLockDialogOpen(false)}>Hủy</Button>
                <Button variant="destructive" onClick={submitLockUser}>Xác nhận khóa</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          {[{
          label: 'Tổng khách hàng',
          value: customers.length
        }, {
          label: 'Đang hoạt động',
          value: activeCount
        }, {
          label: 'Khách VIP',
          value: vipCount
        }, {
          label: 'Tổng chi tiêu',
          value: `${(totalRevenue / 1000000).toFixed(1)}M ₫`
        }].map(s => <Card key={s.label} className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                <Users className="w-4 h-4 text-muted-foreground" />
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
                <Input placeholder="Tìm tên, email, số điện thoại..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <span className="text-sm text-muted-foreground ml-auto">{filtered.length} khách hàng</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Liên hệ</TableHead>
                  <TableHead>Tổng đơn</TableHead>
                  <TableHead>Tổng chi tiêu</TableHead>
                  <TableHead>Hạng</TableHead>
                  <TableHead>Ngày tham gia</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">Đang tải...</TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">Không tìm thấy khách hàng</TableCell>
                  </TableRow>
                ) : filtered.map(customer => {
                const tier = getTier(customer.totalSpent);
                return <TableRow key={customer.userId} className="border-border">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs bg-primary/20 text-primary">
                              {getInitials(customer.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{customer.fullName}</p>
                            <p className="text-xs text-muted-foreground">U{String(customer.userId).padStart(3, '0')}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{customer.email}</p>
                          <p className="text-xs text-muted-foreground">{customer.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{customer.totalBookings || 0} đơn</TableCell>
                      <TableCell className="text-sm font-medium">
                        {(customer.totalSpent || 0).toLocaleString('vi-VN')}₫
                      </TableCell>
                      <TableCell>
                        <Badge className={tier.className}>{tier.label}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('vi-VN') : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 items-start">
                          <Badge className={customer.status === 'Active' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}>
                            {customer.status === 'Active' ? 'Hoạt động' : 'Đã khóa'}
                          </Badge>
                          {customer.status !== 'Active' && customer.lockedUntil && (
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                              Đến {new Date(customer.lockedUntil).toLocaleDateString('vi-VN')}
                            </span>
                          )}
                        </div>
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
                            <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={() => handleToggleStatus(customer)}>
                              <Ban className="w-4 h-4" />
                              {customer.status === 'Active' ? 'Khóa tài khoản' : 'Mở khóa'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>;
              })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
}
