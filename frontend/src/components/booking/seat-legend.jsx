'use client';

import { Heart, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SeatLegend() {
  const legendItems = [
    {
      label: 'Available',
      style: 'bg-secondary border border-border text-foreground'
    },
    {
      label: 'Selected',
      style: 'bg-primary border border-primary text-primary-foreground'
    },
    {
      label: 'VIP',
      style: 'bg-transparent border border-primary/60 text-primary'
    },
    {
      label: 'Sold',
      style: 'bg-muted border border-border text-muted-foreground opacity-40',
      icon: <X className="size-3 text-muted-foreground font-extrabold" />
    },
    {
      label: 'Couple',
      style: 'bg-red-500/10 dark:bg-red-950/20 border border-red-500/40 dark:border-red-800/60 text-red-500',
      icon: <Heart className="size-3.5 fill-red-500 text-red-500" />
    }
  ];

  return (
    <div className="flex flex-wrap justify-center gap-6 py-3 px-4 bg-muted/30 rounded-xl border border-border max-w-xl mx-auto mt-6">
      {legendItems.map(item => (
        <div key={item.label} className="flex items-center gap-2.5">
          <div className={cn("w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0", item.style)}>
            {item.icon}
          </div>
          <span className="text-xs font-semibold text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  );
}