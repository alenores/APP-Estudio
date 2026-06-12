"use client";

import {
  desarrollosExplorerHref,
  parseDesarrollosExplorerSelection,
  useDesarrollosExplorer,
  type DesarrollosExplorerSelection,
} from "@/app/hooks/useDesarrollosExplorer";
import { DesarrollosSyncBanner } from "@/components/shared/sync/desarrollos-sync-banner";
import { DefinicionGeneralForm } from "@/components/shared/forms/definicion-general-form";
import { DefinicionEspecificaForm } from "@/components/shared/forms/definicion-especifica-form";
import { AccionForm } from "@/components/shared/forms/accion-form";
import { DesktopModal } from "@/components/desktop/desktop-modal";
import { AlertText, LoadingText, TextLink } from "@/components/ui";
import { explorerColumnHeaderClass } from "@/lib/estudio-shell-tone";
import { writeContentTypology } from "@/lib/content-typology";
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
          className="text-xs font-semibold text-violet-700 hover:underline"
        >
          Mapa desarrollos
        </Link>
      </div>

      {loading && !packReady ? <LoadingText>Cargando desarrollos…</LoadingText> : null}
      {error ? <AlertText>{error}</AlertText> : null}

      <div className="grid min-h-0 flex-1 grid-cols-3 gap-2">
        {/* Columna general */}
        <section className="flex min-h-0 flex-col rounded-lg border border-violet-200 bg-violet-50/30">
          <header className={explorerColumnHeaderClass("tema")}>
            <span>Definición general</span>
            <button
              type="button"
              onClick={() => setCreateKind("general")}
              className="rounded px-2 py-0.5 text-xs font-semibold hover:bg-white/40"
            >
              +
            </button>
          </header>
          <ul className="min-h-0 flex-1 overflow-y-auto p-2 space-y-2">
            {generales.map((g) => (
              <li key={g.id}>
                <button
                  type="button"
                  onClick={() => go({ generalId: g.id, especificaId: null, accionId: null })}
                  className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                    selection.generalId === g.id
                      ? "border-violet-500 bg-white shadow-sm"
                      : "border-violet-200/80 bg-white/70 hover:bg-white"
                  }`}
                >
                  <p className="font-semibold">{g.nombre}</p>
                  <p className="text-xs text-ink-muted">
                    {especificasCountByGeneral.get(g.id) ?? 0} específicas
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Columna específica */}
        <section className="flex min-h-0 flex-col rounded-lg border border-indigo-200 bg-indigo-50/30">
          <header className={explorerColumnHeaderClass("curso")}>
            <span>Definición específica</span>
            <button
              type="button"
              disabled={selection.generalId == null}
              onClick={() => setCreateKind("especifica")}
              className="rounded px-2 py-0.5 text-xs font-semibold hover:bg-white/40 disabled:opacity-40"
            >
              +
            </button>
          </header>
          <ul className="min-h-0 flex-1 overflow-y-auto p-2 space-y-2">
            {especificas.map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => go({ generalId: selection.generalId, especificaId: e.id, accionId: null })}
                  className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                    selection.especificaId === e.id
                      ? "border-indigo-500 bg-white shadow-sm"
                      : "border-indigo-200/80 bg-white/70 hover:bg-white"
                  }`}
                >
                  <p className="font-semibold">{e.nombre}</p>
                  <p className="text-xs text-ink-muted">
                    {accionesCountByEspecifica.get(e.id) ?? 0} acciones
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Columna acciones */}
        <section className="flex min-h-0 flex-col rounded-lg border border-fuchsia-200 bg-fuchsia-50/30">
          <header className={explorerColumnHeaderClass("clase")}>
            <span>Acciones</span>
            <button
              type="button"
              disabled={selection.especificaId == null}
              onClick={() => setCreateKind("accion")}
              className="rounded px-2 py-0.5 text-xs font-semibold hover:bg-white/40 disabled:opacity-40"
            >
              +
            </button>
          </header>
          <ul className="min-h-0 flex-1 overflow-y-auto p-2 space-y-2">
            {acciones.map((a) => (
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
                  className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                    selection.accionId === a.id
                      ? "border-fuchsia-500 bg-white shadow-sm"
                      : "border-fuchsia-200/80 bg-white/70 hover:bg-white"
                  }`}
                >
                  <p className="font-semibold">{a.nombre}</p>
                  {a.descripcion ? (
                    <p className="line-clamp-2 text-xs text-ink-muted">{a.descripcion}</p>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {selectedAccion || selectedEspecifica || selectedGeneral ? (
        <aside className="rounded-lg border border-border bg-paper-elevated p-4 text-sm">
          {selectedGeneral ? (
            <p>
              <strong>General:</strong> {selectedGeneral.nombre}
            </p>
          ) : null}
          {selectedEspecifica ? (
            <p className="mt-1">
              <strong>Específica:</strong> {selectedEspecifica.nombre}
            </p>
          ) : null}
          {selectedAccion ? (
            <p className="mt-1">
              <strong>Acción:</strong> {selectedAccion.nombre}
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
