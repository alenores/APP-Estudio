"use client";

import { DesktopModal } from "@/components/desktop/desktop-modal";
import { CursoForm } from "@/components/shared/forms/curso-form";
import { LogroRegistroForm } from "@/components/shared/forms/logro-registro-form";
import type { MapaDetalleHijo, MapaDetalleScope } from "@/lib/mapa-detalle-types";
import type { FormLienzoColocacionConfig } from "@/lib/form-lienzo-colocacion-types";
import { estudioFormWellClass } from "@/lib/estudio-shell-tone";
import { useEstudioData } from "@/app/hooks/useEstudioData";
import { useState } from "react";

type MapaDetalleCreateKind = "curso" | "logro";

type MapaDetalleCreateModalProps = {
  scope: MapaDetalleScope;
  hijos: MapaDetalleHijo[];
  onClose: () => void;
  onCreated: () => void;
};

function defaultCreateKind(scope: MapaDetalleScope): MapaDetalleCreateKind {
  if (scope.kind === "tema") return "curso";
  if (scope.childKind === "logro") return "logro";
  return "curso";
}

function canPickKind(scope: MapaDetalleScope): boolean {
  return scope.kind === "nodo" && scope.childKind === "mixto";
}

export function MapaDetalleCreateModal({
  scope,
  hijos,
  onClose,
  onCreated,
}: MapaDetalleCreateModalProps) {
  const { refreshSnapshot } = useEstudioData();
  const [kind, setKind] = useState<MapaDetalleCreateKind>(() =>
    defaultCreateKind(scope),
  );

  const lienzoConfig: FormLienzoColocacionConfig = {
    mode: "detalle",
    scope,
    hijos,
  };

  async function afterCreate() {
    await refreshSnapshot();
    onCreated();
    onClose();
  }

  const title =
    kind === "curso" ? "Nuevo curso" : "Nuevo registro logro";

  return (
    <DesktopModal
      open
      onClose={onClose}
      title={title}
      subtitle={scope.parentLabel}
      tone="curso"
    >
      <div className={estudioFormWellClass("curso")}>
        {canPickKind(scope) ? (
          <div className="mb-4 flex flex-wrap gap-2">
            {(
              [
                { id: "curso" as const, label: "Curso" },
                { id: "logro" as const, label: "Logro" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setKind(opt.id)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                  kind === opt.id
                    ? "border-[var(--td-navy)] bg-white text-[var(--td-navy)]"
                    : "border-[var(--td-line)] bg-white/80 text-[var(--td-ink-soft)]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        ) : null}

        {kind === "curso" && scope.kind === "tema" ? (
          <CursoForm
            temaId={scope.temaId}
            lienzoConfig={lienzoConfig}
            onSuccess={() => void afterCreate()}
          />
        ) : null}

        {kind === "curso" && scope.kind === "nodo" ? (
          <CursoForm
            defaultNodoId={scope.nodoId}
            lockNodoId
            lienzoConfig={lienzoConfig}
            onSuccess={() => void afterCreate()}
          />
        ) : null}

        {kind === "logro" && scope.kind === "nodo" ? (
          <LogroRegistroForm
            nodoId={scope.nodoId}
            lienzoConfig={lienzoConfig}
            onSuccess={() => void afterCreate()}
          />
        ) : null}
      </div>
    </DesktopModal>
  );
}
