"use client";

import type { LiteItem } from "@/lib/academico-lite-read";
import { liteEstadoClass, liteEstadoLabel } from "@/components/lite/lite-badges";

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
      className="flex aspect-[4/5] w-full flex-col items-center justify-between rounded-[18px] bg-[#1A1A1A] text-center active:scale-95 transition-transform overflow-hidden"
      onClick={() => onSelect(item)}
    >
      <div className="flex-1 w-full px-2 pt-3 flex flex-col items-center justify-start gap-2">
        <span className="lite-title line-clamp-2 text-[12px] font-semibold leading-tight text-white/90">
          {item.nombre}
        </span>

        <div className="relative flex h-[50px] w-[50px] flex-none items-center justify-center mt-1">
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 64 64">
            <circle
              cx="32"
              cy="32"
              r={radius}
              fill="none"
              stroke="#333333"
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
          <span className="text-[11px] font-bold tracking-tight text-white">
            {terminados}/{total}
          </span>
        </div>
      </div>

      <div 
        className={`w-full py-1.5 flex items-center justify-center text-[10px] font-bold uppercase tracking-wider ${liteEstadoClass(item.estado)} !rounded-none !border-none !border-0`}
      >
        {liteEstadoLabel(item.estado)}
      </div>
    </button>
  );
}
