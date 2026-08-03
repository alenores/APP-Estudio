"use client";

import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAcademicoLite } from "@/app/hooks/useAcademicoLite";
import { LiteCard } from "@/components/lite/lite-card";
import { LiteGridCard } from "@/components/lite/lite-grid-card";
import { LiteDetallePanel } from "@/components/lite/lite-detalle-panel";
import { LiteEstadoSheet } from "@/components/lite/lite-estado-sheet";
import { LiteVistasSheet, type CursosViewMode } from "@/components/lite/lite-vistas-sheet";
import { LiteFiltrosBar } from "@/components/lite/lite-filtros-bar";
import { LiteCursoGridCard } from "@/components/lite/lite-curso-grid-card";
import { LiteCursoHeroCard } from "@/components/lite/lite-curso-hero-card";
import {
  LITE_FILTROS_VACIOS,
  aplicarLiteFiltros,
  type LiteFiltros,
} from "@/lib/academico-lite-filtros";
import type { LiteEntityRef, LiteItem } from "@/lib/academico-lite-read";
import type { EstadoSeguimiento } from "@/lib/estado-ui";

type TabLista = "temas" | "cursos";

const TABS: { id: TabLista; label: string }[] = [
  { id: "temas", label: "Temas" },
  { id: "cursos", label: "Cursos" },
];

/**
 * Pantalla académico lite (ADR 012): dos listados filtrables y el detalle en la
 * misma pantalla, con navegación en pila tema → curso → clase.
 */
export function LiteView() {
  const lite = useAcademicoLite();
  const [tab, setTab] = useState<TabLista>("temas");
  const [filtros, setFiltros] = useState<LiteFiltros>(LITE_FILTROS_VACIOS);
  const [pila, setPila] = useState<LiteEntityRef[]>([]);
  const [estadoSheetAbierto, setEstadoSheetAbierto] = useState(false);
  const [vistasSheetAbierto, setVistasSheetAbierto] = useState(false);
  const [cursosView, setCursosView] = useState<CursosViewMode>("list");

  const base = tab === "temas" ? lite.snapshot.temas : lite.snapshot.cursos;
  const visibles = useMemo(
    () => aplicarLiteFiltros(base, filtros),
    [base, filtros],
  );

  const actual = useMemo(() => {
    const ref = pila.at(-1);
    return ref ? lite.getItem(ref.kind, ref.id) : null;
  }, [pila, lite]);

  const ruta = useMemo(
    () =>
      pila
        .slice(0, -1)
        .map((ref) => lite.getItem(ref.kind, ref.id)?.nombre ?? "…"),
    [pila, lite],
  );

  // El detalle es `fixed` y tiene scroll propio: el fondo no debe desplazarse.
  const detalleAbierto = pila.length > 0;
  useEffect(() => {
    if (!detalleAbierto) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previo;
    };
  }, [detalleAbierto]);

  const abrir = useCallback((item: LiteItem) => {
    setPila((actualPila) => [...actualPila, { kind: item.kind, id: item.id }]);
  }, []);

  const volver = useCallback(() => {
    setPila((actualPila) => actualPila.slice(0, -1));
  }, []);

  const cerrar = useCallback(() => setPila([]), []);

  const guardarEstado = useCallback(
    async (estado: EstadoSeguimiento) => {
      if (!actual) return;
      const { error } = await lite.guardarEstado(actual.kind, actual.id, estado);
      if (!error) setEstadoSheetAbierto(false);
    },
    [actual, lite],
  );

  const cambiarTab = useCallback((siguiente: TabLista) => {
    setTab(siguiente);
    setFiltros((f) => ({ ...f, tipos: siguiente === "temas" ? [] : f.tipos }));
  }, []);

  return (
    <div className="lite-root flex min-h-dvh flex-col">
      <header className="lite-header sticky top-0 z-20">
        <div className="mx-auto w-full max-w-[640px] px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="lite-icon-btn flex-none"
              aria-label="Volver al inicio"
            >
              <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
            </Link>
            <div className="min-w-0 flex-1">
              <p className="lite-eyebrow">Académico</p>
              <h1 className="lite-display text-[22px]">Estudiar</h1>
            </div>
            <button
              type="button"
              onClick={() => void lite.actualizarDatos()}
              disabled={lite.syncing}
              className="lite-icon-btn flex-none disabled:opacity-50"
              aria-label="Actualizar datos"
              style={
                lite.hasUpdatesAvailable && !lite.syncing
                  ? {
                      borderColor: "var(--lt-accent-line)",
                      color: "var(--lt-accent)",
                      background: "var(--lt-accent-soft)",
                    }
                  : undefined
              }
            >
              <RefreshCw
                className={`h-[17px] w-[17px] ${lite.syncing ? "animate-spin" : ""}`}
                strokeWidth={2}
                aria-hidden
              />
            </button>
          </div>

          <div className="mt-3.5">
            <Segmented value={tab} onChange={cambiarTab} />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[640px] flex-1 px-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-4">
        <LiteFiltrosBar
          filtros={filtros}
          onChange={setFiltros}
          mostrarTipo={tab === "cursos"}
          resultados={visibles.length}
          onViewSettingsClick={tab === "cursos" ? () => setVistasSheetAbierto(true) : undefined}
        />

        {lite.error ? (
          <p className="mt-4 rounded-2xl border border-[var(--lt-danger)]/30 bg-[var(--lt-danger)]/10 px-4 py-3 text-[13.5px] text-[var(--lt-danger)]">
            {lite.error}
          </p>
        ) : null}

        <div className="mt-4">
          {lite.loading ? (
            <ul className="space-y-2.5" aria-label="Cargando">
              {[0, 1, 2, 3, 4].map((i) => (
                <li key={i} className="lite-skeleton h-[104px]" />
              ))}
            </ul>
          ) : visibles.length === 0 ? (
            <VacioLista
              packReady={lite.packReady}
              syncing={lite.syncing}
              onActualizar={() => void lite.actualizarDatos()}
              hayFiltros={base.length > 0}
              etiqueta={tab === "temas" ? "temas" : "cursos"}
            />
          ) : (
            <ul className={
              tab === "temas" 
                ? "grid grid-cols-3 gap-3" 
                : cursosView === "grid" 
                  ? "grid grid-cols-2 gap-3" 
                  : "space-y-2.5"
            }>
              {visibles.map((item) => (
                <li key={`${item.kind}-${item.id}`}>
                  {tab === "temas" ? (
                    <LiteGridCard item={item} onSelect={abrir} />
                  ) : cursosView === "hero" ? (
                    <LiteCursoHeroCard item={item} onSelect={abrir} />
                  ) : cursosView === "grid" ? (
                    <LiteCursoGridCard item={item} onSelect={abrir} />
                  ) : (
                    <LiteCard
                      item={item}
                      mostrarPadre={tab === "cursos"}
                      onSelect={abrir}
                    />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      {actual ? (
        <LiteDetallePanel
          key={`${actual.kind}-${actual.id}`}
          item={actual}
          hijos={lite.getHijos(actual.kind, actual.id)}
          conceptos={lite.getConceptos(actual.kind, actual.id)}
          ruta={ruta}
          onAbrirHijo={abrir}
          onVolver={volver}
          onCerrar={cerrar}
          onEditarEstado={() => setEstadoSheetAbierto(true)}
          escapeActivo={!estadoSheetAbierto}
        />
      ) : null}

      <LiteEstadoSheet
        open={estadoSheetAbierto && actual != null}
        titulo={actual?.nombre ?? ""}
        estadoActual={actual?.estado ?? null}
        guardando={lite.guardandoEstado}
        onSelect={(estado) => void guardarEstado(estado)}
        onClose={() => setEstadoSheetAbierto(false)}
      />

      <LiteVistasSheet
        open={vistasSheetAbierto}
        viewActual={cursosView}
        onSelect={setCursosView}
        onClose={() => setVistasSheetAbierto(false)}
      />
    </div>
  );
}

function Segmented({
  value,
  onChange,
}: {
  value: TabLista;
  onChange: (v: TabLista) => void;
}) {
  const index = TABS.findIndex((t) => t.id === value);

  return (
    <div
      className="lite-segmented grid-cols-2"
      role="tablist"
      aria-label="Listados"
    >
      <span
        className="lite-segmented-thumb"
        style={{
          width: `calc((100% - 8px - 2px) / 2)`,
          transform: `translateX(calc(${index} * (100% + 2px)))`,
        }}
        aria-hidden
      />
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={value === t.id}
          className="lite-segmented-option"
          data-active={value === t.id}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function VacioLista({
  packReady,
  syncing,
  onActualizar,
  hayFiltros,
  etiqueta,
}: {
  packReady: boolean;
  syncing: boolean;
  onActualizar: () => void;
  hayFiltros: boolean;
  etiqueta: string;
}) {
  if (!packReady) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="lite-title">Todavía no hay datos locales</p>
        <p className="max-w-[300px] text-[13.5px] leading-relaxed text-[var(--lt-text-3)]">
          Descargá el paquete para estudiar sin conexión.
        </p>
        <button
          type="button"
          onClick={onActualizar}
          disabled={syncing}
          className="lite-cta mt-1 disabled:opacity-60"
        >
          {syncing ? "Descargando…" : "Descargar datos"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 py-16 text-center">
      <p className="lite-title">
        {hayFiltros ? "Sin resultados" : `No hay ${etiqueta}`}
      </p>
      <p className="max-w-[300px] text-[13.5px] leading-relaxed text-[var(--lt-text-3)]">
        {hayFiltros
          ? "Probá con otra búsqueda o quitá algún filtro."
          : `Cargá ${etiqueta} desde la pantalla académico completa.`}
      </p>
    </div>
  );
}
