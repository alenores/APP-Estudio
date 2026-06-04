"use client";

import { formatDuracionMinutos } from "@/lib/format-duracion";
import { porcionesTiempoPie } from "@/lib/nivel-entendimiento-ui";

type TemaTiempoPieCardProps = {
  invertidoMin: number;
  restanteMin: number | null;
  delayClass?: string;
};

const R = 22;
const C = 2 * Math.PI * R;
const PIE = 56;

export function TemaTiempoPieCard({
  invertidoMin,
  restanteMin,
  delayClass = "td-d4",
}: TemaTiempoPieCardProps) {
  const pie = porcionesTiempoPie(invertidoMin, restanteMin);
  const invLen = pie.total > 0 ? (pie.invertido / pie.total) * C : 0;
  const restLen = pie.total > 0 ? C - invLen : 0;
  const cx = PIE / 2;

  return (
    <section
      className={`td-card td-rise ${delayClass} flex min-w-0 flex-col gap-1.5 px-2 py-2.5`}
    >
      <p className="truncate text-center text-[9px] font-extrabold uppercase tracking-[0.12em] text-[var(--td-faint)]">
        Tiempo estudio
      </p>
      <div className="flex min-w-0 items-center gap-1.5">
        <div className="min-w-0 flex-1 space-y-1">
          <TiempoLinea
            label="Inv."
            value={formatDuracionMinutos(invertidoMin)}
            pct={pie.pctInvertido}
            dotClass="bg-[var(--td-navy)]"
          />
          <TiempoLinea
            label="Rest."
            value={formatDuracionMinutos(restanteMin)}
            pct={pie.pctRestante}
            dotClass="bg-[var(--td-line)] ring-1 ring-[var(--td-faint)]/40"
          />
        </div>
        <div className="relative shrink-0" aria-hidden>
          <svg width={PIE} height={PIE} viewBox={`0 0 ${PIE} ${PIE}`}>
            <circle
              cx={cx}
              cy={cx}
              r={R}
              fill="none"
              stroke="var(--td-line-soft)"
              strokeWidth="8"
            />
            {pie.total > 0 ? (
              <>
                <circle
                  cx={cx}
                  cy={cx}
                  r={R}
                  fill="none"
                  stroke="var(--td-navy)"
                  strokeWidth="8"
                  strokeDasharray={`${invLen} ${C - invLen}`}
                  transform={`rotate(-90 ${cx} ${cx})`}
                />
                <circle
                  cx={cx}
                  cy={cx}
                  r={R}
                  fill="none"
                  stroke="var(--td-e-azul-pale)"
                  strokeWidth="8"
                  strokeDasharray={`${restLen} ${C - restLen}`}
                  strokeDashoffset={-invLen}
                  transform={`rotate(-90 ${cx} ${cx})`}
                />
              </>
            ) : null}
          </svg>
          {pie.total > 0 ? (
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-extrabold text-[var(--td-ink-soft)]">
              {pie.pctInvertido}%
            </span>
          ) : null}
        </div>
      </div>
      {pie.total === 0 ? (
        <p className="text-center text-[10px] text-[var(--td-faint)]">Sin datos</p>
      ) : null}
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
    <div className="flex min-w-0 items-center gap-1">
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotClass}`} />
      <div className="min-w-0 truncate">
        <span className="text-[9px] font-bold uppercase text-[var(--td-faint)]">
          {label}
          {pct > 0 ? (
            <span className="ml-0.5 normal-case text-[var(--td-ink-soft)]">
              {pct}%
            </span>
          ) : null}
        </span>
        <span className="ml-1 text-[13px] font-extrabold text-[var(--td-ink)]">
          {value}
        </span>
      </div>
    </div>
  );
}
