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
const CHART_COLORS = {
  red: '#F43F5E',
  amber: '#F59E0B',
  blue: '#6366F1',
  green: '#10B981',
  purple: '#A855F7',
  pink: '#EC4899',
  teal: '#14B8A6',
  orange: '#FB923C',
};

const GENRE_COLORS = [
  CHART_COLORS.red,
  CHART_COLORS.amber,
  CHART_COLORS.blue,
  CHART_COLORS.green,
  CHART_COLORS.purple,
  CHART_COLORS.pink,
  CHART_COLORS.teal,
];

const TOOLTIP_STYLE = {
  backgroundColor: '#1a1a2e',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '10px',
  color: '#ffffff',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  fontSize: '13px',
  padding: '10px 14px',
};


export default function AdminAnalyticsPage() {
  const [revenueDataState, setRevenueDataState] = useState(revenueData);
  const [summaryStatsState, setSummaryStatsState] = useState(summaryStats);
  const [genreDataState, setGenreDataState] = useState(genreData);
  const [cinemaDataState, setCinemaDataState] = useState(cinemaData);
  const [monthlyTicketsDataState, setMonthlyTicketsDataState] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    // Fetch KPI for selected year
    dashboardApi.getKpiSummary(selectedYear).then(res => {
      if (res.success) {
        setSummaryStatsState([
          { title: `Doanh thu (${selectedYear})`, value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(res.data.totalRevenue || 0), change: '+0%', positive: true, icon: DollarSign },
          { title: `Tổng vé bán (${selectedYear})`, value: (res.data.totalTickets || 0).toLocaleString('vi-VN'), change: '+0%', positive: true, icon: Ticket },
          { title: `Khách hàng mới (${selectedYear})`, value: (res.data.newUsers || 0).toLocaleString('vi-VN'), change: '+0%', positive: true, icon: Users },
          { title: `Phim đã chiếu (${selectedYear})`, value: (res.data.screenedMovies || 0).toString(), change: '+0', positive: true, icon: Film }
        ]);
      }
    }).catch(console.error);

    // Fetch Revenue Chart for selected year
    dashboardApi.getRevenueChart(selectedYear).then(res => {
      if (res.success && res.data) {
        const newChartData = res.data.map(item => ({
          month: item.label.replace('Month ', 'T'),
          revenue: (item.value || 0) / 1000000,
          tickets: item.tickets || 0
        }));
        setRevenueDataState(newChartData);
      }
    }).catch(console.error);

    // Fetch Genre Chart for selected year
    dashboardApi.getGenreChart(selectedYear).then(res => {
      if (res.success && res.data) {
        setGenreDataState(res.data.map((item, i) => ({ ...item, color: GENRE_COLORS[i % GENRE_COLORS.length] })));
      }
    }).catch(console.error);

    // Fetch Cinema Chart for selected year
    dashboardApi.getCinemaChart(selectedYear).then(res => {
      if (res.success && res.data) setCinemaDataState(res.data);
    }).catch(console.error);

    // Fetch Monthly Tickets Chart for selected year
    dashboardApi.getMonthlyTicketsChart(selectedYear).then(res => {
      if (res.success && res.data) setMonthlyTicketsDataState(res.data);
    }).catch(console.error);
  }, [selectedYear]);

  const handleExport = async () => {
    try {
      const res = await dashboardApi.exportExcel({ startDate, endDate });
      const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `revenue_report_${startDate || 'all'}_to_${endDate || 'all'}.xlsx`);
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Thống kê & Báo cáo</h1>
          <p className="text-muted-foreground mt-1">Phân tích doanh thu và hiệu suất hoạt động</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Năm:</span>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="bg-card border border-border rounded px-2.5 py-1.5 text-xs text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              {[2023, 2024, 2025, 2026, 2027, 2028].map(y => (
                <option key={y} value={y}>Năm {y}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Từ:</span>
            <input 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)} 
              className="bg-card border border-border rounded px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary" 
            />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Đến:</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)} 
              className="bg-card border border-border rounded px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary" 
            />
          </div>
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="w-4 h-4" />
            Xuất Excel
          </Button>
        </div>
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
            </CardContent>
          </Card>;
        })}
      </div>

      {/* Revenue chart */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Doanh thu theo tháng (triệu ₫)
            </CardTitle>
            <CardDescription>So sánh doanh thu và vé bán ra trong năm {selectedYear}</CardDescription>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-primary/10 text-primary">
            Năm {selectedYear}
          </span>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={revenueDataState} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: '#fff' }} />
              <Line yAxisId="left" type="monotone" dataKey="revenue" name="Doanh thu (M₫)" stroke={CHART_COLORS.red} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line yAxisId="right" type="monotone" dataKey="tickets" name="Vé bán (cái)" stroke={CHART_COLORS.yellow} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Grid for genre pie chart, cinema performance, and monthly tickets bar chart */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Genre breakdown */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Doanh thu theo thể loại ({selectedYear})</CardTitle>
            <CardDescription>Tỷ lệ phân bố vé bán ra năm {selectedYear}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={genreDataState} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                  {genreDataState.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: '#fff' }} formatter={v => [`${v}%`, 'Tỷ lệ']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {genreDataState.map(item => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground truncate">{item.name}</span>
                  <span className="font-medium ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cinema performance */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Hiệu suất theo rạp ({selectedYear})</CardTitle>
            <CardDescription>Số vé bán được tại mỗi chi nhánh năm {selectedYear}</CardDescription>
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
                <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: '#fff' }} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }} />
                <Bar dataKey="tickets" name="Vé" fill={CHART_COLORS.red} radius={[0, 4, 4, 0]} activeBar={{ fill: CHART_COLORS.pink }} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly tickets chart */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-col gap-1">
            <CardTitle className="text-base font-bold">Số lượng vé theo tháng ({selectedYear})</CardTitle>
            <CardDescription>Quản lý số lượng vé bán được theo các tháng năm {selectedYear}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyTicketsDataState} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{
                  fill: 'hsl(var(--muted-foreground))',
                  fontSize: 12
                }} />
                <YAxis tick={{
                  fill: 'hsl(var(--muted-foreground))',
                  fontSize: 12
                }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: '#fff' }} formatter={v => [v, 'Số vé']} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }} />
                <Bar dataKey="value" name="Số vé" fill={CHART_COLORS.blue} radius={[4, 4, 0, 0]} activeBar={{ fill: CHART_COLORS.purple }} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
