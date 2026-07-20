'use client';

import { Heart, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SeatLegend() {
  const legendItems = [
    {
      label: 'Available',
      style: 'bg-[#27272a] border border-zinc-700'
    },
    {
      label: 'Selected',
      style: 'bg-primary border border-primary text-black'
    },
    {
      label: 'VIP',
      style: 'bg-transparent border border-primary text-primary'
    },
    {
      label: 'Sold',
      style: 'bg-[#18181b] border border-zinc-800/40 text-zinc-600 opacity-40',
      icon: <X className="size-3 text-zinc-600 font-extrabold" />
    },
    {
      label: 'Couple',
      style: 'bg-red-950/20 border border-red-800/60 text-red-500',
      icon: <Heart className="size-3.5 fill-red-500 text-red-500" />
    }
  ];

  return (
    <div className="flex flex-wrap justify-center gap-6 py-3 px-4 bg-[#121215] rounded-xl border border-white/5 max-w-xl mx-auto mt-6">
      {legendItems.map(item => (
        <div key={item.label} className="flex items-center gap-2.5">
          <div className={cn("w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0", item.style)}>
            {item.icon}
          </div>
          <span className="text-xs font-semibold text-zinc-400">{item.label}</span>
        </div>
      ))}
    </div>
  );
}