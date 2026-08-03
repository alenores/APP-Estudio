"use client";

import type { LiteItem } from "@/lib/academico-lite-read";
import { LiteEstadoBadge } from "@/components/lite/lite-badges";

export function LiteGridCard({
  item,
  onSelect,
}: {
  item: LiteItem;
  onSelect: (item: LiteItem) => void;
}) {
  const total = item.hijosTotal;
  const terminados = item.hijosTerminados;
  const pct = total > 0 ? Math.round((terminados / total) * 100) : 0;
  
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <button
      type="button"
      className="flex aspect-square w-full flex-col items-center justify-between rounded-[18px] bg-[#1A1A1A] p-4 text-center active:scale-95 transition-transform"
      onClick={() => onSelect(item)}
    >
      <span className="lite-title line-clamp-2 text-[14px] leading-tight text-white/90">
        {item.nombre}
      </span>

      <div className="relative flex h-[60px] w-[60px] flex-none items-center justify-center">
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 64 64">
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke="var(--td-line)"
            strokeWidth="4"
          />
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="text-[var(--lt-accent)]"
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
        </svg>
        <span className="text-[12px] font-bold tracking-tight text-white">
          {terminados}/{total}
        </span>
      </div>

      <LiteEstadoBadge estado={item.estado} />
    </button>
  );
}
