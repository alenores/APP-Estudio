"use client";

import { DesktopModal } from "@/components/desktop/desktop-modal";
import { CursoForm } from "@/components/shared/forms/curso-form";
import { LogroRegistroForm } from "@/components/shared/forms/logro-registro-form";
import type { MapaDetalleHijo, MapaDetalleScope } from "@/lib/mapa-detalle-types";
import type {
  FormLienzoColocacionConfig,
  FormLienzoColocacionState,
} from "@/lib/form-lienzo-colocacion-types";
import { estudioFormWellClass } from "@/lib/estudio-shell-tone";
import { useEstudioData } from "@/app/hooks/useEstudioData";
import { useState } from "react";
import type { MapaDetalleHijoKind } from "@/lib/mapa-detalle-types";

type MapaDetalleCreateKind = "curso" | "logro";

type MapaDetalleCreateModalProps = {
  scope: MapaDetalleScope;
  hijos: MapaDetalleHijo[];
  onClose: () => void;
  onCreated: () => void;
  initialKind?: MapaDetalleCreateKind;
  initialLienzoColocacion?: FormLienzoColocacionState;
  lockEnlacePadre?: boolean;
  enlacePadreLabel?: string;
  /** Oculta selector curso/logro cuando el alta viene de una card concreta. */
  lockKind?: boolean;
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
  initialKind,
  initialLienzoColocacion,
  lockEnlacePadre = false,
  enlacePadreLabel,
  lockKind = false,
}: MapaDetalleCreateModalProps) {
  const { refreshSnapshot } = useEstudioData();
  const [kind, setKind] = useState<MapaDetalleCreateKind>(
    () => initialKind ?? defaultCreateKind(scope),
  );

  const lienzoConfig: FormLienzoColocacionConfig = {
    mode: "detalle",
    scope,
    hijos,
  };

  const lienzoProps = {
    initialLienzoColocacion,
    lockEnlacePadre,
    enlacePadreLabel,
  };

  async function afterCreate() {
    await refreshSnapshot();
    onCreated();
    onClose();
  }

  const title =
    kind === "curso" ? "Nuevo curso" : "Nuevo registro logro";

  const subtitle = lockEnlacePadre && enlacePadreLabel
    ? `Enlace desde: ${enlacePadreLabel} · ${scope.parentLabel}`
    : scope.parentLabel;

  return (
    <DesktopModal
      open
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      tone="curso"
    >
      <div className={estudioFormWellClass("curso")}>
        {canPickKind(scope) && !lockKind ? (
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
            key={
              initialLienzoColocacion?.enlacePadreId
                ? `curso-link-${initialLienzoColocacion.enlacePadreId}`
                : "curso-new"
            }
            temaId={scope.temaId}
            lienzoConfig={lienzoConfig}
            {...lienzoProps}
            onSuccess={() => void afterCreate()}
          />
        ) : null}

        {kind === "curso" && scope.kind === "nodo" ? (
          <CursoForm
            key={
              initialLienzoColocacion?.enlacePadreId
                ? `curso-link-${initialLienzoColocacion.enlacePadreId}`
                : "curso-new"
            }
            defaultNodoId={scope.nodoId}
            lockNodoId
            lienzoConfig={lienzoConfig}
            {...lienzoProps}
            onSuccess={() => void afterCreate()}
          />
        ) : null}

        {kind === "logro" && scope.kind === "nodo" ? (
          <LogroRegistroForm
            key={
              initialLienzoColocacion?.enlacePadreId
                ? `logro-link-${initialLienzoColocacion.enlacePadreId}`
                : "logro-new"
            }
            nodoId={scope.nodoId}
            lienzoConfig={lienzoConfig}
            {...lienzoProps}
            onSuccess={() => void afterCreate()}
          />
        ) : null}
      </div>
    </DesktopModal>
  );
}

export type { MapaDetalleCreateKind, MapaDetalleHijoKind };
