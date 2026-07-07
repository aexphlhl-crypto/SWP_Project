"use client";

import { AdminLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, Download, ArrowUpRight, ArrowDownRight, DollarSign, Ticket, Users, Film } from 'lucide-react';
import { useState, useEffect } from 'react';
import dashboardApi from '@/api/dashboardApi';
const revenueData = [{
  month: 'T1',
  revenue: 1200,
  tickets: 800
}, {
  month: 'T2',
  revenue: 1500,
  tickets: 1000
}, {
  month: 'T3',
  revenue: 1100,
  tickets: 730
}, {
  month: 'T4',
  revenue: 1800,
  tickets: 1200
}, {
  month: 'T5',
  revenue: 2100,
  tickets: 1400
}, {
  month: 'T6',
  revenue: 2400,
  tickets: 1600
}, {
  month: 'T7',
  revenue: 2800,
  tickets: 1900
}, {
  month: 'T8',
  revenue: 2600,
  tickets: 1750
}, {
  month: 'T9',
  revenue: 2200,
  tickets: 1480
}, {
  month: 'T10',
  revenue: 2900,
  tickets: 1950
}, {
  month: 'T11',
  revenue: 3100,
  tickets: 2100
}, {
  month: 'T12',
  revenue: 3500,
  tickets: 2350
}];
const genreData = [{
  name: 'Hành động',
  value: 35,
  color: '#E50914'
}, {
  name: 'Hoạt hình',
  value: 22,
  color: '#F59E0B'
}, {
  name: 'Tâm lý',
  value: 18,
  color: '#3B82F6'
}, {
  name: 'Hài hước',
  value: 14,
  color: '#10B981'
}, {
  name: 'Kinh dị',
  value: 11,
  color: '#8B5CF6'
}];
const cinemaData = [{
  name: 'Vincom Mega Mall',
  tickets: 4200,
  revenue: 630
}, {
  name: 'Landmark 81',
  tickets: 3800,
  revenue: 570
}, {
  name: 'Royal City',
  tickets: 3100,
  revenue: 465
}, {
  name: 'Aeon Mall',
  tickets: 2700,
  revenue: 405
}, {
  name: 'Times City',
  tickets: 2400,
  revenue: 360
}];
const weekdayData = [{
  day: 'T2',
  avg: 120
}, {
  day: 'T3',
  avg: 105
}, {
  day: 'T4',
  avg: 115
}, {
  day: 'T5',
  avg: 130
}, {
  day: 'T6',
  avg: 210
}, {
  day: 'T7',
  avg: 350
}, {
  day: 'CN',
  avg: 320
}];
const summaryStats = [{
  title: 'Doanh thu năm',
  value: '₫28.2B',
  change: '+18.3%',
  positive: true,
  icon: DollarSign
}, {
  title: 'Tổng vé bán',
  value: '18,280',
  change: '+12.1%',
  positive: true,
  icon: Ticket
}, {
  title: 'Khách hàng mới',
  value: '2,341',
  change: '-4.5%',
  positive: false,
  icon: Users
}, {
  title: 'Phim đã chiếu',
  value: '48',
  change: '+6',
  positive: true,
  icon: Film
}];
const TOOLTIP_STYLE = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  color: 'hsl(var(--foreground))'
};
export default function AdminAnalyticsPage() {
  const [revenueDataState, setRevenueDataState] = useState(revenueData);
  const [summaryStatsState, setSummaryStatsState] = useState(summaryStats);
  const [topMovies, setTopMovies] = useState([]);
  const [genreDataState, setGenreDataState] = useState(genreData);
  const [cinemaDataState, setCinemaDataState] = useState(cinemaData);
  const [weekdayDataState, setWeekdayDataState] = useState(weekdayData);

  useEffect(() => {
    // Fetch KPI
    dashboardApi.getKpiSummary().then(res => {
      if (res.success) {
        setSummaryStatsState([
          { title: 'Doanh thu năm', value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(res.data.totalRevenue || 0), change: '+0%', positive: true, icon: DollarSign },
          { title: 'Tổng vé bán', value: (res.data.totalTickets || 0).toLocaleString('vi-VN'), change: '+0%', positive: true, icon: Ticket },
          { title: 'Khách hàng mới', value: (res.data.newUsers || 0).toLocaleString('vi-VN'), change: '+0%', positive: true, icon: Users },
          { title: 'Phim đã chiếu', value: '48', change: '+6', positive: true, icon: Film }
        ]);
      }
    }).catch(console.error);

    // Fetch Revenue Chart
    dashboardApi.getRevenueChart().then(res => {
      if (res.success && res.data) {
        const newChartData = res.data.map(item => ({
          month: item.label.replace('Month ', 'T'),
          revenue: (item.value || 0) / 1000000,
          tickets: 0
        }));
        setRevenueDataState(newChartData);
      }
    }).catch(console.error);

    // Fetch Genre Chart
    dashboardApi.getGenreChart().then(res => {
      if (res.success && res.data) setGenreDataState(res.data);
    }).catch(console.error);

    // Fetch Cinema Chart
    dashboardApi.getCinemaChart().then(res => {
      if (res.success && res.data) setCinemaDataState(res.data);
    }).catch(console.error);

    // Fetch Weekday Chart
    dashboardApi.getWeekdayChart().then(res => {
      if (res.success && res.data) setWeekdayDataState(res.data);
    }).catch(console.error);
  }, []);

  const handleExport = async () => {
    try {
      const res = await dashboardApi.exportExcel();
      const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'revenue_report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Thống kê & Báo cáo</h1>
            <p className="text-muted-foreground mt-1">Phân tích doanh thu và hiệu suất hoạt động</p>
          </div>
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="w-4 h-4" />
            Xuất báo cáo
          </Button>
        </div>

        {/* Summary stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {summaryStatsState.map(stat => {
          const Icon = stat.icon;
          return <Card key={stat.title} className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <span className={`flex items-center text-xs font-medium mt-1 ${stat.positive ? 'text-green-500' : 'text-red-500'}`}>
                    {stat.positive ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                    {stat.change} so với năm ngoái
                  </span>
                </CardContent>
              </Card>;
        })}
        </div>

        {/* Revenue chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Doanh thu theo tháng (triệu ₫)
            </CardTitle>
            <CardDescription>So sánh doanh thu và vé bán ra trong năm</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={revenueDataState} margin={{
              top: 5,
              right: 20,
              left: 0,
              bottom: 5
            }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{
                fill: 'hsl(var(--muted-foreground))',
                fontSize: 12
              }} />
                <YAxis tick={{
                fill: 'hsl(var(--muted-foreground))',
                fontSize: 12
              }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend />
                <Line type="monotone" dataKey="revenue" name="Doanh thu (M₫)" stroke="#E50914" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="tickets" name="Vé bán (cái)" stroke="#F59E0B" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bottom row */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Genre distribution */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Phân bổ thể loại phim</CardTitle>
              <CardDescription>% lượt đặt vé theo thể loại</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={genreDataState} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value">
                    {genreDataState.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [`${v}%`, 'Tỷ lệ']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {genreDataState.map(g => <div key={g.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{
                    background: g.color
                  }} />
                      <span className="text-muted-foreground">{g.name}</span>
                    </div>
                    <span className="font-medium">{g.value}%</span>
                  </div>)}
              </div>
            </CardContent>
          </Card>

          {/* Cinema performance */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Hiệu suất theo rạp</CardTitle>
              <CardDescription>Số vé bán được tại mỗi chi nhánh</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={cinemaDataState} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{
                  fill: 'hsl(var(--muted-foreground))',
                  fontSize: 11
                }} />
                  <YAxis dataKey="name" type="category" tick={{
                  fill: 'hsl(var(--muted-foreground))',
                  fontSize: 10
                }} width={90} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="tickets" name="Vé" fill="#E50914" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Weekday heatmap */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Lượng vé trung bình theo ngày</CardTitle>
              <CardDescription>Vé bán trung bình mỗi ngày trong tuần</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={weekdayDataState} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{
                  fill: 'hsl(var(--muted-foreground))',
                  fontSize: 12
                }} />
                  <YAxis tick={{
                  fill: 'hsl(var(--muted-foreground))',
                  fontSize: 12
                }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [v, 'Vé TB']} />
                  <Bar dataKey="avg" name="Vé TB" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    );
}
