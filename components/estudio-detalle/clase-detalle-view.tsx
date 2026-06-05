"use client";

import { ExternalLinkPreview } from "@/components/study/external-link-preview";
import type { ClaseConDerivados, Concepto, Seguimiento } from "@/app/types/estudio";
import type { ClaseDetalleMetrics } from "@/app/hooks/useClaseDetalleMetrics";
import {
  ConceptosPanelItems,
  DetalleCalendarioSection,
  DetalleHeaderCard,
  DetalleMetricGrid,
  DetallePageShell,
  DetalleTabBar,
  DetalleZonaContenido,
  SeguimientoPanelItems,
} from "@/components/estudio-detalle/detalle-shared";
import { useState } from "react";

const TAB_KEYS = ["seguimiento", "conceptos"] as const;
type TabKey = (typeof TAB_KEYS)[number];

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
  const [tab, setTab] = useState<TabKey>("seguimiento");
  const tabIndex = TAB_KEYS.indexOf(tab);

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
        <div className="td-rise td-d2 mt-3 overflow-hidden rounded-[22px] border border-[var(--td-line)] bg-[var(--td-card)] shadow-[var(--td-shadow)]">
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
          tabCount={2}
          tabIndex={tabIndex}
          tabs={TAB_KEYS.map((key) => ({
            key,
            label: key === "seguimiento" ? "Seguimiento" : "Conceptos",
            count:
              key === "seguimiento" ? seguimientos.length : conceptos.length,
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
        </div>
      </DetalleZonaContenido>
    </DetallePageShell>
  );
}
