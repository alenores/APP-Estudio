import Link from "next/link";
import type { SeguimientoDerivados } from "@/app/types/estudio";

type EntityCardProps = {
  href: string;
  nombre: string;
  subtitulo?: string | null;
  derivados: SeguimientoDerivados;
  badge?: string | null;
};

function estadoDot(etiqueta: string | null) {
  if (!etiqueta) return "bg-slate-600";
  const lower = etiqueta.toLowerCase();
  if (lower.includes("termin") || lower.includes("complet")) return "bg-emerald-400";
  if (lower.includes("comenz") || lower.includes("curso")) return "bg-indigo-400";
  if (lower.includes("paus")) return "bg-amber-400";
  return "bg-slate-500";
}

export function EntityCard({
  href,
  nombre,
  subtitulo,
  derivados,
  badge,
}: EntityCardProps) {
  const { etiqueta_estado, porcentaje_avance } = derivados;

  return (
    <Link
      href={href}
      className="block rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-md transition hover:border-indigo-500/40 hover:bg-slate-900"
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${estadoDot(etiqueta_estado)}`}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-white">{nombre}</h3>
            {badge ? (
              <span className="shrink-0 text-[10px] uppercase tracking-wide text-slate-500">
                {badge}
              </span>
            ) : null}
          </div>
          {subtitulo ? (
            <p className="mt-1 line-clamp-2 text-xs text-slate-500">{subtitulo}</p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            {etiqueta_estado ? (
              <span className="text-xs text-slate-400">{etiqueta_estado}</span>
            ) : null}
            {porcentaje_avance != null ? (
              <span className="text-xs font-medium text-indigo-300">
                {porcentaje_avance}%
              </span>
            ) : null}
          </div>
        </div>
        <span className="text-slate-600" aria-hidden>
          ›
        </span>
      </div>
    </Link>
  );
}
