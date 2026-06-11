'use client';

import { useState, useMemo } from 'react';

import { useData } from '@/contexts/data-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileBarChart2, RefreshCw, TrendingUp, EyeOff, Clock, CheckCircle2, Trash2, SlidersHorizontal, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

const STATUS_COLORS = {
  active: 'text-green-400',
  hidden: 'text-orange-400',
  expired: 'text-muted-foreground',
  sold: 'text-blue-400',
  deleted: 'text-red-400'
};



// ── Helpers ───────────────────────────────────────────────────────────────────

function SortIcon({
  col,
  sortKey,
  sortDir
}) {
  if (col !== sortKey) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
  return sortDir === 'asc' ? <ArrowUp className="w-3 h-3 text-primary" /> : <ArrowDown className="w-3 h-3 text-primary" />;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminResaleReportPage() {
  const { resaleListings } = useData();
  const uniqueMovies = useMemo(() => [...new Set(resaleListings.map(l => l.movieTitle))].filter(Boolean).sort(), [resaleListings]);
  const uniqueCinemas = useMemo(() => [...new Set(resaleListings.map(l => l.cinemaName))].filter(Boolean).sort(), [resaleListings]);
  
  // Filters
  const [filterMovie, setFilterMovie] = useState('all');
  const [filterCinema, setFilterCinema] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortKey, setSortKey] = useState('total');
  const [sortDir, setSortDir] = useState('desc');

  // Filtered source data
  const filteredSource = useMemo(() => {
    return resaleListings.filter(l => {
      if (filterMovie !== 'all' && l.movieTitle !== filterMovie) return false;
      if (filterCinema !== 'all' && l.cinemaName !== filterCinema) return false;
      if (filterStatus !== 'all' && l.status !== filterStatus) return false;
      if (dateFrom && l.createdAt < dateFrom) return false;
      if (dateTo && l.createdAt > dateTo + 'T23:59:59') return false;
      return true;
    });
  }, [filterMovie, filterCinema, filterStatus, dateFrom, dateTo]);

  // KPIs from filtered data
  const kpis = useMemo(() => ({
    total: filteredSource.length,
    active: filteredSource.filter(l => l.status === 'active').length,
    hidden: filteredSource.filter(l => l.status === 'hidden').length,
    expired: filteredSource.filter(l => l.status === 'expired').length,
    sold: filteredSource.filter(l => l.status === 'sold').length,
    deleted: filteredSource.filter(l => l.status === 'deleted').length
  }), [filteredSource]);

  // Aggregate into report rows (movie x cinema)
  const reportRows = useMemo(() => {
    const map = new Map();
    for (const l of filteredSource) {
      const key = `${l.movieTitle}||${l.cinemaName}`;
      if (!map.has(key)) {
        map.set(key, {
          movie: l.movieTitle,
          cinema: l.cinemaName,
          total: 0,
          active: 0,
          hidden: 0,
          expired: 0,
          sold: 0,
          deleted: 0
        });
      }
      const row = map.get(key);
      row.total += 1;
      row[l.status] = (row[l.status] ?? 0) + 1;
    }
    let rows = [...map.values()];

    // Sort
    rows = rows.sort((a, b) => {
      let va;
      let vb;
      if (sortKey === 'movie') {
        va = a.movie;
        vb = b.movie;
      } else if (sortKey === 'cinema') {
        va = a.cinema;
        vb = b.cinema;
      } else {
        va = a[sortKey];
        vb = b[sortKey];
      }
      if (typeof va === 'string') {
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      return sortDir === 'asc' ? va - vb : vb - va;
    });
    return rows;
  }, [filteredSource, sortKey, sortDir]);
  const toggleSort = key => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');else {
      setSortKey(key);
      setSortDir('desc');
    }
  };
  const clearFilters = () => {
    setFilterMovie('all');
    setFilterCinema('all');
    setFilterStatus('all');
    setDateFrom('');
    setDateTo('');
  };
  const hasFilters = filterMovie !== 'all' || filterCinema !== 'all' || filterStatus !== 'all' || dateFrom || dateTo;
  const SortTH = ({
    col,
    children
  }) => <TableHead className="text-xs cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort(col)}>
      <div className="flex items-center gap-1">
        {children}
        <SortIcon col={col} sortKey={sortKey} sortDir={sortDir} />
      </div>
    </TableHead>;
  return (
    <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileBarChart2 className="w-6 h-6 text-primary" />
            Báo cáo Resale Listings
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Thống kê bài đăng vé bán lại theo phim và rạp (UC-50 / BR-26 → BR-29)
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[{
          label: 'Tổng bài đăng',
          value: kpis.total,
          icon: RefreshCw,
          color: 'text-foreground',
          bg: 'bg-primary/10'
        }, {
          label: 'Active',
          value: kpis.active,
          icon: TrendingUp,
          color: 'text-green-400',
          bg: 'bg-green-500/10'
        }, {
          label: 'Hidden',
          value: kpis.hidden,
          icon: EyeOff,
          color: 'text-orange-400',
          bg: 'bg-orange-500/10'
        }, {
          label: 'Expired',
          value: kpis.expired,
          icon: Clock,
          color: 'text-muted-foreground',
          bg: 'bg-secondary'
        }, {
          label: 'Sold',
          value: kpis.sold,
          icon: CheckCircle2,
          color: 'text-blue-400',
          bg: 'bg-blue-500/10'
        }, {
          label: 'Deleted',
          value: kpis.deleted,
          icon: Trash2,
          color: 'text-red-400',
          bg: 'bg-red-500/10'
        }].map(kpi => <Card key={kpi.label} className="bg-card border-border overflow-hidden">
              <CardContent className="p-4">
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-2', kpi.bg)}>
                  <kpi.icon className={cn('w-4 h-4', kpi.color)} />
                </div>
                <p className={cn('text-2xl font-bold', kpi.color)}>{kpi.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{kpi.label}</p>
              </CardContent>
            </Card>)}
        </div>

        {/* Filters — BR-28 */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              Bộ lọc (BR-28)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Phim</Label>
                <Select value={filterMovie} onValueChange={setFilterMovie}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Tất cả phim" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả phim</SelectItem>
                    {uniqueMovies.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Rạp</Label>
                <Select value={filterCinema} onValueChange={setFilterCinema}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Tất cả rạp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả rạp</SelectItem>
                    {uniqueCinemas.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Trạng thái</Label>
                <Select value={filterStatus} onValueChange={v => setFilterStatus(v)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="hidden">Hidden</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="deleted">Deleted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Từ ngày</Label>
                <Input type="date" className="h-8 text-xs" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="space-y-1.5 flex-1 max-w-[200px]">
                <Label className="text-xs">Đến ngày</Label>
                <Input type="date" className="h-8 text-xs" value={dateTo} onChange={e => setDateTo(e.target.value)} />
              </div>
              {hasFilters && <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground self-end h-8" onClick={clearFilters}>
                  <RefreshCw className="w-3 h-3" />
                  Xóa bộ lọc
                </Button>}
              <div className="ml-auto self-end text-xs text-muted-foreground">
                {reportRows.length} nhóm · {filteredSource.length} bài đăng
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Table — BR-29 (sort support) */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3 flex-row items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileBarChart2 className="w-4 h-4" />
              Thống kê theo Phim × Rạp
            </CardTitle>
            <p className="text-xs text-muted-foreground">Nhấn tiêu đề cột để sắp xếp (BR-29)</p>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <SortTH col="movie">Phim</SortTH>
                  <SortTH col="cinema">Rạp</SortTH>
                  <SortTH col="total">Tổng</SortTH>
                  <SortTH col="active">Active</SortTH>
                  <SortTH col="hidden">Hidden</SortTH>
                  <SortTH col="expired">Expired</SortTH>
                  <SortTH col="sold">Sold</SortTH>
                  <SortTH col="deleted">Deleted</SortTH>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportRows.length === 0 ? <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      <RefreshCw className="w-10 h-10 mx-auto mb-2 opacity-20" />
                      Không có dữ liệu phù hợp với bộ lọc
                    </TableCell>
                  </TableRow> : reportRows.map((row, idx) => <TableRow key={idx} className="border-border hover:bg-secondary/30">
                      <TableCell className="text-xs font-medium max-w-[180px]">
                        <p className="line-clamp-2">{row.movie}</p>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[150px]">
                        <p className="line-clamp-1">{row.cinema}</p>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-primary/20 text-primary font-bold">
                          {row.total}
                        </Badge>
                      </TableCell>
                      <TableCell className={cn('text-xs font-semibold', row.active > 0 ? 'text-green-400' : 'text-muted-foreground')}>
                        {row.active || '—'}
                      </TableCell>
                      <TableCell className={cn('text-xs font-semibold', row.hidden > 0 ? 'text-orange-400' : 'text-muted-foreground')}>
                        {row.hidden || '—'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-semibold">
                        {row.expired || '—'}
                      </TableCell>
                      <TableCell className={cn('text-xs font-semibold', row.sold > 0 ? 'text-blue-400' : 'text-muted-foreground')}>
                        {row.sold || '—'}
                      </TableCell>
                      <TableCell className={cn('text-xs font-semibold', row.deleted > 0 ? 'text-red-400' : 'text-muted-foreground')}>
                        {row.deleted || '—'}
                      </TableCell>
                    </TableRow>)}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Totals row */}
        {reportRows.length > 0 && <div className="flex items-center gap-4 text-sm text-muted-foreground px-1">
            <span className="font-medium text-foreground">Tổng cộng:</span>
            {['total', 'active', 'hidden', 'expired', 'sold', 'deleted'].map(key => <span key={key} className={cn(STATUS_COLORS[key] ?? 'text-foreground', 'font-semibold')}>
                {key}: {kpis[key]}
              </span>)}
          </div>}
      </div>
    );
}
