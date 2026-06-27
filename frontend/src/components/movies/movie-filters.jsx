"use client";

import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
export function MovieFilters({
  status,
  genre,
  cinema,
  genres = [],
  cinemas = [],
  onStatusChange,
  onGenreChange,
  onCinemaChange,
  onClearFilters
}) {
  const hasActiveFilters = status !== 'all' || genre !== 'all' || cinema !== 'all';
  const FilterContent = () => <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-muted-foreground">Trạng thái</label>
        <Select value={status} onValueChange={value => onStatusChange(value)}>
          <SelectTrigger className="w-full lg:w-[180px]">
            <SelectValue placeholder="Tất cả trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="now_showing">Đang chiếu</SelectItem>
            <SelectItem value="coming_soon">Sắp chiếu</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-muted-foreground">Thể loại</label>
        <Select value={genre} onValueChange={onGenreChange}>
          <SelectTrigger className="w-full lg:w-[180px]">
            <SelectValue placeholder="Tất cả thể loại" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {genres.map(g => <SelectItem key={g.id} value={g.name}>
                {g.name}
              </SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-muted-foreground">Rạp chiếu</label>
        <Select value={cinema} onValueChange={onCinemaChange}>
          <SelectTrigger className="w-full lg:w-[220px]">
            <SelectValue placeholder="Tất cả rạp" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả rạp</SelectItem>
            {cinemas.map(c => <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && <div className="flex flex-col gap-2 lg:ml-2">
          <label className="text-sm font-medium text-transparent">Clear</label>
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-muted-foreground hover:text-foreground">
            <X className="mr-1 size-4" />
            Xóa bộ lọc
          </Button>
        </div>}
    </div>;
  return <div className="space-y-4">
      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <FilterContent />
      </div>

      {/* Mobile Filters */}
      <div className="flex items-center gap-2 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="flex-1">
              <Filter className="mr-2 size-4" />
              Bộ lọc
              {hasActiveFilters && <Badge className="ml-2 bg-primary">
                  {[status !== 'all', genre !== 'all', cinema !== 'all'].filter(Boolean).length}
                </Badge>}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle>Bộ lọc phim</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filter Badges */}
      {hasActiveFilters && <div className="flex flex-wrap gap-2">
          {status !== 'all' && <Badge variant="secondary" className="gap-1">
              {status === 'now_showing' ? 'Đang chiếu' : 'Sắp chiếu'}
              <button onClick={() => onStatusChange('all')} className="ml-1 hover:text-primary">
                <X className="size-3" />
              </button>
            </Badge>}
          {genre !== 'all' && <Badge variant="secondary" className="gap-1">
              {genre}
              <button onClick={() => onGenreChange('all')} className="ml-1 hover:text-primary">
                <X className="size-3" />
              </button>
            </Badge>}
          {cinema !== 'all' && <Badge variant="secondary" className="gap-1">
              {cinemas.find(c => c.id === cinema)?.name || cinema}
              <button onClick={() => onCinemaChange('all')} className="ml-1 hover:text-primary">
                <X className="size-3" />
              </button>
            </Badge>}
        </div>}
    </div>;
}
