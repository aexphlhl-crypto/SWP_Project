"use client";

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LayoutDashboard, Film, Calendar, MapPin, Users, Ticket, Tag, BarChart3, Settings, ChevronLeft, ChevronRight, Clapperboard, Armchair, ShoppingCart, RefreshCw, FileBarChart2, Newspaper, Shield, Tags, Star } from 'lucide-react';
const sidebarGroups = [{
  title: 'Tổng quan',
  items: [{
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/admin'
  }, {
    label: 'Thống kê',
    icon: BarChart3,
    href: '/admin/analytics'
  }]
}, {
  title: 'Quản lý Nội dung',
  items: [{
    label: 'Tin tức',
    icon: Newspaper,
    href: '/admin/news'
  }, {
    label: 'Thể loại',
    icon: Tags,
    href: '/admin/genres'
  }, {
    label: 'Diễn viên',
    icon: Users,
    href: '/admin/actors'
  }, {
    label: 'Phim',
    icon: Film,
    href: '/admin/movies'
  }, {
    label: 'Lịch chiếu',
    icon: Calendar,
    href: '/admin/showtimes'
  }, {
    label: 'Rạp chiếu',
    icon: MapPin,
    href: '/admin/cinemas'
  }, {
    label: 'Phòng chiếu',
    icon: Clapperboard,
    href: '/admin/rooms'
  }, {
    label: 'Ghế ngồi',
    icon: Armchair,
    href: '/admin/seats'
  }, {
    label: 'Đánh giá',
    icon: Star,
    href: '/admin/reviews'
  }]
}, {
  title: 'Quản lý Kinh doanh',
  items: [{
    label: 'Đặt vé',
    icon: Ticket,
    icon: Ticket,
    href: '/admin/bookings'
  }, {
    label: 'Khuyến mãi',
    icon: Tag,
    href: '/admin/promotions'
  }, {
    label: 'Concession',
    icon: ShoppingCart,
    href: '/admin/concessions'
  }, {
    label: 'Quản lý Resale',
    icon: RefreshCw,
    href: '/admin/resale',
    exact: true
  }]
}, {
  title: 'Hệ thống',
  items: [{
    label: 'Cài đặt',
    icon: Settings,
    href: '/admin/settings'
  }, {
    label: 'Quản lý Khách hàng',
    icon: Users,
    href: '/admin/users'
  }, {
    label: 'Quản lý Quản trị viên',
    icon: Shield,
    href: '/admin/managers'
  }]
}];
export function AdminSidebar({
  defaultCollapsed = false
}) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const { pathname } = useLocation();
  const { user } = useAuth();
  const role = user?.role || 'admin';

  const filteredGroups = sidebarGroups.map(group => {
    if (role === 'admin') return group;
    
    if (role === 'manager') {
        const allowedPathsForManager = [
          '/admin',
          '/admin/movies',
          '/admin/showtimes',
          '/admin/rooms',
          '/admin/seats',
          '/admin/bookings',
          '/admin/promotions',
          '/admin/concessions',
        ];
      return {
        ...group,
        items: group.items.filter(item => allowedPathsForManager.includes(item.href))
      };
    }
    return { ...group, items: [] };
  }).filter(group => group.items.length > 0);

  return <TooltipProvider delayDuration={0}>
      <aside className={cn('flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out sticky top-0', isCollapsed ? 'w-[68px]' : 'w-[260px]')}>
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          {!isCollapsed && <Link to="/admin" className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-sidebar-primary">
                <Film className="w-5 h-5 text-sidebar-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-sidebar-foreground">
                  CineBook
                </span>
                <span className="text-xs text-muted-foreground">Admin Panel</span>
              </div>
            </Link>}
          {isCollapsed && <Link to="/admin" className="mx-auto">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-sidebar-primary">
                <Film className="w-5 h-5 text-sidebar-primary-foreground" />
              </div>
            </Link>}
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
          <nav className="flex flex-col gap-2">
            {filteredGroups.map((group, groupIndex) => <div key={group.title}>
                {/* Group Title */}
                {!isCollapsed && <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {group.title}
                  </h3>}
                
                {/* Group Items */}
                <div className="flex flex-col gap-1">
                  {group.items.map(item => {
                const isActive = item.exact 
                  ? pathname === item.href 
                  : (item.href === '/admin' ? pathname === '/admin' : pathname === item.href || pathname.startsWith(item.href + '/'));
                  
                const Icon = item.icon;
                const linkContent = <Link to={item.href} className={cn('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors', isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground', isCollapsed && 'justify-center px-2')}>
                        <Icon className={cn('shrink-0', isCollapsed ? 'w-5 h-5' : 'w-5 h-5')} />
                        {!isCollapsed && <>
                            <span className="flex-1">{item.label}</span>
                            {item.badge && <span className="flex items-center justify-center h-5 min-w-[20px] px-1.5 text-xs font-bold rounded-full bg-primary text-primary-foreground">
                                {item.badge}
                              </span>}
                          </>}
                      </Link>;
                if (isCollapsed) {
                  return <Tooltip key={item.href}>
                          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                          <TooltipContent side="right" className="flex items-center gap-2">
                            {item.label}
                            {item.badge && <span className="flex items-center justify-center h-5 min-w-[20px] px-1.5 text-xs font-bold rounded-full bg-primary text-primary-foreground">
                                {item.badge}
                              </span>}
                          </TooltipContent>
                        </Tooltip>;
                }
                return <div key={item.href}>{linkContent}</div>;
              })}
                </div>

                {/* Separator between groups */}
                {groupIndex < filteredGroups.length - 1 && <Separator className="my-4 bg-sidebar-border" />}
              </div>)}
          </nav>
        </div>

        {/* Collapse Toggle */}
        <div className="border-t border-sidebar-border p-3">
          <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(!isCollapsed)} className={cn('w-full justify-center text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent', !isCollapsed && 'justify-start')}>
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <>
                <ChevronLeft className="w-4 h-4 mr-2" />
                <span>Thu gọn</span>
              </>}
          </Button>
        </div>
      </aside>
    </TooltipProvider>;
}