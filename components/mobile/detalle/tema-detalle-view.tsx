"use client";

import type { ChildQuickAction } from "@/components/mobile/cards/child-context-menu";
import { TemaCursoCard } from "@/components/mobile/detalle/tema-curso-card";
import type {
  Concepto,
  CursoConDerivados,
  Seguimiento,
  TemaConDerivados,
} from "@/app/types/estudio";
import type {
  FiltroHijoEstado,
  TemaDetalleMetrics,
} from "@/app/hooks/useTemaDetalleMetrics";
import {
  ConceptosPanelItems,
  DetalleCalendarioSection,
  DetalleHeaderCard,
  DetalleMetricGrid,
  DetallePageShell,
  DetalleTabBar,
  DetalleZonaContenido,
  DetalleFiltroEstadosCompact,
  SeguimientoPanelItems,
} from "@/components/mobile/detalle/detalle-shared";
import { ESTADO_OPCIONES, normalizarEstado } from "@/lib/estado-ui";
import { useMemo, useState } from "react";

const FILTROS: { key: FiltroHijoEstado; label: string }[] = [
  { key: "todos", label: "Todos" },
  ...ESTADO_OPCIONES.map((o) => ({
    key: o.value as FiltroHijoEstado,
    label: o.label,
  })),
];

const TAB_KEYS = ["cursos", "seguimiento", "conceptos"] as const;
type TabKey = (typeof TAB_KEYS)[number];

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

export function TemaDetalleView({
  tema,
  cursos,
  seguimientos,
  conceptos,
  metrics,
  onCursoQuickAction,
}: TemaDetalleViewProps) {
  const [filtro, setFiltro] = useState<FiltroHijoEstado>("todos");
  const [tab, setTab] = useState<TabKey>("cursos");
  const tabIndex = TAB_KEYS.indexOf(tab);

  const cursosFiltrados = useMemo(() => {
    if (filtro === "todos") return cursos;
    return cursos.filter(
      (c) => normalizarEstado(c.derivados.etiqueta_estado) === filtro,
    );
  }, [cursos, filtro]);

  return (
    <DetallePageShell metrics={metrics}>
      <DetalleHeaderCard
        eyebrow="Tema"
        nombre={tema.nombre}
        descripcion={tema.descripcion}
      />

      <DetalleMetricGrid metrics={metrics} estado={metrics.estadoTema} />

      <DetalleCalendarioSection
        metrics={metrics}
        fechaInicio={tema.fecha_estimada_inicio}
        fechaFin={tema.fecha_estimada_fin}
        avanceLabel="Avance del temario"
      />

      <DetalleZonaContenido>
        <DetalleTabBar
          tabCount={3}
          tabIndex={tabIndex}
          tabs={TAB_KEYS.map((key) => ({
            key,
            label:
              key === "cursos"
                ? "Cursos"
                : key === "seguimiento"
                  ? "Seguimiento"
                  : "Conceptos",
            count:
              key === "cursos"
                ? cursos.length
                : key === "seguimiento"
                  ? seguimientos.length
                  : conceptos.length,
            active: tab === key,
            onClick: () => setTab(key),
          }))}
        />

        <div className="relative mt-4">
          {tab === "cursos" ? (
            <div key="cursos" className="td-cpanel-active">
              <DetalleFiltroEstadosCompact
                filtros={FILTROS}
                filtro={filtro}
                contadores={metrics.contadores}
                onSelect={setFiltro}
                entityLabel="cursos"
              />
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
      </DetalleZonaContenido>
    </DetallePageShell>
  );
}

export type { FiltroHijoEstado as FiltroCursoEstado } from "@/app/hooks/useTemaDetalleMetrics";
