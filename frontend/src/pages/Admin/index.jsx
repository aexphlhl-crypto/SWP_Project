"use client";

import { AdminLayout } from '@/components/layout';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Ticket, Film, Users, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Calendar, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

import { useState } from 'react';
import dashboardApi from '@/api/dashboardApi';
export default function AdminDashboard() {
  const {
    user,
    setMockUser,
    isAuthenticated
  } = useAuth();

  const [kpi, setKpi] = useState({ totalRevenue: 0, totalTickets: 0, newUsers: 0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [kpiRes, bookingsRes] = await Promise.all([
          dashboardApi.getKpiSummary(),
          dashboardApi.getRecentBookings()
        ]);
        if (kpiRes.data?.data) {
          setKpi(kpiRes.data.data);
        }
        if (bookingsRes.data?.data) {
          setRecentBookings(bookingsRes.data.data);
        }
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated, user?.role]);

  const stats = [{
    title: 'Tổng doanh thu',
    value: `${kpi.totalRevenue?.toLocaleString('vi-VN')}₫`,
    change: '0%',
    changeType: 'neutral',
    icon: DollarSign,
    description: 'Tổng doanh thu tính đến hiện tại'
  }, {
    title: 'Vé đã bán',
    value: kpi.totalTickets?.toLocaleString('vi-VN'),
    change: '0%',
    changeType: 'neutral',
    icon: Ticket,
    description: 'Số vé hoàn tất'
  }, {
    title: 'Khách hàng mới',
    value: kpi.newUsers?.toLocaleString('vi-VN'),
    change: '0',
    changeType: 'neutral',
    icon: Users,
    description: 'Người dùng mới đăng ký'
  }];
  return (
    <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Chào mừng trở lại, {user?.name || 'Admin'}! Đây là tổng quan hoạt động của rạp.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map(stat => {
          const Icon = stat.icon;
          return <Card key={stat.title} className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`flex items-center text-xs font-medium ${stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`}>
                      {stat.changeType === 'positive' ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                      {stat.change}
                    </span>
                    <span className="text-xs text-muted-foreground">{stat.description}</span>
                  </div>
                </CardContent>
              </Card>;
        })}
        </div>

        {/* Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Bookings */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Đặt vé gần đây</CardTitle>
                <CardDescription>Đơn đặt vé mới</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin/bookings">Xem tất cả</Link>
              </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                  {recentBookings.length > 0 ? (
                    recentBookings.map(booking => <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <p className="font-medium">{booking.movie}</p>
                          <div className="flex text-sm text-muted-foreground gap-4">
                            <span>{booking.customer}</span>
                            <span>{booking.seats}</span>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="font-medium">{booking.amount}</p>
                          <Badge variant={booking.status === 'Confirmed' ? 'default' : booking.status === 'Pending' ? 'secondary' : 'destructive'} className="capitalize">
                            {booking.status}
                          </Badge>
                        </div>
                      </div>)
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      Chưa có giao dịch mới nào.
                    </div>
                  )}
                </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Thao tác nhanh</CardTitle>
              <CardDescription>Truy cập nhanh các chức năng quản lý</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-24 flex-col gap-2 hover:border-primary hover:text-primary" asChild>
                  <Link to="/admin/movies">
                    <Film className="w-6 h-6" />
                    <span>Quản lý Phim</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-24 flex-col gap-2 hover:border-primary hover:text-primary" asChild>
                  <Link to="/admin/showtimes">
                    <Calendar className="w-6 h-6" />
                    <span>Lịch chiếu</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-24 flex-col gap-2 hover:border-primary hover:text-primary" asChild>
                  <Link to="/admin/cinemas">
                    <MapPin className="w-6 h-6" />
                    <span>Quản lý Rạp</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-24 flex-col gap-2 hover:border-primary hover:text-primary" asChild>
                  <Link to="/admin/analytics">
                    <TrendingUp className="w-6 h-6" />
                    <span>Báo cáo</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
}
