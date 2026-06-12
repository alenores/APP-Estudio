"use client";

import dynamic from "next/dynamic";
import { useMapaDesarrolloGrafo } from "@/app/hooks/useMapaDesarrolloGrafo";
import { DesktopModal } from "@/components/desktop/desktop-modal";
import { DesktopShellToolbar } from "@/components/desktop/desktop-shell-toolbar";
import { DefinicionGeneralForm } from "@/components/shared/forms/definicion-general-form";
import { AlertText, LoadingText, TextLink } from "@/components/ui";
import { writeContentTypology } from "@/lib/content-typology";
import type { MapaDesarrolloDetalleScope } from "@/lib/desarrollos-lienzo-types";
import type { MapaLienzoOrientacion } from "@/lib/mapa-lienzo-orientacion";
import { posicionEnLienzo } from "@/lib/mapa-layout";
import { MapaDesarrolloDetalleOverlay } from "@/components/desktop/mapa/mapa-desarrollo-detalle-overlay";
import type { DefinicionGeneral } from "@/app/types/desarrollos";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const MapaDesarrolloCanvas = dynamic(
  () =>
    import("@/components/desktop/mapa/mapa-desarrollo-canvas").then((m) => ({
      default: m.MapaDesarrolloCanvas,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-0 flex-1 items-center justify-center bg-[#f1f5f9] text-sm text-ink-muted">
        Cargando lienzo desarrollos…
      </div>
    ),
  },
);

function formatPosicion(item: {
  pos_x: number;
  pos_y: number;
  etapa: number;
  carril: number;
}) {
  const p = posicionEnLienzo(item);
  return `${Math.round(p.x)}, ${Math.round(p.y)}`;
}

/** Mapa lienzo tipología desarrollos — capa 0 (ADR 011). */
export function MapaDesarrolloView() {
  const {
    generales,
    enlaces,
    loading,
    error,
    reload,
    patchPosicion,
    addEnlace,
    removeEnlace,
  } = useMapaDesarrolloGrafo();

  const [orientacionLienzo, setOrientacionLienzo] =
    useState<MapaLienzoOrientacion>("xy");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<DefinicionGeneral | null>(null);
  const [detalleScope, setDetalleScope] = useState<MapaDesarrolloDetalleScope | null>(
    null,
  );

  useEffect(() => {
    writeContentTypology("desarrollos");
  }, []);

  const handleOpenDetalle = useCallback(
    (id: number) => {
      const general = generales.find((g) => g.id === id);
      if (!general) return;
      setDetalleScope({
        definicionGeneralId: general.id,
        parentLabel: general.nombre,
      });
    },
    [generales],
  );

  const handleEditItem = useCallback(
    (id: number) => {
      const general = generales.find((g) => g.id === id);
      if (general) setEditing(general);
    },
    [generales],
  );

  if (loading) {
    return <LoadingText>Cargando mapa desarrollos…</LoadingText>;
  }

  if (error) {
    return (
      <AlertText>
        {error.includes("enlaces_definicion_general")
          ? "Ejecutá docs/sql/016-schema-desarrollos-lienzo.sql en Supabase."
          : error}
      </AlertText>
    );
  }

  return (
    <>
      <DesktopShellToolbar>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-[#EA580C] px-2.5 py-1 text-xs font-semibold text-white">
            Desarrollos
          </span>
          <button
            type="button"
            onClick={() => setCreating(true)}
            disabled={detalleScope != null}
            className="rounded-md border border-stone-300 px-2.5 py-1 text-xs font-semibold text-stone-800 transition hover:border-[#EA580C]/40 hover:bg-stone-50 disabled:opacity-40 dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-900"
          >
            + General
          </button>
          <select
            value={orientacionLienzo}
            onChange={(e) =>
              setOrientacionLienzo(e.target.value as MapaLienzoOrientacion)
            }
            className="rounded-md border border-border bg-white px-2 py-1 text-xs"
          >
            <option value="xy">Eje X = tiempo</option>
            <option value="yx">Eje Y = tiempo</option>
          </select>
          <TextLink href="/">Tipología</TextLink>
          <Link
            href="/explorador-desarrollos"
            className="text-xs font-semibold text-[#EA580C] hover:text-[#c2410c]"
          >
            Explorador
          </Link>
        </div>
      </DesktopShellToolbar>

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-stone-300 bg-stone-100 dark:border-stone-700 dark:bg-stone-900/50">
        <MapaDesarrolloCanvas
          generales={generales}
          enlaces={enlaces}
          onEditItem={handleEditItem}
          onPositionSaved={patchPosicion}
          onEnlaceCreated={addEnlace}
          onEnlaceRemoved={removeEnlace}
          onOpenDetalle={handleOpenDetalle}
          orientacionLienzo={orientacionLienzo}
        />
        {detalleScope ? (
          <MapaDesarrolloDetalleOverlay
            scope={detalleScope}
            onClose={() => setDetalleScope(null)}
          />
        ) : null}
      </div>

      <DesktopModal
        open={creating}
        onClose={() => setCreating(false)}
        title="Nueva definición general"
      >
        <DefinicionGeneralForm
          onSuccess={async () => {
            setCreating(false);
            await reload();
          }}
        />
      </DesktopModal>

      <DesktopModal
        open={editing != null}
        onClose={() => setEditing(null)}
        title="Editar definición general"
        subtitle={editing?.nombre}
      >
        {editing ? (
          <DefinicionGeneralForm
            general={editing}
            onSuccess={async () => {
              setEditing(null);
              await reload();
            }}
            onDelete={async () => {
              setEditing(null);
              await reload();
            }}
          />
        ) : null}
      </DesktopModal>
    </>
  );
}
