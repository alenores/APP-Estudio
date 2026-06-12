"use client";

import {
  desarrollosExplorerHref,
  parseDesarrollosExplorerSelection,
  useDesarrollosExplorer,
  type DesarrollosExplorerSelection,
} from "@/app/hooks/useDesarrollosExplorer";
import {
  dsExplorerColumn,
  dsExplorerItemClass,
} from "@/components/mobile/desarrollos/desarrollos-chrome";
import { DesarrollosSyncBanner } from "@/components/shared/sync/desarrollos-sync-banner";
import { DefinicionGeneralForm } from "@/components/shared/forms/definicion-general-form";
import { DefinicionEspecificaForm } from "@/components/shared/forms/definicion-especifica-form";
import { AccionForm } from "@/components/shared/forms/accion-form";
import { DesktopModal } from "@/components/desktop/desktop-modal";
import { AlertText, LoadingText, TextLink } from "@/components/ui";
import { explorerColumnHeaderClass } from "@/lib/estudio-shell-tone";
import { writeContentTypology } from "@/lib/content-typology";
import { CornerDownRight, Layers, Map, Play } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const EMPTY_SELECTION: DesarrollosExplorerSelection = {
  generalId: null,
  especificaId: null,
  accionId: null,
};

function initSelectionFromLocation(): DesarrollosExplorerSelection {
  if (typeof window === "undefined") return EMPTY_SELECTION;
  return parseDesarrollosExplorerSelection(
    new URLSearchParams(window.location.search),
  );
}

type CreateKind = "general" | "especifica" | "accion" | null;

function ExplorerEmptyColumn({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-dashed border-stone-300/80 px-3 py-6 text-center text-xs text-stone-500 dark:border-stone-700 dark:text-stone-400">
      {message}
    </p>
  );
}

export function DesarrollosExploradorView() {
  const router = useRouter();
  const [activeSelection, setActiveSelection] =
    useState<DesarrollosExplorerSelection>(EMPTY_SELECTION);
  const bootstrappedRef = useRef(false);
  const [createKind, setCreateKind] = useState<CreateKind>(null);

  const {
    generales,
    especificas,
    acciones,
    especificasCountByGeneral,
    accionesCountByEspecifica,
    selection,
    loading,
    error,
    packReady,
    reload,
  } = useDesarrollosExplorer(activeSelection);

  useEffect(() => {
    writeContentTypology("desarrollos");
  }, []);

  useEffect(() => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;
    setActiveSelection(initSelectionFromLocation());
  }, []);

  useEffect(() => {
    if (!packReady) return;
    const href = desarrollosExplorerHref(selection);
    if (href !== desarrollosExplorerHref(activeSelection)) {
      setActiveSelection(selection);
      window.history.replaceState(window.history.state, "", href);
    }
  }, [packReady, selection, activeSelection]);

  function go(partial: Partial<DesarrollosExplorerSelection>) {
    const next = { ...selection, ...partial };
    if (partial.accionId != null) {
      next.accionId = partial.accionId;
    } else if (partial.especificaId != null) {
      next.accionId = null;
    } else if (partial.generalId != null) {
      next.especificaId = null;
      next.accionId = null;
    }
    const href = desarrollosExplorerHref(next);
    setActiveSelection(next);
    router.replace(href, { scroll: false });
  }

  const selectedGeneral =
    selection.generalId != null
      ? (generales.find((g) => g.id === selection.generalId) ?? null)
      : null;
  const selectedEspecifica =
    selection.especificaId != null
      ? (especificas.find((e) => e.id === selection.especificaId) ?? null)
      : null;
  const selectedAccion =
    selection.accionId != null
      ? (acciones.find((a) => a.id === selection.accionId) ?? null)
      : null;

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <DesarrollosSyncBanner />
      <div className="flex flex-wrap items-center gap-3">
        <TextLink href="/">Cambiar tipología</TextLink>
        <Link
          href="/mapa"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#EA580C] transition-colors hover:text-[#c2410c]"
        >
          <Map className="h-3.5 w-3.5" aria-hidden />
          Mapa desarrollos
        </Link>
      </div>

      {loading && !packReady ? <LoadingText>Cargando desarrollos…</LoadingText> : null}
      {error ? <AlertText>{error}</AlertText> : null}

      <div className="grid min-h-0 flex-1 grid-cols-3 gap-2">
        <section
          className={`flex min-h-0 flex-col rounded-lg border ${dsExplorerColumn.general.section}`}
        >
          <header className={explorerColumnHeaderClass("tema")}>
            <span className="inline-flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" aria-hidden />
              Definición general
            </span>
            <button
              type="button"
              onClick={() => setCreateKind("general")}
              className="rounded px-2 py-0.5 text-xs font-semibold transition hover:bg-white/40 active:scale-95"
            >
              +
            </button>
          </header>
          <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2">
            {generales.length === 0 ? (
              <li>
                <ExplorerEmptyColumn message="Sin generales. Usá + para crear." />
              </li>
            ) : (
              generales.map((g) => (
                <li key={g.id}>
                  <button
                    type="button"
                    onClick={() => go({ generalId: g.id, especificaId: null, accionId: null })}
                    className={dsExplorerItemClass("general", selection.generalId === g.id)}
                  >
                    <p className="font-semibold text-stone-900 dark:text-stone-100">{g.nombre}</p>
                    <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                      {especificasCountByGeneral.get(g.id) ?? 0} específicas
                    </p>
                  </button>
                </li>
              ))
            )}
          </ul>
        </section>

        <section
          className={`flex min-h-0 flex-col rounded-lg border ${dsExplorerColumn.especifica.section}`}
        >
          <header className={explorerColumnHeaderClass("curso")}>
            <span className="inline-flex items-center gap-1.5">
              <CornerDownRight className="h-3.5 w-3.5" aria-hidden />
              Definición específica
            </span>
            <button
              type="button"
              disabled={selection.generalId == null}
              onClick={() => setCreateKind("especifica")}
              className="rounded px-2 py-0.5 text-xs font-semibold transition hover:bg-white/40 active:scale-95 disabled:opacity-40"
            >
              +
            </button>
          </header>
          <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2">
            {selection.generalId == null ? (
              <li>
                <ExplorerEmptyColumn message="Elegí una general." />
              </li>
            ) : especificas.length === 0 ? (
              <li>
                <ExplorerEmptyColumn message="Sin específicas en esta general." />
              </li>
            ) : (
              especificas.map((e) => (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() =>
                      go({ generalId: selection.generalId, especificaId: e.id, accionId: null })
                    }
                    className={dsExplorerItemClass(
                      "especifica",
                      selection.especificaId === e.id,
                    )}
                  >
                    <p className="font-semibold text-stone-800 dark:text-stone-100">{e.nombre}</p>
                    <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                      {accionesCountByEspecifica.get(e.id) ?? 0} acciones
                    </p>
                  </button>
                </li>
              ))
            )}
          </ul>
        </section>

        <section
          className={`flex min-h-0 flex-col rounded-lg border ${dsExplorerColumn.accion.section}`}
        >
          <header className={explorerColumnHeaderClass("clase")}>
            <span className="inline-flex items-center gap-1.5">
              <Play className="h-3.5 w-3.5" aria-hidden />
              Acciones
            </span>
            <button
              type="button"
              disabled={selection.especificaId == null}
              onClick={() => setCreateKind("accion")}
              className="rounded px-2 py-0.5 text-xs font-semibold transition hover:bg-white/40 active:scale-95 disabled:opacity-40"
            >
              +
            </button>
          </header>
          <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2">
            {selection.especificaId == null ? (
              <li>
                <ExplorerEmptyColumn message="Elegí una específica." />
              </li>
            ) : acciones.length === 0 ? (
              <li>
                <ExplorerEmptyColumn message="Sin acciones. Usá + para crear." />
              </li>
            ) : (
              acciones.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() =>
                      go({
                        generalId: selection.generalId,
                        especificaId: selection.especificaId,
                        accionId: a.id,
                      })
                    }
                    className={dsExplorerItemClass("accion", selection.accionId === a.id)}
                  >
                    <p className="font-semibold text-stone-800 dark:text-stone-100">{a.nombre}</p>
                    {a.descripcion ? (
                      <p className="mt-0.5 line-clamp-2 text-xs text-stone-500 dark:text-stone-400">
                        {a.descripcion}
                      </p>
                    ) : null}
                  </button>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>

      {selectedAccion || selectedEspecifica || selectedGeneral ? (
        <aside className="rounded-xl border border-stone-200 bg-paper-elevated p-4 text-sm shadow-sm dark:border-stone-700 dark:bg-stone-900">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-stone-400">
            Selección actual
          </p>
          {selectedGeneral ? (
            <p className="mt-2">
              <span className="font-medium text-stone-500">General:</span>{" "}
              <TextLink href={`/definicion-general/${selectedGeneral.id}`}>
                {selectedGeneral.nombre}
              </TextLink>
            </p>
          ) : null}
          {selectedEspecifica ? (
            <p className="mt-1">
              <span className="font-medium text-stone-500">Específica:</span>{" "}
              <TextLink href={`/definicion-especifica/${selectedEspecifica.id}`}>
                {selectedEspecifica.nombre}
              </TextLink>
            </p>
          ) : null}
          {selectedAccion ? (
            <p className="mt-1">
              <span className="font-medium text-stone-500">Acción:</span>{" "}
              <TextLink href={`/acciones/${selectedAccion.id}`}>
                {selectedAccion.nombre}
              </TextLink>
            </p>
          ) : null}
        </aside>
      ) : null}

      <DesktopModal
        open={createKind === "general"}
        onClose={() => setCreateKind(null)}
        title="Nueva definición general"
      >
        <DefinicionGeneralForm
          onSuccess={async (id) => {
            setCreateKind(null);
            await reload();
            go({ generalId: id, especificaId: null, accionId: null });
          }}
        />
      </DesktopModal>

      <DesktopModal
        open={createKind === "especifica" && selection.generalId != null}
        onClose={() => setCreateKind(null)}
        title="Nueva definición específica"
      >
        {selection.generalId != null ? (
          <DefinicionEspecificaForm
            generalId={selection.generalId}
            onSuccess={async (id) => {
              setCreateKind(null);
              await reload();
              go({ generalId: selection.generalId, especificaId: id, accionId: null });
            }}
          />
        ) : null}
      </DesktopModal>

      <DesktopModal
        open={createKind === "accion" && selection.especificaId != null}
        onClose={() => setCreateKind(null)}
        title="Nueva acción"
      >
        {selection.especificaId != null ? (
          <AccionForm
            especificaId={selection.especificaId}
            onSuccess={async (id) => {
              setCreateKind(null);
              await reload();
              go({
                generalId: selection.generalId,
                especificaId: selection.especificaId,
                accionId: id,
              });
            }}
          />
        ) : null}
      </DesktopModal>
    </div>
  );
}
