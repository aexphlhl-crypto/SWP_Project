'use client';

import { Armchair, Sofa, Crown } from 'lucide-react';
export function SeatLegend() {
  const legendItems = [{
    color: 'bg-emerald-600',
    label: 'Ghế Thường - Trống',
    icon: Armchair
  }, {
    color: 'bg-purple-600',
    label: 'Ghế VIP - Trống',
    icon: Crown
  }, {
    color: 'bg-pink-600',
    label: 'Ghế Đôi - Trống',
    icon: Sofa
  }, {
    color: 'bg-amber-500',
    label: 'Đang chọn',
    icon: Armchair
  }, {
    color: 'bg-muted/50',
    label: 'Đã đặt',
    icon: Armchair,
    muted: true
  }, {
    color: 'bg-red-600/50',
    label: 'Đang giữ',
    icon: Armchair
  }];
  return <div className="flex flex-wrap justify-center gap-4 py-4 px-2 bg-card/50 rounded-lg border border-border">
      {legendItems.map(item => <div key={item.label} className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-t-md border-2 border-b-4 flex items-center justify-center ${item.color} ${item.muted ? 'border-muted-foreground/20 opacity-50' : 'border-current/30'}`}>
            <item.icon className={`size-3 ${item.muted ? 'text-muted-foreground' : 'text-white'}`} />
          </div>
          <span className="text-xs text-muted-foreground">{item.label}</span>
        </div>)}
    </div>;
}