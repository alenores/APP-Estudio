"use client";

import type { TemaConDerivados } from "@/app/types/estudio";
import type { HijosProgressStats } from "@/lib/hijos-progress-stats";
import { estadoLabel } from "@/lib/estado-ui";
import { useNavItemForwardSwipe } from "@/lib/use-nav-item-forward-swipe";
import Link from "next/link";
import { useRouter } from "next/navigation";

type TemaListCardProps = {
  tema: TemaConDerivados;
  cursosStats: HijosProgressStats;
};

export function TemaListCard({ tema, cursosStats }: TemaListCardProps) {
  const router = useRouter();
  const href = `/temas/${tema.id}`;

  const nav = useNavItemForwardSwipe({
    router,
    href,
    itemKey: href,
    enabled: true,
    blockNavigation: false,
  });

  const pct = tema.derivados.porcentaje_avance ?? 0;
  const estadoTexto = estadoLabel(tema.derivados.etiqueta_estado) ?? "Sin empezar";
  
  const DONUT_R = 16;
  const DONUT_C = 2 * Math.PI * DONUT_R;
  const donutOffset = cursosStats.total > 0
    ? DONUT_C * (1 - cursosStats.terminadas / cursosStats.total)
    : DONUT_C;

  const content = (
    <article className="relative flex flex-col items-center justify-between p-3 bg-[#1A1A1A] rounded-[18px] border border-white/5 h-full min-h-[140px]">
      {/* Red dot top right */}
      <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-red-500" />
      
      {/* Icon top center */}
      <div className="mt-1 mb-2 text-white/50">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>

      {cursosStats.total > 0 ? (
        <div className="relative flex items-center justify-center w-10 h-10 mb-2">
          <svg className="w-10 h-10 -rotate-90 transform" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r={DONUT_R} strokeWidth="2.5" className="fill-none stroke-white/10" />
            <circle 
              cx="18" 
              cy="18" 
              r={DONUT_R} 
              strokeWidth="2.5" 
              className="fill-none stroke-red-500" 
              strokeDasharray={DONUT_C} 
              strokeDashoffset={donutOffset} 
              strokeLinecap="round" 
            />
          </svg>
          <div className="absolute font-bold text-[11px] text-white">
            {pct}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center w-14 h-8 mb-4 bg-white/5 rounded-lg">
           <span className="text-[9px] font-medium text-white/40">Sin datos</span>
        </div>
      )}

      {/* Label and Title */}
      <div className="flex flex-col items-center w-full mt-auto">
        <span className="text-[9px] uppercase tracking-wider text-white/40 font-bold mb-1">
          {estadoTexto}
        </span>
        <h3 className="text-[11px] font-medium text-white/90 text-center line-clamp-2 leading-tight w-full px-1">
          {tema.nombre}
        </h3>
      </div>
    </article>
  );

  return (
    <Link
      href={href}
      prefetch={false}
      className="block min-w-0 h-full w-full outline-none"
      onClick={nav.onClick}
      onPointerDown={nav.onPointerDown}
      onPointerMove={nav.onPointerMove}
      onPointerUp={nav.onPointerUp}
      onPointerCancel={nav.onPointerCancel}
      style={{ touchAction: "pan-y", WebkitTapHighlightColor: "transparent" }}
    >
      {content}
    </Link>
  );
}
