"use client";

import { ExternalLinkPreview } from "@/components/shared/links/external-link-preview";
import type { ClaseConDerivados, Concepto, Seguimiento } from "@/app/types/estudio";
import type { ClaseDetalleMetrics } from "@/app/hooks/useClaseDetalleMetrics";
import { ContenidoMarkdownPlayer } from "@/components/mobile/detalle/contenido-markdown-player";
import {
  ConceptosPanelItems,
  DetalleCalendarioSection,
  DetalleHeaderCard,
  DetalleMetricGrid,
  DetallePageShell,
  DetalleTabBar,
  DetalleZonaContenido,
  SeguimientoPanelItems,
} from "@/components/mobile/detalle/detalle-shared";
import { useMemo, useState } from "react";

type TabKey = "seguimiento" | "conceptos" | "contenido";

type ClaseDetalleViewProps = {
  clase: ClaseConDerivados;
  seguimientos: Seguimiento[];
  conceptos: Concepto[];
  metrics: ClaseDetalleMetrics;
};

export function ClaseDetalleView({
  clase,
  seguimientos,
  conceptos,
  metrics,
}: ClaseDetalleViewProps) {
  const hasContenido = clase.contenido_markdown != null;
  const tabKeys = useMemo<readonly TabKey[]>(
    () =>
      hasContenido
        ? (["seguimiento", "conceptos", "contenido"] as const)
        : (["seguimiento", "conceptos"] as const),
    [hasContenido],
  );
  const [tab, setTab] = useState<TabKey>("seguimiento");
  const tabIndex = tabKeys.indexOf(tab);

  const tabLabels: Record<TabKey, string> = {
    seguimiento: "Seguimiento",
    conceptos: "Conceptos",
    contenido: "Contenido",
  };

  const tabCounts: Record<TabKey, number> = {
    seguimiento: seguimientos.length,
    conceptos: conceptos.length,
    contenido: 0,
  };

  return (
    <DetallePageShell metrics={metrics}>
      <DetalleHeaderCard
        eyebrow="Clase"
        nombre={clase.nombre}
        descripcion={clase.descripcion}
        extra={
          clase.dificultad ? (
            <p className="mt-3 text-[13px] font-bold text-[var(--td-ink-soft)]">
              Dificultad:{" "}
              <span className="text-[var(--td-ink)]">{clase.dificultad}</span>
            </p>
          ) : null
        }
      />

      {clase.link ? (
        <div className="td-rise td-d2 overflow-hidden rounded-[22px] border border-[var(--td-line)] bg-[var(--td-card)] shadow-[var(--td-shadow)]">
          <ExternalLinkPreview link={clase.link} />
        </div>
      ) : null}

      <DetalleMetricGrid metrics={metrics} estado={metrics.estadoClase} />

      <DetalleCalendarioSection
        metrics={metrics}
        fechaInicio={null}
        fechaFin={null}
        avanceLabel="Avance de la clase"
      />

      <DetalleZonaContenido>
        <DetalleTabBar
          tabCount={hasContenido ? 3 : 2}
          tabIndex={tabIndex}
          tabs={tabKeys.map((key) => ({
            key,
            label: tabLabels[key],
            count: tabCounts[key],
            active: tab === key,
            onClick: () => setTab(key),
          }))}
        />

        <div className="relative mt-4">
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

          {tab === "contenido" && hasContenido ? (
            <div key="contenido" className="td-cpanel-active">
              <ContenidoMarkdownPlayer contenido={clase.contenido_markdown as string} />
            </div>
          ) : null}
        </div>
      </DetalleZonaContenido>
    </DetallePageShell>
  );
}
