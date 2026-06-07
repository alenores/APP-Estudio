"use client";

import dynamic from "next/dynamic";
import { useMapaGrafo } from "@/app/hooks/useMapaGrafo";
import type { EnlaceTema, Tema } from "@/app/types/estudio";
import type { MapaEnlace, MapaNodo } from "@/app/types/mapa";
import { DesktopModal } from "@/components/desktop/desktop-modal";
import { DesktopShellToolbar } from "@/components/desktop/desktop-shell-toolbar";
import { MapaNodoCreateFlow } from "@/components/desktop/mapa/mapa-nodo-create-flow";
import { MapaNodoForm } from "@/components/desktop/mapa/mapa-nodo-form";
import { MapaToolbar } from "@/components/desktop/mapa/mapa-toolbar";
import { MapaLogroForm } from "@/components/shared/forms/mapa-logro-form";
import { TemaForm } from "@/components/shared/forms/tema-form";
import { AlertText, LoadingText } from "@/components/ui";
import { estudioFormWellClass } from "@/lib/estudio-shell-tone";
import type { MapaGrafoModo } from "@/lib/mapa-lienzo-types";
import type { MapaLienzoOrientacion } from "@/lib/mapa-lienzo-orientacion";
import type { MapaObjetivoFiltro } from "@/lib/mapa-objetivo";
import { posicionEnLienzo } from "@/lib/mapa-layout";
import type { MapaDetalleScope } from "@/lib/mapa-detalle-types";
import { MapaDetalleOverlay } from "@/components/desktop/mapa/mapa-detalle-overlay";
import { nodoClasificacionLabel } from "@/lib/mapa-nodo-tipo";
import { formLienzoColocacionDesdePadreMacro } from "@/lib/form-lienzo-colocacion-types";
import { useCallback, useState } from "react";

const MapaCanvas = dynamic(
  () =>
    import("@/components/desktop/mapa/mapa-canvas").then((m) => ({
      default: m.MapaCanvas,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="mapa-canvas-host flex min-h-0 flex-1 items-center justify-center bg-[#f1f5f9] text-sm text-[var(--td-faint)]">
        Cargando lienzo…
      </div>
    ),
  },
);

type VistaMapa = "lienzo" | "lista";

type EnlacePadreDesdeCard = { id: number; label: string };

function formatPosicion(item: { pos_x: number; pos_y: number; etapa: number; carril: number }) {
  const p = posicionEnLienzo(item);
  return `${Math.round(p.x)}, ${Math.round(p.y)}`;
}

function mapaErrorMessage(modo: MapaGrafoModo, error: string): string {
  if (modo === "nodos") {
    if (
      error.includes("nodos_objetivos") ||
      error.includes("enlaces_nodos")
    ) {
      return "Las tablas nodos_objetivos / enlaces_nodos no existen o no tienen permisos. Ver docs/sql/005-schema-nodos-objetivos.sql.";
    }
    if (error.includes("objetivos")) {
      return "La tabla objetivos no existe o no tiene permisos. Ejecutá docs/sql/003-schema-objetivos.sql.";
    }
    return error;
  }
  if (error.includes("enlaces_temas")) {
    return "La tabla enlaces_temas no existe o no tiene permisos. Ejecutá docs/sql/006-schema-enlaces-temas.sql.";
  }
  if (error.includes("pos_x") || error.includes("etapa")) {
    return "Faltan columnas de lienzo en temas. Ejecutá docs/sql/007-schema-temas-lienzo.sql.";
  }
  return error;
}

/** Mapa de conocimiento — lienzo dual nodos | temas (ADR 009). Solo escritorio. */
export function MapaNodosView() {
  const [grafoModo, setGrafoModo] = useState<MapaGrafoModo>("nodos");
  const {
    nodos,
    temas,
    enlaces,
    objetivos,
    loading,
    error,
    reload,
    patchPosicion,
    addEnlaceNodo,
    addEnlaceTema,
    removeEnlaceNodo,
    removeEnlaceTema,
  } = useMapaGrafo(grafoModo);

  const [vista, setVista] = useState<VistaMapa>("lienzo");
  const [orientacionLienzo, setOrientacionLienzo] =
    useState<MapaLienzoOrientacion>("xy");
  const [filtroObjetivo, setFiltroObjetivo] =
    useState<MapaObjetivoFiltro>("todos");
  const [creating, setCreating] = useState(false);
  const [enlacePadreCard, setEnlacePadreCard] =
    useState<EnlacePadreDesdeCard | null>(null);
  const [editingNodo, setEditingNodo] = useState<MapaNodo | null>(null);
  const [editingTema, setEditingTema] = useState<Tema | null>(null);
  const [detalleScope, setDetalleScope] = useState<MapaDetalleScope | null>(
    null,
  );

  const items = grafoModo === "nodos" ? nodos : temas;

  const handleOpenDetalle = useCallback(
    (id: number) => {
      if (grafoModo === "temas") {
        const tema = temas.find((t) => t.id === id);
        if (!tema) return;
        setDetalleScope({
          kind: "tema",
          temaId: tema.id,
          parentLabel: tema.nombre,
          childKind: "curso",
        });
        return;
      }
      const nodo = nodos.find((n) => n.id === id);
      if (!nodo) return;
      setDetalleScope({
        kind: "nodo",
        nodoId: nodo.id,
        parentLabel: nodo.titulo,
        childKind: nodo.tipo === "produccion" ? "logro" : "mixto",
      });
    },
    [grafoModo, nodos, temas],
  );

  const handleAddLinked = useCallback(
    (id: number) => {
      const label =
        grafoModo === "nodos"
          ? nodos.find((n) => n.id === id)?.titulo ?? `#${id}`
          : temas.find((t) => t.id === id)?.nombre ?? `#${id}`;
      setEnlacePadreCard({ id, label });
      setCreating(true);
    },
    [grafoModo, nodos, temas],
  );

  const handleEditItem = useCallback(
    (id: number) => {
      if (grafoModo === "nodos") {
        const nodo = nodos.find((n) => n.id === id);
        if (nodo) setEditingNodo(nodo);
      } else {
        const tema = temas.find((t) => t.id === id);
        if (tema) setEditingTema(tema);
      }
    },
    [grafoModo, nodos, temas],
  );

  const handlePositionSaved = useCallback(
    (id: number, pos_x: number, pos_y: number) => {
      patchPosicion(id, pos_x, pos_y);
    },
    [patchPosicion],
  );

  function tituloItem(id: number): string {
    if (grafoModo === "nodos") {
      return nodos.find((n) => n.id === id)?.titulo ?? `#${id}`;
    }
    return temas.find((t) => t.id === id)?.nombre ?? `#${id}`;
  }

  function closeModals() {
    setCreating(false);
    setEnlacePadreCard(null);
    setEditingNodo(null);
    setEditingTema(null);
  }

  function openCreateModal() {
    setEnlacePadreCard(null);
    setCreating(true);
  }

  async function onSaved() {
    closeModals();
    await reload();
  }

  if (loading) {
    return (
      <LoadingText>
        {grafoModo === "nodos" ? "Cargando nodos…" : "Cargando temas…"}
      </LoadingText>
    );
  }

  if (error) {
    return <AlertText>{mapaErrorMessage(grafoModo, error)}</AlertText>;
  }

  return (
    <>
      <DesktopShellToolbar>
        <MapaToolbar
          grafoModo={grafoModo}
          objetivos={objetivos}
          vista={vista}
          filtroObjetivo={filtroObjetivo}
          onGrafoModoChange={setGrafoModo}
          onVistaChange={setVista}
          onFiltroChange={setFiltroObjetivo}
          onNuevo={openCreateModal}
          nuevoDisabled={detalleScope != null}
          orientacionLienzo={orientacionLienzo}
          onOrientacionLienzoChange={setOrientacionLienzo}
        />
      </DesktopShellToolbar>

      <div className="mapa-content-panel flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-[var(--td-line)]/40 bg-[#f1f5f9] shadow-sm">
        <div
          className={vista === "lienzo" ? "flex min-h-0 flex-1 flex-col" : "hidden"}
          role="tabpanel"
          aria-label="Lienzo"
          aria-hidden={vista !== "lienzo"}
        >
          <MapaCanvas
            grafoModo={grafoModo}
            nodos={nodos}
            temas={temas}
            enlaces={enlaces}
            objetivos={objetivos}
            filtroObjetivo={filtroObjetivo}
            onEditItem={handleEditItem}
            onPositionSaved={handlePositionSaved}
            onEnlaceCreated={(e) => {
              if (grafoModo === "nodos") addEnlaceNodo(e as MapaEnlace);
              else addEnlaceTema(e as EnlaceTema);
            }}
            onEnlaceRemoved={(id) => {
              if (grafoModo === "nodos") removeEnlaceNodo(id);
              else removeEnlaceTema(id);
            }}
            onOpenDetalle={handleOpenDetalle}
            onAddLinkedItem={handleAddLinked}
            orientacionLienzo={orientacionLienzo}
          />
        </div>

        <div
          className={
            vista === "lista"
              ? "min-h-0 flex-1 overflow-y-auto bg-white p-3"
              : "hidden"
          }
          role="tabpanel"
          aria-label="Lista"
          aria-hidden={vista !== "lista"}
        >
          {items.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[var(--td-line)] px-6 py-14 text-center text-sm text-[var(--td-faint)]">
              {grafoModo === "nodos"
                ? "Todavía no hay nodos. Creá el primero para armar tu mapa."
                : "Todavía no hay temas. Creá el primero para armar tu mapa."}
            </p>
          ) : (
            <div className="space-y-6">
              <div className="overflow-x-auto rounded-xl border border-[var(--td-line)]">
                <table className="desktop-data-table w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--td-line)] bg-[var(--td-line-soft)]/60 text-[11px] font-bold uppercase tracking-wide text-[var(--td-ink-soft)]">
                      <th className="px-3 py-2.5">
                        {grafoModo === "nodos" ? "Título" : "Nombre"}
                      </th>
                      {grafoModo === "nodos" ? (
                        <th className="px-3 py-2.5">Tipo</th>
                      ) : null}
                      <th className="px-3 py-2.5">Etapa</th>
                      <th className="px-3 py-2.5">Carril</th>
                      <th className="px-3 py-2.5">Posición</th>
                      <th className="px-3 py-2.5" />
                    </tr>
                  </thead>
                  <tbody>
                    {grafoModo === "nodos"
                      ? nodos.map((n) => (
                          <tr
                            key={n.id}
                            className="border-b border-[var(--td-line)]/80 last:border-0 hover:bg-[var(--td-line-soft)]/35"
                          >
                            <td className="px-3 py-2.5">
                              <p className="font-medium text-[var(--td-ink)]">
                                {n.titulo}
                              </p>
                              {n.descripcion?.trim() ? (
                                <p className="mt-0.5 line-clamp-1 text-xs text-[var(--td-ink-soft)]">
                                  {n.descripcion}
                                </p>
                              ) : null}
                            </td>
                            <td className="px-3 py-2.5 text-[var(--td-ink-soft)]">
                              {nodoClasificacionLabel(n.tipo)}
                            </td>
                            <td className="px-3 py-2.5 tabular-nums">{n.etapa}</td>
                            <td className="px-3 py-2.5 tabular-nums">{n.carril}</td>
                            <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-[var(--td-ink-soft)]">
                              {formatPosicion(n)}
                            </td>
                            <td className="px-3 py-2.5 text-right">
                              <button
                                type="button"
                                onClick={() => setEditingNodo(n)}
                                className="rounded-lg border border-[var(--td-line)] px-2.5 py-1 text-xs font-semibold text-[var(--td-navy)] hover:bg-[var(--td-line-soft)]"
                              >
                                Editar
                              </button>
                            </td>
                          </tr>
                        ))
                      : temas.map((t) => (
                          <tr
                            key={t.id}
                            className="border-b border-[var(--td-line)]/80 last:border-0 hover:bg-[var(--td-line-soft)]/35"
                          >
                            <td className="px-3 py-2.5">
                              <p className="font-medium text-[var(--td-ink)]">
                                {t.nombre}
                              </p>
                              {t.descripcion?.trim() ? (
                                <p className="mt-0.5 line-clamp-1 text-xs text-[var(--td-ink-soft)]">
                                  {t.descripcion}
                                </p>
                              ) : null}
                            </td>
                            <td className="px-3 py-2.5 tabular-nums">{t.etapa}</td>
                            <td className="px-3 py-2.5 tabular-nums">{t.carril}</td>
                            <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-[var(--td-ink-soft)]">
                              {formatPosicion(t)}
                            </td>
                            <td className="px-3 py-2.5 text-right">
                              <button
                                type="button"
                                onClick={() => setEditingTema(t)}
                                className="rounded-lg border border-[var(--td-line)] px-2.5 py-1 text-xs font-semibold text-[var(--td-navy)] hover:bg-[var(--td-line-soft)]"
                              >
                                Editar
                              </button>
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>

              <div>
                <h2 className="mb-2 text-xs font-extrabold uppercase tracking-wide text-[var(--td-faint)]">
                  Enlaces ({enlaces.length})
                </h2>
                {enlaces.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-[var(--td-line)] px-4 py-8 text-center text-sm text-[var(--td-faint)]">
                    Todavía no hay enlaces. Creálos en el lienzo arrastrando entre{" "}
                    {grafoModo === "nodos" ? "nodos" : "temas"}.
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-[var(--td-line)]">
                    <table className="desktop-data-table w-full min-w-[480px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-[var(--td-line)] bg-[var(--td-line-soft)]/60 text-[11px] font-bold uppercase tracking-wide text-[var(--td-ink-soft)]">
                          <th className="px-3 py-2.5">Origen</th>
                          <th className="px-3 py-2.5">Destino</th>
                          <th className="px-3 py-2.5">Tipo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enlaces.map((e) => (
                          <tr
                            key={e.id}
                            className="border-b border-[var(--td-line)]/80 last:border-0"
                          >
                            <td className="px-3 py-2.5 font-medium text-[var(--td-ink)]">
                              {tituloItem(e.origen_id)}
                            </td>
                            <td className="px-3 py-2.5 font-medium text-[var(--td-ink)]">
                              → {tituloItem(e.destino_id)}
                            </td>
                            <td className="px-3 py-2.5 text-[var(--td-ink-soft)]">
                              {e.tipo ?? "prerequisito"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <DesktopModal
        open={creating && grafoModo === "nodos"}
        onClose={closeModals}
        title={enlacePadreCard ? "Nuevo nodo enlazado" : "Nuevo ítem"}
        subtitle={
          enlacePadreCard
            ? `Enlace desde: ${enlacePadreCard.label}`
            : "Elegí tipo y completá el formulario"
        }
      >
        <div className={estudioFormWellClass("tema")}>
          <MapaNodoCreateFlow
            key={enlacePadreCard ? `nodo-link-${enlacePadreCard.id}` : "nodo-new"}
            lienzoConfig={{ mode: "macro-nodos" }}
            initialLienzoColocacion={
              enlacePadreCard
                ? formLienzoColocacionDesdePadreMacro(enlacePadreCard.id)
                : undefined
            }
            lockEnlacePadre={enlacePadreCard != null}
            enlacePadreLabel={enlacePadreCard?.label}
            onSuccess={() => void onSaved()}
          />
        </div>
      </DesktopModal>

      <DesktopModal
        open={creating && grafoModo === "temas"}
        onClose={closeModals}
        title={enlacePadreCard ? "Nuevo tema enlazado" : "Nuevo tema"}
        subtitle={
          enlacePadreCard
            ? `Enlace desde: ${enlacePadreCard.label}`
            : "Mapa de conocimiento"
        }
      >
        <div className={estudioFormWellClass("tema")}>
          <TemaForm
            key={enlacePadreCard ? `tema-link-${enlacePadreCard.id}` : "tema-new"}
            lienzoConfig={{ mode: "macro-temas" }}
            initialLienzoColocacion={
              enlacePadreCard
                ? formLienzoColocacionDesdePadreMacro(enlacePadreCard.id)
                : undefined
            }
            lockEnlacePadre={enlacePadreCard != null}
            enlacePadreLabel={enlacePadreCard?.label}
            onSuccess={() => void onSaved()}
          />
        </div>
      </DesktopModal>

      <DesktopModal
        open={editingNodo != null}
        onClose={closeModals}
        title={
          editingNodo?.tipo === "produccion"
            ? "Editar nodo de producción"
            : "Editar nodo de formación"
        }
        subtitle={editingNodo?.titulo}
      >
        {editingNodo ? (
          <div className={estudioFormWellClass("tema")}>
            {editingNodo.tipo === "produccion" ? (
              <MapaLogroForm
                logroId={editingNodo.id}
                titulo={editingNodo.titulo}
                descripcion={editingNodo.descripcion}
                onSuccess={() => void onSaved()}
                onDelete={() => void onSaved()}
              />
            ) : (
              <MapaNodoForm
                nodo={editingNodo}
                onSuccess={() => void onSaved()}
                onDelete={() => void onSaved()}
              />
            )}
          </div>
        ) : null}
      </DesktopModal>

      <DesktopModal
        open={editingTema != null}
        onClose={closeModals}
        title="Editar tema"
        subtitle={editingTema?.nombre}
      >
        {editingTema ? (
          <div className={estudioFormWellClass("tema")}>
            <TemaForm
              tema={editingTema}
              onSuccess={() => void onSaved()}
              onDelete={() => void onSaved()}
            />
          </div>
        ) : null}
      </DesktopModal>

      {detalleScope ? (
        <MapaDetalleOverlay
          scope={detalleScope}
          orientacionLienzo={orientacionLienzo}
          onClose={() => setDetalleScope(null)}
        />
      ) : null}
    </>
  );
}
