"use client";

import { formatDuracionMinutos } from "@/lib/format-duracion";
import { porcionesTiempoPie } from "@/lib/nivel-entendimiento-ui";

type TemaTiempoPieCardProps = {
  invertidoMin: number;
  restanteMin: number | null;
  delayClass?: string;
};

const R = 28;
const C = 2 * Math.PI * R;

export function TemaTiempoPieCard({
  invertidoMin,
  restanteMin,
  delayClass = "td-d4",
}: TemaTiempoPieCardProps) {
  const pie = porcionesTiempoPie(invertidoMin, restanteMin);
  const invLen = pie.total > 0 ? (pie.invertido / pie.total) * C : 0;
  const restLen = pie.total > 0 ? C - invLen : 0;

  return (
    <section
      className={`td-card td-rise ${delayClass} flex items-center gap-3 px-4 py-3.5`}
    >
      <div className="min-w-0 flex-1 space-y-3">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--td-faint)]">
          Tiempo de estudio
        </p>
        <TiempoLinea
          label="Invertido"
          value={formatDuracionMinutos(invertidoMin)}
          pct={pie.pctInvertido}
          dotClass="bg-[var(--td-navy)]"
        />
        <TiempoLinea
          label="Restante est."
          value={formatDuracionMinutos(restanteMin)}
          pct={pie.pctRestante}
          dotClass="bg-[var(--td-line)] ring-1 ring-[var(--td-faint)]/40"
        />
        {pie.total === 0 ? (
          <p className="text-xs text-[var(--td-faint)]">Sin datos de tiempo</p>
        ) : null}
      </div>
      <div className="relative shrink-0" aria-hidden>
        <svg width="72" height="72" viewBox="0 0 72 72">
          <circle
            cx="36"
            cy="36"
            r={R}
            fill="none"
            stroke="var(--td-line-soft)"
            strokeWidth="10"
          />
          {pie.total > 0 ? (
            <>
              <circle
                cx="36"
                cy="36"
                r={R}
                fill="none"
                stroke="var(--td-navy)"
                strokeWidth="10"
                strokeDasharray={`${invLen} ${C - invLen}`}
                transform="rotate(-90 36 36)"
                className="td-pie-inv"
              />
              <circle
                cx="36"
                cy="36"
                r={R}
                fill="none"
                stroke="var(--td-e-azul-pale)"
                strokeWidth="10"
                strokeDasharray={`${restLen} ${C - restLen}`}
                strokeDashoffset={-invLen}
                transform="rotate(-90 36 36)"
                className="td-pie-rest"
              />
            </>
          ) : null}
        </svg>
        {pie.total > 0 ? (
          <span className="absolute inset-0 flex items-center justify-center text-[11px] font-extrabold text-[var(--td-ink-soft)]">
            {pie.pctInvertido}%
          </span>
        ) : null}
      </div>
    </section>
  );
}

function TiempoLinea({
  label,
  value,
  pct,
  dotClass,
}: {
  label: string;
  value: string;
  pct: number;
  dotClass: string;
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${dotClass}`} />
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--td-faint)]">
          {label}
          {pct > 0 ? (
            <span className="ml-1 normal-case text-[var(--td-ink-soft)]">
              ({pct}%)
            </span>
          ) : null}
        </div>
        <div className="text-lg font-extrabold leading-tight tracking-tight text-[var(--td-ink)]">
          {value}
        </div>
      </div>
    </div>
  );
}
