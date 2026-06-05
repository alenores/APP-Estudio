"use client";

import type { Concepto, Seguimiento } from "@/app/types/estudio";
import { TemaEstadoCard } from "@/components/mobile/detalle/tema-estado-card";
import { TemaNivelGauge } from "@/components/mobile/detalle/tema-nivel-gauge";
import { TemaTiempoPieCard } from "@/components/mobile/detalle/tema-tiempo-pie-card";
import { formatDuracionMinutos } from "@/lib/format-duracion";
import {
  estadoBadgeClass,
  estadoFilterDotClass,
  estadoLabel,
  nivelEntendimientoLabel,
} from "@/lib/estado-ui";
import type { EstudioDetalleMetrics } from "@/lib/estudio-detalle-metrics";
import type { VeredictoUi } from "@/lib/tema-detalle-metrics";
import { Plus_Jakarta_Sans } from "next/font/google";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export const jakartaDetalle = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

/** Fechas en card calendario: dd/mm/aaaa */
export function formatFechaCalendario(value: string | null): string {
  if (!value?.trim()) return "—";
  const iso = value.trim().slice(0, 10);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${dd}/${mm}/${d.getFullYear()}`;
  } catch {
    return value;
  }
}

function formatHoyFlag(): string {
  return new Date().toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
  });
}

/** Evita que el cartel HOY se corte en los bordes (móvil). */
function posicionCartelHoy(todayPct: string): string {
  const n = Number.parseFloat(todayPct);
  if (Number.isNaN(n)) return todayPct;
  return `${Math.min(95, Math.max(5, n))}%`;
}

const TODAY_MARKER_STYLE = {
  transform: "translateX(-50%)",
} as const;

export function DetallePageShell({
  metrics,
  children,
}: {
  metrics: EstudioDetalleMetrics;
  children: ReactNode;
}) {
  const tlStyle = {
    "--td-fill-pct": metrics.fillPct,
    "--td-gap-left": metrics.gapLeft,
    "--td-gap-width": metrics.showGap ? metrics.gapWidth : "0%",
    "--td-today-pct": metrics.todayPct,
    "--td-gz-offset": String(metrics.gzOffset),
  } as CSSProperties;

  return (
    <div
      className={`${jakartaDetalle.className} estudio-detalle-page tema-detalle-page flex min-h-full w-full flex-1 flex-col pb-24`}
      style={tlStyle}
    >
      <div className="td-section-stack flex flex-col gap-4">{children}</div>
    </div>
  );
}

export function DetalleHeaderCard({
  eyebrow,
  nombre,
  descripcion,
  extra,
}: {
  eyebrow: string;
  nombre: string;
  descripcion: string | null;
  extra?: ReactNode;
}) {
  return (
    <section className="td-card td-rise td-d1 px-6 pb-5 pt-6">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[var(--td-faint)]">
        {eyebrow}
      </p>
      <h1 className="mt-1.5 text-[34px] font-extrabold leading-[1.05] tracking-tight text-[var(--td-ink)] max-[430px]:text-[30px]">
        {nombre}
      </h1>
      {descripcion ? (
        <p className="mt-3.5 max-w-[36ch] text-[15px] text-[var(--td-ink-soft)]">
          {descripcion}
        </p>
      ) : null}
      {extra}
    </section>
  );
}

export function DetalleMetricGrid({
  metrics,
  estado,
}: {
  metrics: EstudioDetalleMetrics;
  estado: EstudioDetalleMetrics["estado"];
}) {
  return (
    <div className="td-rise td-d2 grid grid-cols-2 items-stretch gap-2">
      <TemaNivelGauge nivel={metrics.nivel} className="h-full" />
      <div className="flex min-h-0 flex-col gap-1.5">
        <TemaEstadoCard estado={estado} className="shrink-0" />
        <TemaTiempoPieCard
          invertidoMin={metrics.tiempoInvertidoMin}
          restanteMin={metrics.tiempoRestanteMin}
          className="min-h-0 flex-1"
        />
      </div>
    </div>
  );
}

export function DetalleCalendarioSection({
  metrics,
  fechaInicio,
  fechaFin,
  avanceLabel,
}: {
  metrics: EstudioDetalleMetrics;
  fechaInicio: string | null;
  fechaFin: string | null;
  avanceLabel: string;
}) {
  const hoyLeft = posicionCartelHoy(metrics.todayPct);
  const tlWrapStyle = {
    "--td-today-pct": hoyLeft,
    "--td-fill-pct": metrics.fillPct,
    "--td-gap-left": metrics.gapLeft,
    "--td-gap-width": metrics.showGap ? metrics.gapWidth : "0%",
  } as CSSProperties;

  return (
    <section className="td-card td-rise td-d3 overflow-visible px-6 pb-6 pt-5">
      <div className="mb-2 flex items-start justify-between gap-3">
        <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--td-faint)]">
          Calendario y avance
        </span>
        <VeredictoChip
          veredicto={metrics.veredicto}
          className="relative z-20 shrink-0"
        />
      </div>
      <div className="td-tl-wrap relative mx-1 overflow-visible" style={tlWrapStyle}>
        {metrics.showToday ? (
          <div className="td-tl-flag-lane relative overflow-visible">
            <div
              className="td-today-flag td-today-flag--lane"
              style={{ left: hoyLeft, ...TODAY_MARKER_STYLE }}
            >
              HOY · <b>{formatHoyFlag()}</b>
            </div>
          </div>
        ) : null}
        <div className="relative h-4 overflow-visible rounded-[10px] bg-[var(--td-line)]">
          {metrics.showToday ? (
            <div
              className="td-tl-today"
              style={{ left: hoyLeft, ...TODAY_MARKER_STYLE }}
            />
          ) : null}
          <div className="td-tl-fill" />
          {metrics.showGap ? (
            <div className={`td-tl-gap ${metrics.veredicto.gapClass}`} />
          ) : null}
        </div>
      </div>
      <div className="mt-3.5 flex justify-between gap-4">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--td-faint)]">
            Inicio
          </div>
          <div className="mt-0.5 text-sm font-bold">
            {formatFechaCalendario(fechaInicio)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--td-faint)]">
            Fin
          </div>
          <div className="mt-0.5 text-sm font-bold">
            {formatFechaCalendario(fechaFin)}
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-4 border-t border-[var(--td-line-soft)] pt-4">
        <span className="flex items-center gap-2 text-[13px] font-semibold text-[var(--td-ink-soft)]">
          <span
            className="h-2 w-3.5 shrink-0 rounded-sm"
            style={{
              background:
                "linear-gradient(90deg, var(--td-navy), var(--td-navy-2))",
            }}
          />
          {avanceLabel}{" "}
          <b className="font-extrabold text-[var(--td-ink)]">
            {metrics.avancePct}%
          </b>
        </span>
        {metrics.tiempoPct != null ? (
          <span className="flex items-center gap-2 text-[13px] font-semibold text-[var(--td-ink-soft)]">
            <span className="h-3.5 w-0.5 shrink-0 rounded-sm bg-[var(--td-ink)]" />
            Tiempo transcurrido{" "}
            <b className="font-extrabold text-[var(--td-ink)]">
              {metrics.tiempoPct}%
            </b>
          </span>
        ) : null}
      </div>
    </section>
  );
}

export function DetalleTabBar({
  tabCount,
  tabIndex,
  tabs,
}: {
  tabCount: 2 | 3;
  tabIndex: number;
  tabs: {
    key: string;
    label: string;
    count: number;
    active: boolean;
    onClick: () => void;
  }[];
}) {
  const widthClass =
    tabCount === 3 ? "w-[calc((100%-8px)/3)]" : "w-[calc((100%-8px)/2)]";

  return (
    <div className="td-tabbar relative flex overflow-hidden rounded-[14px] border border-[var(--td-zone-line)] bg-[var(--td-zone-track)] p-1">
      <span
        className={`td-ctab-ind pointer-events-none absolute bottom-1 left-1 top-1 z-[1] ${widthClass} rounded-[10px] bg-[var(--td-zone-tab-active)] shadow-[0_2px_8px_-2px_rgba(27,34,43,.25)]`}
        style={{ transform: `translateX(${tabIndex * 100}%)` }}
        aria-hidden
      />
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          role="tab"
          aria-selected={t.active}
          onClick={t.onClick}
          className={`relative z-[2] flex-1 rounded-[10px] border-0 bg-transparent py-2.5 font-bold text-sm transition-colors duration-200 ${
            t.active
              ? "text-white"
              : "text-[var(--td-filter-text-muted)]"
          }`}
        >
          {t.label}{" "}
          <span
            className={`text-xs font-semibold ${t.active ? "text-white/75" : "opacity-55"}`}
          >
            {t.count}
          </span>
        </button>
      ))}
    </div>
  );
}

export function DetalleZonaContenido({ children }: { children: ReactNode }) {
  return (
    <div className="td-zone td-zone-contenido td-rise td-d5">{children}</div>
  );
}

export function DetalleEmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-2xl border border-dashed border-[var(--td-line)] px-4 py-9 text-center text-sm text-[var(--td-faint)]">
      {message}
    </p>
  );
}

export function DetalleFiltroEstadosCompact<T extends string>({
  filtros,
  filtro,
  contadores,
  onSelect,
  entityLabel,
}: {
  filtros: { key: T; label: string }[];
  filtro: T;
  contadores: Record<T, number>;
  onSelect: (key: T) => void;
  /** Para aria-label, ej. «cursos» o «clases». */
  entityLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});

  const activo = filtros.find((f) => f.key === filtro);
  const etiquetaActiva = activo?.label ?? "Todos";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    function updatePosition() {
      const el = anchorRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const minW = 184;
      const left = Math.min(
        Math.max(8, rect.right - minW),
        window.innerWidth - minW - 8,
      );
      setMenuStyle({
        position: "fixed",
        top: rect.top - 4,
        left,
        transform: "translateY(-100%)",
        minWidth: minW,
        zIndex: 70,
      });
    }
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (anchorRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  function elegir(key: T) {
    onSelect(key);
    setOpen(false);
  }

  const menu =
    open && mounted ? (
      <div
        ref={menuRef}
        role="listbox"
        aria-label={`Estados de ${entityLabel}`}
        style={menuStyle}
        className={`td-filtro-menu ${jakartaDetalle.className} overflow-hidden rounded-xl border border-[var(--td-line)] py-1 shadow-[var(--td-shadow)]`}
      >
        {filtros.map((f) => {
          const active = filtro === f.key;
          return (
            <button
              key={f.key}
              type="button"
              role="option"
              aria-selected={active}
              onClick={() => elegir(f.key)}
              className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[13px] transition-colors duration-150 ${
                active
                  ? "bg-[var(--td-line-soft)] font-semibold text-[var(--td-ink)]"
                  : "font-medium text-[var(--td-ink-soft)] hover:bg-[var(--td-line-soft)]/70"
              }`}
            >
              <span className="flex h-2.5 w-2.5 shrink-0 items-center justify-center">
                {f.key !== "todos" ? (
                  <span
                    className={estadoFilterDotClass(
                      f.key as
                        | "sin empezar"
                        | "en curso"
                        | "pausado"
                        | "terminado",
                    )}
                    aria-hidden
                  />
                ) : (
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-[var(--td-faint)]/50"
                    aria-hidden
                  />
                )}
              </span>
              <span className="min-w-0 flex-1 truncate">{f.label}</span>
              <span className="shrink-0 text-[11px] tabular-nums text-[var(--td-faint)]">
                {contadores[f.key]}
              </span>
            </button>
          );
        })}
      </div>
    ) : null;

  return (
    <div className="relative mb-3 flex items-center justify-end">
      <div ref={anchorRef} className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`text-[11px] font-semibold transition-colors ${
            filtro === "todos"
              ? "text-[var(--td-filter-text-muted)] hover:text-[var(--td-filter-text)]"
              : "text-[var(--td-filter-text)] hover:text-[var(--td-ink)]"
          }`}
        >
          {etiquetaActiva}
          <span className="opacity-70"> · {contadores[filtro]}</span>
        </button>
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={`Filtrar ${entityLabel} por estado`}
          onClick={() => setOpen((v) => !v)}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-[transform,colors,border-color] duration-150 active:scale-95 ${
            open
              ? "border-[var(--td-zone-line)] bg-[var(--td-zone-track)] text-[var(--td-filter-text)]"
              : "border-transparent bg-transparent text-[var(--td-filter-text-muted)] hover:border-[var(--td-zone-line)] hover:bg-[var(--td-zone-track)] hover:text-[var(--td-filter-text)]"
          }`}
        >
          <FiltroIcono aria-hidden />
        </button>
      </div>
      {menu && createPortal(menu, document.body)}
    </div>
  );
}

function FiltroIcono(props: { "aria-hidden"?: boolean }) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M2 3.5h12M4.5 8h7M6.5 12.5h3"
        stroke="currentColor"
        strokeWidth={1.35}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DetalleFiltroEstados<T extends string>({
  filtros,
  filtro,
  contadores,
  onSelect,
  showDots = false,
}: {
  filtros: { key: T; label: string }[];
  filtro: T;
  contadores: Record<T, number>;
  onSelect: (key: T) => void;
  showDots?: boolean;
}) {
  return (
    <div className="mb-4 flex gap-1.5">
      {filtros.map((f) => {
        const active = filtro === f.key;
        return (
          <button
            key={f.key}
            type="button"
            onClick={() => onSelect(f.key)}
            className={`flex min-h-[52px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-[10px] border px-1 py-1.5 text-[9.5px] font-bold leading-tight transition-[background,border-color] duration-150 ${
              active
                ? "border-[var(--td-navy)] bg-[var(--td-navy)] text-white shadow-[0_4px_12px_-4px_rgba(39,72,103,.45)]"
                : "border-[var(--td-line)] bg-[var(--td-card)] text-[var(--td-ink-soft)]"
            }`}
          >
            <span className="flex h-2.5 shrink-0 items-center justify-center">
              {showDots && f.key !== "todos" ? (
                <span
                  className={estadoFilterDotClass(
                    f.key as
                      | "sin empezar"
                      | "en curso"
                      | "pausado"
                      | "terminado",
                  )}
                  aria-hidden
                />
              ) : null}
            </span>
            <span className={`text-center ${active ? "text-white" : ""}`}>
              {f.label}
            </span>
            <span
              className={`text-[10px] leading-none ${
                active
                  ? "font-semibold text-white/70"
                  : "font-semibold text-[var(--td-faint)]"
              }`}
            >
              {contadores[f.key]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function SeguimientoPanelItems({ items }: { items: Seguimiento[] }) {
  if (items.length === 0) {
    return <DetalleEmptyState message="Todavía no hay seguimientos." />;
  }
  return (
    <ul className="space-y-2.5">
      {items.map((s) => {
        const estadoTexto = estadoLabel(s.etiqueta_estado);
        return (
          <li key={s.id} className="td-item">
            <div className="text-[11px] font-extrabold uppercase tracking-wide text-[var(--td-faint)]">
              {new Date(s.fecha_registro).toLocaleDateString("es-AR", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
              {estadoTexto ? ` · ${estadoTexto}` : ""}
            </div>
            {s.comentario ? (
              <p className="mt-1 text-[14.5px] text-[var(--td-ink)]">
                {s.comentario}
              </p>
            ) : null}
            <div className="mt-2 flex flex-wrap gap-2">
              {s.porcentaje_avance != null ? (
                <span className="rounded-full bg-[rgba(44,92,138,.09)] px-2 py-0.5 text-[11.5px] font-bold text-[var(--td-e-azul)]">
                  Avance {s.porcentaje_avance}%
                </span>
              ) : null}
              {s.tiempo_consumido != null ? (
                <span className="rounded-full bg-[rgba(44,92,138,.09)] px-2 py-0.5 text-[11.5px] font-bold text-[var(--td-e-azul)]">
                  {formatDuracionMinutos(s.tiempo_consumido)}
                </span>
              ) : null}
              {nivelEntendimientoLabel(s.nivel_entendimiento) ? (
                <span
                  className={`rounded-full px-2 py-0.5 text-[11.5px] font-bold ${estadoBadgeClass(s.etiqueta_estado)}`}
                >
                  Nivel {nivelEntendimientoLabel(s.nivel_entendimiento)}
                </span>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function ConceptosPanelItems({ items }: { items: Concepto[] }) {
  if (items.length === 0) {
    return <DetalleEmptyState message="Todavía no hay conceptos." />;
  }
  return (
    <ul className="space-y-2.5">
      {items.map((c) => (
        <li key={c.id} className="td-item">
          <div className="text-[11px] font-extrabold uppercase tracking-wide text-[var(--td-faint)]">
            {c.titulo}
          </div>
          <p className="mt-1 whitespace-pre-wrap text-[14.5px] text-[var(--td-ink)]">
            {c.descripcion}
          </p>
          <div className="mt-2">
            <span className="rounded-full bg-[rgba(110,63,105,.1)] px-2 py-0.5 text-[11.5px] font-bold text-[var(--td-plum-deep)]">
              Jerarquía {c.jerarquia}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

function VeredictoChip({
  veredicto,
  className = "",
}: {
  veredicto: VeredictoUi;
  className?: string;
}) {
  const prefix =
    veredicto.key === "atrasado"
      ? "⚠ "
      : veredicto.key === "adelantado"
        ? "✓ "
        : "";
  return (
    <span className={`${veredicto.chipClass} ${className}`.trim()}>
      {prefix}
      {veredicto.label}
    </span>
  );
}
