"use client";

import {
  desarrollosExplorerHref,
  desarrollosSelectionsEqual,
  parseDesarrollosExplorerSelection,
  useDesarrollosExplorer,
  type DesarrollosExplorerSelection,
} from "@/app/hooks/useDesarrollosExplorer";
import {
  dsExplorerColumn,
  dsExplorerItemClass,
} from "@/components/mobile/desarrollos/desarrollos-chrome";
import { CardChatLinkIcon } from "@/components/shared/links/card-chat-link-icon";
import { DesarrollosSyncBanner } from "@/components/shared/sync/desarrollos-sync-banner";
import { DefinicionGeneralForm } from "@/components/shared/forms/definicion-general-form";
import { DefinicionEspecificaForm } from "@/components/shared/forms/definicion-especifica-form";
import { AccionForm } from "@/components/shared/forms/accion-form";
import { DesktopModal } from "@/components/desktop/desktop-modal";
import { AlertText, LoadingText, TextLink } from "@/components/ui";
import { writeContentTypology } from "@/lib/content-typology";
import { CornerDownRight, Layers, Map, Play } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const DS_COL_HEADER =
  "flex shrink-0 items-center justify-between gap-2 border-b-2 border-[#EA580C] bg-stone-50 px-3 py-3 text-lg font-bold text-stone-800 dark:bg-stone-900/80 dark:text-stone-100";
const DS_CARD_TITLE =
  "text-base font-semibold leading-snug text-stone-900 dark:text-stone-100";
const DS_CARD_DESC =
  "mt-1 line-clamp-2 text-sm leading-snug text-stone-600 dark:text-stone-300";

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
  const pathname = usePathname();
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
    if (!packReady || pathname !== "/explorador-desarrollos") return;
    if (desarrollosSelectionsEqual(activeSelection, selection)) return;
    setActiveSelection(selection);
    router.replace(desarrollosExplorerHref(selection), { scroll: false });
  }, [packReady, pathname, activeSelection, selection, router]);

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
          <header className={DS_COL_HEADER}>
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
                    <div className="flex items-start justify-between gap-2">
                      <p className={`min-w-0 flex-1 ${DS_CARD_TITLE}`}>{g.nombre}</p>
                      <CardChatLinkIcon linkChat={g.link_chat} />
                    </div>
                    {g.descripcion ? (
                      <p className={DS_CARD_DESC}>{g.descripcion}</p>
                    ) : null}
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
          <header className={DS_COL_HEADER}>
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
                    <div className="flex items-start justify-between gap-2">
                      <p className={`min-w-0 flex-1 ${DS_CARD_TITLE}`}>{e.nombre}</p>
                      <CardChatLinkIcon linkChat={e.link_chat} />
                    </div>
                    {e.descripcion ? (
                      <p className={DS_CARD_DESC}>{e.descripcion}</p>
                    ) : null}
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
          <header className={DS_COL_HEADER}>
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
                    <div className="flex items-start justify-between gap-2">
                      <p className={`min-w-0 flex-1 ${DS_CARD_TITLE}`}>{a.nombre}</p>
                      <CardChatLinkIcon linkChat={a.link_chat} />
                    </div>
                    {a.descripcion ? (
                      <p className={DS_CARD_DESC}>{a.descripcion}</p>
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
          {(selectedAccion || selectedEspecifica || selectedGeneral) ? (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => {
                  const href = selectedAccion
                    ? `/acciones/${selectedAccion.id}`
                    : selectedEspecifica
                      ? `/definicion-especifica/${selectedEspecifica.id}`
                      : `/definicion-general/${selectedGeneral!.id}`;
                  router.push(href);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-[#EA580C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#c2410c] active:scale-95"
              >
                Ver detalle completo →
              </button>
            </div>
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
