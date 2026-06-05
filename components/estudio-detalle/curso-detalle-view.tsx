"use client";

import type { ChildQuickAction } from "@/components/study/child-context-menu";
import { ExternalLinkPreview } from "@/components/study/external-link-preview";
import type {
  ClaseConDerivados,
  Concepto,
  CursoConDerivados,
  Seguimiento,
} from "@/app/types/estudio";
import type { CursoDetalleMetrics } from "@/app/hooks/useCursoDetalleMetrics";
import type { FiltroHijoEstado } from "@/app/hooks/useTemaDetalleMetrics";
import { CursoClaseCard } from "@/components/estudio-detalle/curso-clase-card";
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
} from "@/components/estudio-detalle/detalle-shared";
import {
  ESTADO_OPCIONES,
  normalizarEstado,
} from "@/lib/estado-ui";
import { useMemo, useState } from "react";

const FILTROS: { key: FiltroHijoEstado; label: string }[] = [
  { key: "todos", label: "Todos" },
  ...ESTADO_OPCIONES.map((o) => ({
    key: o.value as FiltroHijoEstado,
    label: o.label,
  })),
];

const TAB_KEYS = ["clases", "seguimiento", "conceptos"] as const;
type TabKey = (typeof TAB_KEYS)[number];

type CursoDetalleViewProps = {
  curso: CursoConDerivados;
  clases: ClaseConDerivados[];
  seguimientos: Seguimiento[];
  conceptos: Concepto[];
  metrics: CursoDetalleMetrics;
  onClaseQuickAction: (
    claseId: number,
    nombre: string,
    action: ChildQuickAction,
  ) => void;
};

export function CursoDetalleView({
  curso,
  clases,
  seguimientos,
  conceptos,
  metrics,
  onClaseQuickAction,
}: CursoDetalleViewProps) {
  const [filtro, setFiltro] = useState<FiltroHijoEstado>("todos");
  const [tab, setTab] = useState<TabKey>("clases");
  const tabIndex = TAB_KEYS.indexOf(tab);

  const clasesFiltradas = useMemo(() => {
    if (filtro === "todos") return clases;
    return clases.filter(
      (c) => normalizarEstado(c.derivados.etiqueta_estado) === filtro,
    );
  }, [clases, filtro]);

  return (
    <DetallePageShell metrics={metrics}>
      <DetalleHeaderCard
        eyebrow="Curso"
        nombre={curso.nombre}
        descripcion={curso.descripcion}
      />

      {curso.link ? (
        <div className="td-rise td-d2 overflow-hidden rounded-[22px] border border-[var(--td-line)] bg-[var(--td-card)] shadow-[var(--td-shadow)]">
          <ExternalLinkPreview link={curso.link} />
        </div>
      ) : null}

      <DetalleMetricGrid metrics={metrics} estado={metrics.estadoCurso} />

      <DetalleCalendarioSection
        metrics={metrics}
        fechaInicio={curso.fecha_estimada_inicio}
        fechaFin={curso.fecha_estimada_fin}
        avanceLabel="Avance del curso"
      />

      <DetalleZonaContenido>
        <DetalleTabBar
          tabCount={3}
          tabIndex={tabIndex}
          tabs={TAB_KEYS.map((key) => ({
            key,
            label:
              key === "clases"
                ? "Clases"
                : key === "seguimiento"
                  ? "Seguimiento"
                  : "Conceptos",
            count:
              key === "clases"
                ? clases.length
                : key === "seguimiento"
                  ? seguimientos.length
                  : conceptos.length,
            active: tab === key,
            onClick: () => setTab(key),
          }))}
        />

        <div className="relative mt-4">
          {tab === "clases" ? (
            <div key="clases" className="td-cpanel-active">
              <DetalleFiltroEstadosCompact
                filtros={FILTROS}
                filtro={filtro}
                contadores={metrics.contadores}
                onSelect={setFiltro}
                entityLabel="clases"
              />
              {clasesFiltradas.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-[var(--td-line)] px-4 py-9 text-center text-sm text-[var(--td-faint)]">
                  No hay clases en este filtro.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {clasesFiltradas.map((cl) => (
                    <CursoClaseCard
                      key={cl.id}
                      clase={cl}
                      onQuickAction={(action) =>
                        onClaseQuickAction(cl.id, cl.nombre, action)
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
