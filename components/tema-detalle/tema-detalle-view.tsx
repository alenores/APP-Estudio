"use client";

import type { ChildQuickAction } from "@/components/study/child-context-menu";
import { TemaCursoCard } from "@/components/tema-detalle/tema-curso-card";
import type {
  Concepto,
  CursoConDerivados,
  Seguimiento,
  TemaConDerivados,
} from "@/app/types/estudio";
import type {
  FiltroCursoEstado,
  TemaDetalleMetrics,
} from "@/app/hooks/useTemaDetalleMetrics";
import { formatDuracionMinutos } from "@/lib/format-duracion";
import {
  estadoBadgeClass,
  estadoChipDetalleClass,
  estadoFilterDotClass,
  estadoLabel,
  ESTADO_OPCIONES,
  nivelEntendimientoLabel,
  normalizarEstado,
} from "@/lib/estado-ui";
import type { VeredictoUi } from "@/lib/tema-detalle-metrics";
import { Plus_Jakarta_Sans } from "next/font/google";
import { useMemo, useState, type CSSProperties } from "react";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

function formatFechaLarga(value: string | null): string {
  if (!value?.trim()) return "—";
  try {
    return new Date(value).toLocaleDateString("es-AR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
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

type TemaDetalleViewProps = {
  tema: TemaConDerivados;
  cursos: CursoConDerivados[];
  seguimientos: Seguimiento[];
  conceptos: Concepto[];
  metrics: TemaDetalleMetrics;
  onCursoQuickAction: (
    cursoId: number,
    nombre: string,
    action: ChildQuickAction,
  ) => void;
};

const FILTROS: { key: FiltroCursoEstado; label: string }[] = [
  { key: "todos", label: "Todos" },
  ...ESTADO_OPCIONES.map((o) => ({
    key: o.value as FiltroCursoEstado,
    label: o.label,
  })),
];

const TAB_KEYS = ["cursos", "seguimiento", "conceptos"] as const;
type TabKey = (typeof TAB_KEYS)[number];

export function TemaDetalleView({
  tema,
  cursos,
  seguimientos,
  conceptos,
  metrics,
  onCursoQuickAction,
}: TemaDetalleViewProps) {
  const [filtro, setFiltro] = useState<FiltroCursoEstado>("todos");
  const [tab, setTab] = useState<TabKey>("cursos");
  const tabIndex = TAB_KEYS.indexOf(tab);

  const cursosFiltrados = useMemo(() => {
    if (filtro === "todos") return cursos;
    return cursos.filter(
      (c) => normalizarEstado(c.derivados.etiqueta_estado) === filtro,
    );
  }, [cursos, filtro]);

  const estadoTexto = estadoLabel(metrics.estadoTema) ?? "Sin estado";
  const tlStyle = {
    "--td-fill-pct": metrics.fillPct,
    "--td-gap-left": metrics.gapLeft,
    "--td-gap-width": metrics.showGap ? metrics.gapWidth : "0%",
    "--td-today-pct": metrics.todayPct,
    "--td-gz-offset": String(metrics.gzOffset),
  } as CSSProperties;

  return (
    <div
      className={`${jakarta.className} tema-detalle-page -mx-1 min-h-full pb-24`}
      style={{
        ...tlStyle,
        backgroundImage:
          "radial-gradient(circle at 10% 4%, rgba(39,72,103,.045), transparent 38%), radial-gradient(circle at 92% 96%, rgba(60,138,90,.045), transparent 40%)",
      }}
    >
      <section className="td-card td-rise td-d1 px-6 pb-5 pt-6">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[var(--td-faint)]">
          Tema
        </p>
        <h1 className="mt-1.5 text-[34px] font-extrabold leading-[1.05] tracking-tight text-[var(--td-ink)] max-[430px]:text-[30px]">
          {tema.nombre}
        </h1>
        <span
          className={`mt-3 ${estadoChipDetalleClass(metrics.estadoTema)}`}
        >
          <span className="td-chip-dot" aria-hidden />
          {estadoTexto}
        </span>
        {tema.descripcion ? (
          <p className="mt-3.5 max-w-[36ch] text-[15px] text-[var(--td-ink-soft)]">
            {tema.descripcion}
          </p>
        ) : null}
      </section>

      <section className="td-card td-rise td-d2 mt-3.5 px-6 pb-6 pt-5">
        <div className="mb-6 flex items-center justify-between gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--td-faint)]">
            Calendario y avance
          </span>
          <VeredictoChip veredicto={metrics.veredicto} />
        </div>
        <div className="relative mx-1">
          {metrics.showToday ? (
            <div className="td-today-flag">
              HOY · <b>{formatHoyFlag()}</b>
            </div>
          ) : null}
          <div className="relative h-4 rounded-[10px] bg-[var(--td-line)]">
            <div className="td-tl-fill" />
            {metrics.showGap ? (
              <div
                className={`td-tl-gap ${metrics.veredicto.gapClass}`}
              />
            ) : null}
            {metrics.showToday ? <div className="td-tl-today" /> : null}
          </div>
        </div>
        <div className="mt-3.5 flex justify-between gap-4">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--td-faint)]">
              Inicio
            </div>
            <div className="mt-0.5 text-sm font-bold">
              {formatFechaLarga(tema.fecha_estimada_inicio)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--td-faint)]">
              Fin estimado
            </div>
            <div className="mt-0.5 text-sm font-bold">
              {formatFechaLarga(tema.fecha_estimada_fin)}
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 border-t border-[var(--td-line-soft)] pt-4">
          <span className="flex items-center gap-2 text-[13px] font-semibold text-[var(--td-ink-soft)]">
            <span
              className="h-2 w-3.5 shrink-0 rounded-sm"
              style={{
                background: "linear-gradient(90deg, var(--td-navy), var(--td-navy-2))",
              }}
            />
            Avance del temario{" "}
            <b className="font-extrabold text-[var(--td-ink)]">
              {metrics.avanceTema}%
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
        {metrics.nota ? (
          <NotaCalendario nota={metrics.nota} delta={metrics.delta} />
        ) : null}
      </section>

      <div className="td-rise td-d3 mt-3.5 grid grid-cols-1 gap-3.5 min-[431px]:grid-cols-[1.05fr_1fr]">
        <section className="td-card flex flex-col items-center px-4 pb-4 pt-4">
          <span className="self-start text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--td-faint)]">
            Nivel de entendimiento
          </span>
          <div className="relative mt-1.5 w-full max-w-[190px]">
            <svg viewBox="0 0 200 118" className="block h-auto w-full">
              <defs>
                <linearGradient id="td-gz-gradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="var(--td-plum-pale)" />
                  <stop offset="1" stopColor="var(--td-plum-deep)" />
                </linearGradient>
              </defs>
              <path
                className="fill-none stroke-[var(--td-line)]"
                strokeWidth={15}
                strokeLinecap="round"
                d="M20,100 A80,80 0 0 1 180,100"
              />
              <path
                className="td-gz-val"
                d="M20,100 A80,80 0 0 1 180,100"
              />
            </svg>
            <div className="pointer-events-none absolute inset-x-0 top-[46%] text-center">
              <span className="text-[40px] font-extrabold leading-none tracking-tight text-[var(--td-plum-deep)]">
                {metrics.nivel ?? "—"}
              </span>
              <span className="text-sm font-bold text-[var(--td-faint)]">
                /10
              </span>
            </div>
          </div>
          <div className="mt-0 flex w-full justify-between px-1.5 text-[11px] font-bold text-[var(--td-faint)]">
            <span>1</span>
            <span>10</span>
          </div>
          {metrics.nivelPalabra ? (
            <p className="mt-1 text-[13px] font-extrabold text-[var(--td-plum-deep)]">
              {metrics.nivelPalabra}
            </p>
          ) : null}
        </section>
        <div className="flex flex-col gap-3.5">
          <Ministat
            label="Tiempo invertido"
            value={formatDuracionMinutos(metrics.tiempoInvertidoMin)}
            delayClass="td-d4"
          />
          <Ministat
            label="Restante estimado"
            value={formatDuracionMinutos(metrics.tiempoRestanteMin)}
            delayClass="td-d4"
          />
        </div>
      </div>

      <div className="td-rise td-d5 mt-7">
        <div className="relative flex overflow-hidden rounded-[14px] border border-[var(--td-line)] bg-[var(--td-line-soft)] p-1">
          <span
            className="td-ctab-ind pointer-events-none absolute bottom-1 left-1 top-1 z-[1] w-[calc((100%-8px)/3)] rounded-[10px] bg-[var(--td-card)] shadow-[0_2px_8px_-2px_rgba(27,34,43,.2)]"
            style={{ transform: `translateX(${tabIndex * 100}%)` }}
            aria-hidden
          />
          <TabButton
            active={tab === "cursos"}
            onClick={() => setTab("cursos")}
            label="Cursos"
            count={cursos.length}
          />
          <TabButton
            active={tab === "seguimiento"}
            onClick={() => setTab("seguimiento")}
            label="Seguimiento"
            count={seguimientos.length}
          />
          <TabButton
            active={tab === "conceptos"}
            onClick={() => setTab("conceptos")}
            label="Conceptos"
            count={conceptos.length}
          />
        </div>

        <div className="relative mt-4">
          {tab === "cursos" ? (
            <div key="cursos" className="td-cpanel-active">
              <div className="mb-4 flex gap-1.5">
                {FILTROS.map((f) => {
                  const active = filtro === f.key;
                  return (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setFiltro(f.key)}
                      className={`flex min-w-0 flex-1 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-[10px] border px-1 py-2 text-[9.5px] font-bold transition-[background,border-color] duration-150 ${
                        active
                          ? "border-[var(--td-navy)] bg-[var(--td-navy)] text-white shadow-[0_4px_12px_-4px_rgba(39,72,103,.45)]"
                          : "border-[var(--td-line)] bg-[var(--td-card)] text-[var(--td-ink-soft)]"
                      }`}
                    >
                      {f.key !== "todos" ? (
                        <span
                          className={estadoFilterDotClass(f.key)}
                          aria-hidden
                        />
                      ) : null}
                      <span className={active ? "text-white" : ""}>
                        {f.label}
                      </span>
                      <span
                        className={
                          active
                            ? "font-semibold text-white/70"
                            : "font-semibold text-[var(--td-faint)]"
                        }
                      >
                        {metrics.contadores[f.key]}
                      </span>
                    </button>
                  );
                })}
              </div>
              {cursosFiltrados.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-[var(--td-line)] px-4 py-9 text-center text-sm text-[var(--td-faint)]">
                  No hay cursos en este filtro.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {cursosFiltrados.map((c) => (
                    <TemaCursoCard
                      key={c.id}
                      curso={c}
                      clasesStats={
                        metrics.clasesStats.get(c.id) ?? {
                          terminadas: 0,
                          total: 0,
                        }
                      }
                      onQuickAction={(action) =>
                        onCursoQuickAction(c.id, c.nombre, action)
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {tab === "seguimiento" ? (
            <div key="seguimiento" className="td-cpanel-active">
              <p className="mb-3 px-0.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--td-faint)]">
                Últimos seguimientos
              </p>
              <SeguimientoPanelItems items={seguimientos} />
            </div>
          ) : null}

          {tab === "conceptos" ? (
            <div key="conceptos" className="td-cpanel-active">
              <p className="mb-3 px-0.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--td-faint)]">
                Conceptos clave
              </p>
              <ConceptosPanelItems items={conceptos} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function VeredictoChip({ veredicto }: { veredicto: VeredictoUi }) {
  const prefix =
    veredicto.key === "atrasado"
      ? "⚠ "
      : veredicto.key === "adelantado"
        ? "✓ "
        : "";
  return (
    <span className={veredicto.chipClass}>
      {prefix}
      {veredicto.label}
    </span>
  );
}

function Ministat({
  label,
  value,
  delayClass,
}: {
  label: string;
  value: string;
  delayClass: string;
}) {
  const match = value.match(/^(\d+h)\s*(\d+)m$/);
  return (
    <section
      className={`td-card td-rise ${delayClass} flex flex-1 flex-col justify-center px-4 py-4`}
    >
      <div className="text-[10.5px] font-extrabold uppercase tracking-[0.12em] text-[var(--td-faint)]">
        {label}
      </div>
      <div className="mt-1 text-[23px] font-extrabold tracking-tight text-[var(--td-ink)]">
        {value === "—" ? (
          "—"
        ) : match ? (
          <>
            {match[1]} {match[2]}
            <small className="text-sm font-semibold text-[var(--td-ink-soft)]">
              m
            </small>
          </>
        ) : (
          value
        )}
      </div>
    </section>
  );
}

function NotaCalendario({
  nota,
  delta,
}: {
  nota: string;
  delta: number | null;
}) {
  if (!nota.includes("puntos") || delta == null) {
    return (
      <p className="mt-3.5 rounded-xl border border-[var(--td-line)] bg-[var(--td-line-soft)] px-3.5 py-2.5 text-[13px] text-[var(--td-ink-soft)]">
        {nota}
      </p>
    );
  }
  const puntos = Math.abs(Math.round(delta));
  const [before, after] = nota.split(`${puntos} puntos`);
  return (
    <p className="mt-3.5 rounded-xl border border-[var(--td-line)] bg-[var(--td-line-soft)] px-3.5 py-2.5 text-[13px] text-[var(--td-ink-soft)]">
      {before}
      <b className="font-extrabold text-[var(--td-red)]">{puntos} puntos</b>
      {after}
    </p>
  );
}

function TabButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`relative z-[2] flex-1 rounded-[10px] border-0 bg-transparent py-2.5 font-bold text-sm transition-colors duration-200 ${
        active ? "text-[var(--td-navy)]" : "text-[var(--td-ink-soft)]"
      }`}
    >
      {label}{" "}
      <span className="text-xs font-semibold opacity-55">{count}</span>
    </button>
  );
}

function SeguimientoPanelItems({ items }: { items: Seguimiento[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-[var(--td-line)] px-4 py-9 text-center text-sm text-[var(--td-faint)]">
        Todavía no hay seguimientos.
      </p>
    );
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

function ConceptosPanelItems({ items }: { items: Concepto[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-[var(--td-line)] px-4 py-9 text-center text-sm text-[var(--td-faint)]">
        Todavía no hay conceptos.
      </p>
    );
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
